import { Hono } from 'hono';
import { eq, or, and } from 'drizzle-orm';
import { Bindings, getDb } from '../db';
import { loans, users } from '../db/schema';
import { LOAN_STATUS } from '@qard/shared';
import { authMiddleware, AuthUser } from '../middleware/auth';

export const wasiyyahRouter = new Hono<{ Bindings: Bindings; Variables: { user: AuthUser } }>();

wasiyyahRouter.use('*', authMiddleware);

// Al-Wasiyyah: Complete Islamic Will & Certified Debt Statement
wasiyyahRouter.get('/statement', async (c) => {
  const authUser = c.get('user');
  const db = getDb(c.env.DB);

  const currentUser = await db.select().from(users).where(eq(users.id, authUser.id)).get();
  if (!currentUser) {
    return c.json({ success: false, error: 'User not found' }, 404);
  }

  // 1. Receivables: Loans given to others (Heirs may claim these)
  const lentList = await db
    .select()
    .from(loans)
    .where(
      and(
        eq(loans.lenderId, authUser.id),
        or(
          eq(loans.status, LOAN_STATUS.ACTIVE),
          eq(loans.status, LOAN_STATUS.PARTIALLY_PAID),
          eq(loans.status, LOAN_STATUS.HARDSHIP_REVIEW)
        )
      )
    )
    .all();

  const receivables = [];
  for (const item of lentList) {
    const bUser = await db.select().from(users).where(eq(users.id, item.borrowerId)).get();
    receivables.push({
      loanId: item.id,
      counterpartyName: bUser?.name || 'Unknown',
      counterpartyPhone: bUser?.phone || '',
      principalAmount: item.principalAmount,
      remainingAmount: item.remainingAmount,
      dueDate: item.dueDate,
      purpose: item.purpose,
      type: 'RECEIVABLE' as const,
    });
  }

  // 2. Payables: Debts owed to others (Mandatory priority settlement from estate prior to inheritance distribution)
  const borrowedList = await db
    .select()
    .from(loans)
    .where(
      and(
        eq(loans.borrowerId, authUser.id),
        or(
          eq(loans.status, LOAN_STATUS.ACTIVE),
          eq(loans.status, LOAN_STATUS.PARTIALLY_PAID),
          eq(loans.status, LOAN_STATUS.HARDSHIP_REVIEW)
        )
      )
    )
    .all();

  const payables = [];
  for (const item of borrowedList) {
    const lUser = await db.select().from(users).where(eq(users.id, item.lenderId)).get();
    payables.push({
      loanId: item.id,
      counterpartyName: lUser?.name || 'Unknown',
      counterpartyPhone: lUser?.phone || '',
      principalAmount: item.principalAmount,
      remainingAmount: item.remainingAmount,
      dueDate: item.dueDate,
      purpose: item.purpose,
      type: 'PAYABLE' as const,
    });
  }

  const totalReceivable = receivables.reduce((sum, r) => sum + r.remainingAmount, 0);
  const totalPayable = payables.reduce((sum, p) => sum + p.remainingAmount, 0);
  const netBalance = totalReceivable - totalPayable;
  const now = new Date().toISOString();

  // Cryptographic integrity verification hash
  const rawData = JSON.stringify({ userId: currentUser.id, totalReceivable, totalPayable, date: now });
  const hashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(rawData));
  const sha256VerificationHash = Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  return c.json({
    success: true,
    data: {
      user: {
        id: currentUser.id,
        name: currentUser.name,
        phone: currentUser.phone,
      },
      quranicReminder:
        '"It is not permissible for any Muslim who has something to will to stay for two nights without having his will written with him." (Sahih al-Bukhari: 2738)',
      summary: {
        totalReceivable,
        totalPayable,
        netBalance,
        generatedDate: now,
        sha256VerificationHash,
      },
      receivables,
      payables,
    },
  });
});

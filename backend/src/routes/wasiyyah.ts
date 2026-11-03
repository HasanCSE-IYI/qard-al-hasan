import { Hono } from 'hono';
import { eq, or, and } from 'drizzle-orm';
import { Bindings, getDb } from '../db';
import { loans, users } from '../db/schema';
import { LOAN_STATUS } from '@qard/shared';
import { authMiddleware, AuthUser } from '../middleware/auth';

export const wasiyyahRouter = new Hono<{ Bindings: Bindings; Variables: { user: AuthUser } }>();

wasiyyahRouter.use('*', authMiddleware);

// মৃত্যুর পর কর্জের পূর্ণাঙ্গ ওয়াসিয়তনামা ও স্টেটমেন্ট
wasiyyahRouter.get('/statement', async (c) => {
  const authUser = c.get('user');
  const db = getDb(c.env.DB);

  const currentUser = await db.select().from(users).where(eq(users.id, authUser.id)).get();
  if (!currentUser) {
    return c.json({ success: false, error: 'ইউজার পাওয়া যায়নি' }, 404);
  }

  // ১. আমি যাদের কর্জ দিয়েছি (Receivables - ওয়ারিশগণ যা দাবি করতে পারেন)
  const lentList = await db
    .select()
    .from(loans)
    .where(
      and(
        eq(loans.lenderId, authUser.id),
        or(eq(loans.status, LOAN_STATUS.ACTIVE), eq(loans.status, LOAN_STATUS.PARTIALLY_PAID))
      )
    )
    .all();

  const receivables = [];
  for (const item of lentList) {
    const bUser = await db.select().from(users).where(eq(users.id, item.borrowerId)).get();
    receivables.push({
      loanId: item.id,
      counterpartyName: bUser?.name || 'অজ্ঞাত',
      counterpartyPhone: bUser?.phone || '',
      principalAmount: item.principalAmount,
      remainingAmount: item.remainingAmount,
      dueDate: item.dueDate,
      purpose: item.purpose,
      type: 'RECEIVABLE' as const,
    });
  }

  // ২. আমি যাদের কাছ থেকে কর্জ নিয়েছি (Payables - মৃত্যুর পর ত্যাজ্য সম্পত্তি থেকে সর্বপ্রথম যা পরিশোধ ফরজ)
  const borrowedList = await db
    .select()
    .from(loans)
    .where(
      and(
        eq(loans.borrowerId, authUser.id),
        or(eq(loans.status, LOAN_STATUS.ACTIVE), eq(loans.status, LOAN_STATUS.PARTIALLY_PAID))
      )
    )
    .all();

  const payables = [];
  for (const item of borrowedList) {
    const lUser = await db.select().from(users).where(eq(users.id, item.lenderId)).get();
    payables.push({
      loanId: item.id,
      counterpartyName: lUser?.name || 'অজ্ঞাত',
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

  // ক্রিপ্টোগ্রাফিক সত্যতা হ্যাশ
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
        '“যে ব্যক্তি কোনো অসিয়ত রেখে যেতে চায়, তার উচিত নয় দুই রাত কাটানো এমন অবস্থায় যে তার অসিয়তনামা তার কাছে লিখিত নেই।” (সহীহ বুখারী: ২৭৩৮)',
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

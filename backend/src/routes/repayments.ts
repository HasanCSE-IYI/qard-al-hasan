import { Hono } from 'hono';
import { eq, and, desc, sql } from 'drizzle-orm';
import { Bindings, getDb } from '../db';
import { repayments, loans, users, auditLogs } from '../db/schema';
import { CreateRepaymentSchema, LOAN_STATUS } from '@qard/shared';
import { authMiddleware, AuthUser } from '../middleware/auth';

export const repaymentsRouter = new Hono<{ Bindings: Bindings; Variables: { user: AuthUser } }>();

repaymentsRouter.use('*', authMiddleware);

// Record installment repayment
repaymentsRouter.post('/', async (c) => {
  const user = c.get('user');
  const body = await c.req.json();
  const parsed = CreateRepaymentSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ success: false, error: parsed.error.errors[0].message }, 400);
  }

  const { loanId, amount, paymentDate, paymentMethod, transactionRef, receiptImageUrl, notes } = parsed.data;
  const db = getDb(c.env.DB);

  const loan = await db.select().from(loans).where(eq(loans.id, loanId)).get();
  if (!loan) {
    return c.json({ success: false, error: 'Loan record not found' }, 404);
  }

  if (loan.borrowerId !== user.id && loan.lenderId !== user.id) {
    return c.json({ success: false, error: 'Unauthorized to record repayment' }, 403);
  }

  // Prevent duplicate TrxID entries for the same loan
  if (transactionRef) {
    const existing = await db
      .select()
      .from(repayments)
      .where(and(eq(repayments.transactionRef, transactionRef), eq(repayments.loanId, loanId)))
      .get();
    if (existing) {
      return c.json({ success: false, error: 'This Transaction ID (TrxID) has already been used' }, 400);
    }
  }

  const now = new Date().toISOString();
  const repaymentId = crypto.randomUUID();

  // If lender directly logs the receipt, mark as CONFIRMED immediately
  const isDirectLenderEntry = loan.lenderId === user.id;
  const initialStatus = isDirectLenderEntry ? 'CONFIRMED' : 'PENDING_VERIFICATION';

  const newRemaining = isDirectLenderEntry ? Math.max(0, loan.remainingAmount - amount) : loan.remainingAmount;
  const newLoanStatus = isDirectLenderEntry
    ? newRemaining === 0
      ? LOAN_STATUS.PAID_IN_FULL
      : LOAN_STATUS.PARTIALLY_PAID
    : loan.status;

  const batchOperations = [
    db.insert(repayments).values({
      id: repaymentId,
      loanId,
      amount,
      paymentDate,
      paymentMethod,
      transactionRef,
      receiptImageUrl,
      status: initialStatus,
      notes,
      verifiedById: isDirectLenderEntry ? user.id : null,
      verifiedAt: isDirectLenderEntry ? now : null,
      createdAt: now,
    }),
    db.insert(auditLogs).values({
      id: crypto.randomUUID(),
      loanId,
      actorId: user.id,
      action: 'PAYMENT_RECORDED',
      payload: JSON.stringify({ amount, paymentMethod, status: initialStatus }),
      createdAt: now,
    }),
  ];

  if (isDirectLenderEntry) {
    batchOperations.push(
      db.update(loans).set({ remainingAmount: newRemaining, status: newLoanStatus, updatedAt: now }).where(eq(loans.id, loanId)) as any
    );
  }

  await db.batch(batchOperations as any);

  const createdRepayment = await db.select().from(repayments).where(eq(repayments.id, repaymentId)).get();
  return c.json({ success: true, data: createdRepayment }, 201);
});

// Lender payment verification and balance settlement
repaymentsRouter.post('/:id/verify', async (c) => {
  const user = c.get('user');
  const repaymentId = c.req.param('id');
  const { action, disputeReason } = await c.req.json(); // action: 'CONFIRM' | 'DISPUTE'
  const db = getDb(c.env.DB);
  const now = new Date().toISOString();

  const repayment = await db.select().from(repayments).where(eq(repayments.id, repaymentId)).get();
  if (!repayment) {
    return c.json({ success: false, error: 'Repayment record not found' }, 404);
  }

  const loan = await db.select().from(loans).where(eq(loans.id, repayment.loanId)).get();
  if (!loan || loan.lenderId !== user.id) {
    return c.json({ success: false, error: 'Only the lender can verify and approve payments' }, 403);
  }

  if (action === 'DISPUTE') {
    await db.batch([
      db.update(repayments).set({ status: 'DISPUTED', notes: disputeReason || 'Disputed or inconsistent record' }).where(eq(repayments.id, repaymentId)),
      db.insert(auditLogs).values({
        id: crypto.randomUUID(),
        loanId: loan.id,
        actorId: user.id,
        action: 'PAYMENT_DISPUTED',
        payload: JSON.stringify({ disputeReason }),
        createdAt: now,
      }),
    ]);
    return c.json({ success: true, message: 'Payment marked as disputed' });
  }

  // Confirmation flow
  const newRemaining = Math.max(0, loan.remainingAmount - repayment.amount);
  const newLoanStatus = newRemaining === 0 ? LOAN_STATUS.PAID_IN_FULL : LOAN_STATUS.PARTIALLY_PAID;

  await db.batch([
    db.update(repayments).set({ status: 'CONFIRMED', verifiedById: user.id, verifiedAt: now }).where(eq(repayments.id, repaymentId)),
    db.update(loans).set({ remainingAmount: newRemaining, status: newLoanStatus, updatedAt: now }).where(eq(loans.id, loan.id)),
    // Increase borrower's Husn al-Wafa (ethical credit) score
    db.update(users).set({ husnScore: sql`${users.husnScore} + 5` }).where(eq(users.id, loan.borrowerId)),
    db.insert(auditLogs).values({
      id: crypto.randomUUID(),
      loanId: loan.id,
      actorId: user.id,
      action: 'PAYMENT_CONFIRMED',
      payload: JSON.stringify({ amount: repayment.amount, newRemaining }),
      createdAt: now,
    }),
  ]);

  return c.json({
    success: true,
    message: 'Payment confirmed successfully and balance updated',
    data: { newRemaining, status: newLoanStatus },
  });
});

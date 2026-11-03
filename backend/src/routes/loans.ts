import { Hono } from 'hono';
import { eq, or, and, desc } from 'drizzle-orm';
import { Bindings, getDb } from '../db';
import { loans, users, guarantors, repayments, hardshipRequests, auditLogs } from '../db/schema';
import { CreateLoanSchema, CreateHardshipSchema, ForgiveLoanSchema, HawalaTransferSchema, LOAN_STATUS } from '@qard/shared';
import { authMiddleware, AuthUser } from '../middleware/auth';

export const loansRouter = new Hono<{ Bindings: Bindings; Variables: { user: AuthUser } }>();

loansRouter.use('*', authMiddleware);

// List loans for current user
loansRouter.get('/', async (c) => {
  const user = c.get('user');
  const type = c.req.query('type'); // 'lent' | 'borrowed' | 'all'
  const db = getDb(c.env.DB);

  let query;
  if (type === 'lent') {
    query = db.select().from(loans).where(eq(loans.lenderId, user.id)).orderBy(desc(loans.createdAt));
  } else if (type === 'borrowed') {
    query = db.select().from(loans).where(eq(loans.borrowerId, user.id)).orderBy(desc(loans.createdAt));
  } else {
    query = db
      .select()
      .from(loans)
      .where(or(eq(loans.lenderId, user.id), eq(loans.borrowerId, user.id)))
      .orderBy(desc(loans.createdAt));
  }

  const list = await query.all();
  return c.json({ success: true, data: list });
});

// Get loan details by ID
loansRouter.get('/:id', async (c) => {
  const user = c.get('user');
  const loanId = c.req.param('id');
  const db = getDb(c.env.DB);

  const loan = await db.select().from(loans).where(eq(loans.id, loanId)).get();
  if (!loan) {
    return c.json({ success: false, error: 'Loan record not found' }, 404);
  }

  if (loan.lenderId !== user.id && loan.borrowerId !== user.id) {
    return c.json({ success: false, error: 'Unauthorized to view this record' }, 403);
  }

  const lender = await db.select().from(users).where(eq(users.id, loan.lenderId)).get();
  const borrower = await db.select().from(users).where(eq(users.id, loan.borrowerId)).get();
  const loanGuarantors = await db.select().from(guarantors).where(eq(guarantors.loanId, loanId)).all();
  const loanRepayments = await db.select().from(repayments).where(eq(repayments.loanId, loanId)).orderBy(desc(repayments.paymentDate)).all();
  const loanHardships = await db.select().from(hardshipRequests).where(eq(hardshipRequests.loanId, loanId)).orderBy(desc(hardshipRequests.createdAt)).all();
  const loanLogs = await db.select().from(auditLogs).where(eq(auditLogs.loanId, loanId)).orderBy(desc(auditLogs.createdAt)).all();

  return c.json({
    success: true,
    data: {
      ...loan,
      lenderName: lender?.name,
      lenderPhone: lender?.phone,
      borrowerName: borrower?.name,
      borrowerPhone: borrower?.phone,
      guarantors: loanGuarantors,
      repayments: loanRepayments,
      hardshipRequests: loanHardships,
      auditLogs: loanLogs,
    },
  });
});

// Create new Qard al-Hasan loan
loansRouter.post('/', async (c) => {
  const user = c.get('user');
  const body = await c.req.json();
  const parsed = CreateLoanSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ success: false, error: parsed.error.errors[0].message }, 400);
  }

  const db = getDb(c.env.DB);
  const now = new Date().toISOString();
  const data = parsed.data;

  // Lookup or create borrower profile
  let borrower = await db.select().from(users).where(eq(users.phone, data.borrowerPhone)).get();
  if (!borrower) {
    const newBorrowerId = crypto.randomUUID();
    await db.insert(users).values({
      id: newBorrowerId,
      name: data.borrowerName,
      phone: data.borrowerPhone,
      role: 'INDIVIDUAL',
      husnScore: 100,
      isVerified: false,
      createdAt: now,
      updatedAt: now,
    });
    borrower = await db.select().from(users).where(eq(users.id, newBorrowerId)).get();
  }

  const loanId = crypto.randomUUID();
  const contractContent = `QARD-${loanId}-${user.id}-${borrower!.id}-${data.principalAmount}-${data.startDate}-${data.dueDate}`;
  
  // Compute SHA-256 integrity verification hash
  const msgUint8 = new TextEncoder().encode(contractContent);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const contractHash = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

  // Atomic batch execution
  await db.batch([
    db.insert(loans).values({
      id: loanId,
      poolId: data.poolId,
      lenderId: user.id,
      borrowerId: borrower!.id,
      principalAmount: data.principalAmount,
      remainingAmount: data.principalAmount,
      currency: data.currency,
      repaymentType: data.repaymentType,
      installmentCount: data.installmentCount,
      installmentAmount: data.installmentAmount,
      purpose: data.purpose,
      status: LOAN_STATUS.PROPOSED,
      startDate: data.startDate,
      dueDate: data.dueDate,
      contractHash,
      lenderSignedAt: now,
      createdAt: now,
      updatedAt: now,
    }),
    db.insert(auditLogs).values({
      id: crypto.randomUUID(),
      loanId,
      actorId: user.id,
      action: 'LOAN_PROPOSED',
      payload: JSON.stringify({ principal: data.principalAmount, dueDate: data.dueDate }),
      createdAt: now,
    }),
  ]);

  // Attach witnesses / guarantors if provided
  if (data.guarantors && data.guarantors.length > 0) {
    for (const g of data.guarantors) {
      await db.insert(guarantors).values({
        id: crypto.randomUUID(),
        loanId,
        name: g.name,
        phone: g.phone,
        role: g.role,
        status: 'INVITED',
      });
    }
  }

  const createdLoan = await db.select().from(loans).where(eq(loans.id, loanId)).get();
  return c.json({ success: true, data: createdLoan }, 201);
});

// Digital signature and mutual approval
loansRouter.post('/:id/sign', async (c) => {
  const user = c.get('user');
  const loanId = c.req.param('id');
  const db = getDb(c.env.DB);
  const now = new Date().toISOString();

  const loan = await db.select().from(loans).where(eq(loans.id, loanId)).get();
  if (!loan) {
    return c.json({ success: false, error: 'Loan record not found' }, 404);
  }

  let updateFields: Partial<typeof loans.$inferInsert> = { updatedAt: now };

  if (loan.borrowerId === user.id) {
    updateFields.borrowerSignedAt = now;
    updateFields.status = LOAN_STATUS.ACTIVE;
  } else if (loan.lenderId === user.id) {
    updateFields.lenderSignedAt = now;
  } else {
    return c.json({ success: false, error: 'Unauthorized to sign this contract' }, 403);
  }

  await db.batch([
    db.update(loans).set(updateFields).where(eq(loans.id, loanId)),
    db.insert(auditLogs).values({
      id: crypto.randomUUID(),
      loanId,
      actorId: user.id,
      action: 'CONTRACT_SIGNED',
      payload: JSON.stringify({ role: loan.borrowerId === user.id ? 'BORROWER' : 'LENDER' }),
      createdAt: now,
    }),
  ]);

  const updated = await db.select().from(loans).where(eq(loans.id, loanId)).get();
  return c.json({ success: true, data: updated });
});

// Grace Period / Hardship Request (Inzar al-Mu'sir)
loansRouter.post('/:id/hardship', async (c) => {
  const user = c.get('user');
  const loanId = c.req.param('id');
  const body = await c.req.json();
  const parsed = CreateHardshipSchema.safeParse({ ...body, loanId });
  if (!parsed.success) {
    return c.json({ success: false, error: parsed.error.errors[0].message }, 400);
  }

  const db = getDb(c.env.DB);
  const loan = await db.select().from(loans).where(eq(loans.id, loanId)).get();
  if (!loan || loan.borrowerId !== user.id) {
    return c.json({ success: false, error: 'Only the borrower can request a grace period' }, 403);
  }

  const now = new Date().toISOString();
  const hardshipId = crypto.randomUUID();

  await db.batch([
    db.insert(hardshipRequests).values({
      id: hardshipId,
      loanId,
      borrowerId: user.id,
      reason: parsed.data.reason,
      requestedNewDueDate: parsed.data.requestedNewDueDate,
      proposedNewInstallment: parsed.data.proposedNewInstallment,
      status: 'PENDING',
      createdAt: now,
    }),
    db.update(loans).set({ status: LOAN_STATUS.HARDSHIP_REVIEW, updatedAt: now }).where(eq(loans.id, loanId)),
    db.insert(auditLogs).values({
      id: crypto.randomUUID(),
      loanId,
      actorId: user.id,
      action: 'HARDSHIP_REQUESTED',
      payload: JSON.stringify(parsed.data),
      createdAt: now,
    }),
  ]);

  return c.json({ success: true, message: 'Grace period request submitted successfully' });
});

// Debt Forgiveness (Al-Ibra / Voluntary Charity)
loansRouter.post('/:id/forgive', async (c) => {
  const user = c.get('user');
  const loanId = c.req.param('id');
  const body = await c.req.json();
  const parsed = ForgiveLoanSchema.safeParse({ ...body, loanId });
  if (!parsed.success) {
    return c.json({ success: false, error: parsed.error.errors[0].message }, 400);
  }

  const db = getDb(c.env.DB);
  const loan = await db.select().from(loans).where(eq(loans.id, loanId)).get();
  if (!loan || loan.lenderId !== user.id) {
    return c.json({ success: false, error: 'Only the lender can forgive this loan' }, 403);
  }

  const now = new Date().toISOString();
  const { forgivenAmount, isFullForgiveness, sadaqahIntentionNote } = parsed.data;
  const newRemaining = Math.max(0, loan.remainingAmount - forgivenAmount);
  const newStatus = newRemaining === 0 ? LOAN_STATUS.FORGIVEN_IBRA : loan.status;

  await db.batch([
    db.update(loans).set({ remainingAmount: newRemaining, status: newStatus, updatedAt: now }).where(eq(loans.id, loanId)),
    db.insert(auditLogs).values({
      id: crypto.randomUUID(),
      loanId,
      actorId: user.id,
      action: 'LOAN_FORGIVEN_IBRA',
      payload: JSON.stringify({ forgivenAmount, isFull: isFullForgiveness, note: sadaqahIntentionNote }),
      createdAt: now,
    }),
  ]);

  return c.json({
    success: true,
    message: 'Loan forgiven successfully as voluntary charity (Al-Ibra) for the sake of Allah',
    data: { newRemaining, status: newStatus },
  });
});

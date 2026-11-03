import { Hono } from 'hono';
import { eq, or, and, desc } from 'drizzle-orm';
import { Bindings, getDb } from '../db';
import { loans, users, guarantors, repayments, hardshipRequests, auditLogs } from '../db/schema';
import { CreateLoanSchema, CreateHardshipSchema, ForgiveLoanSchema, HawalaTransferSchema, LOAN_STATUS } from '@qard/shared';
import { authMiddleware, AuthUser } from '../middleware/auth';

export const loansRouter = new Hono<{ Bindings: Bindings; Variables: { user: AuthUser } }>();

loansRouter.use('*', authMiddleware);

// লোন তালিকা দেখা
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

// নির্দিষ্ট লোনের বিস্তারিত তথ্য
loansRouter.get('/:id', async (c) => {
  const user = c.get('user');
  const loanId = c.req.param('id');
  const db = getDb(c.env.DB);

  const loan = await db.select().from(loans).where(eq(loans.id, loanId)).get();
  if (!loan) {
    return c.json({ success: false, error: 'কর্জের রেকর্ড পাওয়া যায়নি' }, 404);
  }

  if (loan.lenderId !== user.id && loan.borrowerId !== user.id) {
    return c.json({ success: false, error: 'এই রেকর্ড দেখার অনুমতি নেই' }, 403);
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

// নতুন কর্জে হাসানাহ তৈরি
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

  // ঋণগ্রহীতার প্রোফাইল খোঁজা বা তৈরি
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
  
  // SHA-256 ভেরিফিকেশন হ্যাশ
  const msgUint8 = new TextEncoder().encode(contractContent);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const contractHash = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

  // অ্যাটমিক ট্রানজ্যাকশন
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

  // সাক্ষী/জামিনদার যুক্ত করা (যদি থাকে)
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

// ডিজিটাল সাইন ও অনুমোদন
loansRouter.post('/:id/sign', async (c) => {
  const user = c.get('user');
  const loanId = c.req.param('id');
  const db = getDb(c.env.DB);
  const now = new Date().toISOString();

  const loan = await db.select().from(loans).where(eq(loans.id, loanId)).get();
  if (!loan) {
    return c.json({ success: false, error: 'কর্জের রেকর্ড পাওয়া যায়নি' }, 404);
  }

  let updateFields: Partial<typeof loans.$inferInsert> = { updatedAt: now };

  if (loan.borrowerId === user.id) {
    updateFields.borrowerSignedAt = now;
    updateFields.status = LOAN_STATUS.ACTIVE;
  } else if (loan.lenderId === user.id) {
    updateFields.lenderSignedAt = now;
  } else {
    return c.json({ success: false, error: 'আপনার এই চুক্তি স্বাক্ষরের অনুমতি নেই' }, 403);
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

// সংকটাপন্ন অবকাশের আবেদন (Inzar al-Mu'sir)
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
    return c.json({ success: false, error: 'কেবল ঋণগ্রহীতা অবকাশের আবেদন করতে পারবেন' }, 403);
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

  return c.json({ success: true, message: 'অবকাশের আবেদন সফলভাবে জমা হয়েছে' });
});

// ঋণ মওকুফ (Ibra - সম্পূর্ণ বা আংশিক সদকাহ)
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
    return c.json({ success: false, error: 'কেবল ঋণদাতা ঋণ মওকুফ করতে পারবেন' }, 403);
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
    message: 'ঋণ সফলভাবে আল্লাহর সন্তুষ্টির জন্য সদকাহ হিসেবে মওকুফ করা হয়েছে',
    data: { newRemaining, status: newStatus },
  });
});

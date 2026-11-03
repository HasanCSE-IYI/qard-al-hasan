import { Hono } from 'hono';
import { eq, or, and, desc, sql } from 'drizzle-orm';
import { Bindings, getDb } from '../db';
import { loans, repayments } from '../db/schema';
import { LOAN_STATUS } from '@qard/shared';
import { authMiddleware, AuthUser } from '../middleware/auth';

export const dashboardRouter = new Hono<{ Bindings: Bindings; Variables: { user: AuthUser } }>();

dashboardRouter.use('*', authMiddleware);

dashboardRouter.get('/summary', async (c) => {
  const user = c.get('user');
  const db = getDb(c.env.DB);

  // ১. দেওয়া কর্জের হিসাব
  const lentLoans = await db.select().from(loans).where(eq(loans.lenderId, user.id)).all();
  let totalLent = 0;
  let activeGivenCount = 0;
  let totalSadaqahForgiven = 0;

  for (const l of lentLoans) {
    totalLent += l.principalAmount;
    if (l.status === LOAN_STATUS.ACTIVE || l.status === LOAN_STATUS.PARTIALLY_PAID) {
      activeGivenCount++;
    }
    if (l.status === LOAN_STATUS.FORGIVEN_IBRA) {
      totalSadaqahForgiven += l.principalAmount;
    }
  }

  // ২. নেওয়া কর্জের হিসাব
  const borrowedLoans = await db.select().from(loans).where(eq(loans.borrowerId, user.id)).all();
  let totalBorrowed = 0;
  let activeTakenCount = 0;
  let upcomingDueCount = 0;

  const now = new Date();
  const next7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  for (const b of borrowedLoans) {
    totalBorrowed += b.principalAmount;
    if (b.status === LOAN_STATUS.ACTIVE || b.status === LOAN_STATUS.PARTIALLY_PAID) {
      activeTakenCount++;
      if (b.dueDate && b.dueDate <= next7Days) {
        upcomingDueCount++;
      }
    }
  }

  // ৩. সাম্প্রতিক লেনদেন
  const recentLoans = await db
    .select({ id: loans.id })
    .from(loans)
    .where(or(eq(loans.lenderId, user.id), eq(loans.borrowerId, user.id)))
    .all();

  const loanIds = recentLoans.map((l) => l.id);
  let recentRepayments: any[] = [];
  if (loanIds.length > 0) {
    recentRepayments = await db
      .select()
      .from(repayments)
      .where(sql`${repayments.loanId} IN ${loanIds}`)
      .orderBy(desc(repayments.createdAt))
      .limit(10)
      .all();
  }

  return c.json({
    success: true,
    data: {
      totalLent,
      totalBorrowed,
      activeGivenLoansCount: activeGivenCount,
      activeTakenLoansCount: activeTakenCount,
      upcomingDueCount,
      totalSadaqahForgiven,
      recentTransactions: recentRepayments,
    },
  });
});

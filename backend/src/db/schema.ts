import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

// Users Table
export const users = sqliteTable('users', {
  id: text('id').primaryKey(), // UUID
  name: text('name').notNull(),
  phone: text('phone').notNull().unique(),
  email: text('email'),
  role: text('role', { enum: ['INDIVIDUAL', 'ORGANIZATION_ADMIN', 'TRUSTEE'] }).default('INDIVIDUAL').notNull(),
  avatarUrl: text('avatar_url'),
  husnScore: integer('husn_score').default(100).notNull(), // 100 points baseline
  isVerified: integer('is_verified', { mode: 'boolean' }).default(false).notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// Community / Institutional Fund Pools (Mosque / Welfare Trusts)
export const communityPools = sqliteTable('community_pools', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  category: text('category', { enum: ['MEDICAL', 'EDUCATION', 'BUSINESS', 'GENERAL'] }).default('GENERAL').notNull(),
  totalCapital: real('total_capital').default(0).notNull(),
  availableCapital: real('available_capital').default(0).notNull(),
  adminUserId: text('admin_user_id').references(() => users.id),
  createdAt: text('created_at').notNull(),
});

// Qard al-Hasan Core Loans Table
export const loans = sqliteTable('loans', {
  id: text('id').primaryKey(),
  poolId: text('pool_id').references(() => communityPools.id),
  lenderId: text('lender_id').references(() => users.id).notNull(),
  borrowerId: text('borrower_id').references(() => users.id).notNull(),
  principalAmount: real('principal_amount').notNull(),
  remainingAmount: real('remaining_amount').notNull(),
  currency: text('currency').default('BDT').notNull(),
  repaymentType: text('repayment_type', {
    enum: ['BULLET', 'MONTHLY_INSTALLMENT', 'WEEKLY', 'FLEXIBLE'],
  }).notNull(),
  installmentCount: integer('installment_count').default(1).notNull(),
  installmentAmount: real('installment_amount'),
  purpose: text('purpose').notNull(),
  status: text('status', {
    enum: [
      'DRAFT',
      'PROPOSED',
      'WITNESS_PENDING',
      'ACTIVE',
      'HARDSHIP_REVIEW',
      'PARTIALLY_PAID',
      'PAID_IN_FULL',
      'FORGIVEN_IBRA',
      'TRANSFERRED_HAWALA',
    ],
  }).default('PROPOSED').notNull(),
  startDate: text('start_date').notNull(),
  dueDate: text('due_date').notNull(),
  revId: integer('rev_id').default(1).notNull(), // Conflict resolution revision ID
  contractHash: text('contract_hash'), // SHA-256 integrity verification hash
  contractPdfUrl: text('contract_pdf_url'),
  lenderSignedAt: text('lender_signed_at'),
  borrowerSignedAt: text('borrower_signed_at'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// Repayments and Installments Tracking Table
export const repayments = sqliteTable('repayments', {
  id: text('id').primaryKey(),
  loanId: text('loan_id').references(() => loans.id).notNull(),
  amount: real('amount').notNull(),
  paymentDate: text('payment_date').notNull(),
  paymentMethod: text('payment_method', {
    enum: ['BKASH', 'NAGAD', 'ROCKET', 'BANK_TRANSFER', 'CASH'],
  }).notNull(),
  transactionRef: text('transaction_ref'),
  receiptImageUrl: text('receipt_image_url'),
  status: text('status', {
    enum: ['PENDING_VERIFICATION', 'CONFIRMED', 'DISPUTED'],
  }).default('PENDING_VERIFICATION').notNull(),
  notes: text('notes'),
  verifiedById: text('verified_by_id').references(() => users.id),
  verifiedAt: text('verified_at'),
  createdAt: text('created_at').notNull(),
});

// Witnesses and Guarantors Table
export const guarantors = sqliteTable('guarantors', {
  id: text('id').primaryKey(),
  loanId: text('loan_id').references(() => loans.id).notNull(),
  userId: text('user_id').references(() => users.id),
  name: text('name').notNull(),
  phone: text('phone').notNull(),
  role: text('role', { enum: ['FINANCIAL_GUARANTOR', 'WITNESS'] }).default('WITNESS').notNull(),
  status: text('status', { enum: ['INVITED', 'SIGNED_APPROVED', 'REJECTED'] }).default('INVITED').notNull(),
  signedAt: text('signed_at'),
  signatureImageUrl: text('signature_image_url'),
});

// Hardship / Grace Period Requests Table (Inzar al-Mu'sir)
export const hardshipRequests = sqliteTable('hardship_requests', {
  id: text('id').primaryKey(),
  loanId: text('loan_id').references(() => loans.id).notNull(),
  borrowerId: text('borrower_id').references(() => users.id).notNull(),
  reason: text('reason').notNull(),
  requestedNewDueDate: text('requested_new_due_date').notNull(),
  proposedNewInstallment: real('proposed_new_installment'),
  status: text('status', {
    enum: ['PENDING', 'ACCEPTED', 'RESTRUCTURED', 'DECLINED'],
  }).default('PENDING').notNull(),
  reviewedAt: text('reviewed_at'),
  reviewNote: text('review_note'),
  createdAt: text('created_at').notNull(),
});

// Shariah Audit Logs Table
export const auditLogs = sqliteTable('audit_logs', {
  id: text('id').primaryKey(),
  loanId: text('loan_id').references(() => loans.id).notNull(),
  actorId: text('actor_id').references(() => users.id).notNull(),
  action: text('action').notNull(),
  payload: text('payload'),
  createdAt: text('created_at').notNull(),
});

// OTP Sessions Table (KV fallback / Local dev)
export const otpSessions = sqliteTable('otp_sessions', {
  phone: text('phone').primaryKey(),
  otp: text('otp').notNull(),
  expiresAt: integer('expires_at').notNull(),
});

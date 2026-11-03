-- Initial Schema for Qard al-Hasan Management System (Cloudflare D1 SQLite)

CREATE TABLE IF NOT EXISTS `users` (
  `id` TEXT PRIMARY KEY NOT NULL,
  `name` TEXT NOT NULL,
  `phone` TEXT NOT NULL UNIQUE,
  `email` TEXT,
  `role` TEXT NOT NULL DEFAULT 'INDIVIDUAL',
  `avatar_url` TEXT,
  `husn_score` INTEGER NOT NULL DEFAULT 100,
  `is_verified` INTEGER NOT NULL DEFAULT 0,
  `created_at` TEXT NOT NULL,
  `updated_at` TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS `community_pools` (
  `id` TEXT PRIMARY KEY NOT NULL,
  `name` TEXT NOT NULL,
  `category` TEXT NOT NULL DEFAULT 'GENERAL',
  `total_capital` REAL NOT NULL DEFAULT 0,
  `available_capital` REAL NOT NULL DEFAULT 0,
  `admin_user_id` TEXT REFERENCES `users`(`id`),
  `created_at` TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS `loans` (
  `id` TEXT PRIMARY KEY NOT NULL,
  `pool_id` TEXT REFERENCES `community_pools`(`id`),
  `lender_id` TEXT NOT NULL REFERENCES `users`(`id`),
  `borrower_id` TEXT NOT NULL REFERENCES `users`(`id`),
  `principal_amount` REAL NOT NULL,
  `remaining_amount` REAL NOT NULL,
  `currency` TEXT NOT NULL DEFAULT 'BDT',
  `repayment_type` TEXT NOT NULL,
  `installment_count` INTEGER NOT NULL DEFAULT 1,
  `installment_amount` REAL,
  `purpose` TEXT NOT NULL,
  `status` TEXT NOT NULL DEFAULT 'PROPOSED',
  `start_date` TEXT NOT NULL,
  `due_date` TEXT NOT NULL,
  `rev_id` INTEGER NOT NULL DEFAULT 1,
  `contract_hash` TEXT,
  `contract_pdf_url` TEXT,
  `lender_signed_at` TEXT,
  `borrower_signed_at` TEXT,
  `created_at` TEXT NOT NULL,
  `updated_at` TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS `repayments` (
  `id` TEXT PRIMARY KEY NOT NULL,
  `loan_id` TEXT NOT NULL REFERENCES `loans`(`id`),
  `amount` REAL NOT NULL,
  `payment_date` TEXT NOT NULL,
  `payment_method` TEXT NOT NULL,
  `transaction_ref` TEXT,
  `receipt_image_url` TEXT,
  `status` TEXT NOT NULL DEFAULT 'PENDING_VERIFICATION',
  `notes` TEXT,
  `verified_by_id` TEXT REFERENCES `users`(`id`),
  `verified_at` TEXT,
  `created_at` TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS `guarantors` (
  `id` TEXT PRIMARY KEY NOT NULL,
  `loan_id` TEXT NOT NULL REFERENCES `loans`(`id`),
  `user_id` TEXT REFERENCES `users`(`id`),
  `name` TEXT NOT NULL,
  `phone` TEXT NOT NULL,
  `role` TEXT NOT NULL DEFAULT 'WITNESS',
  `status` TEXT NOT NULL DEFAULT 'INVITED',
  `signed_at` TEXT,
  `signature_image_url` TEXT
);

CREATE TABLE IF NOT EXISTS `hardship_requests` (
  `id` TEXT PRIMARY KEY NOT NULL,
  `loan_id` TEXT NOT NULL REFERENCES `loans`(`id`),
  `borrower_id` TEXT NOT NULL REFERENCES `users`(`id`),
  `reason` TEXT NOT NULL,
  `requested_new_due_date` TEXT NOT NULL,
  `proposed_new_installment` REAL,
  `status` TEXT NOT NULL DEFAULT 'PENDING',
  `reviewed_at` TEXT,
  `review_note` TEXT,
  `created_at` TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS `audit_logs` (
  `id` TEXT PRIMARY KEY NOT NULL,
  `loan_id` TEXT NOT NULL REFERENCES `loans`(`id`),
  `actor_id` TEXT NOT NULL REFERENCES `users`(`id`),
  `action` TEXT NOT NULL,
  `payload` TEXT,
  `created_at` TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS `otp_sessions` (
  `phone` TEXT PRIMARY KEY NOT NULL,
  `otp` TEXT NOT NULL,
  `expires_at` INTEGER NOT NULL
);

-- কর্মক্ষমতা বৃদ্ধির জন্য ইনডেক্সসমূহ
CREATE INDEX IF NOT EXISTS `idx_loans_lender` ON `loans`(`lender_id`);
CREATE INDEX IF NOT EXISTS `idx_loans_borrower` ON `loans`(`borrower_id`);
CREATE INDEX IF NOT EXISTS `idx_loans_status` ON `loans`(`status`);
CREATE INDEX IF NOT EXISTS `idx_repayments_loan` ON `repayments`(`loan_id`);
CREATE INDEX IF NOT EXISTS `idx_repayments_trx` ON `repayments`(`transaction_ref`);

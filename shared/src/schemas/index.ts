import { z } from 'zod';
import { LOAN_STATUS, REPAYMENT_TYPE, PAYMENT_METHOD, GUARANTOR_ROLE } from '../constants';

// Phone number validation (Standard international and national formats)
export const PhoneSchema = z
  .string()
  .min(10, 'Phone number must be at least 10 digits')
  .max(15, 'Phone number must not exceed 15 digits')
  .regex(/^[0-9+]+$/, 'Please enter a valid phone number');

// OTP Request Schema
export const RequestOtpSchema = z.object({
  phone: PhoneSchema,
});

export const VerifyOtpSchema = z.object({
  phone: PhoneSchema,
  otp: z.string().length(6, 'OTP must be exactly 6 digits'),
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
});

// Qard al-Hasan Loan Creation Schema
export const CreateLoanSchema = z.object({
  borrowerPhone: PhoneSchema,
  borrowerName: z.string().min(2, 'Enter borrower name'),
  principalAmount: z.number().positive('Principal amount must be greater than 0'),
  currency: z.string().default('BDT'),
  repaymentType: z.enum([
    REPAYMENT_TYPE.BULLET,
    REPAYMENT_TYPE.MONTHLY_INSTALLMENT,
    REPAYMENT_TYPE.WEEKLY,
    REPAYMENT_TYPE.FLEXIBLE,
  ]),
  installmentCount: z.number().int().positive().default(1),
  installmentAmount: z.number().positive().optional(),
  purpose: z.string().min(3, 'Specify the purpose of the loan'),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date format must be YYYY-MM-DD'),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Due date format must be YYYY-MM-DD'),
  poolId: z.string().uuid().optional(),
  guarantors: z
    .array(
      z.object({
        name: z.string().min(2, 'Enter witness or guarantor name'),
        phone: PhoneSchema,
        role: z.enum([GUARANTOR_ROLE.WITNESS, GUARANTOR_ROLE.FINANCIAL_GUARANTOR]),
      })
    )
    .optional(),
});

// Repayment Schema
export const CreateRepaymentSchema = z.object({
  loanId: z.string(),
  amount: z.number().positive('Repayment amount must be greater than 0'),
  paymentDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date format must be YYYY-MM-DD'),
  paymentMethod: z.enum([
    PAYMENT_METHOD.BKASH,
    PAYMENT_METHOD.NAGAD,
    PAYMENT_METHOD.ROCKET,
    PAYMENT_METHOD.BANK_TRANSFER,
    PAYMENT_METHOD.CASH,
  ]),
  transactionRef: z.string().optional(),
  receiptImageUrl: z.string().url().optional(),
  notes: z.string().optional(),
});

// Grace Period / Hardship Request Schema (Inzar al-Mu'sir)
export const CreateHardshipSchema = z.object({
  loanId: z.string(),
  reason: z.string().min(5, 'Describe the reason for hardship in detail'),
  requestedNewDueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'New due date format must be YYYY-MM-DD'),
  proposedNewInstallment: z.number().positive().optional(),
});

// Debt Forgiveness Schema (Al-Ibra / Sadaqah)
export const ForgiveLoanSchema = z.object({
  loanId: z.string(),
  forgivenAmount: z.number().positive('Forgiven amount must be greater than 0'),
  isFullForgiveness: z.boolean(),
  sadaqahIntentionNote: z.string().optional(),
});

// Debt Transfer Schema (Al-Hawalah)
export const HawalaTransferSchema = z.object({
  loanId: z.string(),
  newBorrowerPhone: PhoneSchema,
  newBorrowerName: z.string().min(2),
  consentEvidenceNote: z.string().min(5),
});

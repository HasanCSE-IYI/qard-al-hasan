import { z } from 'zod';
import { LOAN_STATUS, REPAYMENT_TYPE, PAYMENT_METHOD, GUARANTOR_ROLE } from '../constants';

// ফোন নম্বর ভ্যালিডেশন (বাংলাদেশি ও আন্তর্জাতিক ফরম্যাট)
export const PhoneSchema = z
  .string()
  .min(10, 'ফোন নম্বর ন্যূনতম ১০ ডিজিট হতে হবে')
  .max(15, 'ফোন নম্বর সর্বোচ্চ ১৫ ডিজিট')
  .regex(/^[0-9+]+$/, 'সঠিক ফোন নম্বর প্রদান করুন');

// ওটিপি রিকোয়েস্ট স্কিমা
export const RequestOtpSchema = z.object({
  phone: PhoneSchema,
});

export const VerifyOtpSchema = z.object({
  phone: PhoneSchema,
  otp: z.string().length(6, 'OTP অবশ্যই ৬ সংখ্যার হতে হবে'),
  name: z.string().min(2, 'নাম ন্যূনতম ২ অক্ষরের হতে হবে').optional(),
});

// কর্জে হাসানাহ আবেদন/তৈরি স্কিমা
export const CreateLoanSchema = z.object({
  borrowerPhone: PhoneSchema,
  borrowerName: z.string().min(2, 'গ্রহীতার নাম লিখুন'),
  principalAmount: z.number().positive('ঋণের পরিমাণ অবশ্যই ০-এর বেশি হতে হবে'),
  currency: z.string().default('BDT'),
  repaymentType: z.enum([
    REPAYMENT_TYPE.BULLET,
    REPAYMENT_TYPE.MONTHLY_INSTALLMENT,
    REPAYMENT_TYPE.WEEKLY,
    REPAYMENT_TYPE.FLEXIBLE,
  ]),
  installmentCount: z.number().int().positive().default(1),
  installmentAmount: z.number().positive().optional(),
  purpose: z.string().min(3, 'ঋণ গ্রহণের সুনির্দিষ্ট কারণ উল্লেখ করুন'),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'তারিখ YYYY-MM-DD ফরম্যাটে দিন'),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'পরিশোধের শেষ তারিখ YYYY-MM-DD ফরম্যাটে দিন'),
  poolId: z.string().uuid().optional(),
  guarantors: z
    .array(
      z.object({
        name: z.string().min(2, 'সাক্ষী/জামিনদারের নাম লিখুন'),
        phone: PhoneSchema,
        role: z.enum([GUARANTOR_ROLE.WITNESS, GUARANTOR_ROLE.FINANCIAL_GUARANTOR]),
      })
    )
    .optional(),
});

// কিস্তি পরিশোধ স্কিমা
export const CreateRepaymentSchema = z.object({
  loanId: z.string(),
  amount: z.number().positive('পরিশোধের পরিমাণ অবশ্যই ০-এর বেশি হতে হবে'),
  paymentDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'তারিখ YYYY-MM-DD ফরম্যাটে দিন'),
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

// অবকাশ (Inzar al-Mu'sir) আবেদন স্কিমা
export const CreateHardshipSchema = z.object({
  loanId: z.string(),
  reason: z.string().min(5, 'অসচ্ছলতা বা সংকটের কারণ বিস্তারিত লিখুন'),
  requestedNewDueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'নতুন তারিখ YYYY-MM-DD ফরম্যাটে দিন'),
  proposedNewInstallment: z.number().positive().optional(),
});

// ঋণ মওকুফ (Ibra) স্কিমা
export const ForgiveLoanSchema = z.object({
  loanId: z.string(),
  forgivenAmount: z.number().positive('মওকুফকৃত পরিমাণ ০-এর বেশি হতে হবে'),
  isFullForgiveness: z.boolean(),
  sadaqahIntentionNote: z.string().optional(),
});

// ঋণ হস্তান্তর (Hawalah) স্কিমা
export const HawalaTransferSchema = z.object({
  loanId: z.string(),
  newBorrowerPhone: PhoneSchema,
  newBorrowerName: z.string().min(2),
  consentEvidenceNote: z.string().min(5),
});

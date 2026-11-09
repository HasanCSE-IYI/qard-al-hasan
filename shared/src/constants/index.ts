/**
 * Islamic Shariah and Qard al-Hasan Constants and Templates
 */

export const LOAN_STATUS = {
  DRAFT: 'DRAFT',
  PROPOSED: 'PROPOSED',
  WITNESS_PENDING: 'WITNESS_PENDING',
  ACTIVE: 'ACTIVE',
  HARDSHIP_REVIEW: 'HARDSHIP_REVIEW',
  PARTIALLY_PAID: 'PARTIALLY_PAID',
  PAID_IN_FULL: 'PAID_IN_FULL',
  FORGIVEN_IBRA: 'FORGIVEN_IBRA',
  TRANSFERRED_HAWALA: 'TRANSFERRED_HAWALA',
} as const;

export type LoanStatus = typeof LOAN_STATUS[keyof typeof LOAN_STATUS];

export const REPAYMENT_TYPE = {
  BULLET: 'BULLET', // Lump-sum repayment
  MONTHLY_INSTALLMENT: 'MONTHLY_INSTALLMENT', // Equal monthly installments
  WEEKLY: 'WEEKLY', // Weekly installments
  FLEXIBLE: 'FLEXIBLE', // Flexible repayment
} as const;

export type RepaymentType = typeof REPAYMENT_TYPE[keyof typeof REPAYMENT_TYPE];

export const PAYMENT_METHOD = {
  BKASH: 'BKASH',
  NAGAD: 'NAGAD',
  ROCKET: 'ROCKET',
  BANK_TRANSFER: 'BANK_TRANSFER',
  CASH: 'CASH',
} as const;

export type PaymentMethod = typeof PAYMENT_METHOD[keyof typeof PAYMENT_METHOD];

export const GUARANTOR_ROLE = {
  WITNESS: 'WITNESS', // General witness (Shahed)
  FINANCIAL_GUARANTOR: 'FINANCIAL_GUARANTOR', // Financial guarantor (Kafil bil-Mal)
} as const;

export type GuarantorRole = typeof GUARANTOR_ROLE[keyof typeof GUARANTOR_ROLE];

export const GUARANTOR_STATUS = {
  INVITED: 'INVITED',
  SIGNED_APPROVED: 'SIGNED_APPROVED',
  REJECTED: 'REJECTED',
} as const;

export type GuarantorStatus = typeof GUARANTOR_STATUS[keyof typeof GUARANTOR_STATUS];

export const HARDSHIP_STATUS = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  RESTRUCTURED: 'RESTRUCTURED',
  DECLINED: 'DECLINED',
} as const;

export type HardshipStatus = typeof HARDSHIP_STATUS[keyof typeof HARDSHIP_STATUS];

export const POOL_CATEGORY = {
  MEDICAL: 'MEDICAL', // Emergency medical support
  EDUCATION: 'EDUCATION', // Educational loan
  BUSINESS: 'BUSINESS', // Micro-enterprise & self-reliance
  GENERAL: 'GENERAL', // General benevolent loan
} as const;

export type PoolCategory = typeof POOL_CATEGORY[keyof typeof POOL_CATEGORY];

/**
 * Sunnah-compliant gentle and respectful reminder templates
 */
export const GENTLE_REMINDER_TEMPLATES = [
  {
    id: 'courtesy_advance',
    title: 'Courtesy Notice (3 days prior)',
    text: (borrowerName: string, amount: number, dueDate: string) =>
      `Assalamu Alaikum ${borrowerName}. May Allah bless you and your family. This is a gentle courtesy notice regarding your upcoming Qard installment (BDT ${amount}) due on ${dueDate}. May Allah grant abundance in your sustenance.`,
  },
  {
    id: 'due_date_today',
    title: 'Respectful Notice on Due Date',
    text: (borrowerName: string, amount: number) =>
      `Assalamu Alaikum ${borrowerName}. Today is the scheduled due date for your Qard installment (BDT ${amount}). If you are experiencing any unforeseen hardship, you are warmly invited to submit a grace period request (Inzar al-Mu'sir) directly in the app. JazakAllahu Khairan.`,
  },
  {
    id: 'sunnah_hadith',
    title: 'Spiritual Reminder with Prophetic Hadith',
    text: (borrowerName: string, _amount?: number, _dueDate?: string) =>
      `Assalamu Alaikum ${borrowerName}. The Messenger of Allah (ﷺ) said: "Whoever grants respite to someone in difficulty, or forgives him, Allah will shade him in His shade on the Day of Resurrection." Wishing you peace, ease, and continued well-being.`,
  },
];

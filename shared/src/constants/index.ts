/**
 * ইসলামিক শরীয়াহ ও কর্জ্যে হাসানাহ ধ্রুবক ও টেমপ্লেট
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
  BULLET: 'BULLET', // এককালীন পরিশোধ
  MONTHLY_INSTALLMENT: 'MONTHLY_INSTALLMENT', // মাসিক সমান কিস্তি
  WEEKLY: 'WEEKLY', // সাপ্তাহিক কিস্তি
  FLEXIBLE: 'FLEXIBLE', // পরিবর্তনশীল
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
  WITNESS: 'WITNESS', // সাধারণ সাক্ষী (শাহেদ)
  FINANCIAL_GUARANTOR: 'FINANCIAL_GUARANTOR', // জামিনদার (কাফিল বিল মাল)
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
  MEDICAL: 'MEDICAL', // জরুরি চিকিৎসা সহায়তা
  EDUCATION: 'EDUCATION', // শিক্ষা কর্জ
  BUSINESS: 'BUSINESS', // ক্ষুদ্র ব্যবসা ও স্বাবলম্বীকরণ
  GENERAL: 'GENERAL', // সাধারণ কল্যাণমূলক কর্জ
} as const;

export type PoolCategory = typeof POOL_CATEGORY[keyof typeof POOL_CATEGORY];

/**
 * সুন্নাহ সম্মত ভদ্র ও সম্মানজনক রিমাইন্ডার টেমপ্লেট
 */
export const GENTLE_REMINDER_TEMPLATES = [
  {
    id: 'courtesy_advance',
    title: 'কিস্তির ৩ দিন পূর্বে সৌজন্য নোটিশ',
    text: (borrowerName: string, amount: number, dueDate: string) =>
      `আসসালামু আলাইকুম ${borrowerName} ভাই/বোন। আশা করি আল্লাহর রহমতে ভালো আছেন। আপনার কর্জের একটি কিস্তি (৳${amount}) আগামী ${dueDate} তারিখে নির্ধারিত রয়েছে। আল্লাহ আপনার রিজিকে বরকত দান করুন।`,
  },
  {
    id: 'due_date_today',
    title: 'নির্ধারিত দিনে সম্মানজনক স্মরণিকা',
    text: (borrowerName: string, amount: number) =>
      `আসসালামু আলাইকুম ${borrowerName} ভাই। আজ আপনার কর্জের কিস্তি (৳${amount}) পরিশোধের নির্ধারিত দিন। কোনো অসুবিধা বা বিলম্বের কারণ থাকলে অনুগ্রহ করে অ্যাপে অবকাশের আবেদন (ইনযারুল মু'সির) করতে পারেন। জাযাকাল্লাহু খাইরান।`,
  },
  {
    id: 'sunnah_hadith',
    title: 'হাদিসের বাণী সম্বলিত বার্তা',
    text: (borrowerName: string) =>
      `আসসালামু আলাইকুম ${borrowerName} ভাই। রাসূলুল্লাহ (ﷺ) বলেছেন: "যে ব্যক্তি কোনো ঋণগ্রস্ত বা অভাবগ্রস্তকে অবকাশ দেয়, আল্লাহ তাআলা তাকে কিয়ামতের কঠিন দিনে আরশের ছায়া দান করবেন।" আপনার সুস্থতা ও সার্বিক কল্যাণ কামনা করছি।`,
  },
];

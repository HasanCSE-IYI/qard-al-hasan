import { create } from 'zustand';
import { User, Loan, Repayment, DashboardSummary, LOAN_STATUS, REPAYMENT_TYPE, PAYMENT_METHOD } from '@qard/shared';

interface AppState {
  user: User | null;
  isLoggedIn: boolean;
  isPrivacyMode: boolean;
  loans: Loan[];
  dashboardSummary: DashboardSummary;
  selectedLoan: Loan | null;

  // অ্যাকশনসমূহ
  setUser: (user: User | null) => void;
  togglePrivacyMode: () => void;
  setLoans: (loans: Loan[]) => void;
  addLoan: (loan: Loan) => void;
  updateLoan: (loanId: string, updates: Partial<Loan>) => void;
  setSelectedLoan: (loan: Loan | null) => void;
  addRepayment: (repayment: Repayment) => void;
  forgiveLoan: (loanId: string, amount: number) => void;
  grantHardshipExtension: (loanId: string, newDueDate: string) => void;
  seedDemoData: () => void;
}

// প্রারম্ভিক ডেমো ডাটা (সুন্নাহ ভিত্তিক বাস্তব চিত্র)
const initialUser: User = {
  id: 'user-001',
  name: 'মাহমুদুল হাসান',
  phone: '01711223344',
  email: 'hasan@example.com',
  role: 'INDIVIDUAL',
  avatarUrl: null,
  husnScore: 115, // হুসনুল ওয়াফা সুনাম স্কোর
  isVerified: true,
  createdAt: '2026-01-15T10:00:00Z',
  updatedAt: '2026-11-01T12:00:00Z',
};

const initialLoans: Loan[] = [
  {
    id: 'loan-101',
    lenderId: 'user-001',
    borrowerId: 'user-002',
    lenderName: 'মাহমুদুল হাসান',
    borrowerName: 'আব্দুর রহমান',
    principalAmount: 35000,
    remainingAmount: 15000,
    currency: 'BDT',
    repaymentType: REPAYMENT_TYPE.MONTHLY_INSTALLMENT,
    installmentCount: 7,
    installmentAmount: 5000,
    purpose: 'পারিবারিক চিকিৎসা ও ওষুধের বিল পরিশোধ',
    status: LOAN_STATUS.PARTIALLY_PAID,
    startDate: '2026-08-01',
    dueDate: '2026-12-01',
    revId: 3,
    contractHash: 'c7b5a83e498d9f1092e0384a8bc94d75',
    createdAt: '2026-08-01T09:00:00Z',
    updatedAt: '2026-10-05T14:30:00Z',
  },
  {
    id: 'loan-102',
    lenderId: 'user-003',
    borrowerId: 'user-001',
    lenderName: 'ড. রফিকুল ইসলাম',
    borrowerName: 'মাহমুদুল হাসান',
    principalAmount: 50000,
    remainingAmount: 50000,
    currency: 'BDT',
    repaymentType: REPAYMENT_TYPE.BULLET,
    installmentCount: 1,
    installmentAmount: 50000,
    purpose: 'ক্ষুদ্র ব্যবসার জন্য কাঁচামাল ক্রয়',
    status: LOAN_STATUS.ACTIVE,
    startDate: '2026-09-15',
    dueDate: '2026-11-20',
    revId: 1,
    contractHash: '984eb4a90184e93d8b1c47289fca84e1',
    createdAt: '2026-09-15T11:00:00Z',
    updatedAt: '2026-09-15T11:00:00Z',
  },
  {
    id: 'loan-103',
    lenderId: 'user-001',
    borrowerId: 'user-004',
    lenderName: 'মাহমুদুল হাসান',
    borrowerName: 'হাফেজ জুবায়ের',
    principalAmount: 20000,
    remainingAmount: 0,
    currency: 'BDT',
    repaymentType: REPAYMENT_TYPE.BULLET,
    installmentCount: 1,
    installmentAmount: 20000,
    purpose: 'মাদরাসার কিতাবাদি ও পরীক্ষা ফি',
    status: LOAN_STATUS.FORGIVEN_IBRA, // সদকাহ হিসেবে মওকুফ
    startDate: '2026-05-10',
    dueDate: '2026-09-10',
    revId: 2,
    contractHash: 'f47a98bc1098e21048b309ea87c320d9',
    createdAt: '2026-05-10T15:00:00Z',
    updatedAt: '2026-09-08T18:00:00Z',
  },
];

const initialRepayments: Repayment[] = [
  {
    id: 'rep-001',
    loanId: 'loan-101',
    amount: 10000,
    paymentDate: '2026-09-02',
    paymentMethod: PAYMENT_METHOD.BKASH,
    transactionRef: '9H7A6B5C4D',
    status: 'CONFIRMED',
    notes: 'প্রথম দুই কিস্তি একসাথে পরিশোধিত',
    createdAt: '2026-09-02T16:00:00Z',
  },
  {
    id: 'rep-002',
    loanId: 'loan-101',
    amount: 10000,
    paymentDate: '2026-10-05',
    paymentMethod: PAYMENT_METHOD.NAGAD,
    transactionRef: '8K2M9N4P1Q',
    status: 'CONFIRMED',
    notes: 'অক্টোবর মাসের কিস্তি',
    createdAt: '2026-10-05T14:30:00Z',
  },
];

export const useAppStore = create<AppState>((set, get) => ({
  user: initialUser,
  isLoggedIn: true,
  isPrivacyMode: false,
  loans: initialLoans,
  selectedLoan: null,
  dashboardSummary: {
    totalLent: 55000,
    totalBorrowed: 50000,
    activeGivenLoansCount: 1,
    activeTakenLoansCount: 1,
    upcomingDueCount: 1,
    totalSadaqahForgiven: 20000,
    recentTransactions: initialRepayments,
  },

  setUser: (user) => set({ user, isLoggedIn: !!user }),
  togglePrivacyMode: () => set((state) => ({ isPrivacyMode: !state.isPrivacyMode })),
  setLoans: (loans) => set({ loans }),

  addLoan: (loan) =>
    set((state) => {
      const updated = [loan, ...state.loans];
      return {
        loans: updated,
        dashboardSummary: {
          ...state.dashboardSummary,
          totalLent: loan.lenderId === state.user?.id ? state.dashboardSummary.totalLent + loan.principalAmount : state.dashboardSummary.totalLent,
          totalBorrowed: loan.borrowerId === state.user?.id ? state.dashboardSummary.totalBorrowed + loan.principalAmount : state.dashboardSummary.totalBorrowed,
        },
      };
    }),

  updateLoan: (loanId, updates) =>
    set((state) => ({
      loans: state.loans.map((l) => (l.id === loanId ? { ...l, ...updates } : l)),
    })),

  setSelectedLoan: (loan) => set({ selectedLoan: loan }),

  addRepayment: (repayment) =>
    set((state) => {
      const targetLoan = state.loans.find((l) => l.id === repayment.loanId);
      if (!targetLoan) return state;

      const newRemaining = Math.max(0, targetLoan.remainingAmount - repayment.amount);
      const newStatus = newRemaining === 0 ? LOAN_STATUS.PAID_IN_FULL : LOAN_STATUS.PARTIALLY_PAID;

      const updatedLoans = state.loans.map((l) =>
        l.id === repayment.loanId ? { ...l, remainingAmount: newRemaining, status: newStatus } : l
      );

      return {
        loans: updatedLoans,
        dashboardSummary: {
          ...state.dashboardSummary,
          recentTransactions: [repayment, ...state.dashboardSummary.recentTransactions],
        },
      };
    }),

  forgiveLoan: (loanId, amount) =>
    set((state) => {
      const updatedLoans = state.loans.map((l) => {
        if (l.id === loanId) {
          const newRemaining = Math.max(0, l.remainingAmount - amount);
          return {
            ...l,
            remainingAmount: newRemaining,
            status: newRemaining === 0 ? LOAN_STATUS.FORGIVEN_IBRA : l.status,
          };
        }
        return l;
      });

      return {
        loans: updatedLoans,
        dashboardSummary: {
          ...state.dashboardSummary,
          totalSadaqahForgiven: state.dashboardSummary.totalSadaqahForgiven + amount,
        },
      };
    }),

  grantHardshipExtension: (loanId, newDueDate) =>
    set((state) => ({
      loans: state.loans.map((l) => (l.id === loanId ? { ...l, dueDate: newDueDate, status: LOAN_STATUS.ACTIVE } : l)),
    })),

  seedDemoData: () =>
    set({
      user: initialUser,
      loans: initialLoans,
      isLoggedIn: true,
    }),
}));

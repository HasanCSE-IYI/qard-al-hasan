import {
  LoanStatus,
  RepaymentType,
  PaymentMethod,
  GuarantorRole,
  GuarantorStatus,
  HardshipStatus,
  PoolCategory,
} from '../constants';

export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  role: 'INDIVIDUAL' | 'ORGANIZATION_ADMIN' | 'TRUSTEE';
  avatarUrl?: string | null;
  husnScore: number;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CommunityPool {
  id: string;
  name: string;
  category: PoolCategory;
  totalCapital: number;
  availableCapital: number;
  adminUserId?: string | null;
  createdAt: string;
}

export interface Loan {
  id: string;
  poolId?: string | null;
  lenderId: string;
  borrowerId: string;
  lenderName?: string;
  borrowerName?: string;
  principalAmount: number;
  remainingAmount: number;
  currency: string;
  repaymentType: RepaymentType;
  installmentCount: number;
  installmentAmount?: number | null;
  purpose: string;
  status: LoanStatus;
  startDate: string;
  dueDate: string;
  revId: number;
  contractHash?: string | null;
  contractPdfUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Repayment {
  id: string;
  loanId: string;
  amount: number;
  paymentDate: string;
  paymentMethod: PaymentMethod;
  transactionRef?: string | null;
  receiptImageUrl?: string | null;
  status: 'PENDING_VERIFICATION' | 'CONFIRMED' | 'DISPUTED';
  notes?: string | null;
  verifiedById?: string | null;
  verifiedAt?: string | null;
  createdAt: string;
}

export interface Guarantor {
  id: string;
  loanId: string;
  userId?: string | null;
  name: string;
  phone: string;
  role: GuarantorRole;
  status: GuarantorStatus;
  signedAt?: string | null;
  signatureImageUrl?: string | null;
}

export interface HardshipRequest {
  id: string;
  loanId: string;
  borrowerId: string;
  reason: string;
  requestedNewDueDate: string;
  proposedNewInstallment?: number | null;
  status: HardshipStatus;
  reviewedAt?: string | null;
  reviewNote?: string | null;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  loanId: string;
  actorId: string;
  action: string;
  payload?: string | null;
  createdAt: string;
}

export interface DashboardSummary {
  totalLent: number;
  totalBorrowed: number;
  activeGivenLoansCount: number;
  activeTakenLoansCount: number;
  upcomingDueCount: number;
  totalSadaqahForgiven: number;
  recentTransactions: Repayment[];
}

export interface WasiyyahDebtItem {
  counterpartyName: string;
  counterpartyPhone: string;
  amount: number;
  dueDate: string;
  purpose: string;
  type: 'RECEIVABLE' | 'PAYABLE';
}

export interface WasiyyahReport {
  user: User;
  receivables: WasiyyahDebtItem[];
  payables: WasiyyahDebtItem[];
  netBalance: number;
  generatedDate: string;
  sha256VerificationHash: string;
}

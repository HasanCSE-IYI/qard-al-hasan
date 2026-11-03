import {
  Loan,
  User,
  Repayment,
  DashboardSummary,
  WasiyyahReport,
  LOAN_STATUS,
  REPAYMENT_TYPE,
  PAYMENT_METHOD,
} from '@qard/shared';

const API_BASE_URL = 'http://127.0.0.1:8787/api/v1'; // লোকাল ক্লাউডফ্লেয়ার ওয়ার্কার বা রিমোট ডোমেইন

let authToken: string | null = null;

export const ApiClient = {
  setToken(token: string | null) {
    authToken = token;
  },

  getToken() {
    return authToken;
  },

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<{ success: boolean; data?: T; error?: string }> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });
      const data = await response.json();
      return data;
    } catch (err: any) {
      console.warn('Network request failed, falling back to local state:', err.message);
      return { success: false, error: 'সার্ভারে সংযোগ করা যাচ্ছে না' };
    }
  },

  // অথেনটিকেশন
  async requestOtp(phone: string) {
    return this.request<{ message: string; devOtp?: string }>('/auth/request-otp', {
      method: 'POST',
      body: JSON.stringify({ phone }),
    });
  },

  async verifyOtp(phone: string, otp: string, name?: string) {
    const res = await this.request<{ token: string; user: User }>('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ phone, otp, name }),
    });
    if (res.success && res.data) {
      this.setToken(res.data.token);
    }
    return res;
  },

  // ড্যাশবোর্ড সামারি
  async getDashboardSummary() {
    return this.request<DashboardSummary>('/dashboard/summary');
  },

  // লোন তালিকা ও বিস্তারিত
  async getLoans(type: 'all' | 'lent' | 'borrowed' = 'all') {
    return this.request<Loan[]>(`/loans?type=${type}`);
  },

  async getLoanById(id: string) {
    return this.request<Loan & { repayments: Repayment[]; guarantors: any[]; hardshipRequests: any[]; auditLogs: any[] }>(`/loans/${id}`);
  },

  async createLoan(payload: any) {
    return this.request<Loan>('/loans', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async signLoan(id: string) {
    return this.request<Loan>(`/loans/${id}/sign`, {
      method: 'POST',
    });
  },

  async requestHardship(id: string, reason: string, requestedNewDueDate: string, proposedNewInstallment?: number) {
    return this.request<{ message: string }>(`/loans/${id}/hardship`, {
      method: 'POST',
      body: JSON.stringify({ reason, requestedNewDueDate, proposedNewInstallment }),
    });
  },

  async forgiveLoan(id: string, forgivenAmount: number, isFullForgiveness: boolean, sadaqahIntentionNote?: string) {
    return this.request<{ message: string; data: any }>(`/loans/${id}/forgive`, {
      method: 'POST',
      body: JSON.stringify({ forgivenAmount, isFullForgiveness, sadaqahIntentionNote }),
    });
  },

  // পেমেন্ট রিপেমেন্ট
  async createRepayment(payload: any) {
    return this.request<Repayment>('/repayments', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async verifyRepayment(id: string, action: 'CONFIRM' | 'DISPUTE', disputeReason?: string) {
    return this.request<{ message: string; data?: any }>(`/repayments/${id}/verify`, {
      method: 'POST',
      body: JSON.stringify({ action, disputeReason }),
    });
  },

  // অসিয়তনামা
  async getWasiyyahStatement() {
    return this.request<WasiyyahReport>('/wasiyyah/statement');
  },
};

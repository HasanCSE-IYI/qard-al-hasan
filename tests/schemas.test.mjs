import test from 'node:test';
import assert from 'node:assert';
import { CreateLoanSchema, ForgiveLoanSchema, HawalaTransferSchema, CreateRepaymentSchema, LOAN_STATUS } from '../shared/dist/index.js';

test('CreateLoanSchema accepts valid Qard al-Hasan loan parameters', () => {
  const validPayload = {
    borrowerName: 'Tariq Rahman',
    borrowerPhone: '01711223344',
    principalAmount: 25000,
    currency: 'BDT',
    repaymentType: 'BULLET',
    purpose: 'Medical treatment assistance',
    startDate: '2026-11-04',
    dueDate: '2027-01-31',
    guarantors: [],
  };

  const parsed = CreateLoanSchema.safeParse(validPayload);
  assert.strictEqual(parsed.success, true);
});

test('CreateLoanSchema rejects zero or negative principal amount (Zero-Riba requirement)', () => {
  const invalidPayload = {
    borrowerName: 'Tariq Rahman',
    borrowerPhone: '01711223344',
    principalAmount: 0,
    currency: 'BDT',
    repaymentType: 'BULLET',
    purpose: 'Assistance',
    startDate: '2026-11-04',
    dueDate: '2027-01-31',
  };

  const parsed = CreateLoanSchema.safeParse(invalidPayload);
  assert.strictEqual(parsed.success, false);
});

test('ForgiveLoanSchema validates Ibra (forgiveness as charity)', () => {
  const forgivePayload = {
    loanId: 'loan-123',
    forgivenAmount: 5000,
    isFullForgiveness: false,
    sadaqahIntentionNote: 'Seeking Allah reward per Quran 2:280',
  };

  const parsed = ForgiveLoanSchema.safeParse(forgivePayload);
  assert.strictEqual(parsed.success, true);
});

test('HawalaTransferSchema validates debt liability transfer assignment', () => {
  const hawalaPayload = {
    loanId: 'loan-123',
    newBorrowerName: 'Sajid Al-Amin',
    newBorrowerPhone: '01812345678',
    consentEvidenceNote: 'Mutual agreement confirmed in writing per Hadith 2287',
  };

  const parsed = HawalaTransferSchema.safeParse(hawalaPayload);
  assert.strictEqual(parsed.success, true);
});

test('CreateRepaymentSchema validates payment parameters with MFS method', () => {
  const repaymentPayload = {
    loanId: 'loan-123',
    amount: 5000,
    paymentDate: '2026-11-09',
    paymentMethod: 'BKASH',
    transactionRef: '9B8A7C6D',
  };

  const parsed = CreateRepaymentSchema.safeParse(repaymentPayload);
  assert.strictEqual(parsed.success, true);
});

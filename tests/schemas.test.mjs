import test from 'node:test';
import assert from 'node:assert';
import { CreateLoanSchema, ForgiveLoanSchema, LOAN_STATUS } from '../shared/dist/index.js';

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

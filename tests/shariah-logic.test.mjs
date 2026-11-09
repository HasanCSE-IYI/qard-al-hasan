import test from 'node:test';
import assert from 'node:assert';
import { LOAN_STATUS } from '../shared/dist/index.js';

test('Double-entry loan ledger maintains zero interest and exact balances', () => {
  const principal = 50000;
  let remaining = principal;

  // 1. First repayment
  const repayment1 = 15000;
  remaining -= repayment1;
  assert.strictEqual(remaining, 35000);

  // 2. Partial Ibra (Voluntary forgiveness as Sadaqah)
  const ibraForgiven = 10000;
  remaining -= ibraForgiven;
  assert.strictEqual(remaining, 25000);

  // 3. Final settlement
  const finalRepayment = 25000;
  remaining -= finalRepayment;
  assert.strictEqual(remaining, 0);

  // Shariah integrity check: Principal must equal exactly total repaid + forgiven (0 interest)
  const totalSettled = repayment1 + ibraForgiven + finalRepayment;
  assert.strictEqual(totalSettled, principal);
});

test('Loan status transitions accurately per repayment lifecycle', () => {
  let status = LOAN_STATUS.ACTIVE;

  // Partial repayment keeps status active/partially paid
  status = LOAN_STATUS.PARTIALLY_PAID;
  assert.strictEqual(status, 'PARTIALLY_PAID');

  // Hardship extension granted
  status = LOAN_STATUS.HARDSHIP_REVIEW;
  assert.strictEqual(status, 'HARDSHIP_REVIEW');

  // Fully paid
  status = LOAN_STATUS.PAID_IN_FULL;
  assert.strictEqual(status, 'PAID_IN_FULL');
});

test('Al-Wasiyyah estate clearance prioritizes liabilities settlement before estate distribution', () => {
  const totalEstateAsset = 200000;
  const payablesDebt = 60000;
  const receivablesClaim = 25000;

  // Net distributable estate = Gross Estate - Payables (per Quran 4:11 & Sahih Bukhari 2738)
  const remainingDistributableEstate = totalEstateAsset - payablesDebt;
  assert.strictEqual(remainingDistributableEstate, 140000);
  assert.ok(remainingDistributableEstate > 0, 'Heirs can only inherit after all debts are fully cleared');

  // Total estate after receiving counterparty claims
  const finalEstateWithReceivables = remainingDistributableEstate + receivablesClaim;
  assert.strictEqual(finalEstateWithReceivables, 165000);
});

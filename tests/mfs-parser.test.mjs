import test from 'node:test';
import assert from 'node:assert';
import { parseMfsSms } from '../shared/dist/index.js';

test('parseMfsSms parses standard bKash received payment SMS', () => {
  const sms = 'You have received Tk 5,000.00 from 01712345678. Fee Tk 0.00. Balance Tk 15,250.00. TrxID 9A8B7C6D at 12/10/2026 14:30';
  const result = parseMfsSms(sms);

  assert.strictEqual(result.method, 'BKASH');
  assert.strictEqual(result.amount, 5000);
  assert.strictEqual(result.counterpartyPhone, '01712345678');
  assert.strictEqual(result.trxId, '9A8B7C6D');
  assert.strictEqual(result.date, '12/10/2026');
});

test('parseMfsSms parses standard Nagad cash in payment SMS', () => {
  const sms = 'Cash In of Tk 12,500.00 from 01987654321 is successful. TxnID: NAGAD8899 on 2026-11-04.';
  const result = parseMfsSms(sms);

  assert.strictEqual(result.method, 'NAGAD');
  assert.strictEqual(result.amount, 12500);
  assert.strictEqual(result.counterpartyPhone, '01987654321');
  assert.strictEqual(result.trxId, 'NAGAD8899');
  assert.strictEqual(result.date, '2026-11-04');
});

test('parseMfsSms gracefully handles non-MFS arbitrary text', () => {
  const sms = 'Hello brother, meeting tomorrow at the mosque at 4pm.';
  const result = parseMfsSms(sms);

  assert.strictEqual(result.method, null);
  assert.strictEqual(result.amount, null);
  assert.strictEqual(result.trxId, null);
});

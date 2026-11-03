/**
 * bKash, Nagad, and Rocket MFS SMS Auto-Parser
 * Extracts Transaction ID, Amount, Counterparty Phone, and Date from copied SMS text
 */

export interface ParsedMfsData {
  method: 'BKASH' | 'NAGAD' | 'ROCKET' | null;
  trxId: string | null;
  amount: number | null;
  counterpartyPhone: string | null;
  date: string | null;
  rawText: string;
}

export function parseMfsSms(text: string): ParsedMfsData {
  const clean = text.trim();
  let method: 'BKASH' | 'NAGAD' | 'ROCKET' | null = null;
  let trxId: string | null = null;
  let amount: number | null = null;
  let counterpartyPhone: string | null = null;
  let date: string | null = null;

  const lower = clean.toLowerCase();
  if (lower.includes('bkash')) {
    method = 'BKASH';
  } else if (lower.includes('nagad')) {
    method = 'NAGAD';
  } else if (lower.includes('rocket')) {
    method = 'ROCKET';
  }

  // 1. TrxID Pattern: "TrxID 9B8A7C6D" or "TxnID: 9B8A7C6D"
  const trxMatch = clean.match(/(?:TrxID|TxnID|TxId|TransID|ID)[:\s]+([A-Za-z0-9]+)/i);
  if (trxMatch) {
    trxId = trxMatch[1].trim();
  }

  // 2. Amount Pattern: "Tk 5,000.00" or "BDT 2500" or "Tk. 1,000"
  const amountMatch = clean.match(/(?:Tk\.?|BDT)\s*([\d,]+\.?\d*)/i);
  if (amountMatch) {
    amount = parseFloat(amountMatch[1].replace(/,/g, ''));
  }

  // 3. Phone Number Pattern: "from 01712345678" or "to 01912345678"
  const phoneMatch = clean.match(/(?:from|to)\s*([01][3-9]\d{8})/i);
  if (phoneMatch) {
    counterpartyPhone = phoneMatch[1].trim();
  }

  // 4. Date Pattern: "at 12/10/2026" or "on 2026-10-12"
  const dateMatch = clean.match(/(\d{2}\/\d{2}\/\d{4}|\d{4}-\d{2}-\d{2})/);
  if (dateMatch) {
    date = dateMatch[1];
  }

  return {
    method,
    trxId,
    amount,
    counterpartyPhone,
    date,
    rawText: clean,
  };
}

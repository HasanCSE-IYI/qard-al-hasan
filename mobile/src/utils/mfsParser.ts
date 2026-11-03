/**
 * বিকাশ, নগদ ও রকেট এসএমএস অটো-পার্সার
 * কপি করা ট্রানজ্যাকশন মেসেজ থেকে সরাসরি ডেটা এক্সট্র্যাক্ট করে
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

  // ১. TrxID প্যাটার্ন: "TrxID 9B8A7C6D" বা "TxnID: 9B8A7C6D"
  const trxMatch = clean.match(/(?:TrxID|TxnID|TxId|TransID|ID)[:\s]+([A-Za-z0-9]+)/i);
  if (trxMatch) {
    trxId = trxMatch[1].trim();
  }

  // ২. অ্যামাউন্ট প্যাটার্ন: "Tk 5,000.00" বা "BDT 2500" বা "Tk. 1,000"
  const amountMatch = clean.match(/(?:Tk\.?|BDT)\s*([\d,]+\.?\d*)/i);
  if (amountMatch) {
    amount = parseFloat(amountMatch[1].replace(/,/g, ''));
  }

  // ৩. ফোন নম্বর প্যাটার্ন: "from 01712345678" বা "to 01912345678"
  const phoneMatch = clean.match(/(?:from|to)\s*([01][3-9]\d{8})/i);
  if (phoneMatch) {
    counterpartyPhone = phoneMatch[1].trim();
  }

  // ৪. তারিখ প্যাটার্ন: "at 12/10/2026" বা "on 2026-10-12"
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

/**
 * Sunnah-Compliant Respectful and Gentle Reminder Helpers
 */

import { GENTLE_REMINDER_TEMPLATES } from '@qard/shared';

export function getFormattedReminderText(
  templateId: string,
  borrowerName: string,
  amount: number,
  dueDate: string
): string {
  const template = GENTLE_REMINDER_TEMPLATES.find((t) => t.id === templateId) || GENTLE_REMINDER_TEMPLATES[0];
  return template.text(borrowerName, amount, dueDate);
}

export function buildWhatsAppShareUrl(phone: string, message: string): string {
  // Standardize phone number format for WhatsApp (e.g. 017... -> 88017...)
  let cleanPhone = phone.replace(/[^0-9]/g, '');
  if (cleanPhone.startsWith('0')) {
    cleanPhone = '88' + cleanPhone;
  }
  const encodedMsg = encodeURIComponent(message);
  return `whatsapp://send?phone=${cleanPhone}&text=${encodedMsg}`;
}

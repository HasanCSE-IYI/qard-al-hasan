/**
 * সুন্নাহ সম্মত ভদ্র ও শ্রদ্ধাপূর্ণ স্মরণিকা হেল্পার
 */

import { GENTLE_REMINDER_TEMPLATES } from '@qard/shared';

export function getFormattedReminderText(
  templateId: string,
  borrowerName: string,
  amount: number,
  dueDate: string
): string {
  const template = GENTLE_REMINDER_TEMPLATES.find((t) => t.id === templateId);
  if (!template) {
    return GENTLE_REMINDER_TEMPLATES[0].text(borrowerName, amount, dueDate);
  }

  if (template.id === 'sunnah_hadith') {
    return template.text(borrowerName, amount, dueDate);
  }
  return template.text(borrowerName, amount, dueDate);
}

export function buildWhatsAppShareUrl(phone: string, message: string): string {
  // বাংলাদেশি ফোন নম্বর স্ট্যান্ডার্ডাইজেশন (017... -> 88017...)
  let cleanPhone = phone.replace(/[^0-9]/g, '');
  if (cleanPhone.startsWith('0')) {
    cleanPhone = '88' + cleanPhone;
  }
  const encodedMsg = encodeURIComponent(message);
  return `whatsapp://send?phone=${cleanPhone}&text=${encodedMsg}`;
}

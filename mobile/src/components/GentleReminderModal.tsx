import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, Linking, Alert } from 'react-native';
import { Loan, GENTLE_REMINDER_TEMPLATES } from '@qard/shared';
import { Colors } from '../theme/colors';
import { buildWhatsAppShareUrl } from '../utils/gentleReminder';

interface GentleReminderModalProps {
  visible: boolean;
  loan: Loan;
  onClose: () => void;
}

export const GentleReminderModal: React.FC<GentleReminderModalProps> = ({ visible, loan, onClose }) => {
  const [selectedTemplateId, setSelectedTemplateId] = useState(GENTLE_REMINDER_TEMPLATES[0].id);

  const activeTemplate =
    GENTLE_REMINDER_TEMPLATES.find((t) => t.id === selectedTemplateId) || GENTLE_REMINDER_TEMPLATES[0];
  const reminderMessage = activeTemplate.text(
    loan.borrowerName || 'শ্রদ্ধেয় ভাই',
    loan.installmentAmount || loan.remainingAmount,
    loan.dueDate
  );

  const handleSendWhatsApp = async () => {
    const phone = (loan as any).borrowerPhone || '01700000000';
    const url = buildWhatsAppShareUrl(phone, reminderMessage);
    const canOpen = await Linking.canOpenURL(url);

    if (canOpen) {
      await Linking.openURL(url);
      onClose();
    } else {
      Alert.alert('হোয়াটসঅ্যাপ পাওয়া যায়নি', 'আপনার ডিভাইসে WhatsApp ইনস্টল করা নেই। তবে মেসেজটি কপি করা হয়েছে: \n\n' + reminderMessage);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>সুন্নাহ সম্মত ভদ্র স্মরণিকা</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeBtn}>✕</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.subtitle}>
            ইসলামে ঋণগ্রহীতাকে সর্বদা সম্মান ও ভদ্রতার সাথে স্মরণ করিয়ে দেওয়া সুন্নাহ। কোনো প্রকার চাপ সৃষ্টি বা অপমানজনক কথা নিষিদ্ধ।
          </Text>

          {/* টেমপ্লেট নির্বাচন */}
          <Text style={styles.label}>টেমপ্লেট নির্বাচন করুন</Text>
          {GENTLE_REMINDER_TEMPLATES.map((tmpl) => (
            <TouchableOpacity
              key={tmpl.id}
              style={[styles.templateCard, selectedTemplateId === tmpl.id && styles.templateCardActive]}
              onPress={() => setSelectedTemplateId(tmpl.id)}
            >
              <Text style={[styles.templateTitle, selectedTemplateId === tmpl.id && styles.templateTitleActive]}>
                {tmpl.title}
              </Text>
            </TouchableOpacity>
          ))}

          {/* প্রিভিউ বক্স */}
          <Text style={styles.label}>মেসেজ প্রিভিউ</Text>
          <View style={styles.previewBox}>
            <Text style={styles.previewText}>{reminderMessage}</Text>
          </View>

          <TouchableOpacity style={styles.sendBtn} onPress={handleSendWhatsApp}>
            <Text style={styles.sendBtnText}>হোয়াটসঅ্যাপে পাঠান 💬</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.slate.darkest,
  },
  closeBtn: {
    fontSize: 20,
    color: Colors.slate.muted,
    padding: 4,
  },
  subtitle: {
    fontSize: 12,
    color: Colors.slate.muted,
    marginBottom: 16,
    lineHeight: 18,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.slate.dark,
    marginBottom: 8,
  },
  templateCard: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.slate.subtle,
    marginBottom: 8,
    backgroundColor: '#fff',
  },
  templateCardActive: {
    borderColor: Colors.primary.main,
    backgroundColor: Colors.primary.surface,
  },
  templateTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.slate.dark,
  },
  templateTitleActive: {
    color: Colors.primary.dark,
  },
  previewBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.slate.subtle,
    marginBottom: 16,
  },
  previewText: {
    fontSize: 13,
    color: Colors.slate.dark,
    lineHeight: 20,
  },
  sendBtn: {
    backgroundColor: '#25D366', // WhatsApp Brand Color
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  sendBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
});

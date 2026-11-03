import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { Loan, PAYMENT_METHOD, PaymentMethod } from '@qard/shared';
import { Colors } from '../theme/colors';
import { parseMfsSms } from '../utils/mfsParser';
import { useAppStore } from '../store/useAppStore';

interface PaymentModalProps {
  visible: boolean;
  loan: Loan;
  onClose: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ visible, loan, onClose }) => {
  const addRepayment = useAppStore((state) => state.addRepayment);

  const [method, setMethod] = useState<PaymentMethod>(PAYMENT_METHOD.BKASH);
  const [amount, setAmount] = useState(
    loan.installmentAmount ? loan.installmentAmount.toString() : loan.remainingAmount.toString()
  );
  const [trxId, setTrxId] = useState('');
  const [notes, setNotes] = useState('');
  const [smsClipboard, setSmsClipboard] = useState('');

  // বিকাশ/নগদ এসএমএস পেস্ট ও অটো-পার্স হ্যান্ডলার
  const handleParseSms = (text: string) => {
    setSmsClipboard(text);
    if (!text.trim()) return;

    const parsed = parseMfsSms(text);
    if (parsed.amount) {
      setAmount(parsed.amount.toString());
    }
    if (parsed.trxId) {
      setTrxId(parsed.trxId);
    }
    if (parsed.method) {
      setMethod(parsed.method);
    }
    Alert.alert('এসএমএস পার্স সফল', `টাকা: ৳${parsed.amount || 'অনির্দিষ্ট'}, TrxID: ${parsed.trxId || 'অনির্দিষ্ট'}`);
  };

  const handlePaymentSubmit = () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      Alert.alert('ত্রুটি', 'সঠিক টাকার পরিমাণ লিখুন');
      return;
    }

    if (numAmount > loan.remainingAmount) {
      Alert.alert('ত্রুটি', `পরিশোধের পরিমাণ অবশিষ্ট বকেয়া (৳${loan.remainingAmount}) থেকে বেশি হতে পারে না`);
      return;
    }

    const newRepayment = {
      id: `rep-${Date.now()}`,
      loanId: loan.id,
      amount: numAmount,
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMethod: method,
      transactionRef: trxId || null,
      status: 'CONFIRMED' as const,
      notes: notes || null,
      createdAt: new Date().toISOString(),
    };

    addRepayment(newRepayment);
    Alert.alert('আলহামদুলিল্লাহ', 'কিস্তি পরিশোধের রেকর্ড সফলভাবে সংরক্ষিত হয়েছে।');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>কর্জ পরিশোধ এন্ট্রি</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeBtn}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.dueInfoBox}>
              <Text style={styles.dueLabel}>অবশিষ্ট মোট বকেয়া:</Text>
              <Text style={styles.dueAmount}>৳ {loan.remainingAmount.toLocaleString('en-IN')}</Text>
            </View>

            {/* এসএমএস অটো-পার্সার বক্স */}
            <View style={styles.smsBox}>
              <Text style={styles.smsBoxTitle}>📱 বিকাশ / নগদ SMS অটো-ফিল্টার</Text>
              <TextInput
                style={styles.smsInput}
                placeholder="বিকাশ বা নগদ থেকে প্রাপ্ত এসএমএস এখানে পেস্ট করুন..."
                placeholderTextColor={Colors.slate.light}
                value={smsClipboard}
                onChangeText={handleParseSms}
                multiline
              />
            </View>

            {/* পেমেন্ট মেথড সিলেক্টর */}
            <Text style={styles.label}>পেমেন্ট মাধ্যম</Text>
            <View style={styles.methodsRow}>
              {[
                { id: PAYMENT_METHOD.BKASH, label: 'বিকাশ' },
                { id: PAYMENT_METHOD.NAGAD, label: 'নগদ' },
                { id: PAYMENT_METHOD.BANK_TRANSFER, label: 'ব্যাংক' },
                { id: PAYMENT_METHOD.CASH, label: 'ক্যাশ' },
              ].map((m) => (
                <TouchableOpacity
                  key={m.id}
                  style={[styles.methodChip, method === m.id && styles.methodChipActive]}
                  onPress={() => setMethod(m.id as PaymentMethod)}
                >
                  <Text style={[styles.methodText, method === m.id && styles.methodTextActive]}>
                    {m.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* অ্যামাউন্ট ইনপুট */}
            <Text style={styles.label}>পরিশোধকৃত টাকার পরিমাণ (টাকা)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              placeholder="টাকার পরিমাণ লিখুন"
              placeholderTextColor={Colors.slate.light}
              value={amount}
              onChangeText={setAmount}
            />

            {/* TrxID ইনপুট */}
            <Text style={styles.label}>ট্রানজ্যাকশন আইডি (TrxID / স্লিপ নম্বর)</Text>
            <TextInput
              style={styles.input}
              placeholder="যেমন: 9B8A7C6D (যদি থাকে)"
              placeholderTextColor={Colors.slate.light}
              value={trxId}
              onChangeText={setTrxId}
              autoCapitalize="characters"
            />

            {/* নোট */}
            <Text style={styles.label}>মন্তব্য বা নোট (ঐচ্ছিক)</Text>
            <TextInput
              style={styles.input}
              placeholder="যেমন: নভেম্বর মাসের কিস্তি"
              placeholderTextColor={Colors.slate.light}
              value={notes}
              onChangeText={setNotes}
            />

            <TouchableOpacity style={styles.submitBtn} onPress={handlePaymentSubmit}>
              <Text style={styles.submitBtnText}>পরিশোধ নিশ্চিত করুন 🤲</Text>
            </TouchableOpacity>
          </ScrollView>
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
    marginBottom: 16,
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
  dueInfoBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.primary.surface,
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  dueLabel: {
    fontSize: 13,
    color: Colors.primary.dark,
    fontWeight: '600',
  },
  dueAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primary.dark,
  },
  smsBox: {
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  smsBoxTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.slate.dark,
    marginBottom: 6,
  },
  smsInput: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 8,
    fontSize: 12,
    color: Colors.slate.darkest,
    minHeight: 50,
    textAlignVertical: 'top',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.slate.dark,
    marginBottom: 6,
  },
  methodsRow: {
    flexDirection: 'row',
    marginBottom: 14,
    gap: 8,
  },
  methodChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.slate.subtle,
    alignItems: 'center',
  },
  methodChipActive: {
    backgroundColor: Colors.primary.main,
    borderColor: Colors.primary.main,
  },
  methodText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.slate.dark,
  },
  methodTextActive: {
    color: '#fff',
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.slate.subtle,
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: Colors.slate.darkest,
    marginBottom: 14,
  },
  submitBtn: {
    backgroundColor: Colors.primary.main,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});

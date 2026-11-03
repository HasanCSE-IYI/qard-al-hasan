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

  // bKash / Nagad SMS auto-parse handler
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
    Alert.alert('SMS Parsed Successfully', `Amount: BDT ${parsed.amount || 'N/A'}, TrxID: ${parsed.trxId || 'N/A'}`);
  };

  const handlePaymentSubmit = () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      Alert.alert('Error', 'Please enter a valid repayment amount');
      return;
    }

    if (numAmount > loan.remainingAmount) {
      Alert.alert('Error', `Repayment cannot exceed remaining balance (BDT ${loan.remainingAmount})`);
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
    Alert.alert('Alhamdulillah', 'Repayment record saved successfully.');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Record Repayment</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeBtn}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.dueInfoBox}>
              <Text style={styles.dueLabel}>Remaining Total Balance:</Text>
              <Text style={styles.dueAmount}>BDT {loan.remainingAmount.toLocaleString('en-US')}</Text>
            </View>

            {/* SMS Auto-Parser Box */}
            <View style={styles.smsBox}>
              <Text style={styles.smsBoxTitle}>📱 bKash / Nagad SMS Auto-Parser</Text>
              <TextInput
                style={styles.smsInput}
                placeholder="Paste transaction SMS from bKash or Nagad here..."
                placeholderTextColor={Colors.slate.light}
                value={smsClipboard}
                onChangeText={handleParseSms}
                multiline
              />
            </View>

            {/* Payment Method Selector */}
            <Text style={styles.label}>Payment Method</Text>
            <View style={styles.methodsRow}>
              {[
                { id: PAYMENT_METHOD.BKASH, label: 'bKash' },
                { id: PAYMENT_METHOD.NAGAD, label: 'Nagad' },
                { id: PAYMENT_METHOD.BANK_TRANSFER, label: 'Bank' },
                { id: PAYMENT_METHOD.CASH, label: 'Cash' },
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

            {/* Amount Input */}
            <Text style={styles.label}>Repayment Amount (BDT)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              placeholder="Enter repayment amount"
              placeholderTextColor={Colors.slate.light}
              value={amount}
              onChangeText={setAmount}
            />

            {/* TrxID Input */}
            <Text style={styles.label}>Transaction ID (TrxID / Receipt No)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 9B8A7C6D (if available)"
              placeholderTextColor={Colors.slate.light}
              value={trxId}
              onChangeText={setTrxId}
              autoCapitalize="characters"
            />

            {/* Notes */}
            <Text style={styles.label}>Notes or Memo (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. November installment payment"
              placeholderTextColor={Colors.slate.light}
              value={notes}
              onChangeText={setNotes}
            />

            <TouchableOpacity style={styles.submitBtn} onPress={handlePaymentSubmit}>
              <Text style={styles.submitBtnText}>Confirm Repayment 🤲</Text>
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

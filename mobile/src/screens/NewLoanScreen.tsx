import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Colors } from '../theme/colors';
import { useAppStore } from '../store/useAppStore';
import { REPAYMENT_TYPE, LOAN_STATUS, RepaymentType, Loan } from '@qard/shared';

interface NewLoanScreenProps {
  onBack: () => void;
  onSuccess: (newLoan: Loan) => void;
}

export const NewLoanScreen: React.FC<NewLoanScreenProps> = ({ onBack, onSuccess }) => {
  const user = useAppStore((state) => state.user);
  const addLoan = useAppStore((state) => state.addLoan);

  const [borrowerName, setBorrowerName] = useState('');
  const [borrowerPhone, setBorrowerPhone] = useState('');
  const [principalAmount, setPrincipalAmount] = useState('');
  const [repaymentType, setRepaymentType] = useState<RepaymentType>(REPAYMENT_TYPE.MONTHLY_INSTALLMENT);
  const [installmentCount, setInstallmentCount] = useState('5');
  const [purpose, setPurpose] = useState('');
  const [dueDate, setDueDate] = useState('2026-12-31');
  const [witnessName, setWitnessName] = useState('');
  const [witnessPhone, setWitnessPhone] = useState('');

  const calculatedInstallmentAmount =
    repaymentType === REPAYMENT_TYPE.MONTHLY_INSTALLMENT &&
    parseFloat(principalAmount) > 0 &&
    parseInt(installmentCount) > 0
      ? Math.round(parseFloat(principalAmount) / parseInt(installmentCount))
      : 0;

  const handleSubmit = () => {
    if (!borrowerName.trim()) {
      Alert.alert('Error', 'Please enter borrower name');
      return;
    }
    if (!borrowerPhone.trim() || borrowerPhone.length < 10) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return;
    }
    const principal = parseFloat(principalAmount);
    if (isNaN(principal) || principal <= 0) {
      Alert.alert('Error', 'Please enter a valid loan amount');
      return;
    }
    if (!purpose.trim()) {
      Alert.alert('Error', 'Please specify the loan purpose');
      return;
    }

    const newLoanId = `loan-${Date.now()}`;
    const newLoan: Loan = {
      id: newLoanId,
      lenderId: user?.id || 'user-001',
      borrowerId: `borrower-${Date.now().toString().slice(-4)}`,
      lenderName: user?.name || 'Mahmud al Hasan',
      lenderPhone: user?.phone || '01711223344',
      borrowerName,
      borrowerPhone,
      principalAmount: principal,
      remainingAmount: principal,
      currency: 'BDT',
      repaymentType,
      installmentCount: repaymentType === REPAYMENT_TYPE.MONTHLY_INSTALLMENT ? parseInt(installmentCount) : 1,
      installmentAmount:
        repaymentType === REPAYMENT_TYPE.MONTHLY_INSTALLMENT ? calculatedInstallmentAmount : principal,
      purpose,
      status: LOAN_STATUS.ACTIVE,
      startDate: new Date().toISOString().split('T')[0],
      dueDate,
      revId: 1,
      contractHash: `sha256-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addLoan(newLoan);
    Alert.alert('Loan Created', 'Qard al-Hasan loan agreement recorded and created successfully.');
    onSuccess(newLoan);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Text style={styles.backBtnText}>‹ Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Qard al-Hasan</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Shariah Guidance Notice */}
        <View style={styles.shariahNotice}>
          <Text style={styles.shariahNoticeTitle}>Quranic Injunction (Surah Al-Baqarah: 282)</Text>
          <Text style={styles.shariahNoticeText}>
            When you contract a debt for a specified term, record it in writing with witnesses. This loan is 100% free from any interest or fees.
          </Text>
        </View>

        {/* Borrower Info */}
        <Text style={styles.sectionHeading}>1. Borrower Information</Text>
        <Text style={styles.label}>Borrower Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Abdullah Al-Mansur"
          placeholderTextColor={Colors.slate.light}
          value={borrowerName}
          onChangeText={setBorrowerName}
        />

        <Text style={styles.label}>Mobile Phone Number *</Text>
        <TextInput
          style={styles.input}
          placeholder="01711XXXXXX"
          placeholderTextColor={Colors.slate.light}
          keyboardType="phone-pad"
          value={borrowerPhone}
          onChangeText={setBorrowerPhone}
        />

        {/* Loan Details */}
        <Text style={styles.sectionHeading}>2. Loan Amount & Repayment Mode</Text>
        <Text style={styles.label}>Principal Amount (BDT) *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. 25000"
          placeholderTextColor={Colors.slate.light}
          keyboardType="numeric"
          value={principalAmount}
          onChangeText={setPrincipalAmount}
        />

        <Text style={styles.label}>Repayment Type</Text>
        <View style={styles.typeRow}>
          <TouchableOpacity
            style={[styles.typeBtn, repaymentType === REPAYMENT_TYPE.MONTHLY_INSTALLMENT && styles.typeBtnActive]}
            onPress={() => setRepaymentType(REPAYMENT_TYPE.MONTHLY_INSTALLMENT)}
          >
            <Text
              style={[
                styles.typeText,
                repaymentType === REPAYMENT_TYPE.MONTHLY_INSTALLMENT && styles.typeTextActive,
              ]}
            >
              Monthly Installments
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.typeBtn, repaymentType === REPAYMENT_TYPE.BULLET && styles.typeBtnActive]}
            onPress={() => setRepaymentType(REPAYMENT_TYPE.BULLET)}
          >
            <Text style={[styles.typeText, repaymentType === REPAYMENT_TYPE.BULLET && styles.typeTextActive]}>
              Lump-Sum Payment
            </Text>
          </TouchableOpacity>
        </View>

        {repaymentType === REPAYMENT_TYPE.MONTHLY_INSTALLMENT ? (
          <View style={styles.installmentCalcBox}>
            <Text style={styles.label}>Number of Installments</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 5"
              placeholderTextColor={Colors.slate.light}
              keyboardType="numeric"
              value={installmentCount}
              onChangeText={setInstallmentCount}
            />
            {calculatedInstallmentAmount > 0 ? (
              <Text style={styles.calcResult}>
                Installment Amount: BDT {calculatedInstallmentAmount.toLocaleString('en-US')} (Zero-Interest)
              </Text>
            ) : null}
          </View>
        ) : null}

        <Text style={styles.label}>Final Due Date (YYYY-MM-DD)</Text>
        <TextInput
          style={styles.input}
          value={dueDate}
          onChangeText={setDueDate}
          placeholder="2026-12-31"
          placeholderTextColor={Colors.slate.light}
        />

        <Text style={styles.label}>Specific Loan Purpose *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Emergency medical care / inventory purchase"
          placeholderTextColor={Colors.slate.light}
          value={purpose}
          onChangeText={setPurpose}
        />

        {/* Witness / Guarantor */}
        <Text style={styles.sectionHeading}>3. Witness or Guarantor (Optional)</Text>
        <Text style={styles.label}>Witness Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter witness name"
          placeholderTextColor={Colors.slate.light}
          value={witnessName}
          onChangeText={setWitnessName}
        />

        <Text style={styles.label}>Witness Phone Number</Text>
        <TextInput
          style={styles.input}
          placeholder="01811XXXXXX"
          placeholderTextColor={Colors.slate.light}
          keyboardType="phone-pad"
          value={witnessPhone}
          onChangeText={setWitnessPhone}
        />

        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
          <Text style={styles.submitBtnText}>Create Contract & Record Loan ✍️</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.slate.subtle,
  },
  backBtn: {
    padding: 6,
  },
  backBtnText: {
    fontSize: 14,
    color: Colors.slate.muted,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.slate.darkest,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  shariahNotice: {
    backgroundColor: Colors.primary.surface,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.primary.border,
    marginBottom: 20,
  },
  shariahNoticeTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary.dark,
    marginBottom: 4,
  },
  shariahNoticeText: {
    fontSize: 11,
    color: Colors.primary.dark,
    lineHeight: 16,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.slate.darkest,
    marginTop: 10,
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.slate.dark,
    marginBottom: 6,
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
  typeRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  typeBtn: {
    flex: 1,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.slate.subtle,
    borderRadius: 10,
    alignItems: 'center',
  },
  typeBtnActive: {
    backgroundColor: Colors.primary.main,
    borderColor: Colors.primary.main,
  },
  typeText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.slate.dark,
  },
  typeTextActive: {
    color: '#fff',
  },
  installmentCalcBox: {
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 10,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Colors.slate.subtle,
  },
  calcResult: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary.main,
    marginTop: 4,
  },
  submitBtn: {
    backgroundColor: Colors.primary.main,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 14,
    marginBottom: 20,
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});

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
      Alert.alert('ত্রুটি', 'ঋণগ্রহীতার নাম প্রদান করুন');
      return;
    }
    if (!borrowerPhone.trim() || borrowerPhone.length < 11) {
      Alert.alert('ত্রুটি', 'সঠিক মোবাইল নম্বর (১১ ডিজিট) দিন');
      return;
    }
    const principal = parseFloat(principalAmount);
    if (isNaN(principal) || principal <= 0) {
      Alert.alert('ত্রুটি', 'সঠিক টাকার পরিমাণ লিখুন');
      return;
    }
    if (!purpose.trim()) {
      Alert.alert('ত্রুটি', 'কর্জের উদ্দেশ্য উল্লেখ করুন');
      return;
    }

    const newLoanId = `loan-${Date.now()}`;
    const newLoan: Loan = {
      id: newLoanId,
      lenderId: user?.id || 'user-001',
      borrowerId: `borrower-${Date.now().toString().slice(-4)}`,
      lenderName: user?.name || 'মাহমুদুল হাসান',
      borrowerName,
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
    Alert.alert('চুক্তি সফল', 'কর্জ্যে হাসানাহ রেকর্ড ও ডিজিটাল চুক্তি সফলভাবে তৈরি হয়েছে।');
    onSuccess(newLoan);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Text style={styles.backBtnText}>‹ বাতিল</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>নতুন কর্জ্যে হাসানাহ</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* শরীয়াহ বার্তা */}
        <View style={styles.shariahNotice}>
          <Text style={styles.shariahNoticeTitle}>পবিত্র কুরআনের নির্দেশ (সূরা বাক্বারাহ: ২৮২)</Text>
          <Text style={styles.shariahNoticeText}>
            লেনদেন নির্দিষ্ট মেয়াদের জন্য হলে তা পুঙ্খানুপুঙ্খ লিখে রাখা ও সাক্ষী রাখা আবশ্যক। এটি কোনো প্রকার সুদ বা অতিরিক্ত ফি মুক্ত।
          </Text>
        </View>

        {/* গ্রহীতার তথ্য */}
        <Text style={styles.sectionHeading}>১. ঋণগ্রহীতার তথ্য</Text>
        <Text style={styles.label}>গ্রহীতার নাম *</Text>
        <TextInput
          style={styles.input}
          placeholder="যেমন: হাফেজ আব্দুল্লাহ"
          placeholderTextColor={Colors.slate.light}
          value={borrowerName}
          onChangeText={setBorrowerName}
        />

        <Text style={styles.label}>মোবাইল নম্বর *</Text>
        <TextInput
          style={styles.input}
          placeholder="01711XXXXXX"
          placeholderTextColor={Colors.slate.light}
          keyboardType="phone-pad"
          value={borrowerPhone}
          onChangeText={setBorrowerPhone}
        />

        {/* কর্জের বিবরণ */}
        <Text style={styles.sectionHeading}>২. কর্জের পরিমাণ ও পরিশোধ পদ্ধতি</Text>
        <Text style={styles.label}>মূল ঋণের পরিমাণ (টাকা) *</Text>
        <TextInput
          style={styles.input}
          placeholder="যেমন: 25000"
          placeholderTextColor={Colors.slate.light}
          keyboardType="numeric"
          value={principalAmount}
          onChangeText={setPrincipalAmount}
        />

        <Text style={styles.label}>পরিশোধের ধরন</Text>
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
              মাসিক কিস্তি
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.typeBtn, repaymentType === REPAYMENT_TYPE.BULLET && styles.typeBtnActive]}
            onPress={() => setRepaymentType(REPAYMENT_TYPE.BULLET)}
          >
            <Text style={[styles.typeText, repaymentType === REPAYMENT_TYPE.BULLET && styles.typeTextActive]}>
              এককালীন পরিশোধ
            </Text>
          </TouchableOpacity>
        </View>

        {repaymentType === REPAYMENT_TYPE.MONTHLY_INSTALLMENT ? (
          <View style={styles.installmentCalcBox}>
            <Text style={styles.label}>কিস্তির সংখ্যা</Text>
            <TextInput
              style={styles.input}
              placeholder="যেমন: 5"
              placeholderTextColor={Colors.slate.light}
              keyboardType="numeric"
              value={installmentCount}
              onChangeText={setInstallmentCount}
            />
            {calculatedInstallmentAmount > 0 ? (
              <Text style={styles.calcResult}>
                প্রতি কিস্তির পরিমাণ: ৳ {calculatedInstallmentAmount.toLocaleString('en-IN')} (সুদহীন)
              </Text>
            ) : null}
          </View>
        ) : null}

        <Text style={styles.label}>পরিশোধের শেষ তারিখ (YYYY-MM-DD)</Text>
        <TextInput
          style={styles.input}
          value={dueDate}
          onChangeText={setDueDate}
          placeholder="2026-12-31"
          placeholderTextColor={Colors.slate.light}
        />

        <Text style={styles.label}>কর্জের সুনির্দিষ্ট উদ্দেশ্য *</Text>
        <TextInput
          style={styles.input}
          placeholder="যেমন: চিকিৎসা ব্যয় / ব্যবসায়িক কাঁচামাল ক্রয়"
          placeholderTextColor={Colors.slate.light}
          value={purpose}
          onChangeText={setPurpose}
        />

        {/* সাক্ষী/জামিনদার */}
        <Text style={styles.sectionHeading}>৩. সাক্ষী বা জামিনদার (ঐচ্ছিক)</Text>
        <Text style={styles.label}>সাক্ষীর নাম</Text>
        <TextInput
          style={styles.input}
          placeholder="সাক্ষীর নাম লিখুন"
          placeholderTextColor={Colors.slate.light}
          value={witnessName}
          onChangeText={setWitnessName}
        />

        <Text style={styles.label}>সাক্ষীর মোবাইল নম্বর</Text>
        <TextInput
          style={styles.input}
          placeholder="01811XXXXXX"
          placeholderTextColor={Colors.slate.light}
          keyboardType="phone-pad"
          value={witnessPhone}
          onChangeText={setWitnessPhone}
        />

        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
          <Text style={styles.submitBtnText}>চুক্তিপত্র তৈরি ও কর্জ লিপিবদ্ধ করুন ✍️</Text>
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

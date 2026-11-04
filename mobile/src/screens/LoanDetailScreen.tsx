import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Loan, LOAN_STATUS } from '@qard/shared';
import { Colors } from '../theme/colors';
import { useAppStore } from '../store/useAppStore';
import { PaymentModal } from '../components/PaymentModal';
import { GentleReminderModal } from '../components/GentleReminderModal';
import { IbraModal } from '../components/IbraModal';
import { AqdContractModal } from '../components/AqdContractModal';
import { RescheduleModal } from '../components/RescheduleModal';

interface LoanDetailScreenProps {
  loan: Loan;
  onBack: () => void;
}

export const LoanDetailScreen: React.FC<LoanDetailScreenProps> = ({ loan: initialLoan, onBack }) => {
  const user = useAppStore((state) => state.user);
  const loans = useAppStore((state) => state.loans);
  const grantHardshipExtension = useAppStore((state) => state.grantHardshipExtension);

  // Read updated loan record from live state
  const loan = loans.find((l) => l.id === initialLoan.id) || initialLoan;

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [showIbraModal, setShowIbraModal] = useState(false);
  const [showAqdModal, setShowAqdModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);

  const isLender = loan.lenderId === user?.id;
  const isBorrower = loan.borrowerId === user?.id;
  const paidAmount = loan.principalAmount - loan.remainingAmount;
  const progressPercent = Math.min(100, Math.round((paidAmount / (loan.principalAmount || 1)) * 100));

  const handleGrantHardship = () => {
    setShowRescheduleModal(true);
  };

  const handleConfirmReschedule = (newDate: string, reason: string) => {
    grantHardshipExtension(loan.id, newDate);
    Alert.alert(
      'Grace Period Granted (Inzar)',
      `Loan term extended until ${newDate}.\nReason: ${reason}\n\n"And if someone is in hardship, then let there be postponement until ease." (Quran 2:280)`
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Text style={styles.backBtnText}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Loan Details</Text>
        <TouchableOpacity onPress={() => setShowAqdModal(true)}>
          <Text style={styles.aqdIcon}>📄 Contract</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Top Hero Card */}
        <View style={styles.heroCard}>
          <Text style={styles.heroRole}>{isLender ? 'Borrower' : 'Lender'}</Text>
          <Text style={styles.heroName}>{isLender ? loan.borrowerName : loan.lenderName}</Text>
          <Text style={styles.heroPurpose}>Purpose: {loan.purpose}</Text>

          <View style={styles.heroAmountsRow}>
            <View>
              <Text style={styles.heroLabel}>Principal Loan</Text>
              <Text style={styles.heroVal}>BDT {loan.principalAmount.toLocaleString('en-US')}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.heroLabel}>Remaining Balance</Text>
              <Text style={[styles.heroVal, styles.remainingVal]}>
                BDT {loan.remainingAmount.toLocaleString('en-US')}
              </Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
          </View>
          <Text style={styles.progressText}>{progressPercent}% principal repaid</Text>
        </View>

        {/* Priority Actions & Shariah Options */}
        <Text style={styles.sectionHeading}>Services & Shariah Actions</Text>
        <View style={styles.actionGrid}>
          {loan.remainingAmount > 0 ? (
            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: Colors.primary.surface }]}
              onPress={() => setShowPaymentModal(true)}
            >
              <Text style={styles.actionCardIcon}>💳</Text>
              <Text style={[styles.actionCardTitle, { color: Colors.primary.dark }]}>
                Record Repayment
              </Text>
              <Text style={styles.actionCardSub}>Log bKash / Nagad / Cash payment</Text>
            </TouchableOpacity>
          ) : null}

          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: '#F8FAFC' }]}
            onPress={() => setShowAqdModal(true)}
          >
            <Text style={styles.actionCardIcon}>📜</Text>
            <Text style={[styles.actionCardTitle, { color: Colors.slate.darkest }]}>Digital Aqd Contract</Text>
            <Text style={styles.actionCardSub}>Surah Al-Baqarah 282 deed</Text>
          </TouchableOpacity>

          {isLender && loan.remainingAmount > 0 ? (
            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: '#F5F3FF' }]}
              onPress={() => setShowIbraModal(true)}
            >
              <Text style={styles.actionCardIcon}>🤲</Text>
              <Text style={[styles.actionCardTitle, { color: '#6D28D9' }]}>Debt Forgiveness (Sadaqah)</Text>
              <Text style={styles.actionCardSub}>Forgive for the pleasure of Allah</Text>
            </TouchableOpacity>
          ) : null}

          {isLender && loan.remainingAmount > 0 ? (
            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: '#ECFDF5' }]}
              onPress={() => setShowReminderModal(true)}
            >
              <Text style={styles.actionCardIcon}>💬</Text>
              <Text style={[styles.actionCardTitle, { color: '#047857' }]}>Gentle Reminder</Text>
              <Text style={styles.actionCardSub}>Sunnah-compliant notification</Text>
            </TouchableOpacity>
          ) : null}

          {isLender && (
            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: '#FFFBEB' }]}
              onPress={handleGrantHardship}
            >
              <Text style={styles.actionCardIcon}>⏳</Text>
              <Text style={[styles.actionCardTitle, { color: '#B45309' }]}>Grant Grace Period (Inzar)</Text>
              <Text style={styles.actionCardSub}>Extend term without penalty</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Contract Terms */}
        <Text style={styles.sectionHeading}>Contract Terms & Conditions</Text>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoKey}>Start Date:</Text>
            <Text style={styles.infoVal}>{loan.startDate}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoKey}>Final Due Date:</Text>
            <Text style={[styles.infoVal, { color: Colors.accent.gold, fontWeight: '700' }]}>
              {loan.dueDate}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoKey}>Repayment Structure:</Text>
            <Text style={styles.infoVal}>
              {loan.repaymentType === 'MONTHLY_INSTALLMENT'
                ? `Monthly installments (BDT ${loan.installmentAmount} / term)`
                : 'Lump-sum repayment'}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoKey}>Interest Rate (Riba):</Text>
            <Text style={[styles.infoVal, { color: Colors.primary.main, fontWeight: '700' }]}>
              0.0% (100% Zero-Riba)
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Modals */}
      {showPaymentModal ? (
        <PaymentModal visible={showPaymentModal} loan={loan} onClose={() => setShowPaymentModal(false)} />
      ) : null}
      {showReminderModal ? (
        <GentleReminderModal visible={showReminderModal} loan={loan} onClose={() => setShowReminderModal(false)} />
      ) : null}
      {showIbraModal ? (
        <IbraModal visible={showIbraModal} loan={loan} onClose={() => setShowIbraModal(false)} />
      ) : null}
      {showAqdModal ? (
        <AqdContractModal visible={showAqdModal} loan={loan} onClose={() => setShowAqdModal(false)} />
      ) : null}
      {showRescheduleModal ? (
        <RescheduleModal
          visible={showRescheduleModal}
          onClose={() => setShowRescheduleModal(false)}
          currentDueDate={loan.dueDate}
          onConfirm={handleConfirmReschedule}
        />
      ) : null}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background.light,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
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
    fontSize: 16,
    fontWeight: '700',
    color: Colors.slate.darkest,
  },
  aqdIcon: {
    fontSize: 13,
    color: Colors.primary.main,
    fontWeight: '700',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  heroCard: {
    backgroundColor: Colors.primary.dark,
    borderRadius: 18,
    padding: 20,
    marginBottom: 20,
  },
  heroRole: {
    fontSize: 11,
    color: '#A7F3D0',
    textTransform: 'uppercase',
  },
  heroName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  heroPurpose: {
    fontSize: 13,
    color: '#D1FAE5',
    marginBottom: 16,
  },
  heroAmountsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  heroLabel: {
    fontSize: 12,
    color: '#A7F3D0',
    marginBottom: 2,
  },
  heroVal: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  remainingVal: {
    color: '#FDE68A',
  },
  progressBarBg: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 11,
    color: '#A7F3D0',
    textAlign: 'right',
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.slate.darkest,
    marginBottom: 12,
  },
  actionGrid: {
    gap: 10,
    marginBottom: 20,
  },
  actionCard: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.slate.subtle,
  },
  actionCardIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  actionCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  actionCardSub: {
    fontSize: 11,
    color: Colors.slate.muted,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.slate.subtle,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  infoKey: {
    fontSize: 13,
    color: Colors.slate.muted,
  },
  infoVal: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.slate.darkest,
  },
});

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

interface LoanDetailScreenProps {
  loan: Loan;
  onBack: () => void;
}

export const LoanDetailScreen: React.FC<LoanDetailScreenProps> = ({ loan: initialLoan, onBack }) => {
  const user = useAppStore((state) => state.user);
  const loans = useAppStore((state) => state.loans);
  const grantHardshipExtension = useAppStore((state) => state.grantHardshipExtension);

  // লাইভ স্টেট থেকে লোনের আপডেটেড ডাটা রিড
  const loan = loans.find((l) => l.id === initialLoan.id) || initialLoan;

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [showIbraModal, setShowIbraModal] = useState(false);
  const [showAqdModal, setShowAqdModal] = useState(false);

  const isLender = loan.lenderId === user?.id;
  const isBorrower = loan.borrowerId === user?.id;
  const paidAmount = loan.principalAmount - loan.remainingAmount;
  const progressPercent = Math.min(100, Math.round((paidAmount / (loan.principalAmount || 1)) * 100));

  const handleGrantHardship = () => {
    Alert.prompt
      ? Alert.prompt(
          'অবকাশ (Inzar al-Mu\'sir) মঞ্জুর',
          'নতুন পরিশোধের তারিখ লিখুন (YYYY-MM-DD):',
          [
            { text: 'বাতিল', style: 'cancel' },
            {
              text: 'মঞ্জুর করুন',
              onPress: (newDate?: string) => {
                if (newDate && newDate.trim()) {
                  grantHardshipExtension(loan.id, newDate.trim());
                  Alert.alert('সফল', `পরিশোধের মেয়াদ ${newDate} পর্যন্ত বৃদ্ধি করা হয়েছে।`);
                }
              },
            },
          ],
          'plain-text',
          '2027-01-31'
        )
      : Alert.alert('অবকাশ মঞ্জুর', 'মেয়াদ বৃদ্ধি করা হয়েছে।');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Text style={styles.backBtnText}>‹ ফিরে যান</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>কর্জের বিস্তারিত বিবরণ</Text>
        <TouchableOpacity onPress={() => setShowAqdModal(true)}>
          <Text style={styles.aqdIcon}>📄 চুক্তি</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* টপ কার্ড */}
        <View style={styles.heroCard}>
          <Text style={styles.heroRole}>{isLender ? 'কর্জ গ্রহীতা' : 'কর্জ দাতা'}</Text>
          <Text style={styles.heroName}>{isLender ? loan.borrowerName : loan.lenderName}</Text>
          <Text style={styles.heroPurpose}>উদ্দেশ্য: {loan.purpose}</Text>

          <View style={styles.heroAmountsRow}>
            <View>
              <Text style={styles.heroLabel}>মূল কর্জ</Text>
              <Text style={styles.heroVal}>৳ {loan.principalAmount.toLocaleString('en-IN')}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.heroLabel}>অবশিষ্ট বাকি</Text>
              <Text style={[styles.heroVal, styles.remainingVal]}>
                ৳ {loan.remainingAmount.toLocaleString('en-IN')}
              </Text>
            </View>
          </View>

          {/* প্রগ্রেস বার */}
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
          </View>
          <Text style={styles.progressText}>{progressPercent}% মূলধন পরিশোধিত</Text>
        </View>

        {/* জরুরি অ্যাকশনসমূহ */}
        <Text style={styles.sectionHeading}>জরুরি সেবা ও শরীয়াহ অ্যাকশন</Text>
        <View style={styles.actionGrid}>
          {loan.remainingAmount > 0 ? (
            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: Colors.primary.surface }]}
              onPress={() => setShowPaymentModal(true)}
            >
              <Text style={styles.actionCardIcon}>💳</Text>
              <Text style={[styles.actionCardTitle, { color: Colors.primary.dark }]}>
                কিস্তি পরিশোধ এন্ট্রি
              </Text>
              <Text style={styles.actionCardSub}>বিকাশ/নগদ/ক্যাশ জমা দিন</Text>
            </TouchableOpacity>
          ) : null}

          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: '#F8FAFC' }]}
            onPress={() => setShowAqdModal(true)}
          >
            <Text style={styles.actionCardIcon}>📜</Text>
            <Text style={[styles.actionCardTitle, { color: Colors.slate.darkest }]}>ডিজিটাল চুক্তিপত্র</Text>
            <Text style={styles.actionCardSub}>সূরা বাক্বারাহ ২৮২ সনদ</Text>
          </TouchableOpacity>

          {isLender && loan.remainingAmount > 0 ? (
            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: '#F5F3FF' }]}
              onPress={() => setShowIbraModal(true)}
            >
              <Text style={styles.actionCardIcon}>🤲</Text>
              <Text style={[styles.actionCardTitle, { color: '#6D28D9' }]}>ঋণ মওকুফ (সদকাহ)</Text>
              <Text style={styles.actionCardSub}>আল্লাহর সন্তুষ্টিতে মাফ</Text>
            </TouchableOpacity>
          ) : null}

          {isLender && loan.remainingAmount > 0 ? (
            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: '#ECFDF5' }]}
              onPress={() => setShowReminderModal(true)}
            >
              <Text style={styles.actionCardIcon}>💬</Text>
              <Text style={[styles.actionCardTitle, { color: '#047857' }]}>ভদ্র স্মরণিকা</Text>
              <Text style={styles.actionCardSub}>সুন্নাহসম্মত রিমাইন্ডার</Text>
            </TouchableOpacity>
          ) : null}

          {isLender && (
            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: '#FFFBEB' }]}
              onPress={handleGrantHardship}
            >
              <Text style={styles.actionCardIcon}>⏳</Text>
              <Text style={[styles.actionCardTitle, { color: '#B45309' }]}>অবকাশ মঞ্জুর (ইনযার)</Text>
              <Text style={styles.actionCardSub}>সংকটাপন্নকে সময় বৃদ্ধি</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* শর্তাবলি ও তারিখ */}
        <Text style={styles.sectionHeading}>চুক্তির শর্তাবলি</Text>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoKey}>শুরুর তারিখ:</Text>
            <Text style={styles.infoVal}>{loan.startDate}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoKey}>পরিশোধের শেষ মেয়াদ:</Text>
            <Text style={[styles.infoVal, { color: Colors.accent.gold, fontWeight: '700' }]}>
              {loan.dueDate}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoKey}>পরিশোধ কাঠামো:</Text>
            <Text style={styles.infoVal}>
              {loan.repaymentType === 'MONTHLY_INSTALLMENT'
                ? `মাসিক কিস্তি (৳${loan.installmentAmount} করে)`
                : 'এককালীন পরিশোধ'}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoKey}>সুদের হার:</Text>
            <Text style={[styles.infoVal, { color: Colors.primary.main, fontWeight: '700' }]}>
              ০.০% (শতভাগ সুদ ও রিবা-মুক্ত)
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* মডালসমূহ */}
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

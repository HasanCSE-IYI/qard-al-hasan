import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Loan, LOAN_STATUS } from '@qard/shared';
import { Colors } from '../theme/colors';
import { useAppStore } from '../store/useAppStore';

interface LoanCardProps {
  loan: Loan;
  onPress: () => void;
  onReminderPress?: () => void;
}

export const LoanCard: React.FC<LoanCardProps> = ({ loan, onPress, onReminderPress }) => {
  const user = useAppStore((state) => state.user);
  const isPrivacyMode = useAppStore((state) => state.isPrivacyMode);

  const isLender = loan.lenderId === user?.id;
  const counterpartyName = isLender ? loan.borrowerName : loan.lenderName;
  const roleLabel = isLender ? 'কর্জ গ্রহীতা' : 'কর্জ দাতা';

  const paidAmount = loan.principalAmount - loan.remainingAmount;
  const progressRatio = Math.min(1, Math.max(0, paidAmount / (loan.principalAmount || 1)));

  // স্ট্যাটাস ও কালার
  const getStatusBadge = () => {
    switch (loan.status) {
      case LOAN_STATUS.PAID_IN_FULL:
        return { label: 'পরিশোধিত', bg: '#D1FAE5', text: '#065F46' };
      case LOAN_STATUS.FORGIVEN_IBRA:
        return { label: 'সদকাহ (মওকুফ)', bg: '#EDE9FE', text: '#5B21B6' };
      case LOAN_STATUS.HARDSHIP_REVIEW:
        return { label: 'অবকাশ আবেদন', bg: '#FCE7F3', text: '#9D174D' };
      case LOAN_STATUS.PARTIALLY_PAID:
        return { label: 'চলমান কিস্তি', bg: '#FEF3C7', text: '#92400E' };
      default:
        return { label: 'সক্রিয় কর্জ', bg: '#E0F2FE', text: '#0369A1' };
    }
  };

  const badge = getStatusBadge();

  return (
    <TouchableOpacity activeOpacity={0.85} style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <View>
          <Text style={styles.roleLabel}>{roleLabel}</Text>
          <Text style={styles.name}>{counterpartyName || 'নাম উল্লেখ নেই'}</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: badge.bg }]}>
          <Text style={[styles.badgeText, { color: badge.text }]}>{badge.label}</Text>
        </View>
      </View>

      <Text style={styles.purpose} numberOfLines={1}>
        উদ্দেশ্য: {loan.purpose}
      </Text>

      {/* অগ্রগতি বার */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${progressRatio * 100}%` }]} />
        </View>
        <View style={styles.progressLabels}>
          <Text style={styles.subtext}>
            পরিশোধ: {isPrivacyMode ? '••••' : `৳ ${paidAmount.toLocaleString('en-IN')}`}
          </Text>
          <Text style={styles.subtext}>
            বাকি: {isPrivacyMode ? '••••' : `৳ ${loan.remainingAmount.toLocaleString('en-IN')}`}
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.dueDate}>পরিশোধের তারিখ: {loan.dueDate}</Text>
        {isLender && loan.remainingAmount > 0 && onReminderPress ? (
          <TouchableOpacity style={styles.reminderBtn} onPress={onReminderPress}>
            <Text style={styles.reminderBtnText}>ভদ্র স্মরণিকা 💬</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.background.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.slate.subtle,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  roleLabel: {
    fontSize: 11,
    color: Colors.slate.muted,
    textTransform: 'uppercase',
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.slate.darkest,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  purpose: {
    fontSize: 13,
    color: Colors.slate.medium,
    marginBottom: 12,
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: Colors.slate.subtle,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.primary.main,
    borderRadius: 4,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  subtext: {
    fontSize: 12,
    color: Colors.slate.muted,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.slate.subtle,
    paddingTop: 10,
  },
  dueDate: {
    fontSize: 12,
    color: Colors.slate.muted,
  },
  reminderBtn: {
    backgroundColor: Colors.primary.surface,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primary.border,
  },
  reminderBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.primary.dark,
  },
});

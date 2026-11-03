import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Colors } from '../theme/colors';
import { useAppStore } from '../store/useAppStore';
import { StatCard } from '../components/StatCard';
import { LoanCard } from '../components/LoanCard';
import { GentleReminderModal } from '../components/GentleReminderModal';
import { Loan } from '@qard/shared';

interface DashboardScreenProps {
  onNavigateToNewLoan: () => void;
  onNavigateToLoans: () => void;
  onNavigateToWasiyyah: () => void;
  onSelectLoan: (loan: Loan) => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  onNavigateToNewLoan,
  onNavigateToLoans,
  onNavigateToWasiyyah,
  onSelectLoan,
}) => {
  const user = useAppStore((state) => state.user);
  const isPrivacyMode = useAppStore((state) => state.isPrivacyMode);
  const togglePrivacyMode = useAppStore((state) => state.togglePrivacyMode);
  const dashboardSummary = useAppStore((state) => state.dashboardSummary);
  const loans = useAppStore((state) => state.loans);

  const [reminderLoan, setReminderLoan] = useState<Loan | null>(null);

  const activeLoans = loans.filter((l) => l.status !== 'PAID_IN_FULL' && l.status !== 'FORGIVEN_IBRA');

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary.dark} />
      
      {/* টপ হেডার বার */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>আসসালামু আলাইকুম 🕊️</Text>
          <Text style={styles.userName}>{user?.name || 'ব্যবহারকারী'}</Text>
        </View>

        <View style={styles.headerRight}>
          {/* হুসনুল ওয়াফা স্কোর ব্যাজ */}
          <View style={styles.scoreBadge}>
            <Text style={styles.scoreText}>হুসন স্কোর: {user?.husnScore || 100}</Text>
          </View>

          {/* প্রাইভেসি টগল */}
          <TouchableOpacity style={styles.privacyBtn} onPress={togglePrivacyMode}>
            <Text style={styles.privacyBtnText}>{isPrivacyMode ? '👁️‍🗨️' : '👁️'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* হাদিসের মোটিভেশনাল স্ট্রিপ */}
        <View style={styles.hadithStrip}>
          <Text style={styles.hadithText}>
            “যে ব্যক্তি কোনো অভাবগ্রস্তকে অবকাশ দেয়, আল্লাহ তাকে হাশরের ময়দানে আরশের ছায়া দান করবেন।”
          </Text>
        </View>

        {/* সামারি ওভারভিউ কার্ড */}
        <View style={styles.statsRow}>
          <StatCard
            title="মোট প্রদত্ত কর্জ"
            amount={dashboardSummary.totalLent}
            type="lent"
            subtitle={`${dashboardSummary.activeGivenLoansCount}টি চলমান`}
          />
          <StatCard
            title="মোট গৃহীত কর্জ"
            amount={dashboardSummary.totalBorrowed}
            type="borrowed"
            subtitle={`${dashboardSummary.activeTakenLoansCount}টি চলমান`}
          />
        </View>

        {/* সদকাহ হিসেবে মওকুফ কার্ড */}
        <View style={styles.sadaqahRow}>
          <StatCard
            title="আল্লাহর সন্তুষ্টিতে মওকুফ (সদকাহ)"
            amount={dashboardSummary.totalSadaqahForgiven}
            type="sadaqah"
            subtitle="সদকাহ জারিয়া হিসেবে সংরক্ষিত"
          />
        </View>

        {/* কুইক অ্যাকশন বাটনসমূহ */}
        <Text style={styles.sectionTitle}>দ্রুত সেবা</Text>
        <View style={styles.quickActionsGrid}>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: Colors.primary.surface }]} onPress={onNavigateToNewLoan}>
            <Text style={styles.actionIcon}>🤝</Text>
            <Text style={[styles.actionLabel, { color: Colors.primary.dark }]}>নতুন কর্জ দিন</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: Colors.accent.surface }]} onPress={onNavigateToLoans}>
            <Text style={styles.actionIcon}>📋</Text>
            <Text style={[styles.actionLabel, { color: Colors.accent.gold }]}>কর্জের খাতা</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#F3E8FF' }]} onPress={onNavigateToWasiyyah}>
            <Text style={styles.actionIcon}>📜</Text>
            <Text style={[styles.actionLabel, { color: '#6B21A8' }]}>অসিয়তনামা</Text>
          </TouchableOpacity>
        </View>

        {/* চলমান কর্জসমূহ */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>চলমান কর্জসমূহ ({activeLoans.length})</Text>
          <TouchableOpacity onPress={onNavigateToLoans}>
            <Text style={styles.seeAllText}>সব দেখুন ›</Text>
          </TouchableOpacity>
        </View>

        {activeLoans.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>কোনো চলমান কর্জ নেই। নতুন কর্জের এন্ট্রি করুন।</Text>
          </View>
        ) : (
          activeLoans.slice(0, 3).map((loan) => (
            <LoanCard
              key={loan.id}
              loan={loan}
              onPress={() => onSelectLoan(loan)}
              onReminderPress={() => setReminderLoan(loan)}
            />
          ))
        )}
      </ScrollView>

      {/* জেন্টল রিমাইন্ডার মডাল */}
      {reminderLoan ? (
        <GentleReminderModal
          visible={!!reminderLoan}
          loan={reminderLoan}
          onClose={() => setReminderLoan(null)}
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
    backgroundColor: Colors.primary.dark,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  greeting: {
    fontSize: 13,
    color: '#A7F3D0',
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  scoreBadge: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  scoreText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  privacyBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 8,
    borderRadius: 12,
  },
  privacyBtnText: {
    fontSize: 16,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  hadithStrip: {
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
    marginBottom: 16,
  },
  hadithText: {
    fontSize: 12,
    color: '#92400E',
    textAlign: 'center',
    lineHeight: 18,
    fontStyle: 'italic',
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  sadaqahRow: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.slate.darkest,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary.main,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
    marginTop: 8,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionIcon: {
    fontSize: 22,
    marginBottom: 4,
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  emptyCard: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.slate.subtle,
  },
  emptyText: {
    fontSize: 13,
    color: Colors.slate.muted,
  },
});

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
      
      {/* Top Header Bar */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Assalamu Alaikum 🕊️</Text>
          <Text style={styles.userName}>{user?.name || 'Valued User'}</Text>
        </View>

        <View style={styles.headerRight}>
          {/* Husn al-Wafa Ethical Credit Score */}
          <View style={styles.scoreBadge}>
            <Text style={styles.scoreText}>Husn Score: {user?.husnScore || 100}</Text>
          </View>

          {/* Privacy Toggle */}
          <TouchableOpacity style={styles.privacyBtn} onPress={togglePrivacyMode}>
            <Text style={styles.privacyBtnText}>{isPrivacyMode ? '👁️‍🗨️' : '👁️'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Prophetic Hadith Strip */}
        <View style={styles.hadithStrip}>
          <Text style={styles.hadithText}>
            "Whoever grants respite to someone in difficulty, or forgives him, Allah will shade him in His shade on the Day of Resurrection."
          </Text>
        </View>

        {/* Summary Overview Cards */}
        <View style={styles.statsRow}>
          <StatCard
            title="Total Lent (Receivable)"
            amount={dashboardSummary.totalLent}
            type="lent"
            subtitle={`${dashboardSummary.activeGivenLoansCount} active`}
          />
          <StatCard
            title="Total Borrowed (Payable)"
            amount={dashboardSummary.totalBorrowed}
            type="borrowed"
            subtitle={`${dashboardSummary.activeTakenLoansCount} active`}
          />
        </View>

        {/* Sadaqah / Forgiven Debt Card */}
        <View style={styles.sadaqahRow}>
          <StatCard
            title="Forgiven for Allah's Sake (Sadaqah)"
            amount={dashboardSummary.totalSadaqahForgiven}
            type="sadaqah"
            subtitle="Recorded as certified Sadaqah Jariyah"
          />
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: Colors.primary.surface }]} onPress={onNavigateToNewLoan}>
            <Text style={styles.actionIcon}>🤝</Text>
            <Text style={[styles.actionLabel, { color: Colors.primary.dark }]}>New Loan</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: Colors.accent.surface }]} onPress={onNavigateToLoans}>
            <Text style={styles.actionIcon}>📋</Text>
            <Text style={[styles.actionLabel, { color: Colors.accent.gold }]}>Loans Registry</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#F3E8FF' }]} onPress={onNavigateToWasiyyah}>
            <Text style={styles.actionIcon}>📜</Text>
            <Text style={[styles.actionLabel, { color: '#6B21A8' }]}>Al-Wasiyyah</Text>
          </TouchableOpacity>
        </View>

        {/* Active Loans */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Active Loans ({activeLoans.length})</Text>
          <TouchableOpacity onPress={onNavigateToLoans}>
            <Text style={styles.seeAllText}>See All ›</Text>
          </TouchableOpacity>
        </View>

        {activeLoans.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No active loans found. Create a new loan to get started.</Text>
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

      {/* Gentle Reminder Modal */}
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

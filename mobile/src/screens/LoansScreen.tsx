import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { Colors } from '../theme/colors';
import { useAppStore } from '../store/useAppStore';
import { LoanCard } from '../components/LoanCard';
import { GentleReminderModal } from '../components/GentleReminderModal';
import { Loan } from '@qard/shared';

interface LoansScreenProps {
  onBack: () => void;
  onSelectLoan: (loan: Loan) => void;
  onNavigateToNewLoan: () => void;
}

export const LoansScreen: React.FC<LoansScreenProps> = ({ onBack, onSelectLoan, onNavigateToNewLoan }) => {
  const user = useAppStore((state) => state.user);
  const loans = useAppStore((state) => state.loans);

  const [activeTab, setActiveTab] = useState<'LENT' | 'BORROWED'>('LENT');
  const [searchQuery, setSearchQuery] = useState('');
  const [reminderLoan, setReminderLoan] = useState<Loan | null>(null);

  const filteredLoans = loans.filter((loan) => {
    const isTabMatch =
      activeTab === 'LENT' ? loan.lenderId === user?.id : loan.borrowerId === user?.id;

    if (!isTabMatch) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const name = (activeTab === 'LENT' ? loan.borrowerName : loan.lenderName) || '';
      return name.toLowerCase().includes(q) || loan.purpose.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Text style={styles.backBtnText}>‹ ড্যাশবোর্ড</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>কর্জের খাতা</Text>
        <TouchableOpacity style={styles.addBtn} onPress={onNavigateToNewLoan}>
          <Text style={styles.addBtnText}>+ নতুন</Text>
        </TouchableOpacity>
      </View>

      {/* ট্যাব বার */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'LENT' && styles.tabActive]}
          onPress={() => setActiveTab('LENT')}
        >
          <Text style={[styles.tabText, activeTab === 'LENT' && styles.tabTextActive]}>
            আমি যাদের দিয়েছি (প্রদত্ত)
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'BORROWED' && styles.tabActive]}
          onPress={() => setActiveTab('BORROWED')}
        >
          <Text style={[styles.tabText, activeTab === 'BORROWED' && styles.tabTextActive]}>
            আমি যাদের থেকে নিয়েছি (গৃহীত)
          </Text>
        </TouchableOpacity>
      </View>

      {/* সার্চ বার */}
      <View style={styles.searchBox}>
        <TextInput
          style={styles.searchInput}
          placeholder="নাম বা উদ্দেশ্য দিয়ে খুঁজুন..."
          placeholderTextColor={Colors.slate.light}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* লোন লিস্ট */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContent}>
        {filteredLoans.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📖</Text>
            <Text style={styles.emptyTitle}>কোনো রেকর্ড পাওয়া যায়নি</Text>
            <Text style={styles.emptySubtitle}>নতুন কর্জের হিসাব তৈরি করতে উপরের '+ নতুন' বাটন চাপুন।</Text>
          </View>
        ) : (
          filteredLoans.map((loan) => (
            <LoanCard
              key={loan.id}
              loan={loan}
              onPress={() => onSelectLoan(loan)}
              onReminderPress={() => setReminderLoan(loan)}
            />
          ))
        )}
      </ScrollView>

      {/* রিমাইন্ডার মডাল */}
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
    color: Colors.primary.main,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.slate.darkest,
  },
  addBtn: {
    backgroundColor: Colors.primary.main,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.slate.subtle,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: Colors.primary.main,
  },
  tabText: {
    fontSize: 13,
    color: Colors.slate.muted,
    fontWeight: '600',
  },
  tabTextActive: {
    color: Colors.primary.main,
    fontWeight: '700',
  },
  searchBox: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  searchInput: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: Colors.slate.subtle,
    fontSize: 14,
    color: Colors.slate.darkest,
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 60,
    paddingHorizontal: 30,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.slate.darkest,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: Colors.slate.muted,
    textAlign: 'center',
    lineHeight: 18,
  },
});

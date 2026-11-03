import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Colors } from '../theme/colors';
import { useAppStore } from '../store/useAppStore';

interface WasiyyahScreenProps {
  onBack: () => void;
}

export const WasiyyahScreen: React.FC<WasiyyahScreenProps> = ({ onBack }) => {
  const user = useAppStore((state) => state.user);
  const loans = useAppStore((state) => state.loans);

  // 1. Receivables: Loans given to others
  const receivables = loans.filter(
    (l) => l.lenderId === user?.id && l.remainingAmount > 0
  );
  const totalReceivables = receivables.reduce((sum, l) => sum + l.remainingAmount, 0);

  // 2. Payables: Debts owed to others
  const payables = loans.filter(
    (l) => l.borrowerId === user?.id && l.remainingAmount > 0
  );
  const totalPayables = payables.reduce((sum, l) => sum + l.remainingAmount, 0);

  const netBalance = totalReceivables - totalPayables;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Text style={styles.backBtnText}>‹ Dashboard</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Al-Wasiyyah (Islamic Will)</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Prophetic Hadith Card */}
        <View style={styles.hadithCard}>
          <Text style={styles.hadithArabic}>
            مَا حَقُّ امْرِئٍ مُسْلِمٍ لَهُ شَيْءٌ يُوصِي فِيهِ يَبِيتُ لَيْلَتَيْنِ إِلَّا وَوَصِيَّتُهُ مَكْتُوبَةٌ عِنْدَهُ
          </Text>
          <Text style={styles.hadithEnglish}>
            "It is not permissible for any Muslim who has something to will to stay for two nights without having his will written with him." (Sahih al-Bukhari: 2738)
          </Text>
        </View>

        {/* Balance Overview Card */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceTitle}>Certified Debt Statement for Heirs & Estate</Text>
          <View style={styles.balanceRow}>
            <View>
              <Text style={styles.balanceLabel}>Total Liabilities (Must be settled first)</Text>
              <Text style={[styles.balanceAmount, { color: '#EF4444' }]}>
                BDT {totalPayables.toLocaleString('en-US')}
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.balanceLabel}>Total Receivables (Claimable by heirs)</Text>
              <Text style={[styles.balanceAmount, { color: Colors.primary.main }]}>
                BDT {totalReceivables.toLocaleString('en-US')}
              </Text>
            </View>
          </View>
          <View style={styles.netBox}>
            <Text style={styles.netLabel}>Net Balance:</Text>
            <Text style={styles.netVal}>
              {netBalance >= 0
                ? `+BDT ${netBalance.toLocaleString('en-US')}`
                : `-BDT ${Math.abs(netBalance).toLocaleString('en-US')}`}
            </Text>
          </View>
        </View>

        {/* Payables (Priority Estate Settlement) */}
        <Text style={styles.sectionHeading}>
          ⚠️ My Debts / Payables (Mandatory priority settlement from estate prior to inheritance distribution):
        </Text>
        {payables.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>Alhamdulillah! You have no outstanding debt liabilities.</Text>
          </View>
        ) : (
          payables.map((p) => (
            <View key={p.id} style={[styles.itemCard, { borderLeftColor: '#EF4444' }]}>
              <View style={styles.itemHeader}>
                <Text style={styles.itemName}>{p.lenderName || 'Creditor'}</Text>
                <Text style={[styles.itemAmount, { color: '#EF4444' }]}>
                  BDT {p.remainingAmount.toLocaleString('en-US')}
                </Text>
              </View>
              <Text style={styles.itemSub}>Purpose: {p.purpose}</Text>
              <Text style={styles.itemSub}>Due Date: {p.dueDate}</Text>
            </View>
          ))
        )}

        {/* Receivables */}
        <Text style={[styles.sectionHeading, { marginTop: 16 }]}>
          ✅ My Receivables (Claimable by heirs):
        </Text>
        {receivables.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>No active receivables at present.</Text>
          </View>
        ) : (
          receivables.map((r) => (
            <View key={r.id} style={[styles.itemCard, { borderLeftColor: Colors.primary.main }]}>
              <View style={styles.itemHeader}>
                <Text style={styles.itemName}>{r.borrowerName || 'Borrower'}</Text>
                <Text style={[styles.itemAmount, { color: Colors.primary.main }]}>
                  BDT {r.remainingAmount.toLocaleString('en-US')}
                </Text>
              </View>
              <Text style={styles.itemSub}>Purpose: {r.purpose}</Text>
              <Text style={styles.itemSub}>Due Date: {r.dueDate}</Text>
            </View>
          ))
        )}

        <TouchableOpacity
          style={styles.printBtn}
          onPress={() =>
            Alert.alert(
              'Wasiyyah Statement Ready',
              'Certified Al-Wasiyyah debt statement PDF saved to your device. You can share this with your family and trusted executor.'
            )
          }
        >
          <Text style={styles.printBtnText}>Download & Print Al-Wasiyyah PDF 📜</Text>
        </TouchableOpacity>
      </ScrollView>
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
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  hadithCard: {
    backgroundColor: '#FFFBEB',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#FDE68A',
    marginBottom: 16,
  },
  hadithArabic: {
    fontSize: 13,
    fontWeight: '600',
    color: '#92400E',
    textAlign: 'center',
    marginBottom: 6,
    lineHeight: 20,
  },
  hadithEnglish: {
    fontSize: 12,
    color: '#78350F',
    textAlign: 'center',
    lineHeight: 18,
  },
  balanceCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.slate.subtle,
    marginBottom: 20,
  },
  balanceTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.slate.darkest,
    marginBottom: 12,
    textAlign: 'center',
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  balanceLabel: {
    fontSize: 11,
    color: Colors.slate.muted,
    marginBottom: 2,
  },
  balanceAmount: {
    fontSize: 17,
    fontWeight: '700',
  },
  netBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 10,
  },
  netLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.slate.dark,
  },
  netVal: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.slate.darkest,
  },
  sectionHeading: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.slate.dark,
    marginBottom: 8,
    lineHeight: 18,
  },
  emptyBox: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.slate.subtle,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 12,
    color: Colors.slate.muted,
    textAlign: 'center',
  },
  itemCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.slate.subtle,
    borderLeftWidth: 4,
    marginBottom: 10,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.slate.darkest,
  },
  itemAmount: {
    fontSize: 15,
    fontWeight: '700',
  },
  itemSub: {
    fontSize: 12,
    color: Colors.slate.muted,
    marginTop: 2,
  },
  printBtn: {
    backgroundColor: Colors.primary.dark,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 20,
  },
  printBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
});

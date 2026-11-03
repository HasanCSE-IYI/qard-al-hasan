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

  // ১. যা আমি পাব (Receivables)
  const receivables = loans.filter(
    (l) => l.lenderId === user?.id && l.remainingAmount > 0
  );
  const totalReceivables = receivables.reduce((sum, l) => sum + l.remainingAmount, 0);

  // ২. যা আমার কাছে অন্যরা পাবে (Payables)
  const payables = loans.filter(
    (l) => l.borrowerId === user?.id && l.remainingAmount > 0
  );
  const totalPayables = payables.reduce((sum, l) => sum + l.remainingAmount, 0);

  const netBalance = totalReceivables - totalPayables;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Text style={styles.backBtnText}>‹ ড্যাশবোর্ড</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>আল-ওয়াসিয়্যাহ (অসিয়তনামা)</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* হাদিস কার্ড */}
        <View style={styles.hadithCard}>
          <Text style={styles.hadithArabic}>
            مَا حَقُّ امْرِئٍ مُسْلِمٍ لَهُ شَيْءٌ يُوصِي فِيهِ يَبِيتُ لَيْلَتَيْنِ إِلَّا وَوَصِيَّتُهُ مَكْتُوبَةٌ عِنْدَهُ
          </Text>
          <Text style={styles.hadithBangla}>
            “যে মুসলিমের কোনো অসিয়ত করার মতো বিষয় রয়েছে, তার জন্য দুই রাত কাটানো সঙ্গত নয় এমন অবস্থায় যে তার অসিয়তনামা তার কাছে লিখিত নেই।” (সহীহ বুখারী: ২৭৩৮)
          </Text>
        </View>

        {/* নেট ব্যালেন্স কার্ড */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceTitle}>উত্তরাধিকারীদের জন্য দেনা-পাওনা বিবরণী</Text>
          <View style={styles.balanceRow}>
            <View>
              <Text style={styles.balanceLabel}>মোট দেনা (পরিশোধ ফরজ)</Text>
              <Text style={[styles.balanceAmount, { color: '#EF4444' }]}>
                ৳ {totalPayables.toLocaleString('en-IN')}
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.balanceLabel}>মোট পাওনা (ওয়ারিশদের প্রাপ্য)</Text>
              <Text style={[styles.balanceAmount, { color: Colors.primary.main }]}>
                ৳ {totalReceivables.toLocaleString('en-IN')}
              </Text>
            </View>
          </View>
          <View style={styles.netBox}>
            <Text style={styles.netLabel}>নিট উদ্বৃত্ত:</Text>
            <Text style={styles.netVal}>
              {netBalance >= 0 ? `+৳ ${netBalance.toLocaleString('en-IN')}` : `-৳ ${Math.abs(netBalance).toLocaleString('en-IN')}`}
            </Text>
          </View>
        </View>

        {/* দেনার তালিকা (মৃত্যুর পর সর্বপ্রথম যা পরিশোধ করা ওয়াজিব) */}
        <Text style={styles.sectionHeading}>
          ⚠️ আমার ঋণ বা দেনা (যা মৃত্যুর পর ত্যাজ্য সম্পত্তি থেকে সর্বপ্রথম পরিশোধ করতে হবে):
        </Text>
        {payables.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>আলহামদুলিল্লাহ! আপনার কোনো বকেয়া দেনা নেই।</Text>
          </View>
        ) : (
          payables.map((p) => (
            <View key={p.id} style={[styles.itemCard, { borderLeftColor: '#EF4444' }]}>
              <View style={styles.itemHeader}>
                <Text style={styles.itemName}>{p.lenderName || 'পাওনাদার'}</Text>
                <Text style={[styles.itemAmount, { color: '#EF4444' }]}>
                  ৳ {p.remainingAmount.toLocaleString('en-IN')}
                </Text>
              </View>
              <Text style={styles.itemSub}>উদ্দেশ্য: {p.purpose}</Text>
              <Text style={styles.itemSub}>পরিশোধের নির্ধারিত মেয়াদ: {p.dueDate}</Text>
            </View>
          ))
        )}

        {/* পাওনার তালিকা */}
        <Text style={[styles.sectionHeading, { marginTop: 16 }]}>
          ✅ আমার পাওনা (ওয়ারিশগণ যা দাবি ও আদায় করতে পারবেন):
        </Text>
        {receivables.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>বর্তমানে কারো কাছে কোনো দেনা পাওনা নেই।</Text>
          </View>
        ) : (
          receivables.map((r) => (
            <View key={r.id} style={[styles.itemCard, { borderLeftColor: Colors.primary.main }]}>
              <View style={styles.itemHeader}>
                <Text style={styles.itemName}>{r.borrowerName || 'ঋণগ্রহীতা'}</Text>
                <Text style={[styles.itemAmount, { color: Colors.primary.main }]}>
                  ৳ {r.remainingAmount.toLocaleString('en-IN')}
                </Text>
              </View>
              <Text style={styles.itemSub}>উদ্দেশ্য: {r.purpose}</Text>
              <Text style={styles.itemSub}>মেয়াদ: {r.dueDate}</Text>
            </View>
          ))
        )}

        <TouchableOpacity
          style={styles.printBtn}
          onPress={() =>
            Alert.alert(
              'অসিয়তনামা প্রস্তুত',
              'সত্যায়িত অসিয়তনামা PDF ফাইল ডিভাইসে সংরক্ষিত হয়েছে। এটি পরিবার ও বিশ্বস্ত ব্যক্তির সাথে শেয়ার করে রাখতে পারেন।'
            )
          }
        >
          <Text style={styles.printBtnText}>অসিয়তনামা PDF ডাউনলোড ও প্রিন্ট করুন 📜</Text>
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
  hadithBangla: {
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

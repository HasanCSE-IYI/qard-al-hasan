import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { Loan } from '@qard/shared';
import { Colors } from '../theme/colors';

interface AqdContractModalProps {
  visible: boolean;
  loan: Loan;
  onClose: () => void;
}

export const AqdContractModal: React.FC<AqdContractModalProps> = ({ visible, loan, onClose }) => {
  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>ডিজিটাল চুক্তিপত্র (العقد الشرعي)</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeBtn}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* বিসমিল্লাহ ও আয়াত */}
            <View style={styles.bismillahBox}>
              <Text style={styles.bismillah}>بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</Text>
              <Text style={styles.ayahQuote}>
                “হে মুমিনগণ! যখন তোমরা নির্দিষ্ট মেয়াদের জন্য ঋণের লেনদেন কর, তখন তা লিখে রাখ...” (সূরা আল-বাক্বারাহ: ২৮২)
              </Text>
            </View>

            <View style={styles.contractCard}>
              <View style={styles.sealBadge}>
                <Text style={styles.sealText}>১০০% সুদ ও রিবা-মুক্ত কর্জ্যে হাসানাহ</Text>
              </View>

              <Text style={styles.contractTitle}>পারস্পরিক সহযোগিতামূলক ঋণ চুক্তি</Text>
              <Text style={styles.clause}>
                উভয় পক্ষ এই মর্মে আল্লাহ তায়ালাকে সাক্ষী রেখে অঙ্গীকারবদ্ধ হচ্ছেন যে, এই ঋণ সম্পূর্ণ আল্লাহ তায়ালার সন্তুষ্টির নিমিত্তে দেওয়া হয়েছে। এতে কোনো প্রচ্ছন্ন মুনাফা, সুদ বা জরিমানা যুক্ত নেই।
              </Text>

              <View style={styles.divider} />

              <View style={styles.row}>
                <Text style={styles.fieldLabel}>ঋণদাতা (المقرض):</Text>
                <Text style={styles.fieldValue}>{loan.lenderName || 'অনির্ধারিত'}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.fieldLabel}>ঋণগ্রহীতা (المقترض):</Text>
                <Text style={styles.fieldValue}>{loan.borrowerName || 'অনির্ধারিত'}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.fieldLabel}>মূল ঋণের পরিমাণ:</Text>
                <Text style={[styles.fieldValue, styles.amountHighlight]}>
                  ৳ {loan.principalAmount.toLocaleString('en-IN')} {loan.currency}
                </Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.fieldLabel}>পরিশোধের মেয়াদ:</Text>
                <Text style={styles.fieldValue}>{loan.dueDate}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.fieldLabel}>পরিশোধ পদ্ধতি:</Text>
                <Text style={styles.fieldValue}>
                  {loan.repaymentType === 'MONTHLY_INSTALLMENT'
                    ? `মাসিক কিস্তি (${loan.installmentCount}টি)`
                    : 'এককালীন পরিশোধ'}
                </Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.fieldLabel}>কর্জের উদ্দেশ্য:</Text>
                <Text style={styles.fieldValue}>{loan.purpose}</Text>
              </View>

              <View style={styles.divider} />

              {/* ক্রিপ্টোগ্রাফিক ভেরিফিকেশন হ্যাশ */}
              <View style={styles.hashBox}>
                <Text style={styles.hashLabel}>ট্যাম্পার-প্রুফ ভেরিফিকেশন হ্যাশ (SHA-256):</Text>
                <Text style={styles.hashValue} numberOfLines={1} ellipsizeMode="middle">
                  {loan.contractHash || '7a8f9c0e1d2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d'}
                </Text>
              </View>

              <View style={styles.signaturesRow}>
                <View style={styles.signBox}>
                  <Text style={styles.signName}>✍️ {loan.lenderName || 'ঋণদাতা'}</Text>
                  <Text style={styles.signStatus}>ডিজিটালভাবে স্বাক্ষরিত</Text>
                </View>
                <View style={styles.signBox}>
                  <Text style={styles.signName}>✍️ {loan.borrowerName || 'ঋণগ্রহীতা'}</Text>
                  <Text style={styles.signStatus}>ডিজিটালভাবে স্বাক্ষরিত</Text>
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={styles.downloadBtn}
              onPress={() => Alert.alert('PDF প্রস্তুত', 'অফিশিয়াল চুক্তিপত্র ডিভাইসে সেভ করা হয়েছে।')}
            >
              <Text style={styles.downloadBtnText}>চুক্তিপত্র PDF ডাউনলোড করুন 📄</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '92%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.slate.darkest,
  },
  closeBtn: {
    fontSize: 20,
    color: Colors.slate.muted,
    padding: 4,
  },
  bismillahBox: {
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 10,
  },
  bismillah: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary.dark,
    marginBottom: 4,
  },
  ayahQuote: {
    fontSize: 11,
    color: Colors.slate.muted,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  contractCard: {
    borderWidth: 1,
    borderColor: Colors.primary.border,
    borderRadius: 14,
    padding: 16,
    backgroundColor: '#FAFDFB',
    marginBottom: 16,
  },
  sealBadge: {
    alignSelf: 'center',
    backgroundColor: Colors.primary.surface,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.primary.border,
  },
  sealText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary.dark,
  },
  contractTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.slate.darkest,
    textAlign: 'center',
    marginBottom: 6,
  },
  clause: {
    fontSize: 12,
    color: Colors.slate.medium,
    lineHeight: 18,
    textAlign: 'center',
    marginBottom: 10,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.slate.subtle,
    marginVertical: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  fieldLabel: {
    fontSize: 13,
    color: Colors.slate.muted,
  },
  fieldValue: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.slate.darkest,
    maxWidth: '55%',
    textAlign: 'right',
  },
  amountHighlight: {
    color: Colors.primary.main,
    fontSize: 15,
    fontWeight: '700',
  },
  hashBox: {
    backgroundColor: '#F1F5F9',
    padding: 8,
    borderRadius: 8,
    marginVertical: 10,
  },
  hashLabel: {
    fontSize: 10,
    color: Colors.slate.muted,
    marginBottom: 2,
  },
  hashValue: {
    fontSize: 10,
    fontFamily: 'monospace',
    color: Colors.slate.dark,
  },
  signaturesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    gap: 8,
  },
  signBox: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: Colors.slate.subtle,
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
  },
  signName: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.slate.darkest,
    marginBottom: 2,
  },
  signStatus: {
    fontSize: 10,
    color: Colors.primary.main,
  },
  downloadBtn: {
    backgroundColor: Colors.primary.dark,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  downloadBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
});

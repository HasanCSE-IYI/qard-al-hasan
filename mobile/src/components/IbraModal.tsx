import React, { useState } from 'react';
import { View, Text, Modal, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Loan } from '@qard/shared';
import { Colors } from '../theme/colors';
import { useAppStore } from '../store/useAppStore';

interface IbraModalProps {
  visible: boolean;
  loan: Loan;
  onClose: () => void;
}

export const IbraModal: React.FC<IbraModalProps> = ({ visible, loan, onClose }) => {
  const forgiveLoan = useAppStore((state) => state.forgiveLoan);

  const [forgiveType, setForgiveType] = useState<'FULL' | 'PARTIAL'>('FULL');
  const [partialAmount, setPartialAmount] = useState(loan.remainingAmount.toString());
  const [sadaqahNote, setSadaqahNote] = useState('');

  const handleConfirmIbra = () => {
    const amountToForgive = forgiveType === 'FULL' ? loan.remainingAmount : parseFloat(partialAmount);

    if (isNaN(amountToForgive) || amountToForgive <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    if (amountToForgive > loan.remainingAmount) {
      Alert.alert('Error', 'Forgiven amount cannot exceed remaining balance');
      return;
    }

    forgiveLoan(loan.id, amountToForgive);
    Alert.alert(
      'Alhamdulillah! May Allah Accept Your Charity',
      `May Allah accept this benevolent deed as certified Sadaqah and multiply your reward. BDT ${amountToForgive.toLocaleString(
        'en-US'
      )} debt has been forgiven.`
    );
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Debt Forgiveness (Al-Ibra / Sadaqah)</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeBtn}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Quranic Verse Card */}
          <View style={styles.quranCard}>
            <Text style={styles.quranArabic}>
              وَإِن كَانَ ذُو عُسْرَةٍ فَنَظِرَةٌ إِلَىٰ مَيْسَرَةٍ ۚ وَأَن تَصَدَّقُوا خَيْرٌ لَّكُمْ ۖ إِن كُنتُمْ تَعْلَمُونَ
            </Text>
            <Text style={styles.quranEnglish}>
              "And if someone is in hardship, then let there be postponement until a time of ease. But if you give it from your right as charity, then it is better for you, if you only knew." (Surah Al-Baqarah: 280)
            </Text>
          </View>

          <View style={styles.typeRow}>
            <TouchableOpacity
              style={[styles.typeBtn, forgiveType === 'FULL' && styles.typeBtnActive]}
              onPress={() => setForgiveType('FULL')}
            >
              <Text style={[styles.typeText, forgiveType === 'FULL' && styles.typeTextActive]}>
                Full Debt Forgiveness (BDT {loan.remainingAmount.toLocaleString('en-US')})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.typeBtn, forgiveType === 'PARTIAL' && styles.typeBtnActive]}
              onPress={() => setForgiveType('PARTIAL')}
            >
              <Text style={[styles.typeText, forgiveType === 'PARTIAL' && styles.typeTextActive]}>
                Partial Debt Forgiveness
              </Text>
            </TouchableOpacity>
          </View>

          {forgiveType === 'PARTIAL' ? (
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Forgiven Amount (BDT)</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={partialAmount}
                onChangeText={setPartialAmount}
                placeholder="Enter amount to forgive"
                placeholderTextColor={Colors.slate.light}
              />
            </View>
          ) : null}

          <Text style={styles.label}>Intention Note or Supplication (Optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Forgiven purely for the pleasure and count of Allah"
            placeholderTextColor={Colors.slate.light}
            value={sadaqahNote}
            onChangeText={setSadaqahNote}
          />

          <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirmIbra}>
            <Text style={styles.confirmBtnText}>Forgive for the Sake of Allah 🕊️</Text>
          </TouchableOpacity>
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
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.slate.darkest,
  },
  closeBtn: {
    fontSize: 20,
    color: Colors.slate.muted,
    padding: 4,
  },
  quranCard: {
    backgroundColor: '#F5F3FF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#DDD6FE',
    marginBottom: 16,
  },
  quranArabic: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5B21B6',
    textAlign: 'center',
    marginBottom: 6,
    lineHeight: 22,
  },
  quranEnglish: {
    fontSize: 12,
    color: '#6D28D9',
    textAlign: 'center',
    lineHeight: 18,
  },
  typeRow: {
    gap: 8,
    marginBottom: 14,
  },
  typeBtn: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.slate.subtle,
    alignItems: 'center',
  },
  typeBtnActive: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
  },
  typeText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.slate.dark,
  },
  typeTextActive: {
    color: '#fff',
  },
  inputContainer: {
    marginBottom: 10,
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
  confirmBtn: {
    backgroundColor: '#7C3AED',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 16,
  },
  confirmBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
});

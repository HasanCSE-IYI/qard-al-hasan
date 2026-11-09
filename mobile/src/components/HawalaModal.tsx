import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { Loan } from '@qard/shared';
import { Colors } from '../theme/colors';

interface HawalaModalProps {
  visible: boolean;
  onClose: () => void;
  loan: Loan;
  onConfirm: (newBorrowerName: string, newBorrowerPhone: string, consentNote: string) => void;
}

export const HawalaModal: React.FC<HawalaModalProps> = ({
  visible,
  onClose,
  loan,
  onConfirm,
}) => {
  const [newBorrowerName, setNewBorrowerName] = useState('');
  const [newBorrowerPhone, setNewBorrowerPhone] = useState('');
  const [consentNote, setConsentNote] = useState('');

  const handleConfirm = () => {
    const trimmedName = newBorrowerName.trim();
    const trimmedPhone = newBorrowerPhone.trim();
    const trimmedNote = consentNote.trim();

    if (!trimmedName || trimmedName.length < 2) {
      Alert.alert('Validation Error', 'Please enter the full name of the transferee (Al-Muhal alayh).');
      return;
    }

    if (!trimmedPhone || trimmedPhone.length < 10) {
      Alert.alert('Validation Error', 'Please enter a valid phone number for the new debtor.');
      return;
    }

    if (!trimmedNote || trimmedNote.length < 5) {
      Alert.alert('Validation Error', 'Please describe the consent or agreement evidence (minimum 5 characters).');
      return;
    }

    onConfirm(trimmedName, trimmedPhone, trimmedNote);
    setNewBorrowerName('');
    setNewBorrowerPhone('');
    setConsentNote('');
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.headerRow}>
              <Text style={styles.title}>🔄 Debt Transfer (Al-Hawalah)</Text>
              <TouchableOpacity onPress={onClose}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.subtitle}>
              In Islamic Jurisprudence, Al-Hawalah transfers the debt liability from the original debtor to a consenting third party (Sahih al-Bukhari: 2287).
            </Text>

            <View style={styles.hadithCard}>
              <Text style={styles.hadithArabic}>
                مَطْلُ الْغَنِيِّ ظُلْمٌ، وَإِذَا أُتْبِعَ أَحَدُكُمْ عَلَى مَلِيٍّ فَلْيَتَّبِعْ
              </Text>
              <Text style={styles.hadithEnglish}>
                "The Messenger of Allah (ﷺ) said: '...and if any of you is referred (for payment of debt) to a solvent person, let him accept it.'" (Sahih al-Bukhari: 2287)
              </Text>
            </View>

            <View style={styles.infoBox}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Current Debtor:</Text>
                <Text style={styles.infoValue}>{loan.borrowerName || 'N/A'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Outstanding Balance:</Text>
                <Text style={[styles.infoValue, { color: Colors.primary.dark, fontWeight: '700' }]}>
                  BDT {loan.remainingAmount.toLocaleString('en-US')}
                </Text>
              </View>
            </View>

            <Text style={styles.inputLabel}>New Debtor Name (Al-Muhal 'alayh)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Sajid Al-Amin"
              placeholderTextColor="#94A3B8"
              value={newBorrowerName}
              onChangeText={setNewBorrowerName}
            />

            <Text style={styles.inputLabel}>New Debtor Phone Number</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 01812345678"
              placeholderTextColor="#94A3B8"
              keyboardType="phone-pad"
              value={newBorrowerPhone}
              onChangeText={setNewBorrowerPhone}
            />

            <Text style={styles.inputLabel}>Written Consent / Agreement Note</Text>
            <TextInput
              style={[styles.input, styles.multilineInput]}
              placeholder="e.g. Both parties agreed to transfer the liability on 2026-11-09 with mutual consent."
              placeholderTextColor="#94A3B8"
              multiline
              numberOfLines={3}
              value={consentNote}
              onChangeText={setConsentNote}
            />

            <View style={styles.btnRow}>
              <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm}>
                <Text style={styles.confirmBtnText}>Execute Hawalah</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '90%',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.slate.darkest,
  },
  closeBtn: {
    fontSize: 18,
    color: Colors.slate.muted,
    padding: 4,
  },
  subtitle: {
    fontSize: 12,
    color: Colors.slate.muted,
    lineHeight: 18,
    marginBottom: 12,
  },
  hadithCard: {
    backgroundColor: '#EFF6FF',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    marginBottom: 14,
  },
  hadithArabic: {
    fontSize: 13,
    color: '#1E40AF',
    textAlign: 'right',
    marginBottom: 4,
    fontWeight: '600',
  },
  hadithEnglish: {
    fontSize: 11,
    color: '#1E3A8A',
    fontStyle: 'italic',
    lineHeight: 16,
  },
  infoBox: {
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
    gap: 6,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 12,
    color: Colors.slate.muted,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.slate.darkest,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.slate.darkest,
    marginBottom: 6,
    marginTop: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.slate.darkest,
    backgroundColor: '#fff',
    marginBottom: 12,
  },
  multilineInput: {
    height: 72,
    textAlignVertical: 'top',
  },
  btnRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
    marginBottom: 16,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.slate.dark,
  },
  confirmBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: Colors.primary.main,
    alignItems: 'center',
  },
  confirmBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
});


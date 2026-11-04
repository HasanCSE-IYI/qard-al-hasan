import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Colors } from '../theme/colors';

interface RescheduleModalProps {
  visible: boolean;
  onClose: () => void;
  currentDueDate: string;
  onConfirm: (newDueDate: string, reason: string) => void;
}

export const RescheduleModal: React.FC<RescheduleModalProps> = ({
  visible,
  onClose,
  currentDueDate,
  onConfirm,
}) => {
  const [newDueDate, setNewDueDate] = useState('');
  const [reason, setReason] = useState('Financial difficulty / Grace period request');

  const handleConfirm = () => {
    const trimmedDate = newDueDate.trim();
    if (!trimmedDate) {
      Alert.alert('Validation Error', 'Please enter a valid new repayment date (YYYY-MM-DD).');
      return;
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmedDate)) {
      Alert.alert('Invalid Format', 'Date format must be YYYY-MM-DD (e.g., 2026-12-31).');
      return;
    }

    onConfirm(trimmedDate, reason.trim());
    setNewDueDate('');
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>⏳ Grant Grace Period (Inzar)</Text>
          <Text style={styles.subtitle}>
            Extend the loan repayment date for the borrower in hardship without any penalty or interest (Surah Al-Baqarah 2:280).
          </Text>

          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Current Due Date:</Text>
            <Text style={styles.infoValue}>{currentDueDate}</Text>
          </View>

          <Text style={styles.inputLabel}>New Repayment Date (YYYY-MM-DD)</Text>
          <TextInput
            style={styles.input}
            value={newDueDate}
            onChangeText={setNewDueDate}
            placeholder="e.g. 2026-12-31"
            placeholderTextColor={Colors.slate.light}
          />

          <Text style={styles.inputLabel}>Reason / Hardship Note</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={reason}
            onChangeText={setReason}
            multiline={true}
            placeholder="Reason for extension..."
            placeholderTextColor={Colors.slate.light}
          />

          <View style={styles.btnRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm}>
              <Text style={styles.confirmText}>Grant Extension</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: Colors.background.card,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 420,
    elevation: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.slate.darkest,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.slate.muted,
    lineHeight: 18,
    marginBottom: 16,
  },
  infoBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: Colors.background.light,
    padding: 10,
    borderRadius: 8,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Colors.slate.subtle,
  },
  infoLabel: {
    fontSize: 13,
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
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.slate.border,
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    color: Colors.slate.darkest,
    backgroundColor: Colors.background.card,
    marginBottom: 14,
  },
  textArea: {
    minHeight: 56,
  },
  btnRow: {
    flexDirection: 'row',
    marginTop: 4,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: Colors.slate.subtle,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 8,
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.slate.dark,
  },
  confirmBtn: {
    flex: 1,
    backgroundColor: Colors.primary.main,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginLeft: 8,
  },
  confirmText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.background.card,
  },
});

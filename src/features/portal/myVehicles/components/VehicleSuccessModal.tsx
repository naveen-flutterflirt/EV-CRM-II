import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';

interface VehicleSuccessModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
}

export const VehicleSuccessModal: React.FC<VehicleSuccessModalProps> = ({
  visible,
  onClose,
  title = 'Vehicle Registered Successfully',
  message = 'Your vehicle has been successfully added to your garage.',
}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          {/* Green Success Checkmark Badge */}
          <View style={styles.iconCircle}>
            <Feather name="check-circle" size={48} color="#4d7c0f" />
          </View>

          {/* Heading */}
          <Text style={styles.title}>{title}</Text>

          {/* Message */}
          <Text style={styles.message}>{message}</Text>

          {/* OK / Confirm Button */}
          <TouchableOpacity
            style={styles.okBtn}
            onPress={onClose}
            activeOpacity={0.85}
          >
            <Text style={styles.okBtnText}>Got it</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 28,
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
    borderColor: '#f1f5f9',
    borderWidth: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 8,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#edf6d6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
    textAlign: 'center',
    fontFamily: 'PlusJakartaSans-Bold',
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    fontFamily: 'PlusJakartaSans-Regular',
    lineHeight: 20,
    marginBottom: 24,
  },
  okBtn: {
    backgroundColor: '#a2e52c',
    borderRadius: 16,
    height: 48,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#a2e52c',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  okBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#2e5b02',
    fontFamily: 'PlusJakartaSans-Bold',
  },
});

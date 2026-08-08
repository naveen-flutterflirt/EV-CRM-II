import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';

export interface DeleteConfirmModalProps {
  visible: boolean;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: 'danger' | 'primary';
  icon?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  visible,
  title = 'Confirm Action',
  description = 'Are you sure you want to proceed? This action cannot be undone.',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'danger',
  icon = 'trash-2',
  onConfirm,
  onCancel,
  loading = false,
}) => {
  const isDanger = confirmVariant === 'danger';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          {/* Top Warning Icon Circle */}
          <View style={[styles.iconCircle, isDanger ? styles.dangerCircle : styles.primaryCircle]}>
            <Feather
              name={icon as any}
              size={24}
              color={isDanger ? '#dc2626' : '#2e5b02'}
            />
          </View>

          {/* Title & Description */}
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>

          {/* Action Buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={onCancel}
              disabled={loading}
              activeOpacity={0.8}
            >
              <Text style={styles.cancelBtnText}>{cancelText}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.confirmBtn, isDanger ? styles.dangerConfirmBtn : styles.primaryConfirmBtn]}
              onPress={onConfirm}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color={isDanger ? '#ffffff' : '#2e5b02'} size="small" />
              ) : (
                <Text style={[styles.confirmBtnText, isDanger ? styles.dangerConfirmText : styles.primaryConfirmText]}>
                  {confirmText}
                </Text>
              )}
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
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  dangerCircle: {
    backgroundColor: '#fef2f2',
  },
  primaryCircle: {
    backgroundColor: '#edf6d6',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
    textAlign: 'center',
    fontFamily: 'PlusJakartaSans-Bold',
    marginBottom: 8,
  },
  description: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    fontFamily: 'PlusJakartaSans-Regular',
    lineHeight: 18,
    marginBottom: 24,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    borderRadius: 14,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  confirmBtn: {
    flex: 1,
    borderRadius: 14,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dangerConfirmBtn: {
    backgroundColor: '#dc2626',
  },
  dangerConfirmText: {
    color: '#ffffff',
  },
  primaryConfirmBtn: {
    backgroundColor: '#a2e52c',
  },
  primaryConfirmText: {
    color: '#2e5b02',
  },
  confirmBtnText: {
    fontSize: 14,
    fontWeight: '800',
    fontFamily: 'PlusJakartaSans-Bold',
  },
});

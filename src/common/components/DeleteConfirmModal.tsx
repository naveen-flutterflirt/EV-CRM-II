import React from 'react';
import { Modal, View, Text, StyleSheet } from 'react-native';
import { Button } from './Button';

export interface DeleteConfirmModalProps {
  visible: boolean;
  title?: string;
  description?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  visible,
  title = 'Confirm Deletion',
  description = 'Are you sure you want to delete this record? This action cannot be undone.',
  onConfirm,
  onCancel,
  loading = false,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>

          <View style={styles.buttonRow}>
            <Button
              title="Cancel"
              variant="secondary"
              onPress={onCancel}
              style={styles.flexBtn}
            />
            <Button
              title="Delete"
              variant="danger"
              onPress={onConfirm}
              loading={loading}
              style={styles.flexBtn}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    borderColor: '#e4e4e7',
    borderWidth: 1,
    elevation: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#18181b',
    marginBottom: 8,
  },
  description: {
    fontSize: 13,
    color: '#71717a',
    marginBottom: 20,
    lineHeight: 18,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  flexBtn: {
    flex: 1,
  },
});

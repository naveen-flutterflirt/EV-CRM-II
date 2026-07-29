import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';

interface BookingSuccessScreenProps {
  pickupRequired: boolean;
  selectedDate: string;
  selectedSlotTime: string;
  onGoHome: () => void;
  onTrackStatus: () => void;
}

export const BookingSuccessScreen: React.FC<BookingSuccessScreenProps> = ({
  pickupRequired,
  selectedDate,
  selectedSlotTime,
  onGoHome,
  onTrackStatus,
}) => {
  const formatDateLabel = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('default', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <View style={styles.container}>
      {/* Success Icon */}
      <View style={styles.successIconCircle}>
        <Feather name="check" size={54} color="#ffffff" />
      </View>

      <Text style={styles.title}>Booking Confirmed!</Text>
      <Text style={styles.subtitle}>
        Your service appointment has been successfully scheduled. We will keep you updated.
      </Text>

      {/* Summary Card */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Appointment Summary</Text>

        <View style={styles.rowDivider} />

        {/* Service Mode */}
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>SERVICE MODE</Text>
          <Text style={styles.summaryValue}>
            {pickupRequired ? 'Doorstep pickup' : 'Workshop drop-off'}
          </Text>
        </View>

        <View style={styles.rowDivider} />

        {/* Date */}
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>DATE</Text>
          <Text style={styles.summaryValue}>{formatDateLabel(selectedDate)}</Text>
        </View>

        <View style={styles.rowDivider} />

        {/* Time Slot */}
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>TIME SLOT</Text>
          <Text style={styles.summaryValue}>{selectedSlotTime}</Text>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.primaryButton} onPress={onTrackStatus} activeOpacity={0.8}>
          <Text style={styles.primaryButtonText}>Track Live Status</Text>
          <Feather name="activity" size={20} color="#ffffff" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} onPress={onGoHome} activeOpacity={0.7}>
          <Text style={styles.secondaryButtonText}>Back to Home</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    backgroundColor: '#faf8f3',
  },
  successIconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#4d6a00',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#4d6a00',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1a2b0c',
    fontFamily: 'PlusJakartaSans-Bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#71717a',
    textAlign: 'center',
    fontFamily: 'PlusJakartaSans-Regular',
    paddingHorizontal: 20,
    lineHeight: 20,
    marginBottom: 32,
  },
  summaryCard: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 10,
    elevation: 1,
    marginBottom: 36,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a2b0c',
    fontFamily: 'PlusJakartaSans-Bold',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9ca3af',
    letterSpacing: 0.5,
    fontFamily: 'PlusJakartaSans-Bold',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1c1c1e',
    fontFamily: 'PlusJakartaSans-SemiBold',
  },
  rowDivider: {
    height: 1,
    backgroundColor: '#f4f4f5',
    width: '100%',
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  primaryButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#4d6a00',
    borderRadius: 30,
    paddingVertical: 16,
    paddingHorizontal: 24,
    shadowColor: '#4d6a00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'PlusJakartaSans-Bold',
    marginRight: 8,
  },
  secondaryButton: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
  },
  secondaryButtonText: {
    color: '#4d6a00',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'PlusJakartaSans-Bold',
  },
});

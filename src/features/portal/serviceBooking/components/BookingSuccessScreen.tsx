import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';

interface BookingSuccessScreenProps {
  pickupRequired: boolean;
  selectedCenter?: string;
  selectedDate: string;
  selectedSlotTime: string;
  onGoHome: () => void;
  onTrackStatus: () => void;
}

export const BookingSuccessScreen: React.FC<BookingSuccessScreenProps> = ({
  pickupRequired,
  selectedCenter = 'Downtown Flutter Hub',
  selectedDate,
  selectedSlotTime,
  onGoHome,
  onTrackStatus,
}) => {
  const formatDateLabel = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('default', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <View style={styles.container}>
      {/* Decorative success circles */}
      <View style={styles.successWrapper}>
        <View style={styles.successOuterCircle}>
          <View style={styles.successIconCircle}>
            <Feather name="check" size={44} color="#ffffff" />
          </View>
        </View>
      </View>

      <Text style={styles.title}>Booking Confirmed!</Text>
      <Text style={styles.subtitle}>
        Your service appointment has been successfully scheduled. We've notified our service advisors and technician team.
      </Text>

      {/* Premium Summary Card */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Appointment Details</Text>

        <View style={styles.rowDivider} />

        {/* Service Mode */}
        <View style={styles.summaryRow}>
          <View style={styles.rowLabelContainer}>
            <Feather name={pickupRequired ? "truck" : "compass"} size={15} color="#8cc63f" style={styles.rowIcon} />
            <Text style={styles.summaryLabel}>SERVICE MODE</Text>
          </View>
          <Text style={styles.summaryValue}>
            {pickupRequired ? 'Doorstep Pickup' : 'Workshop Drop-off'}
          </Text>
        </View>

        {selectedCenter ? (
          <>
            <View style={styles.rowDivider} />
            {/* Service Center */}
            <View style={styles.summaryRow}>
              <View style={styles.rowLabelContainer}>
                <Feather name="map-pin" size={15} color="#8cc63f" style={styles.rowIcon} />
                <Text style={styles.summaryLabel}>SERVICE CENTER</Text>
              </View>
              <Text style={[styles.summaryValue, { maxWidth: '55%', textAlign: 'right' }]} numberOfLines={2}>
                {selectedCenter}
              </Text>
            </View>
          </>
        ) : null}

        <View style={styles.rowDivider} />

        {/* Date */}
        <View style={styles.summaryRow}>
          <View style={styles.rowLabelContainer}>
            <Feather name="calendar" size={15} color="#8cc63f" style={styles.rowIcon} />
            <Text style={styles.summaryLabel}>DATE</Text>
          </View>
          <Text style={styles.summaryValue}>{formatDateLabel(selectedDate)}</Text>
        </View>

        <View style={styles.rowDivider} />

        {/* Time Slot */}
        <View style={styles.summaryRow}>
          <View style={styles.rowLabelContainer}>
            <Feather name="clock" size={15} color="#8cc63f" style={styles.rowIcon} />
            <Text style={styles.summaryLabel}>TIME SLOT</Text>
          </View>
          <Text style={styles.summaryValue}>{selectedSlotTime}</Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.primaryButton} onPress={onTrackStatus} activeOpacity={0.8}>
          <Text style={styles.primaryButtonText}>Track Live Status</Text>
          <Feather name="arrow-right" size={18} color="#1a2b0c" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} onPress={onGoHome} activeOpacity={0.7}>
          <Feather name="home" size={15} color="#2e5b02" style={{ marginRight: 6 }} />
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
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: '#faf8f3',
  },
  successWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
    marginBottom: 20,
  },
  successOuterCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(140, 198, 63, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successIconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#8cc63f',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#8cc63f',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
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
    paddingHorizontal: 16,
    lineHeight: 20,
    marginBottom: 32,
  },
  summaryCard: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#f1f1f3',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.03,
    shadowRadius: 12,
    elevation: 2,
    marginBottom: 36,
  },
  summaryTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1a2b0c',
    fontFamily: 'PlusJakartaSans-Bold',
    marginBottom: 14,
    letterSpacing: 0.2,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
  rowLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowIcon: {
    marginRight: 8,
    opacity: 0.95,
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
    backgroundColor: '#8cc63f',
    borderRadius: 30,
    paddingVertical: 16,
    paddingHorizontal: 24,
    shadowColor: '#8cc63f',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'PlusJakartaSans-Bold',
    marginRight: 8,
  },
  secondaryButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
  },
  secondaryButtonText: {
    color: '#2e5b02',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'PlusJakartaSans-Bold',
  },
});

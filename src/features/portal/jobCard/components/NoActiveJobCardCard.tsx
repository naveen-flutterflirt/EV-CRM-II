import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';

interface NoActiveJobCardCardProps {
  onBookServicePress?: () => void;
}

export const NoActiveJobCardCard: React.FC<NoActiveJobCardCardProps> = ({
  onBookServicePress,
}) => {
  return (
    <View style={styles.cardContainer}>
      <View style={styles.topRow}>
        <View style={styles.iconCircle}>
          <Feather name="battery-charging" size={24} color="#4d7c0f" />
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>ALL SYSTEMS OK</Text>
        </View>
      </View>

      <Text style={styles.headingTitle}>No Active Service Job Card</Text>
      <Text style={styles.subText}>
        Your EV is running smooth! Time for a routine checkup or maintenance? Book a Service now.
      </Text>

      <TouchableOpacity
        style={styles.bookBtn}
        onPress={onBookServicePress}
        activeOpacity={0.85}
      >
        <Feather name="calendar" size={16} color="#1a2b0c" style={{ marginRight: 6 }} />
        <Text style={styles.bookBtnText}>Book a Service</Text>
        <Feather name="arrow-right" size={16} color="#1a2b0c" style={{ marginLeft: 4 }} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderColor: '#edf6d6',
    borderWidth: 1,
    shadowColor: '#64748b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#edf6d6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#4d7c0f',
    letterSpacing: 0.5,
    fontFamily: 'PlusJakartaSans-Bold',
  },
  headingTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 6,
    fontFamily: 'PlusJakartaSans-Bold',
  },
  subText: {
    fontSize: 12,
    color: '#64748b',
    lineHeight: 18,
    marginBottom: 16,
    fontFamily: 'PlusJakartaSans-Regular',
  },
  bookBtn: {
    backgroundColor: '#a2e52c',
    borderRadius: 20,
    height: 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1a2b0c',
    fontFamily: 'PlusJakartaSans-Bold',
  },
});

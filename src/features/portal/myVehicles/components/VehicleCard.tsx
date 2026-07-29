import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Vehicle } from '../../../../common/types';

export const VehicleCard: React.FC<{ vehicle?: Vehicle }> = ({ vehicle }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{vehicle?.brand || 'Ather'} {vehicle?.model || '450X'}</Text>
      <Text style={styles.subtitle}>{vehicle?.registrationNumber || 'MP04-EV-1024'}</Text>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>Active Warranty</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    backgroundColor: '#ffffff',
    borderColor: '#e4e4e7',
    borderWidth: 1,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  title: { color: '#18181b', fontSize: 16, fontWeight: 'bold' },
  subtitle: { color: '#71717a', fontSize: 13, marginTop: 4 },
  badge: {
    backgroundColor: '#ecfdf5',
    borderColor: '#a7f3d0',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  badgeText: { color: '#047857', fontSize: 11, fontWeight: 'bold' },
});

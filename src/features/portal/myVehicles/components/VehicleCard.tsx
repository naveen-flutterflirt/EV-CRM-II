import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Vehicle } from '../types';

interface VehicleCardProps {
  vehicle?: Vehicle;
  onPress?: () => void;
}

export const VehicleCard: React.FC<VehicleCardProps> = ({ vehicle, onPress }) => {
  const brand = vehicle?.brand || (vehicle?.model as any)?.manufacturer?.name || (vehicle?.model as any)?.manufacturer || '';
  const model = (typeof vehicle?.model === 'string' ? vehicle.model : (vehicle?.model as any)?.modelName) || (vehicle as any)?.modelName || '';
  const regNo = vehicle?.registrationNumber || (vehicle as any)?.registrationNo || 'Not Registered';
  const warranty = vehicle?.warrantyStatus || 'Standard';

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.88}
    >
      <View style={styles.topRow}>
        <View>
          <Text style={styles.title}>{brand ? `${brand} ${model}`.trim() : model || 'No Vehicle'}</Text>
          <Text style={styles.subtitle}>{regNo}</Text>
        </View>

        <View style={styles.badge}>
          <Feather name="shield" size={12} color="#4d7c0f" style={{ marginRight: 4 }} />
          <Text style={styles.badgeText}>{warranty}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};


const styles = StyleSheet.create({
  card: {
    padding: 16,
    backgroundColor: '#ffffff',
    borderColor: '#f1f0f7',
    borderWidth: 1,
    borderRadius: 20,
    marginBottom: 12,
    shadowColor: '#64748b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    color: '#0f172a',
    fontSize: 16,
    fontWeight: '800',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  subtitle: {
    color: '#64748b',
    fontSize: 12,
    marginTop: 2,
    fontFamily: 'PlusJakartaSans-Regular',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#edf6d6',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  badgeText: {
    color: '#4d7c0f',
    fontSize: 11,
    fontWeight: '800',
    fontFamily: 'PlusJakartaSans-Bold',
  },
});

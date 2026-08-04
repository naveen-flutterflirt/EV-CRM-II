import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';

interface QuickActionsGridProps {
  onBookService?: () => void;
  onLiveTracking?: () => void;
  onOrderParts?: () => void;
  onEmergencyRsa?: () => void;
}

export const QuickActionsGrid: React.FC<QuickActionsGridProps> = ({
  onBookService,
  onLiveTracking,
  onOrderParts,
  onEmergencyRsa,
}) => {
  return (
    <View style={styles.gridContainer}>
      {/* Row 1 */}
      <View style={styles.row}>
        {/* Book Service */}
        <TouchableOpacity
          style={styles.actionCard}
          onPress={onBookService}
          activeOpacity={0.8}
        >
          <View style={styles.iconCircle}>
            <Feather name="tool" size={18} color="#2e5b02" />
          </View>
          <Text style={styles.cardLabel}>Book service</Text>
        </TouchableOpacity>

        {/* Live Tracking */}
        <TouchableOpacity
          style={styles.actionCard}
          onPress={onLiveTracking}
          activeOpacity={0.8}
        >
          <View style={styles.iconCircle}>
            <Feather name="map-pin" size={18} color="#2e5b02" />
          </View>
          <Text style={styles.cardLabel}>Live tracking</Text>
        </TouchableOpacity>
      </View>

      {/* Row 2 */}
      <View style={styles.row}>
        {/* Order Parts */}
        {onOrderParts ? (
          <TouchableOpacity
            style={styles.actionCard}
            onPress={onOrderParts}
            activeOpacity={0.8}
          >
            <View style={styles.iconCircle}>
              <Feather name="shopping-bag" size={18} color="#2e5b02" />
            </View>
            <Text style={styles.cardLabel}>Order parts</Text>
          </TouchableOpacity>
        ) : null}

        {/* Emergency RSA */}
        <TouchableOpacity
          style={[styles.actionCard, styles.rsaCard]}
          onPress={onEmergencyRsa}
          activeOpacity={0.8}
        >
          <View style={[styles.iconCircle, styles.rsaIconCircle]}>
            <Feather name="alert-circle" size={18} color="#dc2626" />
          </View>
          <Text style={[styles.cardLabel, styles.rsaLabel]}>Emergency RSA</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  gridContainer: {
    gap: 12,
    marginBottom: 20,
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  actionCard: {
    flex: 1,
    backgroundColor: '#f3f5fa', // Soft lavender/blue-gray background matching mockup
    borderRadius: 24,
    padding: 16,
    minHeight: 110,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  rsaCard: {
    backgroundColor: '#fff5f5', // Soft red background for RSA button
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#e6efda',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  rsaIconCircle: {
    backgroundColor: '#fee2e2', // Light red circle for RSA icon
  },
  cardLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1a2b0c',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  rsaLabel: {
    color: '#dc2626', // Red text color for RSA button
  },
});

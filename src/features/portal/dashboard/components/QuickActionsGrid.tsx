import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';

interface QuickActionsGridProps {
  onBookService?: () => void;
  onLiveTracking?: () => void;
  onOrderParts?: () => void;
}

export const QuickActionsGrid: React.FC<QuickActionsGridProps> = ({
  onBookService,
  onLiveTracking,
  onOrderParts,
}) => {
  return (
    <View style={styles.gridContainer}>
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
    backgroundColor: '#f3f5fa',
    borderRadius: 24,
    padding: 16,
    minHeight: 110,
    justifyContent: 'center',
    alignItems: 'flex-start',
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
  cardLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1a2b0c',
    fontFamily: 'PlusJakartaSans-Bold',
  },
});

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface QuickActionsGridProps {
  onTrackService?: () => void;
  onSpareParts?: () => void;
}

export const QuickActionsGrid: React.FC<QuickActionsGridProps> = ({
  onTrackService,
  onSpareParts,
}) => {
  return (
    <View style={styles.gridContainer}>
      {/* Card 1: Track service */}
      <TouchableOpacity
        style={styles.actionCard}
        onPress={onTrackService}
        activeOpacity={0.85}
      >
        <View style={styles.iconCircle}>
          <Text style={styles.iconText}>📍</Text>
        </View>
        <Text style={styles.cardLabel}>Track service</Text>
      </TouchableOpacity>

      {/* Card 2: Spare parts */}
      <TouchableOpacity
        style={styles.actionCard}
        onPress={onSpareParts}
        activeOpacity={0.85}
      >
        <View style={styles.iconCircle}>
          <Text style={styles.iconText}>🔋</Text>
        </View>
        <Text style={styles.cardLabel}>Spare parts</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  gridContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  actionCard: {
    flex: 1,
    backgroundColor: '#f2f0e8',
    borderRadius: 18,
    padding: 16,
    minHeight: 110,
    justifyContent: 'space-between',
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  iconText: {
    fontSize: 16,
  },
  cardLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#18181b',
    marginTop: 12,
  },
});

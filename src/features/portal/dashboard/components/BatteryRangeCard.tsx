import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface BatteryRangeCardProps {
  batteryPct?: number; // e.g. 86
  rangeKm?: number; // e.g. 92
  odometerKm?: number; // default e.g. 14350
  lastSyncedText?: string; // default e.g. "2 min ago"
}

export const BatteryRangeCard: React.FC<BatteryRangeCardProps> = ({
  batteryPct,
  rangeKm,
  odometerKm,
  lastSyncedText = 'Just now',
}) => {
  const displaySoc = batteryPct !== undefined && batteryPct !== null ? `${batteryPct}%` : 'N/A';
  const displayRange = rangeKm !== undefined && rangeKm !== null ? `${rangeKm} km` : 'N/A';
  const displayOdo = odometerKm !== undefined && odometerKm !== null
    ? `${odometerKm.toLocaleString('en-US')} km`
    : 'N/A';

  return (
    <View style={styles.cardContainer}>
      {/* Left Column: Circular SOC Ring */}
      <View style={styles.socContainer}>
        <View style={styles.outerRing}>
          <View style={styles.innerCircle}>
            <Text style={styles.socPercentage}>{displaySoc}</Text>
            <Text style={styles.socLabel}>SOC</Text>
          </View>
        </View>
      </View>

      {/* Right Column: Status and Info */}
      <View style={styles.metricsContainer}>
        {/* Estimated Range */}
        <View style={styles.metricSection}>
          <Text style={styles.metricLabel}>ESTIMATED RANGE</Text>
          <Text style={styles.rangeValue}>
            {displayRange} {displayRange !== 'N/A' ? <Text style={styles.rangeUnit}>remaining</Text> : null}
          </Text>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Odometer */}
        <View style={styles.metricSection}>
          <Text style={styles.metricLabel}>ODOMETER</Text>
          <Text style={styles.odoValue}>{displayOdo}</Text>
        </View>

        {/* Last Synced Sync Status */}
        <View style={styles.syncRow}>
          <View style={styles.syncDot} />
          <Text style={styles.syncText}>Last synced: {lastSyncedText}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    flexDirection: 'row',
    backgroundColor: '#e6f0d8', // Premium light pastel green card background
    borderRadius: 28,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
  },
  socContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  outerRing: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#e6f0d8',
    borderColor: '#4c7a18', // dark green progress ring color
    borderWidth: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#e6f0d8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  socPercentage: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1a2b0c',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  socLabel: {
    fontSize: 10,
    color: '#7a8a6b',
    fontWeight: '700',
    fontFamily: 'PlusJakartaSans-Bold',
    marginTop: 2,
  },
  metricsContainer: {
    flex: 1,
  },
  metricSection: {
    marginVertical: 4,
  },
  metricLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#7a8a6b',
    letterSpacing: 0.8,
    fontFamily: 'PlusJakartaSans-Bold',
    marginBottom: 2,
  },
  rangeValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  rangeUnit: {
    fontSize: 13,
    color: '#7a8a6b',
    fontWeight: '400',
    fontFamily: 'PlusJakartaSans-Regular',
  },
  divider: {
    height: 1,
    backgroundColor: '#c6d8b2', // soft green border separator
    marginVertical: 6,
    width: '100%',
  },
  odoValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  syncRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  syncDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4c7a18',
    marginRight: 6,
  },
  syncText: {
    fontSize: 10,
    color: '#7a8a6b',
    fontFamily: 'PlusJakartaSans-Medium',
  },
});

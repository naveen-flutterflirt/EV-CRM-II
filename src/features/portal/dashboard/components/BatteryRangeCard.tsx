import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '../../../../common/components/Card';

interface BatteryRangeCardProps {
  batteryPct?: number; // e.g. 84
  rangeKm?: number; // e.g. 112
}

export const BatteryRangeCard: React.FC<BatteryRangeCardProps> = ({
  batteryPct = 84,
  rangeKm = 112,
}) => {
  return (
    <Card style={styles.cardContainer}>
      {/* Big Percentage Readout */}
      <View style={styles.valueRow}>
        <Text style={styles.numberText}>{batteryPct}</Text>
        <Text style={styles.percentSymbol}>%</Text>
      </View>

      {/* Metric Label */}
      <Text style={styles.metricLabel}>
        CURRENT RANGE • {rangeKm} KM
      </Text>

      {/* Dashed Wave Graph Line */}
      <View style={styles.waveContainer}>
        <View style={styles.dashedCurve}>
          <Text style={styles.dashedCurveText}>
            - - - - - - - - - - - - - - - - - - - - - - - - -
          </Text>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    padding: 24,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    borderColor: '#e4e4e7',
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 20,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  numberText: {
    fontSize: 54,
    fontWeight: '700',
    color: '#3f6212',
    letterSpacing: -1,
  },
  percentSymbol: {
    fontSize: 24,
    fontWeight: '700',
    color: '#3f6212',
    marginLeft: 4,
  },
  metricLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#71717a',
    letterSpacing: 1,
    marginTop: 4,
    marginBottom: 20,
  },
  waveContainer: {
    width: '100%',
    alignItems: 'center',
    overflow: 'hidden',
    height: 18,
    justifyContent: 'center',
  },
  dashedCurve: {
    width: '100%',
    alignItems: 'center',
  },
  dashedCurveText: {
    color: '#84cc16',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 2,
  },
});

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const DashboardStatsCard: React.FC = () => {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Workshop Performance Stats</Text>
      <Text style={styles.metric}>{"Today's Revenue: ₹14,500"}</Text>
      <Text style={styles.metric}>Active Job Cards: 12 In Progress</Text>
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  title: { color: '#18181b', fontSize: 16, fontWeight: 'bold', marginBottom: 8, fontFamily: 'PlusJakartaSans-Bold' },
  metric: { color: '#71717a', fontSize: 13, marginTop: 2, fontWeight: '500', fontFamily: 'PlusJakartaSans-Medium' },
});

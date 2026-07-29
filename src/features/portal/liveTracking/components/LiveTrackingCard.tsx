import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const LiveTrackingCard: React.FC = () => {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Live Service Tracking Timeline</Text>
      <Text style={styles.status}>Status: IN SERVICE (Job #JC-1001)</Text>
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
  title: { color: '#18181b', fontSize: 16, fontWeight: 'bold' },
  status: { color: '#82b440', fontSize: 13, marginTop: 4, fontWeight: '600' },
});

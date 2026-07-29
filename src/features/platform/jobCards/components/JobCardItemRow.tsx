import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const JobCardItemRow: React.FC = () => {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Job Card Line Item Row</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: { padding: 16, backgroundColor: '#1e293b', borderRadius: 12 },
  title: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
});

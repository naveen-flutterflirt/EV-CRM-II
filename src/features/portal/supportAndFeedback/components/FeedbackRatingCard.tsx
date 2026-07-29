import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const FeedbackRatingCard: React.FC = () => {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Post-Service Rating & Feedback</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: { padding: 16, backgroundColor: '#1e293b', borderRadius: 12 },
  title: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
});

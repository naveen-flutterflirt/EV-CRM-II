import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';

export interface BadgeProps {
  label: string;
  variant?: 'success' | 'warning' | 'danger' | 'info';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'info',
  style,
  textStyle,
}) => {
  let badgeStyle = styles.infoBg;
  let labelStyle = styles.infoText;

  if (variant === 'success') {
    badgeStyle = styles.successBg;
    labelStyle = styles.successText;
  } else if (variant === 'warning') {
    badgeStyle = styles.warningBg;
    labelStyle = styles.warningText;
  } else if (variant === 'danger') {
    badgeStyle = styles.dangerBg;
    labelStyle = styles.dangerText;
  }

  return (
    <View style={[styles.badge, badgeStyle, style]}>
      <Text style={[styles.text, labelStyle, textStyle]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  successBg: { backgroundColor: '#ecfdf5', borderColor: '#a7f3d0' },
  successText: { color: '#047857' },
  warningBg: { backgroundColor: '#fffbeb', borderColor: '#fde68a' },
  warningText: { color: '#b45309' },
  dangerBg: { backgroundColor: '#fef2f2', borderColor: '#fca5a5' },
  dangerText: { color: '#dc2626' },
  infoBg: { backgroundColor: '#f0f9ff', borderColor: '#bae6fd' },
  infoText: { color: '#0369a1' },
});

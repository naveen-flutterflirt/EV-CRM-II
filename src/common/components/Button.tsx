import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';

export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  style,
  textStyle,
}) => {
  const getContainerStyle = (): ViewStyle => {
    let bgStyle: ViewStyle = {};
    if (variant === 'primary') bgStyle = styles.bgPrimary;
    if (variant === 'secondary') bgStyle = styles.bgSecondary;
    if (variant === 'danger') bgStyle = styles.bgDanger;
    if (variant === 'outline') bgStyle = styles.bgOutline;

    let sizeStyle: ViewStyle = {};
    if (size === 'sm') sizeStyle = styles.sizeSm;
    if (size === 'md') sizeStyle = styles.sizeMd;
    if (size === 'lg') sizeStyle = styles.sizeLg;

    return {
      ...styles.baseButton,
      ...bgStyle,
      ...sizeStyle,
      ...(disabled ? styles.disabled : {}),
      ...style,
    };
  };

  const getTextStyle = (): TextStyle => {
    let colorStyle: TextStyle = { color: '#ffffff' };
    if (variant === 'outline') colorStyle = { color: '#82b440' };
    if (variant === 'secondary') colorStyle = { color: '#18181b' };

    return {
      ...styles.baseText,
      ...colorStyle,
      ...textStyle,
    };
  };

  return (
    <TouchableOpacity
      style={getContainerStyle()}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? '#82b440' : '#ffffff'} />
      ) : (
        <Text style={getTextStyle()}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  baseButton: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bgPrimary: { backgroundColor: '#82b440' },
  bgSecondary: { backgroundColor: '#f4f4f5', borderWidth: 1, borderColor: '#e4e4e7' },
  bgDanger: { backgroundColor: '#dc2626' },
  bgOutline: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#82b440' },
  sizeSm: { paddingVertical: 8, paddingHorizontal: 12 },
  sizeMd: { paddingVertical: 12, paddingHorizontal: 16 },
  sizeLg: { paddingVertical: 16, paddingHorizontal: 24 },
  disabled: { opacity: 0.5 },
  baseText: { fontWeight: 'bold', fontSize: 14 },
});

import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TextInputProps,
  ViewStyle,
} from 'react-native';

export interface InputFieldProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
}

export const InputField: React.FC<InputFieldProps> = ({
  label,
  error,
  containerStyle,
  style,
  ...props
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      {label ? <Text style={styles.label}>{label.toUpperCase()}</Text> : null}
      <TextInput
        style={[styles.input, error ? styles.inputError : null, style]}
        placeholderTextColor="#9ca3af"
        {...props}
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 14,
    width: '100%',
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    color: '#71717a',
    letterSpacing: 1,
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#f9f9fb',
    borderColor: '#e4e4e7',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#18181b',
    fontSize: 14,
  },
  inputError: {
    borderColor: '#ef4444',
  },
  errorText: {
    color: '#dc2626',
    fontSize: 11,
    marginTop: 4,
    fontWeight: '500',
  },
});

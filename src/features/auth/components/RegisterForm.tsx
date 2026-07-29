import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useAuthHook } from '../hooks/useAuth';

interface RegisterFormProps {
  onRegisterSuccess: (user: any) => void;
  onNavigateToLogin: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({
  onRegisterSuccess,
  onNavigateToLogin,
}) => {
  const { register, loading, error } = useAuthHook();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');

  const handleRegister = async () => {
    if (!name || !phone) {
      setLocalError('Please enter your full name and phone number');
      return;
    }
    if (!email || !email.includes('@')) {
      setLocalError('Please enter a valid Gmail / Email address');
      return;
    }
    if (!password || password.length < 6) {
      setLocalError('Password must be at least 6 characters long');
      return;
    }
    setLocalError('');
    try {
      const res = await register({ name, phone, email, password });
      if (res.user) {
        onRegisterSuccess(res.user);
      }
    } catch (err: any) {
      setLocalError(err.message || 'Registration failed');
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.headerContainer}>
        <View style={styles.logoBadge}>
          <Text style={styles.logoBadgeText}>CUSTOMER ONBOARDING</Text>
        </View>
        <Text style={styles.title}>Create EV Customer Account</Text>
        <Text style={styles.subtitle}>Book services, live track, & buy spare parts</Text>
      </View>

      {(error || localError) ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{localError || error}</Text>
        </View>
      ) : null}

      <View style={styles.inputGroup}>
        <Text style={styles.fieldLabel}>FULL NAME</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Piyush Jhade"
          placeholderTextColor="#9ca3af"
          value={name}
          onChangeText={setName}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.fieldLabel}>PHONE NUMBER</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. 9876543210"
          placeholderTextColor="#9ca3af"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.fieldLabel}>EMAIL ADDRESS (GMAIL)</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. testuser@gmail.com"
          placeholderTextColor="#9ca3af"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.fieldLabel}>PASSWORD</Text>
        <TextInput
          style={styles.input}
          placeholder="Create account password"
          placeholderTextColor="#9ca3af"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
      </View>

      <TouchableOpacity
        style={styles.submitBtn}
        onPress={handleRegister}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text style={styles.submitBtnText}>Create Account & Continue</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={styles.footerLink} onPress={onNavigateToLogin}>
        <Text style={styles.footerText}>
          Already registered? <Text style={styles.highlightText}>Sign In</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    borderColor: '#e4e4e7',
    borderWidth: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 4,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoBadge: {
    backgroundColor: '#82b440',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 8,
  },
  logoBadgeText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 11,
    letterSpacing: 1,
    fontFamily: 'PlusJakartaSans-Bold',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#18181b',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  subtitle: {
    fontSize: 12,
    color: '#71717a',
    marginTop: 2,
    textAlign: 'center',
    fontFamily: 'PlusJakartaSans-Regular',
  },
  errorContainer: {
    backgroundColor: '#fef2f2',
    borderColor: '#fca5a5',
    borderWidth: 1,
    padding: 10,
    borderRadius: 10,
    marginBottom: 14,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '500',
    fontFamily: 'PlusJakartaSans-Medium',
  },
  inputGroup: {
    marginBottom: 12,
  },
  fieldLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#71717a',
    letterSpacing: 1,
    marginBottom: 6,
    fontFamily: 'PlusJakartaSans-Bold',
  },
  input: {
    backgroundColor: '#f9f9fb',
    borderColor: '#e4e4e7',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: '#18181b',
    fontSize: 14,
    fontFamily: 'PlusJakartaSans-Regular',
  },
  submitBtn: {
    backgroundColor: '#82b440',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  submitBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  footerLink: {
    marginTop: 16,
    alignItems: 'center',
  },
  footerText: {
    color: '#71717a',
    fontSize: 12,
    fontFamily: 'PlusJakartaSans-Regular',
  },
  highlightText: {
    color: '#82b440',
    fontWeight: 'bold',
    fontFamily: 'PlusJakartaSans-Bold',
  },
});

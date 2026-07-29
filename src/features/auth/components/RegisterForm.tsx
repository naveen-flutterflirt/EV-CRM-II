import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
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
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState('');

  const handleRegister = async () => {
    if (!name) {
      setLocalError('Please enter your full name');
      return;
    }
    if (!phone) {
      setLocalError('Please enter your phone number');
      return;
    }
    if (!email) {
      setLocalError('Please enter your email address');
      return;
    }
    if (!email.includes('@')) {
      setLocalError('Please enter a valid Gmail / Email address');
      return;
    }
    if (!password) {
      setLocalError('Please enter your password');
      return;
    }
    if (password.length < 6) {
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
      setLocalError(err.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.card}>
        {/* Brand Header */}
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Create Account</Text>
        </View>

        {/* Error Alert */}
        {(error || localError) ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{localError || error}</Text>
          </View>
        ) : null}

        <Text style={styles.fieldLabel}>Sign up to get started</Text>

        {/* Full Name Input */}
        <View style={styles.inputContainer}>
          <Feather name="user" size={20} color="#7a8a6b" style={styles.inputIcon} />
          <TextInput
            style={styles.textInput}
            placeholder="Full Name"
            placeholderTextColor="#8a9a7a"
            value={name}
            onChangeText={setName}
          />
        </View>

        {/* Phone Number Input */}
        <View style={styles.inputContainer}>
          <Feather name="phone" size={20} color="#7a8a6b" style={styles.inputIcon} />
          <TextInput
            style={styles.textInput}
            placeholder="Phone Number"
            placeholderTextColor="#8a9a7a"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />
        </View>

        {/* Email Address Input */}
        <View style={styles.inputContainer}>
          <Feather name="mail" size={20} color="#7a8a6b" style={styles.inputIcon} />
          <TextInput
            style={styles.textInput}
            placeholder="Email Address"
            placeholderTextColor="#8a9a7a"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
          />
        </View>

        {/* Password Input */}
        <View style={styles.inputContainer}>
          <Feather name="lock" size={20} color="#7a8a6b" style={styles.inputIcon} />
          <TextInput
            style={styles.textInput}
            placeholder="Password"
            placeholderTextColor="#8a9a7a"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Feather
              name={showPassword ? 'eye-off' : 'eye'}
              size={20}
              color="#7a8a6b"
            />
          </TouchableOpacity>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={styles.submitBtn}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#2e5b02" />
          ) : (
            <>
              <Text style={styles.submitBtnText}>Sign Up</Text>
              <Feather name="arrow-right" size={20} color="#2e5b02" style={styles.submitBtnIcon} />
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Switch to Login (placed outside the card to match mockup) */}
      <TouchableOpacity style={styles.footerLink} onPress={onNavigateToLogin}>
        <Text style={styles.footerText}>
          {"Already registered? "}<Text style={styles.highlightText}>Sign In</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#eaf7d6', // beautiful pastel green mockup background
    borderRadius: 36,
    paddingHorizontal: 24,
    paddingVertical: 32,
    width: '100%',
    shadowColor: '#8ebd52',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.15,
    shadowRadius: 30,
    elevation: 8,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 28,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a2b0c', // dark charcoal-green
    letterSpacing: -0.5,
    fontFamily: 'PlusJakartaSans-Bold',
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#7b8b6f', // soft dark-gray green
    marginBottom: 12,
    paddingLeft: 4,
    fontFamily: 'PlusJakartaSans-Medium',
  },
  errorContainer: {
    backgroundColor: '#fef2f2',
    borderColor: '#fca5a5',
    borderWidth: 1,
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '500',
    fontFamily: 'PlusJakartaSans-Medium',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dfedd1', // input light tint
    borderRadius: 25,
    height: 52,
    paddingHorizontal: 18,
    marginBottom: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    color: '#1a2b0c',
    fontSize: 15,
    paddingVertical: 0,
    fontFamily: 'PlusJakartaSans-Regular',
  },
  submitBtn: {
    backgroundColor: '#a2e52c', // bright brand green button
    borderRadius: 25,
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    shadowColor: '#a2e52c',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  submitBtnText: {
    color: '#2e5b02', // dark forest/olive text
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  submitBtnIcon: {
    marginLeft: 6,
  },
  footerLink: {
    marginTop: 32,
    alignItems: 'center',
  },
  footerText: {
    color: '#71717a',
    fontSize: 14,
    fontFamily: 'PlusJakartaSans-Regular',
  },
  highlightText: {
    color: '#1a2b0c',
    fontWeight: '700',
    textDecorationLine: 'underline',
    fontFamily: 'PlusJakartaSans-Bold',
  },
});

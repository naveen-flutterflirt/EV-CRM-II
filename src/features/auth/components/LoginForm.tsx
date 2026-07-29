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

interface LoginFormProps {
  onLoginSuccess: (user: any) => void;
  onNavigateToRegister: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onLoginSuccess,
  onNavigateToRegister,
}) => {
  const { login, loading, error } = useAuthHook();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState('');

  const handleLogin = async () => {
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
    setLocalError('');
    try {
      const res = await login({ email, password });
      if (res.user) {
        onLoginSuccess(res.user);
      }
    } catch (err: any) {
      setLocalError(err.message || 'Invalid email or password. Please try again.');
    }
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.card}>
        {/* Brand Header */}
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Welcome back</Text>
        </View>

        {/* Error Alert */}
        {(error || localError) ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{localError || error}</Text>
          </View>
        ) : null}

        <Text style={styles.fieldLabel}>Login to continue</Text>

        {/* Input Fields */}
        <View style={styles.inputContainer}>
          <Feather name="user" size={20} color="#7a8a6b" style={styles.inputIcon} />
          <TextInput
            style={styles.textInput}
            placeholder="Email or Phone Number"
            placeholderTextColor="#8a9a7a"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
          />
        </View>

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

        {/* Forgot Password */}
        <TouchableOpacity style={styles.forgotPasswordContainer}>
          <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
        </TouchableOpacity>

        {/* Submit Button */}
        <TouchableOpacity
          style={styles.submitBtn}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#2e5b02" />
          ) : (
            <>
              <Text style={styles.submitBtnText}>Login</Text>
              <Feather name="arrow-right" size={20} color="#2e5b02" style={styles.submitBtnIcon} />
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Switch to Register (placed outside the card to match mockup) */}
      <TouchableOpacity style={styles.footerLink} onPress={onNavigateToRegister}>
        <Text style={styles.footerText}>
          {"Don't have an account? "}<Text style={styles.highlightText}>Sign Up</Text>
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
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginTop: 2,
    marginBottom: 16,
    paddingRight: 4,
  },
  forgotPasswordText: {
    color: '#1a2b0c',
    fontSize: 13,
    fontWeight: '700',
    fontFamily: 'PlusJakartaSans-Bold',
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

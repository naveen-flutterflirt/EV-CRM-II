import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Image,
  SafeAreaView,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAuthHook } from '../src/features/auth/hooks/useAuth';

export default function ResetPasswordRoute() {
  const { token: urlToken } = useLocalSearchParams<{ token?: string }>();
  const { resetPassword, loading } = useAuthHook();
  
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (urlToken) {
      setToken(urlToken);
    }
  }, [urlToken]);

  const handleResetPassword = async () => {
    if (!token) {
      setError('Please enter or verify the reset token');
      return;
    }
    if (!newPassword) {
      setError('Please enter your new password');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    setError('');
    setSuccessMessage('');
    try {
      const res = await resetPassword({ token: token.trim(), password: newPassword });
      if (res.success) {
        setSuccessMessage('Password reset successfully! Redirecting you to sign in...');
        setTimeout(() => {
          router.replace('/');
        }, 2000);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to reset password. Token might be invalid or expired.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header Navigation */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerNavBtn} onPress={() => router.replace('/')} activeOpacity={0.7}>
            <Feather name="arrow-left" size={24} color="#000000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Reset Password</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.container}>
          <Image
            source={require('../assets/images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />

          <View style={styles.card}>
            {/* Title */}
            <View style={styles.headerContainer}>
              <Text style={styles.title}>Enter New Password</Text>
            </View>

            {/* Success and Error Alerts */}
            {successMessage ? (
              <View style={styles.successContainer}>
                <Text style={styles.successText}>{successMessage}</Text>
              </View>
            ) : null}

            {error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <Text style={styles.fieldLabel}>
              Enter your desired new password below to reset your password.
            </Text>

            {/* New Password Input */}
            <View style={styles.inputContainer}>
              <Feather name="lock" size={20} color="#7a8a6b" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="New Password"
                placeholderTextColor="#8a9a7a"
                secureTextEntry={!showPassword}
                value={newPassword}
                onChangeText={setNewPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Feather
                  name={showPassword ? 'eye-off' : 'eye'}
                  size={20}
                  color="#7a8a6b"
                />
              </TouchableOpacity>
            </View>

            {/* Submit Reset Button */}
            <TouchableOpacity
              style={styles.submitBtn}
              onPress={handleResetPassword}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#2e5b02" />
              ) : (
                <>
                  <Text style={styles.submitBtnText}>Reset Password</Text>
                  <Feather name="check" size={20} color="#2e5b02" style={styles.submitBtnIcon} />
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Switch to Login Footer */}
          <TouchableOpacity style={styles.footerLink} onPress={() => router.replace('/')}>
            <Text style={styles.footerText}>
              {"Remember your password? "}<Text style={styles.highlightText}>Sign In</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f4f4f5',
  },
  headerNavBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  headerSpacer: {
    width: 40,
  },
  container: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 24,
    paddingVertical: 20,
    alignItems: 'center',
  },
  logo: {
    width: 140,
    height: 140,
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#eaf7d6',
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
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a2b0c',
    letterSpacing: -0.5,
    fontFamily: 'PlusJakartaSans-Bold',
    textAlign: 'center',
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#7b8b6f',
    marginBottom: 16,
    textAlign: 'center',
    lineHeight: 18,
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
  successContainer: {
    backgroundColor: '#ecfdf5',
    borderColor: '#a7f3d0',
    borderWidth: 1,
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  successText: {
    color: '#047857',
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '500',
    fontFamily: 'PlusJakartaSans-Medium',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dfedd1',
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
    backgroundColor: '#a2e52c',
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
    color: '#2e5b02',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  submitBtnIcon: {
    marginLeft: 6,
  },
  footerLink: {
    marginTop: 24,
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

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Keyboard,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { cookieStore } from '../../../common/services/cookieStore';
import { sendOtpApi, verifyOtpApi } from '../api';

const { width } = Dimensions.get('window');

interface EmailVerificationScreenProps {
  email: string;
  onVerificationSuccess: (user?: any) => void;
  onChangeEmail?: () => void;
  onBackToLogin: () => void;
}

export const EmailVerificationScreen: React.FC<EmailVerificationScreenProps> = ({
  email: initialEmail,
  onVerificationSuccess,
  onChangeEmail,
  onBackToLogin,
}) => {
  const [phase, setPhase] = useState<'email' | 'otp'>(initialEmail ? 'otp' : 'email');
  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState(initialEmail ? 60 : 0);

  const otpInputsRef = useRef<Array<TextInput | null>>([]);

  // Timer for OTP resend functionality
  useEffect(() => {
    let interval: any;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleSendOtp = async () => {
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    if (!email.includes('@')) {
      setError('Please enter a valid Gmail / Email address');
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const res = await sendOtpApi(email);
      if (res.success) {
        setMessage('OTP sent successfully to your email');
        setPhase('otp');
        setResendTimer(60); // 60 seconds resend cooldown
      } else {
        setError(res.message || 'Failed to send OTP. Please try again.');
      }
    } catch (err: any) {
      setError(err.message || 'Error sending OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    const otpCode = otp.join('');
    if (otpCode.length < 6) {
      setError('Please enter the 6-digit OTP code');
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const res = await verifyOtpApi(email, otpCode);
      if (res.success) {
        if (res.token) {
          cookieStore.set("token", res.token, { expires: 7 });
          cookieStore.set("userRole", res.user?.role?.roleCode || "customer", { expires: 7 });
        }
        onVerificationSuccess(res.user);
      } else {
        setError(res.message || 'Invalid OTP code');
      }
    } catch (err: any) {
      setError(err.message || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (value: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value !== '' && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace') {
      if (otp[index] === '' && index > 0) {
        const newOtp = [...otp];
        newOtp[index - 1] = '';
        setOtp(newOtp);
        otpInputsRef.current[index - 1]?.focus();
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* Header Logo */}
      <View style={styles.logoContainer}>
        <Image
          source={require('../../../../assets/images/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {/* Card Body */}
      <View style={styles.card}>
        {phase === 'email' ? (
          <>
            <Text style={styles.title}>Enter your Email</Text>
            <Text style={styles.subtitle}>{"We'll send an OTP to verify"}</Text>

            {error && <Text style={styles.errorText}>{error}</Text>}
            {message && <Text style={styles.successText}>{message}</Text>}

            <Text style={styles.fieldLabel}>Email</Text>
            <View style={styles.inputContainer}>
              <Feather name="mail" size={20} color="#7a8a6b" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="abc@gmail.com"
                placeholderTextColor="#8a9a7a"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
              />
            </View>

            <TouchableOpacity
              style={styles.submitBtn}
              onPress={handleSendOtp}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#2e5b02" />
              ) : (
                <>
                  <Text style={styles.submitBtnText}>Send OTP</Text>
                  <Feather name="arrow-right" size={20} color="#2e5b02" style={styles.submitBtnIcon} />
                </>
              )}
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.title}>Enter Code</Text>
            <Text style={styles.subtitle}>{`We've sent a 6-digit code to ${email}`}</Text>

            {error && <Text style={styles.errorText}>{error}</Text>}
            {message && <Text style={styles.successText}>{message}</Text>}

            {/* OTP Input Grid */}
            <View style={styles.otpGrid}>
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => { otpInputsRef.current[index] = ref; }}
                  style={styles.otpInput}
                  maxLength={1}
                  keyboardType="number-pad"
                  value={digit}
                  onChangeText={(val) => handleOtpChange(val, index)}
                  onKeyPress={(e) => handleOtpKeyPress(e, index)}
                  selectTextOnFocus
                />
              ))}
            </View>

            <TouchableOpacity
              style={styles.submitBtn}
              onPress={handleVerifyOtp}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#2e5b02" />
              ) : (
                <>
                  <Text style={styles.submitBtnText}>Verify OTP</Text>
                  <Feather name="check" size={20} color="#2e5b02" style={styles.submitBtnIcon} />
                </>
              )}
            </TouchableOpacity>

            {/* Resend Actions */}
            <View style={styles.resendContainer}>
              {resendTimer > 0 ? (
                <Text style={styles.resendTimerText}>Resend code in {resendTimer}s</Text>
              ) : (
                <TouchableOpacity onPress={handleSendOtp}>
                  <Text style={styles.resendLinkText}>Resend OTP</Text>
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity 
              style={styles.backBtn} 
              onPress={() => {
                if (onChangeEmail) {
                  onChangeEmail();
                } else {
                  setPhase('email');
                }
              }}
            >
              <Text style={styles.backBtnText}>Change Email</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Exit Button */}
      <TouchableOpacity style={styles.cancelBtn} onPress={onBackToLogin}>
        <Text style={styles.cancelBtnText}>Back to Login</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 40,
  },
  logoContainer: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  logo: {
    width: 140,
    height: 140,
  },
  card: {
    backgroundColor: '#eaf7d6', // Mockup matching pastel green
    borderRadius: 36,
    paddingHorizontal: 24,
    paddingVertical: 36,
    width: width * 0.88,
    maxWidth: 380,
    shadowColor: '#8ebd52',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.15,
    shadowRadius: 30,
    elevation: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1a2b0c',
    textAlign: 'center',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  subtitle: {
    fontSize: 15,
    color: '#71717a',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
    fontFamily: 'PlusJakartaSans-Regular',
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#7b8b6f',
    marginBottom: 10,
    paddingLeft: 4,
    fontFamily: 'PlusJakartaSans-Medium',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dfedd1',
    borderRadius: 25,
    height: 52,
    paddingHorizontal: 18,
    marginBottom: 20,
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    color: '#1a2b0c',
    fontSize: 16,
    paddingVertical: 0,
    fontFamily: 'PlusJakartaSans-Regular',
  },
  submitBtn: {
    backgroundColor: '#a2e52c', // Brand lime-green
    borderRadius: 25,
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#a2e52c',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
    marginTop: 10,
  },
  submitBtnText: {
    color: '#2e5b02',
    fontSize: 17,
    fontWeight: '700',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  submitBtnIcon: {
    marginLeft: 8,
  },
  errorText: {
    color: '#dc2626',
    backgroundColor: '#fef2f2',
    borderColor: '#fca5a5',
    borderWidth: 1,
    padding: 10,
    borderRadius: 12,
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 16,
    fontFamily: 'PlusJakartaSans-Medium',
  },
  successText: {
    color: '#16a34a',
    backgroundColor: '#f0fdf4',
    borderColor: '#bbf7d0',
    borderWidth: 1,
    padding: 10,
    borderRadius: 12,
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 16,
    fontFamily: 'PlusJakartaSans-Medium',
  },
  otpGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  otpInput: {
    width: 44,
    height: 50,
    backgroundColor: '#dfedd1',
    borderRadius: 12,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a2b0c',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  resendContainer: {
    marginTop: 18,
    alignItems: 'center',
  },
  resendTimerText: {
    color: '#71717a',
    fontSize: 14,
    fontFamily: 'PlusJakartaSans-Regular',
  },
  resendLinkText: {
    color: '#1a2b0c',
    fontWeight: '700',
    textDecorationLine: 'underline',
    fontSize: 14,
    fontFamily: 'PlusJakartaSans-Bold',
  },
  backBtn: {
    marginTop: 14,
    alignItems: 'center',
  },
  backBtnText: {
    color: '#71717a',
    fontSize: 13,
    fontFamily: 'PlusJakartaSans-Regular',
  },
  cancelBtn: {
    paddingVertical: 10,
  },
  cancelBtnText: {
    color: '#9ca3af',
    fontSize: 15,
    fontFamily: 'PlusJakartaSans-Medium',
  },
});

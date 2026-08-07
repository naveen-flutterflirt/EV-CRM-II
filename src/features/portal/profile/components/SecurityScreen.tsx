import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Switch,
  SafeAreaView,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { changePasswordApi } from '../api';

interface SecurityScreenProps {
  onBack: () => void;
}

export const SecurityScreen: React.FC<SecurityScreenProps> = ({ onBack }) => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [submittingPassword, setSubmittingPassword] = useState(false);

  const handleChangePasswordSubmit = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      Alert.alert('Required Fields Missing', 'Please fill in current password, new password, and confirm password.');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Password Mismatch', 'New password and confirm password do not match.');
      return;
    }

    setSubmittingPassword(true);
    try {
      await changePasswordApi(oldPassword, newPassword);
      Alert.alert('Success', 'Your password has been changed successfully.');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      Alert.alert('Change Password Failed', err.message || 'Unable to update password. Please verify your current password.');
    } finally {
      setSubmittingPassword(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.topHeader}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Feather name="arrow-left" size={20} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Security & Privacy</Text>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>CHANGE PASSWORD</Text>

        <View style={styles.cardBlock}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.cardHeaderLeft}>
              <View style={styles.iconCircle}>
                <Feather name="key" size={18} color="#4d7c0f" />
              </View>
              <View>
                <Text style={styles.cardTitle}>Change Password</Text>
                <Text style={styles.cardSub}>Update your account login password</Text>
              </View>
            </View>
          </View>

          <View style={styles.passFormBody}>
            {/* Current Password */}
            <View style={styles.inputWrap}>
              <Text style={styles.inputLabel}>CURRENT PASSWORD</Text>
              <View style={styles.inputRow}>
                <TextInput
                  style={[styles.textInput, { outlineStyle: 'none' } as any]}
                  secureTextEntry={!showOldPass}
                  value={oldPassword}
                  onChangeText={setOldPassword}
                  placeholder="Enter current password"
                  placeholderTextColor="#94a3b8"
                />
                <TouchableOpacity onPress={() => setShowOldPass(!showOldPass)}>
                  <Feather name={showOldPass ? 'eye-off' : 'eye'} size={18} color="#64748b" />
                </TouchableOpacity>
              </View>
            </View>

            {/* New Password */}
            <View style={styles.inputWrap}>
              <Text style={styles.inputLabel}>NEW PASSWORD</Text>
              <View style={styles.inputRow}>
                <TextInput
                  style={[styles.textInput, { outlineStyle: 'none' } as any]}
                  secureTextEntry={!showNewPass}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder="Minimum 8 characters"
                  placeholderTextColor="#94a3b8"
                />
                <TouchableOpacity onPress={() => setShowNewPass(!showNewPass)}>
                  <Feather name={showNewPass ? 'eye-off' : 'eye'} size={18} color="#64748b" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirm Password */}
            <View style={styles.inputWrap}>
              <Text style={styles.inputLabel}>CONFIRM NEW PASSWORD</Text>
              <View style={styles.inputRow}>
                <TextInput
                  style={[styles.textInput, { outlineStyle: 'none' } as any]}
                  secureTextEntry={!showConfirmPass}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Re-enter new password"
                  placeholderTextColor="#94a3b8"
                />
                <TouchableOpacity onPress={() => setShowConfirmPass(!showConfirmPass)}>
                  <Feather name={showConfirmPass ? 'eye-off' : 'eye'} size={18} color="#64748b" />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={styles.updatePassBtn}
              onPress={handleChangePasswordSubmit}
              disabled={submittingPassword}
              activeOpacity={0.85}
            >
              {submittingPassword ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <>
                  <Text style={styles.updatePassBtnText}>Update Password</Text>
                  <Feather name="check" size={16} color="#ffffff" />
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#faf8fc',
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    gap: 12,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: 1,
    marginBottom: 10,
    marginTop: 10,
    fontFamily: 'PlusJakartaSans-Bold',
  },
  cardBlock: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#edf6d6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 2,
    fontFamily: 'PlusJakartaSans-Bold',
  },
  cardSub: {
    fontSize: 11,
    color: '#64748b',
    fontFamily: 'PlusJakartaSans-Regular',
  },
  passFormBody: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    gap: 12,
  },
  inputWrap: {},
  inputLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f3f7',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 48,
  },
  textInput: {
    flex: 1,
    fontSize: 13,
    color: '#0f172a',
  },
  updatePassBtn: {
    backgroundColor: '#4d7c0f',
    borderRadius: 16,
    height: 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    gap: 6,
  },
  updatePassBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#ffffff',
  },
  toggleCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
  },
  toggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  actionCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
  },
  sessionsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 40,
  },
  sessionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  sessionIcon: {
    marginRight: 12,
  },
  sessionMeta: {
    flex: 1,
  },
  deviceTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 2,
  },
  deviceSub: {
    fontSize: 11,
    color: '#64748b',
  },
  activeTag: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  activeTagText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#4d7c0f',
  },
  rowDivider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 8,
  },
  logoutOthersBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
    paddingVertical: 10,
    backgroundColor: '#fef2f2',
    borderRadius: 14,
  },
  logoutOthersText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#dc2626',
  },
});

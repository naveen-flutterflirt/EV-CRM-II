import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  SafeAreaView,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { UserProfileData, EditProfilePayload } from '../types';

interface EditProfileScreenProps {
  user?: UserProfileData | null;
  saving?: boolean;
  onSave: (payload: EditProfilePayload) => void;
  onBack: () => void;
}

export const EditProfileScreen: React.FC<EditProfileScreenProps> = ({
  user,
  saving = false,
  onSave,
  onBack,
}) => {
  const [firstName, setFirstName] = useState(user?.firstName || user?.name?.split(' ')[0] || '');
  const [lastName, setLastName] = useState(user?.lastName || user?.name?.split(' ').slice(1).join(' ') || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [email, setEmail] = useState(user?.email || '');
  const [gender, setGender] = useState(user?.gender || '');
  const [addressLine1, setAddressLine1] = useState(user?.addressLine1 || user?.defaultAddress || '');
  const [city, setCity] = useState(user?.city || user?.location || '');
  const [pincode, setPincode] = useState(user?.pincode || '');
  const [errorMsg, setErrorMsg] = useState('');

  const handleFormSubmit = () => {
    setErrorMsg('');
    if (!firstName.trim()) {
      setErrorMsg('First name is required.');
      return;
    }
    if (!phone.trim()) {
      setErrorMsg('Phone number is required.');
      return;
    }

    onSave({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone: phone.trim(),
      email: email.trim(),
      gender,
      addressLine1: addressLine1.trim(),
      city: city.trim(),
      pincode: pincode.trim(),
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Bar Header */}
      <View style={styles.topHeader}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Feather name="arrow-left" size={20} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>

        <TouchableOpacity onPress={handleFormSubmit} disabled={saving}>
          {saving ? (
            <ActivityIndicator size="small" color="#65a30d" />
          ) : (
            <Text style={styles.topSaveBtnText}>SAVE</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Error Banner */}
        {errorMsg ? (
          <View style={styles.errorBox}>
            <Feather name="alert-circle" size={16} color="#dc2626" style={{ marginRight: 6 }} />
            <Text style={styles.errorText}>{errorMsg}</Text>
          </View>
        ) : null}

        {/* Avatar & Change Photo Section */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarWrap}>
            {user?.avatarUrl ? (
              <Image source={{ uri: user.avatarUrl }} style={styles.avatarImg} />
            ) : (
              <Feather name="user" size={36} color="#4d7c0f" />
            )}
            <TouchableOpacity style={styles.cameraBadge}>
              <Feather name="camera" size={14} color="#ffffff" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.changePhotoBtn}>
            <Text style={styles.changePhotoText}>CHANGE PHOTO</Text>
          </TouchableOpacity>
        </View>

        {/* Form Fields Matching Customer Schema & GET /auth/me */}
        <View style={styles.formGroup}>
          {/* 1. First Name & Last Name (2-Column Row) */}
          <View style={styles.twoColRow}>
            <View style={styles.colHalf}>
              <Text style={styles.inputLabel}>FIRST NAME *</Text>
              <TextInput
                style={[styles.inputBox, { outlineStyle: 'none' } as any]}
                value={firstName}
                onChangeText={setFirstName}
                placeholder="First name"
                placeholderTextColor="#94a3b8"
              />
            </View>

            <View style={styles.colHalf}>
              <Text style={styles.inputLabel}>LAST NAME</Text>
              <TextInput
                style={[styles.inputBox, { outlineStyle: 'none' } as any]}
                value={lastName}
                onChangeText={setLastName}
                placeholder="Last name"
                placeholderTextColor="#94a3b8"
              />
            </View>
          </View>

          {/* 2. Phone Number */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>PHONE NUMBER *</Text>
            <TextInput
              style={[styles.inputBox, { outlineStyle: 'none' } as any]}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              placeholder="+91 98765 43210"
              placeholderTextColor="#94a3b8"
            />
          </View>

          {/* 3. Email Address */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>EMAIL ADDRESS</Text>
            <View style={styles.inputRowBox}>
              <TextInput
                style={[styles.inputBoxRow, { outlineStyle: 'none' } as any]}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                placeholder="email@example.com"
                placeholderTextColor="#94a3b8"
              />
              <View style={styles.verifiedBadge}>
                <Feather name="check-circle" size={12} color="#4d7c0f" style={{ marginRight: 4 }} />
                <Text style={styles.verifiedText}>VERIFIED</Text>
              </View>
            </View>
          </View>

          {/* 4. Gender Selector */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>GENDER</Text>
            <View style={styles.genderRow}>
              {['Male', 'Female', 'Other'].map((g) => {
                const isSelected = gender?.toLowerCase() === g.toLowerCase();
                return (
                  <TouchableOpacity
                    key={g}
                    style={[styles.genderChip, isSelected && styles.genderChipSelected]}
                    onPress={() => setGender(g)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.genderChipText, isSelected && styles.genderChipTextSelected]}>
                      {g}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* 5. Street Address */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>STREET ADDRESS</Text>
            <TextInput
              style={[styles.inputBox, { outlineStyle: 'none' } as any]}
              value={addressLine1}
              onChangeText={setAddressLine1}
              placeholder="House/Flat No, Street, Area"
              placeholderTextColor="#94a3b8"
            />
          </View>

          {/* 6. City & Pincode (2-Column Row) */}
          <View style={styles.twoColRow}>
            <View style={styles.colHalf}>
              <Text style={styles.inputLabel}>CITY</Text>
              <TextInput
                style={[styles.inputBox, { outlineStyle: 'none' } as any]}
                value={city}
                onChangeText={setCity}
                placeholder="City"
                placeholderTextColor="#94a3b8"
              />
            </View>

            <View style={styles.colHalf}>
              <Text style={styles.inputLabel}>PINCODE</Text>
              <TextInput
                style={[styles.inputBox, { outlineStyle: 'none' } as any]}
                value={pincode}
                onChangeText={setPincode}
                keyboardType="numeric"
                maxLength={6}
                placeholder="452001"
                placeholderTextColor="#94a3b8"
              />
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom Save Changes Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.saveSubmitBtn}
          onPress={handleFormSubmit}
          disabled={saving}
          activeOpacity={0.85}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#1a2b0c" />
          ) : (
            <>
              <Text style={styles.saveSubmitText}>Save Profile Changes</Text>
              <Feather name="check-circle" size={18} color="#1a2b0c" />
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  topSaveBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#4d7c0f',
    letterSpacing: 0.5,
    fontFamily: 'PlusJakartaSans-Bold',
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 12,
    color: '#dc2626',
    fontWeight: '600',
    fontFamily: 'PlusJakartaSans-Medium',
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#edf6d6',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: 8,
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#4d7c0f',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  changePhotoBtn: {},
  changePhotoText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#4d7c0f',
    letterSpacing: 0.5,
    fontFamily: 'PlusJakartaSans-Bold',
  },
  formGroup: {
    gap: 16,
    paddingBottom: 40,
  },
  inputContainer: {},
  inputLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: 0.5,
    marginBottom: 6,
    fontFamily: 'PlusJakartaSans-Bold',
  },
  inputBox: {
    backgroundColor: '#f5f3f7',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 48,
    fontSize: 13,
    color: '#0f172a',
    fontFamily: 'PlusJakartaSans-Regular',
  },
  inputRowBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f3f7',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 48,
  },
  inputBoxRow: {
    flex: 1,
    fontSize: 13,
    color: '#0f172a',
    fontFamily: 'PlusJakartaSans-Regular',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  verifiedText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#4d7c0f',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  genderRow: {
    flexDirection: 'row',
    gap: 10,
  },
  genderChip: {
    flex: 1,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#f5f3f7',
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: 'transparent',
    borderWidth: 1,
  },
  genderChipSelected: {
    backgroundColor: '#edf6d6',
    borderColor: '#4d7c0f',
  },
  genderChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
    fontFamily: 'PlusJakartaSans-Medium',
  },
  genderChipTextSelected: {
    fontWeight: '800',
    color: '#4d7c0f',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  twoColRow: {
    flexDirection: 'row',
    gap: 12,
  },
  colHalf: {
    flex: 1,
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    backgroundColor: '#ffffff',
  },
  saveSubmitBtn: {
    backgroundColor: '#a2e52c',
    borderRadius: 24,
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  saveSubmitText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1a2b0c',
    fontFamily: 'PlusJakartaSans-Bold',
  },
});

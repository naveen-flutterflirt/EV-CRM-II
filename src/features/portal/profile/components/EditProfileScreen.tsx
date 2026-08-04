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
  const [fullName, setFullName] = useState(user?.name || 'Rohan Mehta');
  const [phone, setPhone] = useState(user?.phone || '+91 98765 43210');
  const [email, setEmail] = useState(user?.email || 'rohan.mehta@gmail.com');
  const [dob, setDob] = useState(user?.dob || '12/04/1995');
  const [gender, setGender] = useState(user?.gender || 'Male');
  const [address, setAddress] = useState(
    user?.defaultAddress || '402, Sapphire Heights, AB Road, Indore, MP 452001'
  );
  const [city, setCity] = useState(user?.location || 'Indore');

  const handleFormSubmit = () => {
    onSave({
      fullName,
      phone,
      email,
      dob,
      gender,
      address,
      city,
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Bar Header */}
      <View style={styles.topHeader}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Feather name="arrow-left" size={20} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit profile</Text>

        <TouchableOpacity onPress={handleFormSubmit} disabled={saving}>
          {saving ? (
            <ActivityIndicator size="small" color="#65a30d" />
          ) : (
            <Text style={styles.topSaveBtnText}>SAVE</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
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

        {/* Input Fields */}
        <View style={styles.formGroup}>
          {/* Full Name */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>FULL NAME</Text>
            <TextInput
              style={[styles.inputBox, { outlineStyle: 'none' } as any]}
              value={fullName}
              onChangeText={setFullName}
              placeholderTextColor="#94a3b8"
            />
          </View>

          {/* Phone Number */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>PHONE NUMBER</Text>
            <TextInput
              style={[styles.inputBox, { outlineStyle: 'none' } as any]}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              placeholderTextColor="#94a3b8"
            />
          </View>

          {/* Email Address with Verified Badge */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>EMAIL ADDRESS</Text>
            <View style={styles.inputRowBox}>
              <TextInput
                style={[styles.inputBoxRow, { outlineStyle: 'none' } as any]}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                placeholderTextColor="#94a3b8"
              />
              <View style={styles.verifiedBadge}>
                <Feather name="check-circle" size={12} color="#4d7c0f" style={{ marginRight: 4 }} />
                <Text style={styles.verifiedText}>VERIFIED</Text>
              </View>
            </View>
          </View>

          {/* DOB & Gender 2-Column Row */}
          <View style={styles.twoColRow}>
            <View style={styles.colHalf}>
              <Text style={styles.inputLabel}>DATE OF BIRTH</Text>
              <View style={styles.inputRowBox}>
                <TextInput
                  style={[styles.inputBoxRow, { outlineStyle: 'none' } as any]}
                  value={dob}
                  onChangeText={setDob}
                  placeholderTextColor="#94a3b8"
                />
                <Feather name="calendar" size={16} color="#64748b" />
              </View>
            </View>

            <View style={styles.colHalf}>
              <Text style={styles.inputLabel}>GENDER</Text>
              <View style={styles.inputRowBox}>
                <TextInput
                  style={[styles.inputBoxRow, { outlineStyle: 'none' } as any]}
                  value={gender}
                  onChangeText={setGender}
                  placeholderTextColor="#94a3b8"
                />
                <Feather name="chevron-down" size={16} color="#64748b" />
              </View>
            </View>
          </View>

          {/* Default Address Card */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>DEFAULT ADDRESS</Text>
            <View style={styles.addressCard}>
              <View style={styles.addrTopRow}>
                <View style={styles.pinCircle}>
                  <Feather name="map-pin" size={14} color="#4d7c0f" />
                </View>
                <Text style={styles.addrText}>{address}</Text>
              </View>

              <TouchableOpacity style={styles.changeAddrTouch}>
                <Text style={styles.changeAddrText}>CHANGE</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* City Preference Card */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>CITY PREFERENCE</Text>
            <View style={styles.cityCard}>
              <Feather name="database" size={16} color="#64748b" style={styles.cityIcon} />
              <Text style={styles.cityText}>{city}</Text>
              <Feather name="chevron-right" size={18} color="#cbd5e1" />
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
              <Text style={styles.saveSubmitText}>Save Changes</Text>
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
    fontSize: 16,
    fontWeight: '700',
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
    paddingBottom: 30,
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
  twoColRow: {
    flexDirection: 'row',
    gap: 12,
  },
  colHalf: {
    flex: 1,
  },
  addressCard: {
    backgroundColor: '#f5f3f7',
    borderRadius: 16,
    padding: 14,
  },
  addrTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  pinCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#eef6d6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    marginTop: 2,
  },
  addrText: {
    flex: 1,
    fontSize: 12,
    color: '#334155',
    lineHeight: 18,
    fontFamily: 'PlusJakartaSans-Regular',
  },
  changeAddrTouch: {
    alignSelf: 'flex-start',
    paddingLeft: 38,
  },
  changeAddrText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#4d7c0f',
    letterSpacing: 0.5,
    fontFamily: 'PlusJakartaSans-Bold',
  },
  cityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f3f7',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 48,
  },
  cityIcon: {
    marginRight: 10,
  },
  cityText: {
    flex: 1,
    fontSize: 13,
    color: '#0f172a',
    fontFamily: 'PlusJakartaSans-Regular',
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

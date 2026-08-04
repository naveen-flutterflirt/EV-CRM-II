import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Switch,
  Modal,
  FlatList,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import Cookies from 'js-cookie';
import { useAuthHook } from '../hooks/useAuth';
import { RegisterPayload } from '../types';

interface RegisterFormProps {
  onRegisterSuccess: (user: any) => void;
  onNavigateToLogin: () => void;
}

const GENDER_OPTIONS = ['Male', 'Female', 'Other'];

const INDIAN_STATES = [
  { id: 'st_mp_01', name: 'Madhya Pradesh' },
  { id: 'st_mh_02', name: 'Maharashtra' },
  { id: 'st_dl_03', name: 'Delhi' },
  { id: 'st_ka_04', name: 'Karnataka' },
  { id: 'st_gj_05', name: 'Gujarat' },
  { id: 'st_tn_06', name: 'Tamil Nadu' },
  { id: 'st_ts_07', name: 'Telangana' },
  { id: 'st_up_08', name: 'Uttar Pradesh' },
  { id: 'st_rj_09', name: 'Rajasthan' },
  { id: 'st_wb_10', name: 'West Bengal' },
];

const SERVICE_CENTERS = [
  { id: 'sc_bhopal_01', name: 'Bhopal HQ Service Center', stateName: 'Madhya Pradesh' },
  { id: 'sc_indore_02', name: 'Indore EV Hub', stateName: 'Madhya Pradesh' },
  { id: 'sc_jabalpur_03', name: 'Jabalpur Service Point', stateName: 'Madhya Pradesh' },
  { id: 'sc_mumbai_04', name: 'Mumbai Central EV Center', stateName: 'Maharashtra' },
  { id: 'sc_pune_05', name: 'Pune Mobility Workshop', stateName: 'Maharashtra' },
  { id: 'sc_delhi_06', name: 'Delhi NCR Main Center', stateName: 'Delhi' },
  { id: 'sc_blore_07', name: 'Bangalore Tech Park Center', stateName: 'Karnataka' },
  { id: 'sc_ahmedabad_08', name: 'Ahmedabad EV Hub', stateName: 'Gujarat' },
  { id: 'sc_chennai_09', name: 'Chennai Central Care', stateName: 'Tamil Nadu' },
  { id: 'sc_hyderabad_10', name: 'Hyderabad Mobility Point', stateName: 'Telangana' },
];

export const RegisterForm: React.FC<RegisterFormProps> = ({
  onRegisterSuccess,
  onNavigateToLogin,
}) => {
  const { register, loading, error } = useAuthHook();

  // Form State
  const [gender, setGender] = useState('Male');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [altPhone, setAltPhone] = useState('');
  const [email, setEmail] = useState('');
  const [isFleet, setIsFleet] = useState(false);
  const [streetAddress, setStreetAddress] = useState('');

  // Dropdown States for State & Registered Center
  const [state, setState] = useState('');
  const [stateId, setStateId] = useState('');
  const [registeredCenter, setRegisteredCenter] = useState('');
  const [registeredCenterId, setRegisteredCenterId] = useState('');

  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');
  const [password, setPassword] = useState('');

  // UI Modals & Error state
  const [showPassword, setShowPassword] = useState(false);
  const [isGenderModalVisible, setIsGenderModalVisible] = useState(false);
  const [isStateModalVisible, setIsStateModalVisible] = useState(false);
  const [isCenterModalVisible, setIsCenterModalVisible] = useState(false);
  const [localError, setLocalError] = useState('');

  // Filter centers based on selected state
  const availableCenters = state
    ? SERVICE_CENTERS.filter((c) => c.stateName === state)
    : SERVICE_CENTERS;

  const handleRegister = async () => {
    if (!gender) {
      setLocalError('Please select your gender');
      return;
    }
    if (!firstName.trim()) {
      setLocalError('Please enter your first name');
      return;
    }
    if (!lastName.trim()) {
      setLocalError('Please enter your last name');
      return;
    }
    if (!phone.trim()) {
      setLocalError('Please enter your phone number');
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

    const fullName = `${firstName.trim()} ${lastName.trim()}`;
    const payload: RegisterPayload = {
      name: fullName,
      phone: phone.trim(),
      email: email.trim() || undefined,
      password,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      gender,
      altPhone: altPhone.trim() || undefined,
      isFleet,
      streetAddress: streetAddress.trim() || undefined,
      state: state || undefined,
      state_id: stateId || state || undefined,
      stateId: stateId || state || undefined,
      registered_center_id: registeredCenterId || undefined,
      registeredCenterId: registeredCenterId || undefined,
      city: city.trim() || undefined,
      pincode: pincode.trim() || undefined,
    };

    try {
      const res = await register(payload);
      if (res.user) {
        const mergedUser = {
          ...res.user,
          fullName,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          gender,
          phone: phone.trim(),
          altPhone: altPhone.trim(),
          email: email.trim(),
          isFleet,
          streetAddress: streetAddress.trim(),
          state,
          state_id: stateId,
          registered_center_id: registeredCenterId,
          city: city.trim(),
          pincode: pincode.trim(),
        };

        if (res.token) {
          Cookies.set("token", res.token, { expires: 7 });
          Cookies.set("userRole", res.user.role?.roleCode || "customer", { expires: 7 });
        }
        onRegisterSuccess(mergedUser);
      }
    } catch (err: any) {
      setLocalError(err.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.card}>
        {/* Error Alert */}
        {(error || localError) ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{localError || error}</Text>
          </View>
        ) : null}

        {/* SECTION 1: IDENTITY DETAILS */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeader}>IDENTITY DETAILS</Text>

          {/* Gender Selector */}
          <Text style={styles.fieldLabel}>
            GENDER <Text style={styles.requiredAsterisk}>*</Text>
          </Text>
          <TouchableOpacity
            style={styles.dropdownContainer}
            onPress={() => setIsGenderModalVisible(true)}
            activeOpacity={0.8}
          >
            <Text style={[styles.dropdownText, !gender && styles.placeholderText]}>
              {gender || 'Select Gender'}
            </Text>
            <View style={styles.dropdownIcons}>
              {gender ? (
                <TouchableOpacity onPress={() => setGender('')} style={styles.clearIconBtn}>
                  <Feather name="x" size={16} color="#64748b" />
                </TouchableOpacity>
              ) : null}
              <Feather name="chevron-down" size={18} color="#64748b" />
            </View>
          </TouchableOpacity>

          {/* First Name & Last Name Inputs */}
          <Text style={styles.fieldLabel}>
            FIRST NAME <Text style={styles.requiredAsterisk}>*</Text>
          </Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="John"
              placeholderTextColor="#94a3b8"
              value={firstName}
              onChangeText={setFirstName}
            />
          </View>

          <Text style={styles.fieldLabel}>
            LAST NAME <Text style={styles.requiredAsterisk}>*</Text>
          </Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="Doe"
              placeholderTextColor="#94a3b8"
              value={lastName}
              onChangeText={setLastName}
            />
          </View>
        </View>

        <View style={styles.divider} />

        {/* SECTION 2: CONTACT INFO */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeader}>CONTACT INFO</Text>

          <Text style={styles.fieldLabel}>
            PHONE NUMBER <Text style={styles.requiredAsterisk}>*</Text>
          </Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. +91 9876543210"
              placeholderTextColor="#94a3b8"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />
          </View>

          <Text style={styles.fieldLabel}>ALT PHONE</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="Optional alternate no"
              placeholderTextColor="#94a3b8"
              keyboardType="phone-pad"
              value={altPhone}
              onChangeText={setAltPhone}
            />
          </View>

          <Text style={styles.fieldLabel}>EMAIL ADDRESS</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="name@example.com"
              placeholderTextColor="#94a3b8"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
            />
          </View>
        </View>

        <View style={styles.divider} />

        {/* SECTION 3: ACCOUNT CLASSIFICATION */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeader}>ACCOUNT CLASSIFICATION</Text>

          <View style={styles.switchBox}>
            <View style={styles.switchTextContainer}>
              <Text style={styles.switchTitle}>Is Fleet Customer?</Text>
              <Text style={styles.switchSubtitle}>
                Check if client is corporate/B2B operator
              </Text>
            </View>
            <Switch
              value={isFleet}
              onValueChange={setIsFleet}
              trackColor={{ false: '#cbd5e1', true: '#a2e52c' }}
              thumbColor="#ffffff"
            />
          </View>
        </View>

        <View style={styles.divider} />

        {/* SECTION 4: ADDRESS & REGISTRATION GEOGRAPHY (ERP Dropdowns) */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeader}>ADDRESS & LOCATION (ERP SCALED)</Text>

          <Text style={styles.fieldLabel}>STREET ADDRESS</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="Apartment, building, street address info"
              placeholderTextColor="#94a3b8"
              value={streetAddress}
              onChangeText={setStreetAddress}
            />
          </View>

          {/* STATE Dropdown (ERP Styled) */}
          <Text style={styles.fieldLabel}>
            STATE <Text style={styles.requiredAsterisk}>*</Text>
          </Text>
          <TouchableOpacity
            style={styles.dropdownContainer}
            onPress={() => setIsStateModalVisible(true)}
            activeOpacity={0.8}
          >
            <View style={styles.dropdownLeftRow}>
              <Feather name="map-pin" size={18} color="#7a8a6b" style={{ marginRight: 10 }} />
              <Text style={[styles.dropdownText, !state && styles.placeholderText]}>
                {state || 'Select State...'}
              </Text>
            </View>
            <Feather name="chevron-down" size={18} color="#64748b" />
          </TouchableOpacity>

          {/* NEAREST SERVICE CENTER Dropdown (ERP Styled) */}
          <Text style={styles.fieldLabel}>
            NEAREST SERVICE CENTER <Text style={styles.requiredAsterisk}>*</Text>
          </Text>
          <TouchableOpacity
            style={styles.dropdownContainer}
            onPress={() => setIsCenterModalVisible(true)}
            activeOpacity={0.8}
          >
            <View style={styles.dropdownLeftRow}>
              <Feather name="home" size={18} color="#7a8a6b" style={{ marginRight: 10 }} />
              <Text style={[styles.dropdownText, !registeredCenter && styles.placeholderText]}>
                {registeredCenter || (state ? 'Select Nearest Center...' : 'Select State first...')}
              </Text>
            </View>
            <Feather name="chevron-down" size={18} color="#64748b" />
          </TouchableOpacity>

          <Text style={styles.fieldLabel}>CITY</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="Enter city name"
              placeholderTextColor="#94a3b8"
              value={city}
              onChangeText={setCity}
            />
          </View>

          <Text style={styles.fieldLabel}>PINCODE</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. 400001"
              placeholderTextColor="#94a3b8"
              keyboardType="number-pad"
              value={pincode}
              onChangeText={setPincode}
            />
          </View>
        </View>

        <View style={styles.divider} />

        {/* SECTION 5: ACCOUNT PASSWORD */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeader}>ACCOUNT CREDENTIALS</Text>

          <Text style={styles.fieldLabel}>
            PASSWORD <Text style={styles.requiredAsterisk}>*</Text>
          </Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="Create password (min 6 characters)"
              placeholderTextColor="#94a3b8"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Feather
                name={showPassword ? 'eye-off' : 'eye'}
                size={18}
                color="#64748b"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={styles.submitBtn}
          onPress={handleRegister}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#2e5b02" />
          ) : (
            <>
              <Text style={styles.submitBtnText}>Complete Registration</Text>
              <Feather name="arrow-right" size={20} color="#2e5b02" style={styles.submitBtnIcon} />
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Switch to Login Link */}
      <TouchableOpacity style={styles.footerLink} onPress={onNavigateToLogin}>
        <Text style={styles.footerText}>
          {'Already registered? '}<Text style={styles.highlightText}>Sign In</Text>
        </Text>
      </TouchableOpacity>

      {/* Gender Picker Modal */}
      <Modal
        visible={isGenderModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsGenderModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsGenderModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Gender</Text>
              <TouchableOpacity onPress={() => setIsGenderModalVisible(false)}>
                <Feather name="x" size={22} color="#334155" />
              </TouchableOpacity>
            </View>
            {GENDER_OPTIONS.map((item) => (
              <TouchableOpacity
                key={item}
                style={styles.modalOption}
                onPress={() => {
                  setGender(item);
                  setIsGenderModalVisible(false);
                }}
              >
                <Text style={[styles.modalOptionText, gender === item && styles.modalOptionTextActive]}>
                  {item}
                </Text>
                {gender === item && <Feather name="check" size={18} color="#2e5b02" />}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* State Picker Modal (ERP Style) */}
      <Modal
        visible={isStateModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsStateModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: '65%' }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select State (state_id)</Text>
              <TouchableOpacity onPress={() => setIsStateModalVisible(false)}>
                <Feather name="x" size={22} color="#334155" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={INDIAN_STATES}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalOption}
                  onPress={() => {
                    setState(item.name);
                    setStateId(item.id);
                    setRegisteredCenter('');
                    setRegisteredCenterId('');
                    setIsStateModalVisible(false);
                  }}
                >
                  <View>
                    <Text style={[styles.modalOptionText, state === item.name && styles.modalOptionTextActive]}>
                      {item.name}
                    </Text>
                    <Text style={styles.modalSubIdText}>ID: {item.id}</Text>
                  </View>
                  {state === item.name && <Feather name="check" size={18} color="#2e5b02" />}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Service Center Picker Modal (ERP Style) */}
      <Modal
        visible={isCenterModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsCenterModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: '65%' }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Nearest Center (registered_center_id)</Text>
              <TouchableOpacity onPress={() => setIsCenterModalVisible(false)}>
                <Feather name="x" size={22} color="#334155" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={availableCenters}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalOption}
                  onPress={() => {
                    setRegisteredCenter(item.name);
                    setRegisteredCenterId(item.id);
                    setIsCenterModalVisible(false);
                  }}
                >
                  <View style={{ flex: 1, paddingRight: 10 }}>
                    <Text style={[styles.modalOptionText, registeredCenter === item.name && styles.modalOptionTextActive]}>
                      {item.name}
                    </Text>
                    <Text style={styles.modalSubIdText}>State: {item.stateName} | ID: {item.id}</Text>
                  </View>
                  {registeredCenter === item.name && <Feather name="check" size={18} color="#2e5b02" />}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 24,
    width: '100%',
    borderColor: '#e2e8f0',
    borderWidth: 1,
    shadowColor: '#64748b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
  },
  sectionContainer: {
    marginBottom: 16,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: '#557924',
    letterSpacing: 0.6,
    marginBottom: 16,
    textTransform: 'uppercase',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 6,
    letterSpacing: 0.3,
    fontFamily: 'PlusJakartaSans-Bold',
  },
  requiredAsterisk: {
    color: '#ef4444',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderColor: '#cbd5e1',
    borderWidth: 1,
    borderRadius: 12,
    height: 48,
    paddingHorizontal: 14,
    marginBottom: 14,
  },
  textInput: {
    flex: 1,
    color: '#0f172a',
    fontSize: 14,
    paddingVertical: 0,
    fontFamily: 'PlusJakartaSans-Regular',
  },
  dropdownContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    borderColor: '#cbd5e1',
    borderWidth: 1,
    borderRadius: 12,
    height: 48,
    paddingHorizontal: 14,
    marginBottom: 14,
  },
  dropdownLeftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dropdownText: {
    fontSize: 14,
    color: '#0f172a',
    fontWeight: '500',
    fontFamily: 'PlusJakartaSans-Medium',
  },
  dropdownIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  clearIconBtn: {
    padding: 2,
  },
  placeholderText: {
    color: '#94a3b8',
  },
  switchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    borderColor: '#cbd5e1',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 8,
  },
  switchTextContainer: {
    flex: 1,
    paddingRight: 12,
  },
  switchTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  switchSubtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
    fontFamily: 'PlusJakartaSans-Regular',
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 12,
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
    fontSize: 13,
    textAlign: 'center',
    fontWeight: '500',
    fontFamily: 'PlusJakartaSans-Medium',
  },
  submitBtn: {
    backgroundColor: '#a2e52c',
    borderRadius: 14,
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    shadowColor: '#a2e52c',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  submitBtnText: {
    color: '#2e5b02',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  submitBtnIcon: {
    marginLeft: 8,
  },
  footerLink: {
    marginTop: 24,
    alignItems: 'center',
  },
  footerText: {
    color: '#64748b',
    fontSize: 14,
    fontFamily: 'PlusJakartaSans-Regular',
  },
  highlightText: {
    color: '#1a2b0c',
    fontWeight: '700',
    textDecorationLine: 'underline',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 36,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  modalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  modalOptionText: {
    fontSize: 15,
    color: '#475569',
    fontFamily: 'PlusJakartaSans-Regular',
  },
  modalOptionTextActive: {
    color: '#2e5b02',
    fontWeight: '700',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  modalSubIdText: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 2,
    fontFamily: 'PlusJakartaSans-Regular',
  },
});

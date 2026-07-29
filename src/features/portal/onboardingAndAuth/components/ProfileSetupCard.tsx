import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Image,
  Dimensions,
  Modal,
  FlatList,
  SafeAreaView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { updateCustomerProfileApi } from '../api';

const { width } = Dimensions.get('window');

const CITIES = [
  'Indore',
  'Bhopal',
  'Jabalpur',
  'Gwalior',
  'Ujjain',
  'Bangalore',
  'Mumbai',
  'Delhi',
  'Pune',
  'Hyderabad',
  'Chennai',
];

interface ProfileSetupCardProps {
  user: {
    fullName: string;
    phone: string;
    email: string;
  };
  onComplete: () => void;
  onCancel: () => void;
}

export const ProfileSetupCard: React.FC<ProfileSetupCardProps> = ({
  user,
  onComplete,
  onCancel,
}) => {
  const [fullName, setFullName] = useState(user.fullName);
  const [phone, setPhone] = useState(user.phone);
  const [email, setEmail] = useState(user.email);
  const [city, setCity] = useState('');
  
  const [isCityModalVisible, setIsCityModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleContinue = async () => {
    if (!fullName) {
      setError('Please enter your full name');
      return;
    }
    if (!phone) {
      setError('Please enter your phone number');
      return;
    }
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    if (!city) {
      setError('Please select your city');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await updateCustomerProfileApi({
        fullName,
        phone,
        email,
        city,
      });

      if (res.success) {
        onComplete();
      } else {
        setError(res.message || 'Failed to update profile. Please try again.');
      }
    } catch (err: any) {
      setError(err.message || 'Error updating profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        {/* Header Logo */}
        <View style={styles.logoContainer}>
          <Image
            source={require('../../../../../assets/images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Text Headers */}
        <View style={styles.headerTextContainer}>
          <Text style={styles.title}>Set up your profile</Text>
          <Text style={styles.subtitle}>Tell us a bit about you.</Text>
        </View>

        {/* Static Profile Picture Area */}
        <View style={styles.avatarWrapper}>
          <View style={styles.avatarContainer}>
            <Feather name="user" size={60} color="#a0af93" />
            <TouchableOpacity style={styles.cameraBadge} activeOpacity={0.8}>
              <Feather name="camera" size={16} color="#000000" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Form Container */}
        <View style={styles.formContainer}>
          {error && <Text style={styles.errorText}>{error}</Text>}

          {/* Full Name */}
          <Text style={styles.fieldLabel}>FULL NAME</Text>
          <View style={styles.inputContainer}>
            <Feather name="user" size={20} color="#7a8a6b" style={styles.inputIcon} />
            <TextInput
              style={styles.textInput}
              placeholder="Enter your name"
              placeholderTextColor="#8a9a7a"
              value={fullName}
              onChangeText={setFullName}
            />
          </View>

          {/* Phone Number */}
          <Text style={styles.fieldLabel}>PHONE NUMBER</Text>
          <View style={styles.inputContainer}>
            <Feather name="phone" size={20} color="#7a8a6b" style={styles.inputIcon} />
            <TextInput
              style={styles.textInput}
              placeholder="Enter your Number"
              placeholderTextColor="#8a9a7a"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />
          </View>

          {/* Email */}
          <Text style={styles.fieldLabel}>EMAIL</Text>
          <View style={styles.inputContainer}>
            <Feather name="mail" size={20} color="#7a8a6b" style={styles.inputIcon} />
            <TextInput
              style={styles.textInput}
              placeholder="you@example.com"
              placeholderTextColor="#8a9a7a"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
            />
          </View>

          {/* City Dropdown */}
          <Text style={styles.fieldLabel}>CITY</Text>
          <TouchableOpacity
            style={styles.inputContainer}
            onPress={() => setIsCityModalVisible(true)}
            activeOpacity={0.8}
          >
            <Feather name="map-pin" size={20} color="#7a8a6b" style={styles.inputIcon} />
            <Text style={[styles.textInput, !city && styles.placeholderText]}>
              {city || 'Select your city'}
            </Text>
            <Feather name="chevron-down" size={20} color="#7a8a6b" />
          </TouchableOpacity>

          {/* Continue Button */}
          <TouchableOpacity
            style={styles.submitBtn}
            onPress={handleContinue}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#2e5b02" />
            ) : (
              <>
                <Text style={styles.submitBtnText}>Continue</Text>
                <Feather name="arrow-right" size={20} color="#2e5b02" style={styles.submitBtnIcon} />
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Back/Cancel Link */}
        <TouchableOpacity style={styles.cancelLink} onPress={onCancel}>
          <Text style={styles.cancelLinkText}>Back to login</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Custom City Picker Modal */}
      <Modal
        visible={isCityModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsCityModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select your city</Text>
              <TouchableOpacity onPress={() => setIsCityModalVisible(false)}>
                <Feather name="x" size={24} color="#1a2b0c" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={CITIES}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.cityOption}
                  onPress={() => {
                    setCity(item);
                    setIsCityModalVisible(false);
                  }}
                >
                  <Text style={[styles.cityText, city === item && styles.cityTextActive]}>
                    {item}
                  </Text>
                  {city === item && <Feather name="check" size={18} color="#2e5b02" />}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContainer: {
    flexGrow: 1,
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 24,
  },
  logoContainer: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  logo: {
    width: 130,
    height: 130,
  },
  headerTextContainer: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  subtitle: {
    fontSize: 15,
    color: '#71717a',
    marginTop: 6,
    fontFamily: 'PlusJakartaSans-Regular',
  },
  avatarWrapper: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#e6efda', // Soft green matching mockup
    borderColor: '#c6d8b2',
    borderWidth: 1,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  cameraBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#a2e52c', // Brand lime-green camera badge
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 0,
    right: 2,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  formContainer: {
    width: '100%',
    maxWidth: 360,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#71717a',
    marginBottom: 8,
    paddingLeft: 4,
    fontFamily: 'PlusJakartaSans-Bold',
    letterSpacing: 0.5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eaf2e3', // soft green tint input box background
    borderRadius: 25,
    height: 52,
    paddingHorizontal: 18,
    marginBottom: 18,
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
  placeholderText: {
    color: '#8a9a7a',
  },
  submitBtn: {
    backgroundColor: '#a2e52c', // brand lime green button
    borderRadius: 25,
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    shadowColor: '#a2e52c',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  submitBtnText: {
    color: '#2e5b02', // dark forest/olive text
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
  cancelLink: {
    marginTop: 20,
    padding: 10,
  },
  cancelLinkText: {
    color: '#9ca3af',
    fontSize: 15,
    fontFamily: 'PlusJakartaSans-Medium',
  },
  // Custom Modal Dropdown styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
    maxHeight: '60%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e4e4e7',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a2b0c',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  cityOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f4f4f5',
  },
  cityText: {
    fontSize: 16,
    color: '#4b5563',
    fontFamily: 'PlusJakartaSans-Regular',
  },
  cityTextActive: {
    color: '#2e5b02',
    fontWeight: '700',
    fontFamily: 'PlusJakartaSans-Bold',
  },
});

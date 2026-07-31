import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  SafeAreaView,
  Alert,
  Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

interface DeliveryAddressScreenProps {
  onBack: () => void;
  onProceedToPayment: (selectedAddress: any) => void;
}

export const DeliveryAddressScreen: React.FC<DeliveryAddressScreenProps> = ({
  onBack,
  onProceedToPayment,
}) => {
  const [selectedId, setSelectedId] = useState<string>('addr_1');
  const [showAddForm, setShowAddForm] = useState<boolean>(false);

  const [pinCode, setPinCode] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [landmark, setLandmark] = useState('');

  const [savedAddresses, setSavedAddresses] = useState([
    {
      id: 'addr_1',
      title: 'Home',
      address: '204, Silver Oak Residency, Vijay Nagar, Indore, 452010',
    },
    {
      id: 'addr_2',
      title: 'Office',
      address: 'Ground Floor, Business Park, AB Road, Indore, 452001',
    },
  ]);

  const handleAddNewAddress = () => {
    if (!pinCode || !streetAddress) {
      const msg = 'Please enter PIN Code and Street Address';
      if (Platform.OS === 'web') window.alert(msg);
      else Alert.alert('Missing Details', msg);
      return;
    }
    const newAddr = {
      id: `addr_${Date.now()}`,
      title: 'Custom Address',
      address: `${streetAddress}${landmark ? `, Near ${landmark}` : ''}, Indore - ${pinCode}`,
    };
    setSavedAddresses([...savedAddresses, newAddr]);
    setSelectedId(newAddr.id);
    setShowAddForm(false);
    setPinCode('');
    setStreetAddress('');
    setLandmark('');
  };

  const currentSelected = savedAddresses.find((a) => a.id === selectedId) || savedAddresses[0];

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Header */}
      <View style={styles.topHeader}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.backBtn} onPress={onBack}>
            <Feather name="arrow-left" size={20} color="#0f172a" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Delivery address</Text>
        </View>

        <View style={styles.headerRightActions}>
          <TouchableOpacity style={styles.iconBtn}>
            <Feather name="bell" size={20} color="#0f172a" />
          </TouchableOpacity>
          <View style={styles.avatarCircle}>
            <Feather name="user" size={16} color="#ffffff" />
          </View>
        </View>
      </View>

      <ScrollView style={styles.scrollBody} showsVerticalScrollIndicator={false}>
        {/* Saved Addresses Label */}
        <Text style={styles.sectionHeading}>SAVED ADDRESSES</Text>

        {/* Address Radio List */}
        <View style={styles.addressList}>
          {savedAddresses.map((item) => {
            const isSelected = selectedId === item.id;
            return (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.addressCard,
                  isSelected ? styles.addressCardSelected : null,
                ]}
                onPress={() => setSelectedId(item.id)}
                activeOpacity={0.85}
              >
                <View style={styles.radioOuter}>
                  {isSelected && <View style={styles.radioInner} />}
                </View>
                <View style={styles.addressMeta}>
                  <Text style={styles.addressTitle}>{item.title}</Text>
                  <Text style={styles.addressBody}>{item.address}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Add New Address Button */}
        <TouchableOpacity
          style={styles.addAddressBtn}
          onPress={() => setShowAddForm(!showAddForm)}
        >
          <Feather name="plus" size={16} color="#65a30d" />
          <Text style={styles.addAddressText}>Add new delivery address</Text>
        </TouchableOpacity>

        {/* Address Input Form */}
        {showAddForm && (
          <View style={styles.formContainer}>
            <Text style={styles.inputLabel}>PIN CODE</Text>
            <TextInput
              style={styles.formInput}
              placeholder="e.g. 452010"
              placeholderTextColor="#94a3b8"
              keyboardType="number-pad"
              value={pinCode}
              onChangeText={setPinCode}
            />

            <Text style={styles.inputLabel}>STREET ADDRESS</Text>
            <TextInput
              style={styles.formInput}
              placeholder="House/flat no., street name"
              placeholderTextColor="#94a3b8"
              value={streetAddress}
              onChangeText={setStreetAddress}
            />

            <Text style={styles.inputLabel}>LANDMARK (OPTIONAL)</Text>
            <TextInput
              style={styles.formInput}
              placeholder="Nearby landmark"
              placeholderTextColor="#94a3b8"
              value={landmark}
              onChangeText={setLandmark}
            />

            <TouchableOpacity style={styles.saveAddrBtn} onPress={handleAddNewAddress}>
              <Text style={styles.saveAddrText}>Save Address</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Bottom Sticky Action Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.paymentBtn}
          onPress={() => onProceedToPayment(currentSelected)}
          activeOpacity={0.85}
        >
          <Text style={styles.paymentText}>Proceed to Payment</Text>
          <Feather name="arrow-right" size={18} color="#ffffff" />
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBtn: {
    padding: 4,
  },
  avatarCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#4d7c0f',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollBody: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionHeading: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: 1,
    marginBottom: 14,
  },
  addressList: {
    gap: 12,
    marginBottom: 16,
  },
  addressCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#ffffff',
    borderColor: '#e2e8f0',
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    gap: 12,
  },
  addressCardSelected: {
    borderColor: '#65a30d',
    borderWidth: 1.5,
    backgroundColor: '#f9fef0',
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#65a30d',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#65a30d',
  },
  addressMeta: {
    flex: 1,
  },
  addressTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4,
    fontFamily: 'PlusJakartaSans-Bold',
  },
  addressBody: {
    fontSize: 12,
    color: '#64748b',
    lineHeight: 18,
    fontFamily: 'PlusJakartaSans-Regular',
  },
  addAddressBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderColor: '#65a30d',
    borderStyle: 'dashed',
    borderRadius: 18,
    height: 48,
    marginBottom: 24,
    backgroundColor: '#f9fef0',
  },
  addAddressText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#65a30d',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  formContainer: {
    backgroundColor: '#f8fafc',
    borderRadius: 18,
    padding: 16,
    marginBottom: 30,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: 1,
    marginBottom: 6,
  },
  formInput: {
    backgroundColor: '#ffffff',
    borderColor: '#e2e8f0',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 44,
    fontSize: 13,
    color: '#0f172a',
    marginBottom: 14,
  },
  saveAddrBtn: {
    backgroundColor: '#65a30d',
    borderRadius: 14,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  saveAddrText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 13,
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    backgroundColor: '#ffffff',
  },
  paymentBtn: {
    backgroundColor: '#365314', // dark olive green matching Image 2 Right
    borderRadius: 24,
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  paymentText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#ffffff',
    fontFamily: 'PlusJakartaSans-Bold',
  },
});

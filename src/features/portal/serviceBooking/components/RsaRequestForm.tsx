import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  FlatList,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import {
  fetchCrmServiceCentersApi,
  fetchCrmVehiclesApi,
  fetchMeApi
} from '../api';
import {
  ServiceCenter,
  VehicleSelect
} from '../types';

// ======================== STATIC SELECT OPTIONS ========================

const ISSUE_TYPES = [
  { label: 'Breakdown / Won\'t Start', value: 'breakdown' },
  { label: 'Flat Tyre', value: 'flat_tyre' },
  { label: 'Battery Drain', value: 'battery_drain' },
  { label: 'Charging Failure', value: 'charging_failure' },
  { label: 'Accident', value: 'accident' },
  { label: 'Towing Required', value: 'tow' },
  { label: 'Other Issue', value: 'other' },
];

// ======================== DROPDOWN SELECT MODAL COMPONENT ========================

interface SelectorFieldProps {
  label: string;
  valueLabel: string;
  placeholder: string;
  options: { label: string; value: string; subLabel?: string }[];
  onSelect: (value: string, option: any) => void;
  disabled?: boolean;
  error?: string;
  searchable?: boolean;
  required?: boolean;
}

const SelectorField: React.FC<SelectorFieldProps> = ({
  label,
  valueLabel,
  placeholder,
  options,
  onSelect,
  disabled = false,
  error,
  searchable = false,
  required = false,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredOptions = options.filter(opt =>
    opt.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (opt.subLabel && opt.subLabel.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>
        {label} {required && <Text style={styles.required}>*</Text>}
      </Text>
      
      <TouchableOpacity
        style={[
          styles.selectorButton,
          disabled && styles.disabledInput,
          error && styles.errorInput
        ]}
        onPress={() => !disabled && setModalVisible(true)}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <Text style={[styles.selectorValue, !valueLabel && styles.placeholder]}>
          {valueLabel || placeholder}
        </Text>
        <Feather name="chevron-down" size={18} color="#71717a" />
      </TouchableOpacity>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => { setModalVisible(false); setSearchQuery(''); }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select {label}</Text>
              <TouchableOpacity onPress={() => { setModalVisible(false); setSearchQuery(''); }}>
                <Feather name="x" size={24} color="#18181b" />
              </TouchableOpacity>
            </View>

            {/* Optional Search Bar */}
            {searchable && (
              <View style={styles.searchBarContainer}>
                <Feather name="search" size={16} color="#71717a" style={styles.searchIcon} />
                <TextInput
                  style={styles.searchInput}
                  placeholder={`Search ${label.toLowerCase()}...`}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholderTextColor="#a1a1aa"
                  autoCapitalize="none"
                />
              </View>
            )}

            {/* List */}
            <FlatList
              data={filteredOptions}
              keyExtractor={(item) => item.value}
              contentContainerStyle={styles.listContainer}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.listItem}
                  onPress={() => {
                    onSelect(item.value, item);
                    setModalVisible(false);
                    setSearchQuery('');
                  }}
                >
                  <View>
                    <Text style={styles.listItemText}>{item.label}</Text>
                    {item.subLabel ? <Text style={styles.listItemSubText}>{item.subLabel}</Text> : null}
                  </View>
                  {valueLabel === item.label && (
                    <Feather name="check" size={18} color="#95d03a" />
                  )}
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No results found</Text>
                </View>
              }
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

// ======================== RSA REQUEST FORM COMPONENT ========================

interface RsaRequestFormProps {
  customerId?: string;
  vehicleId?: string;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export const RsaRequestForm: React.FC<RsaRequestFormProps> = ({
  customerId = '',
  vehicleId = '',
  onSubmit,
  onCancel,
  isSubmitting = false,
}) => {
  // Form values
  const [selectedCustomerId, setSelectedCustomerId] = useState(customerId);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');

  const [selectedVehicleId, setSelectedVehicleId] = useState(vehicleId);
  const [selectedVehicleNo, setSelectedVehicleNo] = useState('');

  const [selectedCenterId, setSelectedCenterId] = useState('');
  const [selectedCenterName, setSelectedCenterName] = useState('');

  const [issueType, setIssueType] = useState('breakdown');
  const [issueDescription, setIssueDescription] = useState('');

  const [breakdownAddress, setBreakdownAddress] = useState('');
  const [latitude, setLatitude] = useState('37.45291');
  const [longitude, setLongitude] = useState('-122.1843');

  // Load lists
  const [vehiclesList, setVehiclesList] = useState<VehicleSelect[]>([]);
  const [serviceCentersList, setServiceCentersList] = useState<ServiceCenter[]>([]);

  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingVehicles, setLoadingVehicles] = useState(false);
  const [loadingCenters, setLoadingCenters] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});

  // 1. Fetch Profile and Service Centers
  useEffect(() => {
    const loadProfileAndCenters = async () => {
      setLoadingProfile(true);
      setLoadingCenters(true);
      try {
        const me = await fetchMeApi();
        if (me) {
          if (me.customerId) {
            setSelectedCustomerId(me.customerId);
          }
          setCustomerName(me.fullName || me.username || 'Customer');
          setCustomerPhone(me.phone || '');
        }
      } catch (err) {
        console.warn('Failed to load profile via /auth/me', err);
      }

      try {
        const centers = await fetchCrmServiceCentersApi();
        setServiceCentersList(centers);
      } catch (err) {
        console.warn('Failed to load service centers', err);
      } finally {
        setLoadingProfile(false);
        setLoadingCenters(false);
      }
    };
    loadProfileAndCenters();
  }, []);

  // 2. Fetch Vehicles when customer ID becomes available
  useEffect(() => {
    if (!selectedCustomerId) return;
    const loadVehicles = async () => {
      setLoadingVehicles(true);
      try {
        const vehicles = await fetchCrmVehiclesApi(selectedCustomerId);
        setVehiclesList(vehicles);
        // Autoselect vehicle if matched
        if (vehicleId) {
          const match = vehicles.find(v => v.vehicleId === vehicleId);
          if (match) {
            setSelectedVehicleNo(match.registrationNo || 'My Vehicle');
          }
        } else if (vehicles.length > 0) {
          setSelectedVehicleId(vehicles[0].vehicleId);
          setSelectedVehicleNo(vehicles[0].registrationNo || 'My Vehicle');
        }
      } catch (err) {
        console.warn('Failed to load vehicles', err);
      } finally {
        setLoadingVehicles(false);
      }
    };
    loadVehicles();
  }, [selectedCustomerId, vehicleId]);

  // Handle vehicle select
  const handleVehicleSelect = (val: string, option: any) => {
    setSelectedVehicleId(val);
    setSelectedVehicleNo(option.label);
    if (errors.vehicleId) {
      setErrors(prev => ({ ...prev, vehicleId: '' }));
    }
  };

  // Handle center select
  const handleCenterSelect = (val: string, option: any) => {
    setSelectedCenterId(val);
    setSelectedCenterName(option.label);
  };

  // Validate and submit request
  const handleConfirm = () => {
    const newErrors: Record<string, string> = {};

    if (!selectedCustomerId) {
      newErrors.customerId = 'Customer profile is required.';
    }
    if (!selectedVehicleId) {
      newErrors.vehicleId = 'Please select a vehicle.';
    }
    if (!issueType) {
      newErrors.issueType = 'Please select an issue type.';
    }
    if (!breakdownAddress.trim()) {
      newErrors.breakdownAddress = 'Breakdown address is required.';
    }

    const latNum = parseFloat(latitude);
    if (isNaN(latNum) || latNum < -90 || latNum > 90) {
      newErrors.latitude = 'Latitude must be a number between -90 and 90.';
    }

    const lngNum = parseFloat(longitude);
    if (isNaN(lngNum) || lngNum < -180 || lngNum > 180) {
      newErrors.longitude = 'Longitude must be a number between -180 and 180.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit({
      customerId: selectedCustomerId,
      vehicleId: selectedVehicleId,
      centerId: selectedCenterId || undefined,
      channel: 'app_sos',
      issueType,
      issueDescription: issueDescription.trim() || undefined,
      breakdownLatitude: latNum,
      breakdownLongitude: lngNum,
      breakdownAddress: breakdownAddress.trim() || undefined,
      // For success screen UI visualization fallback
      customerName,
      customerPhone,
      vehicleNo: selectedVehicleNo,
      centerName: selectedCenterName || undefined,
    });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onCancel}>
          <Feather name="arrow-left" size={20} color="#18181b" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Doorstep Pickup (RSA)</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <Text style={styles.description}>
          Please fill out the details below. An emergency Roadside Assistance (RSA) request will be registered, and a recovery team will be dispatched.
        </Text>

        {/* 1. Profile Details (Read Only) */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>Customer Profile Details</Text>
          {loadingProfile ? (
            <ActivityIndicator size="small" color="#95d03a" style={{ marginVertical: 10 }} />
          ) : (
            <>
              <View style={styles.formRow}>
                <View style={styles.halfInputGroup}>
                  <Text style={styles.readOnlyLabel}>Customer Name</Text>
                  <TextInput
                    style={[styles.input, styles.readOnlyInput]}
                    value={customerName}
                    editable={false}
                  />
                </View>
                <View style={styles.halfInputGroup}>
                  <Text style={styles.readOnlyLabel}>Phone Number</Text>
                  <TextInput
                    style={[styles.input, styles.readOnlyInput]}
                    value={customerPhone}
                    editable={false}
                  />
                </View>
              </View>
            </>
          )}
        </View>

        {/* 2. Request Parameters Form */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>Breakdown & Service Request</Text>

          {/* Vehicle Dropdown */}
          <SelectorField
            label="Vehicle"
            valueLabel={selectedVehicleNo}
            placeholder={loadingVehicles ? 'Loading vehicles...' : 'Select Vehicle'}
            options={vehiclesList.map(v => ({
              label: v.registrationNo || 'Vehicle',
              value: v.vehicleId,
            }))}
            onSelect={handleVehicleSelect}
            required
            disabled={loadingVehicles}
            error={errors.vehicleId}
          />

          {/* Issue Type Dropdown */}
          <SelectorField
            label="Issue Type"
            valueLabel={ISSUE_TYPES.find(i => i.value === issueType)?.label || ''}
            placeholder="Select Issue Type"
            options={ISSUE_TYPES}
            onSelect={(val) => {
              setIssueType(val);
              if (errors.issueType) {
                setErrors(prev => ({ ...prev, issueType: '' }));
              }
            }}
            required
            error={errors.issueType}
          />

          {/* Issue Description */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Issue Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Provide details about the issue (e.g. tyre burst, charging error code, wont start...)"
              placeholderTextColor="#a1a1aa"
              value={issueDescription}
              onChangeText={setIssueDescription}
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Breakdown Address */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Breakdown Address <Text style={styles.required}>*</Text></Text>
            <TextInput
              style={[styles.input, errors.breakdownAddress ? styles.errorInput : null]}
              placeholder="Street Address, Landmark, City"
              placeholderTextColor="#a1a1aa"
              value={breakdownAddress}
              onChangeText={(text) => {
                setBreakdownAddress(text);
                if (errors.breakdownAddress) {
                  setErrors(prev => ({ ...prev, breakdownAddress: '' }));
                }
              }}
            />
            {errors.breakdownAddress ? <Text style={styles.errorText}>{errors.breakdownAddress}</Text> : null}
          </View>

          {/* GPS Coordinates Row */}
          <View style={styles.formRow}>
            <View style={styles.halfInputGroup}>
              <Text style={styles.label}>Latitude <Text style={styles.required}>*</Text></Text>
              <TextInput
                style={[styles.input, errors.latitude ? styles.errorInput : null]}
                value={latitude}
                onChangeText={(text) => {
                  setLatitude(text);
                  if (errors.latitude) {
                    setErrors(prev => ({ ...prev, latitude: '' }));
                  }
                }}
                keyboardType="numeric"
              />
              {errors.latitude ? <Text style={styles.errorText}>{errors.latitude}</Text> : null}
            </View>
            <View style={styles.halfInputGroup}>
              <Text style={styles.label}>Longitude <Text style={styles.required}>*</Text></Text>
              <TextInput
                style={[styles.input, errors.longitude ? styles.errorInput : null]}
                value={longitude}
                onChangeText={(text) => {
                  setLongitude(text);
                  if (errors.longitude) {
                    setErrors(prev => ({ ...prev, longitude: '' }));
                  }
                }}
                keyboardType="numeric"
              />
              {errors.longitude ? <Text style={styles.errorText}>{errors.longitude}</Text> : null}
            </View>
          </View>

          {/* Service Center Selection */}
          <SelectorField
            label="Preferred Service Center (Optional)"
            valueLabel={selectedCenterName}
            placeholder={loadingCenters ? 'Loading centers...' : 'Select Service Center'}
            options={serviceCentersList.map(c => ({
              label: c.centerName,
              value: c.centerId,
            }))}
            onSelect={handleCenterSelect}
            searchable
            disabled={loadingCenters}
          />
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onCancel}
            disabled={isSubmitting}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleConfirm}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text style={styles.submitButtonText}>Confirm Request</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#faf9f6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 48 : 20,
    paddingBottom: 16,
    paddingHorizontal: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f4f4f5',
  },
  backButton: {
    marginRight: 16,
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#18181b',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  scrollContainer: {
    padding: 20,
  },
  description: {
    fontSize: 13,
    lineHeight: 18,
    color: '#71717a',
    fontFamily: 'PlusJakartaSans-Regular',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e4e4e7',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 1,
  },
  cardHeader: {
    fontSize: 14,
    fontWeight: '800',
    color: '#18181b',
    fontFamily: 'PlusJakartaSans-Bold',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputGroup: {
    marginBottom: 16,
  },
  halfInputGroup: {
    flex: 1,
    marginRight: 8,
  },
  formRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#27272a',
    marginBottom: 6,
    fontFamily: 'PlusJakartaSans-Medium',
  },
  readOnlyLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#71717a',
    marginBottom: 6,
    fontFamily: 'PlusJakartaSans-Medium',
  },
  required: {
    color: '#ef4444',
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e4e4e7',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#18181b',
    fontFamily: 'PlusJakartaSans-Regular',
  },
  readOnlyInput: {
    backgroundColor: '#f4f4f5',
    borderColor: '#e4e4e7',
    color: '#71717a',
  },
  textArea: {
    height: 70,
    textAlignVertical: 'top',
  },
  selectorButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e4e4e7',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  selectorValue: {
    fontSize: 14,
    color: '#18181b',
    fontFamily: 'PlusJakartaSans-Regular',
  },
  placeholder: {
    color: '#a1a1aa',
  },
  disabledInput: {
    backgroundColor: '#f4f4f5',
  },
  errorInput: {
    borderColor: '#ef4444',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 11,
    marginTop: 4,
    fontFamily: 'PlusJakartaSans-Regular',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 30,
  },
  cancelButton: {
    flex: 1,
    marginRight: 10,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e4e4e7',
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#71717a',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  submitButton: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#95d03a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
    fontFamily: 'PlusJakartaSans-Bold',
  },

  // Modal selector styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '80%',
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#18181b',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f4f4f5',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 16,
    height: 40,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#18181b',
    fontFamily: 'PlusJakartaSans-Regular',
  },
  listContainer: {
    paddingBottom: 24,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f4f4f5',
  },
  listItemText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#18181b',
    fontFamily: 'PlusJakartaSans-Medium',
  },
  listItemSubText: {
    fontSize: 11,
    color: '#71717a',
    fontFamily: 'PlusJakartaSans-Regular',
    marginTop: 2,
  },
  emptyContainer: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  emptyText: {
    color: '#71717a',
    fontSize: 13,
    fontFamily: 'PlusJakartaSans-Regular',
  },
});

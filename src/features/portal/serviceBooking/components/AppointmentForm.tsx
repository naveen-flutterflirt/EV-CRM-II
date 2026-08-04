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
  fetchStatesApi,
  fetchCrmServiceCentersApi,
  fetchCrmCustomersApi,
  fetchCrmVehiclesApi,
  fetchCrmServiceBaysApi,
  fetchMeApi
} from '../api';
import {
  StateItem,
  ServiceCenter,
  CustomerSelect,
  VehicleSelect,
  ServiceBaySelect
} from '../types';

// ======================== STATIC SELECT OPTIONS ========================

const CHANNELS = [
  { label: 'Walk-in', value: 'walk_in' },
  { label: 'Phone', value: 'phone' },
  { label: 'App', value: 'mobile_app' },
  { label: 'Website', value: 'website' },
  { label: 'Call Center', value: 'call_center' },
  { label: 'Roadside', value: 'roadside' },
];

const JOB_TYPES = [
  { label: 'Maintenance', value: 'scheduled_maintenance' },
  { label: 'Repair', value: 'breakdown_repair' },
  { label: 'Battery Service', value: 'battery_service' },
  { label: 'Inspection', value: 'inspection' },
  { label: 'Warranty', value: 'warranty' },
  { label: 'Accident', value: 'accident' },
  { label: 'Software Update', value: 'software_update' },
  { label: 'Recall', value: 'recall' },
  { label: 'AMC Service', value: 'amc_service' },
  { label: 'Roadside Assist', value: 'roadside_assist' },
];

const STATUSES = [
  { label: 'Requested', value: 'requested' },
  { label: 'Confirmed', value: 'confirmed' },
  { label: 'Rescheduled', value: 'rescheduled' },
  { label: 'Checked In', value: 'checked_in' },
  { label: 'No-Show', value: 'no_show' },
  { label: 'Cancelled', value: 'cancelled' },
  { label: 'Completed', value: 'completed' },
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
      <Text style={styles.fieldLabel}>
        {label} {required && <Text style={styles.requiredStar}>*</Text>}
      </Text>
      
      <TouchableOpacity
        style={[
          styles.selectorTrigger,
          disabled && styles.disabledTrigger,
          error ? styles.errorBorder : styles.normalBorder,
        ]}
        onPress={() => !disabled && setModalVisible(true)}
        activeOpacity={disabled ? 1 : 0.7}
      >
        <Text style={[styles.triggerText, !valueLabel && styles.placeholderText]}>
          {valueLabel || placeholder}
        </Text>
        <Feather name="chevron-down" size={18} color={disabled ? '#a1a1aa' : '#71717a'} />
      </TouchableOpacity>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
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

// ======================== APPOINTMENT FORM COMPONENT ========================

interface AppointmentFormProps {
  initialCenterId?: string;
  initialCenterName?: string;
  customerId?: string;
  vehicleId?: string;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export const AppointmentForm: React.FC<AppointmentFormProps> = ({
  initialCenterId = '',
  initialCenterName = '',
  customerId = '',
  vehicleId = '',
  onSubmit,
  onCancel,
  isSubmitting = false,
}) => {
  // Form States
  const [apptNumber] = useState('Auto-generated on save');
  const [selectedStateId, setSelectedStateId] = useState('');
  const [selectedStateName, setSelectedStateName] = useState('');
  
  const [selectedCenterId, setSelectedCenterId] = useState(initialCenterId);
  const [selectedCenterName, setSelectedCenterName] = useState(initialCenterName);

  const [selectedCustomerId, setSelectedCustomerId] = useState(customerId);
  const [selectedCustomerName, setSelectedCustomerName] = useState('');
  const [selectedCustomerCode, setSelectedCustomerCode] = useState('');

  const [selectedVehicleId, setSelectedVehicleId] = useState(vehicleId);
  const [selectedVehicleNo, setSelectedVehicleNo] = useState('');

  // Date and Time picker states
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  const [datePickerVisible, setDatePickerVisible] = useState(false);

  const [channel, setChannel] = useState('mobile_app');
  const [jobType, setJobType] = useState('scheduled_maintenance');
  const [notes, setNotes] = useState('');
  
  const [assignedBayId, setAssignedBayId] = useState<string | null>(null);
  const [assignedBayName, setAssignedBayName] = useState('Unassigned');
  
  const [status, setStatus] = useState('requested');

  // Dynamic API State lists
  const [statesList, setStatesList] = useState<StateItem[]>([]);
  const [serviceCentersList, setServiceCentersList] = useState<ServiceCenter[]>([]);
  const [customersList, setCustomersList] = useState<CustomerSelect[]>([]);
  const [vehiclesList, setVehiclesList] = useState<VehicleSelect[]>([]);
  const [baysList, setBaysList] = useState<ServiceBaySelect[]>([]);

  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCenters, setLoadingCenters] = useState(false);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [loadingVehicles, setLoadingVehicles] = useState(false);
  const [loadingBays, setLoadingBays] = useState(false);

  // Errors state
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch States & Customers on mount
  useEffect(() => {
    const loadInitial = async () => {
      setLoadingStates(true);
      setLoadingCustomers(true);
      try {
        const states = await fetchStatesApi();
        setStatesList(states);
      } catch (err) {
        console.warn("Failed to load states", err);
      }

      try {
        const customers = await fetchCrmCustomersApi();
        setCustomersList(customers);
      } catch (err) {
        console.warn("Failed to load all customers (likely 403 Forbidden). Fetching self profile...", err);
        try {
          const me = await fetchMeApi();
          if (me && me.customerId) {
            setCustomersList([{
              customerId: me.customerId,
              name: me.fullName || me.username || "Customer",
              customerCode: `CUST-${me.customerId.substring(0, 5)}`
            }]);

            // Prefill home center if initialCenterId is not set
            if (!initialCenterId && me.homeCenter) {
              setSelectedCenterId(me.homeCenter.centerId);
              setSelectedCenterName(me.homeCenter.centerName);
              if (me.homeCenter.stateId) {
                setSelectedStateId(me.homeCenter.stateId);
                setSelectedStateName(me.homeCenter.state?.stateName || '');
              }
            }
          }
        } catch (meErr) {
          console.warn("Failed to load self profile", meErr);
        }
      } finally {
        setLoadingStates(false);
        setLoadingCustomers(false);
      }
    };
    loadInitial();
  }, [initialCenterId]);

  // Fetch Service Centers when state changes
  useEffect(() => {
    const loadCenters = async () => {
      setLoadingCenters(true);
      try {
        const centers = await fetchCrmServiceCentersApi(selectedStateId || undefined);
        setServiceCentersList(centers);
      } catch (err) {
        console.warn("Failed to load centers", err);
      } finally {
        setLoadingCenters(false);
      }
    };
    loadCenters();
  }, [selectedStateId]);

  // Fetch Vehicles when customer changes
  useEffect(() => {
    const loadVehicles = async () => {
      setLoadingVehicles(true);
      try {
        const vehicles = await fetchCrmVehiclesApi();
        if (vehicles && vehicles.length > 0) {
          setVehiclesList(vehicles);
        } else {
          setVehiclesList([{
            vehicleId: vehicleId || 'veh_450x',
            registrationNo: 'Ather 450X (MP-04-AB-1234)',
            customerId: selectedCustomerId
          }]);
        }
      } catch (err) {
        console.warn("Failed to load vehicles, using fallback", err);
        setVehiclesList([{
          vehicleId: vehicleId || 'veh_450x',
          registrationNo: 'Ather 450X (MP-04-AB-1234)',
          customerId: selectedCustomerId
        }]);
      } finally {
        setLoadingVehicles(false);
      }
    };
    loadVehicles();
  }, [selectedCustomerId, vehicleId]);

  // Fetch Bays when center changes
  useEffect(() => {
    const loadBays = async () => {
      if (!selectedCenterId) {
        setBaysList([]);
        return;
      }
      setLoadingBays(true);
      try {
        const bays = await fetchCrmServiceBaysApi(selectedCenterId);
        setBaysList(bays);
      } catch (err) {
        console.warn("Failed to load bays", err);
      } finally {
        setLoadingBays(false);
      }
    };
    loadBays();
  }, [selectedCenterId]);

  // 1. Resolve State from initialCenterId
  useEffect(() => {
    if (initialCenterId && serviceCentersList.length > 0) {
      const center = serviceCentersList.find(c => c.centerId === initialCenterId);
      if (center) {
        setSelectedCenterName(center.centerName);
        const stateObj = statesList.find(s => s.stateId === center.stateId);
        if (stateObj) {
          setSelectedStateId(stateObj.stateId);
          setSelectedStateName(stateObj.stateName);
        }
      }
    }
  }, [initialCenterId, serviceCentersList, statesList]);

  // 2. Pre-fill customer name/code if customerId is provided
  useEffect(() => {
    if (customerId && customersList.length > 0) {
      const custObj = customersList.find(c => c.customerId === customerId);
      if (custObj) {
        setSelectedCustomerId(custObj.customerId);
        setSelectedCustomerName(custObj.name);
        setSelectedCustomerCode(custObj.customerCode || '');
      }
    } else if (!selectedCustomerId && customersList.length > 0) {
      const custObj = customersList[0];
      setSelectedCustomerId(custObj.customerId);
      setSelectedCustomerName(custObj.name);
      setSelectedCustomerCode(custObj.customerCode || '');
    }
  }, [customerId, customersList]);

  // 3. Pre-fill vehicle if vehicleId is provided OR customer changes
  useEffect(() => {
    if (selectedCustomerId && vehiclesList.length > 0) {
      const custVehicles = vehiclesList;
      if (vehicleId) {
        const matchingVeh = custVehicles.find(v => v.vehicleId === vehicleId);
        if (matchingVeh) {
          setSelectedVehicleId(matchingVeh.vehicleId);
          setSelectedVehicleNo(matchingVeh.registrationNo);
          return;
        }
      }
      if (custVehicles.length > 0) {
        setSelectedVehicleId(custVehicles[0].vehicleId);
        setSelectedVehicleNo(custVehicles[0].registrationNo);
      } else {
        setSelectedVehicleId('');
        setSelectedVehicleNo('');
      }
    }
  }, [selectedCustomerId, vehicleId, vehiclesList]);

  // 4. Default to first service center if none is selected or resolved
  useEffect(() => {
    if (serviceCentersList.length > 0 && !selectedCenterId) {
      const firstCenter = serviceCentersList[0];
      setSelectedCenterId(firstCenter.centerId);
      setSelectedCenterName(firstCenter.centerName);
      if (firstCenter.stateId) {
        setSelectedStateId(firstCenter.stateId);
      }
    }
  }, [serviceCentersList, selectedCenterId]);

  // Validate form
  const validateForm = () => {
    const tempErrors: Record<string, string> = {};
    if (!selectedVehicleId) tempErrors.vehicle = 'Vehicle is required';
    if (!selectedDate || !selectedTimeSlot) tempErrors.dateTime = 'Scheduled date & time is required';

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  // Generate next 7 days for the date picker
  const generateNext7Days = () => {
    const days = [];
    const weekdayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const dateString = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const dayLabel = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : `${weekdayNames[d.getDay()]}, ${d.getDate()} ${monthNames[d.getMonth()]}`;
      days.push({ value: dateString, label: dayLabel });
    }
    return days;
  };

  const timeSlots = [
    '09:00 AM - 11:00 AM',
    '11:00 AM - 01:00 PM',
    '01:00 PM - 03:00 PM',
    '03:00 PM - 05:00 PM',
    '05:00 PM - 07:00 PM',
  ];

  // Submit Handler
  const handleSubmit = () => {
    if (!validateForm()) return;

    // Convert date + slot to ISO Date
    let isoDateTime = new Date().toISOString();
    try {
      const timePart = selectedTimeSlot.split(' - ')[0]; // '09:00 AM'
      const [timeVal, modifier] = timePart.split(' '); // ['09:00', 'AM']
      let [hours, minutes] = timeVal.split(':');
      let parsedHours = parseInt(hours, 10);
      if (parsedHours === 12) parsedHours = 0;
      if (modifier === 'PM') parsedHours += 12;

      const [year, month, day] = selectedDate.split('-').map(num => parseInt(num, 10));
      const combinedDate = new Date(year, month - 1, day, parsedHours, parseInt(minutes, 10), 0, 0);
      isoDateTime = combinedDate.toISOString();
    } catch (e) {
      console.warn('Failed to parse date/time, using default', e);
    }

    const payload = {
      scheduledAt: isoDateTime,
      customerName: selectedCustomerName,
      customerCode: selectedCustomerCode,
      customerId: selectedCustomerId,
      vehicleNo: selectedVehicleNo,
      vehicleId: selectedVehicleId,
      serviceCenter: selectedCenterName,
      centerId: selectedCenterId,
      stateId: selectedStateId,
      stateName: selectedStateName,
      jobType,
      channel,
      assignedBay: assignedBayName,
      assignedBayId,
      status,
      notes: notes.trim(),
    };

    onSubmit(payload);
  };

  // Options filtering based on selections
  const stateOptions = statesList.map(s => ({ label: s.stateName, value: s.stateId }));
  const centerOptions = serviceCentersList.map(c => ({ label: c.centerName, value: c.centerId, subLabel: c.centerCode }));
  const customerOptions = customersList.map(c => ({ label: c.name, value: c.customerId, subLabel: c.customerCode }));
  const vehicleOptions = vehiclesList.map(v => ({ label: v.registrationNo, value: v.vehicleId }));
  const bayOptions = [
    { label: 'Unassigned', value: '' },
    ...baysList.map(b => ({ label: b.bayType ? `${b.bayCode} (${b.bayType.replace(/_/g, ' ')})` : b.bayCode, value: b.bayId }))
  ];


  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.flexContainer}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.formCard}>
          {/* Header */}
          <View style={styles.formHeader}>
            <View style={styles.headerDot} />
            <View>
              <Text style={styles.formTitle}>New Service Appointment</Text>
              <Text style={styles.formSubtitle}>Mirroring ERP AddAppointmentModal fields</Text>
            </View>
          </View>

          {/* SECTION 1: APPOINTMENT DETAILS */}
          <View style={styles.sectionHeaderContainer}>
            <Text style={styles.sectionTitle}>APPOINTMENT DETAILS</Text>
            <View style={styles.sectionDivider} />
          </View>



          {/* Vehicle */}
          <SelectorField
            label="Vehicle"
            valueLabel={selectedVehicleNo}
            placeholder={selectedCustomerId ? "Select Vehicle..." : "Select Customer First"}
            options={vehicleOptions}
            onSelect={(val, opt) => {
              setSelectedVehicleId(val);
              setSelectedVehicleNo(opt.label);
            }}
            disabled={!selectedCustomerId}
            required
            error={errors.vehicle}
          />

          {/* Scheduled Date & Time */}
          <View style={styles.inputGroup}>
            <Text style={styles.fieldLabel}>
              Scheduled Date & Time <Text style={styles.requiredStar}>*</Text>
            </Text>
            <TouchableOpacity
              style={[
                styles.selectorTrigger,
                errors.dateTime ? styles.errorBorder : styles.normalBorder,
              ]}
              onPress={() => setDatePickerVisible(true)}
              activeOpacity={0.7}
            >
              <Text style={[styles.triggerText, (!selectedDate || !selectedTimeSlot) && styles.placeholderText]}>
                {selectedDate && selectedTimeSlot
                  ? `${selectedDate} | ${selectedTimeSlot.split(' - ')[0]}`
                  : 'Pick Date & Time Slot...'}
              </Text>
              <Feather name="calendar" size={18} color="#71717a" />
            </TouchableOpacity>
            {errors.dateTime ? <Text style={styles.errorText}>{errors.dateTime}</Text> : null}
          </View>



          {/* SECTION 2: SERVICE DETAILS */}
          <View style={styles.sectionHeaderContainer}>
            <Text style={styles.sectionTitle}>SERVICE DETAILS</Text>
            <View style={styles.sectionDivider} />
          </View>

          {/* Job Type */}
          <SelectorField
            label="Job Type"
            valueLabel={JOB_TYPES.find(j => j.value === jobType)?.label || 'Maintenance'}
            placeholder="Select Job Type..."
            options={JOB_TYPES}
            onSelect={(val) => setJobType(val)}
          />

          {/* Complaint / Notes */}
          <View style={styles.inputGroup}>
            <Text style={styles.fieldLabel}>Complaint / Notes</Text>
            <TextInput
              style={styles.textAreaInput}
              multiline
              numberOfLines={4}
              value={notes}
              onChangeText={setNotes}
              placeholder="Describe the complaint or service notes here..."
              placeholderTextColor="#a1a1aa"
            />
          </View>



          {/* Form Action Buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onCancel}
              disabled={isSubmitting}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.submitButton, (!selectedCustomerId || !selectedCenterId) && { opacity: 0.6 }]}
              onPress={handleSubmit}
              disabled={isSubmitting || !selectedCustomerId || !selectedCenterId}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#1a2b0c" />
              ) : (
                <>
                  <Text style={styles.submitButtonText}>Confirm & Save</Text>
                  <Feather name="check" size={18} color="#1a2b0c" style={styles.buttonIcon} />
                </>
              )}
            </TouchableOpacity>
          </View>

        </View>
      </ScrollView>

      {/* DATE & TIME SLOT PICKER MODAL */}
      <Modal
        visible={datePickerVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setDatePickerVisible(false)}
      >
        <View style={styles.pickerModalOverlay}>
          <View style={styles.pickerCard}>
            <Text style={styles.pickerTitle}>Schedule Slot</Text>
            
            <Text style={styles.pickerSubtitle}>Select Date</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateRow}>
              {generateNext7Days().map((d) => {
                const isSelected = selectedDate === d.value;
                return (
                  <TouchableOpacity
                    key={d.value}
                    style={[styles.dateBubble, isSelected ? styles.selectedBubble : styles.unselectedBubble]}
                    onPress={() => setSelectedDate(d.value)}
                  >
                    <Text style={[styles.bubbleText, isSelected ? styles.selectedBubbleText : styles.unselectedBubbleText]}>
                      {d.label.split(', ')[0]}
                    </Text>
                    {d.label.includes(', ') ? (
                      <Text style={[styles.bubbleSubText, isSelected ? styles.selectedBubbleText : styles.unselectedBubbleSubText]}>
                        {d.label.split(', ')[1]}
                      </Text>
                    ) : null}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <Text style={[styles.pickerSubtitle, { marginTop: 20 }]}>Select Time Slot</Text>
            <View style={styles.timeSlotGrid}>
              {timeSlots.map((slot) => {
                const isSelected = selectedTimeSlot === slot;
                return (
                  <TouchableOpacity
                    key={slot}
                    style={[styles.timeSlotOption, isSelected ? styles.selectedTimeSlot : styles.unselectedTimeSlot]}
                    onPress={() => setSelectedTimeSlot(slot)}
                  >
                    <Text style={[styles.timeSlotText, isSelected ? styles.selectedTimeSlotText : styles.unselectedTimeSlotText]}>
                      {slot.replace(' - ', '\n')}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.pickerButtonRow}>
              <TouchableOpacity
                style={styles.pickerCancel}
                onPress={() => {
                  setSelectedDate('');
                  setSelectedTimeSlot('');
                  setDatePickerVisible(false);
                }}
              >
                <Text style={styles.pickerCancelText}>Clear</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.pickerConfirm,
                  (!selectedDate || !selectedTimeSlot) && styles.pickerConfirmDisabled,
                ]}
                onPress={() => {
                  if (selectedDate && selectedTimeSlot) {
                    setDatePickerVisible(false);
                  }
                }}
                disabled={!selectedDate || !selectedTimeSlot}
              >
                <Text style={styles.pickerConfirmText}>Apply Slot</Text>
              </TouchableOpacity>
            </View>

          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flexContainer: {
    flex: 1,
    backgroundColor: '#faf8f3',
  },
  scrollContent: {
    padding: 16,
  },
  formCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#1a2b0c',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f4f4f5',
    marginBottom: 40,
  },
  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 12,
  },
  headerDot: {
    width: 8,
    height: 32,
    borderRadius: 4,
    backgroundColor: '#95d03a',
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1a2b0c',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  formSubtitle: {
    fontSize: 11,
    color: '#71717a',
    fontFamily: 'PlusJakartaSans-Regular',
    marginTop: 2,
  },
  sectionHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 16,
    gap: 10,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#95d03a',
    letterSpacing: 1.5,
    fontFamily: 'PlusJakartaSans-Bold',
  },
  sectionDivider: {
    flex: 1,
    height: 1,
    backgroundColor: '#f4f4f5',
  },
  inputGroup: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#3f3f46',
    marginBottom: 8,
    fontFamily: 'PlusJakartaSans-Bold',
  },
  requiredStar: {
    color: '#ef4444',
  },
  selectorTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 48,
    borderRadius: 14,
    paddingHorizontal: 16,
    backgroundColor: '#fafaf9',
  },
  disabledTrigger: {
    backgroundColor: '#f4f4f5',
    opacity: 0.6,
  },
  normalBorder: {
    borderWidth: 1.5,
    borderColor: '#e4e4e7',
  },
  errorBorder: {
    borderWidth: 1.5,
    borderColor: '#ef4444',
  },
  triggerText: {
    fontSize: 14,
    color: '#18181b',
    fontWeight: '600',
    fontFamily: 'PlusJakartaSans-Medium',
  },
  placeholderText: {
    color: '#a1a1aa',
    fontWeight: '500',
  },
  disabledInput: {
    height: 48,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#e4e4e7',
    paddingHorizontal: 16,
    backgroundColor: '#f4f4f5',
    color: '#71717a',
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  textAreaInput: {
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#e4e4e7',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fafaf9',
    color: '#18181b',
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'PlusJakartaSans-Medium',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 11,
    marginTop: 4,
    paddingLeft: 4,
    fontFamily: 'PlusJakartaSans-Regular',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 32,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    height: 52,
    borderRadius: 26,
    borderWidth: 1.5,
    borderColor: '#d1d5db',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 15,
    color: '#4b5563',
    fontWeight: '700',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  submitButton: {
    flex: 2,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#a2e52c',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#a2e52c',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  submitButtonText: {
    fontSize: 15,
    color: '#1a2b0c',
    fontWeight: '700',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  buttonIcon: {
    marginLeft: 6,
  },
  // Modal Style
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f4f4f5',
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
    backgroundColor: '#fafaf9',
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 12,
    height: 40,
    borderWidth: 1,
    borderColor: '#e4e4e7',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#18181b',
    fontSize: 14,
    fontFamily: 'PlusJakartaSans-Regular',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#fafaf9',
  },
  listItemText: {
    fontSize: 15,
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
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#71717a',
    fontSize: 14,
    fontFamily: 'PlusJakartaSans-Regular',
  },
  // Date & Time Picker Modal Styles
  pickerModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  pickerCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#ffffff',
    borderRadius: 28,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#18181b',
    fontFamily: 'PlusJakartaSans-Bold',
    marginBottom: 20,
  },
  pickerSubtitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#95d03a',
    letterSpacing: 1.2,
    fontFamily: 'PlusJakartaSans-Bold',
    marginBottom: 12,
  },
  dateRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  dateBubble: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 70,
  },
  selectedBubble: {
    backgroundColor: '#e6f0d8',
    borderWidth: 1.5,
    borderColor: '#95d03a',
  },
  unselectedBubble: {
    backgroundColor: '#fafaf9',
    borderWidth: 1.5,
    borderColor: '#e4e4e7',
  },
  bubbleText: {
    fontSize: 13,
    fontWeight: '700',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  selectedBubbleText: {
    color: '#2e5b02',
  },
  unselectedBubbleText: {
    color: '#18181b',
  },
  bubbleSubText: {
    fontSize: 9,
    fontWeight: '500',
    marginTop: 2,
    fontFamily: 'PlusJakartaSans-Medium',
  },
  unselectedBubbleSubText: {
    color: '#71717a',
  },
  timeSlotGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timeSlotOption: {
    width: '48%',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedTimeSlot: {
    backgroundColor: '#e6f0d8',
    borderWidth: 1.5,
    borderColor: '#95d03a',
  },
  unselectedTimeSlot: {
    backgroundColor: '#fafaf9',
    borderWidth: 1.5,
    borderColor: '#e4e4e7',
  },
  timeSlotText: {
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 16,
    fontFamily: 'PlusJakartaSans-Bold',
  },
  selectedTimeSlotText: {
    color: '#2e5b02',
  },
  unselectedTimeSlotText: {
    color: '#52525b',
  },
  pickerButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 28,
    gap: 10,
  },
  pickerCancel: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#d1d5db',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerCancelText: {
    fontSize: 14,
    color: '#4b5563',
    fontWeight: '700',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  pickerConfirm: {
    flex: 2,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#a2e52c',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerConfirmDisabled: {
    backgroundColor: '#f4f4f5',
    opacity: 0.5,
  },
  pickerConfirmText: {
    fontSize: 14,
    color: '#1a2b0c',
    fontWeight: '700',
    fontFamily: 'PlusJakartaSans-Bold',
  },
});

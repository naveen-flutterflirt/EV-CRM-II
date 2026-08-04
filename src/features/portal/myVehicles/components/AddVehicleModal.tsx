import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { fetchVehicleMetaApi } from '../api';
import { AddVehiclePayload, VehicleManufacturerMeta, VehicleModelMeta } from '../types';

interface AddVehicleModalProps {
  visible: boolean;
  onClose: () => void;
  onAddVehicle: (payload: AddVehiclePayload) => Promise<void>;
}

type VehicleStatusOption = 'active' | 'sold' | 'scrapped' | 'stolen';

export const AddVehicleModal: React.FC<AddVehicleModalProps> = ({
  visible,
  onClose,
  onAddVehicle,
}) => {
  const [manufacturers, setManufacturers] = useState<VehicleManufacturerMeta[]>([]);
  const [loadingMeta, setLoadingMeta] = useState(false);

  const [selectedManufacturer, setSelectedManufacturer] = useState<VehicleManufacturerMeta | null>(null);
  const [selectedModel, setSelectedModel] = useState<VehicleModelMeta | null>(null);
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [vin, setVin] = useState('');
  const [motorNo, setMotorNo] = useState('');
  const [color, setColor] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [odometerKm, setOdometerKm] = useState('0');
  const [status, setStatus] = useState<VehicleStatusOption>('active');

  const [showBrandDropdown, setShowBrandDropdown] = useState(false);
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const statusOptions: { label: string; value: VehicleStatusOption }[] = [
    { label: 'Active', value: 'active' },
    { label: 'Sold', value: 'sold' },
    { label: 'Scrapped', value: 'scrapped' },
    { label: 'Stolen', value: 'stolen' },
  ];

  useEffect(() => {
    if (visible) {
      setLoadingMeta(true);
      fetchVehicleMetaApi()
        .then((data) => {
          setManufacturers(data);
          if (data.length > 0) {
            setSelectedManufacturer(data[0]);
            if (data[0].models && data[0].models.length > 0) {
              setSelectedModel(data[0].models[0]);
            }
          }
        })
        .finally(() => setLoadingMeta(false));
    }
  }, [visible]);

  const handleSelectManufacturer = (mfg: VehicleManufacturerMeta) => {
    setSelectedManufacturer(mfg);
    setShowBrandDropdown(false);
    if (mfg.models && mfg.models.length > 0) {
      setSelectedModel(mfg.models[0]);
    } else {
      setSelectedModel(null);
    }
  };

  const handleSelectModel = (mod: VehicleModelMeta) => {
    setSelectedModel(mod);
    setShowModelDropdown(false);
  };

  const handleSubmit = async () => {
    if (!selectedModel || !registrationNumber.trim()) {
      const msg = 'Please select Brand, Model, and enter Registration Number.';
      if (Platform.OS === 'web') window.alert(msg);
      else Alert.alert('Required Fields', msg);
      return;
    }

    setSubmitting(true);
    try {
      await onAddVehicle({
        modelId: selectedModel.modelId,
        brand: selectedManufacturer?.name || 'Ather Energy',
        model: selectedModel.modelName,
        registrationNumber: registrationNumber.trim(),
        vin: vin.trim() || undefined,
        motorNo: motorNo.trim() || undefined,
        color: color.trim() || undefined,
        purchaseDate: purchaseDate.trim() || undefined,
        odometerKm: odometerKm ? Number(odometerKm) : 0,
        status: status,
      });
      const msg = 'Vehicle added successfully!';
      if (Platform.OS === 'web') window.alert(msg);
      else Alert.alert('Success', msg);
      setRegistrationNumber('');
      setVin('');
      setMotorNo('');
      setColor('');
      setPurchaseDate('');
      setOdometerKm('0');
      setStatus('active');
      onClose();
    } catch (err: any) {
      const msg = err.message || 'Failed to create vehicle.';
      if (Platform.OS === 'web') window.alert(msg);
      else Alert.alert('Error', msg);
    } finally {
      setSubmitting(false);
    }
  };

  const availableModels = selectedManufacturer?.models || [];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add New EV Vehicle</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Feather name="x" size={20} color="#0f172a" />
            </TouchableOpacity>
          </View>

          {loadingMeta ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="small" color="#4d7c0f" />
              <Text style={styles.loadingText}>Fetching Brands & Models...</Text>
            </View>
          ) : (
            <ScrollView style={styles.formScroll} showsVerticalScrollIndicator={false}>
              <View style={styles.formGroup}>
                {/* 1. Registration Number */}
                <View style={styles.inputWrap}>
                  <Text style={styles.label}>REGISTRATION NUMBER *</Text>
                  <TextInput
                    style={[styles.input, { outlineStyle: 'none' } as any]}
                    value={registrationNumber}
                    onChangeText={setRegistrationNumber}
                    placeholder="e.g. MP-04-EV-1024"
                    placeholderTextColor="#94a3b8"
                    autoCapitalize="characters"
                  />
                </View>

                {/* 2. Brand / Manufacturer Dropdown */}
                <View style={styles.inputWrap}>
                  <Text style={styles.label}>MANUFACTURER / BRAND *</Text>
                  <TouchableOpacity
                    style={styles.dropdownBtn}
                    onPress={() => {
                      setShowBrandDropdown(!showBrandDropdown);
                      setShowModelDropdown(false);
                      setShowStatusDropdown(false);
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.dropdownBtnText}>
                      {selectedManufacturer?.name || 'Select Brand'}
                    </Text>
                    <Feather
                      name={showBrandDropdown ? 'chevron-up' : 'chevron-down'}
                      size={18}
                      color="#64748b"
                    />
                  </TouchableOpacity>

                  {showBrandDropdown && (
                    <View style={styles.dropdownListCard}>
                      {manufacturers.map((mfg) => (
                        <TouchableOpacity
                          key={mfg.manufacturerId || mfg.name}
                          style={styles.dropdownItem}
                          onPress={() => handleSelectManufacturer(mfg)}
                        >
                          <Text style={styles.dropdownItemText}>{mfg.name}</Text>
                          {selectedManufacturer?.name === mfg.name && (
                            <Feather name="check" size={16} color="#4d7c0f" />
                          )}
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>

                {/* 3. Model Name Dropdown */}
                <View style={styles.inputWrap}>
                  <Text style={styles.label}>MODEL NAME *</Text>
                  <TouchableOpacity
                    style={styles.dropdownBtn}
                    onPress={() => {
                      setShowModelDropdown(!showModelDropdown);
                      setShowBrandDropdown(false);
                      setShowStatusDropdown(false);
                    }}
                    activeOpacity={0.8}
                    disabled={availableModels.length === 0}
                  >
                    <Text style={styles.dropdownBtnText}>
                      {selectedModel?.modelName || 'Select Model'}
                    </Text>
                    <Feather
                      name={showModelDropdown ? 'chevron-up' : 'chevron-down'}
                      size={18}
                      color="#64748b"
                    />
                  </TouchableOpacity>

                  {showModelDropdown && (
                    <View style={styles.dropdownListCard}>
                      {availableModels.map((mod) => (
                        <TouchableOpacity
                          key={mod.modelId || mod.modelName}
                          style={styles.dropdownItem}
                          onPress={() => handleSelectModel(mod)}
                        >
                          <Text style={styles.dropdownItemText}>{mod.modelName}</Text>
                          {selectedModel?.modelId === mod.modelId && (
                            <Feather name="check" size={16} color="#4d7c0f" />
                          )}
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>

                {/* 4. VIN / Chassis Number */}
                <View style={styles.inputWrap}>
                  <Text style={styles.label}>VIN / CHASSIS NUMBER</Text>
                  <TextInput
                    style={[styles.input, { outlineStyle: 'none' } as any]}
                    value={vin}
                    onChangeText={setVin}
                    placeholder="e.g. ATH450X2026MOCK"
                    placeholderTextColor="#94a3b8"
                    autoCapitalize="characters"
                  />
                </View>

                {/* 5. Motor Number */}
                <View style={styles.inputWrap}>
                  <Text style={styles.label}>MOTOR NUMBER</Text>
                  <TextInput
                    style={[styles.input, { outlineStyle: 'none' } as any]}
                    value={motorNo}
                    onChangeText={setMotorNo}
                    placeholder="e.g. MOT-98765432"
                    placeholderTextColor="#94a3b8"
                    autoCapitalize="characters"
                  />
                </View>

                {/* 6. Color */}
                <View style={styles.inputWrap}>
                  <Text style={styles.label}>VEHICLE COLOR</Text>
                  <TextInput
                    style={[styles.input, { outlineStyle: 'none' } as any]}
                    value={color}
                    onChangeText={setColor}
                    placeholder="e.g. Lime Green, Pearl White"
                    placeholderTextColor="#94a3b8"
                  />
                </View>

                {/* 7. Purchase Date */}
                <View style={styles.inputWrap}>
                  <Text style={styles.label}>PURCHASE DATE (YYYY-MM-DD)</Text>
                  <TextInput
                    style={[styles.input, { outlineStyle: 'none' } as any]}
                    value={purchaseDate}
                    onChangeText={setPurchaseDate}
                    placeholder="e.g. 2024-02-14"
                    placeholderTextColor="#94a3b8"
                  />
                </View>

                {/* 8. Odometer Reading (KM) */}
                <View style={styles.inputWrap}>
                  <Text style={styles.label}>ODOMETER READING (KM)</Text>
                  <TextInput
                    style={[styles.input, { outlineStyle: 'none' } as any]}
                    value={odometerKm}
                    onChangeText={setOdometerKm}
                    placeholder="e.g. 1250"
                    placeholderTextColor="#94a3b8"
                    keyboardType="numeric"
                  />
                </View>

                {/* 9. Vehicle Status Selector */}
                <View style={styles.inputWrap}>
                  <Text style={styles.label}>VEHICLE STATUS</Text>
                  <TouchableOpacity
                    style={styles.dropdownBtn}
                    onPress={() => {
                      setShowStatusDropdown(!showStatusDropdown);
                      setShowBrandDropdown(false);
                      setShowModelDropdown(false);
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.dropdownBtnText}>
                      {statusOptions.find((opt) => opt.value === status)?.label || 'Active'}
                    </Text>
                    <Feather
                      name={showStatusDropdown ? 'chevron-up' : 'chevron-down'}
                      size={18}
                      color="#64748b"
                    />
                  </TouchableOpacity>

                  {showStatusDropdown && (
                    <View style={styles.dropdownListCard}>
                      {statusOptions.map((opt) => (
                        <TouchableOpacity
                          key={opt.value}
                          style={styles.dropdownItem}
                          onPress={() => {
                            setStatus(opt.value);
                            setShowStatusDropdown(false);
                          }}
                        >
                          <Text style={styles.dropdownItemText}>{opt.label}</Text>
                          {status === opt.value && (
                            <Feather name="check" size={16} color="#4d7c0f" />
                          )}
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              </View>

              {/* Submit Action Button */}
              <TouchableOpacity
                style={styles.submitBtn}
                onPress={handleSubmit}
                disabled={submitting}
                activeOpacity={0.85}
              >
                {submitting ? (
                  <ActivityIndicator color="#1a2b0c" />
                ) : (
                  <>
                    <Text style={styles.submitBtnText}>Add Vehicle to Garage</Text>
                    <Feather name="plus-circle" size={18} color="#1a2b0c" />
                  </>
                )}
              </TouchableOpacity>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 36,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  closeBtn: {
    padding: 4,
  },
  loadingBox: {
    alignItems: 'center',
    paddingVertical: 30,
    gap: 8,
  },
  loadingText: {
    fontSize: 12,
    color: '#64748b',
    fontFamily: 'PlusJakartaSans-Regular',
  },
  formScroll: {},
  formGroup: {
    gap: 14,
    marginBottom: 24,
  },
  inputWrap: {},
  label: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: 0.5,
    marginBottom: 6,
    fontFamily: 'PlusJakartaSans-Bold',
  },
  input: {
    backgroundColor: '#f5f3f7',
    borderRadius: 16,
    height: 48,
    paddingHorizontal: 16,
    fontSize: 14,
    color: '#0f172a',
    fontFamily: 'PlusJakartaSans-Regular',
  },
  dropdownBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f5f3f7',
    borderRadius: 16,
    height: 48,
    paddingHorizontal: 16,
  },
  dropdownBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
    fontFamily: 'PlusJakartaSans-Regular',
  },
  dropdownListCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderColor: '#e2e8f0',
    borderWidth: 1,
    marginTop: 6,
    paddingVertical: 4,
    elevation: 4,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  dropdownItemText: {
    fontSize: 13,
    color: '#0f172a',
    fontFamily: 'PlusJakartaSans-Regular',
  },
  submitBtn: {
    backgroundColor: '#a2e52c',
    borderRadius: 24,
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 20,
  },
  submitBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1a2b0c',
    fontFamily: 'PlusJakartaSans-Bold',
  },
});

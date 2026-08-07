import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { fetchVehicleMetaApi } from '../api';
import { Vehicle, AddVehiclePayload, VehicleManufacturerMeta, VehicleModelMeta } from '../types';

interface AddVehicleModalProps {
  visible: boolean;
  onClose: () => void;
  onAddVehicle: (payload: AddVehiclePayload) => Promise<void>;
  initialData?: Vehicle | null;
  isUpdate?: boolean;
  onUpdateVehicle?: (vehicleId: string, payload: Partial<AddVehiclePayload>) => Promise<void>;
}

type VehicleStatusOption = 'active' | 'sold' | 'scrapped' | 'stolen';

export const AddVehicleModal: React.FC<AddVehicleModalProps> = ({
  visible,
  onClose,
  onAddVehicle,
  initialData,
  isUpdate,
  onUpdateVehicle,
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

  // Warranty Terms date fields (Matching Screenshot)
  const [warrantyStart, setWarrantyStart] = useState('');
  const [warrantyEnd, setWarrantyEnd] = useState('');
  const [batteryWarrantyEnd, setBatteryWarrantyEnd] = useState('');

  const [showBrandDropdown, setShowBrandDropdown] = useState(false);
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const statusOptions: { label: string; value: VehicleStatusOption }[] = [
    { label: 'Active', value: 'active' },
    { label: 'Sold', value: 'sold' },
    { label: 'Scrapped', value: 'scrapped' },
    { label: 'Stolen', value: 'stolen' },
  ];

  useEffect(() => {
    if (visible) {
      // Pre-fill fields if in edit/update mode
      if (initialData) {
        setRegistrationNumber(initialData.registrationNumber || (initialData as any).registrationNo || '');
        setVin(initialData.vin || '');
        setMotorNo(initialData.motorNo || '');
        setColor(initialData.color || '');
        setPurchaseDate(initialData.purchaseDate || '');
        const rawOdo = initialData.odometerKm ?? (initialData as any).odometer_km ?? (initialData as any).currentOdometer;
        setOdometerKm(rawOdo !== undefined && rawOdo !== null ? String(rawOdo) : '0');
        setStatus((initialData.status as VehicleStatusOption) || 'active');
        setWarrantyStart(initialData.warrantyStart || (initialData as any).warrantyStart || '');
        setWarrantyEnd(initialData.warrantyEnd || (initialData as any).warrantyEnd || '');
        setBatteryWarrantyEnd(initialData.batteryWarrantyEnd || (initialData as any).batteryWarrantyEnd || '');
      } else {
        setRegistrationNumber('');
        setVin('');
        setMotorNo('');
        setColor('');
        setPurchaseDate('');
        setOdometerKm('0');
        setStatus('active');
        setWarrantyStart('');
        setWarrantyEnd('');
        setBatteryWarrantyEnd('');
      }

      setLoadingMeta(true);
      fetchVehicleMetaApi()
        .then((data) => {
          setManufacturers(data);
          if (data.length > 0) {
            let matchedMfg = data[0];
            if (initialData?.brand) {
              const targetBrand = String(initialData.brand).toLowerCase();
              const found = data.find(m => m.name.toLowerCase().includes(targetBrand) || targetBrand.includes(m.name.toLowerCase()));
              if (found) matchedMfg = found;
            }
            setSelectedManufacturer(matchedMfg);

            if (matchedMfg.models && matchedMfg.models.length > 0) {
              let matchedMod = matchedMfg.models[0];
              if (initialData?.model) {
                const targetModel = String(initialData.model).toLowerCase();
                const foundMod = matchedMfg.models.find(m => m.modelName.toLowerCase().includes(targetModel) || targetModel.includes(m.modelName.toLowerCase()));
                if (foundMod) matchedMod = foundMod;
              }
              setSelectedModel(matchedMod);
            }
          }
        })
        .finally(() => setLoadingMeta(false));
    }
  }, [visible, initialData]);

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
      setFormError('Please select Brand, Model, and enter Registration Number.');
      return;
    }

    setFormError('');
    setSubmitting(true);
    try {
      const payload: AddVehiclePayload = {
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
        warrantyStart: warrantyStart.trim() || undefined,
        warrantyEnd: warrantyEnd.trim() || undefined,
        batteryWarrantyEnd: batteryWarrantyEnd.trim() || undefined,
      };

      const targetVehicleId = initialData?.id || (initialData as any)?.vehicleId || (initialData as any)?.vehicle_id;

      if ((targetVehicleId || isEditingMode) && onUpdateVehicle) {
        const vId = targetVehicleId || (initialData as any)?.id || (initialData as any)?.vehicleId || '';
        console.log(`🌐 Executing Update Vehicle API for vehicleId: ${vId}`);
        await onUpdateVehicle(vId, payload);
      } else {
        await onAddVehicle(payload);
      }

      onClose();
    } catch (err: any) {
      setFormError(err.message || 'Failed to save vehicle details.');
    } finally {
      setSubmitting(false);
    }
  };

  const availableModels = selectedManufacturer?.models || [];
  const isEditingMode = Boolean(initialData || isUpdate);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{isEditingMode ? 'Update Vehicle Details' : 'Register New Vehicle'}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Feather name="x" size={22} color="#0f172a" />
            </TouchableOpacity>
          </View>

          {loadingMeta ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color="#4d7c0f" />
              <Text style={styles.loadingText}>Fetching models catalog...</Text>
            </View>
          ) : (
            <ScrollView style={styles.formScroll} showsVerticalScrollIndicator={false}>
              {/* Form Error Banner */}
              {formError ? (
                <View style={styles.errorBox}>
                  <Feather name="alert-circle" size={16} color="#dc2626" style={{ marginRight: 6 }} />
                  <Text style={styles.errorText}>{formError}</Text>
                </View>
              ) : null}

              <View style={styles.formGroup}>
                {/* 1. Registration Number */}
                <View style={styles.inputWrap}>
                  <Text style={styles.label}>REGISTRATION NUMBER *</Text>
                  <TextInput
                    style={[styles.input, { outlineStyle: 'none' } as any]}
                    value={registrationNumber}
                    onChangeText={setRegistrationNumber}
                    placeholder="e.g. MP-04-EV-2026"
                    placeholderTextColor="#94a3b8"
                    autoCapitalize="characters"
                  />
                </View>

                {/* 2. Brand Selector */}
                <View style={styles.inputWrap}>
                  <Text style={styles.label}>VEHICLE BRAND / MANUFACTURER *</Text>
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
                      {selectedManufacturer ? selectedManufacturer.name : 'Select Manufacturer'}
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
                          key={mfg.manufacturerId}
                          style={styles.dropdownItem}
                          onPress={() => handleSelectManufacturer(mfg)}
                        >
                          <Text style={styles.dropdownItemText}>{mfg.name}</Text>
                          {selectedManufacturer?.manufacturerId === mfg.manufacturerId && (
                            <Feather name="check" size={16} color="#4d7c0f" />
                          )}
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>

                {/* 3. Model Selector */}
                <View style={styles.inputWrap}>
                  <Text style={styles.label}>VEHICLE MODEL *</Text>
                  <TouchableOpacity
                    style={styles.dropdownBtn}
                    onPress={() => {
                      setShowModelDropdown(!showModelDropdown);
                      setShowBrandDropdown(false);
                      setShowStatusDropdown(false);
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.dropdownBtnText}>
                      {selectedModel ? selectedModel.modelName : 'Select Model'}
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
                          key={mod.modelId}
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
                    placeholder="e.g. ME4ATH450X123456"
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
                    placeholder="e.g. MTR-450X-8890"
                    placeholderTextColor="#94a3b8"
                    autoCapitalize="characters"
                  />
                </View>

                {/* 6. Exterior Color */}
                <View style={styles.inputWrap}>
                  <Text style={styles.label}>EXTERIOR COLOR</Text>
                  <TextInput
                    style={[styles.input, { outlineStyle: 'none' } as any]}
                    value={color}
                    onChangeText={setColor}
                    placeholder="e.g. Cosmic Black"
                    placeholderTextColor="#94a3b8"
                  />
                </View>

                {/* 7. Purchase Date */}
                <View style={styles.inputWrap}>
                  <Text style={styles.label}>PURCHASE DATE</Text>
                  <View style={styles.dateInputWrap}>
                    <TextInput
                      style={[styles.dateInput, { outlineStyle: 'none' } as any]}
                      value={purchaseDate}
                      onChangeText={setPurchaseDate}
                      placeholder="YYYY-MM-DD"
                      placeholderTextColor="#94a3b8"
                      {...({ type: 'date' } as any)}
                    />
                    <Feather name="calendar" size={15} color="#475569" />
                  </View>
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

                {/* 10. Warranty Terms Section */}
                <View style={styles.warrantySection}>
                  <View style={styles.warrantyHeaderRow}>
                    <Text style={styles.warrantyHeaderTitle}>WARRANTY TERMS</Text>
                    <View style={styles.warrantyHeaderLine} />
                  </View>

                  <View style={styles.warrantyFieldsRow}>
                    {/* Vehicle Warranty Start */}
                    <View style={styles.warrantyCol}>
                      <Text style={styles.label}>VEHICLE WARRANTY START</Text>
                      <View style={styles.dateInputWrap}>
                        <TextInput
                          style={[styles.dateInput, { outlineStyle: 'none' } as any]}
                          value={warrantyStart}
                          onChangeText={setWarrantyStart}
                          placeholder="YYYY-MM-DD"
                          placeholderTextColor="#94a3b8"
                          {...({ type: 'date' } as any)}
                        />
                        <Feather name="calendar" size={15} color="#475569" />
                      </View>
                    </View>

                    {/* Vehicle Warranty End */}
                    <View style={styles.warrantyCol}>
                      <Text style={styles.label}>VEHICLE WARRANTY END</Text>
                      <View style={styles.dateInputWrap}>
                        <TextInput
                          style={[styles.dateInput, { outlineStyle: 'none' } as any]}
                          value={warrantyEnd}
                          onChangeText={setWarrantyEnd}
                          placeholder="YYYY-MM-DD"
                          placeholderTextColor="#94a3b8"
                          {...({ type: 'date' } as any)}
                        />
                        <Feather name="calendar" size={15} color="#475569" />
                      </View>
                    </View>
                  </View>

                  {/* Battery Warranty End */}
                  <View style={[styles.inputWrap, { marginTop: 12 }]}>
                    <Text style={styles.label}>BATTERY WARRANTY END</Text>
                    <View style={styles.dateInputWrap}>
                      <TextInput
                        style={[styles.dateInput, { outlineStyle: 'none' } as any]}
                        value={batteryWarrantyEnd}
                        onChangeText={setBatteryWarrantyEnd}
                        placeholder="YYYY-MM-DD"
                        placeholderTextColor="#94a3b8"
                        {...({ type: 'date' } as any)}
                      />
                      <Feather name="calendar" size={15} color="#475569" />
                    </View>
                  </View>
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
                    <Text style={styles.submitBtnText}>{isEditingMode ? 'Update Vehicle' : 'Add Vehicle to Garage'}</Text>
                    <Feather name={isEditingMode ? 'check-circle' : 'plus-circle'} size={18} color="#1a2b0c" />
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
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 14,
  },
  errorText: {
    fontSize: 12,
    color: '#dc2626',
    fontWeight: '600',
    fontFamily: 'PlusJakartaSans-Medium',
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
    marginTop: 6,
    padding: 8,
    borderColor: '#e2e8f0',
    borderWidth: 1,
    shadowColor: '#64748b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  dropdownItemText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0f172a',
    fontFamily: 'PlusJakartaSans-Regular',
  },
  warrantySection: {
    marginTop: 10,
    marginBottom: 6,
  },
  warrantyHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 10,
  },
  warrantyHeaderTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#334155',
    letterSpacing: 0.8,
    fontFamily: 'PlusJakartaSans-Bold',
  },
  warrantyHeaderLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#f1f5f9',
  },
  warrantyFieldsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  warrantyCol: {
    flex: 1,
  },
  dateInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    height: 44,
    paddingHorizontal: 10,
  },
  dateInput: {
    flex: 1,
    fontSize: 12,
    color: '#0f172a',
    fontFamily: 'PlusJakartaSans-Regular',
  },
  submitBtn: {
    backgroundColor: '#a2e52c',
    borderRadius: 20,
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  submitBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1a2b0c',
    fontFamily: 'PlusJakartaSans-Bold',
  },
});

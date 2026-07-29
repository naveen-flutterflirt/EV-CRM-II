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
  Modal,
  FlatList,
  SafeAreaView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useVehicleMeta, useAddCustomerVehicle } from '../hooks/useOnboarding';
import { VehicleBrandMeta, VehicleModelMeta } from '../types';

interface VehicleSetupCardProps {
  onComplete: () => void;
  onSkip: () => void;
  onBack: () => void;
}

const FALLBACK_BRANDS: VehicleBrandMeta[] = [
  {
    manufacturerId: 'man_ather',
    name: 'Ather',
    models: [
      { modelId: 'model_450x', modelName: '450X Gen 3' },
      { modelId: 'model_450plus', modelName: '450 Plus' },
      { modelId: 'model_apex', modelName: '450 Apex' },
    ],
  },
  {
    manufacturerId: 'man_ola',
    name: 'Ola',
    models: [
      { modelId: 'model_s1pro', modelName: 'S1 Pro Gen 2' },
      { modelId: 'model_s1air', modelName: 'S1 Air' },
      { modelId: 'model_s1x', modelName: 'S1 X' },
    ],
  },
  {
    manufacturerId: 'man_tvs',
    name: 'TVS',
    models: [
      { modelId: 'model_iqube', modelName: 'iQube S' },
    ],
  },
];

export const VehicleSetupCard: React.FC<VehicleSetupCardProps> = ({
  onComplete,
  onSkip,
  onBack,
}) => {
  const [selectedBrand, setSelectedBrand] = useState<VehicleBrandMeta | null>(null);
  const [selectedModel, setSelectedModel] = useState<VehicleModelMeta | null>(null);
  const [vin, setVin] = useState('');

  const [isBrandModalVisible, setIsBrandModalVisible] = useState(false);
  const [isModelModalVisible, setIsModelModalVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: vehicleMeta, isLoading: fetchingMeta } = useVehicleMeta();
  const addVehicleMutation = useAddCustomerVehicle();
  const loading = addVehicleMutation.isPending;

  const brands = vehicleMeta && vehicleMeta.length > 0 ? vehicleMeta : FALLBACK_BRANDS;

  const handleAddVehicle = async () => {
    if (!selectedModel) {
      setError('Please select a model');
      return;
    }

    setError(null);

    try {
      const res = await addVehicleMutation.mutateAsync({
        modelId: selectedModel.modelId,
        vin: vin ? vin.trim() : undefined,
      });

      if (res.success) {
        onComplete();
      } else {
        setError(res.message || 'Failed to add vehicle. Please try again.');
      }
    } catch (err: any) {
      setError(err.message || 'Error saving vehicle information.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Header Navigation */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerNavBtn} onPress={onBack} activeOpacity={0.7}>
          <Feather name="arrow-left" size={24} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Vehicle Profile</Text>
        <View style={styles.headerLogoContainer}>
          <Image
            source={require('../../../../../assets/images/logo.png')}
            style={styles.headerLogo}
            resizeMode="contain"
          />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        {/* Title Group */}
        <View style={styles.titleContainer}>
          <Text style={styles.mainTitle}>Add your electric vehicle</Text>
          <Text style={styles.subtitle}>So we can personalize service and parts for you.</Text>
        </View>

        {/* Scooter Graphic Placeholder Container */}
        <View style={styles.graphicContainer}>
          <View style={styles.graphicBox}>
            <Image
              source={require('../../../../../assets/images/ather_scooter.png')}
              style={styles.scooterGraphic}
              resizeMode="contain"
            />
            <View style={styles.batteryIconBadge}>
              <Feather name="battery" size={14} color="#a2e52c" />
            </View>
          </View>
        </View>

        {/* Form Fields */}
        <View style={styles.formContainer}>
          {error && <Text style={styles.errorText}>{error}</Text>}

          {/* Brand Selection */}
          <Text style={styles.fieldLabel}>BRAND</Text>
          <TouchableOpacity
            style={styles.selectorField}
            onPress={() => setIsBrandModalVisible(true)}
            activeOpacity={0.8}
            disabled={fetchingMeta}
          >
            <Feather name="tag" size={20} color="#7a8a6b" style={styles.fieldIcon} />
            <Text style={[styles.selectorText, !selectedBrand && styles.placeholderText]}>
              {selectedBrand ? selectedBrand.name : 'Select brand'}
            </Text>
            {fetchingMeta ? (
              <ActivityIndicator size="small" color="#95d03a" />
            ) : (
              <Feather name="chevron-down" size={20} color="#7a8a6b" />
            )}
          </TouchableOpacity>

          {/* Model Selection */}
          <Text style={styles.fieldLabel}>MODEL</Text>
          <TouchableOpacity
            style={[styles.selectorField, !selectedBrand && styles.disabledField]}
            onPress={() => {
              if (selectedBrand) {
                setIsModelModalVisible(true);
              }
            }}
            activeOpacity={0.8}
            disabled={!selectedBrand}
          >
            <Feather name="zap" size={20} color="#7a8a6b" style={styles.fieldIcon} />
            <Text style={[styles.selectorText, !selectedModel && styles.placeholderText]}>
              {selectedModel ? selectedModel.modelName : 'Select model'}
            </Text>
            <Feather name="chevron-down" size={20} color="#7a8a6b" />
          </TouchableOpacity>

          {/* VIN Number */}
          <Text style={styles.fieldLabel}>VIN NUMBER (OPTIONAL)</Text>
          <View style={styles.inputFieldContainer}>
            <Feather name="align-justify" size={20} color="#7a8a6b" style={styles.fieldIcon} />
            <TextInput
              style={styles.textInput}
              placeholder="Enter VIN"
              placeholderTextColor="#8a9a7a"
              value={vin}
              onChangeText={setVin}
              autoCapitalize="characters"
            />
          </View>

          {/* Add Vehicle Button */}
          <TouchableOpacity
            style={styles.submitBtn}
            onPress={handleAddVehicle}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#2e5b02" />
            ) : (
              <Text style={styles.submitBtnText}>Add vehicle +</Text>
            )}
          </TouchableOpacity>

          {/* Skip Onboarding Link */}
          <TouchableOpacity style={styles.skipBtn} onPress={onSkip} activeOpacity={0.7}>
            <Text style={styles.skipBtnText}>Add later</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Brand Picker Modal */}
      <Modal
        visible={isBrandModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsBrandModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Brand</Text>
              <TouchableOpacity onPress={() => setIsBrandModalVisible(false)}>
                <Feather name="x" size={24} color="#000000" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={brands}
              keyExtractor={(item) => item.manufacturerId}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.optionRow}
                  onPress={() => {
                    setSelectedBrand(item);
                    setSelectedModel(null); // Reset selected model
                    setIsBrandModalVisible(false);
                  }}
                >
                  <Text style={[styles.optionText, selectedBrand?.manufacturerId === item.manufacturerId && styles.optionTextActive]}>
                    {item.name}
                  </Text>
                  {selectedBrand?.manufacturerId === item.manufacturerId && <Feather name="check" size={18} color="#2e5b02" />}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Model Picker Modal */}
      <Modal
        visible={isModelModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsModelModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Model</Text>
              <TouchableOpacity onPress={() => setIsModelModalVisible(false)}>
                <Feather name="x" size={24} color="#000000" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={selectedBrand?.models || []}
              keyExtractor={(item) => item.modelId}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.optionRow}
                  onPress={() => {
                    setSelectedModel(item);
                    setIsModelModalVisible(false);
                  }}
                >
                  <Text style={[styles.optionText, selectedModel?.modelId === item.modelId && styles.optionTextActive]}>
                    {item.modelName}
                  </Text>
                  {selectedModel?.modelId === item.modelId && <Feather name="check" size={18} color="#2e5b02" />}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f4f4f5',
  },
  headerNavBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  headerLogoContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  headerLogo: {
    width: 24,
    height: 24,
  },
  scrollContainer: {
    flexGrow: 1,
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 24,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
    fontFamily: 'PlusJakartaSans-Bold',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#71717a',
    marginTop: 6,
    fontFamily: 'PlusJakartaSans-Regular',
    textAlign: 'center',
    paddingHorizontal: 12,
  },
  graphicContainer: {
    marginBottom: 24,
    alignItems: 'center',
  },
  graphicBox: {
    width: 220,
    height: 180,
    borderRadius: 24,
    backgroundColor: '#f5f2e8', // Soft beige box background matching mockup
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    padding: 10,
  },
  scooterGraphic: {
    width: '90%',
    height: '90%',
  },
  batteryIconBadge: {
    position: 'absolute',
    bottom: 12,
    right: 12,
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
  selectorField: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6', // Light gray input card background
    borderRadius: 16,
    height: 54,
    paddingHorizontal: 18,
    marginBottom: 18,
  },
  disabledField: {
    opacity: 0.5,
  },
  inputFieldContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 16,
    height: 54,
    paddingHorizontal: 18,
    marginBottom: 24,
  },
  fieldIcon: {
    marginRight: 12,
  },
  selectorText: {
    flex: 1,
    color: '#000000',
    fontSize: 16,
    fontFamily: 'PlusJakartaSans-Medium',
  },
  textInput: {
    flex: 1,
    color: '#000000',
    fontSize: 16,
    fontFamily: 'PlusJakartaSans-Medium',
    paddingVertical: 0,
  },
  placeholderText: {
    color: '#9ca3af',
  },
  submitBtn: {
    backgroundColor: '#a2e52c', // Brand lime-green button
    borderRadius: 25,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    shadowColor: '#a2e52c',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 3,
  },
  submitBtnText: {
    color: '#2e5b02', // Dark forest/olive text
    fontSize: 17,
    fontWeight: '700',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  skipBtn: {
    marginTop: 20,
    alignItems: 'center',
    paddingVertical: 10,
  },
  skipBtnText: {
    color: '#9ca3af',
    fontSize: 15,
    fontFamily: 'PlusJakartaSans-Medium',
    textDecorationLine: 'underline',
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
  // Modal layout styles
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
    maxHeight: '50%',
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
    color: '#000000',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f4f4f5',
  },
  optionText: {
    fontSize: 16,
    color: '#4b5563',
    fontFamily: 'PlusJakartaSans-Regular',
  },
  optionTextActive: {
    color: '#2e5b02',
    fontWeight: '700',
    fontFamily: 'PlusJakartaSans-Bold',
  },
});

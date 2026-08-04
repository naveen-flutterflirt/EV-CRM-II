import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Image,
  Dimensions,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Vehicle, AddVehiclePayload } from '../types';
import { AddVehicleModal } from './AddVehicleModal';

const { width } = Dimensions.get('window');

interface VehicleDetailsScreenProps {
  vehicle?: Vehicle | null;
  onBack: () => void;
  onAddVehicle: (payload: AddVehiclePayload) => Promise<void>;
}

export const VehicleDetailsScreen: React.FC<VehicleDetailsScreenProps> = ({
  vehicle,
  onBack,
  onAddVehicle,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);

  const brand = vehicle?.brand || 'N/A';
  const model = vehicle?.model || '';
  const regNo = vehicle?.registrationNumber || 'Not Registered';
  const vin = vehicle?.vin || 'N/A';
  const batteryPct = vehicle?.batteryHealthPct || 0;
  const rangeKm = vehicle?.currentRangeKm || 0;
  const warranty = vehicle?.warrantyStatus || 'N/A';
  const motorPower = vehicle?.motorPower || 'N/A';
  const purchaseDate = vehicle?.purchaseDate || 'N/A';
  const lastService = vehicle?.lastServicedDate || 'N/A';

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header Bar */}
      <View style={styles.headerBar}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.7}>
            <Feather name="arrow-left" size={22} color="#0f172a" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Vehicle Details</Text>
        </View>

        {/* Top Right + Add New Vehicle Action Button */}
        <TouchableOpacity
          style={styles.topAddBtn}
          onPress={() => setShowAddModal(true)}
          activeOpacity={0.8}
        >
          <Feather name="plus" size={16} color="#ffffff" />
          <Text style={styles.topAddBtnText}>Add Vehicle</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Vehicle Summary Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <View style={styles.brandTitleBox}>
              <Text style={styles.brandSub}>ELECTRIC SCOOTER</Text>
              <Text style={styles.brandTitle}>{brand} {model}</Text>
            </View>
            <View style={styles.primaryBadge}>
              <Feather name="star" size={12} color="#ffffff" style={{ marginRight: 4 }} />
              <Text style={styles.badgeText}>PRIMARY</Text>
            </View>
          </View>

          {/* Scooter Shot */}
          <View style={styles.imageContainer}>
            <Image
              source={require('../../../../../assets/images/ather_scooter.png')}
              style={styles.scooterImage}
              resizeMode="contain"
            />
          </View>
        </View>

        {/* Battery & Range Quick Metrics */}
        <View style={styles.metricsRow}>
          <View style={styles.metricCard}>
            <View style={styles.metricIconCircle}>
              <Feather name="battery-charging" size={20} color="#4d7c0f" />
            </View>
            <Text style={styles.metricLabel}>BATTERY HEALTH</Text>
            <Text style={styles.metricVal}>{batteryPct}%</Text>
          </View>

          <View style={styles.metricCard}>
            <View style={styles.metricIconCircle}>
              <Feather name="navigation" size={20} color="#4d7c0f" />
            </View>
            <Text style={styles.metricLabel}>ESTIMATED RANGE</Text>
            <Text style={styles.metricVal}>{rangeKm} <Text style={styles.unitText}>km</Text></Text>
          </View>
        </View>

        {/* Full Specifications Grid */}
        <View style={styles.specsSection}>
          <Text style={styles.specsSectionHeading}>SPECIFICATIONS & IDENTIFICATION</Text>

          <View style={styles.specsCard}>
            {/* Registration Number */}
            <View style={styles.specRow}>
              <Feather name="shield" size={18} color="#64748b" style={styles.specIcon} />
              <View style={styles.specMeta}>
                <Text style={styles.specLabel}>REGISTRATION NUMBER</Text>
                <Text style={styles.specValue}>{regNo}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            {/* VIN / Chassis Number */}
            <View style={styles.specRow}>
              <Feather name="hash" size={18} color="#64748b" style={styles.specIcon} />
              <View style={styles.specMeta}>
                <Text style={styles.specLabel}>VIN / CHASSIS NUMBER</Text>
                <Text style={styles.specValue}>{vin}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            {/* Warranty Status */}
            <View style={styles.specRow}>
              <Feather name="award" size={18} color="#64748b" style={styles.specIcon} />
              <View style={styles.specMeta}>
                <Text style={styles.specLabel}>WARRANTY STATUS</Text>
                <Text style={styles.specValueGreen}>{warranty}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            {/* Motor Power */}
            <View style={styles.specRow}>
              <Feather name="zap" size={18} color="#64748b" style={styles.specIcon} />
              <View style={styles.specMeta}>
                <Text style={styles.specLabel}>MOTOR PEAK POWER</Text>
                <Text style={styles.specValue}>{motorPower}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            {/* Purchase Date */}
            <View style={styles.specRow}>
              <Feather name="calendar" size={18} color="#64748b" style={styles.specIcon} />
              <View style={styles.specMeta}>
                <Text style={styles.specLabel}>PURCHASE DATE</Text>
                <Text style={styles.specValue}>{purchaseDate}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Action Button: + Add New Vehicle */}
        <TouchableOpacity
          style={styles.addVehicleMainBtn}
          onPress={() => setShowAddModal(true)}
          activeOpacity={0.85}
        >
          <Feather name="plus-circle" size={20} color="#1a2b0c" />
          <Text style={styles.addVehicleMainText}>+ Add New Vehicle to Garage</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Add Vehicle Modal */}
      <AddVehicleModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAddVehicle={onAddVehicle}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#faf8fc',
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
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
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  topAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4d7c0f',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    gap: 4,
  },
  topAddBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#ffffff',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  heroCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderColor: '#f1f0f7',
    borderWidth: 1,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  brandTitleBox: {},
  brandSub: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94a3b8',
    letterSpacing: 0.5,
    marginBottom: 2,
    fontFamily: 'PlusJakartaSans-Bold',
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0f172a',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  primaryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4d7c0f',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#ffffff',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  imageContainer: {
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  scooterImage: {
    width: width * 0.65,
    height: '100%',
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    borderColor: '#f1f0f7',
    borderWidth: 1,
  },
  metricIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#edf6d6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: 0.5,
    marginBottom: 4,
    fontFamily: 'PlusJakartaSans-Bold',
  },
  metricVal: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  unitText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: 'normal',
  },
  specsSection: {
    marginBottom: 24,
  },
  specsSectionHeading: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: 1,
    marginBottom: 10,
    fontFamily: 'PlusJakartaSans-Bold',
  },
  specsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 6,
    borderColor: '#f1f0f7',
    borderWidth: 1,
  },
  specRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  specIcon: {
    marginRight: 14,
  },
  specMeta: {
    flex: 1,
  },
  specLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94a3b8',
    letterSpacing: 0.5,
    marginBottom: 2,
    fontFamily: 'PlusJakartaSans-Bold',
  },
  specValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  specValueGreen: {
    fontSize: 14,
    fontWeight: '800',
    color: '#4d7c0f',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
  },
  addVehicleMainBtn: {
    backgroundColor: '#a2e52c',
    borderRadius: 24,
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 40,
  },
  addVehicleMainText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1a2b0c',
    fontFamily: 'PlusJakartaSans-Bold',
  },
});

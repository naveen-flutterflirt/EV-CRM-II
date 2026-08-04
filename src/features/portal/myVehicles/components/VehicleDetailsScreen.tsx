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
  onAddVehicle?: (payload: AddVehiclePayload) => Promise<void>;
  onRemoveVehicle?: () => void;
}

export const VehicleDetailsScreen: React.FC<VehicleDetailsScreenProps> = ({
  vehicle,
  onBack,
  onAddVehicle,
  onRemoveVehicle,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);

  // Dynamic values extracted directly from vehicle prop without hardcoded fallbacks
  const brand = vehicle?.brand || '';
  const modelName = vehicle?.modelName || (typeof vehicle?.model === 'string' ? vehicle.model : (vehicle?.model as any)?.modelName) || '';
  const variant = (vehicle as any)?.variant || '';
  const regNo = vehicle?.registrationNumber || vehicle?.registrationNo || '';
  const vin = vehicle?.vin || '';
  const motorNo = vehicle?.motorNo || '';
  const color = vehicle?.color || '';
  const purchaseDate = vehicle?.purchaseDate || '';
  const odometerKm = vehicle?.odometerKm !== undefined && vehicle?.odometerKm !== null ? `${vehicle.odometerKm} km` : '';
  const warrantyStart = vehicle?.warrantyStart || (vehicle as any)?.warrantyStart || '';
  const warrantyEnd = vehicle?.warrantyEnd || (vehicle as any)?.warrantyEnd || '';
  const batteryWarrantyEnd = vehicle?.batteryWarrantyEnd || (vehicle as any)?.batteryWarrantyEnd || '';
  const status = vehicle?.status || '';
  const isBatterySwappable = vehicle?.isBatterySwappable !== undefined
    ? (vehicle.isBatterySwappable ? 'Yes' : 'No')
    : (vehicle as any)?.isBatterySwappable !== undefined
      ? ((vehicle as any)?.isBatterySwappable ? 'Yes' : 'No')
      : '';

  const batteryPct = vehicle?.batteryHealthPct !== undefined && vehicle?.batteryHealthPct !== null ? `${vehicle.batteryHealthPct}%` : '';
  const rangeKm = vehicle?.currentRangeKm !== undefined && vehicle?.currentRangeKm !== null ? `${vehicle.currentRangeKm} km` : '';

interface CategoryRow {
  label: string;
  value: string;
  isStatus?: boolean;
}

interface CategoryGroup {
  title: string;
  icon: string;
  rows: CategoryRow[];
}

  // Categorized Specification Tables
  const categories: CategoryGroup[] = [
    {
      title: 'IDENTIFICATION & REGISTRATION',
      icon: 'shield',
      rows: [
        { label: 'Registration Number', value: regNo || 'N/A' },
        { label: 'VIN / Chassis Number', value: vin || 'N/A' },
        { label: 'Vehicle Status', value: status ? status.toUpperCase() : 'N/A', isStatus: true },
      ],
    },
    {
      title: 'MODEL & SPECIFICATIONS',
      icon: 'info',
      rows: [
        { label: 'Brand', value: brand || 'N/A' },
        { label: 'Model Name', value: modelName || 'N/A' },
        { label: 'Variant', value: variant || 'N/A' },
        { label: 'Motor Number', value: motorNo || 'N/A' },
        { label: 'Exterior Color', value: color || 'N/A' },
        { label: 'Swappable Battery', value: isBatterySwappable || 'N/A' },
      ],
    },
    {
      title: 'USAGE & PERFORMANCE',
      icon: 'activity',
      rows: [
        { label: 'Odometer Reading', value: odometerKm || 'N/A' },
        { label: 'Battery Health', value: batteryPct || 'N/A' },
        { label: 'Estimated Range', value: rangeKm || 'N/A' },
      ],
    },
    {
      title: 'PURCHASE & WARRANTY',
      icon: 'award',
      rows: [
        { label: 'Purchase Date', value: purchaseDate || 'N/A' },
        {
          label: 'Warranty Period',
          value: (warrantyStart || warrantyEnd) ? `${warrantyStart || 'N/A'} to ${warrantyEnd || 'N/A'}` : 'N/A',
        },
        { label: 'Battery Warranty End', value: batteryWarrantyEnd || 'N/A' },
      ],
    },
  ];

  const displayName = [brand, modelName].filter(Boolean).join(' ') || 'Vehicle Details';

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
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Vehicle Summary Hero Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <View style={styles.brandTitleBox}>
              <Text style={styles.brandSub}>ELECTRIC VEHICLE</Text>
              <Text style={styles.brandTitle}>{displayName}</Text>
            </View>
            <View style={styles.primaryBadge}>
              <Feather name="star" size={12} color="#ffffff" style={{ marginRight: 4 }} />
              <Text style={styles.badgeText}>PRIMARY</Text>
            </View>
          </View>

          {/* Vehicle Product Image */}
          <View style={styles.imageContainer}>
            <Image
              source={require('../../../../../assets/images/ather_scooter.png')}
              style={styles.scooterImage}
              resizeMode="contain"
            />
          </View>
        </View>

        {/* Categorized Specification Tables */}
        {categories.map((cat, catIdx) => (
          <View key={`cat_${catIdx}`} style={styles.categorySection}>
            <View style={styles.categoryHeaderRow}>
              <Feather name={cat.icon as any} size={16} color="#557924" style={styles.categoryIcon} />
              <Text style={styles.categoryTitle}>{cat.title}</Text>
            </View>

            <View style={styles.tableCard}>
              {cat.rows.map((row, rowIdx) => (
                <React.Fragment key={`row_${catIdx}_${rowIdx}`}>
                  <View style={styles.tableRow}>
                    <Text style={styles.tableLabel}>{row.label}</Text>
                    <Text style={[styles.tableValue, row.isStatus && styles.statusValue]}>
                      {row.value}
                    </Text>
                  </View>
                  {rowIdx < cat.rows.length - 1 && <View style={styles.tableDivider} />}
                </React.Fragment>
              ))}
            </View>
          </View>
        ))}

        {/* Action Buttons Row: Remove Vehicle & Add Vehicle */}
        <View style={styles.actionButtonsRow}>
          <TouchableOpacity
            style={styles.removeVehicleBtn}
            onPress={onRemoveVehicle}
            activeOpacity={0.85}
          >
            <Feather name="trash-2" size={18} color="#dc2626" />
            <Text style={styles.removeVehicleText}>Remove Vehicle</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.addVehicleBtn}
            onPress={() => setShowAddModal(true)}
            activeOpacity={0.85}
          >
            <Feather name="plus-circle" size={18} color="#2e5b02" />
            <Text style={styles.addVehicleText}>Add Vehicle</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Add Vehicle Modal */}
      {onAddVehicle && (
        <AddVehicleModal
          visible={showAddModal}
          onClose={() => setShowAddModal(false)}
          onAddVehicle={onAddVehicle}
        />
      )}
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
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  heroCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    borderColor: '#f1f0f7',
    borderWidth: 1,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    width: '100%',
  },
  brandTitleBox: {
    flex: 1,
    paddingRight: 8,
  },
  brandSub: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94a3b8',
    letterSpacing: 0.5,
    marginBottom: 2,
    fontFamily: 'PlusJakartaSans-Bold',
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
    lineHeight: 26,
    fontFamily: 'PlusJakartaSans-Bold',
  },
  primaryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4d7c0f',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    flexShrink: 0,
    alignSelf: 'flex-start',
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
  categorySection: {
    marginBottom: 20,
  },
  categoryHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  categoryIcon: {
    marginRight: 8,
  },
  categoryTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#557924',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  tableCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    paddingHorizontal: 18,
    borderColor: '#f1f0f7',
    borderWidth: 1,
    shadowColor: '#64748b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
  tableLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748b',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  tableValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
    textAlign: 'right',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  statusValue: {
    color: '#4d7c0f',
  },
  tableDivider: {
    height: 1,
    backgroundColor: '#f1f5f9',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
    marginBottom: 40,
  },
  removeVehicleBtn: {
    flex: 1,
    backgroundColor: '#fef2f2',
    borderColor: '#fca5a5',
    borderWidth: 1,
    borderRadius: 20,
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  removeVehicleText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#dc2626',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  addVehicleBtn: {
    flex: 1,
    backgroundColor: '#a2e52c',
    borderRadius: 20,
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#a2e52c',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  addVehicleText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#2e5b02',
    fontFamily: 'PlusJakartaSans-Bold',
  },
});

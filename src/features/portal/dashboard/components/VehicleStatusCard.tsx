import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '../../../../common/components/Card';
import { Badge } from '../../../../common/components/Badge';
import { Button } from '../../../../common/components/Button';
import { CustomerVehicleStatus } from '../types';

interface VehicleStatusCardProps {
  vehicle?: CustomerVehicleStatus;
  onBookService?: () => void;
}

export const VehicleStatusCard: React.FC<VehicleStatusCardProps> = ({
  vehicle,
  onBookService = () => {},
}) => {
  const brandModel = vehicle ? `${vehicle.brand} ${vehicle.model}` : "Ather 450X";
  const warranty = vehicle?.warrantyStatus || "WARRANTY ACTIVE";
  const extraVehiclesCount = (vehicle?.totalVehiclesCount || 1) - 1;

  return (
    <Card style={styles.cardContainer}>
      {/* Upper Row: Scooter Icon (with +count badge if multiple) + Vehicle Details & Status Badge */}
      <View style={styles.topRow}>
        <View style={styles.iconBoxContainer}>
          <View style={styles.iconBox}>
            <Text style={styles.scooterIcon}>🛵</Text>
          </View>
          {extraVehiclesCount > 0 && (
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>+{extraVehiclesCount}</Text>
            </View>
          )}
        </View>
        <View style={styles.infoContainer}>
          <Text style={styles.vehicleTitle}>{brandModel}</Text>
          <Badge
            label={warranty}
            variant="success"
            style={styles.badgeStyle}
            textStyle={styles.badgeTextStyle}
          />
        </View>
      </View>

      {/* Main Call To Action Button: Book service -> using Common Button component */}
      <Button
        title="Book service →"
        variant="primary"
        size="md"
        onPress={onBookService}
      />
    </Card>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    padding: 16,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    borderColor: '#e4e4e7',
    borderWidth: 1,
    marginBottom: 16,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 14,
  },
  iconBoxContainer: {
    position: 'relative',
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#f4f4f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  countBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#3f6212',
    borderRadius: 10,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderWidth: 1.5,
    borderColor: '#ffffff',
  },
  countBadgeText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '800',
  },
  scooterIcon: {
    fontSize: 22,
  },
  infoContainer: {
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  vehicleTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#18181b',
    marginBottom: 4,
  },
  badgeStyle: {
    backgroundColor: '#ecfccb',
    borderColor: '#bef264',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeTextStyle: {
    color: '#3f6212',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  bookButton: {
    backgroundColor: '#99e328',
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookButtonText: {
    color: '#27272a',
    fontSize: 14,
    fontWeight: '700',
  },
});

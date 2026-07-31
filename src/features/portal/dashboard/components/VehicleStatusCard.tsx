import React from 'react';
import { View, Text, StyleSheet, Image, Dimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { CustomerVehicleStatus } from '../types';

const { width } = Dimensions.get('window');

interface VehicleStatusCardProps {
  vehicle?: CustomerVehicleStatus;
}

export const VehicleStatusCard: React.FC<VehicleStatusCardProps> = ({
  vehicle,
}) => {
  const rawBrand = vehicle?.brand;
  const brand = typeof rawBrand === 'string' ? rawBrand : (rawBrand?.manufacturerName || 'Ather');

  const rawModel = vehicle?.model;
  const model = typeof rawModel === 'string' ? rawModel : (rawModel?.modelName || '450X Gen 3');

  return (
    <View style={styles.cardContainer}>
      {/* Upper Row: Title and Primary Badge */}
      <View style={styles.topRow}>
        <View style={styles.titleContainer}>
          <Text style={styles.label}>VEHICLE</Text>
          <Text style={styles.vehicleTitle}>{brand} {model}</Text>
        </View>
        <View style={styles.primaryBadge}>
          <Feather name="star" size={12} color="#ffffff" style={styles.starIcon} />
          <Text style={styles.primaryBadgeText}>PRIMARY</Text>
        </View>
      </View>

      {/* Center Image: Ather Scooter Product Shot */}
      <View style={styles.imageContainer}>
        <Image
          source={require('../../../../../assets/images/ather_scooter.png')}
          style={styles.scooterImage}
          resizeMode="contain"
        />
      </View>

      {/* Carousel Dots */}
      <View style={styles.carouselContainer}>
        <View style={[styles.dot, styles.activeDot]} />
        <View style={styles.dot} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 12,
    elevation: 2,
    width: '100%',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    width: '100%',
  },
  titleContainer: {
    flex: 1,
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    color: '#9ca3af',
    letterSpacing: 0.5,
    fontFamily: 'PlusJakartaSans-Bold',
    marginBottom: 4,
  },
  vehicleTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1a2b0c',
    lineHeight: 28,
    fontFamily: 'PlusJakartaSans-Bold',
  },
  primaryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#95d03a', // Brand green matching mockup
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  starIcon: {
    marginRight: 4,
  },
  primaryBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '800',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  imageContainer: {
    height: 160,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 12,
  },
  scooterImage: {
    width: width * 0.65,
    height: '100%',
  },
  carouselContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#d1d5db',
  },
  activeDot: {
    backgroundColor: '#95d03a',
  },
});

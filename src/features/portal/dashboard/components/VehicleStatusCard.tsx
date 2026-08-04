import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 40; // Full width inside 20px padding container

export interface VehicleCardItemData {
  id?: string;
  brand?: string;
  model?: string;
  isPrimary?: boolean;
}

interface VehicleStatusCardProps {
  vehicle?: VehicleCardItemData;
  vehicles?: VehicleCardItemData[];
}

export const VehicleStatusCard: React.FC<VehicleStatusCardProps> = ({
  vehicle,
  vehicles,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);

  // If a list of vehicles is passed, use it; otherwise fallback to single vehicle
  const vehicleList: VehicleCardItemData[] = vehicles && vehicles.length > 0
    ? vehicles
    : (vehicle && (vehicle.brand || vehicle.model)
      ? [vehicle]
      : []);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollX = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollX / CARD_WIDTH);
    if (index !== activeIndex && index >= 0 && index < vehicleList.length) {
      setActiveIndex(index);
    }
  };

  if (vehicleList.length === 0) {
    return (
      <View style={[styles.cardContainer, { width: '100%' }]}>
        <View style={styles.topRow}>
          <View style={styles.titleContainer}>
            <Text style={styles.label}>VEHICLE</Text>
            <Text style={styles.vehicleTitle}>No Registered Vehicle</Text>
          </View>
        </View>
        <View style={styles.imageContainer}>
          <Image
            source={require('../../../../../assets/images/ather_scooter.png')}
            style={styles.scooterImage}
            resizeMode="contain"
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.outerContainer}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        decelerationRate="fast"
      >
        {vehicleList.map((item, idx) => {
          const displayTitle = `${item.brand} ${item.model}`.replace(/FlutterFlirt Motors EV/gi, '').trim();

          return (
            <View key={item.id || `v_${idx}`} style={[styles.cardContainer, { width: CARD_WIDTH }]}>
              {/* Upper Row: Title and Primary Badge */}
              <View style={styles.topRow}>
                <View style={styles.titleContainer}>
                  <Text style={styles.label}>VEHICLE</Text>
                  <Text style={styles.vehicleTitle} numberOfLines={2}>
                    {displayTitle || 'VoltX Prime'}
                  </Text>
                </View>
                {item.isPrimary || idx === 0 ? (
                  <View style={styles.primaryBadge}>
                    <Feather name="star" size={12} color="#ffffff" style={styles.starIcon} />
                    <Text style={styles.primaryBadgeText}>PRIMARY</Text>
                  </View>
                ) : null}
              </View>

              {/* Center Image: Ather Scooter Product Shot */}
              <View style={styles.imageContainer}>
                <Image
                  source={require('../../../../../assets/images/ather_scooter.png')}
                  style={styles.scooterImage}
                  resizeMode="contain"
                />
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Pagination Carousel Dots */}
      {vehicleList.length > 1 && (
        <View style={styles.carouselContainer}>
          {vehicleList.map((_, idx) => (
            <View
              key={`dot_${idx}`}
              style={[
                styles.dot,
                idx === activeIndex ? styles.activeDot : styles.inactiveDot,
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    width: '100%',
    marginBottom: 16,
  },
  cardContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderColor: '#f1f0f7',
    borderWidth: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 12,
    elevation: 2,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    width: '100%',
  },
  titleContainer: {
    flex: 1,
    paddingRight: 10,
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
    fontWeight: '800',
    color: '#1a2b0c',
    lineHeight: 28,
    fontFamily: 'PlusJakartaSans-Bold',
  },
  primaryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#95d03a',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    flexShrink: 0,
    alignSelf: 'flex-start',
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
    width: CARD_WIDTH * 0.65,
    height: '100%',
  },
  carouselContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  activeDot: {
    width: 16,
    backgroundColor: '#95d03a',
  },
  inactiveDot: {
    width: 6,
    backgroundColor: '#cbd5e1',
  },
});

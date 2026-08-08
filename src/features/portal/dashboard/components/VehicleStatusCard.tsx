import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Animated,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 40;

export interface VehicleCardItemData {
  id?: string;
  brand?: string;
  model?: string | {
    manufacturer?: {
      name?: string;
    };
    modelName?: string;
  };
  modelName?: string;
  isPrimary?: boolean;
}

interface VehicleStatusCardProps {
  vehicle?: VehicleCardItemData;
  vehicles?: VehicleCardItemData[];
  onAddVehiclePress?: () => void;
  onSelectVehicle?: (vehicle: VehicleCardItemData) => void;
  onActiveIndexChange?: (index: number) => void;
}

export const VehicleStatusCard: React.FC<VehicleStatusCardProps> = ({
  vehicle,
  vehicles,
  onAddVehiclePress,
  onSelectVehicle,
  onActiveIndexChange,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);

  // Animated continuous shining sheen
  const shimmerAnim = useRef(new Animated.Value(-50)).current;

  useEffect(() => {
    const loopAnim = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 180,
          duration: 2200,
          useNativeDriver: false,
        }),
        Animated.timing(shimmerAnim, {
          toValue: -50,
          duration: 0,
          useNativeDriver: false,
        }),
      ])
    );
    loopAnim.start();
    return () => loopAnim.stop();
  }, [shimmerAnim]);

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
      if (onActiveIndexChange) onActiveIndexChange(index);
    }
  };

  const renderAddVehicleBtn = () => (
    <TouchableOpacity
      style={styles.addVehicleBtn}
      onPress={onAddVehiclePress}
      activeOpacity={0.85}
    >
      <Animated.View
        style={[
          styles.shimmerSheen,
          {
            transform: [{ translateX: shimmerAnim }, { rotate: '25deg' }],
          },
        ]}
      />
      <Feather name="plus" size={13} color="#2e5b02" />
      <Text style={styles.addVehicleBtnText}>Add Vehicle</Text>
    </TouchableOpacity>
  );

  if (vehicleList.length === 0) {
    return (
      <View style={[styles.cardContainer, { width: '100%', marginBottom: 28 }]}>
        <View style={styles.topRow}>
          <View style={styles.titleContainer}>
            <Text style={styles.label}>VEHICLE</Text>
            <Text style={styles.vehicleTitle}>No Registered Vehicle</Text>
          </View>
          {onAddVehiclePress && renderAddVehicleBtn()}
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
          const brand = (typeof item.model === 'object' && item.model)
            ? (item.model.manufacturer?.name || item.brand || '')
            : (item.brand || '');
          const model = (typeof item.model === 'object' && item.model)
            ? (item.model.modelName || item.modelName || '') 
            : (item.model || item.modelName || '');
          const displayTitle = brand || model 
            ? `${brand} ${model}`.replace(/FlutterFlirt Motors EV/gi, '').trim()
            : '';

          return (
            <TouchableOpacity
              key={item.id || `v_${idx}`}
              style={[styles.cardContainer, { width: CARD_WIDTH }]}
              onPress={() => onSelectVehicle && onSelectVehicle(item)}
              activeOpacity={0.9}
            >
              {/* Upper Row: Title, Primary Badge & Add Vehicle Button */}
              <View style={styles.topRow}>
                <View style={styles.titleContainer}>
                  <Text style={styles.label}>VEHICLE</Text>
                  <Text style={styles.vehicleTitle} numberOfLines={2}>
                    {displayTitle}
                  </Text>
                </View>

                <View style={styles.topRightActions}>
                  {onAddVehiclePress && renderAddVehicleBtn()}
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
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Pagination Indicator Dots */}
      {vehicleList.length > 1 && (
        <View style={styles.paginationContainer}>
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
    marginBottom: 28, // Generous spacing gap between Vehicle Card & Book Service / Job Card
  },
  cardContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 20,
    borderColor: '#e2e8f0',
    borderWidth: 1,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.07,
    shadowRadius: 18,
    elevation: 3,
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
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: 0.6,
    fontFamily: 'PlusJakartaSans-Bold',
    marginBottom: 4,
  },
  vehicleTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0f172a',
    lineHeight: 28,
    fontFamily: 'PlusJakartaSans-Bold',
  },
  topRightActions: {
    alignItems: 'flex-end',
    gap: 8,
  },
  primaryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4d7c0f',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    flexShrink: 0,
    alignSelf: 'flex-end',
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
  addVehicleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#a2e52c',
    borderColor: '#84cc16',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 4,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#a2e52c',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  shimmerSheen: {
    position: 'absolute',
    top: -15,
    left: -20,
    width: 25,
    height: 70,
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
  },
  addVehicleBtnText: {
    color: '#1a2b0c',
    fontSize: 11,
    fontWeight: '800',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  imageContainer: {
    height: 160,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    backgroundColor: 'transparent',
  },
  scooterImage: {
    width: '80%',
    height: '100%',
    backgroundColor: 'transparent',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    gap: 6,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  activeDot: {
    width: 20,
    backgroundColor: '#4d7c0f',
  },
  inactiveDot: {
    width: 6,
    backgroundColor: '#cbd5e1',
  },
});

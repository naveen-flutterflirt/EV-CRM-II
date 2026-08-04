import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';

interface ServiceCenter {
  id: string;
  name: string;
  distance: string;
  hours: string;
}

interface ServiceCenterScreenProps {
  onBack: () => void;
  onContinue: (center: ServiceCenter) => void;
  centers: ServiceCenter[];
  isLoading?: boolean;
  initialCenterId?: string;
}

export const ServiceCenterScreen: React.FC<ServiceCenterScreenProps> = ({
  onBack,
  onContinue,
  centers,
  isLoading = false,
  initialCenterId,
}) => {
  const defaultCenterId = initialCenterId || (centers && centers.length > 0 ? centers[0].id : '');
  const [selectedCenterId, setSelectedCenterId] = useState(defaultCenterId);

  // Sync selected center if initialCenterId changes or on load
  React.useEffect(() => {
    if (initialCenterId) {
      setSelectedCenterId(initialCenterId);
    } else if (centers && centers.length > 0 && !selectedCenterId) {
      setSelectedCenterId(centers[0].id);
    }
  }, [initialCenterId, centers]);

  const selectedCenter = centers.find(c => c.id === selectedCenterId) || centers[0];

  const handleContinue = () => {
    onContinue(selectedCenter);
  };

  return (
    <View style={styles.container}>
      {/* Header Row */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack} activeOpacity={0.7}>
          <Feather name="arrow-left" size={24} color="#1c1c1e" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Vehicle Profile</Text>
      </View>

      <Text style={styles.sectionTitle}>Choose a service center</Text>

      {/* Mock Map View */}
      <View style={styles.mapContainer}>
        {/* Water background */}
        <View style={styles.waterBg} />
        
        {/* Land grid shapes */}
        <View style={[styles.landShape, { top: 0, left: 0, width: '45%', height: '50%' }]} />
        <View style={[styles.landShape, { top: 0, right: 0, width: '50%', height: '60%' }]} />
        <View style={[styles.landShape, { bottom: 0, left: 0, width: '40%', height: '40%' }]} />
        <View style={[styles.landShape, { bottom: 0, right: 0, width: '55%', height: '35%' }]} />

        {/* Parks */}
        <View style={styles.parkShape1} />
        <View style={styles.parkShape2} />

        {/* Roads grid overlay */}
        <View style={[styles.roadHorizontal, { top: '30%' }]} />
        <View style={[styles.roadHorizontal, { top: '65%' }]} />
        <View style={[styles.roadVertical, { left: '30%' }]} />
        <View style={[styles.roadVertical, { left: '70%' }]} />
        
        {/* Map landmarks text */}
        <Text style={[styles.landmarkText, { top: '10%', left: '10%' }]}>Dodger Stadium</Text>
        <Text style={[styles.landmarkText, { top: '15%', right: '12%' }]}>Costco Wholesale</Text>
        <Text style={[styles.landmarkText, { bottom: '15%', left: '8%' }]}>Natural History Museum</Text>
        <Text style={[styles.landmarkText, { bottom: '20%', right: '10%' }]}>East Los Angeles</Text>

        {/* Primary location pin */}
        <View style={styles.pinContainer}>
          <View style={styles.pinWrapper}>
            <Feather name="map-pin" size={42} color="#95d03a" />
            <View style={styles.pinShadow} />
          </View>
          <Text style={styles.pinLabel}>Los Angeles</Text>
        </View>
      </View>

      {/* Service Centers Scroll Area */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#95d03a" />
          <Text style={styles.loadingText}>Loading service centers...</Text>
        </View>
      ) : (
        <ScrollView style={styles.centerList} showsVerticalScrollIndicator={false}>
          {centers && centers.length > 0 ? (
            centers.map((center) => {
              const isSelected = selectedCenterId === center.id;
              return (
                <TouchableOpacity
                  key={center.id}
                  style={[
                    styles.centerCard,
                    isSelected ? styles.selectedCard : styles.unselectedCard,
                  ]}
                  onPress={() => setSelectedCenterId(center.id)}
                  activeOpacity={0.9}
                >
                  <View style={styles.cardLeftContent}>
                    <Feather
                      name="map-pin"
                      size={20}
                      color={isSelected ? '#95d03a' : '#71717a'}
                      style={styles.cardPinIcon}
                    />
                    <View style={styles.cardDetails}>
                      <Text style={styles.cardTitle}>{center.name}</Text>
                      <Text style={styles.cardSubtitle}>{center.distance}</Text>
                      <Text style={styles.cardSubtitle}>{center.hours}</Text>
                    </View>
                  </View>

                  {/* Radio Indicator */}
                  {isSelected ? (
                    <View style={styles.radioSelectedOuter}>
                      <View style={styles.radioSelectedInner} />
                    </View>
                  ) : (
                    <View style={styles.radioUnselected} />
                  )}
                </TouchableOpacity>
              );
            })
          ) : (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>No service centers found</Text>
            </View>
          )}
        </ScrollView>
      )}

      {/* Continue Button */}
      <TouchableOpacity
        style={styles.continueButton}
        onPress={handleContinue}
        activeOpacity={0.8}
      >
        <Text style={styles.continueText}>Continue</Text>
        <Feather name="arrow-right" size={20} color="#1a2b0c" />
      </TouchableOpacity>

      <Text style={styles.disclaimerText}>
        You can change your location at any point before confirmation.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#faf8f3',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1c1c1e',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1c1c1e',
    fontFamily: 'PlusJakartaSans-SemiBold',
    marginBottom: 14,
  },
  mapContainer: {
    height: 180,
    width: '100%',
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#cbdcf0', // Water color fallback
    borderWidth: 1,
    borderColor: '#e4e4e7',
    marginBottom: 16,
  },
  waterBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#cbdcf0', // soft blue
  },
  landShape: {
    position: 'absolute',
    backgroundColor: '#eaf1fa', // light sandy land
    borderRadius: 16,
  },
  parkShape1: {
    position: 'absolute',
    top: '15%',
    left: '25%',
    width: 60,
    height: 40,
    backgroundColor: '#d8f0d8', // green grass park
    borderRadius: 30,
    opacity: 0.8,
  },
  parkShape2: {
    position: 'absolute',
    bottom: '25%',
    right: '20%',
    width: 80,
    height: 35,
    backgroundColor: '#d8f0d8',
    borderRadius: 20,
    opacity: 0.8,
  },
  roadHorizontal: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 5,
    backgroundColor: '#ffffff',
    opacity: 0.9,
  },
  roadVertical: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 5,
    backgroundColor: '#ffffff',
    opacity: 0.9,
  },
  landmarkText: {
    position: 'absolute',
    fontSize: 8,
    color: '#71717a',
    fontFamily: 'PlusJakartaSans-Regular',
  },
  pinContainer: {
    position: 'absolute',
    top: '25%',
    left: '42%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinWrapper: {
    alignItems: 'center',
  },
  pinShadow: {
    width: 14,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    marginTop: -4,
  },
  pinLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a2b0c',
    fontFamily: 'PlusJakartaSans-Bold',
    marginTop: 2,
    textShadowColor: 'rgba(255, 255, 255, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  centerList: {
    flex: 1,
    marginBottom: 16,
  },
  centerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 20,
    padding: 16,
    backgroundColor: '#ffffff',
    marginBottom: 12,
    borderWidth: 1.5,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.01,
    shadowRadius: 6,
    elevation: 1,
  },
  selectedCard: {
    borderColor: '#95d03a',
    borderLeftWidth: 5,
    borderLeftColor: '#95d03a',
  },
  unselectedCard: {
    borderColor: '#e4e4e7',
  },
  cardLeftContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    marginRight: 10,
  },
  cardPinIcon: {
    marginTop: 3,
    marginRight: 12,
  },
  cardDetails: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1c1c1e',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#71717a',
    fontFamily: 'PlusJakartaSans-Regular',
    marginTop: 2,
  },
  radioSelectedOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#95d03a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelectedInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#95d03a',
  },
  radioUnselected: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#d1d5db',
    backgroundColor: '#ffffff',
  },
  continueButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#a2e52c', // Vibrant brand highlight green
    borderRadius: 30,
    paddingVertical: 16,
    paddingHorizontal: 24,
    shadowColor: '#a2e52c',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  continueText: {
    color: '#1a2b0c', // Dark green matching typography
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'PlusJakartaSans-Bold',
    marginRight: 8,
  },
  disclaimerText: {
    fontSize: 11,
    color: '#71717a',
    fontFamily: 'PlusJakartaSans-Regular',
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 16,
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    color: '#71717a',
    fontFamily: 'PlusJakartaSans-Regular',
  },
});

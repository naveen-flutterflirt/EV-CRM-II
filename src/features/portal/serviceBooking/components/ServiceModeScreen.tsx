import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';

interface ServiceModeScreenProps {
  onContinue: (pickupRequired: boolean) => void;
  initialPickupRequired?: boolean;
}

export const ServiceModeScreen: React.FC<ServiceModeScreenProps> = ({
  onContinue,
  initialPickupRequired = false,
}) => {
  const [pickupRequired, setPickupRequired] = useState(initialPickupRequired);

  const handleContinue = () => {
    onContinue(pickupRequired);
  };

  return (
    <View style={styles.container}>
      {/* Title Header */}
      <Text style={styles.title}>How would you like your service?</Text>
      <Text style={styles.subtitle}>Choose a service mode.</Text>

      {/* Workshop Drop-off Card */}
      <TouchableOpacity
        style={[
          styles.card,
          !pickupRequired ? styles.selectedCard : styles.unselectedCard,
        ]}
        onPress={() => setPickupRequired(false)}
        activeOpacity={0.9}
      >
        <View style={styles.cardLeft}>
          <View
            style={[
              styles.iconCircle,
              !pickupRequired ? styles.selectedIconCircle : styles.unselectedIconCircle,
            ]}
          >
            <Feather
              name="tool"
              size={24}
              color={!pickupRequired ? '#ffffff' : '#71717a'}
            />
          </View>
          <View style={styles.cardDetails}>
            <Text style={styles.cardTitle}>Workshop drop-off</Text>
            <Text style={styles.cardSubtitle}>Bring your vehicle to our service center</Text>
          </View>
        </View>

        {/* Checkmark Indicator */}
        {!pickupRequired ? (
          <View style={styles.checkCircle}>
            <Feather name="check" size={14} color="#ffffff" />
          </View>
        ) : (
          <View style={styles.emptyCircle} />
        )}
      </TouchableOpacity>

      {/* Doorstep Pickup Card */}
      <TouchableOpacity
        style={[
          styles.card,
          pickupRequired ? styles.selectedCard : styles.unselectedCard,
        ]}
        onPress={() => setPickupRequired(true)}
        activeOpacity={0.9}
      >
        <View style={styles.cardLeft}>
          <View
            style={[
              styles.iconCircle,
              pickupRequired ? styles.selectedIconCircle : styles.unselectedIconCircle,
            ]}
          >
            <Feather
              name="truck"
              size={24}
              color={pickupRequired ? '#ffffff' : '#71717a'}
            />
          </View>
          <View style={styles.cardDetails}>
            <Text style={styles.cardTitle}>Doorstep pickup</Text>
            <Text style={styles.cardSubtitle}>We'll collect and return your vehicle</Text>
          </View>
        </View>

        {/* Checkmark Indicator */}
        {pickupRequired ? (
          <View style={styles.checkCircle}>
            <Feather name="check" size={14} color="#ffffff" />
          </View>
        ) : (
          <View style={styles.emptyCircle} />
        )}
      </TouchableOpacity>

      {/* Continue Button */}
      <TouchableOpacity
        style={styles.continueButton}
        onPress={handleContinue}
        activeOpacity={0.8}
      >
        <Text style={styles.continueText}>Continue</Text>
        <Feather name="arrow-right" size={20} color="#ffffff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 10,
    backgroundColor: '#faf8f3',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1c1c1e',
    fontFamily: 'PlusJakartaSans-Bold',
    lineHeight: 36,
  },
  subtitle: {
    fontSize: 16,
    color: '#71717a',
    fontFamily: 'PlusJakartaSans-Regular',
    marginTop: 8,
    marginBottom: 28,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 24,
    padding: 20,
    borderWidth: 2,
    backgroundColor: '#ffffff',
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 1,
  },
  selectedCard: {
    borderColor: '#4d6a00',
  },
  unselectedCard: {
    borderColor: '#e4e4e7',
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  selectedIconCircle: {
    backgroundColor: '#4d6a00',
  },
  unselectedIconCircle: {
    backgroundColor: '#eceef1',
  },
  cardDetails: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1c1c1e',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#71717a',
    fontFamily: 'PlusJakartaSans-Regular',
    marginTop: 4,
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#4d6a00',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#ffffff',
  },
  continueButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#4d6a00',
    borderRadius: 30,
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginTop: 20,
    shadowColor: '#4d6a00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  continueText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'PlusJakartaSans-Bold',
    marginRight: 8,
  },
});

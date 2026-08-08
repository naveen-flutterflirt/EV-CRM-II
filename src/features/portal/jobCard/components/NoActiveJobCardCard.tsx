import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Feather } from '@expo/vector-icons';

interface NoActiveJobCardCardProps {
  onBookServicePress?: () => void;
}

export const NoActiveJobCardCard: React.FC<NoActiveJobCardCardProps> = ({
  onBookServicePress,
}) => {
  const shimmerAnim = useRef(new Animated.Value(-60)).current;

  useEffect(() => {
    const loopAnim = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 220,
          duration: 2200,
          useNativeDriver: false,
        }),
        Animated.timing(shimmerAnim, {
          toValue: -60,
          duration: 0,
          useNativeDriver: false,
        }),
      ])
    );
    loopAnim.start();
    return () => loopAnim.stop();
  }, [shimmerAnim]);

  return (
    <View style={styles.cardContainer}>
      <View style={styles.topRow}>
        <View style={styles.iconCircle}>
          <Feather name="battery-charging" size={24} color="#4d7c0f" />
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>ALL SYSTEMS OK</Text>
        </View>
      </View>

      <Text style={styles.headingTitle}>No Active Service Job Card</Text>
      <Text style={styles.subText}>
        Your EV is running smooth! Time for a routine checkup or maintenance? Book a Service now.
      </Text>

      <TouchableOpacity
        style={styles.bookBtn}
        onPress={onBookServicePress}
        activeOpacity={0.85}
      >
        {/* Animated Shining Sheen Effect */}
        <Animated.View
          style={[
            styles.shimmerSheen,
            {
              transform: [{ translateX: shimmerAnim }, { rotate: '25deg' }],
            },
          ]}
        />
        
        <Feather name="calendar" size={14} color="#1a2b0c" style={{ marginRight: 6 }} />
        <Text style={styles.bookBtnText}>Book a Service</Text>
        <Feather name="arrow-right" size={14} color="#1a2b0c" style={{ marginLeft: 4 }} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    borderColor: '#edf6d6',
    borderWidth: 1.5,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 3,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#edf6d6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#4d7c0f',
    letterSpacing: 0.6,
    fontFamily: 'PlusJakartaSans-Bold',
  },
  headingTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 6,
    fontFamily: 'PlusJakartaSans-Bold',
  },
  subText: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 19,
    marginBottom: 18,
    fontFamily: 'PlusJakartaSans-Regular',
  },
  bookBtn: {
    backgroundColor: '#a2e52c',
    borderColor: '#84cc16',
    borderWidth: 1,
    borderRadius: 16,
    height: 40,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#a2e52c',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 4,
  },
  shimmerSheen: {
    position: 'absolute',
    top: -15,
    left: -20,
    width: 25,
    height: 70,
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
  },
  bookBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1a2b0c',
    fontFamily: 'PlusJakartaSans-Bold',
  },
});

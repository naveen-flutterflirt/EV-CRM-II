import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Easing, Image, SafeAreaView } from 'react-native';

interface LoadingScreenProps {
  message?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = 'Setting up your account...',
}) => {
  const spinValue = useRef(new Animated.Value(0)).current;
  const [dots, setDots] = useState('...');

  // Start continuous spinning animation
  useEffect(() => {
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1800,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, [spinValue]);

  // Animate dots (...)
  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => {
        if (prev === '.') return '..';
        if (prev === '..') return '...';
        return '.';
      });
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Top Centered Brand Logo */}
        <View style={styles.logoContainer}>
          <Image
            source={require('../../../assets/images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Loading Card Container */}
        <View style={styles.card}>
          {/* Custom Segmented Loader Ring */}
          <Animated.View style={[styles.loaderCircle, { transform: [{ rotate: spin }] }]} />

          {/* Loading message text */}
          <Text style={styles.loadingText}>{message}</Text>
          <Text style={styles.dotsText}>{dots}</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  logoContainer: {
    marginBottom: 60,
    alignItems: 'center',
  },
  logo: {
    width: 160,
    height: 160,
  },
  card: {
    width: 280,
    height: 280,
    borderRadius: 36,
    backgroundColor: '#eaf7d6', // soft pastel green card background
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 5,
    padding: 24,
  },
  loaderCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 6,
    borderColor: '#4c7a18', // Brand green segments
    borderStyle: 'dashed',
    marginBottom: 24,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4b5563',
    fontFamily: 'PlusJakartaSans-Medium',
    textAlign: 'center',
  },
  dotsText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#4b5563',
    fontFamily: 'PlusJakartaSans-Bold',
    marginTop: 4,
    textAlign: 'center',
  },
});

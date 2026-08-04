import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Animated,
  SafeAreaView,
  StatusBar,
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');

interface WelcomeScreenProps {
  onNavigateToLogin: () => void;
  onNavigateToRegister: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onNavigateToLogin,
  onNavigateToRegister,
}) => {
  // Animation for the progress bar
  const progressAnim = useRef(new Animated.Value(0.1)).current;

  useEffect(() => {
    // Loop the progress bar animation to simulate connecting to the grid
    const startAnimation = () => {
      Animated.sequence([
        Animated.timing(progressAnim, {
          toValue: 0.85,
          duration: 3000,
          useNativeDriver: false, // Layout animations require useNativeDriver: false for width
        }),
        Animated.timing(progressAnim, {
          toValue: 0.3,
          duration: 2000,
          useNativeDriver: false,
        }),
        Animated.timing(progressAnim, {
          toValue: 0.95,
          duration: 4000,
          useNativeDriver: false,
        }),
        Animated.timing(progressAnim, {
          toValue: 0.5,
          duration: 2500,
          useNativeDriver: false,
        }),
      ]).start(() => startAnimation());
    };

    startAnimation();
  }, [progressAnim]);

  // Interpolate the animated value to map to a percentage width
  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Upper Section: Logo and Branding */}
      <View style={styles.logoContainer}>
        <Image
          source={require('../../../../assets/images/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {/* Middle Section: Navigation Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.button} 
          onPress={onNavigateToLogin}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.button} 
          onPress={onNavigateToRegister}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Sign up</Text>
        </TouchableOpacity>
      </View>

      {/* Lower Section: Grid Connection Indicator */}
      <View style={styles.bottomContainer}>
        <View style={styles.progressBarTrack}>
          <Animated.View style={[styles.progressBarFill, { width: progressWidth }]} />
        </View>
        <Text style={styles.bottomText}>Connecting to grid...</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 50,
  },
  logoContainer: {
    flex: 1.2,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  logo: {
    width: width * 0.7,
    height: width * 0.7,
    maxWidth: 320,
    maxHeight: 320,
  },
  buttonContainer: {
    width: '100%',
    paddingHorizontal: 30,
    alignItems: 'center',
    marginBottom: 40,
  },
  button: {
    backgroundColor: '#95d03a', // Brand green matching the mockup
    width: '100%',
    maxWidth: 340,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#95d03a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  buttonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000', // Dark text as requested
    fontFamily: 'PlusJakartaSans-Bold',
  },
  bottomContainer: {
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 60,
    marginBottom: 20,
  },
  progressBarTrack: {
    height: 3,
    backgroundColor: '#e5e7eb',
    width: '100%',
    maxWidth: 220,
    borderRadius: 1.5,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#95d03a',
    borderRadius: 1.5,
  },
  bottomText: {
    fontSize: 14,
    color: '#9ca3af',
    fontFamily: 'PlusJakartaSans-Regular',
  },
});

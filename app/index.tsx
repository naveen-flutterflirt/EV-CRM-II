import React, { useState } from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useCustomerVehicles } from '../src/features/portal/myVehicles/hooks/useVehicles';
import { WelcomeScreen } from '../src/features/auth/screens/WelcomeScreen';
import { LoginScreen } from '../src/features/auth/screens/LoginScreen';
import { RegisterScreen } from '../src/features/auth/screens/RegisterScreen';
import { EmailVerificationScreen } from '../src/features/auth/screens/EmailVerificationScreen';
import { ForgotPasswordScreen } from '../src/features/auth/screens/ForgotPasswordScreen';
import { ProfileSetupCard, VehicleSetupCard } from '../src/features/portal/onboardingAndAuth';
import { LoadingScreen } from '../src/common/components';
import { VehicleCard } from '../src/features/portal/myVehicles/components/VehicleCard';
import { LiveTrackingCard } from '../src/features/portal/liveTracking/components/LiveTrackingCard';
import { DashboardStatsCard } from '../src/features/platform/dashboard/components/DashboardStatsCard';

export default function HomeScreen(): React.JSX.Element {
  const [currentScreen, setCurrentScreen] = useState<'welcome' | 'login' | 'register' | 'email-verification' | 'setup-profile' | 'setup-vehicle' | 'onboarding-loading' | 'home' | 'forgot-password'>('welcome');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [pendingUser, setPendingUser] = useState<any>(null);
  const [isSignupFlow, setIsSignupFlow] = useState(false);

  const { data: vehicles, isLoading: loadingVehicles } = useCustomerVehicles({
    enabled: !!currentUser
  });

  const handleLoginSuccess = (user: any) => {
    setIsSignupFlow(false);
    completeAuthentication(user);
  };

  const handleRegisterSuccess = (user: any) => {
    setIsSignupFlow(true);
    setPendingUser(user);
    setCurrentScreen('email-verification');
  };

  const completeAuthentication = (user: any) => {
    setCurrentUser(user);
    const role = (typeof user?.role === 'string'
      ? user?.role
      : user?.role?.roleCode || 'customer').toLowerCase();

    setPendingUser(null);

    if (role === 'customer') {
      router.replace('/dashboard');
    } else {
      setCurrentScreen('home');
    }
  };

  const handleVerificationSuccess = () => {
    setPendingUser(null);
    setIsSignupFlow(false);
    setCurrentScreen('login');
  };

  const handleProfileSetupComplete = () => {
    setCurrentScreen('setup-vehicle');
  };

  const handleVehicleSetupComplete = () => {
    setCurrentScreen('onboarding-loading');
    setTimeout(() => {
      if (pendingUser) {
        completeAuthentication(pendingUser);
      }
    }, 2500);
  };

  const handleSignOut = () => {
    setCurrentUser(null);
    setCurrentScreen('welcome');
  };

  const userRoleCode = (typeof currentUser?.role === 'string'
    ? currentUser?.role
    : currentUser?.role?.roleCode || 'customer').toLowerCase();

  const userDisplayName = currentUser?.name || currentUser?.fullName || currentUser?.username || 'EV User';

  if (currentScreen === 'forgot-password') {
    return (
      <ForgotPasswordScreen
        onNavigateToLogin={() => setCurrentScreen('login')}
      />
    );
  }

  if (currentScreen === 'welcome') {
    return (
      <WelcomeScreen
        onNavigateToLogin={() => setCurrentScreen('login')}
        onNavigateToRegister={() => setCurrentScreen('register')}
      />
    );
  }

  if (currentScreen === 'email-verification') {
    return (
      <EmailVerificationScreen
        email={pendingUser?.email || ''}
        onVerificationSuccess={handleVerificationSuccess}
        onBackToLogin={() => {
          setPendingUser(null);
          setCurrentScreen('login');
        }}
      />
    );
  }

  if (currentScreen === 'setup-profile') {
    return (
      <ProfileSetupCard
        user={{
          fullName: pendingUser?.fullName || '',
          phone: pendingUser?.phone || '',
          email: pendingUser?.email || '',
        }}
        onComplete={handleProfileSetupComplete}
        onCancel={() => {
          setPendingUser(null);
          setCurrentScreen('welcome');
        }}
      />
    );
  }

  if (currentScreen === 'setup-vehicle') {
    return (
      <VehicleSetupCard
        onComplete={handleVehicleSetupComplete}
        onSkip={handleVehicleSetupComplete}
        onBack={() => setCurrentScreen('setup-profile')}
      />
    );
  }

  if (currentScreen === 'onboarding-loading') {
    return <LoadingScreen message="Setting up your account..." />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
      {currentScreen === 'login' && (
        <LoginScreen
          onLoginSuccess={handleLoginSuccess}
          onNavigateToRegister={() => setCurrentScreen('register')}
          onForgotPasswordPress={() => setCurrentScreen('forgot-password')}
        />
      )}

      {currentScreen === 'register' && (
        <RegisterScreen
          onRegisterSuccess={handleRegisterSuccess}
          onNavigateToLogin={() => setCurrentScreen('login')}
        />
      )}

      {currentScreen === 'home' && (
        <View style={styles.homeContainer}>
          {/* Header */}
          <View style={styles.topHeader}>
            <View>
              <Text style={styles.welcomeText}>Welcome back,</Text>
              <Text style={styles.userNameText}>{userDisplayName}</Text>
              <View style={styles.roleBadge}>
                <Text style={styles.roleBadgeText}>ROLE: {userRoleCode.toUpperCase()}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
              <Text style={styles.signOutText}>Sign Out</Text>
            </TouchableOpacity>
          </View>

          {/* Dynamic Content Based on Role */}
          {userRoleCode === 'customer' ? (
            <View style={styles.contentSection}>
              <Text style={styles.sectionHeading}>🟢 Customer Portal Overview</Text>
              {loadingVehicles ? (
                <ActivityIndicator size="small" color="#95d03a" />
              ) : vehicles && vehicles.length > 0 ? (
                <VehicleCard vehicle={vehicles[0]} />
              ) : (
                <VehicleCard />
              )}
              <LiveTrackingCard />
            </View>
          ) : (
            <View style={styles.contentSection}>
              <Text style={styles.sectionHeading}>🔵 Platform Staff ERP Overview</Text>
              <DashboardStatsCard />
            </View>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  homeContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8fafc',
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e4e4e7',
    marginBottom: 20,
  },
  welcomeText: {
    color: '#71717a',
    fontSize: 12,
  },
  userNameText: {
    color: '#18181b',
    fontSize: 18,
    fontWeight: 'bold',
  },
  roleBadge: {
    backgroundColor: '#ecfdf5',
    borderColor: '#a7f3d0',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  roleBadgeText: {
    color: '#047857',
    fontSize: 10,
    fontWeight: 'bold',
  },
  signOutBtn: {
    backgroundColor: '#fef2f2',
    borderColor: '#fca5a5',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  signOutText: {
    color: '#dc2626',
    fontSize: 12,
    fontWeight: 'bold',
  },
  contentSection: {
    gap: 16,
  },
  sectionHeading: {
    color: '#18181b',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
});

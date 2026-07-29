import React, { useState } from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { LoginScreen } from '../src/features/auth/screens/LoginScreen';
import { RegisterScreen } from '../src/features/auth/screens/RegisterScreen';
import { VehicleCard } from '../src/features/portal/myVehicles/components/VehicleCard';
import { LiveTrackingCard } from '../src/features/portal/liveTracking/components/LiveTrackingCard';
import { DashboardStatsCard } from '../src/features/platform/dashboard/components/DashboardStatsCard';

export default function HomeScreen(): React.JSX.Element {
  const [currentScreen, setCurrentScreen] = useState<'login' | 'register' | 'home'>('login');
  const [currentUser, setCurrentUser] = useState<any>(null);

  const handleLoginSuccess = (user: any) => {
    setCurrentUser(user);
    const role = (typeof user?.role === 'string'
      ? user?.role
      : user?.role?.roleCode || 'customer').toLowerCase();
    
    if (role === 'customer') {
      router.replace('/dashboard');
    } else {
      setCurrentScreen('home');
    }
  };

  const handleSignOut = () => {
    setCurrentUser(null);
    setCurrentScreen('login');
  };

  const userRoleCode = (typeof currentUser?.role === 'string'
    ? currentUser?.role
    : currentUser?.role?.roleCode || 'customer').toLowerCase();

  const userDisplayName = currentUser?.name || currentUser?.fullName || currentUser?.username || 'EV User';

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
      {currentScreen === 'login' && (
        <LoginScreen
          onLoginSuccess={handleLoginSuccess}
          onNavigateToRegister={() => setCurrentScreen('register')}
        />
      )}

      {currentScreen === 'register' && (
        <RegisterScreen
          onRegisterSuccess={handleLoginSuccess}
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
              <VehicleCard
                vehicle={{
                  id: 'veh_101',
                  userId: currentUser?.id || currentUser?.userId,
                  brand: 'Ather',
                  model: '450X Gen 3',
                  vin: 'ATH450X2024MP04',
                  registrationNumber: 'MP04-EV-1024',
                  batteryHealthPct: 96,
                }}
              />
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

import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useCustomerDashboardHook } from '../hooks/useCustomerDashboard';
import { PortalLayout } from '../components/PortalLayout';
import { VehicleStatusCard } from '../components/VehicleStatusCard';
import { QuickActionsGrid } from '../components/QuickActionsGrid';
import { RecentActivityCard } from '../components/RecentActivityCard';
import { BatteryRangeCard } from '../components/BatteryRangeCard';
import { ServiceBookingFlow } from '../../serviceBooking';
import { PartsStoreScreen } from '../../partsStore';
import { AccountScreen, MyOrdersScreen, useProfileState } from '../../profile';

const ProfileTabFlow: React.FC = () => {
  const [profileView, setProfileView] = useState<'ACCOUNT' | 'MY_ORDERS'>('ACCOUNT');
  const { profile, activeTab, setActiveTab, displayedOrders, handleLogout } = useProfileState();

  if (profileView === 'MY_ORDERS') {
    return (
      <MyOrdersScreen
        orders={displayedOrders}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onBack={() => setProfileView('ACCOUNT')}
      />
    );
  }

  return (
    <AccountScreen
      user={profile}
      onOpenMyOrders={() => setProfileView('MY_ORDERS')}
      onLogout={handleLogout}
    />
  );
};

interface CustomerHomeScreenProps {
  onBookService?: () => void;
  onTrackService?: () => void;
  onSpareParts?: () => void;
  onNotificationPress?: () => void;
  onProfilePress?: () => void;
}

export const CustomerHomeScreen: React.FC<CustomerHomeScreenProps> = ({
  onBookService,
  onTrackService,
  onSpareParts,
  onNotificationPress,
  onProfilePress,
}) => {
  const { dashboardData, loading, refreshDashboard } = useCustomerDashboardHook();
  const [activeTab, setActiveTab] = useState<'HOME' | 'VEHICLES' | 'BOOK' | 'STORE' | 'PROFILE'>('HOME');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'VEHICLES':
        return (
          <View style={styles.tabContentBlock}>
            <Text style={styles.tabHeading}>🚘 My Registered EV Garage</Text>
            <VehicleStatusCard
              vehicle={dashboardData?.vehicle}
            />
            <BatteryRangeCard
              batteryPct={dashboardData?.vehicle.batteryHealthPct}
              rangeKm={dashboardData?.vehicle.currentRangeKm}
            />
          </View>
        );
      case 'BOOK':
        return (
          <ServiceBookingFlow
            vehicleId={dashboardData?.vehicle?.id}
            onGoHome={() => setActiveTab('HOME')}
            onTrackStatus={() => setActiveTab('VEHICLES')}
          />
        );
      case 'STORE':
        return (
          <PartsStoreScreen
            onBack={() => setActiveTab('HOME')}
          />
        );
      case 'PROFILE':
        return <ProfileTabFlow />;
      case 'HOME':
      default:
        return (
          <>
            {/* 1. Vehicle Status & Book Service Card */}
            <VehicleStatusCard
              vehicle={dashboardData?.vehicle}
            />

            {/* 2. Quick Actions Grid */}
            <QuickActionsGrid
              onBookService={() => {
                setActiveTab('BOOK');
                if (onBookService) onBookService();
              }}
              onLiveTracking={() => {
                setActiveTab('VEHICLES');
                if (onTrackService) onTrackService();
              }}
              onOrderParts={() => {
                setActiveTab('STORE');
                if (onSpareParts) onSpareParts();
              }}
              onEmergencyRsa={() => {
                import('react-native').then(({ Alert }) => {
                  Alert.alert(
                    'Emergency RSA',
                    'Roadside Assistance requested. A service team is being dispatched to your location.',
                    [{ text: 'OK' }]
                  );
                });
              }}
            />

            {/* 3. Recent Activity Card */}
            <RecentActivityCard
              activities={dashboardData?.recentActivities}
            />

            {/* 4. Battery Percentage & Range Card */}
            <BatteryRangeCard
              batteryPct={dashboardData?.vehicle.batteryHealthPct}
              rangeKm={dashboardData?.vehicle.currentRangeKm}
            />
          </>
        );
    }
  };

  return (
    <PortalLayout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      user={dashboardData?.user}
      refreshing={loading}
      onRefresh={refreshDashboard}
      onNotificationPress={onNotificationPress}
      onProfilePress={onProfilePress}
    >
      {renderTabContent()}
    </PortalLayout>
  );
};

const styles = StyleSheet.create({
  tabContentBlock: {
    gap: 16,
  },
  tabHeading: {
    fontSize: 16,
    fontWeight: '700',
    color: '#18181b',
    marginBottom: 8,
  },
  profileHeaderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e6f0d8',
    borderRadius: 24,
    padding: 20,
    marginBottom: 8,
  },
  profileAvatarCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 18,
    borderWidth: 1,
    borderColor: '#c6d8b2',
  },
  profileMeta: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a2b0c',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  profileSubText: {
    fontSize: 14,
    color: '#7a8a6b',
    fontFamily: 'PlusJakartaSans-Regular',
    marginTop: 2,
  },
  customerBadge: {
    backgroundColor: '#a2e52c',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginTop: 6,
    alignSelf: 'flex-start',
  },
  customerBadgeText: {
    color: '#2e5b02',
    fontSize: 9,
    fontWeight: '800',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  detailsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    paddingVertical: 10,
    paddingHorizontal: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 10,
    elevation: 1,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  detailIcon: {
    marginRight: 16,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#9ca3af',
    letterSpacing: 0.5,
    fontFamily: 'PlusJakartaSans-Bold',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a2b0c',
    fontFamily: 'PlusJakartaSans-Medium',
  },
  rowDivider: {
    height: 1,
    backgroundColor: '#f4f4f5',
    width: '100%',
  },
});

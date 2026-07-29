import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useCustomerDashboardHook } from '../hooks/useCustomerDashboard';
import { PortalLayout } from '../components/PortalLayout';
import { VehicleStatusCard } from '../components/VehicleStatusCard';
import { QuickActionsGrid } from '../components/QuickActionsGrid';
import { RecentActivityCard } from '../components/RecentActivityCard';
import { BatteryRangeCard } from '../components/BatteryRangeCard';

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
              onBookService={onBookService}
            />
            <BatteryRangeCard
              batteryPct={dashboardData?.vehicle.batteryHealthPct}
              rangeKm={dashboardData?.vehicle.currentRangeKm}
            />
          </View>
        );
      case 'BOOK':
        return (
          <View style={styles.tabContentBlock}>
            <Text style={styles.tabHeading}>📅 Interactive Workshop & Doorstep Service Booking</Text>
            <QuickActionsGrid
              onTrackService={onTrackService}
              onSpareParts={onSpareParts}
            />
            <VehicleStatusCard
              vehicle={dashboardData?.vehicle}
              onBookService={onBookService}
            />
          </View>
        );
      case 'STORE':
        return (
          <View style={styles.tabContentBlock}>
            <Text style={styles.tabHeading}>🛍️ EV OEM Spare Parts, Batteries & Accessories Store</Text>
            <QuickActionsGrid
              onTrackService={onTrackService}
              onSpareParts={onSpareParts}
            />
          </View>
        );
      case 'PROFILE':
        return (
          <View style={styles.tabContentBlock}>
            <Text style={styles.tabHeading}>👤 Customer Account & EV Wallet</Text>
            <RecentActivityCard activities={dashboardData?.recentActivities} />
          </View>
        );
      case 'HOME':
      default:
        return (
          <>
            {/* 1. Vehicle Status & Book Service Card */}
            <VehicleStatusCard
              vehicle={dashboardData?.vehicle}
              onBookService={onBookService}
            />

            {/* 2. Quick Actions Grid */}
            <QuickActionsGrid
              onTrackService={() => {
                setActiveTab('BOOK');
                if (onTrackService) onTrackService();
              }}
              onSpareParts={() => {
                setActiveTab('STORE');
                if (onSpareParts) onSpareParts();
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
});

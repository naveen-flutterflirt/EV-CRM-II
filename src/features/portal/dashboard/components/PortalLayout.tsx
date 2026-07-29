import React from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { PortalHeader } from './PortalHeader';
import { BottomNavBar } from './BottomNavBar';
import { UserProfile } from '../types';

interface PortalLayoutProps {
  children: React.ReactNode;
  activeTab?: 'HOME' | 'VEHICLES' | 'BOOK' | 'STORE' | 'PROFILE';
  onTabChange?: (tab: 'HOME' | 'VEHICLES' | 'BOOK' | 'STORE' | 'PROFILE') => void;
  user?: UserProfile;
  headerTitle?: string;
  refreshing?: boolean;
  onRefresh?: () => void;
  onNotificationPress?: () => void;
  onProfilePress?: () => void;
}

export const PortalLayout: React.FC<PortalLayoutProps> = ({
  children,
  activeTab = 'HOME',
  onTabChange,
  user,
  headerTitle,
  refreshing = false,
  onRefresh,
  onNotificationPress,
  onProfilePress,
}) => {
  const getTitle = () => {
    if (headerTitle) return headerTitle;
    switch (activeTab) {
      case 'VEHICLES': return 'My Garage & Vehicles';
      case 'BOOK': return 'Book EV Service';
      case 'STORE': return 'EV Spare Parts Store';
      case 'PROFILE': return 'Account & Profile';
      default: return 'Home';
    }
  };

  return (
    <View style={styles.layoutRoot}>
      {/* 1. Fixed Global Top Header (Stays Fixed on Screen Switch) */}
      <PortalHeader
        title={getTitle()}
        user={user}
        onNotificationPress={onNotificationPress}
        onProfilePress={onProfilePress}
      />

      {/* 2. Middle Scrollable Main Content Page */}
      <ScrollView
        style={styles.mainScrollArea}
        contentContainerStyle={styles.scrollContentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#82b440"
            />
          ) : undefined
        }
      >
        {children}
      </ScrollView>

      {/* 3. Fixed Global Bottom Footer / Tab Navigation Bar (Stays Fixed) */}
      <BottomNavBar activeTab={activeTab} onTabChange={onTabChange} />
    </View>
  );
};

const styles = StyleSheet.create({
  layoutRoot: {
    flex: 1,
    backgroundColor: '#faf8f3',
  },
  mainScrollArea: {
    flex: 1,
  },
  scrollContentContainer: {
    padding: 18,
    paddingBottom: 24,
  },
});

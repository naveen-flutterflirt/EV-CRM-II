import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export interface BottomNavBarProps {
  activeTab?: 'HOME' | 'VEHICLES' | 'BOOK' | 'STORE' | 'PROFILE';
  onTabChange?: (tab: 'HOME' | 'VEHICLES' | 'BOOK' | 'STORE' | 'PROFILE') => void;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeTab = 'HOME',
  onTabChange,
}) => {
  const insets = useSafeAreaInsets();

  const handlePress = (tab: 'HOME' | 'VEHICLES' | 'BOOK' | 'STORE' | 'PROFILE') => {
    if (onTabChange) {
      onTabChange(tab);
    }
  };

  const tabs: { key: 'HOME' | 'VEHICLES' | 'BOOK' | 'STORE' | 'PROFILE'; label: string; icon: keyof typeof Feather.glyphMap }[] = [
    { key: 'HOME', label: 'Home', icon: 'home' },
    { key: 'VEHICLES', label: 'Tracking', icon: 'map-pin' },
    { key: 'BOOK', label: 'Service', icon: 'battery-charging' },
    { key: 'STORE', label: 'Store', icon: 'shopping-bag' },
    { key: 'PROFILE', label: 'Account', icon: 'user' },
  ];

  return (
    <View style={[styles.navBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <TouchableOpacity
            key={tab.key}
            style={styles.tabItem}
            onPress={() => handlePress(tab.key)}
            activeOpacity={0.8}
          >
            <Feather
              name={tab.icon}
              size={22}
              color={isActive ? '#95d03a' : '#9ca3af'}
              style={styles.tabIcon}
            />
            <Text style={[styles.tabLabel, isActive && styles.activeTabLabel]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  navBar: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f4f4f5',
    paddingTop: 12,
    paddingBottom: 10,
    paddingHorizontal: 8,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  tabIcon: {
    marginBottom: 4,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#9ca3af',
    fontFamily: 'PlusJakartaSans-Bold',
    letterSpacing: 0.2,
  },
  activeTabLabel: {
    color: '#95d03a',
  },
});

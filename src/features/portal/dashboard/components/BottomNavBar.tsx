import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export interface BottomNavBarProps {
  activeTab?: 'HOME' | 'BOOK' | 'PROFILE' | 'VEHICLES' | 'STORE' | string;
  onTabChange?: (tab: any) => void;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeTab = 'HOME',
  onTabChange,
}) => {
  const insets = useSafeAreaInsets();

  const handlePress = (tab: 'HOME' | 'BOOK' | 'PROFILE') => {
    if (onTabChange) {
      onTabChange(tab);
    }
  };

  const tabs: { key: 'HOME' | 'BOOK' | 'PROFILE'; label: string; icon: keyof typeof Feather.glyphMap }[] = [
    { key: 'HOME', label: 'Home', icon: 'home' },
    { key: 'BOOK', label: 'Service', icon: 'battery-charging' },
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
              color={isActive ? '#7ea920' : '#64748b'}
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
    borderTopColor: '#f1f5f9',
    paddingTop: 12,
    paddingBottom: 10,
    paddingHorizontal: 20,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  tabIcon: {
    marginBottom: 4,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
    fontFamily: 'PlusJakartaSans-Bold',
    letterSpacing: 0.2,
  },
  activeTabLabel: {
    color: '#7ea920',
  },
});

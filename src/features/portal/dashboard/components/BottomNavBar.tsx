import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export interface BottomNavBarProps {
  activeTab?: 'HOME' | 'VEHICLES' | 'BOOK' | 'STORE' | 'PROFILE';
  onTabChange?: (tab: 'HOME' | 'VEHICLES' | 'BOOK' | 'STORE' | 'PROFILE') => void;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeTab = 'HOME',
  onTabChange,
}) => {
  const [currentTab, setCurrentTab] = useState(activeTab);

  const handlePress = (tab: 'HOME' | 'VEHICLES' | 'BOOK' | 'STORE' | 'PROFILE') => {
    setCurrentTab(tab);
    if (onTabChange) {
      onTabChange(tab);
    }
  };

  const tabs: { key: 'HOME' | 'VEHICLES' | 'BOOK' | 'STORE' | 'PROFILE'; label: string; icon: string }[] = [
    { key: 'HOME', label: 'HOME', icon: '🏠' },
    { key: 'VEHICLES', label: 'VEHICLES', icon: '🚘' },
    { key: 'BOOK', label: 'BOOK', icon: '📅' },
    { key: 'STORE', label: 'STORE', icon: '🛍️' },
    { key: 'PROFILE', label: 'PROFILE', icon: '👤' },
  ];

  return (
    <View style={styles.navBar}>
      {tabs.map((tab) => {
        const isActive = currentTab === tab.key;
        return (
          <TouchableOpacity
            key={tab.key}
            style={styles.tabItem}
            onPress={() => handlePress(tab.key)}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabIcon, isActive && styles.activeTabIcon]}>
              {tab.icon}
            </Text>
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
    borderTopColor: '#e4e4e7',
    paddingVertical: 10,
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
    fontSize: 18,
    marginBottom: 4,
    opacity: 0.6,
  },
  activeTabIcon: {
    opacity: 1,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#71717a',
    letterSpacing: 0.5,
  },
  activeTabLabel: {
    color: '#84cc16',
  },
});

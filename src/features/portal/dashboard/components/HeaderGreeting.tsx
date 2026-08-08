import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { UserProfile } from '../types';

interface HeaderGreetingProps {
  user?: UserProfile;
  onNotificationPress?: () => void;
  onProfilePress?: () => void;
}

export const HeaderGreeting: React.FC<HeaderGreetingProps> = ({
  user,
  onNotificationPress,
  onProfilePress,
}) => {
  const rawName = user?.name || 'Customer';
  const cleanName = rawName.replace(/^Hi,?\s*/i, '').trim();
  const userName = cleanName ? `Hi, ${cleanName}` : 'Hi, Customer';
  const location = user?.location || 'Indore';

  return (
    <View style={styles.container}>
      {/* Top Bar: Home Title + Top Right Actions (Bell + Profile) */}
      <View style={styles.topBar}>
        <Text style={styles.screenTitle}>Home</Text>

        <View style={styles.topActionsGroup}>
          <TouchableOpacity
            style={styles.bellBtn}
            onPress={onNotificationPress}
            activeOpacity={0.75}
          >
            <Feather name="bell" size={18} color="#0f172a" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.topProfileBadge} onPress={onProfilePress} activeOpacity={0.8}>
            <Text style={styles.topProfileBadgeIcon}>👤</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Greeting Row: User Avatar + Name/Location */}
      <View style={styles.greetingRow}>
        <View style={styles.userInfoGroup}>
          <View style={styles.avatarCircle}>
            {user?.avatarUrl ? (
              <Image source={{ uri: user.avatarUrl }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarText}>👤</Text>
            )}
          </View>
          <View style={styles.nameLocationContainer}>
            <Text style={styles.userNameText}>{userName}</Text>
            <View style={styles.locationRow}>
              <Text style={styles.locationPinIcon}>📍</Text>
              <Text style={styles.locationText}>{location}</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 18,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0f172a',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  topActionsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  bellBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  topProfileBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#3f6212',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  topProfileBadgeIcon: {
    fontSize: 14,
    color: '#ffffff',
  },
  greetingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userInfoGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f1f5f9',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarText: {
    fontSize: 22,
  },
  nameLocationContainer: {
    justifyContent: 'center',
  },
  userNameText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0f172a',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  locationPinIcon: {
    fontSize: 11,
    marginRight: 3,
  },
  locationText: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '600',
    fontFamily: 'PlusJakartaSans-Medium',
  },
});

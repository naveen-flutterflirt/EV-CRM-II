import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { UserProfile } from '../types';

interface PortalHeaderProps {
  title?: string;
  user?: UserProfile;
  onNotificationPress?: () => void;
  onProfilePress?: () => void;
}

export const PortalHeader: React.FC<PortalHeaderProps> = ({
  title = 'Home',
  user,
  onNotificationPress,
  onProfilePress,
}) => {
  const userName = user?.name
    ? user.name.startsWith('Hi ')
      ? user.name
      : `Hi ${user.name}`
    : 'Hi Rohan';
  const location = user?.location || 'Indore';

  return (
    <View style={styles.headerContainer}>
      {/* Top Bar: Section Title + Top Right Green Profile Badge */}
      <View style={styles.topBar}>
        <Text style={styles.screenTitle}>{title}</Text>
        <TouchableOpacity style={styles.topProfileBadge} onPress={onProfilePress} activeOpacity={0.8}>
          <Text style={styles.topProfileBadgeIcon}>👤</Text>
        </TouchableOpacity>
      </View>

      {/* Greeting Row: User Avatar + Name/Location + Bell Button */}
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

        {/* Bell Notification Button */}
        <TouchableOpacity style={styles.bellButton} onPress={onNotificationPress} activeOpacity={0.8}>
          <Text style={styles.bellIcon}>🔔</Text>
          <View style={styles.activeDot} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: '#faf8f3',
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f2f0e8',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#18181b',
  },
  topProfileBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#3f6212',
    justifyContent: 'center',
    alignItems: 'center',
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
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#e4e4e7',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d4d4d8',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarText: {
    fontSize: 20,
  },
  nameLocationContainer: {
    justifyContent: 'center',
  },
  userNameText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#18181b',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  locationPinIcon: {
    fontSize: 11,
    marginRight: 2,
  },
  locationText: {
    fontSize: 13,
    color: '#71717a',
    fontWeight: '500',
  },
  bellButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e4e4e7',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  bellIcon: {
    fontSize: 16,
  },
  activeDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ef4444',
  },
});

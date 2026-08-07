import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';

export interface UserProfile {
  id?: string;
  customerId?: string;
  name: string;
  location?: string;
  avatarUrl?: string;
  branch?: string;
  email?: string;
  phone?: string;
}

interface PortalHeaderProps {
  title?: string;
  user?: UserProfile;
  unreadCount?: number;
  onNotificationPress?: () => void;
  onProfilePress?: () => void;
  onCenterChange?: (centerId: string, centerName: string) => void;
}

export const PortalHeader: React.FC<PortalHeaderProps> = ({
  user,
  unreadCount = 0,
  onNotificationPress,
}) => {
  const rawName = user?.name || 'Customer';
  const cleanName = rawName.replace(/^Hi,?\s*/i, '').trim();
  const displayName = cleanName ? `Hi, ${cleanName}` : 'Hi, Customer';

  return (
    <View style={styles.headerContainer}>
      {/* Left Column: Flutter Flirt Logo Icon + Greeting */}
      <View style={styles.leftBrandGroup}>
        <View style={styles.logoBadge}>
          {user?.avatarUrl ? (
            <Image source={{ uri: user.avatarUrl }} style={styles.avatarImage} />
          ) : (
            <Image 
              source={require('../../../assets/images/logo_without_txt.png')} 
              style={styles.avatarLogoImage}
              resizeMode="contain"
            />
          )}
        </View>
        <View style={styles.brandTitleContainer}>
          <Text style={styles.brandHeading}>{displayName}</Text>
        </View>
      </View>

      {/* Right Column: Notification Bell */}
      <View style={styles.actionsContainer}>
        {onNotificationPress && (
          <TouchableOpacity
            style={styles.bellBtn}
            onPress={onNotificationPress}
            activeOpacity={0.8}
          >
            <Feather name="bell" size={18} color="#0f172a" />
            {unreadCount > 0 && (
              <View style={styles.redBadgeDot} />
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  leftBrandGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  logoBadge: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  brandTitleContainer: {
    flex: 1,
  },
  brandHeading: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: -0.3,
    fontFamily: 'PlusJakartaSans-Bold',
  },
  actionsContainer: {
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
    position: 'relative',
  },
  redBadgeDot: {
    position: 'absolute',
    top: 3,
    right: 3,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ef4444',
    borderWidth: 1.5,
    borderColor: '#ffffff',
  },
  avatarButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#edf6d6',
    borderWidth: 1.5,
    borderColor: '#dcfce7',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarLogoImage: {
    width: 32,
    height: 32,
  },
});

export default PortalHeader;

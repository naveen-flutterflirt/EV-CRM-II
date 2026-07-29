import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { UserProfile } from '../types';

interface PortalHeaderProps {
  title?: string;
  user?: UserProfile;
  onNotificationPress?: () => void;
  onProfilePress?: () => void;
}

export const PortalHeader: React.FC<PortalHeaderProps> = ({
  user,
  onNotificationPress,
  onProfilePress,
}) => {
  const branchName = user?.branch || 'Downtown Branch';
  const displayBranch = branchName === 'Bhopal Head Office & Wo' ? 'Downtown Branch' : branchName;

  return (
    <View style={styles.headerContainer}>
      {/* Left Column: Branch Dropdown Selector */}
      <View style={styles.branchContainer}>
        <TouchableOpacity style={styles.branchSelector} activeOpacity={0.7}>
          <Feather name="map-pin" size={14} color="#4d6a00" style={styles.locationIcon} />
          <Text style={styles.branchText} numberOfLines={1}>
            {displayBranch}
          </Text>
          <Feather name="chevron-down" size={14} color="#4d6a00" />
        </TouchableOpacity>
      </View>

      {/* Right Column: Actions (Bell + Avatar) */}
      <View style={styles.actionsContainer}>
        {/* Notification Bell */}
        <TouchableOpacity style={styles.actionButton} onPress={onNotificationPress} activeOpacity={0.7}>
          <Feather name="bell" size={24} color="#000000" />
          <View style={styles.activeDot} />
        </TouchableOpacity>

        {/* User Profile Avatar */}
        <TouchableOpacity style={styles.avatarButton} onPress={onProfilePress} activeOpacity={0.7}>
          {user?.avatarUrl ? (
            <Image source={{ uri: user.avatarUrl }} style={styles.avatarImage} />
          ) : (
            <Image 
              source={require('../../../../../assets/images/logo.png')} 
              style={styles.avatarLogoImage}
              resizeMode="contain"
            />
          )}
        </TouchableOpacity>
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
    borderBottomColor: '#f4f4f5',
  },
  branchContainer: {
    flex: 1.5,
    marginRight: 10,
  },
  branchSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f0fa',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
  },
  branchText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1a2b0c',
    fontFamily: 'PlusJakartaSans-Bold',
    marginHorizontal: 6,
    maxWidth: 130,
  },
  locationIcon: {
    marginTop: 1,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  actionButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  activeDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#dc2626',
  },
  avatarButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e4e4e7',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarLogoImage: {
    width: 22,
    height: 22,
  },
});

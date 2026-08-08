import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  SafeAreaView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { UserProfileData } from '../types';

interface AccountScreenProps {
  user?: UserProfileData | null;
  onOpenViewProfile?: () => void;
  onOpenEditProfile: () => void;
  onOpenServiceHistory: () => void;
  onOpenSupport?: () => void;
  onOpenSettings: () => void;
  onLogout: () => void;
}

export const AccountScreen: React.FC<AccountScreenProps> = ({
  user,
  onOpenViewProfile,
  onOpenEditProfile,
  onOpenServiceHistory,
  onOpenSupport,
  onOpenSettings,
  onLogout,
}) => {
  const userName = user?.name || '';
  const userPhone = user?.phone || '';
  const handleProfilePress = onOpenViewProfile || onOpenEditProfile;

  const menuItems = [
    {
      id: 'service_history',
      title: 'Service history',
      icon: 'clock',
      onPress: onOpenServiceHistory,
    },
    {
      id: 'support',
      title: 'Support',
      icon: 'headphones',
      onPress: onOpenSupport,
    },
    {
      id: 'settings',
      title: 'Settings',
      icon: 'settings',
      onPress: onOpenSettings,
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Top Header Bar */}
        <View style={styles.topBar}>
          <Text style={styles.headerTitle}>Account</Text>
        </View>

        {/* User Profile Card */}
        <View style={styles.userCard}>
          <TouchableOpacity
            style={styles.userLeftGroup}
            onPress={handleProfilePress}
            activeOpacity={0.8}
          >
            <View style={styles.avatarWrap}>
              {user?.avatarUrl ? (
                <Image source={{ uri: user.avatarUrl }} style={styles.avatarImg} />
              ) : (
                <Feather name="user" size={24} color="#64748b" />
              )}
            </View>

            <View style={styles.userMeta}>
              <Text style={styles.userName}>{userName}</Text>
              <Text style={styles.userPhone}>{userPhone}</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.bellBtn} onPress={handleProfilePress}>
            <Feather name="chevron-right" size={20} color="#64748b" />
          </TouchableOpacity>
        </View>

        {/* Menu Options Group (No My Orders route) */}
        <View style={styles.menuGroup}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuRow}
              onPress={item.onPress}
              activeOpacity={0.75}
            >
              <View style={styles.menuIconCircle}>
                <Feather name={item.icon as any} size={20} color="#475569" />
              </View>
              <Text style={styles.menuTitle}>{item.title}</Text>
              <Feather name="chevron-right" size={18} color="#cbd5e1" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Log Out Pill Card */}
        <TouchableOpacity
          style={styles.logoutCard}
          onPress={onLogout}
          activeOpacity={0.85}
        >
          <View style={styles.logoutLeftGroup}>
            <View style={styles.logoutIconCircle}>
              <Feather name="log-out" size={18} color="#dc2626" />
            </View>
            <Text style={styles.logoutText}>Log out</Text>
          </View>
        </TouchableOpacity>

        {/* Footer Branding Badge */}
        <View style={styles.footerSection}>
          <View style={styles.exclamationCircle}>
            <Text style={styles.exclamationMark}>!</Text>
          </View>
          <Text style={styles.versionText}>VERSION v1.0.0</Text>
          <Text style={styles.loveText}>MADE WITH LOVE FOR THE FUTURE OF FINANCE</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0f172a',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  topAvatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#3f6212',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  userLeftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatarImg: {
    width: '100%',
    height: '100%',
  },
  userMeta: {
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  userName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1a2b0c',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  editIcon: {
    marginLeft: 2,
  },
  userPhone: {
    fontSize: 12,
    color: '#64748b',
    letterSpacing: 0.5,
    fontFamily: 'PlusJakartaSans-Regular',
  },
  bellBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  referCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#edf6d6',
    borderRadius: 28,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 24,
  },
  referLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  referIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#a2e52c',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  innerLimeCircle: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#ffffff',
  },
  referTextCol: {
    flex: 1,
  },
  referTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1a2b0c',
    marginBottom: 2,
    fontFamily: 'PlusJakartaSans-Bold',
  },
  referSub: {
    fontSize: 11,
    color: '#64748b',
    fontFamily: 'PlusJakartaSans-Regular',
  },
  arrowCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuGroup: {
    gap: 12,
    marginBottom: 24,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    paddingHorizontal: 16,
    height: 60,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  menuIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  menuTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: '#1a2b0c',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  logoutCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fef2f2',
    borderRadius: 28,
    paddingHorizontal: 18,
    height: 60,
    marginBottom: 32,
  },
  logoutLeftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoutIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#ffe4e6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#dc2626',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  exitText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#dc2626',
    letterSpacing: 1,
    fontFamily: 'PlusJakartaSans-Bold',
  },
  footerSection: {
    alignItems: 'center',
    paddingBottom: 40,
  },
  exclamationCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#eef4d4',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  exclamationMark: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#84cc16',
  },
  versionText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: 1.5,
    marginBottom: 4,
    fontFamily: 'PlusJakartaSans-Bold',
  },
  loveText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#cbd5e1',
    letterSpacing: 1,
    fontFamily: 'PlusJakartaSans-Bold',
  },
});

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Image,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { UserProfileData } from '../types';

interface ViewProfileScreenProps {
  user?: UserProfileData | null;
  onEditProfile: () => void;
  onBack: () => void;
}

export const ViewProfileScreen: React.FC<ViewProfileScreenProps> = ({
  user,
  onEditProfile,
  onBack,
}) => {
  const firstName = user?.firstName || 'User';
  const lastName = user?.lastName || '';
  const fullName = user?.name || `${firstName} ${lastName}`.trim();
  const phone = user?.phone || '-';
  const email = user?.email || '-';
  const gender = user?.gender || 'Undisclosed';
  const addressLine1 = user?.addressLine1 || '-';
  const city = user?.city || '-';
  const pincode = user?.pincode || '-';

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header Bar with Heading "Profile" and Pencil (Edit) Icon Button */}
      <View style={styles.topHeader}>
        <View style={styles.headerLeftGroup}>
          <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.7}>
            <Feather name="arrow-left" size={20} color="#0f172a" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>

          {/* Pencil (Edit) Button right next to "Profile" Heading */}
          <TouchableOpacity
            style={styles.headerEditBtn}
            onPress={onEditProfile}
            activeOpacity={0.8}
          >
            <Feather name="edit-3" size={15} color="#0f172a" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Profile Avatar Card */}
        <View style={styles.heroCard}>
          <View style={styles.avatarWrap}>
            {user?.avatarUrl ? (
              <Image source={{ uri: user.avatarUrl }} style={styles.avatarImg} />
            ) : (
              <Feather name="user" size={32} color="#4d7c0f" />
            )}
          </View>
          <Text style={styles.heroName}>{fullName}</Text>
          <Text style={styles.heroPhone}>{phone}</Text>
        </View>

        {/* Read-only User Details Group */}
        <View style={styles.detailsGroup}>
          {/* First Name */}
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>FIRST NAME</Text>
            <Text style={styles.detailVal}>{firstName}</Text>
          </View>

          {/* Last Name */}
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>LAST NAME</Text>
            <Text style={styles.detailVal}>{lastName || '-'}</Text>
          </View>

          {/* Phone Number */}
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>PHONE NUMBER</Text>
            <Text style={styles.detailVal}>{phone}</Text>
          </View>

          {/* Email Address */}
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>EMAIL ADDRESS</Text>
            <Text style={styles.detailVal}>{email}</Text>
          </View>

          {/* Gender */}
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>GENDER</Text>
            <Text style={styles.detailVal}>{gender}</Text>
          </View>

          {/* Address Line 1 */}
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>ADDRESS LINE 1</Text>
            <Text style={styles.detailVal}>{addressLine1}</Text>
          </View>

          {/* City */}
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>CITY</Text>
            <Text style={styles.detailVal}>{city}</Text>
          </View>

          {/* Pincode */}
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>PINCODE</Text>
            <Text style={styles.detailVal}>{pincode}</Text>
          </View>
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
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerLeftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0f172a',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  headerEditBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  heroCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  avatarWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#f7fee7',
    borderWidth: 2,
    borderColor: '#d9f99d',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginBottom: 12,
  },
  avatarImg: {
    width: '100%',
    height: '100%',
  },
  heroName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 4,
    fontFamily: 'PlusJakartaSans-Bold',
  },
  heroPhone: {
    fontSize: 13,
    color: '#64748b',
    fontFamily: 'PlusJakartaSans-Regular',
  },
  detailsGroup: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 14,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  detailRow: {
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  detailLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: 0.8,
    marginBottom: 4,
    fontFamily: 'PlusJakartaSans-Bold',
  },
  detailVal: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
    fontFamily: 'PlusJakartaSans-SemiBold',
  },
  editActionBtn: {
    backgroundColor: '#a2e52c',
    borderRadius: 20,
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 36,
  },
  editActionText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1a2b0c',
    fontFamily: 'PlusJakartaSans-Bold',
  },
});

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Modal, ScrollView, ActivityIndicator, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useServiceCenters } from '../../features/portal/serviceBooking/hooks/useServiceBooking';

export interface UserProfile {
  id?: string;
  customerId?: string;
  name: string;
  location: string;
  avatarUrl?: string;
  branch?: string;
  email?: string;
  phone?: string;
}

interface PortalHeaderProps {
  title?: string;
  user?: UserProfile;
  onNotificationPress?: () => void;
  onProfilePress?: () => void;
  onCenterChange?: (centerId: string, centerName: string) => void;
}

export const PortalHeader: React.FC<PortalHeaderProps> = ({
  user,
  onNotificationPress,
  onProfilePress,
  onCenterChange,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCenterName, setSelectedCenterName] = useState('Bhopal Head Office & EV Workshop');
  const [selectedCenterId, setSelectedCenterId] = useState('');

  // Dynamically fetch service centers list from the backend
  const { data: centers, isLoading } = useServiceCenters();

  // Initialize selected center based on user branch profile or database contents
  useEffect(() => {
    if (user?.branch) {
      setSelectedCenterName(user.branch);
    } else if (centers && centers.length > 0) {
      // Find default center
      const defaultCenter = centers[0];
      setSelectedCenterName(defaultCenter.centerName);
      setSelectedCenterId(defaultCenter.centerId);
    }
  }, [user?.branch, centers]);

  const handleSelectCenter = (centerId: string, centerName: string) => {
    setSelectedCenterName(centerName);
    setSelectedCenterId(centerId);
    setModalVisible(false);
    if (onCenterChange) {
      onCenterChange(centerId, centerName);
    }
  };

  // Human readable clean names mapping
  const getCleanName = (name: string) => {
    if (name === 'Bhopal Head Office & EV Workshop') return 'Bhopal HQ & Workshop';
    return name;
  };

  return (
    <View style={styles.headerContainer}>
      {/* Left Column: Branch Dropdown Capsule Selector */}
      <View style={styles.branchContainer}>
        <TouchableOpacity 
          style={styles.branchSelector} 
          onPress={() => setModalVisible(true)}
          activeOpacity={0.7}
        >
          <Feather name="map-pin" size={14} color="#4d6a00" style={styles.locationIcon} />
          <Text style={styles.branchText} numberOfLines={1}>
            {getCleanName(selectedCenterName)}
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
              source={require('../../../assets/images/logo.png')} 
              style={styles.avatarLogoImage}
              resizeMode="contain"
            />
          )}
        </TouchableOpacity>
      </View>

      {/* Dropdown Bottom Sheet Selector Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable 
          style={styles.modalOverlay} 
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.bottomSheetContainer}>
            <View style={styles.sheetHeader}>
              <View style={styles.dragIndicator} />
              <Text style={styles.sheetTitle}>Select Service Location</Text>
            </View>

            {isLoading ? (
              <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#95d03a" />
                <Text style={styles.loaderText}>Loading service centers...</Text>
              </View>
            ) : (
              <ScrollView style={styles.centersList} showsVerticalScrollIndicator={false}>
                {centers && centers.length > 0 ? (
                  centers.map((center) => {
                    const isSelected = selectedCenterName === center.centerName || selectedCenterId === center.centerId;
                    return (
                      <TouchableOpacity
                        key={center.centerId}
                        style={[
                          styles.centerItem,
                          isSelected && styles.selectedCenterItem
                        ]}
                        onPress={() => handleSelectCenter(center.centerId, center.centerName)}
                        activeOpacity={0.7}
                      >
                        <View style={styles.centerItemLeft}>
                          <View style={[styles.pinIconBg, isSelected && styles.selectedPinIconBg]}>
                            <Feather 
                              name="map-pin" 
                              size={18} 
                              color={isSelected ? '#1a2b0c' : '#71717a'} 
                            />
                          </View>
                          <View style={styles.centerTextDetails}>
                            <Text style={[styles.centerNameText, isSelected && styles.selectedCenterNameText]}>
                              {center.centerName}
                            </Text>
                            <Text style={styles.centerCityText}>{center.city || 'Available Branch'}</Text>
                          </View>
                        </View>
                        {isSelected && (
                          <Feather name="check" size={20} color="#95d03a" style={styles.checkIcon} />
                        )}
                      </TouchableOpacity>
                    );
                  })
                ) : (
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No service centers found</Text>
                  </View>
                )}
              </ScrollView>
            )}
          </View>
        </Pressable>
      </Modal>
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
    maxWidth: 160,
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
  // Modal Bottom Sheet Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  bottomSheetContainer: {
    backgroundColor: '#faf8f3',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingBottom: 40,
    maxHeight: '65%',
  },
  sheetHeader: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  dragIndicator: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#e4e4e7',
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a2b0c',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  loaderContainer: {
    paddingVertical: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loaderText: {
    marginTop: 12,
    color: '#71717a',
    fontFamily: 'PlusJakartaSans-Regular',
  },
  centersList: {
    marginTop: 8,
  },
  centerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e4e4e7',
  },
  selectedCenterItem: {
    backgroundColor: '#e6f0d8',
    borderColor: '#a2e52c',
  },
  centerItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  pinIconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f4f4f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  selectedPinIconBg: {
    backgroundColor: '#a2e52c',
  },
  centerTextDetails: {
    flex: 1,
  },
  centerNameText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1c1c1e',
    fontFamily: 'PlusJakartaSans-SemiBold',
  },
  selectedCenterNameText: {
    color: '#1a2b0c',
    fontWeight: '700',
  },
  centerCityText: {
    fontSize: 11,
    color: '#71717a',
    fontFamily: 'PlusJakartaSans-Regular',
    marginTop: 2,
  },
  checkIcon: {
    marginLeft: 10,
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#71717a',
    fontFamily: 'PlusJakartaSans-Regular',
  },
});
export default PortalHeader;

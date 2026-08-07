import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useCustomerDashboardHook } from '../hooks/useCustomerDashboard';
import { PortalLayout } from '../components/PortalLayout';
import { VehicleStatusCard } from '../components/VehicleStatusCard';
import { QuickActionsGrid } from '../components/QuickActionsGrid';
import { RecentActivityCard } from '../components/RecentActivityCard';
import { BatteryRangeCard } from '../components/BatteryRangeCard';
import { ServiceBookingFlow } from '../../serviceBooking';
import { JobCardTrackerScreen, NoActiveJobCardCard, useActiveJobCard, useCustomerAppointments } from '../../jobCard';
import { useCustomerVehicles, VehicleDetailsScreen, AddVehicleModal, VehicleSuccessModal } from '../../myVehicles';
import { DeleteConfirmModal } from '../../../../common/components/DeleteConfirmModal';
import {
  AccountScreen,
  EditProfileScreen,
  ViewProfileScreen,
  ServiceHistoryScreen,
  ServiceDetailScreen,
  SupportMainScreen,
  HelpCenterScreen,
  ContactScreen,
  SettingsScreen,
  SecurityScreen,
  TermsAndPrivacyScreen,
  useProfileState,
} from '../../profile';
import {
  NotificationModal,
  NotificationScreen,
  fetchCustomerNotificationsApi,
  markNotificationAsReadApi,
  markAllNotificationsAsReadApi,
  CustomerNotificationItem,
} from '../../notifications';

interface ProfileTabFlowProps {
  onGoToBooking?: () => void;
  onLogoutRequest: () => void;
}

const ProfileTabFlow: React.FC<ProfileTabFlowProps> = ({ onGoToBooking, onLogoutRequest }) => {
  const {
    profile,
    serviceHistory,
    serviceDetail,
    supportTickets,
    faqs,
    subView,
    setSubView,
    saving,
    pushNotificationsEnabled,
    setPushNotificationsEnabled,
    selectedLanguage,
    setSelectedLanguage,
    openServiceDetail,
    handleSaveProfile,
  } = useProfileState();

  if (subView === 'VIEW_PROFILE') {
    return (
      <ViewProfileScreen
        user={profile}
        onEditProfile={() => setSubView('EDIT_PROFILE')}
        onBack={() => setSubView('ACCOUNT')}
      />
    );
  }

  if (subView === 'EDIT_PROFILE') {
    return (
      <EditProfileScreen
        user={profile}
        saving={saving}
        onSave={handleSaveProfile}
        onBack={() => setSubView('VIEW_PROFILE')}
      />
    );
  }

  if (subView === 'SERVICE_HISTORY') {
    return (
      <ServiceHistoryScreen
        history={serviceHistory}
        onSelectRecord={(record) => openServiceDetail(record)}
        onBack={() => setSubView('ACCOUNT')}
      />
    );
  }

  if (subView === 'SERVICE_DETAIL') {
    return (
      <ServiceDetailScreen
        detail={serviceDetail}
        onBack={() => setSubView('SERVICE_HISTORY')}
        onBookNextService={onGoToBooking}
      />
    );
  }

  if (subView === 'SUPPORT_MAIN') {
    return (
      <SupportMainScreen
        tickets={supportTickets}
        onOpenHelpCenter={() => setSubView('HELP_CENTER')}
        onOpenContactUs={() => setSubView('CONTACT_US')}
        onBack={() => setSubView('ACCOUNT')}
      />
    );
  }

  if (subView === 'HELP_CENTER') {
    return (
      <HelpCenterScreen
        faqs={faqs}
        onOpenContactUs={() => setSubView('CONTACT_US')}
        onBack={() => setSubView('SUPPORT_MAIN')}
      />
    );
  }

  if (subView === 'CONTACT_US') {
    return (
      <ContactScreen
        onBack={() => setSubView('SUPPORT_MAIN')}
      />
    );
  }

  if (subView === 'SECURITY') {
    return (
      <SecurityScreen
        onBack={() => setSubView('SETTINGS')}
      />
    );
  }

  if (subView === 'TERMS_AND_PRIVACY') {
    return (
      <TermsAndPrivacyScreen
        onBack={() => setSubView('SETTINGS')}
      />
    );
  }

  if (subView === 'SETTINGS') {
    return (
      <SettingsScreen
        pushNotifications={pushNotificationsEnabled}
        onTogglePushNotifications={setPushNotificationsEnabled}
        selectedLanguage={selectedLanguage}
        onSelectLanguage={setSelectedLanguage}
        onOpenSecurity={() => setSubView('SECURITY')}
        onOpenTermsAndPrivacy={() => setSubView('TERMS_AND_PRIVACY')}
        onBack={() => setSubView('ACCOUNT')}
        onLogout={onLogoutRequest}
      />
    );
  }

  return (
    <AccountScreen
      user={profile}
      onOpenViewProfile={() => setSubView('VIEW_PROFILE')}
      onOpenEditProfile={() => setSubView('EDIT_PROFILE')}
      onOpenServiceHistory={() => setSubView('SERVICE_HISTORY')}
      onOpenSupport={() => setSubView('SUPPORT_MAIN')}
      onOpenSettings={() => setSubView('SETTINGS')}
      onLogout={onLogoutRequest}
    />
  );
};

interface CustomerHomeScreenProps {
  onBookService?: () => void;
  onTrackService?: () => void;
  onSpareParts?: () => void;
  onNotificationPress?: () => void;
  onProfilePress?: () => void;
}

export const CustomerHomeScreen: React.FC<CustomerHomeScreenProps> = ({
  onBookService,
  onTrackService,
  onSpareParts,
  onNotificationPress,
  onProfilePress,
}) => {
  const { dashboardData, loading, refreshDashboard } = useCustomerDashboardHook();
  const [activeTab, setActiveTab] = useState<'HOME' | 'VEHICLES' | 'BOOK' | 'STORE' | 'PROFILE' | 'JOBCARD'>('HOME');

  const [showAddVehicleModal, setShowAddVehicleModal] = useState(false);
  const [successModalData, setSuccessModalData] = useState<{
    visible: boolean;
    title: string;
    message: string;
  }>({
    visible: false,
    title: 'Vehicle Registered Successfully',
    message: 'Your vehicle has been successfully added to your garage.',
  });
  const [showRemoveVehicleModal, setShowRemoveVehicleModal] = useState(false);
  const [showLogoutConfirmModal, setShowLogoutConfirmModal] = useState(false);

  const [showNotificationScreen, setShowNotificationScreen] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [notifications, setNotifications] = useState<CustomerNotificationItem[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  // Auto-fetch notifications on mount & poll every 10 seconds for real-time red dot updates
  useEffect(() => {
    let isMounted = true;
    const fetchNotifs = async () => {
      try {
        const list = await fetchCustomerNotificationsApi();
        if (isMounted) setNotifications(list);
      } catch (_e) {}
    };

    fetchNotifs();
    const interval = setInterval(fetchNotifs, 10000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const unreadNotifCount = notifications.filter((n) => !n.isRead).length;

  const handleOpenNotifications = () => {
    setShowNotificationScreen(true);
  };

  const handleBellPress = () => {
    if (onNotificationPress) {
      try { onNotificationPress(); } catch (_e) {}
    }
    handleOpenNotifications();
  };

  const handleMarkNotifRead = async (id: string) => {
    await markNotificationAsReadApi(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const handleMarkAllNotifsRead = async () => {
    await markAllNotificationsAsReadApi();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const customerId = dashboardData?.user?.customerId;
  const { vehicles, addVehicle, updateVehicle, removeVehicle, isRemoving } = useCustomerVehicles(customerId);
  const { handleLogout } = useProfileState();
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
  const primaryVehicle = vehicles.length > 0 ? vehicles[0] : null;
  const activeVehicle = selectedVehicle || primaryVehicle;

  const { data: jobCards } = useActiveJobCard(customerId);
  const { data: appointments } = useCustomerAppointments(customerId);

  const handleAddVehicle = async (payload: any) => {
    await addVehicle(payload);
    setShowAddVehicleModal(false);
    setSuccessModalData({
      visible: true,
      title: 'Vehicle Registered Successfully',
      message: 'Your vehicle has been successfully added to your garage.',
    });
  };

  const handleUpdateVehicle = async (vehicleId: string, payload: any) => {
    await updateVehicle(vehicleId, payload);
    setSuccessModalData({
      visible: true,
      title: 'Vehicle Updated Successfully',
      message: 'Your vehicle details have been updated successfully.',
    });
  };

  const handleConfirmRemoveVehicle = async () => {
    if (activeVehicle?.id) {
      try {
        await removeVehicle(activeVehicle.id);
      } catch (e) {
        console.error(e);
      }
    }
    setShowRemoveVehicleModal(false);
    setSelectedVehicle(null);
    setActiveTab('HOME');
  };

  const handleConfirmLogout = () => {
    setShowLogoutConfirmModal(false);
    handleLogout();
  };

  // Find active job card or fallback to virtual job card from active appointment
  const getActiveJobCardOrVirtual = () => {
    if (jobCards && jobCards.length > 0) {
      const activeJC = jobCards.find(jc => jc.status !== 'delivered' && jc.status !== 'cancelled');
      if (activeJC) return activeJC;
    }

    if (appointments && appointments.length > 0) {
      const activeAppt = appointments.find(appt => 
        appt.status === 'confirmed' || 
        appt.status === 'requested' || 
        appt.status === 'rescheduled' || 
        appt.status === 'checked_in'
      );
      if (activeAppt) {
        return {
          jobCardId: activeAppt.appointmentId || '',
          jobNumber: activeAppt.apptNumber,
          customerId: activeAppt.customerId,
          vehicleId: activeAppt.vehicleId,
          appointmentId: activeAppt.appointmentId,
          appointment: {
            appointmentId: activeAppt.appointmentId,
            apptNumber: activeAppt.apptNumber,
            scheduledAt: activeAppt.scheduledAt,
          },
          status: 'open' as const,
          jobType: activeAppt.jobType,
          priority: 'normal' as const,
          openedAt: activeAppt.scheduledAt,
          center: activeAppt.center,
          vehicle: activeAppt.vehicle,
        };
      }
    }

    return null;
  };

  const activeJobCard = getActiveJobCardOrVirtual();

  const renderTabContent = () => {
    switch (activeTab) {
      case 'JOBCARD':
        return (
          <JobCardTrackerScreen
            jobCard={activeJobCard || undefined}
            onBack={() => setActiveTab('HOME')}
          />
        );
      case 'VEHICLES':
        if (!activeVehicle && vehicles.length === 0) {
          setShowAddVehicleModal(true);
          setActiveTab('HOME');
          return null;
        }
        return (
          <VehicleDetailsScreen
            vehicle={activeVehicle}
            onBack={() => {
              setSelectedVehicle(null);
              setActiveTab('HOME');
            }}
            onAddVehicle={handleAddVehicle}
            onUpdateVehicle={handleUpdateVehicle}
            onRemoveVehicle={() => setShowRemoveVehicleModal(true)}
          />
        );
      case 'BOOK':
        return (
          <ServiceBookingFlow
            vehicleId={dashboardData?.vehicle?.id}
            customerId={dashboardData?.user?.customerId}
            onGoHome={() => setActiveTab('HOME')}
            onTrackStatus={() => setActiveTab('JOBCARD')}
          />
        );
      case 'PROFILE':
        return (
          <ProfileTabFlow
            onGoToBooking={() => setActiveTab('BOOK')}
            onLogoutRequest={() => setShowLogoutConfirmModal(true)}
          />
        );
      case 'HOME':
      default:
        return (
          <>
            {/* 1. Vehicle Status Card with Add Vehicle Button */}
            <View>
              <VehicleStatusCard
                vehicle={dashboardData?.vehicle}
                vehicles={vehicles}
                onAddVehiclePress={() => setShowAddVehicleModal(true)}
                onSelectVehicle={(v) => {
                  setSelectedVehicle(v);
                  setActiveTab('VEHICLES');
                }}
              />
            </View>

            {/* 2. Job Card Status Summary or No Active Job Card Empty State */}
            {activeJobCard ? (
              <TouchableOpacity 
                style={styles.jobTrackingCard}
                onPress={() => setActiveTab('JOBCARD')}
                activeOpacity={0.85}
              >
                <View style={styles.jobCardHeaderRow}>
                  <View style={styles.wrenchIconBg}>
                    <Feather name="settings" size={18} color="#4d6a00" />
                  </View>
                  <View style={styles.jobCardTextContainer}>
                    <Text style={styles.jobCardLabel}>ACTIVE JOB CARD IN-WORKSHOP</Text>
                    <Text style={styles.jobCardTitle}>
                      {activeJobCard.jobNumber}
                    </Text>
                    <Text style={styles.jobCardDesc}>
                      Your vehicle is at {activeJobCard.status === 'quality_check' ? 'Quality QA check stage.' : 'Repairs & parts fitting stage.'}
                    </Text>
                  </View>
                  <Feather name="chevron-right" size={20} color="#71717a" />
                </View>
                <View style={styles.progressContainer}>
                  <View style={styles.progressBarBg}>
                    <View style={[styles.progressBarFill, { width: activeJobCard.status === 'quality_check' ? '80%' : '55%' }]} />
                  </View>
                  <Text style={styles.progressText}>
                    {activeJobCard.status === 'quality_check' ? 'QA inspection in progress' : 'Repairs in progress'}
                  </Text>
                </View>
              </TouchableOpacity>
            ) : (
              <NoActiveJobCardCard onBookServicePress={() => setActiveTab('BOOK')} />
            )}

            {/* 2. Quick Actions Grid */}
            <QuickActionsGrid
              onBookService={() => {
                setActiveTab('BOOK');
                if (onBookService) onBookService();
              }}
              onLiveTracking={() => {
                setActiveTab('JOBCARD');
                if (onTrackService) onTrackService();
              }}
              onEmergencyRsa={() => {
                // Emergency RSA Action without Alert
              }}
            />

            {/* 3. Recent Activity Card */}
            <RecentActivityCard
              activities={dashboardData?.recentActivities}
            />

            {/* 4. Battery Percentage & Range Card with Real Odometer Metrics */}
            <BatteryRangeCard
              batteryPct={primaryVehicle?.batteryHealthPct ?? dashboardData?.vehicle?.batteryHealthPct}
              rangeKm={primaryVehicle?.currentRangeKm ?? dashboardData?.vehicle?.currentRangeKm}
              odometerKm={primaryVehicle?.odometerKm ?? (primaryVehicle as any)?.odometer_km ?? (dashboardData?.vehicle as any)?.odometerKm ?? (dashboardData?.vehicle as any)?.odometer_km}
            />

            {/* Vehicle Add Modal */}
            <AddVehicleModal
              visible={showAddVehicleModal}
              onClose={() => setShowAddVehicleModal(false)}
              onAddVehicle={handleAddVehicle}
            />
          </>
        );
    }
  };

  if (showNotificationScreen) {
    return <NotificationScreen onBack={() => setShowNotificationScreen(false)} />;
  }

  return (
    <PortalLayout
      activeTab={activeTab === 'JOBCARD' ? 'HOME' : activeTab}
      onTabChange={(tab) => setActiveTab(tab)}
      user={dashboardData?.user}
      unreadCount={unreadNotifCount}
      refreshing={loading}
      onRefresh={refreshDashboard}
      onNotificationPress={handleBellPress}
      onProfilePress={onProfilePress}
    >
      {renderTabContent()}

      {/* Delete Vehicle Confirmation Modal */}
      <DeleteConfirmModal
        visible={showRemoveVehicleModal}
        title="Remove Vehicle"
        description="Are you sure you want to remove this vehicle from your profile? This action cannot be undone."
        confirmText="Remove Vehicle"
        cancelText="Cancel"
        loading={isRemoving}
        onConfirm={handleConfirmRemoveVehicle}
        onCancel={() => setShowRemoveVehicleModal(false)}
      />

      {/* Logout Confirmation Modal */}
      <DeleteConfirmModal
        visible={showLogoutConfirmModal}
        title="Log Out"
        description="Are you sure you want to log out of your EV CRM account?"
        confirmText="Log Out"
        cancelText="Cancel"
        onConfirm={handleConfirmLogout}
        onCancel={() => setShowLogoutConfirmModal(false)}
      />

      {/* Real-time Customer Notifications Modal */}
      <NotificationModal
        visible={showNotificationModal}
        onClose={() => setShowNotificationModal(false)}
        notifications={notifications}
        loading={loadingNotifications}
        onMarkRead={handleMarkNotifRead}
        onMarkAllRead={handleMarkAllNotifsRead}
      />

      {/* Vehicle Registration & Update Success Popup Modal */}
      <VehicleSuccessModal
        visible={successModalData.visible}
        title={successModalData.title}
        message={successModalData.message}
        onClose={() => setSuccessModalData((prev) => ({ ...prev, visible: false }))}
      />
    </PortalLayout>
  );
};

const styles = StyleSheet.create({
  jobTrackingCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
    borderColor: '#edf6d6',
    borderWidth: 1.5,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 3,
  },
  jobCardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  wrenchIconBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#edf6d6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  jobCardTextContainer: {
    flex: 1,
    paddingRight: 8,
  },
  jobCardLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#4d7c0f',
    letterSpacing: 0.8,
    fontFamily: 'PlusJakartaSans-Bold',
    marginBottom: 2,
  },
  jobCardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  jobCardDesc: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
    fontFamily: 'PlusJakartaSans-Regular',
  },
  progressContainer: {
    marginTop: 16,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: '#f1f5f9',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#a2e52c',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
    fontFamily: 'PlusJakartaSans-SemiBold',
  },
});

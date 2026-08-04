import React, { useState } from 'react';
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
import { useCustomerVehicles, VehicleDetailsScreen } from '../../myVehicles';
import {
  AccountScreen,
  EditProfileScreen,
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

interface ProfileTabFlowProps {
  onGoToBooking?: () => void;
}

const ProfileTabFlow: React.FC<ProfileTabFlowProps> = ({ onGoToBooking }) => {
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
    handleLogout,
  } = useProfileState();

  if (subView === 'EDIT_PROFILE') {
    return (
      <EditProfileScreen
        user={profile}
        saving={saving}
        onSave={handleSaveProfile}
        onBack={() => setSubView('ACCOUNT')}
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
        onLogout={handleLogout}
      />
    );
  }

  return (
    <AccountScreen
      user={profile}
      onOpenEditProfile={() => setSubView('EDIT_PROFILE')}
      onOpenServiceHistory={() => setSubView('SERVICE_HISTORY')}
      onOpenSupport={() => setSubView('SUPPORT_MAIN')}
      onOpenSettings={() => setSubView('SETTINGS')}
      onLogout={handleLogout}
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

  const customerId = dashboardData?.user?.customerId;
  const { vehicles, addVehicle } = useCustomerVehicles(customerId);
  const primaryVehicle = vehicles.length > 0 ? vehicles[0] : null;

  const { data: jobCards } = useActiveJobCard(customerId);
  const { data: appointments } = useCustomerAppointments(customerId);

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
          jobCardId: '',
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
          priority: 'normal',
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
        return (
          <VehicleDetailsScreen
            vehicle={primaryVehicle}
            onBack={() => setActiveTab('HOME')}
            onAddVehicle={async (payload) => { await addVehicle(payload); }}
            onRemoveVehicle={() => {
              import('react-native').then(({ Alert }) => {
                Alert.alert(
                  'Remove Vehicle',
                  'Are you sure you want to remove this vehicle from your garage?',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Remove', style: 'destructive', onPress: () => setActiveTab('HOME') },
                  ]
                );
              });
            }}
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
        return <ProfileTabFlow onGoToBooking={() => setActiveTab('BOOK')} />;
      case 'HOME':
      default:
        return (
          <>
            {/* 1. Vehicle Status Card (Tapping opens Vehicle Details Screen) */}
            <TouchableOpacity onPress={() => setActiveTab('VEHICLES')} activeOpacity={0.9}>
              <VehicleStatusCard
                vehicle={dashboardData?.vehicle}
                vehicles={vehicles}
              />
            </TouchableOpacity>

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
                import('react-native').then(({ Alert }) => {
                  Alert.alert(
                    'Emergency RSA',
                    'Roadside Assistance requested. A service team is being dispatched to your location.',
                    [{ text: 'OK' }]
                  );
                });
              }}
            />

            {/* 3. Recent Activity Card */}
            <RecentActivityCard
              activities={dashboardData?.recentActivities}
            />

            {/* 4. Battery Percentage & Range Card */}
            <BatteryRangeCard
              batteryPct={dashboardData?.vehicle.batteryHealthPct}
              rangeKm={dashboardData?.vehicle.currentRangeKm}
            />
          </>
        );
    }
  };

  return (
    <PortalLayout
      activeTab={activeTab === 'JOBCARD' ? 'HOME' : activeTab}
      onTabChange={(tab) => setActiveTab(tab)}
      user={dashboardData?.user}
      refreshing={loading}
      onRefresh={refreshDashboard}
      onNotificationPress={onNotificationPress}
      onProfilePress={onProfilePress}
    >
      {renderTabContent()}
    </PortalLayout>
  );
};

const styles = StyleSheet.create({
  tabContentBlock: {
    gap: 16,
  },
  tabHeading: {
    fontSize: 16,
    fontWeight: '700',
    color: '#18181b',
    marginBottom: 8,
  },
  profileHeaderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e6f0d8',
    borderRadius: 24,
    padding: 20,
    marginBottom: 8,
  },
  profileAvatarCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 18,
    borderWidth: 1,
    borderColor: '#c6d8b2',
  },
  profileMeta: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a2b0c',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  profileSubText: {
    fontSize: 14,
    color: '#7a8a6b',
    fontFamily: 'PlusJakartaSans-Regular',
    marginTop: 2,
  },
  customerBadge: {
    backgroundColor: '#a2e52c',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginTop: 6,
    alignSelf: 'flex-start',
  },
  customerBadgeText: {
    color: '#2e5b02',
    fontSize: 9,
    fontWeight: '800',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  detailsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    paddingVertical: 10,
    paddingHorizontal: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 10,
    elevation: 1,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  detailIcon: {
    marginRight: 16,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#9ca3af',
    letterSpacing: 0.5,
    fontFamily: 'PlusJakartaSans-Bold',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a2b0c',
    fontFamily: 'PlusJakartaSans-Medium',
  },
  rowDivider: {
    height: 1,
    backgroundColor: '#f4f4f5',
    width: '100%',
  },
  jobTrackingCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e4e4e7',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 10,
    elevation: 1,
  },
  jobCardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  wrenchIconBg: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#e6f0d8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  jobCardTextContainer: {
    flex: 1,
  },
  jobCardLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#4d6a00',
    letterSpacing: 0.5,
    fontFamily: 'PlusJakartaSans-Bold',
    marginBottom: 2,
  },
  jobCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1c1c1e',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  jobCardDesc: {
    fontSize: 12,
    color: '#71717a',
    fontFamily: 'PlusJakartaSans-Regular',
    marginTop: 2,
  },
  progressContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f4f4f5',
  },
  progressBarBg: {
    height: 6,
    backgroundColor: '#f4f4f5',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#95d03a',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 11,
    color: '#71717a',
    fontFamily: 'PlusJakartaSans-Regular',
  },
});

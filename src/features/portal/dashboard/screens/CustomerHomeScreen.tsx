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
import { JobCardTrackerScreen, NoActiveJobCardCard, useActiveJobCard, useCustomerAppointments, useCustomerRsaRequests, RsaTrackerScreen, JobCard } from '../../jobCard';
import { useCustomerVehicles, VehicleDetailsScreen, AddVehicleModal, VehicleSuccessModal } from '../../myVehicles';
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

const getJobCardProgress = (status: string) => {
  const s = status ? status.toLowerCase() : '';
  switch (s) {
    case 'open':
    case 'reopened':
      return { step: 1, totalSteps: 8, text: 'Job Card Opened', percent: 12.5 };
    case 'in_diagnosis':
      return { step: 2, totalSteps: 8, text: 'Vehicle Diagnostics', percent: 25 };
    case 'awaiting_approval':
      return { step: 3, totalSteps: 8, text: 'Awaiting Estimate Approval', percent: 37.5 };
    case 'awaiting_parts':
      return { step: 4, totalSteps: 8, text: 'Awaiting Spare Parts', percent: 50 };
    case 'in_progress':
      return { step: 5, totalSteps: 8, text: 'Repairs in Progress', percent: 62.5 };
    case 'quality_check':
      return { step: 6, totalSteps: 8, text: 'Quality QA Inspection', percent: 75 };
    case 'ready':
      return { step: 7, totalSteps: 8, text: 'Ready for Collection', percent: 87.5 };
    case 'delivered':
    case 'closed':
      return { step: 8, totalSteps: 8, text: 'Delivered', percent: 100 };
    default:
      return { step: 5, totalSteps: 8, text: 'Service in Progress', percent: 62.5 };
  }
};

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
  const [activeTab, setActiveTab] = useState<'HOME' | 'VEHICLES' | 'BOOK' | 'STORE' | 'PROFILE' | 'JOBCARD' | 'RSATRACKER' | 'LIVETRACKING'>('HOME');

  const [showAddVehicleModal, setShowAddVehicleModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [activeRsaRequestId, setActiveRsaRequestId] = useState('');
  const [selectedJobCard, setSelectedJobCard] = useState<JobCard | null>(null);

  const customerId = dashboardData?.user?.customerId;
  const { vehicles, addVehicle } = useCustomerVehicles(customerId);
  const primaryVehicle = vehicles.length > 0 ? vehicles[0] : null;

  const { data: jobCards } = useActiveJobCard(customerId);
  const { data: appointments } = useCustomerAppointments(customerId);
  const { data: rsaRequests } = useCustomerRsaRequests(customerId);

  const handleAddVehicle = async (payload: any) => {
    await addVehicle(payload);
    setShowAddVehicleModal(false);
    setShowSuccessModal(true);
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

  const getActiveRsaRequest = () => {
    if (rsaRequests && rsaRequests.length > 0) {
      const active = rsaRequests.find(r => r.status !== 'closed' && r.status !== 'cancelled' && r.status !== 'resolved');
      if (active) return active;
      if (rsaRequests[0].status !== 'closed' && rsaRequests[0].status !== 'cancelled') {
        return rsaRequests[0];
      }
    }
    return null;
  };

  const activeRsa = getActiveRsaRequest();

  const getActiveRsaStepNum = (rsa: any) => {
    if (!rsa) return 1;
    const s = (rsa.status || 'requested').toLowerCase();
    const hasAssign = rsa.assignments && rsa.assignments.length > 0;
    const isAssigned = Boolean(hasAssign || ['assigned', 'en_route', 'on_site', 'job_card_created', 'resolved', 'billed', 'closed'].includes(s));
    const isAccepted = Boolean((hasAssign && rsa.assignments[0]?.status === 'accepted') || ['en_route', 'on_site', 'job_card_created', 'resolved', 'billed', 'closed'].includes(s));
    const isEnroute = Boolean(['en_route', 'on_site', 'job_card_created', 'resolved', 'billed', 'closed'].includes(s));
    const isResolved = Boolean(['resolved', 'billed', 'closed'].includes(s));
    const isBilled = Boolean(rsa.isBilled || s === 'closed');
    const isClosed = Boolean(rsa.isClosed || s === 'closed');

    if (isClosed) return 7;
    if (isBilled) return 6;
    if (isResolved) return 5;
    if (isEnroute) return 4;
    if (isAccepted) return 3;
    if (isAssigned) return 2;
    return 1;
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'JOBCARD':
        return (
          <JobCardTrackerScreen
            jobCard={selectedJobCard || activeJobCard || undefined}
            onBack={() => {
              setSelectedJobCard(null);
              setActiveTab('HOME');
            }}
          />
        );
      case 'LIVETRACKING':
        return (
          <View style={styles.comingSoonContainer}>
            <View style={styles.comingSoonIconCircle}>
              <Feather name="map" size={36} color="#4d6a00" />
            </View>
            <Text style={styles.comingSoonTitle}>Live GPS Tracking</Text>
            <Text style={styles.comingSoonSubtitle}>
              We are working on integrating real-time GPS tracking for your vehicle pick-up and service van dispatches. You will be able to track your technician's exact live location on a map right here.
            </Text>
            <View style={styles.comingSoonBadge}>
              <Text style={styles.comingSoonBadgeText}>COMING SOON</Text>
            </View>
            <TouchableOpacity style={styles.comingSoonBackBtn} onPress={() => setActiveTab('HOME')} activeOpacity={0.8}>
              <Text style={styles.comingSoonBackText}>Back to Dashboard</Text>
            </TouchableOpacity>
          </View>
        );
      case 'VEHICLES':
        return (
          <VehicleDetailsScreen
            vehicle={primaryVehicle}
            onBack={() => setActiveTab('HOME')}
            onAddVehicle={handleAddVehicle}
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
            onTrackRsaStatus={(reqId) => {
              setActiveRsaRequestId(reqId);
              setActiveTab('RSATRACKER');
            }}
          />
        );
      case 'RSATRACKER':
        return (
          <RsaTrackerScreen
            requestId={activeRsaRequestId}
            onBack={() => setActiveTab('HOME')}
          />
        );
      case 'PROFILE':
        return <ProfileTabFlow onGoToBooking={() => setActiveTab('BOOK')} />;
      case 'HOME':
      default:
        return (
          <>
            {/* 1. Vehicle Status Card with Add Vehicle Button */}
            <TouchableOpacity onPress={() => setActiveTab('VEHICLES')} activeOpacity={0.9}>
              <VehicleStatusCard
                vehicle={dashboardData?.vehicle}
                vehicles={vehicles}
                onAddVehiclePress={() => setShowAddVehicleModal(true)}
              />
            </TouchableOpacity>

            {/* 2. Active RSA Request Status Summary Card */}
            {activeRsa ? (
              <TouchableOpacity 
                style={styles.rsaTrackingCard}
                onPress={() => {
                  setActiveRsaRequestId(activeRsa.requestId);
                  setActiveTab('RSATRACKER');
                }}
                activeOpacity={0.85}
              >
                <View style={styles.jobCardHeaderRow}>
                  <View style={styles.rsaIconBg}>
                    <Feather name="truck" size={18} color="#991b1b" />
                  </View>
                  <View style={styles.jobCardTextContainer}>
                    <Text style={styles.rsaLabel}>ACTIVE ROADSIDE PICKUP</Text>
                    <Text style={styles.jobCardTitle}>
                      {activeRsa.requestNumber || `REQ-${activeRsa.requestId.slice(0, 8).toUpperCase()}`}
                    </Text>
                    <Text style={styles.jobCardDesc}>
                      Your pickup request for {activeRsa.issueType.replace(/_/g, ' ')} is {activeRsa.status.replace(/_/g, ' ').toUpperCase()}.
                    </Text>
                  </View>
                  <Feather name="chevron-right" size={20} color="#71717a" />
                </View>
                <View style={styles.progressContainer}>
                  <View style={styles.progressBarBg}>
                    <View style={[styles.rsaProgressBarFill, { width: `${(getActiveRsaStepNum(activeRsa) / 7) * 100}%` }]} />
                  </View>
                  <Text style={styles.progressText}>
                    Step {getActiveRsaStepNum(activeRsa)} of 7 • {activeRsa.status.replace(/_/g, ' ').toUpperCase()}
                  </Text>
                </View>
              </TouchableOpacity>
            ) : null}

            {/* 3. Job Card Status Summary or No Active Job Card Empty State */}
            {activeJobCard ? (() => {
              const progress = getJobCardProgress(activeJobCard.status);
              return (
                <TouchableOpacity 
                  style={styles.jobTrackingCard}
                  onPress={() => {
                    setSelectedJobCard(activeJobCard);
                    setActiveTab('JOBCARD');
                  }}
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
                        Your vehicle status: {progress.text}.
                      </Text>
                    </View>
                    <Feather name="chevron-right" size={20} color="#71717a" />
                  </View>
                  <View style={styles.progressContainer}>
                    <View style={styles.progressBarBg}>
                      <View style={[styles.progressBarFill, { width: `${progress.percent}%` }]} />
                    </View>
                    <Text style={styles.progressText}>
                      Step {progress.step} of {progress.totalSteps} • {progress.text} ({progress.percent}%)
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })() : (!activeRsa ? (
              <NoActiveJobCardCard onBookServicePress={() => setActiveTab('BOOK')} />
            ) : null)}

            {/* 2. Quick Actions Grid */}
            <QuickActionsGrid
              onBookService={() => {
                setActiveTab('BOOK');
              }}
              onLiveTracking={() => {
                setActiveTab('LIVETRACKING');
              }}
            />

            {/* 3. Recent Activity Card */}
            <RecentActivityCard
              activities={dashboardData?.recentActivities}
              onActivityPress={(activity) => {
                // Find the job card matching this activity from the jobCards list
                const foundJobCard = jobCards?.find(
                  (jc) => jc.jobCardId === activity.id || jc.jobNumber === activity.title.split(': ')[1]
                );
                
                if (foundJobCard) {
                  setSelectedJobCard(foundJobCard);
                  setActiveTab('JOBCARD');
                }
              }}
            />

            {/* 4. Battery Percentage & Range Card with Real Metrics */}
            <BatteryRangeCard
              batteryPct={primaryVehicle?.batteryHealthPct ?? dashboardData?.vehicle?.batteryHealthPct}
              rangeKm={primaryVehicle?.currentRangeKm ?? dashboardData?.vehicle?.currentRangeKm}
              odometerKm={primaryVehicle?.odometerKm ?? (dashboardData?.vehicle as any)?.odometerKm}
            />

            {/* Vehicle Modals */}
            <AddVehicleModal
              visible={showAddVehicleModal}
              onClose={() => setShowAddVehicleModal(false)}
              onAddVehicle={handleAddVehicle}
            />

            <VehicleSuccessModal
              visible={showSuccessModal}
              onClose={() => setShowSuccessModal(false)}
              title="Vehicle Registered Successfully"
              message="Your vehicle has been successfully added to your garage."
            />
          </>
        );
    }
  };

  return (
    <PortalLayout
      activeTab={(activeTab === 'JOBCARD' || activeTab === 'RSATRACKER' || activeTab === 'LIVETRACKING') ? 'HOME' : activeTab as any}
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
  rsaTrackingCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#fca5a5',
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 1,
  },
  rsaIconBg: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#fee2e2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rsaLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#ef4444',
    letterSpacing: 0.5,
    fontFamily: 'PlusJakartaSans-Bold',
    marginBottom: 2,
  },
  rsaProgressBarFill: {
    height: '100%',
    backgroundColor: '#ef4444',
    borderRadius: 3,
  },
  comingSoonContainer: {
    flex: 1,
    backgroundColor: '#faf9f6',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    minHeight: 400,
  },
  comingSoonIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#e6f0d8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#c6d8b2',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 10,
    elevation: 2,
  },
  comingSoonTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1a2b0c',
    fontFamily: 'PlusJakartaSans-Bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  comingSoonSubtitle: {
    fontSize: 14,
    color: '#71717a',
    fontFamily: 'PlusJakartaSans-Regular',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  comingSoonBadge: {
    backgroundColor: '#a2e52c',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 32,
  },
  comingSoonBadgeText: {
    color: '#2e5b02',
    fontSize: 11,
    fontWeight: '800',
    fontFamily: 'PlusJakartaSans-Bold',
    letterSpacing: 0.5,
  },
  comingSoonBackBtn: {
    backgroundColor: '#1a2b0c',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 1,
  },
  comingSoonBackText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
    fontFamily: 'PlusJakartaSans-Bold',
  },
});

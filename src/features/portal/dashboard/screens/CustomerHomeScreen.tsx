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
import { JobCardTrackerScreen, NoActiveJobCardCard, useActiveJobCard, useCustomerAppointments, useCustomerRsaRequests, RsaTrackerScreen, JobCard } from '../../jobCard';
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
  const [activeTab, setActiveTab] = useState<'HOME' | 'VEHICLES' | 'BOOK' | 'STORE' | 'PROFILE' | 'JOBCARD' | 'RSATRACKER' | 'LIVETRACKING'>('HOME');

  const [showAddVehicleModal, setShowAddVehicleModal] = useState(false);
  const [activeRsaRequestId, setActiveRsaRequestId] = useState('');
  const [selectedJobCard, setSelectedJobCard] = useState<JobCard | null>(null);

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
  const { data: rsaRequests } = useCustomerRsaRequests(customerId);

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
              {"We are working on integrating real-time GPS tracking for your vehicle pick-up and service van dispatches. You will be able to track your technician's exact live location on a map right here."}
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
                if (onTrackService) onTrackService();
              }}
              onOrderParts={onSpareParts}
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
      activeTab={(activeTab === 'JOBCARD' || activeTab === 'RSATRACKER' || activeTab === 'LIVETRACKING') ? 'HOME' : activeTab as any}
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

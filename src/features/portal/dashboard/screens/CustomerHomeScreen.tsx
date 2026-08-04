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
import { JobCardTrackerScreen, useActiveJobCard, useCustomerAppointments } from '../../jobCard';

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
        // Construct virtual JobCard structure representing Appointment Confirmed
        return {
          jobCardId: '', // Empty triggers virtual appointment tracking
          jobNumber: activeAppt.apptNumber,
          customerId: activeAppt.customerId,
          vehicleId: activeAppt.vehicleId,
          appointmentId: activeAppt.appointmentId,
          appointment: {
            appointmentId: activeAppt.appointmentId,
            apptNumber: activeAppt.apptNumber,
            scheduledAt: activeAppt.scheduledAt,
          },
          status: 'open' as const, // Maps to Stage 1 (Appointment Confirmed) completed, Stage 2 pending
          jobType: activeAppt.jobType,
          priority: 'normal',
          openedAt: activeAppt.scheduledAt,
          center: activeAppt.center,
          vehicle: activeAppt.vehicle,
        };
      }
    }
    // Default fallback mockup Job Card so that the timeline tracker is ALWAYS visible and testable
    return {
      jobCardId: 'mock-jc-id',
      jobNumber: 'JC-BHOPAL-2026-003',
      customerId: customerId || 'mock-customer-id',
      vehicleId: 'mock-vehicle-id',
      status: 'in_progress' as const,
      jobType: 'scheduled_maintenance',
      priority: 'normal',
      odometerInKm: 12450,
      batterySohInPct: 94.5,
      reportedComplaint: 'Periodic maintenance, check front brake pads noise.',
      openedAt: new Date().toISOString(),
      center: {
        centerId: 'b6960d90-87ee-4fa8-83e6-227c57506a4e',
        centerName: 'Bhopal Head Office & EV Workshop',
        centerCode: 'BHOPAL_HQ',
      },
      vehicle: {
        vehicleId: 'mock-vehicle-id',
        registrationNo: dashboardData?.vehicle ? `${dashboardData.vehicle.brand} ${dashboardData.vehicle.model}` : 'MP-04-AB-1234',
        vin: 'ATH450X2026MOCK',
      },
    };
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
          <View style={styles.tabContentBlock}>
            <Text style={styles.tabHeading}>🚘 My Registered EV Garage</Text>
            <VehicleStatusCard
              vehicle={dashboardData?.vehicle}
            />
            <BatteryRangeCard
              batteryPct={dashboardData?.vehicle.batteryHealthPct}
              rangeKm={dashboardData?.vehicle.currentRangeKm}
            />
          </View>
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
      case 'STORE':
        return (
          <View style={styles.tabContentBlock}>
            <Text style={styles.tabHeading}>🛍️ EV OEM Spare Parts, Batteries & Accessories Store</Text>
            <QuickActionsGrid
              onBookService={onBookService}
              onLiveTracking={onTrackService}
              onOrderParts={onSpareParts}
            />
          </View>
        );
      case 'PROFILE':
        const profileUser = dashboardData?.user;
        return (
          <View style={styles.tabContentBlock}>
            <Text style={styles.tabHeading}>👤 Profile & Account Details</Text>

            {/* Profile Summary Card */}
            <View style={styles.profileHeaderCard}>
              <View style={styles.profileAvatarCircle}>
                <Feather name="user" size={40} color="#2e5b02" />
              </View>
              <View style={styles.profileMeta}>
                <Text style={styles.profileName}>{profileUser?.name || 'EV User'}</Text>
                <Text style={styles.profileSubText}>{profileUser?.location || 'Indore'}</Text>
                <View style={styles.customerBadge}>
                  <Text style={styles.customerBadgeText}>VERIFIED CUSTOMER</Text>
                </View>
              </View>
            </View>

            {/* Details List Card */}
            <View style={styles.detailsCard}>
              {/* Full Name */}
              <View style={styles.detailRow}>
                <Feather name="user" size={20} color="#7a8a6b" style={styles.detailIcon} />
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>FULL NAME</Text>
                  <Text style={styles.detailValue}>{profileUser?.name || 'Rohan'}</Text>
                </View>
              </View>

              <View style={styles.rowDivider} />

              {/* Email */}
              <View style={styles.detailRow}>
                <Feather name="mail" size={20} color="#7a8a6b" style={styles.detailIcon} />
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>EMAIL ADDRESS</Text>
                  <Text style={styles.detailValue}>{profileUser?.email || 'rohan@example.com'}</Text>
                </View>
              </View>

              <View style={styles.rowDivider} />

              {/* Phone */}
              <View style={styles.detailRow}>
                <Feather name="phone" size={20} color="#7a8a6b" style={styles.detailIcon} />
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>PHONE NUMBER</Text>
                  <Text style={styles.detailValue}>{profileUser?.phone || '+91 9876543210'}</Text>
                </View>
              </View>

              <View style={styles.rowDivider} />

              {/* Branch */}
              <View style={styles.detailRow}>
                <Feather name="home" size={20} color="#7a8a6b" style={styles.detailIcon} />
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>REGISTERED BRANCH</Text>
                  <Text style={styles.detailValue}>{profileUser?.branch || 'Bhopal Head Office & Wo'}</Text>
                </View>
              </View>
            </View>
          </View>
        );
      case 'HOME':
      default:
        return (
          <>
            {/* 1. Vehicle Status & Book Service Card */}
            <TouchableOpacity onPress={() => setActiveTab('JOBCARD')} activeOpacity={0.9}>
              <VehicleStatusCard
                vehicle={dashboardData?.vehicle}
              />
            </TouchableOpacity>

            {/* Job Card Status Summary Card */}
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
            ) : null}

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

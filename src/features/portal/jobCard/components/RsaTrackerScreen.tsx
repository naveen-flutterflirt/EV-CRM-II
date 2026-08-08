import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Platform,
  Linking
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRsaRequestDetails } from '../hooks/useJobCards';

interface RsaTrackerScreenProps {
  requestId: string;
  onBack: () => void;
}

export const RsaTrackerScreen: React.FC<RsaTrackerScreenProps> = ({
  requestId,
  onBack,
}) => {
  const { data: request, isLoading, error } = useRsaRequestDetails(requestId);
  const [expandedStep, setExpandedStep] = useState<number | null>(null);

  // Compute status conditions matching ERP LifecycleTracker
  const status = (request?.status || 'requested').toLowerCase();
  const assignment = request?.assignments?.[0];

  const isAssigned = Boolean(assignment || ['assigned', 'en_route', 'on_site', 'job_card_created', 'resolved', 'billed', 'closed'].includes(status));
  const isAccepted = Boolean((assignment && assignment.status === 'accepted') || ['en_route', 'on_site', 'job_card_created', 'resolved', 'billed', 'closed'].includes(status));
  const isEnroute = Boolean(['en_route', 'on_site', 'job_card_created', 'resolved', 'billed', 'closed'].includes(status));
  const isResolved = Boolean(['resolved', 'billed', 'closed'].includes(status));
  const isBilled = Boolean(request?.isBilled || status === 'closed');
  const isClosed = Boolean(request?.isClosed || status === 'closed');

  // Compute current active step (1 to 7)
  const getActiveRsaStep = (): number => {
    if (isClosed) return 7;
    if (isBilled) return 6;
    if (isResolved) return 5;
    if (isEnroute) return 4;
    if (isAccepted) return 3;
    if (isAssigned) return 2;
    return 1;
  };

  const currentStep = getActiveRsaStep();

  // Set initial expanded step to current active step
  useEffect(() => {
    if (currentStep) {
      setExpandedStep(currentStep);
    }
  }, [currentStep]);

  const handleCallTechnician = (phone: string) => {
    Linking.openURL(`tel:${phone}`).catch(() => {
      alert('Could not launch phone call application.');
    });
  };

  const formatTime = (isoString?: string) => {
    if (!isoString) return '--:--';
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    } catch {
      return '--:--';
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#95d03a" />
        <Text style={styles.loadingText}>Fetching RSA Request status...</Text>
      </View>
    );
  }

  if (error || !request) {
    return (
      <View style={styles.errorContainer}>
        <Feather name="alert-triangle" size={48} color="#ef4444" />
        <Text style={styles.errorTitle}>Failed to Load Status</Text>
        <Text style={styles.errorText}>We couldn't retrieve the roadside assistance details.</Text>
        <TouchableOpacity style={styles.errorBackButton} onPress={onBack}>
          <Text style={styles.errorBackButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Visual text for step descriptors
  const getFriendlyStatusText = () => {
    switch (status) {
      case 'requested': return 'Roadside Assistance Request logged';
      case 'validated': return 'Request validated by dispatcher';
      case 'assigned': return 'Dispatcher assigned recovery team';
      case 'en_route': return 'Technician dispatched and en-route';
      case 'on_site': return 'Technician on-site repairing vehicle';
      case 'job_card_created': return 'Technician on-site repairing vehicle';
      case 'resolved': return 'Breakdown resolved successfully';
      case 'towed': return 'Vehicle towed to service center';
      case 'closed': return 'RSA request completed and closed';
      default: return status.replace(/_/g, ' ').toUpperCase();
    }
  };

  const stepsData = [
    {
      id: 1,
      title: 'Requested',
      completed: true,
      time: formatTime(request.requestedAt || request.createdAt),
      description: 'Your doorstep pickup/emergency recovery request has been logged in the system.',
      content: (
        <View style={styles.stepDetails}>
          <Text style={styles.detailText}>• Channel: Mobile App SOS</Text>
          <Text style={styles.detailText}>• Issue Type: {request.issueType?.replace(/_/g, ' ').toUpperCase()}</Text>
          {request.issueDescription ? (
            <Text style={styles.detailText}>• Notes: "{request.issueDescription}"</Text>
          ) : null}
        </View>
      ),
    },
    {
      id: 2,
      title: 'Assigned',
      completed: isAssigned,
      time: isAssigned ? formatTime(assignment?.createdAt) : '--:--',
      description: 'Technician and recovery van assigned to your location.',
      content: (
        <View style={styles.stepDetails}>
          {assignment ? (
            <>
              <Text style={styles.detailText}>• Dispatch: {assignment.technician?.firstName} {assignment.technician?.lastName}</Text>
              <Text style={styles.detailText}>• Service Van: {assignment.van?.vanCode} ({assignment.van?.makeModel})</Text>
              <Text style={styles.detailText}>• Est. Dispatch: {assignment.etaMinutes ? `${assignment.etaMinutes} mins` : 'N/A'}</Text>
            </>
          ) : (
            <Text style={styles.detailText}>Awaiting technician scheduling from operations center...</Text>
          )}
        </View>
      ),
    },
    {
      id: 3,
      title: 'Accepted',
      completed: isAccepted,
      time: isAccepted ? formatTime(assignment?.updatedAt) : '--:--',
      description: 'Recovery team accepted dispatch and preparing toolkit.',
      content: (
        <View style={styles.stepDetails}>
          {isAccepted ? (
            <>
              <Text style={styles.detailText}>Technician confirmed dispatch job.</Text>
              {assignment?.technician?.phone ? (
                <TouchableOpacity
                  style={styles.callContactButton}
                  onPress={() => handleCallTechnician(assignment.technician!.phone)}
                >
                  <Feather name="phone" size={12} color="#4d6a00" style={{ marginRight: 6 }} />
                  <Text style={styles.callContactText}>Call Technician</Text>
                </TouchableOpacity>
              ) : null}
            </>
          ) : (
            <Text style={styles.detailText}>Waiting for technician job acceptance...</Text>
          )}
        </View>
      ),
    },
    {
      id: 4,
      title: 'Enroute',
      completed: isEnroute,
      time: isEnroute ? formatTime(request.enrouteAt || assignment?.updatedAt) : '--:--',
      description: 'Technician is travelling to your breakdown coordinates.',
      content: (
        <View style={styles.stepDetails}>
          {isEnroute ? (
            <>
              <Text style={styles.detailText}>Technician is driving to your location.</Text>
              <Text style={styles.detailText}>• Breakdown Address: {request.breakdownAddress || 'N/A'}</Text>
            </>
          ) : (
            <Text style={styles.detailText}>Dispatched vehicle enroute indicator...</Text>
          )}
        </View>
      ),
    },
    {
      id: 5,
      title: 'Resolved',
      completed: isResolved,
      time: isResolved ? formatTime(request.resolvedAt) : '--:--',
      description: 'On-site repairs complete, vehicle recovered successfully.',
      content: (
        <View style={styles.stepDetails}>
          {isResolved ? (
            <Text style={styles.detailText}>On-site troubleshooting resolved the breakdown. Vehicle is ready to drive or towed.</Text>
          ) : (
            <Text style={styles.detailText}>Awaiting service closure report...</Text>
          )}
        </View>
      ),
    },
    {
      id: 6,
      title: 'Billed',
      completed: isBilled,
      time: isBilled ? formatTime(request.updatedAt) : '--:--',
      description: 'Service charges and diagnostic invoice logged.',
      content: (
        <View style={styles.stepDetails}>
          {isBilled ? (
            <Text style={styles.detailText}>RSA Invoice generated and synced to dashboard profile.</Text>
          ) : (
            <Text style={styles.detailText}>Awaiting invoice processing...</Text>
          )}
        </View>
      ),
    },
    {
      id: 7,
      title: 'Closed',
      completed: isClosed,
      time: isClosed ? formatTime(request.closedAt || request.updatedAt) : '--:--',
      description: 'RSA request successfully completed and archived.',
      content: (
        <View style={styles.stepDetails}>
          {isClosed ? (
            <Text style={styles.detailText}>This roadside recovery ticket is closed.</Text>
          ) : (
            <Text style={styles.detailText}>Awaiting final sign-off...</Text>
          )}
        </View>
      ),
    },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Feather name="arrow-left" size={20} color="#18181b" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Roadside Assist Tracker</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Status Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={styles.sirenIconBg}>
              <Feather name="alert-triangle" size={18} color="#7f1d1d" />
            </View>
            <View style={styles.summaryTextContainer}>
              <Text style={styles.summaryLabel}>Emergency SOS Request</Text>
              <Text style={styles.summaryNumber}>
                {request.requestNumber || `REQ-${request.requestId.slice(0, 8).toUpperCase()}`}
              </Text>
              <Text style={styles.summaryStatusText}>{getFriendlyStatusText()}</Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBarBg}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${(Math.min(currentStep, 7) / 7) * 100}%` }
                ]}
              />
            </View>
            <Text style={styles.progressPercentageText}>
              Step {currentStep} of 7 • {Math.round((Math.min(currentStep, 7) / 7) * 100)}% Complete
            </Text>
          </View>
        </View>

        {/* Steps Stepper List */}
        <Text style={styles.timelineTitle}>DISPATCH & RECOVERY LIFECYCLE</Text>

        <View style={styles.stepperContainer}>
          {stepsData.map((step, index) => {
            const isActive = step.id === currentStep;
            const isCompleted = step.completed && !isActive;
            const isPending = !step.completed;
            const isExpanded = expandedStep === step.id;

            return (
              <View key={step.id} style={styles.stepContainer}>
                {/* Visual Line & Dot */}
                <View style={styles.stepLeftColumn}>
                  <View
                    style={[
                      styles.stepDot,
                      isCompleted && styles.dotCompleted,
                      isActive && styles.dotActive,
                      isPending && styles.dotPending,
                    ]}
                  >
                    {isCompleted ? (
                      <Feather name="check" size={12} color="#ffffff" />
                    ) : (
                      <Text
                        style={[
                          styles.dotText,
                          isActive && styles.dotTextActive,
                          isPending && styles.dotTextPending,
                        ]}
                      >
                        {step.id}
                      </Text>
                    )}
                  </View>
                  {index < stepsData.length - 1 && (
                    <View
                      style={[
                        styles.stepLine,
                        step.completed && stepsData[index + 1].completed && styles.lineCompleted,
                      ]}
                    />
                  )}
                </View>

                {/* Step Details & Accordion */}
                <View style={styles.stepRightColumn}>
                  <TouchableOpacity
                    style={styles.stepHeaderRow}
                    activeOpacity={0.7}
                    onPress={() => step.completed && setExpandedStep(isExpanded ? null : step.id)}
                    disabled={!step.completed}
                  >
                    <View style={styles.stepTextContent}>
                      <Text
                        style={[
                          styles.stepTitle,
                          isActive && styles.stepTitleActive,
                          isPending && styles.stepTitlePending,
                        ]}
                      >
                        {step.title}
                      </Text>
                      <Text style={styles.stepDescription}>{step.description}</Text>
                    </View>
                    <View style={styles.stepTimeRow}>
                      <Text style={styles.stepTimeText}>{step.time}</Text>
                      {step.completed && (
                        <Feather
                          name={isExpanded ? 'chevron-up' : 'chevron-down'}
                          size={14}
                          color="#71717a"
                          style={{ marginLeft: 6 }}
                        />
                      )}
                    </View>
                  </TouchableOpacity>

                  {/* Accordion Expandable Content */}
                  {isExpanded && step.completed && (
                    <View style={styles.expandedContentBox}>{step.content}</View>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#faf9f6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 48 : 20,
    paddingBottom: 16,
    paddingHorizontal: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f4f4f5',
  },
  backButton: {
    marginRight: 16,
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#18181b',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  scrollContent: {
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#faf9f6',
  },
  loadingText: {
    fontSize: 14,
    color: '#71717a',
    marginTop: 12,
    fontFamily: 'PlusJakartaSans-Regular',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#faf9f6',
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#18181b',
    fontFamily: 'PlusJakartaSans-Bold',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 13,
    color: '#71717a',
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'PlusJakartaSans-Regular',
  },
  errorBackButton: {
    backgroundColor: '#95d03a',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  errorBackButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },
  summaryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e4e4e7',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 1,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  sirenIconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fee2e2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  summaryTextContainer: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#991b1b',
    letterSpacing: 1,
    fontFamily: 'PlusJakartaSans-Bold',
  },
  summaryNumber: {
    fontSize: 16,
    fontWeight: '800',
    color: '#18181b',
    fontFamily: 'PlusJakartaSans-Bold',
    marginVertical: 4,
  },
  summaryStatusText: {
    fontSize: 13,
    color: '#71717a',
    fontFamily: 'PlusJakartaSans-Regular',
  },
  progressContainer: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f4f4f5',
    paddingTop: 16,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: '#f4f4f5',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#ef4444',
  },
  progressPercentageText: {
    fontSize: 11,
    color: '#71717a',
    fontFamily: 'PlusJakartaSans-Medium',
    marginTop: 8,
  },
  timelineTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#71717a',
    letterSpacing: 1,
    fontFamily: 'PlusJakartaSans-Bold',
    marginBottom: 16,
  },
  stepperContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e4e4e7',
  },
  stepContainer: {
    flexDirection: 'row',
    minHeight: 64,
  },
  stepLeftColumn: {
    alignItems: 'center',
    marginRight: 16,
    width: 24,
  },
  stepDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    zIndex: 2,
  },
  dotCompleted: {
    backgroundColor: '#95d03a',
    borderColor: '#95d03a',
  },
  dotActive: {
    backgroundColor: '#ffffff',
    borderColor: '#ef4444',
  },
  dotPending: {
    backgroundColor: '#ffffff',
    borderColor: '#e4e4e7',
  },
  dotText: {
    fontSize: 11,
    fontWeight: '700',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  dotTextActive: {
    color: '#ef4444',
  },
  dotTextPending: {
    color: '#a1a1aa',
  },
  stepLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#f4f4f5',
    marginVertical: 4,
    zIndex: 1,
  },
  lineCompleted: {
    backgroundColor: '#95d03a',
  },
  stepRightColumn: {
    flex: 1,
    paddingBottom: 20,
  },
  stepHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  stepTextContent: {
    flex: 1,
    marginRight: 12,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#18181b',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  stepTitleActive: {
    color: '#ef4444',
  },
  stepTitlePending: {
    color: '#a1a1aa',
  },
  stepDescription: {
    fontSize: 12,
    color: '#71717a',
    fontFamily: 'PlusJakartaSans-Regular',
    marginTop: 2,
  },
  stepTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepTimeText: {
    fontSize: 11,
    color: '#a1a1aa',
    fontFamily: 'PlusJakartaSans-Medium',
  },
  expandedContentBox: {
    marginTop: 10,
    backgroundColor: '#faf9f6',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e4e4e7',
  },
  stepDetails: {
    gap: 4,
  },
  detailText: {
    fontSize: 12,
    color: '#27272a',
    fontFamily: 'PlusJakartaSans-Regular',
    lineHeight: 16,
  },
  callContactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5fad2',
    borderWidth: 1,
    borderColor: '#dcecc7',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  callContactText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4d6a00',
    fontFamily: 'PlusJakartaSans-Bold',
  },
});

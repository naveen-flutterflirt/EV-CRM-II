import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, ActivityIndicator, Modal, Dimensions, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useJobCardHistory, useJobCardInspections, useJobCardServices, useJobCardParts, useJobCardInvoice } from '../hooks/useJobCards';
import { JobCard } from '../types';

const { width } = Dimensions.get('window');

interface JobCardTrackerScreenProps {
  jobCard?: JobCard;
  onBack: () => void;
}

const getActiveStep = (status: string, jobCardId?: string, invoiceStatus?: string): number => {
  if (jobCardId === '') return 1;
  const s = status ? status.toLowerCase() : '';
  switch (s) {
    case 'open':
    case 'in_diagnosis':
      return 2; // Inspection
    case 'awaiting_parts':
      return 4; // Parts
    case 'awaiting_approval':
      return 5; // Estimate
    case 'in_progress':
    case 'quality_check':
      return 6; // In Progress
    case 'ready':
      if (invoiceStatus === 'paid') {
        return 9; // Close
      }
      if (invoiceStatus && invoiceStatus !== 'draft') {
        return 8; // payment
      }
      return 7; // invoice
    case 'delivered':
    case 'closed':
      return 10; // 10 means all 9 steps are complete
    default:
      return 3;
  }
};

export const JobCardTrackerScreen: React.FC<JobCardTrackerScreenProps> = ({
  jobCard,
  onBack,
}) => {
  const [expandedStep, setExpandedStep] = useState<number | null>(null);
  const [inspectionModalVisible, setInspectionModalVisible] = useState(false);

  const jobCardId = jobCard?.jobCardId;
  const isMock = jobCardId === 'mock-jc-id';

  const { data: history, isLoading: loadingHistory } = useJobCardHistory(jobCardId);
  const { data: inspections, isLoading: loadingInspections } = useJobCardInspections(jobCardId);
  const { data: services, isLoading: loadingServices } = useJobCardServices(jobCardId);
  const { data: parts, isLoading: loadingParts } = useJobCardParts(jobCardId);
  const { data: invoice, isLoading: loadingInvoice } = useJobCardInvoice(jobCardId);

  useEffect(() => {
    if (jobCard) {
      setExpandedStep(getActiveStep(jobCard.status, jobCardId, invoice?.status));
    }
  }, [jobCardId, jobCard?.status, invoice?.status]);

  // If no job card is active, render a beautiful empty/not-found screen
  if (!jobCard) {
    return (
      <View style={styles.emptyScreenContainer}>
        <View style={styles.emptyIconCircle}>
          <Feather name="settings" size={32} color="#71717a" />
        </View>
        <Text style={styles.emptyTitle}>No Active Job Card</Text>
        <Text style={styles.emptySubtitle}>
          There are no active workshop services in progress for your registered vehicles. Once you check in your vehicle at a service center, you will be able to track live progress here.
        </Text>
        <TouchableOpacity style={styles.emptyBackBtn} onPress={onBack} activeOpacity={0.8}>
          <Text style={styles.emptyBackText}>Go Back to Dashboard</Text>
          <Feather name="arrow-right" size={18} color="#1a2b0c" />
        </TouchableOpacity>
      </View>
    );
  }

  const currentStep = getActiveStep(jobCard.status, jobCardId, invoice?.status);

  // Format dates cleanly
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleString('default', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
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

  const getStatusTimeFromHistory = (targetStatus: string): string => {
    if (!history || history.length === 0) return '--:--';
    const match = history.find((h: any) => h.newStatus.toLowerCase() === targetStatus.toLowerCase());
    return match ? formatTime(match.changedAt) : '--:--';
  };

  const getFriendlyJobCardStatusText = () => {
    switch (jobCard.status.toLowerCase()) {
      case 'open': return 'Job card opened and registered';
      case 'reopened': return 'Job card reopened';
      case 'in_diagnosis': return 'Vehicle diagnostics in progress';
      case 'awaiting_approval': return 'Estimate invoice awaiting approval';
      case 'awaiting_parts': return 'Awaiting spare parts sourcing';
      case 'in_progress': return 'Repairs and service in progress';
      case 'quality_check': return 'Quality QA checklist inspection';
      case 'ready': return 'Work complete and ready for delivery';
      case 'delivered': return 'Vehicle delivered to customer';
      case 'closed': return 'Job card closed and archived';
      case 'cancelled': return 'Job card cancelled';
      default: return jobCard.status.replace(/_/g, ' ').toUpperCase();
    }
  };

  const stepsData = [
    {
      id: 1,
      title: 'Appointment confirmed',
      description: 'Your service slot is scheduled and reserved.',
      time: jobCard.appointment ? formatTime(jobCard.appointment.scheduledAt) : formatTime(jobCard.openedAt),
      completed: true,
      renderDetails: () => (
        <View style={styles.detailsBox}>
          {jobCard.appointment ? (
            <>
              <Text style={styles.detailsLabel}>APPOINTMENT ID</Text>
              <Text style={styles.detailsVal}>{jobCard.appointment.apptNumber}</Text>
              
              <Text style={styles.detailsLabel}>BOOKED BRANCH</Text>
              <Text style={styles.detailsVal}>{jobCard.center?.centerName || 'Service Center'}</Text>
              
              <Text style={styles.detailsLabel}>SCHEDULED TIME</Text>
              <Text style={styles.detailsVal}>{formatDate(jobCard.appointment.scheduledAt)}</Text>
            </>
          ) : (
            <Text style={styles.emptyStepDetailsText}>No appointment linked (Walk-in check-in).</Text>
          )}
        </View>
      ),
    },
    {
      id: 2,
      title: 'Inspection',
      description: 'Service advisor logging reported complaints & starting electronic diagnostics check.',
      time: getStatusTimeFromHistory('in_diagnosis') !== '--:--' ? getStatusTimeFromHistory('in_diagnosis') : getStatusTimeFromHistory('open'),
      completed: currentStep >= 2,
      renderDetails: () => (
        <View style={styles.detailsBox}>
          <Text style={styles.detailsLabel}>SERVICE ADVISOR</Text>
          <Text style={styles.detailsVal}>
            {jobCard.serviceAdvisor 
              ? `${jobCard.serviceAdvisor.firstName} ${jobCard.serviceAdvisor.lastName}` 
              : 'Not assigned'}
          </Text>

          <Text style={styles.detailsLabel}>REPORTED COMPLAINTS</Text>
          <Text style={styles.detailsVal}>{jobCard.reportedComplaint || 'No complaints logged.'}</Text>
          
          <Text style={styles.detailsLabel}>DIAGNOSTICS CHECKLIST</Text>
          {loadingInspections ? (
            <ActivityIndicator size="small" color="#95d03a" style={{ alignSelf: 'flex-start', marginVertical: 4 }} />
          ) : inspections && inspections.length > 0 && !isMock ? (
            inspections.map((ins: any) => (
              <View key={ins.inspectionId} style={styles.listItem}>
                <Feather 
                  name={ins.result === 'passed' ? 'check' : (ins.result === 'warning' ? 'alert-triangle' : 'x')} 
                  size={13} 
                  color={ins.result === 'passed' ? '#95d03a' : (ins.result === 'warning' ? '#eab308' : '#ef4444')} 
                />
                <Text style={styles.listItemText}>{ins.checkpoint} ({ins.result})</Text>
              </View>
            ))
          ) : isMock ? (
            <>
              <View style={styles.listItem}>
                <Feather name="check" size={13} color="#95d03a" />
                <Text style={styles.listItemText}>Braking efficiency verification (passed)</Text>
              </View>
              <View style={styles.listItem}>
                <Feather name="check" size={13} color="#95d03a" />
                <Text style={styles.listItemText}>Software diagnostic logs check (passed)</Text>
              </View>
              <View style={styles.listItem}>
                <Feather name="check" size={13} color="#95d03a" />
                <Text style={styles.listItemText}>Charger port connection lock test (passed)</Text>
              </View>
            </>
          ) : (
            <Text style={styles.emptyStepDetailsText}>No diagnostics checks logged yet.</Text>
          )}
        </View>
      ),
    },
    {
      id: 3,
      title: 'Service',
      description: 'Lead technician carrying out periodic maintenance checks.',
      time: getStatusTimeFromHistory('in_progress'),
      completed: currentStep >= 3,
      renderDetails: () => (
        <View style={styles.detailsBox}>
          <Text style={styles.detailsLabel}>LEAD TECHNICIAN</Text>
          <Text style={styles.detailsVal}>
            {jobCard.leadTechnician 
              ? `${jobCard.leadTechnician.firstName} ${jobCard.leadTechnician.lastName}` 
              : 'Not assigned'}
          </Text>

          <Text style={styles.detailsLabel}>REPAIR ITEMS / SERVICES</Text>
          {loadingServices ? (
            <ActivityIndicator size="small" color="#95d03a" style={{ alignSelf: 'flex-start', marginVertical: 4 }} />
          ) : services && services.length > 0 && !isMock ? (
            services.map((svc: any) => (
              <View key={svc.jobServiceId} style={styles.listItem}>
                <Feather 
                  name={svc.status === 'completed' ? 'check-circle' : (svc.status === 'in_progress' ? 'loader' : 'clock')} 
                  size={13} 
                  color={svc.status === 'completed' ? '#95d03a' : (svc.status === 'in_progress' ? '#eab308' : '#71717a')} 
                />
                <Text style={styles.listItemText}>{svc.serviceName} ({svc.status})</Text>
              </View>
            ))
          ) : isMock ? (
            <>
              <View style={styles.listItem}>
                <Feather name="check-circle" size={13} color="#95d03a" />
                <Text style={styles.listItemText}>Periodic Maintenance Service (completed)</Text>
              </View>
              <View style={styles.listItem}>
                <Feather name="check-circle" size={13} color="#95d03a" />
                <Text style={styles.listItemText}>Battery diagnostics & calibration (completed)</Text>
              </View>
              <View style={styles.listItem}>
                <Feather name="loader" size={13} color="#eab308" />
                <Text style={styles.listItemText}>Front & rear brake pads replacement (in_progress)</Text>
              </View>
            </>
          ) : (
            <Text style={styles.emptyStepDetailsText}>No repair services logged yet.</Text>
          )}
        </View>
      ),
    },
    {
      id: 4,
      title: 'Parts',
      description: 'Sourcing and fitting required mechanical & electrical parts.',
      time: getStatusTimeFromHistory('awaiting_parts'),
      completed: currentStep >= 4,
      renderDetails: () => (
        <View style={styles.detailsBox}>
          <Text style={styles.detailsLabel}>PARTS ISSUED</Text>
          {loadingParts ? (
            <ActivityIndicator size="small" color="#95d03a" style={{ alignSelf: 'flex-start', marginVertical: 4 }} />
          ) : parts && parts.length > 0 && !isMock ? (
            parts.map((p: any) => (
              <View key={p.jobPartId} style={styles.listItem}>
                <Feather name="package" size={13} color="#71717a" />
                <Text style={styles.listItemText}>{p.partName} x {p.qty}</Text>
              </View>
            ))
          ) : isMock ? (
            <>
              <View style={styles.listItem}>
                <Feather name="package" size={13} color="#71717a" />
                <Text style={styles.listItemText}>Front Brake Pad Set x 1</Text>
              </View>
              <View style={styles.listItem}>
                <Feather name="package" size={13} color="#71717a" />
                <Text style={styles.listItemText}>Rear Brake Pad Set x 1</Text>
              </View>
            </>
          ) : (
            <Text style={styles.emptyStepDetailsText}>No spare parts requested yet.</Text>
          )}
        </View>
      ),
    },
    {
      id: 5,
      title: 'Estimate',
      description: 'Workshop cost estimation awaiting customer approval.',
      time: getStatusTimeFromHistory('awaiting_approval'),
      completed: currentStep >= 5,
      renderDetails: () => (
        <View style={styles.detailsBox}>
          {loadingInvoice ? (
            <ActivityIndicator size="small" color="#95d03a" style={{ alignSelf: 'flex-start', marginVertical: 4 }} />
          ) : invoice && !isMock ? (
            <>
              <Text style={styles.detailsLabel}>ESTIMATE STATUS</Text>
              <Text style={styles.detailsVal}>
                {invoice.status === 'draft' || jobCard.status === 'awaiting_approval' ? 'Awaiting Customer Approval' : 'Approved'}
              </Text>

              <Text style={styles.detailsLabel}>ESTIMATED AMOUNT</Text>
              <Text style={styles.detailsVal}>₹{parseFloat(String(invoice.grandTotal)).toLocaleString()}</Text>
            </>
          ) : isMock ? (
            <>
              <Text style={styles.detailsLabel}>ESTIMATE STATUS</Text>
              <Text style={styles.detailsVal}>Approved</Text>

              <Text style={styles.detailsLabel}>ESTIMATED AMOUNT</Text>
              <Text style={styles.detailsVal}>₹10,500</Text>
            </>
          ) : (
            <Text style={styles.emptyStepDetailsText}>Estimate details not available yet.</Text>
          )}
        </View>
      ),
    },
    {
      id: 6,
      title: 'In Progress',
      description: 'Active mechanical repairs, part fittings, and calibration in service bay.',
      time: getStatusTimeFromHistory('quality_check') !== '--:--' ? getStatusTimeFromHistory('quality_check') : getStatusTimeFromHistory('in_progress'),
      completed: currentStep >= 6,
      renderDetails: () => (
        <View style={styles.detailsBox}>
          <Text style={styles.detailsLabel}>WORKSHOP STATUS</Text>
          <Text style={styles.detailsVal}>
            {jobCard.status === 'quality_check' ? 'Quality assurance checks in-progress' : 'Active repairs and service fitting'}
          </Text>

          <Text style={styles.detailsLabel}>SERVICE BAY</Text>
          <Text style={styles.detailsVal}>
            {jobCard.bay ? `Bay Code: ${jobCard.bay.bayCode} (${jobCard.bay.bayType || 'Service Bay'})` : 'Service Bay Area'}
          </Text>
        </View>
      ),
    },
    {
      id: 7,
      title: 'Invoice',
      description: 'Tax invoice compiled and finalized for completed tasks.',
      time: getStatusTimeFromHistory('ready'),
      completed: currentStep >= 7,
      renderDetails: () => (
        <View style={styles.detailsBox}>
          {loadingInvoice ? (
            <ActivityIndicator size="small" color="#95d03a" style={{ alignSelf: 'flex-start', marginVertical: 4 }} />
          ) : invoice && !isMock ? (
            <>
              <Text style={styles.detailsLabel}>INVOICE NUMBER</Text>
              <Text style={styles.detailsVal}>{invoice.invoiceNumber}</Text>

              <Text style={styles.detailsLabel}>TAXABLE AMOUNT</Text>
              <Text style={styles.detailsVal}>₹{parseFloat(String(invoice.taxableAmount)).toLocaleString()}</Text>

              <Text style={styles.detailsLabel}>GRAND TOTAL</Text>
              <Text style={styles.detailsVal}>₹{parseFloat(String(invoice.grandTotal)).toLocaleString()}</Text>
            </>
          ) : isMock ? (
            <>
              <Text style={styles.detailsLabel}>INVOICE NUMBER</Text>
              <Text style={styles.detailsVal}>INV-2026-980</Text>

              <Text style={styles.detailsLabel}>GRAND TOTAL</Text>
              <Text style={styles.detailsVal}>₹10,500</Text>
            </>
          ) : (
            <Text style={styles.emptyStepDetailsText}>Invoice not generated yet.</Text>
          )}
        </View>
      ),
    },
    {
      id: 8,
      title: 'Payment',
      description: 'Payment verification and checkout processing.',
      time: invoice?.status === 'paid' ? formatTime(invoice.invoiceDate) : '--:--',
      completed: currentStep >= 8,
      renderDetails: () => (
        <View style={styles.detailsBox}>
          {loadingInvoice ? (
            <ActivityIndicator size="small" color="#95d03a" style={{ alignSelf: 'flex-start', marginVertical: 4 }} />
          ) : invoice && !isMock ? (
            <>
              <Text style={styles.detailsLabel}>PAYMENT STATUS</Text>
              <Text style={styles.detailsVal}>{invoice.status.toUpperCase()}</Text>

              <Text style={styles.detailsLabel}>AMOUNT PAID</Text>
              <Text style={styles.detailsVal}>₹{parseFloat(String(invoice.amountPaid)).toLocaleString()}</Text>
            </>
          ) : isMock ? (
            <>
              <Text style={styles.detailsLabel}>PAYMENT STATUS</Text>
              <Text style={styles.detailsVal}>PENDING</Text>

              <Text style={styles.detailsLabel}>AMOUNT PAID</Text>
              <Text style={styles.detailsVal}>₹0</Text>
            </>
          ) : (
            <Text style={styles.emptyStepDetailsText}>Payment details not available yet.</Text>
          )}
        </View>
      ),
    },
    {
      id: 9,
      title: 'Close',
      description: 'Final quality audit complete and vehicle delivered.',
      time: jobCard.closedAt ? formatTime(jobCard.closedAt) : getStatusTimeFromHistory('delivered'),
      completed: currentStep >= 9,
      renderDetails: () => (
        <View style={styles.detailsBox}>
          <Text style={styles.detailsLabel}>VEHICLE DELIVERY</Text>
          <Text style={styles.detailsVal}>
            {jobCard.closedAt ? `Delivered on ${formatDate(jobCard.closedAt)}` : 'Awaiting delivery'}
          </Text>

          <Text style={styles.detailsLabel}>PROMISED TIME</Text>
          <Text style={styles.detailsVal}>
            {jobCard.promisedAt ? formatDate(jobCard.promisedAt) : 'N/A'}
          </Text>
        </View>
      ),
    },
  ];

  return (
    <View style={styles.container}>
      {/* Top Header Title */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Feather name="arrow-left" size={20} color="#18181b" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Job Card Status</Text>
          <Text style={styles.headerSubtitle}>
            {jobCard.vehicle ? `${jobCard.vehicle.registrationNo}` : 'Ather 450X'} — {jobCard.jobType === 'scheduled_maintenance' ? 'Periodic Maintenance' : jobCard.jobType}
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Status Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={styles.wrenchIconBg}>
              <Feather name="settings" size={18} color="#4d6a00" />
            </View>
            <View style={styles.summaryTextContainer}>
              <Text style={styles.summaryLabel}>WORKSHOP REPAIRS & MAINTENANCE</Text>
              <Text style={styles.summaryNumber}>
                {jobCard.jobNumber}
              </Text>
              <Text style={styles.summaryStatusText}>{getFriendlyJobCardStatusText()}</Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBarBg}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${(Math.min(currentStep, 9) / 9) * 100}%` }
                ]}
              />
            </View>
            <Text style={styles.progressPercentageText}>
              Step {currentStep === 10 ? 9 : currentStep} of 9 • {Math.round((Math.min(currentStep, 9) / 9) * 100)}% Complete
            </Text>
          </View>
        </View>

        {/* Steps Stepper List */}
        <Text style={styles.timelineTitle}>WORKSHOP SERVICE LIFECYCLE</Text>

        <View style={styles.stepperContainer}>
          {stepsData.map((step, index) => {
            const isActive = currentStep === 10 ? false : step.id === currentStep;
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
                      isCompleted ? styles.dotCompleted : (isActive ? styles.dotActive : styles.dotPending)
                    ]}
                  >
                    {isCompleted ? (
                      <Feather name="check" size={12} color="#ffffff" />
                    ) : (
                      <Text
                        style={[
                          styles.dotText,
                          isActive ? styles.dotTextActive : styles.dotTextPending
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
                        step.completed ? styles.lineCompleted : null
                      ]}
                    />
                  )}
                </View>

                {/* Right Text Column */}
                <View style={styles.stepRightColumn}>
                  <TouchableOpacity
                    style={styles.stepHeaderRow}
                    onPress={() => {
                      if (step.completed) {
                        setExpandedStep(isExpanded ? null : step.id);
                      }
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={styles.stepTextContent}>
                      <Text
                        style={[
                          styles.stepTitle,
                          isActive ? styles.stepTitleActive : (isPending ? styles.stepTitlePending : null)
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
                          name={isExpanded ? "chevron-up" : "chevron-down"}
                          size={16}
                          color={isActive ? "#4d6a00" : "#71717a"}
                          style={{ marginLeft: 8 }}
                        />
                      )}
                    </View>
                  </TouchableOpacity>

                  {/* Expanded details */}
                  {isExpanded && (
                    <View style={styles.expandedContentBox}>
                      {step.renderDetails()}
                    </View>
                  )}
                </View>
              </View>
            );
          })}
        </View>

        {/* View inspection notes Button */}
        <TouchableOpacity 
          style={styles.inspectionBtn} 
          onPress={() => setInspectionModalVisible(true)}
          activeOpacity={0.8}
        >
          <Text style={styles.inspectionBtnText}>View inspection notes</Text>
        </TouchableOpacity>

        {/* Bottom EV Service Bay Image */}
        <View style={styles.imageContainer}>
          <Image 
            source={require('../../../../../assets/images/ev_workshop.png')} 
            style={styles.bayImage} 
            resizeMode="cover"
          />
        </View>

      </ScrollView>

      {/* Technical Inspection Notes Modal Dialog */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={inspectionModalVisible}
        onRequestClose={() => setInspectionModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Technical Inspection Notes</Text>
              <TouchableOpacity onPress={() => setInspectionModalVisible(false)}>
                <Feather name="x" size={24} color="#71717a" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <View style={styles.sohCard}>
                <Feather name="cpu" size={20} color="#2e5b02" style={styles.cpuIcon} />
                <View>
                  <Text style={styles.sohLabel}>BATTERY HEALTH STATE OF HEALTH (SOH)</Text>
                  <Text style={styles.sohVal}>
                    {jobCard.batterySohInPct ? `${jobCard.batterySohInPct}% SOH` : 'Not recorded'}
                  </Text>
                </View>
              </View>

              <Text style={styles.notesSectionHeading}>Checkpoints & Notes</Text>
              
              {inspections && inspections.length > 0 && !isMock ? (
                inspections.map((ins: any) => (
                  <View key={ins.inspectionId} style={styles.noteRow}>
                    <View style={styles.noteStatusCol}>
                      <Feather 
                        name={ins.result === 'passed' ? 'check-circle' : 'alert-circle'} 
                        size={18} 
                        color={ins.result === 'passed' ? '#95d03a' : '#ef4444'} 
                      />
                    </View>
                    <View style={styles.noteTextCol}>
                      <Text style={styles.noteCheckpoint}>{ins.checkpoint}</Text>
                      <Text style={styles.noteText}>{ins.notes || 'No comments logged.'}</Text>
                    </View>
                  </View>
                ))
              ) : isMock ? (
                <>
                  <View style={styles.noteRow}>
                    <View style={styles.noteStatusCol}>
                      <Feather name="check-circle" size={18} color="#95d03a" />
                    </View>
                    <View style={styles.noteTextCol}>
                      <Text style={styles.noteCheckpoint}>Lithium-Ion Battery Calibration</Text>
                      <Text style={styles.noteText}>Cells balanced successfully. State of health test passed at 94.5% SOH. Internal resistance within specification.</Text>
                    </View>
                  </View>

                  <View style={styles.noteRow}>
                    <View style={styles.noteStatusCol}>
                      <Feather name="check-circle" size={18} color="#95d03a" />
                    </View>
                    <View style={styles.noteTextCol}>
                      <Text style={styles.noteCheckpoint}>Braking Pads Wear Test</Text>
                      <Text style={styles.noteText}>Brake pads replaced due to 15% remaining thickness. Caliper pins greased and test drive performed.</Text>
                    </View>
                  </View>

                  <View style={styles.noteRow}>
                    <View style={styles.noteStatusCol}>
                      <Feather name="alert-circle" size={18} color="#ef4444" />
                    </View>
                    <View style={styles.noteTextCol}>
                      <Text style={styles.noteCheckpoint}>Tyre Thread Wear Scan</Text>
                      <Text style={styles.noteText}>Rear tyre thread depth is 2.1mm. Recommended replacement in next 3,000 km.</Text>
                    </View>
                  </View>
                </>
              ) : (
                <Text style={styles.emptyStepDetailsText}>No inspection notes available.</Text>
              )}
            </ScrollView>
            
            <TouchableOpacity 
              style={styles.closeBtn} 
              onPress={() => setInspectionModalVisible(false)}
            >
              <Text style={styles.closeBtnText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#18181b',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#71717a',
    fontFamily: 'PlusJakartaSans-Regular',
    marginTop: 2,
  },
  scrollContent: {
    padding: 20,
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
  wrenchIconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#e6f0d8',
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
    color: '#4d6a00',
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
    backgroundColor: '#95d03a',
    borderRadius: 3,
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
    marginBottom: 20,
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
    backgroundColor: '#4d6a00',
    borderColor: '#4d6a00',
  },
  dotActive: {
    backgroundColor: '#ffffff',
    borderColor: '#4d6a00',
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
    color: '#4d6a00',
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
    backgroundColor: '#4d6a00',
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
    color: '#4d6a00',
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
  detailsBox: {
    gap: 4,
  },
  detailsLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#9ca3af',
    letterSpacing: 0.5,
    marginBottom: 2,
    fontFamily: 'PlusJakartaSans-Bold',
  },
  detailsVal: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1a2b0c',
    marginBottom: 8,
    fontFamily: 'PlusJakartaSans-SemiBold',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  listItemText: {
    fontSize: 12,
    color: '#52525b',
    fontFamily: 'PlusJakartaSans-Regular',
  },
  emptyStepDetailsText: {
    fontSize: 12,
    color: '#71717a',
    fontFamily: 'PlusJakartaSans-Regular',
    fontStyle: 'italic',
  },
  inspectionBtn: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e4e4e7',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 1,
  },
  inspectionBtnText: {
    color: '#4d6a00',
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  imageContainer: {
    height: 180,
    width: '100%',
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 40,
    backgroundColor: '#e4e4e7',
  },
  bayImage: {
    width: '100%',
    height: '100%',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#faf8f3',
    borderRadius: 28,
    width: '100%',
    maxHeight: '80%',
    padding: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e4e4e7',
    paddingBottom: 14,
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a2b0c',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  modalBody: {
    flex: 1,
  },
  sohCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e6f0d8',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
  },
  cpuIcon: {
    marginRight: 14,
  },
  sohLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: '#4d6a00',
    letterSpacing: 0.5,
    fontFamily: 'PlusJakartaSans-Bold',
  },
  sohVal: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1a2b0c',
    fontFamily: 'PlusJakartaSans-ExtraBold',
    marginTop: 2,
  },
  notesSectionHeading: {
    fontSize: 13,
    fontWeight: '700',
    color: '#71717a',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  noteRow: {
    flexDirection: 'row',
    marginBottom: 14,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e4e4e7',
  },
  noteStatusCol: {
    marginRight: 10,
    paddingTop: 2,
  },
  noteTextCol: {
    flex: 1,
  },
  noteCheckpoint: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1c1c1e',
    fontFamily: 'PlusJakartaSans-SemiBold',
  },
  noteText: {
    fontSize: 12,
    color: '#71717a',
    marginTop: 4,
    lineHeight: 16,
    fontFamily: 'PlusJakartaSans-Regular',
  },
  closeBtn: {
    backgroundColor: '#a2e52c',
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  closeBtnText: {
    color: '#1a2b0c',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  emptyScreenContainer: {
    flex: 1,
    backgroundColor: '#faf8f3',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e4e4e7',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 10,
    elevation: 2,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1a2b0c',
    fontFamily: 'PlusJakartaSans-Bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#71717a',
    fontFamily: 'PlusJakartaSans-Regular',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  emptyBackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#a2e52c',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 24,
    gap: 8,
  },
  emptyBackText: {
    color: '#1a2b0c',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'PlusJakartaSans-Bold',
  },
});

export default JobCardTrackerScreen;

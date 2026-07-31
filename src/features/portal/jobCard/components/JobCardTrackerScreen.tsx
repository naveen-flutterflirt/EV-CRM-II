import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, ActivityIndicator, Modal, Dimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useJobCardHistory, useJobCardInspections, useJobCardServices, useJobCardParts, useJobCardInvoice } from '../hooks/useJobCards';
import { JobCard } from '../types';

const { width } = Dimensions.get('window');

interface JobCardTrackerScreenProps {
  jobCard?: JobCard;
  onBack: () => void;
}

const getActiveStep = (status: string, jobCardId?: string): number => {
  if (jobCardId === '') return 1;
  switch (status) {
    case 'open': return 2;
    case 'in_diagnosis': return 3;
    case 'awaiting_approval':
    case 'awaiting_parts':
    case 'in_progress': return 4;
    case 'quality_check': return 5;
    case 'ready': return 6;
    case 'delivered': return 7;
    default: return 4;
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

  useEffect(() => {
    if (jobCard) {
      setExpandedStep(getActiveStep(jobCard.status, jobCardId));
    }
  }, [jobCardId, jobCard?.status]);
  const { data: history, isLoading: loadingHistory } = useJobCardHistory(jobCardId);
  const { data: inspections, isLoading: loadingInspections } = useJobCardInspections(jobCardId);
  const { data: services, isLoading: loadingServices } = useJobCardServices(jobCardId);
  const { data: parts, isLoading: loadingParts } = useJobCardParts(jobCardId);
  const { data: invoice, isLoading: loadingInvoice } = useJobCardInvoice(jobCardId);

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

  const currentStep = getActiveStep(jobCard.status, jobCardId);

  // Toggle step accordion
  const handleToggleStep = (stepNum: number) => {
    if (stepNum <= currentStep) {
      setExpandedStep(expandedStep === stepNum ? null : stepNum);
    }
  };

  const isStepCompleted = (stepNum: number) => stepNum < currentStep;
  const isStepActive = (stepNum: number) => stepNum === currentStep;

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

  // Render expanding content inside step
  const renderStepDetails = (stepNum: number) => {
    switch (stepNum) {
      case 1:
        return (
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
        );
      case 2:
        return (
          <View style={styles.detailsBox}>
            <Text style={styles.detailsLabel}>RECEIVED ODOMETER</Text>
            <Text style={styles.detailsVal}>
              {jobCard.odometerInKm ? `${jobCard.odometerInKm.toLocaleString()} km` : 'Not recorded'}
            </Text>

            <Text style={styles.detailsLabel}>RECEIPT TIME</Text>
            <Text style={styles.detailsVal}>{formatDate(jobCard.openedAt)}</Text>
          </View>
        );
      case 3:
        return (
          <View style={styles.detailsBox}>
            <Text style={styles.detailsLabel}>JOB CARD NUMBER</Text>
            <Text style={styles.detailsVal}>{jobCard.jobNumber}</Text>
            
            <Text style={styles.detailsLabel}>SERVICE ADVISOR</Text>
            <Text style={styles.detailsVal}>
              {jobCard.serviceAdvisor 
                ? `${jobCard.serviceAdvisor.firstName} ${jobCard.serviceAdvisor.lastName}` 
                : 'Not assigned'}
            </Text>

            <Text style={styles.detailsLabel}>REPORTED COMPLAINTS</Text>
            <Text style={styles.detailsVal}>{jobCard.reportedComplaint || 'No complaints logged.'}</Text>
          </View>
        );
      case 4:
        return (
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

            <Text style={[styles.detailsLabel, { marginTop: 12 }]}>PARTS ISSUED</Text>
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
        );
      case 5:
        return (
          <View style={styles.detailsBox}>
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
        );
      case 6:
        return (
          <View style={styles.detailsBox}>
             {loadingInvoice ? (
              <ActivityIndicator size="small" color="#95d03a" style={{ alignSelf: 'flex-start', marginVertical: 4 }} />
            ) : invoice && !isMock ? (
              <>
                <Text style={styles.detailsLabel}>BILLING STATUS</Text>
                <Text style={styles.detailsVal}>Invoice {invoice.invoiceNumber} generated</Text>

                <Text style={styles.detailsLabel}>AMOUNT PAYABLE</Text>
                <Text style={styles.detailsVal}>₹{parseFloat(String(invoice.grandTotal)).toLocaleString()} ({invoice.status})</Text>
              </>
            ) : isMock ? (
              <>
                <Text style={styles.detailsLabel}>BILLING STATUS</Text>
                <Text style={styles.detailsVal}>Invoice INV-2026-980 generated</Text>

                <Text style={styles.detailsLabel}>AMOUNT PAYABLE</Text>
                <Text style={styles.detailsVal}>₹10,500 (Payment Pending)</Text>
              </>
            ) : (
              <Text style={styles.emptyStepDetailsText}>Billing details pending completion of repairs.</Text>
            )}
          </View>
        );
      case 7:
        return (
          <View style={styles.detailsBox}>
            <Text style={styles.detailsLabel}>READY FOR COLLECTION</Text>
            <Text style={styles.detailsVal}>
              Promised Delivery: {jobCard.promisedAt ? formatDate(jobCard.promisedAt) : 'Pending status completion'}
            </Text>

            <Text style={styles.detailsLabel}>PICKUP LOCATION</Text>
            <Text style={styles.detailsVal}>
              {jobCard.bay ? `Bay Code: ${jobCard.bay.bayCode} (${jobCard.bay.bayType || 'Service Bay'})` : 'Service Bay Area'}
            </Text>
          </View>
        );
      default:
        return null;
    }
  };

  // Get active step label for repair stage
  const getRepairsLabel = () => {
    if (jobCard.status === 'awaiting_approval') return 'Repairs - Awaiting Approval';
    if (jobCard.status === 'awaiting_parts') return 'Repairs - Awaiting Parts';
    return 'Repairs & parts fitting in-progress';
  };

  return (
    <View style={styles.container}>
      {/* Top Header Title */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack} activeOpacity={0.7}>
          <Feather name="arrow-left" size={24} color="#1c1c1e" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Job card status</Text>
          <Text style={styles.headerSubtitle}>
            {jobCard.vehicle ? `${jobCard.vehicle.registrationNo}` : 'Ather 450X'} — {jobCard.jobType === 'scheduled_maintenance' ? 'Periodic Maintenance' : jobCard.jobType}
          </Text>
        </View>
      </View>

      <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
        {/* Timeline container */}
        <View style={styles.timelineContainer}>
          
          {/* Step 1 */}
          <View style={styles.timelineRow}>
            <View style={styles.leftLineCol}>
              <TouchableOpacity 
                style={[styles.indicatorCircle, isStepCompleted(1) ? styles.completedCircle : (isStepActive(1) ? styles.activeCircle : styles.pendingCircle)]}
                onPress={() => handleToggleStep(1)}
              >
                {isStepCompleted(1) ? (
                  <Feather name="check" size={14} color="#ffffff" />
                ) : (
                  <View style={isStepActive(1) ? styles.activeDot : null}>
                    <Text style={styles.circleText}>{!isStepActive(1) && '1'}</Text>
                  </View>
                )}
              </TouchableOpacity>
              <View style={[styles.connectingLine, 1 < currentStep ? styles.completedLine : styles.pendingLine]} />
            </View>
            <View style={styles.contentCol}>
              <TouchableOpacity onPress={() => handleToggleStep(1)} activeOpacity={0.8}>
                <Text style={[styles.stepTitle, expandedStep === 1 && styles.boldStepTitle]}>Appointment confirmed</Text>
              </TouchableOpacity>
              {expandedStep === 1 && renderStepDetails(1)}
            </View>
          </View>

          {/* Step 2 */}
          <View style={styles.timelineRow}>
            <View style={styles.leftLineCol}>
              <TouchableOpacity 
                style={[styles.indicatorCircle, isStepCompleted(2) ? styles.completedCircle : (isStepActive(2) ? styles.activeCircle : styles.pendingCircle)]}
                onPress={() => handleToggleStep(2)}
              >
                {isStepCompleted(2) ? (
                  <Feather name="check" size={14} color="#ffffff" />
                ) : (
                  <View style={isStepActive(2) ? styles.activeDot : null}>
                    <Text style={styles.circleText}>{!isStepActive(2) && '2'}</Text>
                  </View>
                )}
              </TouchableOpacity>
              <View style={[styles.connectingLine, 2 < currentStep ? styles.completedLine : styles.pendingLine]} />
            </View>
            <View style={styles.contentCol}>
              <TouchableOpacity onPress={() => handleToggleStep(2)} activeOpacity={0.8}>
                <Text style={[styles.stepTitle, expandedStep === 2 && styles.boldStepTitle]}>Vehicle received & gate pass issued</Text>
              </TouchableOpacity>
              {expandedStep === 2 && renderStepDetails(2)}
            </View>
          </View>

          {/* Step 3 */}
          <View style={styles.timelineRow}>
            <View style={styles.leftLineCol}>
              <TouchableOpacity 
                style={[styles.indicatorCircle, isStepCompleted(3) ? styles.completedCircle : (isStepActive(3) ? styles.activeCircle : styles.pendingCircle)]}
                onPress={() => handleToggleStep(3)}
              >
                {isStepCompleted(3) ? (
                  <Feather name="check" size={14} color="#ffffff" />
                ) : (
                  <View style={isStepActive(3) ? styles.activeDot : null}>
                    <Text style={styles.circleText}>{!isStepActive(3) && '3'}</Text>
                  </View>
                )}
              </TouchableOpacity>
              <View style={[styles.connectingLine, 3 < currentStep ? styles.completedLine : styles.pendingLine]} />
            </View>
            <View style={styles.contentCol}>
              <TouchableOpacity onPress={() => handleToggleStep(3)} activeOpacity={0.8}>
                <Text style={[styles.stepTitle, expandedStep === 3 && styles.boldStepTitle]}>Inspection & job card opened</Text>
              </TouchableOpacity>
              {expandedStep === 3 && renderStepDetails(3)}
            </View>
          </View>

          {/* Step 4 */}
          <View style={styles.timelineRow}>
            <View style={styles.leftLineCol}>
              <TouchableOpacity 
                style={[styles.indicatorCircle, isStepCompleted(4) ? styles.completedCircle : (isStepActive(4) ? styles.activeCircle : styles.pendingCircle)]}
                onPress={() => handleToggleStep(4)}
              >
                {isStepCompleted(4) ? (
                  <Feather name="check" size={14} color="#ffffff" />
                ) : (
                  <View style={isStepActive(4) ? styles.activeDot : null}>
                    <Text style={styles.circleText}>{!isStepActive(4) && '4'}</Text>
                  </View>
                )}
              </TouchableOpacity>
              <View style={[styles.connectingLine, 4 < currentStep ? styles.completedLine : styles.pendingLine]} />
            </View>
            <View style={styles.contentCol}>
              <TouchableOpacity onPress={() => handleToggleStep(4)} activeOpacity={0.8}>
                <Text style={[styles.stepTitle, expandedStep === 4 && styles.boldStepTitle]}>{getRepairsLabel()}</Text>
                {isStepActive(4) && (
                  <Text style={styles.stepSubtitle}>Repairs are active</Text>
                )}
              </TouchableOpacity>
              {expandedStep === 4 && renderStepDetails(4)}
            </View>
          </View>

          {/* Step 5 */}
          <View style={styles.timelineRow}>
            <View style={styles.leftLineCol}>
              <TouchableOpacity 
                style={[styles.indicatorCircle, isStepCompleted(5) ? styles.completedCircle : (isStepActive(5) ? styles.activeCircle : styles.pendingCircle)]}
                onPress={() => handleToggleStep(5)}
              >
                {isStepCompleted(5) ? (
                  <Feather name="check" size={14} color="#ffffff" />
                ) : (
                  <View style={isStepActive(5) ? styles.activeDot : null}>
                    <Text style={[styles.circleText, isStepActive(5) && styles.activeCircleText]}>5</Text>
                  </View>
                )}
              </TouchableOpacity>
              <View style={[styles.connectingLine, 5 < currentStep ? styles.completedLine : styles.pendingLine]} />
            </View>
            <View style={styles.contentCol}>
              <TouchableOpacity onPress={() => handleToggleStep(5)} activeOpacity={0.8}>
                <Text style={[styles.stepTitle, expandedStep === 5 && styles.boldStepTitle]}>Quality assurance check</Text>
              </TouchableOpacity>
              {expandedStep === 5 && renderStepDetails(5)}
            </View>
          </View>

          {/* Step 6 */}
          <View style={styles.timelineRow}>
            <View style={styles.leftLineCol}>
              <TouchableOpacity 
                style={[styles.indicatorCircle, isStepCompleted(6) ? styles.completedCircle : (isStepActive(6) ? styles.activeCircle : styles.pendingCircle)]}
                onPress={() => handleToggleStep(6)}
              >
                {isStepCompleted(6) ? (
                  <Feather name="check" size={14} color="#ffffff" />
                ) : (
                  <View style={isStepActive(6) ? styles.activeDot : null}>
                    <Text style={[styles.circleText, isStepActive(6) && styles.activeCircleText]}>6</Text>
                  </View>
                )}
              </TouchableOpacity>
              <View style={[styles.connectingLine, 6 < currentStep ? styles.completedLine : styles.pendingLine]} />
            </View>
            <View style={styles.contentCol}>
              <TouchableOpacity onPress={() => handleToggleStep(6)} activeOpacity={0.8}>
                <Text style={[styles.stepTitle, expandedStep === 6 && styles.boldStepTitle]}>Wash & final billing</Text>
              </TouchableOpacity>
              {expandedStep === 6 && renderStepDetails(6)}
            </View>
          </View>

          {/* Step 7 */}
          <View style={styles.timelineRow}>
            <View style={styles.leftLineCol}>
              <TouchableOpacity 
                style={[styles.indicatorCircle, isStepCompleted(7) ? styles.completedCircle : (isStepActive(7) ? styles.activeCircle : styles.pendingCircle)]}
                onPress={() => handleToggleStep(7)}
              >
                {isStepCompleted(7) ? (
                  <Feather name="check" size={14} color="#ffffff" />
                ) : (
                  <View style={isStepActive(7) ? styles.activeDot : null}>
                    <Text style={[styles.circleText, isStepActive(7) && styles.activeCircleText]}>7</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
            <View style={styles.contentCol}>
              <TouchableOpacity onPress={() => handleToggleStep(7)} activeOpacity={0.8}>
                <Text style={[styles.stepTitle, expandedStep === 7 && styles.boldStepTitle]}>Ready for pickup / delivery</Text>
              </TouchableOpacity>
              {expandedStep === 7 && renderStepDetails(7)}
            </View>
          </View>

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
    backgroundColor: '#faf8f3',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
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
    fontSize: 20,
    fontWeight: '700',
    color: '#1a2b0c',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#71717a',
    fontFamily: 'PlusJakartaSans-Regular',
    marginTop: 2,
  },
  scrollArea: {
    flex: 1,
    padding: 20,
  },
  timelineContainer: {
    paddingLeft: 4,
    marginBottom: 24,
  },
  timelineRow: {
    flexDirection: 'row',
    marginBottom: 0,
  },
  leftLineCol: {
    alignItems: 'center',
    width: 32,
  },
  indicatorCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    zIndex: 2,
  },
  completedCircle: {
    backgroundColor: '#4d6a00',
    borderColor: '#4d6a00',
  },
  activeCircle: {
    backgroundColor: '#ffffff',
    borderColor: '#4d6a00',
  },
  pendingCircle: {
    backgroundColor: '#e4e4e7',
    borderColor: '#e4e4e7',
  },
  activeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4d6a00',
  },
  circleText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#71717a',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  activeCircleText: {
    color: '#4d6a00',
  },
  connectingLine: {
    width: 2,
    flex: 1,
    minHeight: 40,
    zIndex: 1,
    marginVertical: -2,
  },
  completedLine: {
    backgroundColor: '#4d6a00',
  },
  pendingLine: {
    backgroundColor: '#e4e4e7',
  },
  contentCol: {
    flex: 1,
    marginLeft: 16,
    paddingTop: 4,
    paddingBottom: 24,
  },
  stepTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#71717a',
    fontFamily: 'PlusJakartaSans-SemiBold',
  },
  boldStepTitle: {
    color: '#1a2b0c',
    fontWeight: '700',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  stepSubtitle: {
    fontSize: 11,
    color: '#71717a',
    fontFamily: 'PlusJakartaSans-Regular',
    marginTop: 2,
  },
  detailsBox: {
    marginTop: 10,
    padding: 12,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e4e4e7',
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
    backgroundColor: '#f3f0fa',
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#4d6a00',
    marginBottom: 20,
  },
  inspectionBtnText: {
    color: '#1a2b0c',
    fontSize: 16,
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
  // Modal note stylesheet
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
  // Empty State Styles
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

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

interface RsaSuccessScreenProps {
  requestDetails: {
    requestId: string;
    requestNumber: string;
    customerName: string;
    customerPhone: string;
    vehicleNo: string;
    issueType: string;
    breakdownAddress?: string;
  };
  onLiveTrack: (requestId: string) => void;
  onGoHome: () => void;
}

export const RsaSuccessScreen: React.FC<RsaSuccessScreenProps> = ({
  requestDetails,
  onLiveTrack,
  onGoHome,
}) => {
  const getFriendlyIssueLabel = (val: string) => {
    switch (val) {
      case 'breakdown': return 'Breakdown';
      case 'flat_tyre': return 'Flat Tyre';
      case 'battery_drain': return 'Battery Drain';
      case 'charging_failure': return 'Charging Failure';
      case 'accident': return 'Accident';
      case 'tow': return 'Towing';
      default: return val ? val.charAt(0).toUpperCase() + val.slice(1).replace(/_/g, ' ') : 'Other';
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* 1. Success Hero Icon & Main Text */}
      <View style={styles.heroContainer}>
        <View style={styles.iconCircle}>
          <Feather name="truck" size={40} color="#95d03a" />
          <View style={styles.miniCheckBadge}>
            <Feather name="check" size={12} color="#ffffff" />
          </View>
        </View>
        <Text style={styles.title}>Request Submitted!</Text>
        <Text style={styles.subtitle}>
          Your Roadside Assistance (RSA) request has been logged successfully. The emergency dispatcher has been notified.
        </Text>
      </View>

      {/* 2. Detailed Summary Box */}
      <View style={styles.detailsCard}>
        <Text style={styles.cardTitle}>REQUEST SUMMARY</Text>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Request Number</Text>
          <Text style={styles.detailValue}>{requestDetails.requestNumber || 'N/A'}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Vehicle No</Text>
          <Text style={[styles.detailValue, styles.boldValue]}>{requestDetails.vehicleNo}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Issue Type</Text>
          <Text style={styles.detailValue}>{getFriendlyIssueLabel(requestDetails.issueType)}</Text>
        </View>

        {requestDetails.breakdownAddress ? (
          <>
            <View style={styles.divider} />
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Breakdown Location</Text>
              <Text style={styles.detailValue} numberOfLines={2}>{requestDetails.breakdownAddress}</Text>
            </View>
          </>
        ) : null}

        <View style={styles.divider} />

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Customer Contact</Text>
          <Text style={styles.detailValue}>
            {requestDetails.customerName} ({requestDetails.customerPhone})
          </Text>
        </View>
      </View>

      {/* 3. Action Buttons */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.trackButton}
          onPress={() => onLiveTrack(requestDetails.requestId)}
          activeOpacity={0.85}
        >
          <Feather name="activity" size={18} color="#ffffff" style={styles.buttonIcon} />
          <Text style={styles.trackButtonText}>Live Track Status</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.homeButton}
          onPress={onGoHome}
          activeOpacity={0.7}
        >
          <Text style={styles.homeButtonText}>Go to Dashboard</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContent: {
    padding: 24,
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 80 : 50,
    paddingBottom: 40,
  },
  heroContainer: {
    alignItems: 'center',
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  iconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#f5fad2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    position: 'relative',
  },
  miniCheckBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#95d03a',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2.5,
    borderColor: '#ffffff',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#18181b',
    fontFamily: 'PlusJakartaSans-Bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: '#71717a',
    fontFamily: 'PlusJakartaSans-Regular',
    textAlign: 'center',
  },
  detailsCard: {
    width: '100%',
    backgroundColor: '#faf9f6',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e4e4e7',
    marginBottom: 36,
  },
  cardTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#71717a',
    fontFamily: 'PlusJakartaSans-Bold',
    letterSpacing: 1,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 4,
  },
  detailLabel: {
    fontSize: 13,
    color: '#71717a',
    fontFamily: 'PlusJakartaSans-Medium',
    width: '40%',
  },
  detailValue: {
    fontSize: 13,
    color: '#18181b',
    fontFamily: 'PlusJakartaSans-Semibold',
    textAlign: 'right',
    width: '60%',
  },
  boldValue: {
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: '#e4e4e7',
    marginVertical: 12,
  },
  actionsContainer: {
    width: '100%',
  },
  trackButton: {
    width: '100%',
    backgroundColor: '#95d03a',
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#95d03a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  buttonIcon: {
    marginRight: 8,
  },
  trackButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  homeButton: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e4e4e7',
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  homeButtonText: {
    color: '#71717a',
    fontSize: 15,
    fontWeight: '700',
    fontFamily: 'PlusJakartaSans-Bold',
  },
});

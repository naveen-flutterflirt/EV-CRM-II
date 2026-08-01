import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { ServiceDetailData } from '../types';

interface ServiceDetailScreenProps {
  detail?: ServiceDetailData | null;
  onBack: () => void;
  onBookNextService?: () => void;
}

export const ServiceDetailScreen: React.FC<ServiceDetailScreenProps> = ({
  detail,
  onBack,
  onBookNextService,
}) => {
  const serviceType = detail?.serviceType || 'Major Interval';
  const serviceDate = detail?.serviceDate || 'Oct 24, 2023';
  const odometerKm = detail?.odometerKm ? detail.odometerKm.toLocaleString() : '42,502';
  const techName = detail?.technicianName || 'Marcus Sterling';
  const techRating = detail?.technicianRating || 4.9;
  const laborItems = detail?.laborItems || [
    { id: 'l1', title: 'Standard Safety Check', subtitle: '62-point comprehensive inspection', price: 145.00 },
    { id: 'l2', title: 'Engine Tuning', subtitle: 'Electronic calibration & timing', price: 88.50 },
  ];
  const partsReplaced = detail?.partsReplaced || [
    { id: 'p1', partName: 'Synthetic Oil Filter (Premium)', partNumber: 'Part #SF-90210', price: 42.00 },
    { id: 'p2', partName: 'HEPA Cabin Air Filter', partNumber: 'Part #CF-4452', price: 38.90 },
  ];
  const techNotes = detail?.technicianNotes ||
    '"Brake pad wear detected at 15%. Recommended replacement during the next minor service interval. All other systems operating at peak efficiency."';
  const totalAmount = detail?.totalAmount || 314.40;

  const handleDownloadInvoice = () => {
    const msg = `Tax Invoice downloaded successfully for service #${detail?.id || 'SRV-1024'}`;
    if (Platform.OS === 'web') window.alert(msg);
    else Alert.alert('Invoice Downloaded', msg);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Header */}
      <View style={styles.topHeader}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Feather name="arrow-left" size={20} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Service Detail</Text>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Service Type Lime Banner */}
        <View style={styles.limeBanner}>
          <Text style={styles.bannerLabel}>SERVICE TYPE</Text>
          <Text style={styles.bannerValue}>{serviceType}</Text>
          <Feather name="settings" size={48} color="rgba(26, 43, 12, 0.08)" style={styles.bannerBgIcon} />
        </View>

        {/* Metrics Row: Service Date & Odometer */}
        <View style={styles.metricsRow}>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>SERVICE DATE</Text>
            <Text style={styles.metricVal}>{serviceDate}</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>ODOMETER</Text>
            <Text style={styles.metricVal}>{odometerKm} <Text style={styles.kmUnit}>km</Text></Text>
          </View>
        </View>

        {/* Lead Technician Card */}
        <View style={styles.techCard}>
          <View style={styles.techLeft}>
            <View style={styles.techAvatarCircle}>
              <Feather name="user" size={20} color="#4d7c0f" />
            </View>
            <View style={styles.techMeta}>
              <Text style={styles.techLabel}>Lead Technician</Text>
              <Text style={styles.techName}>{techName}</Text>
            </View>
          </View>
          <View style={styles.ratingBadge}>
            <Feather name="star" size={12} color="#84cc16" style={{ marginRight: 4 }} />
            <Text style={styles.ratingText}>{techRating.toFixed(1)}</Text>
          </View>
        </View>

        {/* Labor & Inspection Section */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionHeading}>LABOR & INSPECTION</Text>
          {laborItems.map((item) => (
            <View key={item.id} style={styles.lineItemRow}>
              <View style={styles.lineItemMeta}>
                <Text style={styles.lineItemTitle}>{item.title}</Text>
                <Text style={styles.lineItemSub}>{item.subtitle}</Text>
              </View>
              <Text style={styles.lineItemPrice}>${item.price.toFixed(2)}</Text>
            </View>
          ))}
        </View>

        {/* Parts Replaced Section */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionHeading}>PARTS REPLACED</Text>
          <View style={styles.partsCardGroup}>
            {partsReplaced.map((part) => (
              <View key={part.id} style={styles.partCardRow}>
                <View style={styles.partIconCircle}>
                  <Feather name="box" size={16} color="#64748b" />
                </View>
                <View style={styles.partMeta}>
                  <Text style={styles.partName} numberOfLines={1}>{part.partName}</Text>
                  <Text style={styles.partNum}>{part.partNumber}</Text>
                </View>
                <Text style={styles.partPrice}>${part.price.toFixed(2)}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Technician Notes Section */}
        <View style={styles.techNotesCard}>
          <View style={styles.notesHeader}>
            <Feather name="info" size={16} color="#64748b" style={{ marginRight: 6 }} />
            <Text style={styles.notesTitle}>TECHNICIAN NOTES</Text>
          </View>
          <Text style={styles.notesBody}>{techNotes}</Text>
        </View>

        {/* Total Amount Row */}
        <View style={styles.totalRow}>
          <View>
            <Text style={styles.totalLabel}>TOTAL AMOUNT</Text>
            <Text style={styles.taxSub}>Includes GST & environmental levies</Text>
          </View>
          <Text style={styles.totalVal}>${totalAmount.toFixed(2)}</Text>
        </View>

        {/* Download Tax Invoice Action Button */}
        <TouchableOpacity
          style={styles.downloadInvoiceBtn}
          onPress={handleDownloadInvoice}
          activeOpacity={0.85}
        >
          <Feather name="download" size={16} color="#ffffff" style={{ marginRight: 8 }} />
          <Text style={styles.downloadText}>Download Tax Invoice</Text>
        </TouchableOpacity>

        {/* Book Next Service Touch */}
        <TouchableOpacity
          style={styles.bookNextTouch}
          onPress={onBookNextService}
          activeOpacity={0.8}
        >
          <Feather name="calendar" size={16} color="#0f172a" style={{ marginRight: 6 }} />
          <Text style={styles.bookNextText}>Book Next Service</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    gap: 12,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  limeBanner: {
    backgroundColor: '#a2e52c',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  bannerLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#365314',
    letterSpacing: 1,
    marginBottom: 4,
    fontFamily: 'PlusJakartaSans-Bold',
  },
  bannerValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1a2b0c',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  bannerBgIcon: {
    position: 'absolute',
    right: -10,
    bottom: -10,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#f5f3f9',
    borderRadius: 20,
    padding: 16,
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: 0.5,
    marginBottom: 6,
    fontFamily: 'PlusJakartaSans-Bold',
  },
  metricVal: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  kmUnit: {
    fontSize: 12,
    fontWeight: 'normal',
    color: '#64748b',
  },
  techCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f5f3f9',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 20,
  },
  techLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  techAvatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#eef6d6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  techMeta: {},
  techLabel: {
    fontSize: 11,
    color: '#64748b',
    marginBottom: 2,
    fontFamily: 'PlusJakartaSans-Regular',
  },
  techName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0f172a',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  sectionBlock: {
    marginBottom: 20,
  },
  sectionHeading: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: 1,
    marginBottom: 12,
    fontFamily: 'PlusJakartaSans-Bold',
  },
  lineItemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  lineItemMeta: {
    flex: 1,
    marginRight: 12,
  },
  lineItemTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 2,
    fontFamily: 'PlusJakartaSans-Bold',
  },
  lineItemSub: {
    fontSize: 11,
    color: '#64748b',
    fontFamily: 'PlusJakartaSans-Regular',
  },
  lineItemPrice: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  partsCardGroup: {
    backgroundColor: '#f8fafc',
    borderRadius: 20,
    padding: 14,
    gap: 12,
  },
  partCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  partIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  partMeta: {
    flex: 1,
    marginRight: 8,
  },
  partName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 2,
    fontFamily: 'PlusJakartaSans-Bold',
  },
  partNum: {
    fontSize: 11,
    color: '#64748b',
    fontFamily: 'PlusJakartaSans-Regular',
  },
  partPrice: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0f172a',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  techNotesCard: {
    backgroundColor: '#f5f3f9',
    borderRadius: 20,
    padding: 16,
    marginBottom: 24,
  },
  notesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  notesTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: 1,
    fontFamily: 'PlusJakartaSans-Bold',
  },
  notesBody: {
    fontSize: 12,
    color: '#475569',
    fontStyle: 'italic',
    lineHeight: 18,
    fontFamily: 'PlusJakartaSans-Regular',
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  totalLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: 1,
    marginBottom: 2,
    fontFamily: 'PlusJakartaSans-Bold',
  },
  taxSub: {
    fontSize: 10,
    color: '#94a3b8',
  },
  totalVal: {
    fontSize: 24,
    fontWeight: '800',
    color: '#4d7c0f',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  downloadInvoiceBtn: {
    backgroundColor: '#365314',
    borderRadius: 24,
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  downloadText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#ffffff',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  bookNextTouch: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginBottom: 30,
  },
  bookNextText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
    fontFamily: 'PlusJakartaSans-Bold',
  },
});

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { ServiceHistoryRecord } from '../types';

interface ServiceHistoryScreenProps {
  history?: ServiceHistoryRecord[];
  onSelectRecord?: (record: ServiceHistoryRecord) => void;
  onBack: () => void;
}

export const ServiceHistoryScreen: React.FC<ServiceHistoryScreenProps> = ({
  history = [],
  onSelectRecord,
  onBack,
}) => {
  const hasHistory = Array.isArray(history) && history.length > 0;

  // Group by year
  const groupedByYear = (history || []).reduce((acc, item) => {
    const year = item.year || '2026';
    if (!acc[year]) acc[year] = [];
    acc[year].push(item);
    return acc;
  }, {} as Record<string, ServiceHistoryRecord[]>);

  const years = Object.keys(groupedByYear).sort((a, b) => Number(b) - Number(a));

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Bar Header */}
      <View style={styles.topHeader}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Feather name="arrow-left" size={20} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Service History</Text>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Render History List or Empty State */}
        {hasHistory ? (
          years.map((year) => (
            <View key={year} style={styles.yearSection}>
              {/* Year Divider */}
              <View style={styles.yearHeaderRow}>
                <Text style={styles.yearTitle}>{year}</Text>
                <View style={styles.yearLine} />
              </View>

              {/* Service Item Cards */}
              <View style={styles.recordsList}>
                {groupedByYear[year].map((item) => {
                  const parts = (item.monthDay).split(' ');
                  const month = parts[0];
                  const day = parts[1];

                  return (
                    <TouchableOpacity
                      key={item.id}
                      style={styles.recordCard}
                      onPress={() => onSelectRecord && onSelectRecord(item)}
                      activeOpacity={0.8}
                    >
                      {/* Date Col */}
                      <View style={styles.dateCol}>
                        <Text style={styles.dateMonth}>{month}</Text>
                        <Text style={styles.dateDay}>{day}</Text>
                      </View>

                      <View style={styles.cardVertDivider} />

                      {/* Content Col */}
                      <View style={styles.cardContent}>
                        <Text style={styles.serviceTitle}>{item.title}</Text>
                        <View style={styles.kmRow}>
                          <Feather name="disc" size={12} color="#65a30d" style={styles.kmIcon} />
                          <Text style={styles.kmText}>
                            {item.kilometers.toLocaleString()} KM
                          </Text>
                        </View>
                      </View>

                      <Feather name="chevron-right" size={18} color="#cbd5e1" />
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Feather name="file-text" size={28} color="#94a3b8" />
            </View>
            <Text style={styles.emptyTitle}>{"You don't have any service history yet"}</Text>
            <Text style={styles.emptySub}>Past service records and invoices will appear here once your vehicle receives service.</Text>
          </View>
        )}

        {/* Watermark Footer */}
        {hasHistory && (
          <View style={styles.footerSection}>
            <View style={styles.watermarkBadge}>
              <Feather name="inbox" size={20} color="#cbd5e1" />
            </View>
            <Text style={styles.watermarkText}>
              Beginning of history for your current fleet
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#faf8fc',
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#eef0f4',
    backgroundColor: '#ffffff',
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
  },
  filterChipRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  chipBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  chipBtnActive: {
    backgroundColor: '#4d7c0f',
  },
  chipBtnInactive: {
    backgroundColor: '#f1f5f9',
  },
  chipIcon: {
    marginRight: 6,
  },
  chipText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    fontFamily: 'PlusJakartaSans-Bold',
  },
  chipTextActive: {
    color: '#ffffff',
  },
  chipTextInactive: {
    color: '#475569',
  },
  yearSection: {
    marginBottom: 20,
  },
  yearHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 10,
  },
  yearTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748b',
    letterSpacing: 1,
    fontFamily: 'PlusJakartaSans-Bold',
  },
  yearLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e2e8f0',
  },
  recordsList: {
    gap: 10,
  },
  recordCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  dateCol: {
    width: 44,
    alignItems: 'center',
  },
  dateMonth: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: 0.5,
    fontFamily: 'PlusJakartaSans-Bold',
  },
  dateDay: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  cardVertDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#e2e8f0',
    marginHorizontal: 14,
  },
  cardContent: {
    flex: 1,
  },
  serviceTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4,
    fontFamily: 'PlusJakartaSans-Bold',
  },
  kmRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  kmIcon: {
    marginRight: 4,
  },
  kmText: {
    fontSize: 12,
    color: '#64748b',
    letterSpacing: 0.5,
    fontFamily: 'PlusJakartaSans-Regular',
  },
  emptyContainer: {
    paddingVertical: 50,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  emptyIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
    textAlign: 'center',
    marginBottom: 6,
    fontFamily: 'PlusJakartaSans-Bold',
  },
  emptySub: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 18,
    fontFamily: 'PlusJakartaSans-Regular',
  },
  footerSection: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  watermarkBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  watermarkText: {
    fontSize: 11,
    color: '#94a3b8',
    letterSpacing: 0.5,
    fontFamily: 'PlusJakartaSans-Regular',
    textAlign: 'center',
  },
});

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  SafeAreaView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { SupportTicketItem } from '../types';

interface SupportMainScreenProps {
  tickets?: SupportTicketItem[];
  onOpenHelpCenter: () => void;
  onOpenContactUs: () => void;
  onBack: () => void;
}

export const SupportMainScreen: React.FC<SupportMainScreenProps> = ({
  tickets = [],
  onOpenHelpCenter,
  onOpenContactUs,
  onBack,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTickets = (tickets || []).filter((t) => {
    if (!searchQuery.trim()) return true;
    return t.title.toLowerCase().includes(searchQuery.toLowerCase()) || t.summary.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const hasTickets = filteredTickets.length > 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Header */}
      <View style={styles.topHeader}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Feather name="arrow-left" size={20} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Support</Text>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Main Heading & Subtext */}
        <Text style={styles.mainHeading}>How can we help?</Text>
        <Text style={styles.subText}>
          Find answers instantly or reach out to our team of specialists.
        </Text>

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Feather name="search" size={18} color="#8e8a9f" style={{ marginRight: 10 }} />
          <TextInput
            style={[styles.searchInput, { outlineStyle: 'none' } as any]}
            placeholder="Search topics, guides..."
            placeholderTextColor="#8e8a9f"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* 2 Quick Option Cards Row */}
        <View style={styles.quickCardsRow}>
          {/* Help Center Card */}
          <TouchableOpacity
            style={styles.helpCenterCard}
            onPress={onOpenHelpCenter}
            activeOpacity={0.88}
          >
            <View style={styles.limeIconCircle}>
              <Feather name="book-open" size={20} color="#365314" />
            </View>
            <Text style={styles.cardTitle}>Help Center</Text>
            <Text style={styles.cardSub}>Browse guides</Text>
          </TouchableOpacity>

          {/* Contact Us Card */}
          <TouchableOpacity
            style={styles.contactUsCard}
            onPress={onOpenContactUs}
            activeOpacity={0.88}
          >
            <View style={styles.limeIconCircle}>
              <Feather name="message-square" size={20} color="#365314" />
            </View>
            <Text style={styles.contactCardTitle}>Contact Us</Text>
            <Text style={styles.contactCardSub}>Chat is active</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Inquiries Header */}
        <View style={styles.inquiriesHeaderRow}>
          <Text style={styles.inquiriesTitle}>Recent inquiries</Text>
          {hasTickets && (
            <TouchableOpacity>
              <Text style={styles.viewAllText}>VIEW ALL</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Recent Inquiries List or Empty State */}
        {hasTickets ? (
          <View style={styles.inquiriesList}>
            {filteredTickets.map((t) => (
              <View key={t.id} style={styles.inquiryCard}>
                <View style={styles.inquiryTopRow}>
                  <View style={styles.inquiryLeft}>
                    <View style={styles.avatarCircle}>
                      <Feather name="user" size={18} color="#4d7c0f" />
                    </View>
                    <View>
                      <Text style={styles.inquiryTitle}>{t.title}</Text>
                      <Text style={styles.inquirySummary}>{t.summary}</Text>
                    </View>
                  </View>
                  <Text style={styles.timeAgoText}>{t.timeAgo}</Text>
                </View>

                {/* Status Badge */}
                <View style={styles.statusRow}>
                  <View
                    style={[
                      styles.statusDot,
                      t.status === 'IN PROGRESS' ? styles.dotProgress : styles.dotResolved,
                    ]}
                  />
                  <Text style={styles.statusText}>{t.status}</Text>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyCardContainer}>
            <View style={styles.emptyIconCircle}>
              <Feather name="help-circle" size={24} color="#94a3b8" />
            </View>
            <Text style={styles.emptyText}>{"You don't have any recent inquiries"}</Text>
          </View>
        )}

        {/* Bottom Community Forum Card */}
        <View style={styles.communityCard}>
          <View style={styles.communityContent}>
            <Text style={styles.stuckTitle}>Still stuck?</Text>
            <Text style={styles.stuckSub}>
              Our community of 50k+ users might have the answer.
            </Text>
            <TouchableOpacity style={styles.forumBtn} activeOpacity={0.85}>
              <Text style={styles.forumText}>Visit Forum</Text>
            </TouchableOpacity>
          </View>
          <Feather name="message-circle" size={60} color="rgba(148, 163, 184, 0.15)" style={styles.forumBgIcon} />
        </View>
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
    paddingTop: 20,
  },
  mainHeading: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 6,
    fontFamily: 'PlusJakartaSans-Bold',
  },
  subText: {
    fontSize: 12,
    color: '#64748b',
    lineHeight: 18,
    marginBottom: 16,
    fontFamily: 'PlusJakartaSans-Regular',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ece8f5',
    borderRadius: 24,
    height: 48,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#0f172a',
    fontFamily: 'PlusJakartaSans-Regular',
  },
  quickCardsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  helpCenterCard: {
    flex: 1,
    backgroundColor: '#f0edf6',
    borderRadius: 24,
    padding: 16,
    height: 140,
    justifyContent: 'space-between',
  },
  contactUsCard: {
    flex: 1,
    backgroundColor: '#4d7c0f',
    borderRadius: 24,
    padding: 16,
    height: 140,
    justifyContent: 'space-between',
  },
  limeIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#a2e52c',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  cardSub: {
    fontSize: 11,
    color: '#64748b',
    fontFamily: 'PlusJakartaSans-Regular',
  },
  contactCardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#ffffff',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  contactCardSub: {
    fontSize: 11,
    color: '#dcfce7',
    fontFamily: 'PlusJakartaSans-Regular',
  },
  inquiriesHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  inquiriesTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0f172a',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  viewAllText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: 0.5,
  },
  inquiriesList: {
    gap: 12,
    marginBottom: 24,
  },
  inquiryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
  },
  inquiryTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  inquiryLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#eef6d6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  inquiryTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 2,
    fontFamily: 'PlusJakartaSans-Bold',
  },
  inquirySummary: {
    fontSize: 11,
    color: '#64748b',
    fontFamily: 'PlusJakartaSans-Regular',
  },
  timeAgoText: {
    fontSize: 11,
    color: '#94a3b8',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 46,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  dotProgress: {
    backgroundColor: '#65a30d',
  },
  dotResolved: {
    backgroundColor: '#94a3b8',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: 0.5,
  },
  emptyCardContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: '#f1f5f9',
    borderWidth: 1,
    marginBottom: 24,
  },
  emptyIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '600',
    fontFamily: 'PlusJakartaSans-Medium',
  },
  communityCard: {
    backgroundColor: '#eceaf4',
    borderRadius: 24,
    padding: 20,
    marginBottom: 40,
    position: 'relative',
    overflow: 'hidden',
  },
  communityContent: {
    zIndex: 1,
  },
  stuckTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 4,
    fontFamily: 'PlusJakartaSans-Bold',
  },
  stuckSub: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 14,
    maxWidth: '80%',
    fontFamily: 'PlusJakartaSans-Regular',
  },
  forumBtn: {
    backgroundColor: '#0f172a',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignSelf: 'flex-start',
  },
  forumText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#ffffff',
  },
  forumBgIcon: {
    position: 'absolute',
    right: 10,
    bottom: 10,
  },
});

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
import { FaqItem } from '../types';

interface HelpCenterScreenProps {
  faqs: FaqItem[];
  onOpenContactUs: () => void;
  onBack: () => void;
}

export const HelpCenterScreen: React.FC<HelpCenterScreenProps> = ({
  faqs,
  onOpenContactUs,
  onBack,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'Getting Started' | 'Payments'>('Getting Started');
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>('faq_1');

  const filteredFaqs = faqs.filter((faq) => {
    const matchesCategory = faq.category === categoryFilter;
    const matchesQuery = searchQuery.trim()
      ? faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    return matchesCategory && matchesQuery;
  });

  const toggleAccordion = (id: string) => {
    setExpandedFaqId((prev) => (prev === id ? null : id));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Header */}
      <View style={styles.topHeader}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Feather name="arrow-left" size={20} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help Center</Text>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Search Input Bar */}
        <View style={styles.searchBar}>
          <Feather name="search" size={18} color="#8e8a9f" style={{ marginRight: 10 }} />
          <TextInput
            style={[styles.searchInput, { outlineStyle: 'none' } as any]}
            placeholder="Search for articles, guides..."
            placeholderTextColor="#8e8a9f"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Filter Pills Row */}
        <View style={styles.filterPillsRow}>
          <TouchableOpacity
            style={[
              styles.pillBtn,
              categoryFilter === 'Getting Started' ? styles.pillActive : styles.pillInactive,
            ]}
            onPress={() => setCategoryFilter('Getting Started')}
            activeOpacity={0.8}
          >
            <Feather
              name="zap"
              size={14}
              color={categoryFilter === 'Getting Started' ? '#ffffff' : '#475569'}
              style={{ marginRight: 6 }}
            />
            <Text
              style={[
                styles.pillText,
                categoryFilter === 'Getting Started' ? styles.pillTextActive : styles.pillTextInactive,
              ]}
            >
              Getting Started
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.pillBtn,
              categoryFilter === 'Payments' ? styles.pillActive : styles.pillInactive,
            ]}
            onPress={() => setCategoryFilter('Payments')}
            activeOpacity={0.8}
          >
            <Feather
              name="credit-card"
              size={14}
              color={categoryFilter === 'Payments' ? '#ffffff' : '#475569'}
              style={{ marginRight: 6 }}
            />
            <Text
              style={[
                styles.pillText,
                categoryFilter === 'Payments' ? styles.pillTextActive : styles.pillTextInactive,
              ]}
            >
              Payments
            </Text>
          </TouchableOpacity>
        </View>

        {/* Accordion List */}
        <View style={styles.accordionList}>
          {filteredFaqs.map((item) => {
            const isExpanded = expandedFaqId === item.id;
            return (
              <View key={item.id} style={styles.faqCard}>
                <TouchableOpacity
                  style={styles.faqHeaderRow}
                  onPress={() => toggleAccordion(item.id)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.faqQuestion}>{item.question}</Text>
                  <Feather
                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                    size={18}
                    color="#475569"
                  />
                </TouchableOpacity>

                {isExpanded && (
                  <View style={styles.faqAnswerBody}>
                    <Text style={styles.faqAnswerText}>{item.answer}</Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* Sticky Bottom Still Need Help Lime Banner */}
        <View style={styles.stillNeedHelpCard}>
          <View style={styles.bannerLeftTextCol}>
            <Text style={styles.bannerTitle}>Still need help?</Text>
            <Text style={styles.bannerSub}>Our human team is online 24/7.</Text>
          </View>
          <TouchableOpacity
            style={styles.chatNowBtn}
            onPress={onOpenContactUs}
            activeOpacity={0.85}
          >
            <Text style={styles.chatNowText}>CHAT NOW</Text>
          </TouchableOpacity>
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
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ece8f5',
    borderRadius: 24,
    height: 48,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#0f172a',
    fontFamily: 'PlusJakartaSans-Regular',
  },
  filterPillsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  pillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  pillActive: {
    backgroundColor: '#4d7c0f',
  },
  pillInactive: {
    backgroundColor: '#ece8f5',
  },
  pillText: {
    fontSize: 12,
    fontWeight: '800',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  pillTextActive: {
    color: '#ffffff',
  },
  pillTextInactive: {
    color: '#475569',
  },
  accordionList: {
    gap: 12,
    marginBottom: 24,
  },
  faqCard: {
    backgroundColor: '#f5f3f9',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  faqHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  faqQuestion: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
    marginRight: 10,
    fontFamily: 'PlusJakartaSans-Bold',
  },
  faqAnswerBody: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  faqAnswerText: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 18,
    fontFamily: 'PlusJakartaSans-Regular',
  },
  stillNeedHelpCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#a2e52c',
    borderRadius: 24,
    padding: 16,
    marginBottom: 30,
  },
  bannerLeftTextCol: {
    flex: 1,
    marginRight: 10,
  },
  bannerTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1a2b0c',
    marginBottom: 2,
    fontFamily: 'PlusJakartaSans-Bold',
  },
  bannerSub: {
    fontSize: 11,
    color: '#365314',
    fontFamily: 'PlusJakartaSans-Regular',
  },
  chatNowBtn: {
    backgroundColor: '#4d7c0f',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  chatNowText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#ffffff',
    fontFamily: 'PlusJakartaSans-Bold',
  },
});

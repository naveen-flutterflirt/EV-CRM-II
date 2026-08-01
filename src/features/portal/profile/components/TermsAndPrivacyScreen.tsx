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

interface TermsAndPrivacyScreenProps {
  onBack: () => void;
}

export const TermsAndPrivacyScreen: React.FC<TermsAndPrivacyScreenProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'TERMS' | 'PRIVACY'>('TERMS');

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header Bar */}
      <View style={styles.headerBar}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.7}>
          <Feather name="arrow-left" size={22} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Terms & Privacy Policy</Text>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Tab Switcher */}
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'TERMS' && styles.activeTabBtn]}
            onPress={() => setActiveTab('TERMS')}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabBtnText, activeTab === 'TERMS' && styles.activeTabBtnText]}>
              Terms of Service
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'PRIVACY' && styles.activeTabBtn]}
            onPress={() => setActiveTab('PRIVACY')}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabBtnText, activeTab === 'PRIVACY' && styles.activeTabBtnText]}>
              Privacy Policy
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'TERMS' ? (
          <View style={styles.contentBlock}>
            <Text style={styles.lastUpdated}>Last Updated: January 15, 2026</Text>

            <View style={styles.sectionCard}>
              <Text style={styles.sectionHeading}>1. Acceptance of Terms</Text>
              <Text style={styles.bodyText}>
                By creating an account or accessing FlutterFlirt EV CRM services, you agree to comply with and be bound by these Terms of Service. These terms apply to all EV vehicle management, service bookings, roadside assistance, and customer portal features.
              </Text>
            </View>

            <View style={styles.sectionCard}>
              <Text style={styles.sectionHeading}>2. EV Service & Maintenance</Text>
              <Text style={styles.bodyText}>
                All maintenance schedules, battery diagnostic reports, and parts replacement guidelines are recommended based on official OEM specifications. Guaranteed warranties cover certified spare parts installed by authorized service technicians.
              </Text>
            </View>

            <View style={styles.sectionCard}>
              <Text style={styles.sectionHeading}>3. Customer Responsibilities</Text>
              <Text style={styles.bodyText}>
                You are responsible for maintaining the security of your account credentials and PIN. Any unauthorized activity performed under your profile must be reported to support immediately.
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.contentBlock}>
            <Text style={styles.lastUpdated}>Last Updated: January 15, 2026</Text>

            <View style={styles.sectionCard}>
              <Text style={styles.sectionHeading}>1. Data Collection & Telemetry</Text>
              <Text style={styles.bodyText}>
                We collect real-time battery health percentage, estimated range km, odometer readings, and GPS location only when authorized for RSA dispatch and live tracking services.
              </Text>
            </View>

            <View style={styles.sectionCard}>
              <Text style={styles.sectionHeading}>2. 256-Bit Encryption Security</Text>
              <Text style={styles.bodyText}>
                All personal information, payment methods, and profile credentials are encrypted in transit and at rest using industry-standard 256-bit AES cryptographic protocols.
              </Text>
            </View>

            <View style={styles.sectionCard}>
              <Text style={styles.sectionHeading}>3. User Privacy Rights</Text>
              <Text style={styles.bodyText}>
                You reserve the right to request a complete export of your personal data or invoke account deletion at any time by contacting compliance@flutterflirtev.com.
              </Text>
            </View>
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
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
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
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 20,
    padding: 4,
    marginBottom: 20,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 16,
  },
  activeTabBtn: {
    backgroundColor: '#4d7c0f',
  },
  tabBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748b',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  activeTabBtnText: {
    color: '#ffffff',
  },
  contentBlock: {
    paddingBottom: 40,
  },
  lastUpdated: {
    fontSize: 11,
    color: '#94a3b8',
    marginBottom: 16,
    fontFamily: 'PlusJakartaSans-Regular',
  },
  sectionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    borderColor: '#f1f0f7',
    borderWidth: 1,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 8,
    fontFamily: 'PlusJakartaSans-Bold',
  },
  bodyText: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 20,
    fontFamily: 'PlusJakartaSans-Regular',
  },
});

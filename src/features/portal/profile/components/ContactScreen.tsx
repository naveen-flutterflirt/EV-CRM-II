import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Linking,
  Platform,
  Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

interface ContactScreenProps {
  onBack: () => void;
}

export const ContactScreen: React.FC<ContactScreenProps> = ({ onBack }) => {
  const [expandedOption, setExpandedOption] = useState<'whatsapp' | 'call' | 'email' | null>('whatsapp');

  const handleWhatsappPress = () => {
    const msg = 'Opening WhatsApp Support Chat...';
    if (Platform.OS === 'web') window.alert(msg);
    else Alert.alert('WhatsApp Chat', msg);
  };

  const handleCallPress = () => {
    Linking.openURL('tel:+919876543210');
  };

  const handleEmailPress = () => {
    Linking.openURL('mailto:support@flutterflirtev.com');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Header */}
      <View style={styles.topHeader}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Feather name="arrow-left" size={20} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Contact</Text>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Top Lime Headset Graphic Badge */}
        <View style={styles.topGraphicWrap}>
          <View style={styles.limeGraphicCircle}>
            <Feather name="headphones" size={26} color="#1a2b0c" />
            <View style={styles.topSmallDot} />
          </View>
        </View>

        {/* Heading & Subtext */}
        <Text style={styles.mainTitle}>How can we help?</Text>
        <Text style={styles.subText}>
          Our team of experts is ready to assist you with any questions or issues.
        </Text>

        {/* Options Stack */}
        <View style={styles.optionsStack}>
          {/* WhatsApp Chat Option */}
          <TouchableOpacity
            style={styles.optionCard}
            onPress={handleWhatsappPress}
            activeOpacity={0.88}
          >
            <View style={styles.optionMainRow}>
              <View style={styles.optionIconBox}>
                <Feather name="message-square" size={18} color="#4d7c0f" />
              </View>
              <View style={styles.optionMeta}>
                <Text style={styles.optionTitle}>WhatsApp Chat</Text>
                <Text style={styles.optionSub}>FASTEST RESPONSE</Text>
              </View>
              <Feather name="chevron-up" size={18} color="#cbd5e1" />
            </View>
          </TouchableOpacity>

          {/* Call Support Option */}
          <TouchableOpacity
            style={styles.optionCard}
            onPress={handleCallPress}
            activeOpacity={0.88}
          >
            <View style={styles.optionMainRow}>
              <View style={styles.optionIconBox}>
                <Feather name="phone-call" size={18} color="#4d7c0f" />
              </View>
              <View style={styles.optionMeta}>
                <Text style={styles.optionTitle}>Call Support</Text>
                <Text style={styles.optionSub}>DIRECT LINE</Text>
              </View>
              <Feather name="chevron-up" size={18} color="#cbd5e1" />
            </View>
          </TouchableOpacity>

          {/* Email Us Option */}
          <TouchableOpacity
            style={styles.optionCard}
            onPress={handleEmailPress}
            activeOpacity={0.88}
          >
            <View style={styles.optionMainRow}>
              <View style={styles.optionIconBox}>
                <Feather name="mail" size={18} color="#4d7c0f" />
              </View>
              <View style={styles.optionMeta}>
                <Text style={styles.emailLabel}>Email us instead?</Text>
                <Text style={styles.emailValText}>support@flutterflirtev.com</Text>
              </View>
              <Feather name="external-link" size={16} color="#94a3b8" />
            </View>
          </TouchableOpacity>
        </View>

        {/* SUPPORT HOURS Card */}
        <View style={styles.supportHoursCard}>
          <View style={styles.greenAccentLine} />
          <View style={styles.hoursContent}>
            <View style={styles.hoursTitleRow}>
              <Feather name="clock" size={14} color="#4d7c0f" style={{ marginRight: 6 }} />
              <Text style={styles.hoursTitle}>SUPPORT HOURS</Text>
            </View>
            <Text style={styles.hoursText}>Monday - Friday: 08:00 - 20:00</Text>
            <Text style={styles.hoursText}>Weekend: 10:00 - 16:00</Text>
            <Text style={styles.currentTimeText}>
              Current time: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} (Local)
            </Text>
          </View>
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
  topGraphicWrap: {
    alignItems: 'center',
    marginBottom: 16,
  },
  limeGraphicCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#a2e52c',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  topSmallDot: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ffffff',
  },
  mainTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0f172a',
    textAlign: 'center',
    marginBottom: 6,
    fontFamily: 'PlusJakartaSans-Bold',
  },
  subText: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 24,
    paddingHorizontal: 10,
    fontFamily: 'PlusJakartaSans-Regular',
  },
  optionsStack: {
    gap: 12,
    marginBottom: 24,
  },
  optionCard: {
    backgroundColor: '#f5f3f9',
    borderRadius: 20,
    padding: 16,
  },
  optionMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionIconBox: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: '#eef6d6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  optionMeta: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 2,
    fontFamily: 'PlusJakartaSans-Bold',
  },
  optionSub: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: 0.5,
  },
  emailLabel: {
    fontSize: 11,
    color: '#64748b',
    marginBottom: 2,
    fontFamily: 'PlusJakartaSans-Regular',
  },
  emailValText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  supportHoursCard: {
    flexDirection: 'row',
    backgroundColor: '#f5f3f9',
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 40,
  },
  greenAccentLine: {
    width: 4,
    backgroundColor: '#4d7c0f',
  },
  hoursContent: {
    flex: 1,
    padding: 16,
  },
  hoursTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  hoursTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: 1,
    fontFamily: 'PlusJakartaSans-Bold',
  },
  hoursText: {
    fontSize: 12,
    color: '#334155',
    marginBottom: 4,
    fontFamily: 'PlusJakartaSans-Regular',
  },
  currentTimeText: {
    fontSize: 11,
    color: '#64748b',
    fontStyle: 'italic',
    marginTop: 6,
    fontFamily: 'PlusJakartaSans-Regular',
  },
});

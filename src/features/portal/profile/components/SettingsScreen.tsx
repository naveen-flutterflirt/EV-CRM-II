import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  SafeAreaView,
  Modal,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LanguageOption } from '../types';

interface SettingsScreenProps {
  pushNotifications: boolean;
  onTogglePushNotifications: (val: boolean) => void;
  selectedLanguage?: LanguageOption;
  onSelectLanguage?: (lang: LanguageOption) => void;
  onOpenSecurity?: () => void;
  onOpenTermsAndPrivacy?: () => void;
  onBack: () => void;
  onLogout?: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  pushNotifications,
  onTogglePushNotifications,
  selectedLanguage = 'English',
  onSelectLanguage,
  onOpenSecurity,
  onOpenTermsAndPrivacy,
  onBack,
}) => {
  const [showLanguageModal, setShowLanguageModal] = useState(false);

  const languages: LanguageOption[] = [
    'English',
    'Hindi (हिंदी)',
    'Spanish (Español)',
    'German (Deutsch)',
  ];

  const handleLanguageChoice = (lang: LanguageOption) => {
    if (onSelectLanguage) {
      onSelectLanguage(lang);
    }
    setShowLanguageModal(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Single Clean Header Bar */}
      <View style={styles.headerBar}>
        <View style={styles.headerLeftGroup}>
          <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.7}>
            <Feather name="arrow-left" size={22} color="#0f172a" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Settings</Text>
        </View>

        <View style={styles.avatarCircle}>
          <Feather name="settings" size={16} color="#ffffff" />
        </View>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Options Card */}
        <View style={styles.optionsCard}>
          {/* Push Notifications Toggle */}
          <View style={styles.optionRow}>
            <View style={styles.optionLeft}>
              <View style={styles.iconCircle}>
                <Feather name="bell" size={18} color="#475569" />
              </View>
              <Text style={styles.optionLabel}>Push notifications</Text>
            </View>
            <Switch
              value={pushNotifications}
              onValueChange={onTogglePushNotifications}
              trackColor={{ false: '#cbd5e1', true: '#4d7c0f' }}
              thumbColor={pushNotifications ? '#84cc16' : '#f8fafc'}
            />
          </View>

          <View style={styles.rowDivider} />

          {/* Security & Privacy */}
          <TouchableOpacity style={styles.optionRow} onPress={onOpenSecurity} activeOpacity={0.75}>
            <View style={styles.optionLeft}>
              <View style={styles.iconCircle}>
                <Feather name="shield" size={18} color="#475569" />
              </View>
              <Text style={styles.optionLabel}>Security & Privacy</Text>
            </View>
            <Feather name="chevron-right" size={18} color="#cbd5e1" />
          </TouchableOpacity>

          <View style={styles.rowDivider} />

          {/* Language Selection */}
          <TouchableOpacity
            style={styles.optionRow}
            onPress={() => setShowLanguageModal(true)}
            activeOpacity={0.75}
          >
            <View style={styles.optionLeft}>
              <View style={styles.iconCircle}>
                <Feather name="globe" size={18} color="#475569" />
              </View>
              <Text style={styles.optionLabel}>Language</Text>
            </View>
            <View style={styles.optionRightVal}>
              <Text style={styles.valText}>{selectedLanguage}</Text>
              <Feather name="chevron-right" size={18} color="#cbd5e1" />
            </View>
          </TouchableOpacity>

          <View style={styles.rowDivider} />

          {/* Terms & Privacy Policy */}
          <TouchableOpacity
            style={styles.optionRow}
            onPress={onOpenTermsAndPrivacy}
            activeOpacity={0.75}
          >
            <View style={styles.optionLeft}>
              <View style={styles.iconCircle}>
                <Feather name="file-text" size={18} color="#475569" />
              </View>
              <Text style={styles.optionLabel}>Terms & Privacy Policy</Text>
            </View>
            <Feather name="chevron-right" size={18} color="#cbd5e1" />
          </TouchableOpacity>

          <View style={styles.rowDivider} />

          {/* App Version */}
          <View style={styles.optionRow}>
            <View style={styles.optionLeft}>
              <View style={styles.iconCircle}>
                <Feather name="info" size={18} color="#475569" />
              </View>
              <Text style={styles.optionLabel}>App version</Text>
            </View>
            <Text style={styles.versionValText}>v1.0.0</Text>
          </View>
        </View>
      </ScrollView>

      {/* Language Selector Modal */}
      <Modal
        visible={showLanguageModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLanguageModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Language</Text>
              <TouchableOpacity onPress={() => setShowLanguageModal(false)}>
                <Feather name="x" size={20} color="#0f172a" />
              </TouchableOpacity>
            </View>

            <View style={styles.langList}>
              {languages.map((lang) => {
                const isSelected = selectedLanguage === lang;
                return (
                  <TouchableOpacity
                    key={lang}
                    style={[styles.langRow, isSelected && styles.selectedLangRow]}
                    onPress={() => handleLanguageChoice(lang)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.langText, isSelected && styles.selectedLangText]}>
                      {lang}
                    </Text>
                    {isSelected && <Feather name="check" size={18} color="#4d7c0f" />}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>
      </Modal>
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
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerLeftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0f172a',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#4d7c0f',
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  optionsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 28,
    borderColor: '#f1f0f7',
    borderWidth: 1,
    shadowColor: '#64748b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 2,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  optionLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  optionRightVal: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  valText: {
    fontSize: 13,
    color: '#64748b',
    fontFamily: 'PlusJakartaSans-Regular',
  },
  versionValText: {
    fontSize: 13,
    color: '#64748b',
    letterSpacing: 0.5,
    fontFamily: 'PlusJakartaSans-Regular',
  },
  rowDivider: {
    height: 1,
    backgroundColor: '#f1f5f9',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  langList: {
    gap: 8,
  },
  langRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: '#f8fafc',
  },
  selectedLangRow: {
    backgroundColor: '#edf6d6',
  },
  langText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
    fontFamily: 'PlusJakartaSans-Regular',
  },
  selectedLangText: {
    fontWeight: '800',
    color: '#4d7c0f',
    fontFamily: 'PlusJakartaSans-Bold',
  },
});

// Settings Screen
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useApp } from '../../contexts/AppContext';
import { CURRENCIES, getCurrencySymbol } from '../../utils/currencies';
import { LANGUAGE_NAMES, LangCode, useLang } from '../../utils/languages';
import { deletePin } from '../../hooks/useStorage';

export default function SettingsScreen() {
  const router = useRouter();
  const { budget, setBudget, language, setLanguage, currency, setCurrency } = useApp();
  const t = useLang(language);

  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [budgetInput, setBudgetInput] = useState(budget.toString());

  const handleSaveBudget = () => {
    const newBudget = parseFloat(budgetInput);
    if (isNaN(newBudget) || newBudget <= 0) {
      Alert.alert('Error', 'Please enter a valid budget');
      return;
    }
    setBudget(newBudget);
    setShowBudgetModal(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleLanguageSelect = (lang: LangCode) => {
    setLanguage(lang);
    setShowLanguageModal(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleCurrencySelect = (curr: string) => {
    setCurrency(curr);
    setShowCurrencyModal(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleResetPin = () => {
    Alert.alert(
      'Reset PIN',
      'Are you sure you want to reset your PIN? You will be logged out.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              await deletePin();
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              router.replace('/');
            } catch (error) {
              Alert.alert('Error', 'Failed to reset PIN');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{t.settings}</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* App Info */}
        <View style={styles.section}>
          <View style={styles.logoSection}>
            <Text style={styles.logo}>ADDIT</Text>
            <Text style={styles.tagline}>{t.appTagline}</Text>
            <Text style={styles.version}>Version 1.0.0</Text>
          </View>
        </View>

        {/* Budget */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.budget}</Text>
          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => {
              setBudgetInput(budget.toString());
              setShowBudgetModal(true);
            }}
            activeOpacity={0.7}
          >
            <View style={styles.settingLeft}>
              <Ionicons name="wallet" size={24} color="#00c896" />
              <Text style={styles.settingLabel}>{t.setBudget}</Text>
            </View>
            <View style={styles.settingRight}>
              <Text style={styles.settingValue}>
                {getCurrencySymbol(currency)}{budget.toFixed(2)}
              </Text>
              <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.4)" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          
          {/* Language */}
          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => setShowLanguageModal(true)}
            activeOpacity={0.7}
          >
            <View style={styles.settingLeft}>
              <Ionicons name="language" size={24} color="#0070f3" />
              <Text style={styles.settingLabel}>{t.language}</Text>
            </View>
            <View style={styles.settingRight}>
              <Text style={styles.settingValue}>
                {LANGUAGE_NAMES[language]}
              </Text>
              <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.4)" />
            </View>
          </TouchableOpacity>

          {/* Currency */}
          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => setShowCurrencyModal(true)}
            activeOpacity={0.7}
          >
            <View style={styles.settingLeft}>
              <Ionicons name="cash" size={24} color="#ffa500" />
              <Text style={styles.settingLabel}>{t.currency}</Text>
            </View>
            <View style={styles.settingRight}>
              <Text style={styles.settingValue}>{currency}</Text>
              <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.4)" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Security */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security</Text>
          <TouchableOpacity
            style={styles.settingItem}
            onPress={handleResetPin}
            activeOpacity={0.7}
          >
            <View style={styles.settingLeft}>
              <Ionicons name="key" size={24} color="#ff6b6b" />
              <Text style={styles.settingLabel}>{t.resetPin}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.4)" />
          </TouchableOpacity>
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.aboutText}>
            ADDIT is a smart shopping budget manager developed by AKS. Solutions.
            Track your expenses in real-time and never exceed your budget.
          </Text>
        </View>
      </ScrollView>

      {/* Budget Modal */}
      <Modal
        visible={showBudgetModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowBudgetModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t.setBudget}</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Enter budget amount"
              placeholderTextColor="rgba(255,255,255,0.4)"
              keyboardType="decimal-pad"
              value={budgetInput}
              onChangeText={setBudgetInput}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnCancel]}
                onPress={() => setShowBudgetModal(false)}
              >
                <Text style={styles.modalBtnText}>{t.cancel}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnConfirm]}
                onPress={handleSaveBudget}
              >
                <Text style={styles.modalBtnText}>{t.save}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Language Modal */}
      <Modal
        visible={showLanguageModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowLanguageModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t.language}</Text>
            <ScrollView style={styles.optionsList}>
              {(Object.keys(LANGUAGE_NAMES) as LangCode[]).map((lang) => (
                <TouchableOpacity
                  key={lang}
                  style={[
                    styles.optionItem,
                    language === lang && styles.optionItemActive,
                  ]}
                  onPress={() => handleLanguageSelect(lang)}
                >
                  <Text style={styles.optionText}>{LANGUAGE_NAMES[lang]}</Text>
                  {language === lang && (
                    <Ionicons name="checkmark" size={24} color="#00c896" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={[styles.modalBtn, styles.modalBtnCancel, { width: '100%' }]}
              onPress={() => setShowLanguageModal(false)}
            >
              <Text style={styles.modalBtnText}>{t.close}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Currency Modal */}
      <Modal
        visible={showCurrencyModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCurrencyModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t.currency}</Text>
            <ScrollView style={styles.optionsList}>
              {CURRENCIES.map((curr) => (
                <TouchableOpacity
                  key={curr.code}
                  style={[
                    styles.optionItem,
                    currency === curr.code && styles.optionItemActive,
                  ]}
                  onPress={() => handleCurrencySelect(curr.code)}
                >
                  <View>
                    <Text style={styles.optionText}>
                      {curr.symbol} {curr.code}
                    </Text>
                    <Text style={styles.optionSubtext}>{curr.name}</Text>
                  </View>
                  {currency === curr.code && (
                    <Ionicons name="checkmark" size={24} color="#00c896" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={[styles.modalBtn, styles.modalBtnCancel, { width: '100%' }]}
              onPress={() => setShowCurrencyModal(false)}
            >
              <Text style={styles.modalBtnText}>{t.close}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f1623',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.5)',
    textTransform: 'uppercase',
    letterSpacing: 1,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  logoSection: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  logo: {
    fontSize: 40,
    fontWeight: '800',
    color: '#00c896',
    letterSpacing: 2,
  },
  tagline: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 8,
  },
  version: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.4)',
    marginTop: 4,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginHorizontal: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingValue: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.6)',
  },
  aboutText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
    lineHeight: 20,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1a1f2e',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalInput: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    color: '#fff',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalBtn: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalBtnCancel: {
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  modalBtnConfirm: {
    backgroundColor: '#00c896',
  },
  modalBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  optionsList: {
    maxHeight: 400,
    marginBottom: 16,
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginBottom: 8,
  },
  optionItemActive: {
    backgroundColor: 'rgba(0,200,150,0.15)',
    borderWidth: 1,
    borderColor: '#00c896',
  },
  optionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  optionSubtext: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 2,
  },
});

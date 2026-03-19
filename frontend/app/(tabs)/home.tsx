// Home Screen - Shopping List
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
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useApp } from '../../contexts/AppContext';
import { BudgetBar } from '../../components/BudgetBar';
import { ItemCard } from '../../components/ItemCard';
import { Scanner } from '../../components/Scanner';
import { getCurrencySymbol } from '../../utils/currencies';
import { useLang } from '../../utils/languages';

export default function HomeScreen() {
  const { items, addItem, updateItem, removeItem, clearItems, budget, total, remaining, currency, language, saveSession } = useApp();
  const t = useLang(language);
  const currencySymbol = getCurrencySymbol(currency);

  const [showScanner, setShowScanner] = useState(false);
  const [scannerMode, setScannerMode] = useState<'label' | 'barcode'>('label');
  const [showAddItem, setShowAddItem] = useState(false);
  const [itemName, setItemName] = useState('');
  const [itemPrice, setItemPrice] = useState('');

  const handleScanPress = (mode: 'label' | 'barcode') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setScannerMode(mode);
    setShowScanner(true);
  };

  const handlePriceDetected = (price: number, name?: string) => {
    addItem({
      name: name || 'Scanned Item',
      price,
      quantity: 1,
      emoji: getRandomEmoji(),
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleAddManualItem = () => {
    const price = parseFloat(itemPrice);
    if (!itemName.trim()) {
      Alert.alert('Error', 'Please enter item name');
      return;
    }
    if (isNaN(price) || price <= 0) {
      Alert.alert('Error', 'Please enter valid price');
      return;
    }

    addItem({
      name: itemName,
      price,
      quantity: 1,
      emoji: getRandomEmoji(),
    });

    setItemName('');
    setItemPrice('');
    setShowAddItem(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleClearAll = () => {
    Alert.alert(
      t.clearAll,
      'Are you sure you want to clear all items?',
      [
        { text: t.cancel, style: 'cancel' },
        {
          text: t.clearAll,
          style: 'destructive',
          onPress: () => {
            clearItems();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          },
        },
      ]
    );
  };

  const handleSaveSession = async () => {
    if (items.length === 0) {
      Alert.alert('Error', 'Add items to save session');
      return;
    }
    try {
      await saveSession();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Success', t.sessionSaved);
      clearItems();
    } catch (error) {
      Alert.alert('Error', 'Failed to save session');
    }
  };

  const getRandomEmoji = () => {
    const emojis = ['🛒', '🍎', '🥖', '🥛', '🧀', '🥩', '🍕', '🥗', '🍓', '🍊', '🥦', '🍞'];
    return emojis[Math.floor(Math.random() * emojis.length)];
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>{t.myList}</Text>
            <Text style={styles.subtitle}>
              {items.length} {t.items}
            </Text>
          </View>
          {items.length > 0 && (
            <View style={styles.headerButtons}>
              <TouchableOpacity
                style={styles.headerBtn}
                onPress={handleSaveSession}
              >
                <Ionicons name="save" size={20} color="#00c896" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.headerBtn}
                onPress={handleClearAll}
              >
                <Ionicons name="trash" size={20} color="#ff6b6b" />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Budget Bar */}
        <BudgetBar total={total} budget={budget} currencySymbol={currencySymbol} />

        {/* Items List */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {items.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="cart-outline" size={64} color="rgba(255,255,255,0.2)" />
              <Text style={styles.emptyText}>{t.emptyList}</Text>
              <Text style={styles.emptySubtext}>Add items using the buttons below</Text>
            </View>
          ) : (
            items.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                currencySymbol={currencySymbol}
                onIncrease={() => updateItem(item.id, { quantity: item.quantity + 1 })}
                onDecrease={() => {
                  if (item.quantity > 1) {
                    updateItem(item.id, { quantity: item.quantity - 1 });
                  } else {
                    removeItem(item.id);
                  }
                }}
                onDelete={() => removeItem(item.id)}
              />
            ))
          )}
        </ScrollView>

        {/* Action Buttons */}
        {!showAddItem && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionBtn, styles.primaryBtn]}
              onPress={() => setShowAddItem(true)}
              activeOpacity={0.8}
            >
              <Ionicons name="add-circle" size={24} color="#fff" />
              <Text style={styles.actionBtnText}>{t.addItem}</Text>
            </TouchableOpacity>

            <View style={styles.scanButtons}>
              <TouchableOpacity
                style={[styles.actionBtn, styles.secondaryBtn]}
                onPress={() => handleScanPress('label')}
                activeOpacity={0.8}
              >
                <Ionicons name="pricetag" size={20} color="#fff" />
                <Text style={styles.actionBtnSmallText}>Label</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionBtn, styles.secondaryBtn]}
                onPress={() => handleScanPress('barcode')}
                activeOpacity={0.8}
              >
                <Ionicons name="barcode" size={20} color="#fff" />
                <Text style={styles.actionBtnSmallText}>Barcode</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Manual Add Item Form */}
        {showAddItem && (
          <View style={styles.addItemForm}>
            <View style={styles.formHeader}>
              <Text style={styles.formTitle}>Add Item Manually</Text>
              <TouchableOpacity onPress={() => setShowAddItem(false)}>
                <Ionicons name="close" size={24} color="rgba(255,255,255,0.6)" />
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.input}
              placeholder="Item name"
              placeholderTextColor="rgba(255,255,255,0.4)"
              value={itemName}
              onChangeText={setItemName}
            />
            <TextInput
              style={styles.input}
              placeholder="Price"
              placeholderTextColor="rgba(255,255,255,0.4)"
              keyboardType="decimal-pad"
              value={itemPrice}
              onChangeText={setItemPrice}
            />
            <TouchableOpacity
              style={styles.addBtn}
              onPress={handleAddManualItem}
            >
              <Text style={styles.addBtnText}>Add Item</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Scanner Modal */}
        <Scanner
          visible={showScanner}
          mode={scannerMode}
          onClose={() => setShowScanner(false)}
          onPriceDetected={handlePriceDetected}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f1623',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 2,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  headerBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.4)',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.3)',
    marginTop: 8,
  },
  actionButtons: {
    padding: 16,
    gap: 12,
  },
  scanButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    padding: 16,
    gap: 8,
  },
  primaryBtn: {
    backgroundColor: '#00c896',
  },
  secondaryBtn: {
    flex: 1,
    backgroundColor: '#0070f3',
  },
  actionBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  actionBtnSmallText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  addItemForm: {
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#fff',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  addBtn: {
    backgroundColor: '#00c896',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  addBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});

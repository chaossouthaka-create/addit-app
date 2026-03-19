// Scanner component with mock data (camera features to be enabled with EAS build)
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

interface ScannerProps {
  visible: boolean;
  mode: 'label' | 'barcode';
  onClose: () => void;
  onPriceDetected: (price: number, name?: string) => void;
}

// Mock product database for barcode testing
const MOCK_PRODUCTS: Record<string, { name: string; price: number }> = {
  '3017620422003': { name: 'Nutella 400g', price: 4.99 },
  '5449000000996': { name: 'Coca-Cola 1.5L', price: 2.49 },
  '8076809513524': { name: 'Barilla Pasta 500g', price: 1.89 },
  '4005808890675': { name: 'Milka Chocolate', price: 2.99 },
  '3083680085304': { name: 'Président Butter', price: 3.49 },
};

export const Scanner: React.FC<ScannerProps> = ({ visible, mode, onClose, onPriceDetected }) => {
  const [manualPrice, setManualPrice] = useState('');
  const [manualBarcode, setManualBarcode] = useState('');
  const [manualName, setManualName] = useState('');

  const handleMockScan = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    
    if (mode === 'label' && manualPrice) {
      // Mock OCR price scanning
      const price = parseFloat(manualPrice.replace(',', '.'));
      if (!isNaN(price) && price > 0) {
        onPriceDetected(price, manualName || 'Scanned Item');
        setManualPrice('');
        setManualName('');
        onClose();
      } else {
        Alert.alert('Invalid Price', 'Please enter a valid price');
      }
    } else if (mode === 'barcode' && manualBarcode) {
      // Mock barcode scanning with Open Food Facts lookup
      const product = MOCK_PRODUCTS[manualBarcode];
      if (product) {
        onPriceDetected(product.price, product.name);
        setManualBarcode('');
        onClose();
      } else {
        // Simulate API call failure - allow manual entry
        Alert.alert(
          'Product Not Found',
          'Would you like to add it manually?',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Add Manually', 
              onPress: () => {
                setManualBarcode('');
                // Stay on scanner, switch to manual mode
              }
            },
          ]
        );
      }
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.title}>
            {mode === 'label' ? 'Scan Price Label' : 'Scan Barcode'}
          </Text>
          <View style={{ width: 28 }} />
        </View>

        {/* Mock Camera View */}
        <View style={styles.cameraPlaceholder}>
          <Ionicons 
            name={mode === 'label' ? 'pricetag' : 'barcode'} 
            size={80} 
            color="rgba(255,255,255,0.3)" 
          />
          <Text style={styles.mockText}>
            📸 Camera Preview
          </Text>
          <Text style={styles.mockSubtext}>
            (Real camera requires EAS build)
          </Text>
          <View style={styles.scanFrame} />
        </View>

        {/* Manual Entry for Testing */}
        <View style={styles.manualEntry}>
          <Text style={styles.manualTitle}>Manual Entry (Testing Mode)</Text>
          
          {mode === 'label' ? (
            <>
              <TextInput
                style={styles.input}
                placeholder="Item name (optional)"
                placeholderTextColor="rgba(255,255,255,0.4)"
                value={manualName}
                onChangeText={setManualName}
              />
              <TextInput
                style={styles.input}
                placeholder="Enter price (e.g., 4.99)"
                placeholderTextColor="rgba(255,255,255,0.4)"
                keyboardType="decimal-pad"
                value={manualPrice}
                onChangeText={setManualPrice}
              />
            </>
          ) : (
            <>
              <TextInput
                style={styles.input}
                placeholder="Enter barcode"
                placeholderTextColor="rgba(255,255,255,0.4)"
                keyboardType="number-pad"
                value={manualBarcode}
                onChangeText={setManualBarcode}
              />
              <Text style={styles.hint}>
                Try: 3017620422003 (Nutella)
              </Text>
            </>
          )}

          <TouchableOpacity 
            style={styles.scanButton}
            onPress={handleMockScan}
          >
            <Ionicons name="scan" size={24} color="#fff" />
            <Text style={styles.scanButtonText}>
              {mode === 'label' ? 'Add Item' : 'Lookup Product'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Info */}
        <View style={styles.info}>
          <Ionicons name="information-circle-outline" size={20} color="rgba(255,255,255,0.6)" />
          <Text style={styles.infoText}>
            {mode === 'label' 
              ? 'Point camera at price tag to automatically extract price'
              : 'Scan product barcode to get name and price from database'}
          </Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f1623',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
  },
  closeBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  cameraPlaceholder: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  mockText: {
    fontSize: 24,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 16,
  },
  mockSubtext: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.3)',
    marginTop: 8,
  },
  scanFrame: {
    position: 'absolute',
    width: 280,
    height: 180,
    borderWidth: 3,
    borderColor: '#00c896',
    borderRadius: 16,
    backgroundColor: 'transparent',
  },
  manualEntry: {
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  manualTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 12,
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
  hint: {
    fontSize: 12,
    color: 'rgba(0,200,150,0.8)',
    marginBottom: 12,
  },
  scanButton: {
    backgroundColor: '#00c896',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  scanButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  info: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    lineHeight: 18,
  },
});

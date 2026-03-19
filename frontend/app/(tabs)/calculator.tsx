// Calculator Screen
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useApp } from '../../contexts/AppContext';
import { getCurrencySymbol } from '../../utils/currencies';
import { useLang } from '../../utils/languages';

export default function CalculatorScreen() {
  const { addItem, currency, language } = useApp();
  const t = useLang(language);
  const currencySymbol = getCurrencySymbol(currency);

  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [newNumber, setNewNumber] = useState(true);

  const handleNumber = (num: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    if (newNumber) {
      setDisplay(num);
      setNewNumber(false);
    } else {
      if (display === '0') {
        setDisplay(num);
      } else {
        setDisplay(display + num);
      }
    }
  };

  const handleDecimal = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (!display.includes('.')) {
      setDisplay(display + '.');
      setNewNumber(false);
    }
  };

  const handleOperation = (op: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const current = parseFloat(display);
    
    if (previousValue !== null && operation && !newNumber) {
      const result = calculate(previousValue, current, operation);
      setDisplay(result.toString());
      setPreviousValue(result);
    } else {
      setPreviousValue(current);
    }
    
    setOperation(op);
    setNewNumber(true);
  };

  const handleEquals = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    const current = parseFloat(display);
    
    if (previousValue !== null && operation) {
      const result = calculate(previousValue, current, operation);
      setDisplay(result.toString());
      setPreviousValue(null);
      setOperation(null);
      setNewNumber(true);
    }
  };

  const calculate = (a: number, b: number, op: string): number => {
    switch (op) {
      case '+':
        return a + b;
      case '-':
        return a - b;
      case '×':
        return a * b;
      case '÷':
        return b !== 0 ? a / b : 0;
      default:
        return b;
    }
  };

  const handleClear = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setNewNumber(true);
  };

  const handleDelete = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay('0');
      setNewNumber(true);
    }
  };

  const handleAddToList = () => {
    const price = parseFloat(display);
    
    if (isNaN(price) || price <= 0) {
      Alert.alert('Error', 'Please calculate a valid amount');
      return;
    }

    addItem({
      name: 'Calculator Result',
      price,
      quantity: 1,
      emoji: '🧮',
    });

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('Success', 'Added to shopping list!');
    handleClear();
  };

  const buttons = [
    ['C', '⌫', '÷', '×'],
    ['7', '8', '9', '-'],
    ['4', '5', '6', '+'],
    ['1', '2', '3', '='],
    ['0', '.', '', ''],
  ];

  const getButtonStyle = (btn: string) => {
    if (btn === 'C' || btn === '⌫') return [styles.button, styles.functionBtn];
    if (['+', '-', '×', '÷', '='].includes(btn)) return [styles.button, styles.operatorBtn];
    if (btn === '0') return [styles.button, styles.zeroBtn];
    return styles.button;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{t.calculator}</Text>
      </View>

      {/* Display */}
      <View style={styles.displayContainer}>
        {operation && previousValue !== null && (
          <Text style={styles.operation}>
            {previousValue} {operation}
          </Text>
        )}
        <Text style={styles.display}>
          {currencySymbol}{parseFloat(display).toFixed(2)}
        </Text>
      </View>

      {/* Buttons */}
      <View style={styles.buttonsContainer}>
        {buttons.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {row.map((btn, colIndex) => {
              if (btn === '') {
                return <View key={colIndex} style={styles.button} />;
              }
              return (
                <TouchableOpacity
                  key={colIndex}
                  style={getButtonStyle(btn)}
                  onPress={() => {
                    if (btn === 'C') handleClear();
                    else if (btn === '⌫') handleDelete();
                    else if (btn === '=') handleEquals();
                    else if (btn === '.') handleDecimal();
                    else if (['+', '-', '×', '÷'].includes(btn)) handleOperation(btn);
                    else handleNumber(btn);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.buttonText}>{btn}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>

      {/* Add to List Button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={handleAddToList}
        activeOpacity={0.8}
      >
        <Ionicons name="add-circle" size={24} color="#fff" />
        <Text style={styles.addButtonText}>{t.addToList}</Text>
      </TouchableOpacity>
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
  displayContainer: {
    padding: 24,
    alignItems: 'flex-end',
    minHeight: 140,
    justifyContent: 'flex-end',
  },
  operation: {
    fontSize: 20,
    color: 'rgba(255,255,255,0.5)',
    marginBottom: 8,
  },
  display: {
    fontSize: 48,
    fontWeight: '700',
    color: '#fff',
  },
  buttonsContainer: {
    flex: 1,
    padding: 16,
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    height: 70,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  functionBtn: {
    backgroundColor: 'rgba(255,107,107,0.2)',
  },
  operatorBtn: {
    backgroundColor: '#0070f3',
  },
  zeroBtn: {
    flex: 2,
  },
  buttonText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#fff',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00c896',
    margin: 16,
    padding: 18,
    borderRadius: 14,
    gap: 8,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});

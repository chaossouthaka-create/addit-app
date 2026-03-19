// PIN Authentication Screen
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { NumPad } from '../components/NumPad';
import { getPin, savePin } from '../hooks/useStorage';
import * as Haptics from 'expo-haptics';

export default function PinScreen() {
  const router = useRouter();
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [isCreatingPin, setIsCreatingPin] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [savedPin, setSavedPin] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    checkExistingPin();
  }, []);

  const checkExistingPin = async () => {
    const existing = await getPin();
    setSavedPin(existing);
    if (!existing) {
      setIsCreatingPin(true);
    }
  };

  const handlePinPress = (digit: string) => {
    setError('');
    
    if (isConfirming) {
      if (confirmPin.length < 6) {
        const newConfirmPin = confirmPin + digit;
        setConfirmPin(newConfirmPin);
        
        if (newConfirmPin.length === 6) {
          validatePins(pin, newConfirmPin);
        }
      }
    } else {
      if (pin.length < 6) {
        const newPin = pin + digit;
        setPin(newPin);
        
        if (newPin.length === 6) {
          if (isCreatingPin) {
            setIsConfirming(true);
          } else {
            validateLogin(newPin);
          }
        }
      }
    }
  };

  const handleDelete = () => {
    setError('');
    if (isConfirming) {
      setConfirmPin(prev => prev.slice(0, -1));
    } else {
      setPin(prev => prev.slice(0, -1));
    }
  };

  const validatePins = async (originalPin: string, confirmation: string) => {
    if (originalPin === confirmation) {
      try {
        await savePin(originalPin);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        router.replace('/(tabs)/home');
      } catch (error) {
        setError('Error saving PIN');
        resetPin();
      }
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setError('PINs do not match');
      setTimeout(() => resetPin(), 1500);
    }
  };

  const validateLogin = async (enteredPin: string) => {
    if (enteredPin === savedPin) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/(tabs)/home');
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setError('Wrong PIN');
      setTimeout(() => setPin(''), 1500);
    }
  };

  const resetPin = () => {
    setPin('');
    setConfirmPin('');
    setIsConfirming(false);
  };

  const getPinDots = (currentPin: string) => {
    return Array.from({ length: 6 }, (_, i) => (
      <View
        key={i}
        style={[
          styles.dot,
          i < currentPin.length && styles.dotFilled,
          error && styles.dotError,
        ]}
      />
    ));
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>ADDIT</Text>
          <Text style={styles.tagline}>Your Smart Shopping Budget</Text>
        </View>

        {/* Title */}
        <Text style={styles.title}>
          {isCreatingPin
            ? isConfirming
              ? 'Confirm your PIN'
              : 'Create a 6-digit PIN'
            : 'Enter your PIN'}
        </Text>

        {/* PIN Dots */}
        <View style={styles.dotsContainer}>
          {getPinDots(isConfirming ? confirmPin : pin)}
        </View>

        {/* Error Message */}
        {error ? (
          <Text style={styles.error}>{error}</Text>
        ) : (
          <View style={styles.errorPlaceholder} />
        )}

        {/* NumPad */}
        <NumPad onPress={handlePinPress} onDelete={handleDelete} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f1623',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logo: {
    fontSize: 48,
    fontWeight: '800',
    color: '#00c896',
    letterSpacing: 2,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 32,
    textAlign: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 16,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  dotFilled: {
    backgroundColor: '#00c896',
    borderColor: '#00c896',
  },
  dotError: {
    backgroundColor: '#ff6b6b',
    borderColor: '#ff6b6b',
  },
  error: {
    fontSize: 14,
    color: '#ff6b6b',
    marginBottom: 24,
    height: 20,
  },
  errorPlaceholder: {
    height: 20,
    marginBottom: 24,
  },
});

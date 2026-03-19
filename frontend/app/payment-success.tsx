// Payment Success Screen
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as Haptics from 'expo-haptics';

const BACKEND_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_URL || process.env.EXPO_PUBLIC_BACKEND_URL;

export default function PaymentSuccessScreen() {
  const router = useRouter();
  const { session_id } = useLocalSearchParams();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    verifyPayment();
  }, []);

  const verifyPayment = async () => {
    const maxAttempts = 10;
    const pollInterval = 2000;

    try {
      const response = await fetch(`${BACKEND_URL}/api/payments/status/${session_id}`);
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.payment_status === 'paid') {
          // Payment successful!
          await AsyncStorage.setItem('addit_purchased', 'true');
          setStatus('success');
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          
          // Redirect to home after 2 seconds
          setTimeout(() => {
            router.replace('/(tabs)/home');
          }, 2000);
          return;
        }
      }

      // Continue polling if not paid yet
      if (attempts < maxAttempts) {
        setTimeout(() => {
          setAttempts(attempts + 1);
          verifyPayment();
        }, pollInterval);
      } else {
        setStatus('error');
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
      if (attempts < maxAttempts) {
        setTimeout(() => {
          setAttempts(attempts + 1);
          verifyPayment();
        }, pollInterval);
      } else {
        setStatus('error');
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {status === 'verifying' && (
          <>
            <ActivityIndicator size="large" color="#00c896" />
            <Text style={styles.title}>Verifying Payment...</Text>
            <Text style={styles.subtitle}>Please wait while we confirm your purchase</Text>
          </>
        )}

        {status === 'success' && (
          <>
            <Ionicons name="checkmark-circle" size={80} color="#00c896" />
            <Text style={styles.title}>Payment Successful!</Text>
            <Text style={styles.subtitle}>Thank you for purchasing ADDIT</Text>
            <Text style={styles.info}>Redirecting to app...</Text>
          </>
        )}

        {status === 'error' && (
          <>
            <Ionicons name="alert-circle" size={80} color="#ff6b6b" />
            <Text style={styles.title}>Payment Verification Failed</Text>
            <Text style={styles.subtitle}>Please restart the app to try again</Text>
          </>
        )}
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
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    gap: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
  },
  info: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 16,
  },
});

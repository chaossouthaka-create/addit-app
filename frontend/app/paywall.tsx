// Paywall Screen - Shown after PIN creation
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const BACKEND_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_URL || process.env.EXPO_PUBLIC_BACKEND_URL;
const APP_PRICE = '$3.99';
const DEVICE_ID_KEY = 'addit_device_id';

export default function PaywallScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [checkingPurchase, setCheckingPurchase] = useState(false);

  const getDeviceId = async () => {
    let deviceId = await AsyncStorage.getItem(DEVICE_ID_KEY);
    if (!deviceId) {
      deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await AsyncStorage.setItem(DEVICE_ID_KEY, deviceId);
    }
    return deviceId;
  };

  const checkPurchaseStatus = async () => {
    setCheckingPurchase(true);
    try {
      const deviceId = await getDeviceId();
      const response = await fetch(`${BACKEND_URL}/api/purchases/check/${deviceId}`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.purchased) {
          // User has already purchased
          await AsyncStorage.setItem('addit_purchased', 'true');
          router.replace('/(tabs)/home');
          return true;
        }
      }
      return false;
    } catch (err) {
      console.error('Error checking purchase:', err);
      return false;
    } finally {
      setCheckingPurchase(false);
    }
  };

  const handlePurchase = async () => {
    setLoading(true);
    setError('');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const deviceId = await getDeviceId();
      
      // Get origin URL
      const originUrl = Platform.OS === 'web' 
        ? window.location.origin 
        : BACKEND_URL.replace('/api', '');

      // Create checkout session
      const response = await fetch(`${BACKEND_URL}/api/payments/create-checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          device_id: deviceId,
          origin_url: originUrl,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const data = await response.json();

      // Open Stripe checkout
      if (Platform.OS === 'web') {
        // For web, redirect to Stripe
        window.location.href = data.checkout_url;
      } else {
        // For mobile, open in browser
        await Linking.openURL(data.checkout_url);
        
        // Start polling for payment completion
        pollPaymentStatus(data.session_id);
      }
    } catch (err: any) {
      setError(err.message || 'Payment failed. Please try again.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  };

  const pollPaymentStatus = async (sessionId: string, attempts = 0) => {
    const maxAttempts = 30; // Poll for 1 minute (30 x 2 seconds)
    const pollInterval = 2000;

    if (attempts >= maxAttempts) {
      setError('Payment verification timed out. Please restart the app.');
      return;
    }

    try {
      const response = await fetch(`${BACKEND_URL}/api/payments/status/${sessionId}`);
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.payment_status === 'paid') {
          // Payment successful!
          await AsyncStorage.setItem('addit_purchased', 'true');
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          router.replace('/(tabs)/home');
          return;
        }
      }

      // Continue polling
      setTimeout(() => pollPaymentStatus(sessionId, attempts + 1), pollInterval);
    } catch (err) {
      console.error('Error polling payment:', err);
      setTimeout(() => pollPaymentStatus(sessionId, attempts + 1), pollInterval);
    }
  };

  // Check purchase status on mount
  React.useEffect(() => {
    checkPurchaseStatus();
  }, []);

  if (checkingPurchase) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00c896" />
          <Text style={styles.loadingText}>Checking purchase status...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>ADDIT</Text>
          <Text style={styles.tagline}>Your Smart Shopping Budget</Text>
        </View>

        {/* Features */}
        <View style={styles.featuresContainer}>
          <Text style={styles.featuresTitle}>Get Full Access</Text>
          
          <View style={styles.feature}>
            <Ionicons name="checkmark-circle" size={24} color="#00c896" />
            <Text style={styles.featureText}>Unlimited shopping lists</Text>
          </View>
          
          <View style={styles.feature}>
            <Ionicons name="checkmark-circle" size={24} color="#00c896" />
            <Text style={styles.featureText}>Real-time budget tracking</Text>
          </View>
          
          <View style={styles.feature}>
            <Ionicons name="checkmark-circle" size={24} color="#00c896" />
            <Text style={styles.featureText}>Scanner & calculator</Text>
          </View>
          
          <View style={styles.feature}>
            <Ionicons name="checkmark-circle" size={24} color="#00c896" />
            <Text style={styles.featureText}>Full history & analytics</Text>
          </View>
          
          <View style={styles.feature}>
            <Ionicons name="checkmark-circle" size={24} color="#00c896" />
            <Text style={styles.featureText}>8 languages, 10 currencies</Text>
          </View>
          
          <View style={styles.feature}>
            <Ionicons name="checkmark-circle" size={24} color="#00c896" />
            <Text style={styles.featureText}>No ads, no subscriptions</Text>
          </View>
        </View>

        {/* Price */}
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>One-Time Purchase</Text>
          <Text style={styles.price}>{APP_PRICE}</Text>
          <Text style={styles.priceSubtext}>Pay once, use forever</Text>
        </View>

        {/* Error */}
        {error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : null}

        {/* Purchase Button */}
        <TouchableOpacity
          style={[styles.purchaseBtn, loading && styles.purchaseBtnDisabled]}
          onPress={handlePurchase}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="card" size={24} color="#fff" />
              <Text style={styles.purchaseBtnText}>Purchase with Card</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Payment Methods */}
        <View style={styles.paymentMethods}>
          <Ionicons name="card-outline" size={20} color="rgba(255,255,255,0.6)" />
          <Ionicons name="logo-apple" size={20} color="rgba(255,255,255,0.6)" />
          <Ionicons name="logo-google" size={20} color="rgba(255,255,255,0.6)" />
          <Text style={styles.paymentMethodsText}>Secure payment by Stripe</Text>
        </View>

        {/* Info */}
        <Text style={styles.infoText}>
          Powered by Stripe. Your payment information is secure and encrypted.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f1623',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    fontSize: 48,
    fontWeight: '800',
    color: '#00c896',
    letterSpacing: 2,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 1,
  },
  featuresContainer: {
    gap: 16,
  },
  featuresTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
  },
  priceContainer: {
    alignItems: 'center',
    marginVertical: 32,
  },
  priceLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 8,
  },
  price: {
    fontSize: 56,
    fontWeight: '800',
    color: '#00c896',
    marginBottom: 4,
  },
  priceSubtext: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
  },
  errorText: {
    fontSize: 14,
    color: '#ff6b6b',
    textAlign: 'center',
    marginBottom: 16,
  },
  purchaseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00c896',
    paddingVertical: 18,
    borderRadius: 14,
    gap: 12,
  },
  purchaseBtnDisabled: {
    opacity: 0.6,
  },
  purchaseBtnText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  paymentMethods: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginTop: 16,
  },
  paymentMethodsText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
  },
  infoText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 18,
  },
});

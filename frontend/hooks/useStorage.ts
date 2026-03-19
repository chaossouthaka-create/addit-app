// Secure storage utilities for ADDIT
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const PIN_KEY = 'addit_pin';

// PIN Management - Always use AsyncStorage (secure enough for demo, works on all platforms)
// Note: On production native apps, this should be replaced with SecureStore
export const savePin = async (pin: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(PIN_KEY, pin);
  } catch (error) {
    console.error('Error saving PIN:', error);
    throw error;
  }
};

export const getPin = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(PIN_KEY);
  } catch (error) {
    console.error('Error getting PIN:', error);
    return null;
  }
};

export const deletePin = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(PIN_KEY);
  } catch (error) {
    console.error('Error deleting PIN:', error);
    throw error;
  }
};

// App Data Storage - AsyncStorage
export const saveData = async <T>(key: string, value: T): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
  } catch (error) {
    console.error(`Error saving ${key}:`, error);
    throw error;
  }
};

export const loadData = async <T>(key: string, fallback: T): Promise<T> => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : fallback;
  } catch (error) {
    console.error(`Error loading ${key}:`, error);
    return fallback;
  }
};

export const deleteData = async (key: string): Promise<void> => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error(`Error deleting ${key}:`, error);
    throw error;
  }
};

// Storage Keys
export const STORAGE_KEYS = {
  SHOPPING_LIST: 'addit_shopping_list',
  BUDGET: 'addit_budget',
  LANGUAGE: 'addit_language',
  CURRENCY: 'addit_currency',
  HISTORY: 'addit_history',
};

// Global app context for ADDIT
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import { STORAGE_KEYS } from '../hooks/useStorage';
import { LangCode } from '../utils/languages';

export interface ShoppingItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  emoji?: string;
}

export interface ShoppingSession {
  date: string;
  items: ShoppingItem[];
  total: number;
  budget: number;
}

interface AppContextType {
  // Shopping List
  items: ShoppingItem[];
  addItem: (item: Omit<ShoppingItem, 'id'>) => void;
  updateItem: (id: string, updates: Partial<ShoppingItem>) => void;
  removeItem: (id: string) => void;
  clearItems: () => void;
  
  // Budget
  budget: number;
  setBudget: (amount: number) => void;
  
  // Language
  language: LangCode;
  setLanguage: (lang: LangCode) => void;
  
  // Currency
  currency: string;
  setCurrency: (curr: string) => void;
  
  // History
  saveSession: () => Promise<void>;
  getHistory: (period: 'day' | 'week' | 'month' | 'year') => Promise<ShoppingSession[]>;
  
  // Computed
  total: number;
  remaining: number;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [budget, setBudgetState] = useState<number>(100);
  const [language, setLanguageState] = useState<LangCode>('en');
  const [currency, setCurrencyState] = useState<string>('USD');
  const [isLoaded, setIsLoaded] = useState(false);

  // Load data on mount
  useEffect(() => {
    loadAppData();
  }, []);

  // Save items whenever they change
  useEffect(() => {
    if (isLoaded) {
      AsyncStorage.setItem(STORAGE_KEYS.SHOPPING_LIST, JSON.stringify(items));
    }
  }, [items, isLoaded]);

  const loadAppData = async () => {
    try {
      // Load shopping list
      const savedItems = await AsyncStorage.getItem(STORAGE_KEYS.SHOPPING_LIST);
      if (savedItems) {
        setItems(JSON.parse(savedItems));
      }

      // Load budget
      const savedBudget = await AsyncStorage.getItem(STORAGE_KEYS.BUDGET);
      if (savedBudget) {
        setBudgetState(parseFloat(savedBudget));
      }

      // Load language (detect from device if not set)
      const savedLanguage = await AsyncStorage.getItem(STORAGE_KEYS.LANGUAGE);
      if (savedLanguage) {
        setLanguageState(savedLanguage as LangCode);
      } else {
        const deviceLang = Localization.getLocales()[0]?.languageCode as LangCode;
        if (['en', 'fr', 'de', 'es', 'pt', 'ja', 'ko', 'zh'].includes(deviceLang)) {
          setLanguageState(deviceLang);
        }
      }

      // Load currency
      const savedCurrency = await AsyncStorage.getItem(STORAGE_KEYS.CURRENCY);
      if (savedCurrency) {
        setCurrencyState(savedCurrency);
      } else {
        // Detect from device locale
        const deviceCurrency = Localization.getLocales()[0]?.currencyCode;
        if (deviceCurrency) {
          setCurrencyState(deviceCurrency);
        }
      }

      setIsLoaded(true);
    } catch (error) {
      console.error('Error loading app data:', error);
      setIsLoaded(true);
    }
  };

  const addItem = (item: Omit<ShoppingItem, 'id'>) => {
    const newItem: ShoppingItem = {
      ...item,
      id: Date.now().toString() + Math.random().toString(36),
    };
    setItems(prev => [...prev, newItem]);
  };

  const updateItem = (id: string, updates: Partial<ShoppingItem>) => {
    setItems(prev => 
      prev.map(item => item.id === id ? { ...item, ...updates } : item)
    );
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const clearItems = () => {
    setItems([]);
  };

  const setBudget = async (amount: number) => {
    setBudgetState(amount);
    await AsyncStorage.setItem(STORAGE_KEYS.BUDGET, amount.toString());
  };

  const setLanguage = async (lang: LangCode) => {
    setLanguageState(lang);
    await AsyncStorage.setItem(STORAGE_KEYS.LANGUAGE, lang);
  };

  const setCurrency = async (curr: string) => {
    setCurrencyState(curr);
    await AsyncStorage.setItem(STORAGE_KEYS.CURRENCY, curr);
  };

  const saveSession = async () => {
    try {
      const session: ShoppingSession = {
        date: new Date().toISOString(),
        items: items,
        total: total,
        budget: budget,
      };

      // Load existing history
      const historyJson = await AsyncStorage.getItem(STORAGE_KEYS.HISTORY);
      const history: ShoppingSession[] = historyJson ? JSON.parse(historyJson) : [];
      
      // Add new session
      history.unshift(session);
      
      // Keep only last 100 sessions
      if (history.length > 100) {
        history.splice(100);
      }

      await AsyncStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
    } catch (error) {
      console.error('Error saving session:', error);
      throw error;
    }
  };

  const getHistory = async (period: 'day' | 'week' | 'month' | 'year'): Promise<ShoppingSession[]> => {
    try {
      const historyJson = await AsyncStorage.getItem(STORAGE_KEYS.HISTORY);
      if (!historyJson) return [];

      const history: ShoppingSession[] = JSON.parse(historyJson);
      const now = new Date();

      return history.filter(session => {
        const sessionDate = new Date(session.date);
        
        switch (period) {
          case 'day':
            return sessionDate.toDateString() === now.toDateString();
          case 'week':
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            return sessionDate >= weekAgo;
          case 'month':
            return sessionDate.getMonth() === now.getMonth() && 
                   sessionDate.getFullYear() === now.getFullYear();
          case 'year':
            return sessionDate.getFullYear() === now.getFullYear();
          default:
            return false;
        }
      });
    } catch (error) {
      console.error('Error getting history:', error);
      return [];
    }
  };

  // Computed values
  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const remaining = budget - total;

  const value: AppContextType = {
    items,
    addItem,
    updateItem,
    removeItem,
    clearItems,
    budget,
    setBudget,
    language,
    setLanguage,
    currency,
    setCurrency,
    saveSession,
    getHistory,
    total,
    remaining,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

// History Screen
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp, ShoppingSession } from '../../contexts/AppContext';
import { getCurrencySymbol } from '../../utils/currencies';
import { useLang } from '../../utils/languages';

type Period = 'day' | 'week' | 'month' | 'year';

export default function HistoryScreen() {
  const { getHistory, currency, language } = useApp();
  const t = useLang(language);
  const currencySymbol = getCurrencySymbol(currency);

  const [selectedPeriod, setSelectedPeriod] = useState<Period>('day');
  const [sessions, setSessions] = useState<ShoppingSession[]>([]);

  useEffect(() => {
    loadHistory();
  }, [selectedPeriod]);

  const loadHistory = async () => {
    const history = await getHistory(selectedPeriod);
    setSessions(history);
  };

  const periods: { key: Period; label: string; icon: string }[] = [
    { key: 'day', label: t.today, icon: 'today' },
    { key: 'week', label: t.thisWeek, icon: 'calendar' },
    { key: 'month', label: t.thisMonth, icon: 'calendar-outline' },
    { key: 'year', label: t.thisYear, icon: 'calendar-number' },
  ];

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('en', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{t.history}</Text>
      </View>

      {/* Period Selector */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.periodSelector}
        contentContainerStyle={styles.periodContent}
      >
        {periods.map((period) => (
          <TouchableOpacity
            key={period.key}
            style={[
              styles.periodBtn,
              selectedPeriod === period.key && styles.periodBtnActive,
            ]}
            onPress={() => setSelectedPeriod(period.key)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={period.icon as any}
              size={20}
              color={selectedPeriod === period.key ? '#fff' : 'rgba(255,255,255,0.6)'}
            />
            <Text
              style={[
                styles.periodText,
                selectedPeriod === period.key && styles.periodTextActive,
              ]}
            >
              {period.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Sessions List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {sessions.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="time-outline" size={64} color="rgba(255,255,255,0.2)" />
            <Text style={styles.emptyText}>{t.noHistory}</Text>
            <Text style={styles.emptySubtext}>Save your shopping sessions to see them here</Text>
          </View>
        ) : (
          sessions.map((session, index) => (
            <View key={index} style={styles.sessionCard}>
              {/* Session Header */}
              <View style={styles.sessionHeader}>
                <View>
                  <Text style={styles.sessionDate}>{formatDate(session.date)}</Text>
                  <Text style={styles.sessionItems}>
                    {session.items.length} {t.items}
                  </Text>
                </View>
                <View style={styles.sessionTotals}>
                  <Text style={styles.sessionTotal}>
                    {currencySymbol}{session.total.toFixed(2)}
                  </Text>
                  <Text style={styles.sessionBudget}>
                    / {currencySymbol}{session.budget.toFixed(2)}
                  </Text>
                </View>
              </View>

              {/* Progress Bar */}
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${Math.min((session.total / session.budget) * 100, 100)}%`,
                      backgroundColor:
                        session.total > session.budget
                          ? '#ff6b6b'
                          : session.total > session.budget * 0.9
                          ? '#ffa500'
                          : '#00c896',
                    },
                  ]}
                />
              </View>

              {/* Items List */}
              <View style={styles.itemsList}>
                {session.items.slice(0, 3).map((item, itemIndex) => (
                  <View key={itemIndex} style={styles.itemRow}>
                    <Text style={styles.itemEmoji}>{item.emoji}</Text>
                    <Text style={styles.itemName} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <Text style={styles.itemPrice}>
                      {currencySymbol}{(item.price * item.quantity).toFixed(2)}
                    </Text>
                  </View>
                ))}
                {session.items.length > 3 && (
                  <Text style={styles.moreItems}>
                    +{session.items.length - 3} more items
                  </Text>
                )}
              </View>
            </View>
          ))
        )}
      </ScrollView>
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
  periodSelector: {
    marginVertical: 16,
  },
  periodContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  periodBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    gap: 6,
  },
  periodBtnActive: {
    backgroundColor: '#0070f3',
  },
  periodText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.6)',
  },
  periodTextActive: {
    color: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
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
    textAlign: 'center',
  },
  sessionCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sessionDate: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  sessionItems: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 2,
  },
  sessionTotals: {
    alignItems: 'flex-end',
  },
  sessionTotal: {
    fontSize: 20,
    fontWeight: '700',
    color: '#00c896',
  },
  sessionBudget: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  itemsList: {
    gap: 8,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  itemEmoji: {
    fontSize: 18,
  },
  itemName: {
    flex: 1,
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
  },
  moreItems: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.4)',
    fontStyle: 'italic',
    marginTop: 4,
  },
});

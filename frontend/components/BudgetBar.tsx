// Budget progress bar component
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface BudgetBarProps {
  total: number;
  budget: number;
  currencySymbol: string;
}

export const BudgetBar: React.FC<BudgetBarProps> = ({ total, budget, currencySymbol }) => {
  const percentage = budget > 0 ? (total / budget) * 100 : 0;
  const remaining = budget - total;
  
  // Color based on percentage
  let barColor = '#00c896'; // Green < 70%
  if (percentage >= 90) {
    barColor = '#ff6b6b'; // Red >= 90%
  } else if (percentage >= 70) {
    barColor = '#ffa500'; // Orange 70-90%
  }

  return (
    <View style={styles.container}>
      {/* Budget bar */}
      <View style={styles.barContainer}>
        <View style={[styles.barFill, { width: `${Math.min(percentage, 100)}%`, backgroundColor: barColor }]} />
      </View>
      
      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Total</Text>
          <Text style={[styles.statValue, { color: barColor }]}>
            {currencySymbol}{total.toFixed(2)}
          </Text>
        </View>
        
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Budget</Text>
          <Text style={styles.statValue}>
            {currencySymbol}{budget.toFixed(2)}
          </Text>
        </View>
        
        <View style={styles.stat}>
          <Text style={styles.statLabel}>
            {remaining >= 0 ? 'Remaining' : 'Over'}
          </Text>
          <Text style={[styles.statValue, { color: remaining >= 0 ? '#00c896' : '#ff6b6b' }]}>
            {currencySymbol}{Math.abs(remaining).toFixed(2)}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  barContainer: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 16,
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
});

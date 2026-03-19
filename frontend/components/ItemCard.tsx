// Item card component for shopping list
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { ShoppingItem } from '../contexts/AppContext';

interface ItemCardProps {
  item: ShoppingItem;
  currencySymbol: string;
  onIncrease: () => void;
  onDecrease: () => void;
  onDelete: () => void;
}

export const ItemCard: React.FC<ItemCardProps> = ({
  item,
  currencySymbol,
  onIncrease,
  onDecrease,
  onDelete,
}) => {
  const handleIncrease = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onIncrease();
  };

  const handleDecrease = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onDecrease();
  };

  const handleDelete = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onDelete();
  };

  const subtotal = item.price * item.quantity;

  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        {item.emoji && <Text style={styles.emoji}>{item.emoji}</Text>}
        <View style={styles.info}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.price}>
            {currencySymbol}{item.price.toFixed(2)} × {item.quantity}
          </Text>
        </View>
      </View>

      <View style={styles.rightSection}>
        <Text style={styles.subtotal}>
          {currencySymbol}{subtotal.toFixed(2)}
        </Text>
        
        <View style={styles.controls}>
          <TouchableOpacity
            style={styles.controlBtn}
            onPress={handleDecrease}
            activeOpacity={0.7}
          >
            <Ionicons name="remove" size={18} color="#fff" />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.controlBtn}
            onPress={handleIncrease}
            activeOpacity={0.7}
          >
            <Ionicons name="add" size={18} color="#fff" />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.controlBtn, styles.deleteBtn]}
            onPress={handleDelete}
            activeOpacity={0.7}
          >
            <Ionicons name="trash-outline" size={18} color="#ff6b6b" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  emoji: {
    fontSize: 32,
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  price: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
  },
  rightSection: {
    alignItems: 'flex-end',
  },
  subtotal: {
    fontSize: 18,
    fontWeight: '700',
    color: '#00c896',
    marginBottom: 8,
  },
  controls: {
    flexDirection: 'row',
    gap: 6,
  },
  controlBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteBtn: {
    backgroundColor: 'rgba(255,107,107,0.15)',
  },
});

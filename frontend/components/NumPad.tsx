// NumPad component for PIN entry
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

interface NumPadProps {
  onPress: (value: string) => void;
  onDelete: () => void;
}

export const NumPad: React.FC<NumPadProps> = ({ onPress, onDelete }) => {
  const handlePress = (value: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress(value);
  };

  const handleDelete = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onDelete();
  };

  const buttons = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['', '0', 'delete'],
  ];

  return (
    <View style={styles.container}>
      {buttons.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map((button, colIndex) => {
            if (button === '') {
              return <View key={colIndex} style={styles.button} />;
            }
            if (button === 'delete') {
              return (
                <TouchableOpacity
                  key={colIndex}
                  style={styles.button}
                  onPress={handleDelete}
                  activeOpacity={0.7}
                >
                  <Ionicons name="backspace-outline" size={28} color="#fff" />
                </TouchableOpacity>
              );
            }
            return (
              <TouchableOpacity
                key={colIndex}
                style={styles.button}
                onPress={() => handlePress(button)}
                activeOpacity={0.7}
              >
                <Text style={styles.buttonText}>{button}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    maxWidth: 320,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  button: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  buttonText: {
    fontSize: 28,
    fontWeight: '600',
    color: '#fff',
  },
});

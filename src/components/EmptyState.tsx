import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../constants/Colors';

interface Props {
  onSuggestion: (text: string) => void;
}

const SUGGESTIONS = [
  'Tengo pollo, arroz y ajo',
  'Solo huevos, queso y pan',
  'Pasta, tomates y albahaca',
];

export function EmptyState({ onSuggestion }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>👨‍🍳</Text>
      <Text style={styles.title}>¿Qué Comemos Hoy?</Text>
      <Text style={styles.subtitle}>
        Contame qué ingredientes tenés en casa y te sugiero varias recetas para cocinar.
      </Text>

      <Text style={styles.suggestionsLabel}>Probá con esto:</Text>
      <View style={styles.chipsContainer}>
        {SUGGESTIONS.map((suggestion) => (
          <TouchableOpacity
            key={suggestion}
            style={styles.chip}
            onPress={() => onSuggestion(suggestion)}
            activeOpacity={0.7}
          >
            <Text style={styles.chipText}>{suggestion}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingBottom: 40,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.secondary,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  suggestionsLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 10,
    fontWeight: '500',
  },
  chipsContainer: {
    gap: 10,
    alignItems: 'center',
    width: '100%',
  },
  chip: {
    backgroundColor: Colors.chipBackground,
    borderWidth: 1,
    borderColor: Colors.chipBorder,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  chipText: {
    color: Colors.chipText,
    fontSize: 14,
    fontWeight: '500',
  },
});

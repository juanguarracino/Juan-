import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Props {
  uri: string;
  transcription: string;
}

// Se muestra dentro de la burbuja naranja del usuario → texto blanco
export function VoicePlayer({ transcription }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.iconBadge}>
          <Text style={styles.icon}>🎤</Text>
        </View>
        <Text style={styles.label}>Mensaje de voz</Text>
      </View>
      {transcription ? (
        <Text style={styles.transcription}>"{transcription}"</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 14,
  },
  label: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '700',
  },
  transcription: {
    fontSize: 14,
    color: '#FFFFFF',
    fontStyle: 'italic',
    lineHeight: 20,
  },
});

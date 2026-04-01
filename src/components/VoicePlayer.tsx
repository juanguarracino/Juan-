import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/Colors';

interface Props {
  uri: string;
  transcription: string;
}

export function VoicePlayer({ transcription }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.icon}>🎤</Text>
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
    gap: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  icon: {
    fontSize: 15,
  },
  label: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  transcription: {
    fontSize: 13,
    color: Colors.textPrimary,
    fontStyle: 'italic',
    lineHeight: 18,
  },
});

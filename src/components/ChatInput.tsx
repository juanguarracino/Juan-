import React, { useState, useRef } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Text,
  Alert,
  ScrollView,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useAudioRecorder, AudioModule, RecordingPresets } from 'expo-audio';
import { AudioButton } from './AudioButton';
import { useTheme } from '../theme/ThemeContext';

interface Props {
  onSend: (text: string) => void;
  onSendVoice: (uri: string) => void;
  isLoading: boolean;
  showSuggestions?: boolean;
}

const INGREDIENTS = [
  { emoji: '🍗', name: 'pollo' },
  { emoji: '🥚', name: 'huevos' },
  { emoji: '🍝', name: 'pasta' },
  { emoji: '🍚', name: 'arroz' },
  { emoji: '🧀', name: 'queso' },
  { emoji: '🥦', name: 'verduras' },
  { emoji: '🥩', name: 'carne' },
  { emoji: '🥔', name: 'papas' },
];

export function ChatInput({ onSend, onSendVoice, isLoading, showSuggestions }: Props) {
  const { colors } = useTheme();
  const [text, setText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);

  const canSend = text.trim().length > 0 && !isLoading && !isRecording;

  const handleSend = () => {
    if (!canSend) return;
    const trimmed = text.trim();
    setText('');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onSend(trimmed);
  };

  const handleChip = (name: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setText((prev) => {
      const t = prev.trim();
      if (!t) return `Tengo ${name}`;
      if (t.toLowerCase().includes(name)) return prev;
      return `${t}, ${name}`;
    });
    inputRef.current?.focus();
  };

  const handleMicPress = async () => {
    if (isLoading) return;

    if (isRecording) {
      try {
        await audioRecorder.stop();
        setIsRecording(false);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
        const uri = audioRecorder.uri;
        if (uri) {
          onSendVoice(uri);
        }
      } catch {
        setIsRecording(false);
        Alert.alert('Error', 'No se pudo procesar el audio. Intentá de nuevo.');
      }
    } else {
      try {
        const { granted } = await AudioModule.requestRecordingPermissionsAsync();
        if (!granted) {
          Alert.alert('Sin acceso al micrófono', 'Habilitá el permiso de micrófono en Configuración.');
          return;
        }
        await audioRecorder.prepareToRecordAsync();
        audioRecorder.record();
        setIsRecording(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'No se pudo acceder al micrófono.';
        Alert.alert('Error', msg);
      }
    }
  };

  return (
    <View style={[styles.wrapper, {
      backgroundColor: colors.surface,
      borderTopColor: colors.inputBorder,
      shadowColor: colors.shadow,
    }]}>
      {/* Quick ingredient chips */}
      {showSuggestions && !isRecording && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsRow}
          keyboardShouldPersistTaps="handled"
        >
          {INGREDIENTS.map((ing) => (
            <TouchableOpacity
              key={ing.name}
              style={[styles.chip, { backgroundColor: colors.chipBackground, borderColor: colors.chipBorder }]}
              onPress={() => handleChip(ing.name)}
              activeOpacity={0.7}
            >
              <Text style={styles.chipEmoji}>{ing.emoji}</Text>
              <Text style={[styles.chipText, { color: colors.chipText }]}>
                {ing.name.charAt(0).toUpperCase() + ing.name.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      <View style={styles.container}>
        <TextInput
          ref={inputRef}
          style={[
            styles.input,
            { backgroundColor: colors.inputBackground, borderColor: colors.inputBorder, color: colors.textPrimary },
            isRecording && { borderColor: colors.recording, backgroundColor: colors.errorLight },
          ]}
          value={isRecording ? '' : text}
          onChangeText={setText}
          placeholder={isRecording ? '🔴 Grabando...' : '¿Qué ingredientes tenés en casa?'}
          placeholderTextColor={isRecording ? colors.recording : colors.textSecondary}
          multiline
          maxLength={500}
          returnKeyType="send"
          blurOnSubmit={false}
          onSubmitEditing={handleSend}
          editable={!isLoading && !isRecording}
        />

        <AudioButton
          isRecording={isRecording}
          disabled={isLoading}
          onPress={handleMicPress}
        />

        {canSend && (
          <TouchableOpacity
            style={[styles.sendButton, { backgroundColor: colors.primary, shadowColor: colors.primary }]}
            onPress={handleSend}
            activeOpacity={0.75}
          >
            <Text style={styles.sendIcon}>➤</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderTopWidth: 1,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.07,
        shadowRadius: 6,
      },
      android: { elevation: 6 },
    }),
  },
  chipsRow: {
    paddingHorizontal: 12,
    paddingTop: 10,
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  chipEmoji: { fontSize: 14 },
  chipText: { fontSize: 13, fontWeight: '600' },
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  input: {
    flex: 1,
    minHeight: 46,
    maxHeight: 120,
    borderWidth: 1.5,
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingTop: Platform.OS === 'ios' ? 12 : 11,
    paddingBottom: Platform.OS === 'ios' ? 12 : 11,
    fontSize: 15,
  },
  sendButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 5,
    elevation: 4,
  },
  sendIcon: {
    color: '#FFFFFF',
    fontSize: 16,
    marginLeft: 2,
  },
});

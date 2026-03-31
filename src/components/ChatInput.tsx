import React, { useState, useRef } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Text,
  Alert,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import * as FileSystem from 'expo-file-system';
import { useAudioRecorder, AudioModule, RecordingPresets } from 'expo-audio';
import { AudioButton } from './AudioButton';
import { Colors } from '../constants/Colors';

interface Props {
  onSend: (text: string) => void;
  onSendVoice: (base64: string) => void;
  isLoading: boolean;
}

export function ChatInput({ onSend, onSendVoice, isLoading }: Props) {
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

  const handleMicPress = async () => {
    if (isLoading) return;

    if (isRecording) {
      try {
        await audioRecorder.stop();
        setIsRecording(false);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
        const uri = audioRecorder.uri;
        if (uri) {
          const base64 = await FileSystem.readAsStringAsync(uri, {
            encoding: FileSystem.EncodingType.Base64,
          });
          onSendVoice(base64);
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
    <View style={styles.container}>
      <TextInput
        ref={inputRef}
        style={[styles.input, isRecording && styles.inputRecording]}
        value={isRecording ? '' : text}
        onChangeText={setText}
        placeholder={isRecording ? '🔴 Grabando...' : '¿Qué ingredientes tenés en casa?'}
        placeholderTextColor={isRecording ? '#EF5350' : Colors.textSecondary}
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
        <TouchableOpacity style={styles.sendButton} onPress={handleSend} activeOpacity={0.75}>
          <Text style={styles.sendIcon}>➤</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.inputBorder,
    gap: 8,
    ...Platform.select({
      ios: {
        shadowColor: Colors.shadow,
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.07,
        shadowRadius: 6,
      },
      android: { elevation: 6 },
    }),
  },
  input: {
    flex: 1,
    minHeight: 46,
    maxHeight: 120,
    backgroundColor: Colors.background,
    borderWidth: 1.5,
    borderColor: Colors.inputBorder,
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingTop: Platform.OS === 'ios' ? 12 : 11,
    paddingBottom: Platform.OS === 'ios' ? 12 : 11,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  inputRecording: {
    borderColor: '#EF5350',
    backgroundColor: '#FFF5F5',
  },
  sendButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
    elevation: 4,
  },
  sendIcon: {
    color: Colors.textOnPrimary,
    fontSize: 16,
    marginLeft: 2,
  },
});

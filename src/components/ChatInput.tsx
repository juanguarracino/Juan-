import React, { useState, useRef } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Text,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '../constants/Colors';

interface Props {
  onSend: (text: string) => void;
  isLoading: boolean;
}

export function ChatInput({ onSend, isLoading }: Props) {
  const [text, setText] = useState('');
  const inputRef = useRef<TextInput>(null);

  const canSend = text.trim().length > 0 && !isLoading;

  const handleSend = () => {
    if (!canSend) return;
    const trimmed = text.trim();
    setText('');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onSend(trimmed);
  };

  return (
    <View style={styles.container}>
      <TextInput
        ref={inputRef}
        style={styles.input}
        value={text}
        onChangeText={setText}
        placeholder="¿Qué ingredientes tenés en casa?"
        placeholderTextColor={Colors.textSecondary}
        multiline
        maxLength={500}
        returnKeyType="send"
        blurOnSubmit={false}
        onSubmitEditing={handleSend}
        editable={!isLoading}
      />
      <TouchableOpacity
        style={[styles.sendButton, !canSend && styles.sendButtonDisabled]}
        onPress={handleSend}
        disabled={!canSend}
        activeOpacity={0.75}
      >
        <Text style={styles.sendIcon}>➤</Text>
      </TouchableOpacity>
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
    ...Platform.select({
      ios: {
        shadowColor: Colors.shadow,
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.07,
        shadowRadius: 6,
      },
      android: {
        elevation: 6,
      },
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
    marginRight: 10,
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
  sendButtonDisabled: {
    backgroundColor: Colors.inputBorder,
    shadowOpacity: 0,
    elevation: 0,
  },
  sendIcon: {
    color: Colors.textOnPrimary,
    fontSize: 16,
    marginLeft: 2,
  },
});

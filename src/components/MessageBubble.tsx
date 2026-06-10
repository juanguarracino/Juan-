import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { SimpleMarkdown } from './SimpleMarkdown';
import { VoicePlayer } from './VoicePlayer';
import { speakText, stopSpeaking, isSpeakingAsync } from '../services/audioService';
import { Colors } from '../constants/Colors';
import type { Message } from '../types/chat';

interface Props {
  message: Message;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function MessageBubble({ message }: Props) {
  const isUser = message.role === 'user';
  const isError = message.isError === true;
  const isVoice = message.isVoice === true;

  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(isUser ? 6 : 10)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: isUser ? 200 : 320,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        friction: isUser ? 10 : 7,
        tension: isUser ? 100 : 65,
        useNativeDriver: true,
      }),
    ]).start();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSpeak = async () => {
    const speaking = await isSpeakingAsync();
    if (speaking) {
      stopSpeaking();
    } else {
      speakText(message.content).catch(() => {});
    }
  };

  return (
    <Animated.View
      style={[
        styles.row,
        isUser ? styles.rowUser : styles.rowAssistant,
        { opacity, transform: [{ translateY }] },
      ]}
    >
      {!isUser && (
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>👨‍🍳</Text>
        </View>
      )}

      <View style={[
        styles.bubble,
        isUser ? styles.bubbleUser : styles.bubbleAssistant,
        isError && styles.bubbleError,
      ]}>
        {isUser ? (
          isVoice && message.audioUri ? (
            <VoicePlayer uri={message.audioUri} transcription={message.content} />
          ) : (
            <Text style={[styles.userText, isError && styles.errorText]}>
              {message.content}
            </Text>
          )
        ) : (
          <SimpleMarkdown isError={isError}>{message.content}</SimpleMarkdown>
        )}

        <View style={styles.footer}>
          <Text style={[
            styles.timestamp,
            isUser ? styles.timestampUser : styles.timestampAssistant,
          ]}>
            {formatTime(message.timestamp)}
          </Text>
          {!isUser && !isError && (
            <TouchableOpacity onPress={handleSpeak} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
              <Text style={styles.speakIcon}>🔊</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    marginVertical: 5,
    paddingHorizontal: 12,
    alignItems: 'flex-end',
  },
  rowUser: { justifyContent: 'flex-end' },
  rowAssistant: { justifyContent: 'flex-start' },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    marginBottom: 20,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  avatarText: { fontSize: 17 },
  bubble: {
    maxWidth: '80%',
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 6,
  },
  bubbleUser: {
    backgroundColor: Colors.bubbleUser,
    borderRadius: 20,
    borderBottomRightRadius: 5,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  bubbleAssistant: {
    backgroundColor: Colors.bubbleAssistant,
    borderRadius: 20,
    borderBottomLeftRadius: 5,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  bubbleError: {
    backgroundColor: Colors.errorLight,
  },
  userText: {
    color: Colors.bubbleUserText,
    fontSize: 15,
    lineHeight: 22,
  },
  errorText: { color: Colors.error },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
    gap: 6,
  },
  timestamp: { fontSize: 10 },
  timestampUser: {
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'right',
    flex: 1,
  },
  timestampAssistant: {
    color: Colors.textSecondary,
    textAlign: 'left',
    flex: 1,
  },
  speakIcon: { fontSize: 13 },
});

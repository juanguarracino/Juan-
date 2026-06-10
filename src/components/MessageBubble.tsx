import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, Share } from 'react-native';
import { SimpleMarkdown } from './SimpleMarkdown';
import { VoicePlayer } from './VoicePlayer';
import { speakText, stopSpeaking, isSpeakingAsync } from '../services/audioService';
import { useTheme } from '../theme/ThemeContext';
import type { Message } from '../types/chat';

interface Props {
  message: Message;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function MessageBubble({ message }: Props) {
  const { colors, isFavorite, toggleFavorite } = useTheme();
  const isUser = message.role === 'user';
  const isError = message.isError === true;
  const isVoice = message.isVoice === true;
  const isGreeting = message.id === 'greeting';
  const fav = !isUser && !isError && isFavorite(message.content);

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

  const handleShare = () => {
    Share.share({
      message: `${message.content}\n\n🍳 Compartido desde ¿Qué Comemos Hoy?`,
    }).catch(() => {});
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
        <View style={[styles.avatar, { backgroundColor: colors.primaryLight, shadowColor: colors.shadow }]}>
          <Text style={styles.avatarText}>👨‍🍳</Text>
        </View>
      )}

      <View style={[
        styles.bubble,
        isUser
          ? [styles.bubbleUser, { backgroundColor: colors.bubbleUser, shadowColor: colors.primary }]
          : [styles.bubbleAssistant, { backgroundColor: colors.bubbleAssistant, shadowColor: colors.shadow }],
        isError && { backgroundColor: colors.errorLight },
      ]}>
        {isUser ? (
          isVoice && message.audioUri ? (
            <VoicePlayer uri={message.audioUri} transcription={message.content} />
          ) : (
            <Text style={[styles.userText, isError && { color: colors.error }]}>
              {message.content}
            </Text>
          )
        ) : (
          <SimpleMarkdown isError={isError}>{message.content}</SimpleMarkdown>
        )}

        <View style={styles.footer}>
          <Text style={[
            styles.timestamp,
            isUser ? styles.timestampUser : { color: colors.textSecondary, textAlign: 'left' as const, flex: 1 },
          ]}>
            {formatTime(message.timestamp)}
          </Text>
          {!isUser && !isError && (
            <View style={styles.actions}>
              {!isGreeting && (
                <>
                  <TouchableOpacity
                    onPress={() => toggleFavorite(message.content)}
                    hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                  >
                    <Text style={[styles.actionIcon, !fav && styles.actionIconOff]}>⭐</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleShare} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
                    <Text style={styles.actionIcon}>📤</Text>
                  </TouchableOpacity>
                </>
              )}
              <TouchableOpacity onPress={handleSpeak} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
                <Text style={styles.actionIcon}>🔊</Text>
              </TouchableOpacity>
            </View>
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
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    marginBottom: 20,
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
    borderRadius: 20,
    borderBottomRightRadius: 5,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  bubbleAssistant: {
    borderRadius: 20,
    borderBottomLeftRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  userText: {
    color: '#FFFFFF',
    fontSize: 15,
    lineHeight: 22,
  },
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
  actions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  actionIcon: { fontSize: 14 },
  actionIconOff: { opacity: 0.35 },
});

import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { SimpleMarkdown } from './SimpleMarkdown';
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
          <Text style={[styles.userText, isError && styles.errorText]}>
            {message.content}
          </Text>
        ) : (
          <SimpleMarkdown isError={isError}>{message.content}</SimpleMarkdown>
        )}
        <Text style={[
          styles.timestamp,
          isUser ? styles.timestampUser : styles.timestampAssistant,
        ]}>
          {formatTime(message.timestamp)}
        </Text>
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
  rowUser: {
    justifyContent: 'flex-end',
  },
  rowAssistant: {
    justifyContent: 'flex-start',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.accentLight,
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
  avatarText: {
    fontSize: 18,
  },
  bubble: {
    maxWidth: '80%',
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 6,
  },
  bubbleUser: {
    backgroundColor: Colors.bubbleUser,
    borderRadius: 20,
    borderBottomRightRadius: 4,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  bubbleAssistant: {
    backgroundColor: Colors.bubbleAssistant,
    borderRadius: 20,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 3,
  },
  bubbleError: {
    backgroundColor: Colors.errorLight,
    borderColor: 'transparent',
  },
  userText: {
    color: Colors.textPrimary,
    fontSize: 15,
    lineHeight: 22,
  },
  errorText: {
    color: Colors.error,
  },
  timestamp: {
    fontSize: 10,
    marginTop: 4,
  },
  timestampUser: {
    color: 'rgba(0,0,0,0.38)',
    textAlign: 'right',
  },
  timestampAssistant: {
    color: Colors.textSecondary,
    textAlign: 'left',
  },
});

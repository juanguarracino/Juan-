import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Markdown from 'react-native-markdown-display';
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

  return (
    <View style={[styles.row, isUser ? styles.rowUser : styles.rowAssistant]}>
      {!isUser && (
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>👨‍🍳</Text>
        </View>
      )}
      <View
        style={[
          styles.bubble,
          isUser ? styles.bubbleUser : styles.bubbleAssistant,
          isError && styles.bubbleError,
        ]}
      >
        {isUser ? (
          <Text style={[styles.userText, isError && styles.errorText]}>
            {message.content}
          </Text>
        ) : (
          <Markdown style={isError ? errorMarkdownStyles : assistantMarkdownStyles}>
            {message.content}
          </Markdown>
        )}
        <Text style={[styles.timestamp, isUser ? styles.timestampUser : styles.timestampAssistant]}>
          {formatTime(message.timestamp)}
        </Text>
      </View>
    </View>
  );
}

const assistantMarkdownStyles = {
  body: {
    color: Colors.textPrimary,
    fontSize: 15,
    lineHeight: 22,
  },
  strong: {
    color: Colors.textPrimary,
    fontWeight: '700' as const,
  },
  em: {
    color: Colors.textSecondary,
    fontStyle: 'italic' as const,
  },
  bullet_list: {
    marginVertical: 4,
  },
  ordered_list: {
    marginVertical: 4,
  },
  list_item: {
    marginVertical: 2,
  },
  hr: {
    backgroundColor: Colors.separator,
    height: 1,
    marginVertical: 10,
  },
  heading1: {
    color: Colors.primary,
    fontSize: 17,
    fontWeight: '700' as const,
    marginBottom: 4,
  },
  heading2: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '600' as const,
    marginBottom: 4,
  },
  paragraph: {
    marginVertical: 3,
  },
};

const errorMarkdownStyles = {
  ...assistantMarkdownStyles,
  body: {
    color: Colors.error,
    fontSize: 15,
    lineHeight: 22,
  },
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    marginVertical: 3,
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
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
    marginBottom: 18,
  },
  avatarText: {
    fontSize: 16,
  },
  bubble: {
    maxWidth: '80%',
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 6,
  },
  bubbleUser: {
    backgroundColor: Colors.bubbleUser,
    borderRadius: 18,
    borderBottomRightRadius: 4,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  bubbleAssistant: {
    backgroundColor: Colors.bubbleAssistant,
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  bubbleError: {
    backgroundColor: Colors.errorLight,
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
    fontSize: 11,
    marginTop: 4,
  },
  timestampUser: {
    color: Colors.textSecondary,
    textAlign: 'right',
  },
  timestampAssistant: {
    color: Colors.textSecondary,
    textAlign: 'left',
  },
});

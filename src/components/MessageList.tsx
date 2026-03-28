import React, { useRef, useEffect } from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';
import type { Message } from '../types/chat';

interface Props {
  messages: Message[];
  isLoading: boolean;
}

export function MessageList({ messages, isLoading }: Props) {
  const flatListRef = useRef<FlatList<Message>>(null);
  const prevLengthRef = useRef(0);

  useEffect(() => {
    const prev = prevLengthRef.current;
    const current = messages.length;
    prevLengthRef.current = current;

    if (current === 0) return;

    const lastMessage = messages[current - 1];
    const isNewAssistantMessage = current > prev && lastMessage?.role === 'assistant';

    setTimeout(() => {
      if (isNewAssistantMessage) {
        // Scroll to the user message just before the assistant reply,
        // so the assistant response starts right below the top of the screen.
        const scrollTarget = Math.max(0, current - 2);
        flatListRef.current?.scrollToIndex({
          index: scrollTarget,
          animated: true,
          viewPosition: 0,
        });
      } else {
        flatListRef.current?.scrollToEnd({ animated: true });
      }
    }, 100);
  }, [messages]);

  return (
    <FlatList
      ref={flatListRef}
      data={messages}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <MessageBubble message={item} />}
      contentContainerStyle={styles.contentContainer}
      ListFooterComponent={isLoading ? <TypingIndicator /> : null}
      ListFooterComponentStyle={styles.footer}
      onScrollToIndexFailed={(info) => {
        // Fallback: if scrollToIndex fails (item not rendered yet), scroll to end
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 200);
      }}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    paddingTop: 12,
    paddingBottom: 8,
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  footer: {
    paddingBottom: 4,
  },
});

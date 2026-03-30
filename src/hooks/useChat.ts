import { useReducer, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { sendMessageToClaude } from '../services/claudeService';
import { messagesKey } from './useConversations';
import type { Message, ConversationState, ChatAction, ApiMessage } from '../types/chat';

const GREETING_MESSAGE: Message = {
  id: 'greeting',
  role: 'assistant',
  content: `¡Hola! 👋 Soy **¿Qué Comemos Hoy?**, tu chef chatbot personal.

Contame qué ingredientes tenés en casa y te sugiero **3 recetas** que podés preparar ahora mismo. Perfectas para cocinarle a los chicos o para vos.

¿Qué tenés en la heladera o la despensa?`,
  timestamp: new Date(),
};

const initialState: ConversationState = {
  messages: [],
  isLoading: false,
  error: null,
};

function chatReducer(state: ConversationState, action: ChatAction): ConversationState {
  switch (action.type) {
    case 'SEND_MESSAGE':
      return { ...state, messages: [...state.messages, action.message], isLoading: true, error: null };
    case 'RECEIVE_REPLY':
      return { ...state, messages: [...state.messages, action.message], isLoading: false, error: null };
    case 'SET_ERROR':
      return {
        ...state,
        isLoading: false,
        error: action.error,
        messages: [
          ...state.messages,
          {
            id: Date.now().toString(),
            role: 'assistant',
            content: action.error,
            timestamp: new Date(),
            isError: true,
          },
        ],
      };
    case 'CLEAR':
      return { ...initialState };
    default:
      return state;
  }
}

function makeId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function serializeMessages(messages: Message[]): string {
  return JSON.stringify(
    messages.map((m) => ({ ...m, timestamp: m.timestamp.toISOString() }))
  );
}

function deserializeMessages(raw: string): Message[] {
  const parsed = JSON.parse(raw) as Array<Message & { timestamp: string }>;
  return parsed.map((m) => ({ ...m, timestamp: new Date(m.timestamp) }));
}

export function useChat(
  conversationId: string,
  onPreviewUpdate?: (preview: string) => void
) {
  const [state, dispatch] = useReducer(chatReducer, initialState);
  const storageKey = messagesKey(conversationId);

  // Load persisted history on mount
  useEffect(() => {
    AsyncStorage.getItem(storageKey)
      .then((raw) => {
        if (raw) {
          const messages = deserializeMessages(raw);
          if (messages.length > 0) {
            messages.forEach((m) => dispatch({ type: 'RECEIVE_REPLY', message: m }));
            return;
          }
        }
        dispatch({ type: 'RECEIVE_REPLY', message: { ...GREETING_MESSAGE, timestamp: new Date() } });
      })
      .catch(() => {
        dispatch({ type: 'RECEIVE_REPLY', message: { ...GREETING_MESSAGE, timestamp: new Date() } });
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  // Persist whenever messages change
  useEffect(() => {
    if (state.messages.length > 0) {
      AsyncStorage.setItem(storageKey, serializeMessages(state.messages)).catch(() => {});
    }
  }, [state.messages, storageKey]);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || state.isLoading) return;

      const userMessage: Message = {
        id: makeId(),
        role: 'user',
        content: trimmed,
        timestamp: new Date(),
      };

      dispatch({ type: 'SEND_MESSAGE', message: userMessage });

      const apiHistory: ApiMessage[] = [
        ...state.messages
          .filter((m) => !m.isError && m.id !== 'greeting')
          .map((m) => ({ role: m.role, content: m.content })),
        { role: 'user', content: trimmed },
      ];

      try {
        const replyText = await sendMessageToClaude(apiHistory);
        const assistantMessage: Message = {
          id: makeId(),
          role: 'assistant',
          content: replyText,
          timestamp: new Date(),
        };
        dispatch({ type: 'RECEIVE_REPLY', message: assistantMessage });
        onPreviewUpdate?.(trimmed);
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? `Oops, something went wrong: ${err.message}`
            : 'Oops, something went wrong. Please try again.';
        dispatch({ type: 'SET_ERROR', error: errorMessage });
      }
    },
    [state.messages, state.isLoading, onPreviewUpdate]
  );

  const clearChat = useCallback(async () => {
    await AsyncStorage.removeItem(storageKey).catch(() => {});
    dispatch({ type: 'CLEAR' });
    dispatch({ type: 'RECEIVE_REPLY', message: { ...GREETING_MESSAGE, timestamp: new Date() } });
    onPreviewUpdate?.('Nueva conversación');
  }, [storageKey, onPreviewUpdate]);

  return {
    messages: state.messages,
    isLoading: state.isLoading,
    sendMessage,
    clearChat,
  };
}

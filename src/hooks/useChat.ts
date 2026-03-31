import { useReducer, useCallback, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { sendMessageToClaude } from '../services/claudeService';
import { transcribeAudio } from '../services/whisperService';
import { speakText } from '../services/audioService';
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
    case 'SET_LOADING':
      return { ...state, isLoading: action.loading };
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
  // Track whether last user message was voice, so we auto-speak the reply
  const replyWithVoice = useRef(false);

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

  useEffect(() => {
    if (state.messages.length > 0) {
      AsyncStorage.setItem(storageKey, serializeMessages(state.messages)).catch(() => {});
    }
  }, [state.messages, storageKey]);

  const handleReply = useCallback(
    (replyText: string) => {
      const assistantMessage: Message = {
        id: makeId(),
        role: 'assistant',
        content: replyText,
        timestamp: new Date(),
      };
      dispatch({ type: 'RECEIVE_REPLY', message: assistantMessage });
      if (replyWithVoice.current) {
        speakText(replyText).catch(() => {});
        replyWithVoice.current = false;
      }
    },
    []
  );

  const buildApiHistory = useCallback((): ApiMessage[] => {
    return state.messages
      .filter((m) => !m.isError && m.id !== 'greeting')
      .map((m) => ({ role: m.role, content: m.content }));
  }, [state.messages]);

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
      onPreviewUpdate?.(trimmed);

      try {
        const history: ApiMessage[] = [
          ...buildApiHistory(),
          { role: 'user', content: trimmed },
        ];
        const replyText = await sendMessageToClaude(history);
        handleReply(replyText);
      } catch (err) {
        const msg = err instanceof Error ? `Oops: ${err.message}` : 'Oops, intentá de nuevo.';
        dispatch({ type: 'SET_ERROR', error: msg });
      }
    },
    [state.messages, state.isLoading, buildApiHistory, handleReply, onPreviewUpdate]
  );

  const sendVoiceMessage = useCallback(
    async (audioUri: string) => {
      if (state.isLoading) return;

      // Show loading while transcribing (before we even have the text)
      dispatch({ type: 'SET_LOADING', loading: true });
      replyWithVoice.current = true;

      try {
        // 1. Transcribe first — so we know the actual text
        const transcribed = await transcribeAudio(audioUri);

        if (!transcribed.trim()) {
          dispatch({ type: 'SET_LOADING', loading: false });
          replyWithVoice.current = false;
          return;
        }

        // 2. Now dispatch the user message with the REAL transcribed text
        const userMessage: Message = {
          id: makeId(),
          role: 'user',
          content: transcribed,   // actual text, not a placeholder
          timestamp: new Date(),
          isVoice: true,          // keeps the 🎤 icon in the bubble
        };

        dispatch({ type: 'SEND_MESSAGE', message: userMessage });
        onPreviewUpdate?.(transcribed);

        // 3. Build history and send to Claude — all real text, no placeholders
        const history: ApiMessage[] = [
          ...buildApiHistory(),
          { role: 'user', content: transcribed },
        ];
        const replyText = await sendMessageToClaude(history);
        handleReply(replyText);
      } catch (err) {
        replyWithVoice.current = false;
        const msg = err instanceof Error ? `Oops: ${err.message}` : 'Oops, intentá de nuevo.';
        dispatch({ type: 'SET_ERROR', error: msg });
      }
    },
    [state.isLoading, buildApiHistory, handleReply, onPreviewUpdate]
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
    sendVoiceMessage,
    clearChat,
  };
}

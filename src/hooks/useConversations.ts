import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Conversation } from '../types/chat';

const CONVERSATIONS_KEY = '@qch_conversations';
export const messagesKey = (id: string) => `@qch_messages_${id}`;

const DAYS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

function generateName(): string {
  const now = new Date();
  return `${DAYS[now.getDay()]} ${now.getDate()} ${MONTHS[now.getMonth()]}`;
}

function makeId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);

  const load = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(CONVERSATIONS_KEY);
      if (raw) setConversations(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => { load(); }, [load]);

  const persist = useCallback(async (list: Conversation[]) => {
    await AsyncStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(list));
    setConversations(list);
  }, []);

  const createConversation = useCallback(async (): Promise<Conversation> => {
    const conv: Conversation = {
      id: makeId(),
      name: generateName(),
      preview: 'Nueva conversación',
      createdAt: new Date().toISOString(),
    };
    await persist([conv, ...conversations]);
    return conv;
  }, [conversations, persist]);

  const deleteConversation = useCallback(async (id: string) => {
    await AsyncStorage.removeItem(messagesKey(id));
    await persist(conversations.filter((c) => c.id !== id));
  }, [conversations, persist]);

  const updatePreview = useCallback(async (id: string, preview: string) => {
    const trimmed = preview.slice(0, 60);
    const updated = conversations.map((c) =>
      c.id === id ? { ...c, preview: trimmed } : c
    );
    await persist(updated);
  }, [conversations, persist]);

  return { conversations, createConversation, deleteConversation, updatePreview, reload: load };
}

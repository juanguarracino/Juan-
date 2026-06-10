import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useConversations } from '../hooks/useConversations';
import { Colors } from '../constants/Colors';
import type { Conversation } from '../types/chat';

interface Props {
  onOpen: (conversationId: string) => void;
}

function formatDate(iso: string): string {
  const date = new Date(iso);
  const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  return `${days[date.getDay()]} ${date.getDate()} ${months[date.getMonth()]}`;
}

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Buen día';
  if (hour < 20) return 'Buenas tardes';
  return 'Buenas noches';
}

const CARD_EMOJIS = ['🍲', '🥘', '🍝', '🥗', '🍳', '🌮', '🍕', '🥪'];

function emojiFor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) | 0;
  return CARD_EMOJIS[Math.abs(hash) % CARD_EMOJIS.length];
}

export function ConversationListScreen({ onOpen }: Props) {
  const { conversations, createConversation, deleteConversation } = useConversations();

  const handleNew = async () => {
    const conv = await createConversation();
    onOpen(conv.id);
  };

  const handleDelete = (conv: Conversation) => {
    Alert.alert(
      'Borrar chat',
      `¿Querés borrar "${conv.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Borrar', style: 'destructive', onPress: () => deleteConversation(conv.id) },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar style="dark" />

      {/* Hero header */}
      <View style={styles.hero}>
        <Text style={styles.heroGreeting}>{greeting()} 👋</Text>
        <Text style={styles.heroTitle}>¿Qué comemos hoy?</Text>
        <Text style={styles.heroSubtitle}>Tu chef personal, siempre listo</Text>
      </View>

      {/* Section label */}
      {conversations.length > 0 && (
        <Text style={styles.sectionLabel}>TUS CONVERSACIONES</Text>
      )}

      {/* List or empty state */}
      {conversations.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>🍽️</Text>
          <Text style={styles.emptyTitle}>Todavía no hay chats</Text>
          <Text style={styles.emptySubtitle}>
            Empezá una conversación y contale al chef qué tenés en la heladera
          </Text>
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => onOpen(item.id)}
              activeOpacity={0.85}
            >
              <View style={styles.cardIcon}>
                <Text style={styles.cardIconText}>{emojiFor(item.id)}</Text>
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardName}>{item.name}</Text>
                <Text style={styles.cardPreview} numberOfLines={1}>
                  {item.preview}
                </Text>
              </View>
              <View style={styles.cardRight}>
                <Text style={styles.cardDate}>{formatDate(item.createdAt)}</Text>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDelete(item)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Text style={styles.deleteIcon}>✕</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      {/* Bottom CTA */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.newButton} onPress={handleNew} activeOpacity={0.85}>
          <Text style={styles.newButtonIcon}>＋</Text>
          <Text style={styles.newButtonText}>Nueva conversación</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  hero: {
    paddingHorizontal: 24,
    paddingTop: 22,
    paddingBottom: 14,
  },
  heroGreeting: {
    fontSize: 15,
    color: Colors.textSecondary,
    fontWeight: '600',
    marginBottom: 4,
  },
  heroTitle: {
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '800',
    color: Colors.secondary,
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: Colors.textSecondary,
    paddingHorizontal: 24,
    marginTop: 14,
    marginBottom: 8,
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 10,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 14,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 2,
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardIconText: {
    fontSize: 24,
  },
  cardContent: {
    flex: 1,
    marginRight: 8,
  },
  cardName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 3,
  },
  cardPreview: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  cardRight: {
    alignItems: 'flex-end',
    gap: 8,
  },
  cardDate: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  deleteButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteIcon: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '700',
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyEmoji: {
    fontSize: 56,
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 21,
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 24,
  },
  newButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    borderRadius: 28,
    paddingVertical: 16,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  newButtonIcon: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  newButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});

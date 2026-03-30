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
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerEmoji}>👨‍🍳</Text>
          <Text style={styles.headerTitle}>¿Qué Comemos Hoy?</Text>
        </View>
        <TouchableOpacity style={styles.newButton} onPress={handleNew} activeOpacity={0.8}>
          <Text style={styles.newButtonText}>+ Nuevo</Text>
        </TouchableOpacity>
      </View>

      {/* List or empty state */}
      {conversations.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>🍽️</Text>
          <Text style={styles.emptyTitle}>No hay chats todavía</Text>
          <Text style={styles.emptySubtitle}>Tocá "+ Nuevo" para empezar</Text>
          <TouchableOpacity style={styles.emptyButton} onPress={handleNew} activeOpacity={0.8}>
            <Text style={styles.emptyButtonText}>+ Nuevo chat</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.item}
              onPress={() => onOpen(item.id)}
              activeOpacity={0.7}
            >
              <View style={styles.itemIcon}>
                <Text style={styles.itemIconText}>🍽️</Text>
              </View>
              <View style={styles.itemContent}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemPreview} numberOfLines={1}>
                  {item.preview}
                </Text>
              </View>
              <View style={styles.itemRight}>
                <Text style={styles.itemDate}>{formatDate(item.createdAt)}</Text>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDelete(item)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Text style={styles.deleteIcon}>🗑️</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.headerBackground,
  },
  header: {
    backgroundColor: Colors.headerBackground,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerEmoji: {
    fontSize: 28,
  },
  headerTitle: {
    color: Colors.headerText,
    fontSize: 18,
    fontWeight: '700',
  },
  newButton: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
    backgroundColor: Colors.accent,
  },
  newButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  list: {
    backgroundColor: Colors.surface,
    flexGrow: 1,
  },
  separator: {
    height: 1,
    backgroundColor: Colors.separator,
    marginLeft: 72,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: Colors.surface,
  },
  itemIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  itemIconText: {
    fontSize: 20,
  },
  itemContent: {
    flex: 1,
    marginRight: 8,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 3,
  },
  itemPreview: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  itemRight: {
    alignItems: 'flex-end',
    gap: 6,
  },
  itemDate: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  deleteButton: {
    padding: 2,
  },
  deleteIcon: {
    fontSize: 16,
  },
  empty: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    marginBottom: 28,
  },
  emptyButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});

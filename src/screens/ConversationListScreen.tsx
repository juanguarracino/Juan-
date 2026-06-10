import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
  Modal,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useConversations } from '../hooks/useConversations';
import { useTheme } from '../theme/ThemeContext';
import type { Conversation } from '../types/chat';

interface Props {
  onOpen: (conversationId: string) => void;
  onOpenFavorites: () => void;
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

export function ConversationListScreen({ onOpen, onOpenFavorites }: Props) {
  const { conversations, createConversation, deleteConversation } = useConversations();
  const { colors, isDark, toggleDark, name, setName, favorites } = useTheme();
  const [search, setSearch] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [draftName, setDraftName] = useState(name);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter(
      (c) => c.name.toLowerCase().includes(q) || c.preview.toLowerCase().includes(q)
    );
  }, [conversations, search]);

  const handleNew = async () => {
    const conv = await createConversation();
    onOpen(conv.id);
  };

  const handleDelete = (conv: Conversation) => {
    Alert.alert('Borrar chat', `¿Querés borrar "${conv.name}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Borrar', style: 'destructive', onPress: () => deleteConversation(conv.id) },
    ]);
  };

  const openSettings = () => {
    setDraftName(name);
    setSettingsOpen(true);
  };

  const saveSettings = () => {
    setName(draftName.trim());
    setSettingsOpen(false);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top']}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* Hero header */}
      <View style={styles.hero}>
        <View style={styles.heroTop}>
          <Text style={[styles.heroGreeting, { color: colors.textSecondary }]}>
            {greeting()}{name ? `, ${name}` : ''} 👋
          </Text>
          <View style={styles.heroActions}>
            <TouchableOpacity
              style={[styles.iconButton, { backgroundColor: colors.surface }]}
              onPress={onOpenFavorites}
              activeOpacity={0.7}
            >
              <Text style={styles.iconButtonText}>⭐</Text>
              {favorites.length > 0 && (
                <View style={[styles.badge, { backgroundColor: colors.primary }]}>
                  <Text style={styles.badgeText}>{favorites.length}</Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.iconButton, { backgroundColor: colors.surface }]}
              onPress={openSettings}
              activeOpacity={0.7}
            >
              <Text style={styles.iconButtonText}>⚙️</Text>
            </TouchableOpacity>
          </View>
        </View>
        <Text style={[styles.heroTitle, { color: colors.secondary }]}>¿Qué comemos hoy?</Text>
        <Text style={[styles.heroSubtitle, { color: colors.textSecondary }]}>
          Tu chef personal, siempre listo
        </Text>
      </View>

      {/* Search bar */}
      {conversations.length > 0 && (
        <View style={styles.searchWrap}>
          <TextInput
            style={[styles.searchInput, {
              backgroundColor: colors.surface,
              borderColor: colors.inputBorder,
              color: colors.textPrimary,
            }]}
            value={search}
            onChangeText={setSearch}
            placeholder="🔍 Buscar por ingrediente o día..."
            placeholderTextColor={colors.textSecondary}
            returnKeyType="search"
          />
        </View>
      )}

      {/* Section label */}
      {conversations.length > 0 && (
        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
          TUS CONVERSACIONES
        </Text>
      )}

      {/* List or empty state */}
      {conversations.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>🍽️</Text>
          <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
            Todavía no hay chats
          </Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
            Empezá una conversación y contale al chef qué tenés en la heladera
          </Text>
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>🔍</Text>
          <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>Sin resultados</Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
            No hay chats que coincidan con "{search}"
          </Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.card, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}
              onPress={() => onOpen(item.id)}
              activeOpacity={0.85}
            >
              <View style={[styles.cardIcon, { backgroundColor: colors.primaryLight }]}>
                <Text style={styles.cardIconText}>{emojiFor(item.id)}</Text>
              </View>
              <View style={styles.cardContent}>
                <Text style={[styles.cardName, { color: colors.textPrimary }]}>{item.name}</Text>
                <Text style={[styles.cardPreview, { color: colors.textSecondary }]} numberOfLines={1}>
                  {item.preview}
                </Text>
              </View>
              <View style={styles.cardRight}>
                <Text style={[styles.cardDate, { color: colors.textSecondary }]}>
                  {formatDate(item.createdAt)}
                </Text>
                <TouchableOpacity
                  style={[styles.deleteButton, { backgroundColor: colors.background }]}
                  onPress={() => handleDelete(item)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Text style={[styles.deleteIcon, { color: colors.textSecondary }]}>✕</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      {/* Bottom CTA */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.newButton, { backgroundColor: colors.primary, shadowColor: colors.primary }]}
          onPress={handleNew}
          activeOpacity={0.85}
        >
          <Text style={styles.newButtonIcon}>＋</Text>
          <Text style={styles.newButtonText}>Nueva conversación</Text>
        </TouchableOpacity>
      </View>

      {/* Settings modal */}
      <Modal visible={settingsOpen} transparent animationType="fade" onRequestClose={() => setSettingsOpen(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.secondary }]}>Ajustes ⚙️</Text>

            <Text style={[styles.modalLabel, { color: colors.textSecondary }]}>Tu nombre</Text>
            <TextInput
              style={[styles.modalInput, {
                backgroundColor: colors.background,
                borderColor: colors.inputBorder,
                color: colors.textPrimary,
              }]}
              value={draftName}
              onChangeText={setDraftName}
              placeholder="Tu nombre"
              placeholderTextColor={colors.textSecondary}
              maxLength={20}
            />

            <View style={styles.modalRow}>
              <Text style={[styles.modalRowText, { color: colors.textPrimary }]}>
                🌙 Modo oscuro
              </Text>
              <Switch
                value={isDark}
                onValueChange={toggleDark}
                trackColor={{ false: colors.separator, true: colors.primary }}
                thumbColor="#FFFFFF"
              />
            </View>

            <TouchableOpacity
              style={[styles.modalSave, { backgroundColor: colors.primary }]}
              onPress={saveSettings}
              activeOpacity={0.85}
            >
              <Text style={styles.modalSaveText}>Guardar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  hero: {
    paddingHorizontal: 24,
    paddingTop: 18,
    paddingBottom: 12,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  heroActions: { flexDirection: 'row', gap: 10 },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButtonText: { fontSize: 18 },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: { color: '#FFF', fontSize: 10, fontWeight: '800' },
  heroGreeting: { fontSize: 15, fontWeight: '600' },
  heroTitle: {
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '800',
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  heroSubtitle: { fontSize: 14 },
  searchWrap: { paddingHorizontal: 16, marginTop: 6 },
  searchInput: {
    borderWidth: 1.5,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    paddingHorizontal: 24,
    marginTop: 14,
    marginBottom: 8,
  },
  list: { paddingHorizontal: 16, paddingBottom: 12, gap: 10 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 14,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 2,
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardIconText: { fontSize: 24 },
  cardContent: { flex: 1, marginRight: 8 },
  cardName: { fontSize: 15, fontWeight: '700', marginBottom: 3 },
  cardPreview: { fontSize: 13 },
  cardRight: { alignItems: 'flex-end', gap: 8 },
  cardDate: { fontSize: 11, fontWeight: '500' },
  deleteButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteIcon: { fontSize: 11, fontWeight: '700' },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyEmoji: { fontSize: 56, marginBottom: 14 },
  emptyTitle: { fontSize: 19, fontWeight: '700', marginBottom: 8 },
  emptySubtitle: { fontSize: 14, textAlign: 'center', lineHeight: 21 },
  bottomBar: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 24 },
  newButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 28,
    paddingVertical: 16,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  newButtonIcon: { color: '#FFF', fontSize: 18, fontWeight: '700' },
  newButtonText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  modalCard: {
    width: '100%',
    borderRadius: 22,
    padding: 22,
  },
  modalTitle: { fontSize: 20, fontWeight: '800', marginBottom: 18 },
  modalLabel: { fontSize: 13, fontWeight: '600', marginBottom: 6 },
  modalInput: {
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    marginBottom: 16,
  },
  modalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  modalRowText: { fontSize: 15, fontWeight: '600' },
  modalSave: {
    borderRadius: 22,
    paddingVertical: 13,
    alignItems: 'center',
  },
  modalSaveText: { color: '#FFF', fontSize: 15, fontWeight: '700' },
});

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Share,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { SimpleMarkdown } from '../components/SimpleMarkdown';
import { useTheme } from '../theme/ThemeContext';
import type { Favorite } from '../theme/ThemeContext';

interface Props {
  onBack: () => void;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  return `${d.getDate()} ${months[d.getMonth()]}`;
}

export function FavoritesScreen({ onBack }: Props) {
  const { colors, isDark, favorites, removeFavorite } = useTheme();

  const handleShare = (content: string) => {
    Share.share({
      message: `${content}\n\n🍳 Compartido desde ¿Qué Comemos Hoy?`,
    }).catch(() => {});
  };

  const handleDelete = (fav: Favorite) => {
    Alert.alert('Quitar favorita', '¿Querés quitar esta receta de favoritas?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Quitar', style: 'destructive', onPress: () => removeFavorite(fav.id) },
    ]);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top']}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.headerBackground, borderBottomColor: colors.separator }]}>
        <TouchableOpacity onPress={onBack} style={styles.backButton} activeOpacity={0.7}>
          <Text style={[styles.backIcon, { color: colors.secondary }]}>‹</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.secondary }]}>Recetas favoritas ⭐</Text>
        <View style={styles.backButton} />
      </View>

      {favorites.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>⭐</Text>
          <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
            Sin favoritas todavía
          </Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
            Tocá la estrella en una respuesta del chef para guardarla acá
          </Text>
        </View>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={[styles.card, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}>
              <SimpleMarkdown>{item.content}</SimpleMarkdown>
              <View style={[styles.cardFooter, { borderTopColor: colors.separator }]}>
                <Text style={[styles.cardDate, { color: colors.textSecondary }]}>
                  Guardada el {formatDate(item.savedAt)}
                </Text>
                <View style={styles.cardActions}>
                  <TouchableOpacity
                    onPress={() => handleShare(item.content)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Text style={styles.actionIcon}>📤</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleDelete(item)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Text style={styles.actionIcon}>🗑️</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: { fontSize: 34, lineHeight: 36 },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '800',
  },
  list: { padding: 16, gap: 12 },
  card: {
    borderRadius: 18,
    padding: 16,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  cardDate: { fontSize: 12 },
  cardActions: { flexDirection: 'row', gap: 18 },
  actionIcon: { fontSize: 17 },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyEmoji: { fontSize: 56, marginBottom: 14 },
  emptyTitle: { fontSize: 19, fontWeight: '700', marginBottom: 8 },
  emptySubtitle: { fontSize: 14, textAlign: 'center', lineHeight: 21 },
});

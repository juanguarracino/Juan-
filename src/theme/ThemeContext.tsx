/**
 * Contexto global: tema (claro/oscuro), nombre del usuario,
 * onboarding y recetas favoritas. Persistido en AsyncStorage.
 */
import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors as LightColors } from '../constants/Colors';

export type ThemeColors = typeof LightColors;

export const DarkColors: ThemeColors = {
  ...LightColors,
  background: '#17130E',
  surface: '#211C15',
  primaryDark: '#F2A36B',
  primaryLight: '#3A2A1B',
  secondary: '#3FB8A8',
  secondaryDark: '#8FD8CE',
  secondaryLight: '#15302C',
  bubbleAssistant: '#211C15',
  textPrimary: '#F0EAE0',
  textSecondary: '#9C9285',
  inputBackground: '#2A241B',
  inputBorder: '#3A332A',
  headerBackground: '#211C15',
  headerText: '#3FB8A8',
  separator: '#322B22',
  chipBackground: '#211C15',
  chipBorder: '#7A4A26',
  chipText: '#F2A36B',
  error: '#EF9A9A',
  errorLight: '#3B2225',
  shadow: '#000000',
};

export interface Favorite {
  id: string;
  content: string;
  savedAt: string;
}

interface AppSettings {
  colors: ThemeColors;
  isDark: boolean;
  toggleDark: () => void;
  name: string;
  setName: (n: string) => void;
  onboarded: boolean;
  completeOnboarding: (name?: string) => void;
  loaded: boolean;
  favorites: Favorite[];
  isFavorite: (content: string) => boolean;
  toggleFavorite: (content: string) => void;
  removeFavorite: (id: string) => void;
}

const SETTINGS_KEY = '@qch_settings';
const FAVORITES_KEY = '@qch_favorites';

const SettingsContext = createContext<AppSettings | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(false);
  const [name, setNameState] = useState('');
  const [onboarded, setOnboarded] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [favorites, setFavorites] = useState<Favorite[]>([]);

  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem(SETTINGS_KEY),
      AsyncStorage.getItem(FAVORITES_KEY),
    ])
      .then(([rawSettings, rawFavs]) => {
        if (rawSettings) {
          const s = JSON.parse(rawSettings);
          setIsDark(!!s.isDark);
          setNameState(s.name ?? '');
          setOnboarded(!!s.onboarded);
        }
        if (rawFavs) setFavorites(JSON.parse(rawFavs));
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  const persistSettings = useCallback((next: { isDark: boolean; name: string; onboarded: boolean }) => {
    AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(next)).catch(() => {});
  }, []);

  const toggleDark = useCallback(() => {
    setIsDark((prev) => {
      persistSettings({ isDark: !prev, name, onboarded });
      return !prev;
    });
  }, [name, onboarded, persistSettings]);

  const setName = useCallback((n: string) => {
    setNameState(n);
    persistSettings({ isDark, name: n, onboarded });
  }, [isDark, onboarded, persistSettings]);

  const completeOnboarding = useCallback((newName?: string) => {
    const finalName = newName?.trim() ?? name;
    setNameState(finalName);
    setOnboarded(true);
    persistSettings({ isDark, name: finalName, onboarded: true });
  }, [isDark, name, persistSettings]);

  const persistFavorites = useCallback((next: Favorite[]) => {
    setFavorites(next);
    AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(next)).catch(() => {});
  }, []);

  const isFavorite = useCallback(
    (content: string) => favorites.some((f) => f.content === content),
    [favorites]
  );

  const toggleFavorite = useCallback((content: string) => {
    const existing = favorites.find((f) => f.content === content);
    if (existing) {
      persistFavorites(favorites.filter((f) => f.id !== existing.id));
    } else {
      persistFavorites([
        { id: `${Date.now()}`, content, savedAt: new Date().toISOString() },
        ...favorites,
      ]);
    }
  }, [favorites, persistFavorites]);

  const removeFavorite = useCallback((id: string) => {
    persistFavorites(favorites.filter((f) => f.id !== id));
  }, [favorites, persistFavorites]);

  const value = useMemo<AppSettings>(() => ({
    colors: isDark ? DarkColors : LightColors,
    isDark,
    toggleDark,
    name,
    setName,
    onboarded,
    completeOnboarding,
    loaded,
    favorites,
    isFavorite,
    toggleFavorite,
    removeFavorite,
  }), [isDark, toggleDark, name, setName, onboarded, completeOnboarding, loaded, favorites, isFavorite, toggleFavorite, removeFavorite]);

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useTheme(): AppSettings {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useTheme must be used within SettingsProvider');
  return ctx;
}

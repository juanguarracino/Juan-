import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '../theme/ThemeContext';

const { width } = Dimensions.get('window');

interface Props {
  onDone: () => void;
}

const SLIDES = [
  {
    emoji: '👨‍🍳',
    title: 'Tu chef personal',
    text: 'Contale al chef qué ingredientes tenés en casa y te sugiere 3 recetas al instante.',
  },
  {
    emoji: '🎤',
    title: 'Hablale con tu voz',
    text: 'Mandá un audio con lo que hay en tu heladera y escuchá la respuesta del chef.',
  },
  {
    emoji: '⭐',
    title: 'Guardá tus favoritas',
    text: 'Marcá las recetas que más te gusten y encontralas siempre en un solo lugar.',
  },
];

export function OnboardingScreen({ onDone }: Props) {
  const { colors, completeOnboarding, isDark } = useTheme();
  const [index, setIndex] = useState(0);
  const [name, setName] = useState('');
  const listRef = useRef<FlatList>(null);

  const isLast = index === SLIDES.length - 1;

  const handleNext = () => {
    if (isLast) {
      completeOnboarding(name);
      onDone();
    } else {
      listRef.current?.scrollToIndex({ index: index + 1, animated: true });
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <FlatList
          ref={listRef}
          data={SLIDES}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.title}
          onMomentumScrollEnd={(e) =>
            setIndex(Math.round(e.nativeEvent.contentOffset.x / width))
          }
          renderItem={({ item, index: i }) => (
            <View style={styles.slide}>
              <Text style={styles.emoji}>{item.emoji}</Text>
              <Text style={[styles.title, { color: colors.secondary }]}>{item.title}</Text>
              <Text style={[styles.text, { color: colors.textSecondary }]}>{item.text}</Text>
              {i === SLIDES.length - 1 && (
                <View style={styles.nameBox}>
                  <Text style={[styles.nameLabel, { color: colors.textSecondary }]}>
                    ¿Cómo te llamás? (opcional)
                  </Text>
                  <TextInput
                    style={[styles.nameInput, {
                      backgroundColor: colors.surface,
                      borderColor: colors.inputBorder,
                      color: colors.textPrimary,
                    }]}
                    value={name}
                    onChangeText={setName}
                    placeholder="Tu nombre"
                    placeholderTextColor={colors.textSecondary}
                    maxLength={20}
                  />
                </View>
              )}
            </View>
          )}
        />

        {/* Dots */}
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                { backgroundColor: i === index ? colors.primary : colors.separator },
                i === index && styles.dotActive,
              ]}
            />
          ))}
        </View>

        {/* Button */}
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.primary }]}
            onPress={handleNext}
            activeOpacity={0.85}
          >
            <Text style={styles.buttonText}>
              {isLast ? '¡Empezar a cocinar! 🍳' : 'Siguiente'}
            </Text>
          </TouchableOpacity>
          {!isLast && (
            <TouchableOpacity onPress={() => { completeOnboarding(); onDone(); }}>
              <Text style={[styles.skip, { color: colors.textSecondary }]}>Saltar</Text>
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  flex: { flex: 1 },
  slide: {
    width,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emoji: { fontSize: 80, marginBottom: 24 },
  title: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 14,
    textAlign: 'center',
  },
  text: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
  nameBox: { width: '100%', marginTop: 28 },
  nameLabel: { fontSize: 13, fontWeight: '600', marginBottom: 8 },
  nameInput: {
    borderWidth: 1.5,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 20,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  dotActive: { width: 22 },
  bottomBar: {
    paddingHorizontal: 24,
    paddingBottom: 28,
    gap: 14,
    alignItems: 'center',
  },
  button: {
    width: '100%',
    borderRadius: 28,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  skip: { fontSize: 14, fontWeight: '500' },
});

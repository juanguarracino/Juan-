import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

const DOT_SIZE = 7;
const ANIMATION_DURATION = 420;

function AnimatedDot({ delay, color }: { delay: number; color: string }) {
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(translateY, {
          toValue: -5,
          duration: ANIMATION_DURATION,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: ANIMATION_DURATION,
          useNativeDriver: true,
        }),
        Animated.delay(200),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [delay, translateY]);

  return (
    <Animated.View
      style={[styles.dot, { backgroundColor: color, transform: [{ translateY }] }]}
    />
  );
}

export function TypingIndicator() {
  const { colors } = useTheme();
  return (
    <View style={styles.container}>
      <View style={[styles.avatar, { backgroundColor: colors.primaryLight, shadowColor: colors.shadow }]}>
        <Text style={styles.avatarText}>👨‍🍳</Text>
      </View>
      <View style={[styles.bubble, { backgroundColor: colors.bubbleAssistant, shadowColor: colors.shadow }]}>
        <AnimatedDot delay={0} color={colors.primary} />
        <AnimatedDot delay={160} color={colors.primary} />
        <AnimatedDot delay={320} color={colors.primary} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  avatarText: { fontSize: 17 },
  bubble: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    borderBottomLeftRadius: 5,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 5,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 3,
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
  },
});

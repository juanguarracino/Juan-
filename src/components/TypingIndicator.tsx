import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { Colors } from '../constants/Colors';

const DOT_SIZE = 7;
const ANIMATION_DURATION = 420;

function AnimatedDot({ delay }: { delay: number }) {
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

  return <Animated.View style={[styles.dot, { transform: [{ translateY }] }]} />;
}

export function TypingIndicator() {
  return (
    <View style={styles.container}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>👨‍🍳</Text>
      </View>
      <View style={styles.bubble}>
        <AnimatedDot delay={0} />
        <AnimatedDot delay={160} />
        <AnimatedDot delay={320} />
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
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  avatarText: {
    fontSize: 18,
  },
  bubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bubbleAssistant,
    borderRadius: 20,
    borderBottomLeftRadius: 5,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 5,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 3,
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    backgroundColor: Colors.accent,
  },
});

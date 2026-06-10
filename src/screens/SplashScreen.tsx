import React, { useEffect, useRef } from 'react';
import { View, Image, Animated, StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const LOGO_SIZE = width * 0.72;

interface Props {
  onFinish: () => void;
}

export function SplashScreen({ onFinish }: Props) {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.82)).current;

  useEffect(() => {
    // Fade + scale in
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        friction: 6,
        tension: 60,
        useNativeDriver: true,
      }),
    ]).start();

    // After 2.4s, fade out and notify parent
    const timer = setTimeout(() => {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start(() => onFinish());
    }, 2400);

    return () => clearTimeout(timer);
  }, [opacity, scale, onFinish]);

  return (
    <View style={styles.container}>
      <Animated.View style={{ opacity, transform: [{ scale }] }}>
        <Image
          source={require('../../assets/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FBF5EC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
  },
});

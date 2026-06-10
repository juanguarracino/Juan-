import React, { useRef, useEffect } from 'react';
import { TouchableOpacity, Animated, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

interface Props {
  isRecording: boolean;
  disabled: boolean;
  onPress: () => void;
}

export function AudioButton({ isRecording, disabled, onPress }: Props) {
  const { colors } = useTheme();
  const pulseScale = useRef(new Animated.Value(1)).current;
  const ringOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isRecording) {
      Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(pulseScale, { toValue: 1.15, duration: 550, useNativeDriver: true }),
            Animated.timing(ringOpacity, { toValue: 0.4, duration: 550, useNativeDriver: true }),
          ]),
          Animated.parallel([
            Animated.timing(pulseScale, { toValue: 1, duration: 550, useNativeDriver: true }),
            Animated.timing(ringOpacity, { toValue: 0, duration: 550, useNativeDriver: true }),
          ]),
        ])
      ).start();
    } else {
      pulseScale.setValue(1);
      ringOpacity.setValue(0);
    }
  }, [isRecording, pulseScale, ringOpacity]);

  return (
    <TouchableOpacity onPress={onPress} disabled={disabled} activeOpacity={0.75}>
      <View style={styles.wrapper}>
        {/* Pulsing ring behind button */}
        <Animated.View
          style={[
            styles.ring,
            { backgroundColor: colors.recording, opacity: ringOpacity, transform: [{ scale: pulseScale }] },
          ]}
        />
        <Animated.View
          style={[
            styles.button,
            { backgroundColor: isRecording ? colors.recording : colors.secondaryLight },
            isRecording && { shadowColor: colors.recording, ...styles.buttonRecordingShadow },
            { transform: [{ scale: pulseScale }] },
          ]}
        >
          <Text style={styles.icon}>{isRecording ? '⏹' : '🎤'}</Text>
        </Animated.View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  button: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonRecordingShadow: {
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 6,
  },
  icon: {
    fontSize: 18,
  },
});

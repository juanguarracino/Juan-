import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { AudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { Colors } from '../constants/Colors';

interface Props {
  uri: string;
  transcription: string;
}

const BARS = [3, 5, 8, 4, 7, 9, 4, 6, 8, 5, 3, 7, 5, 4, 6];

function formatSeconds(s: number): string {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

function createPlayer(uri: string): AudioPlayer | null {
  try {
    // Native module requires 4 args: source, updateInterval, pitchCorrectionQuality, shouldCorrectPitch
    return new (AudioPlayer as any)({ uri }, 250, 'low', false) as AudioPlayer;
  } catch {
    return null;
  }
}

function PlayerInner({ player, transcription }: { player: AudioPlayer; transcription: string }) {
  const status = useAudioPlayerStatus(player);
  const barAnims = useRef(BARS.map(() => new Animated.Value(1))).current;

  const isPlaying = status.playing;
  const duration = status.duration ?? 0;
  const currentTime = status.currentTime ?? 0;

  useEffect(() => {
    if (isPlaying) {
      const animations = barAnims.map((anim, i) =>
        Animated.loop(
          Animated.sequence([
            Animated.delay(i * 60),
            Animated.timing(anim, { toValue: 1.8, duration: 280, useNativeDriver: true }),
            Animated.timing(anim, { toValue: 0.6, duration: 280, useNativeDriver: true }),
          ])
        )
      );
      animations.forEach((a) => a.start());
      return () => animations.forEach((a) => a.stop());
    } else {
      barAnims.forEach((anim) => anim.setValue(1));
    }
  }, [isPlaying, barAnims]);

  const handlePress = () => {
    try {
      if (isPlaying) {
        player.pause();
      } else {
        if (currentTime >= duration - 0.1) {
          player.seekTo(0);
        }
        player.play();
      }
    } catch {}
  };

  return (
    <View style={styles.container}>
      <View style={styles.playerRow}>
        <TouchableOpacity style={styles.playBtn} onPress={handlePress} activeOpacity={0.75}>
          <Text style={styles.playIcon}>{isPlaying ? '⏸' : '▶'}</Text>
        </TouchableOpacity>

        <View style={styles.waveform}>
          {BARS.map((height, i) => (
            <Animated.View
              key={i}
              style={[
                styles.bar,
                {
                  height: height * 2.2,
                  backgroundColor: isPlaying ? Colors.primary : Colors.inputBorder,
                  transform: [{ scaleY: barAnims[i] }],
                },
              ]}
            />
          ))}
        </View>

        <Text style={styles.time}>
          {isPlaying ? formatSeconds(currentTime) : formatSeconds(duration)}
        </Text>
      </View>

      {transcription ? (
        <Text style={styles.transcription}>"{transcription}"</Text>
      ) : null}
    </View>
  );
}

export function VoicePlayer({ uri, transcription }: Props) {
  const [player, setPlayer] = useState<AudioPlayer | null>(null);

  useEffect(() => {
    const p = createPlayer(uri);
    setPlayer(p);
    return () => {
      try { (p as any)?.remove?.(); } catch {}
    };
  }, [uri]);

  if (!player) {
    // Fallback while player initializes or if creation failed
    return (
      <View style={styles.container}>
        <View style={styles.playerRow}>
          <View style={[styles.playBtn, { opacity: 0.5 }]}>
            <Text style={styles.playIcon}>▶</Text>
          </View>
          <View style={styles.waveform}>
            {BARS.map((height, i) => (
              <View
                key={i}
                style={[styles.bar, { height: height * 2.2, backgroundColor: Colors.inputBorder }]}
              />
            ))}
          </View>
        </View>
        {transcription ? (
          <Text style={styles.transcription}>"{transcription}"</Text>
        ) : null}
      </View>
    );
  }

  return <PlayerInner player={player} transcription={transcription} />;
}

const styles = StyleSheet.create({
  container: {
    gap: 6,
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  playBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playIcon: {
    color: '#fff',
    fontSize: 14,
    marginLeft: 2,
  },
  waveform: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    height: 28,
  },
  bar: {
    width: 3,
    borderRadius: 2,
  },
  time: {
    fontSize: 11,
    color: Colors.textSecondary,
    minWidth: 32,
    textAlign: 'right',
  },
  transcription: {
    fontSize: 12,
    color: 'rgba(0,0,0,0.45)',
    fontStyle: 'italic',
    lineHeight: 17,
  },
});

import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import * as FileSystem from 'expo-file-system';

let activeRecording: Audio.Recording | null = null;

const RECORDING_OPTIONS: Audio.RecordingOptions = {
  android: {
    extension: '.m4a',
    outputFormat: Audio.AndroidOutputFormat.MPEG_4,
    audioEncoder: Audio.AndroidAudioEncoder.AAC,
    sampleRate: 44100,
    numberOfChannels: 1,
    bitRate: 128000,
  },
  ios: {
    extension: '.m4a',
    audioQuality: Audio.IOSAudioQuality.HIGH,
    sampleRate: 44100,
    numberOfChannels: 1,
    bitRate: 128000,
    linearPCMBitDepth: 16,
    linearPCMIsBigEndian: false,
    linearPCMIsFloat: false,
    outputFormat: Audio.IOSOutputFormat.MPEG4AAC,
  },
  web: {
    mimeType: 'audio/webm',
    bitsPerSecond: 128000,
  },
};

export async function requestMicPermission(): Promise<boolean> {
  const { status } = await Audio.requestPermissionsAsync();
  return status === 'granted';
}

export async function startRecording(): Promise<void> {
  const granted = await requestMicPermission();
  if (!granted) throw new Error('Permiso de micrófono denegado');

  await Audio.setAudioModeAsync({
    allowsRecordingIOS: true,
    playsInSilentModeIOS: true,
  });

  const { recording } = await Audio.Recording.createAsync(RECORDING_OPTIONS);
  activeRecording = recording;
}

export async function stopRecording(): Promise<string> {
  if (!activeRecording) throw new Error('No hay grabación activa');

  await activeRecording.stopAndUnloadAsync();
  const uri = activeRecording.getURI();
  activeRecording = null;

  await Audio.setAudioModeAsync({ allowsRecordingIOS: false });

  if (!uri) throw new Error('No se pudo obtener el archivo de audio');

  const base64 = await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  return base64;
}

export function cancelRecording(): void {
  if (activeRecording) {
    activeRecording.stopAndUnloadAsync().catch(() => {});
    activeRecording = null;
  }
}

// Strip markdown and emojis before speaking
function cleanForSpeech(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/#{1,3}\s+/g, '')
    .replace(/---+/g, '. ')
    .replace(/\n{2,}/g, '. ')
    .replace(/[\u{1F300}-\u{1FFFF}]/gu, '')
    .replace(/[🎤🔊]/g, '')
    .trim();
}

export function speakText(text: string): void {
  Speech.stop();
  const cleaned = cleanForSpeech(text);
  Speech.speak(cleaned, {
    language: 'es-AR',
    rate: 0.92,
    pitch: 1.0,
  });
}

export function stopSpeaking(): void {
  Speech.stop();
}

export async function isSpeakingAsync(): Promise<boolean> {
  return Speech.isSpeakingAsync();
}

import { AudioModule, AudioRecorder, RecordingPresets } from 'expo-audio';
import * as Speech from 'expo-speech';
import * as FileSystem from 'expo-file-system';

let activeRecorder: AudioRecorder | null = null;

export async function requestMicPermission(): Promise<boolean> {
  const { granted } = await AudioModule.requestRecordingPermissionsAsync();
  return granted;
}

export async function startRecording(): Promise<void> {
  const granted = await requestMicPermission();
  if (!granted) throw new Error('Permiso de micrófono denegado');

  const recorder = new AudioRecorder({
    ...RecordingPresets.HIGH_QUALITY,
    extension: '.m4a',
  });

  await recorder.prepareToRecordAsync();
  recorder.record();
  activeRecorder = recorder;
}

export async function stopRecording(): Promise<string> {
  if (!activeRecorder) throw new Error('No hay grabación activa');

  const result = await activeRecorder.stop();
  activeRecorder = null;

  const uri = result.uri;
  if (!uri) throw new Error('No se pudo obtener el archivo de audio');

  const base64 = await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  return base64;
}

export function cancelRecording(): void {
  if (activeRecorder) {
    activeRecorder.stop().catch(() => {});
    activeRecorder = null;
  }
}

function cleanForSpeech(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/#{1,3}\s+/g, '')
    .replace(/---+/g, '. ')
    .replace(/\n{2,}/g, '. ')
    .replace(/[\u{1F300}-\u{1FFFF}]/gu, '')
    .trim();
}

export function speakText(text: string): void {
  Speech.stop();
  Speech.speak(cleanForSpeech(text), {
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

import * as Speech from 'expo-speech';

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

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

export async function speakText(text: string): Promise<void> {
  Speech.stop();

  // Pick the best available Spanish voice
  let language = 'es';
  try {
    const voices = await Speech.getAvailableVoicesAsync();
    const spanish = voices.find(
      (v) => v.language.startsWith('es-AR') || v.language.startsWith('es-419')
    ) ?? voices.find((v) => v.language.startsWith('es'));
    if (spanish) language = spanish.language;
  } catch {
    // fallback to 'es'
  }

  Speech.speak(cleanForSpeech(text), {
    language,
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

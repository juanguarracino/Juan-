import Constants from 'expo-constants';

export async function transcribeAudio(uri: string): Promise<string> {
  const apiKey = (Constants.expoConfig?.extra as { openaiApiKey?: string } | undefined)
    ?.openaiApiKey;

  if (!apiKey) {
    throw new Error('OPENAI_API_KEY no configurado. Agregalo en tu archivo .env');
  }

  const formData = new FormData();
  formData.append('file', { uri, type: 'audio/mp4', name: 'audio.m4a' } as any);
  formData.append('model', 'whisper-1');
  formData.append('language', 'es');

  const res = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}` },
    body: formData,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Error al transcribir: ${text}`);
  }

  const json = await res.json();
  return json.text as string;
}

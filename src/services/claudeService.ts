import Anthropic from '@anthropic-ai/sdk';
import Constants from 'expo-constants';
import { RECIPE_SYSTEM_PROMPT } from '../constants/Prompts';
import type { ApiMessage } from '../types/chat';

let client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!client) {
    const apiKey = (Constants.expoConfig?.extra as { anthropicApiKey?: string } | undefined)
      ?.anthropicApiKey;

    if (!apiKey) {
      throw new Error(
        'ANTHROPIC_API_KEY not found. Please add it to your .env file as ANTHROPIC_API_KEY=sk-...'
      );
    }

    client = new Anthropic({
      apiKey,
      dangerouslyAllowBrowser: true, // required for React Native / non-Node environments
    });
  }
  return client;
}

export async function sendMessageToClaude(history: ApiMessage[]): Promise<string> {
  const response = await getClient().messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1500,
    system: RECIPE_SYSTEM_PROMPT,
    messages: history,
  });

  const block = response.content[0];
  if (!block || block.type !== 'text') {
    throw new Error('Unexpected response from Claude API');
  }
  return block.text;
}

export async function sendAudioMessageToClaude(
  history: ApiMessage[],
  audioBase64: string
): Promise<string> {
  const messages = [
    ...history.map((m) => ({ role: m.role, content: m.content })),
    {
      role: 'user' as const,
      content: [
        {
          type: 'input_audio',
          source: {
            type: 'base64',
            media_type: 'audio/mp4',
            data: audioBase64,
          },
        },
      ] as any,
    },
  ];

  const response = await getClient().messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1500,
    system: RECIPE_SYSTEM_PROMPT,
    messages: messages as any,
  });

  const block = response.content[0];
  if (!block || block.type !== 'text') {
    throw new Error('Unexpected response from Claude API');
  }
  return block.text;
}

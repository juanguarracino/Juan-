export type Role = 'user' | 'assistant';

export interface Conversation {
  id: string;
  name: string;
  preview: string;
  createdAt: string; // ISO string
}

export interface Message {
  id: string;
  role: Role;
  content: string;
  timestamp: Date;
  isError?: boolean;
}

// Shape expected by the Anthropic API
export interface ApiMessage {
  role: Role;
  content: string;
}

export interface ConversationState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}

export type ChatAction =
  | { type: 'SEND_MESSAGE'; message: Message }
  | { type: 'RECEIVE_REPLY'; message: Message }
  | { type: 'SET_ERROR'; error: string }
  | { type: 'CLEAR' };

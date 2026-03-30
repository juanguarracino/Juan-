import React, { useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SplashScreen } from './src/screens/SplashScreen';
import { ConversationListScreen } from './src/screens/ConversationListScreen';
import { ChatScreen } from './src/screens/ChatScreen';

type Screen =
  | { name: 'splash' }
  | { name: 'list' }
  | { name: 'chat'; conversationId: string };

export default function App() {
  const [screen, setScreen] = useState<Screen>({ name: 'splash' });

  return (
    <SafeAreaProvider>
      {screen.name === 'splash' && (
        <SplashScreen onFinish={() => setScreen({ name: 'list' })} />
      )}
      {screen.name === 'list' && (
        <ConversationListScreen
          onOpen={(id) => setScreen({ name: 'chat', conversationId: id })}
        />
      )}
      {screen.name === 'chat' && (
        <ChatScreen
          conversationId={screen.conversationId}
          onBack={() => setScreen({ name: 'list' })}
        />
      )}
    </SafeAreaProvider>
  );
}

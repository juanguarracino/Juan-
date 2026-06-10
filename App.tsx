import React, { useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SettingsProvider, useTheme } from './src/theme/ThemeContext';
import { SplashScreen } from './src/screens/SplashScreen';
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { ConversationListScreen } from './src/screens/ConversationListScreen';
import { ChatScreen } from './src/screens/ChatScreen';
import { FavoritesScreen } from './src/screens/FavoritesScreen';

type Screen =
  | { name: 'splash' }
  | { name: 'onboarding' }
  | { name: 'list' }
  | { name: 'chat'; conversationId: string }
  | { name: 'favorites' };

function Root() {
  const { onboarded } = useTheme();
  const [screen, setScreen] = useState<Screen>({ name: 'splash' });

  return (
    <>
      {screen.name === 'splash' && (
        <SplashScreen
          onFinish={() => setScreen({ name: onboarded ? 'list' : 'onboarding' })}
        />
      )}
      {screen.name === 'onboarding' && (
        <OnboardingScreen onDone={() => setScreen({ name: 'list' })} />
      )}
      {screen.name === 'list' && (
        <ConversationListScreen
          onOpen={(id) => setScreen({ name: 'chat', conversationId: id })}
          onOpenFavorites={() => setScreen({ name: 'favorites' })}
        />
      )}
      {screen.name === 'chat' && (
        <ChatScreen
          conversationId={screen.conversationId}
          onBack={() => setScreen({ name: 'list' })}
        />
      )}
      {screen.name === 'favorites' && (
        <FavoritesScreen onBack={() => setScreen({ name: 'list' })} />
      )}
    </>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <SettingsProvider>
        <Root />
      </SettingsProvider>
    </SafeAreaProvider>
  );
}

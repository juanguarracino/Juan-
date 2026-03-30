import React, { useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SplashScreen } from './src/screens/SplashScreen';
import { ChatScreen } from './src/screens/ChatScreen';

export default function App() {
  const [splashDone, setSplashDone] = useState(false);

  return (
    <SafeAreaProvider>
      {splashDone ? (
        <ChatScreen />
      ) : (
        <SplashScreen onFinish={() => setSplashDone(true)} />
      )}
    </SafeAreaProvider>
  );
}

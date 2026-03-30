import React, { useCallback, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useChat } from '../hooks/useChat';
import { useConversations } from '../hooks/useConversations';
import { MessageList } from '../components/MessageList';
import { ChatInput } from '../components/ChatInput';
import { Colors } from '../constants/Colors';

interface Props {
  conversationId: string;
  onBack: () => void;
}

export function ChatScreen({ conversationId, onBack }: Props) {
  const { updatePreview } = useConversations();

  const handlePreviewUpdate = useCallback(
    (preview: string) => updatePreview(conversationId, preview),
    [conversationId, updatePreview]
  );

  const { messages, isLoading, sendMessage, clearChat } = useChat(
    conversationId,
    handlePreviewUpdate
  );

  const listOpacity = useRef(new Animated.Value(1)).current;
  const listTranslateY = useRef(new Animated.Value(0)).current;

  const animatedClear = useCallback(() => {
    Animated.parallel([
      Animated.timing(listOpacity, {
        toValue: 0,
        duration: 280,
        useNativeDriver: true,
      }),
      Animated.timing(listTranslateY, {
        toValue: 24,
        duration: 280,
        useNativeDriver: true,
      }),
    ]).start(() => {
      clearChat();
      listTranslateY.setValue(-16);
      Animated.parallel([
        Animated.timing(listOpacity, {
          toValue: 1,
          duration: 360,
          useNativeDriver: true,
        }),
        Animated.spring(listTranslateY, {
          toValue: 0,
          friction: 7,
          tension: 70,
          useNativeDriver: true,
        }),
      ]).start();
    });
  }, [clearChat, listOpacity, listTranslateY]);

  const handleClear = () => {
    Alert.alert(
      'Limpiar chat',
      '¿Querés borrar toda la conversación?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Borrar', style: 'destructive', onPress: animatedClear },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        {/* Back button */}
        <TouchableOpacity onPress={onBack} style={styles.backButton} activeOpacity={0.7}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>

        {/* Center: logo + title */}
        <View style={styles.headerCenter}>
          <Text style={styles.headerEmoji}>👨‍🍳</Text>
          <View>
            <Text style={styles.headerTitle}>¿Qué Comemos Hoy?</Text>
            <Text style={styles.headerSubtitle}>
              {isLoading ? 'Pensando recetas...' : 'Tu Chef Chatbot'}
            </Text>
          </View>
        </View>

        {/* Right: Limpiar button */}
        <View style={styles.headerRight}>
          {messages.length > 0 && (
            <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
              <Text style={styles.clearButtonText}>Limpiar</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Chat area */}
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <Animated.View
          style={[
            styles.messagesContainer,
            { opacity: listOpacity, transform: [{ translateY: listTranslateY }] },
          ]}
        >
          <MessageList messages={messages} isLoading={isLoading} />
        </Animated.View>
        <ChatInput onSend={sendMessage} isLoading={isLoading} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.headerBackground,
  },
  flex: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: Colors.headerBackground,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 6,
  },
  backButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
  },
  backIcon: {
    color: Colors.headerText,
    fontSize: 36,
    lineHeight: 38,
    fontWeight: '300',
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerEmoji: {
    fontSize: 28,
  },
  headerTitle: {
    color: Colors.headerText,
    fontSize: 16,
    fontWeight: '700',
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 11,
    marginTop: 1,
  },
  headerRight: {
    minWidth: 68,
    alignItems: 'flex-end',
  },
  clearButton: {
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  clearButtonText: {
    color: Colors.headerText,
    fontSize: 12,
    fontWeight: '500',
  },
  messagesContainer: {
    flex: 1,
  },
});

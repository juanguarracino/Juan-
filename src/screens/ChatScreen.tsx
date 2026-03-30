import React, { useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
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

  const handleClear = () => {
    Alert.alert(
      'Limpiar chat',
      '¿Querés borrar toda la conversación?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Borrar', style: 'destructive', onPress: clearChat },
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
        <View style={styles.messagesContainer}>
          <MessageList messages={messages} isLoading={isLoading} />
        </View>
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

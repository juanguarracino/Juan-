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
import { useTheme } from '../theme/ThemeContext';

interface Props {
  conversationId: string;
  onBack: () => void;
}

export function ChatScreen({ conversationId, onBack }: Props) {
  const { updatePreview } = useConversations();
  const { colors, isDark } = useTheme();

  const handlePreviewUpdate = useCallback(
    (preview: string) => updatePreview(conversationId, preview),
    [conversationId, updatePreview]
  );

  const { messages, isLoading, sendMessage, sendVoiceMessage, clearChat } = useChat(
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

  // Solo el saludo del bot → mostrar chips de ingredientes
  const showSuggestions = messages.length <= 1;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.headerBackground }]} edges={['top']}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* Header */}
      <View style={[styles.header, {
        backgroundColor: colors.headerBackground,
        borderBottomColor: colors.separator,
        shadowColor: colors.shadow,
      }]}>
        <TouchableOpacity onPress={onBack} style={styles.backButton} activeOpacity={0.7}>
          <Text style={[styles.backIcon, { color: colors.secondary }]}>‹</Text>
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <View style={[styles.headerAvatar, { backgroundColor: colors.primaryLight }]}>
            <Text style={styles.headerEmoji}>👨‍🍳</Text>
          </View>
          <View>
            <Text style={[styles.headerTitle, { color: colors.secondary }]}>El Chef</Text>
            <View style={styles.statusRow}>
              <View style={[styles.statusDot, { backgroundColor: isLoading ? colors.primary : '#4CAF50' }]} />
              <Text style={[
                styles.headerSubtitle,
                { color: isLoading ? colors.primaryDark : colors.textSecondary },
                isLoading && styles.headerSubtitleBusy,
              ]}>
                {isLoading ? 'Pensando recetas...' : 'En línea'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.headerRight}>
          {messages.length > 0 && (
            <TouchableOpacity
              onPress={handleClear}
              style={[styles.clearButton, { backgroundColor: colors.background, borderColor: colors.separator }]}
              activeOpacity={0.7}
            >
              <Text style={[styles.clearButtonText, { color: colors.textSecondary }]}>Limpiar</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Chat area */}
      <KeyboardAvoidingView
        style={[styles.flex, { backgroundColor: colors.background }]}
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
        <ChatInput
          onSend={sendMessage}
          onSendVoice={sendVoiceMessage}
          isLoading={isLoading}
          showSuggestions={showSuggestions}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  flex: { flex: 1 },
  header: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  backButton: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 2,
  },
  backIcon: {
    fontSize: 34,
    lineHeight: 36,
    fontWeight: '400',
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerEmoji: { fontSize: 22 },
  headerTitle: { fontSize: 17, fontWeight: '800' },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 2,
  },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  headerSubtitle: { fontSize: 12 },
  headerSubtitleBusy: { fontWeight: '600' },
  headerRight: { minWidth: 66, alignItems: 'flex-end' },
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
  },
  clearButtonText: { fontSize: 12, fontWeight: '600' },
  messagesContainer: { flex: 1 },
});

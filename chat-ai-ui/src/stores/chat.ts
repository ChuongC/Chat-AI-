
import { defineStore } from 'pinia';
import { ref } from 'vue';
import axios from 'axios';
import { useUserStore } from './user';

interface ChatMessage {
  message: string;
  reply: string;
}

interface FormattedMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface Conversation {
  id: string;
  name: string;
  createdAt: string;
}

export const useChatStore = defineStore('chat', () => {
  const messages         = ref<{ role: string; content: string }[]>([]);
  const isLoading        = ref(false);
  const conversations    = ref<Conversation[]>([]);
  const currentConversationId = ref<string | null>(null);
  const isSidebarOpen    = ref(true);

  const userStore = useUserStore();

  // ── Conversations

  const loadConversations = async () => {
    if (!userStore.userId) return;
    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL}/conversations`,
        { userId: userStore.userId }
      );
      // Sort newest-first so the list feels like a chat app
      conversations.value = (data.conversations ?? []).reverse();
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  };

  const createConversation = async () => {
    if (!userStore.userId) return;
    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL}/conversations/create`,
        { userId: userStore.userId, name: 'New Conversation' }
      );
      const newConv: Conversation = data.conversation;
      conversations.value.unshift(newConv);   // prepend so it appears at top
      await switchConversation(newConv.id);
    } catch (error) {
      console.error('Error creating conversation:', error);
    }
  };

  const renameConversation = async (id: string, name: string) => {
    if (!name.trim()) return;
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/conversations/rename`,
        { userId: userStore.userId, conversationId: id, name: name.trim() }
      );
      const conv = conversations.value.find((c) => c.id === id);
      if (conv) conv.name = name.trim();
    } catch (error) {
      console.error('Error renaming conversation:', error);
    }
  };

  const deleteConversation = async (id: string) => {
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/conversations/delete`,
        { userId: userStore.userId, conversationId: id }
      );
      conversations.value = conversations.value.filter((c) => c.id !== id);

      if (currentConversationId.value === id) {
        if (conversations.value.length > 0) {
          const firstConv = conversations.value[0];
          if (firstConv) {
            await switchConversation(firstConv.id);
          }
        } else {
          currentConversationId.value = null;
          messages.value = [];
        }
    }
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  };

  const switchConversation = async (id: string) => {
    currentConversationId.value = id;
    messages.value = [];
    await loadChatHistory();
  };

  // ── Messages

  const loadChatHistory = async () => {
    if (!userStore.userId) return;
    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL}/chat-history`,
        {
          userId: userStore.userId,
          ...(currentConversationId.value ? { conversationId: currentConversationId.value } : {}),
        }
      );
      // Server returns { message: ChatMessage[] }
      messages.value = (data.message as ChatMessage[])
        .flatMap((msg): FormattedMessage[] => [
          { role: 'user',      content: msg.message },
          { role: 'assistant', content: msg.reply   },
        ])
        .filter((msg) => msg.content);
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  };

  const sendMessage = async (message: string) => {
    if (!message.trim() || !userStore.userId) return;

    messages.value.push({ role: 'user', content: message });
    isLoading.value = true;

    try {
      const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/chat`, {
        userId: userStore.userId,
        message,
        ...(currentConversationId.value ? { conversationId: currentConversationId.value } : {}),
      });
      messages.value.push({ role: 'assistant', content: data.reply });
    } catch (err) {
      console.error('Error sending message:', err);
      messages.value.push({
        role: 'assistant',
        content: 'Sorry, there was an error processing your message. Please try again later.',
      });
    } finally {
      isLoading.value = false;
    }
  };

  const toggleSidebar = () => {
    isSidebarOpen.value = !isSidebarOpen.value;
  };

  return {
    messages,
    isLoading,
    conversations,
    currentConversationId,
    isSidebarOpen,
    loadConversations,
    createConversation,
    renameConversation,
    deleteConversation,
    switchConversation,
    loadChatHistory,
    sendMessage,
    toggleSidebar,
  };
});
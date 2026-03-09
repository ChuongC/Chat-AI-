<script setup lang="ts">
import { onMounted, nextTick, ref } from 'vue';
import { useUserStore } from '../stores/user';
import { useChatStore } from '../stores/chat';
import Header from '../components/Header.vue';
import ChatInput from '../components/ChatInput.vue';
import Sidebar from '../components/Sidebar.vue';

const userStore = useUserStore();
const chatStore = useChatStore();

// Tracks whether /frappe-auth has resolved so the UI knows when to render
const isAuthReady = ref(false);
const authError   = ref('');

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatMessage = (text: string): string => {
  if (!text) return '';
  return text
    .replace(/\n/g, '<br>')
    .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
    .replace(/\*(.*?)\*/g, '<i>$1</i>')
    .replace(/`(.*?)`/g, '<code>$1</code>')
    .replace(/(?:^|\n)- (.*?)(?:\n|$)/g, '<li>$1</li>')
    .replace(/(?:^|\n)(\d+)\. (.*?)(?:\n|$)/g, '<li>$1. $2</li>')
    .replace(/<\/li>\n<li>/g, '</li><li>')
    .replace(/<li>/, '<ul><li>')
    .replace(/<\/li>$/, '</li></ul>');
};

const scrollToBottom = () => {
  nextTick(() => {
    const el = document.getElementById('chat-container');
    if (el) el.scrollTop = el.scrollHeight;
  });
};

// ─── Mount: resolve identity from Frappe session, no form needed ──────────────

onMounted(async () => {
  try {
    // frappe is a global object Frappe injects on every app page.
    // If the user is not logged in, Frappe itself redirects to /login
    // before this component ever mounts — so Guest here is an edge case only.
    const frappe   = (window as any).frappe;
    const email    = frappe?.session?.user as string | undefined;
    const fullName = frappe?.boot?.user_info?.full_name as string | undefined;

    if (!email || email === 'Guest') {
      authError.value = 'You must be logged in to Frappe CRM to use the AI assistant.';
      return;
    }

    // Auto-register on first visit, no-op on subsequent visits.
    // Returns { userId, name, email, streamToken }
    await userStore.loginWithFrappe(email, fullName ?? email);

    isAuthReady.value = true;

    await chatStore.loadConversations();
    await chatStore.loadChatHistory();
    scrollToBottom();

  } catch (err) {
    console.error('[ChatView] mount error:', err);
    authError.value = 'Failed to initialise the AI assistant. Please refresh the page.';
  }
});
</script>

<template>
  <!-- Auth error (edge case — Frappe normally handles this redirect itself) -->
  <div
    v-if="authError"
    class="flex items-center justify-center h-screen bg-gray-900 text-red-400 text-sm px-6 text-center"
  >
    {{ authError }}
  </div>

  <!-- Loading while /frappe-auth resolves (usually < 300 ms) -->
  <div
    v-else-if="!isAuthReady"
    class="flex items-center justify-center h-screen bg-gray-900 text-gray-500 text-sm"
  >
    <span class="animate-pulse">Loading assistant…</span>
  </div>

  <!-- Main chat UI — only shown once auth is confirmed -->
  <div v-else class="flex h-screen bg-gray-900 text-white overflow-hidden">

    <!-- Sidebar -->
    <Sidebar />

    <!-- Main area -->
    <div class="flex flex-col flex-1 min-w-0">
      <Header />

      <!-- Chat messages -->
      <div id="chat-container" class="flex-1 overflow-y-auto p-4 space-y-4">

        <!-- Empty state -->
        <div
          v-if="chatStore.messages.length === 0 && !chatStore.isLoading"
          class="flex flex-col items-center justify-center h-full gap-3 text-gray-500 select-none"
        >
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="1.4"
            stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          <p class="text-sm">Send a message to start the conversation.</p>
        </div>

        <!-- Messages -->
        <div
          v-for="(msg, index) in chatStore.messages"
          :key="index"
          class="flex items-start"
          :class="msg.role === 'user' ? 'justify-end' : 'justify-start'"
        >
          <div
            v-html="formatMessage(msg.content)"
            class="max-w-xs px-4 py-2 rounded-lg md:max-w-md"
            :class="msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-white'"
          ></div>
        </div>

        <!-- Thinking indicator -->
        <div v-if="chatStore.isLoading" class="flex justify-start items-center gap-2">
          <div class="bg-gray-700 text-white px-4 py-2 rounded-lg"></div>
          <span class="animate-pulse text-sm text-gray-400">AI is thinking…</span>
        </div>
      </div>

      <!-- Chat input -->
      <ChatInput @send="(msg) => { chatStore.sendMessage(msg); scrollToBottom(); }" />
    </div>

  </div>
</template>
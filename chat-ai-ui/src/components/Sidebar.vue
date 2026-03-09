<script setup lang="ts">
import { ref, nextTick } from 'vue';
import { useChatStore } from '../stores/chat';
import type { Conversation } from '../stores/chat';
import '../style.css';

const chatStore = useChatStore();

// ── Rename state ───────────────────────────────────────────────
const editingId   = ref<string | null>(null);
const editingName = ref('');
const editInputRef = ref<HTMLInputElement | null>(null);

const startEdit = async (conv: Conversation) => {
  editingId.value   = conv.id;
  editingName.value = conv.name;
  await nextTick();
  editInputRef.value?.focus();
  editInputRef.value?.select();
};

const commitEdit = async () => {
  if (editingId.value) {
    await chatStore.renameConversation(editingId.value, editingName.value);
  }
  cancelEdit();
};

const cancelEdit = () => {
  editingId.value   = null;
  editingName.value = '';
};

// ── Delete confirmation state ──────────────────────────────────
const confirmDeleteId = ref<string | null>(null);

const askDelete = (id: string) => {
  confirmDeleteId.value = id;
};

const confirmDelete = async () => {
  if (confirmDeleteId.value) {
    await chatStore.deleteConversation(confirmDeleteId.value);
  }
  confirmDeleteId.value = null;
};

const cancelDelete = () => {
  confirmDeleteId.value = null;
};
</script>

<template>
  <!-- Sidebar panel -->
  <aside
    class="sidebar"
    :class="chatStore.isSidebarOpen ? 'sidebar--open' : 'sidebar--closed'"
  >
    <!-- Header -->
    <div class="sidebar__header">
      <span class="sidebar__title">Conversations</span>
      <button class="sidebar__toggle" @click="chatStore.toggleSidebar" title="Close sidebar">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M15 18l-6-6 6-6"/>
        </svg>
      </button>
    </div>

    <!-- New conversation button -->
    <button class="sidebar__new-btn" @click="chatStore.createConversation">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
      </svg>
      New Conversation
    </button>

    <!-- Conversation list -->
    <nav class="sidebar__list">
      <div
        v-for="conv in chatStore.conversations"
        :key="conv.id"
        class="conv-item"
        :class="{ 'conv-item--active': chatStore.currentConversationId === conv.id }"
        @click="editingId !== conv.id && chatStore.switchConversation(conv.id)"
      >
        <!-- Rename input -->
        <template v-if="editingId === conv.id">
          <input
            ref="editInputRef"
            v-model="editingName"
            class="conv-item__input"
            maxlength="60"
            @keyup.enter="commitEdit"
            @keyup.esc="cancelEdit"
            @blur="commitEdit"
            @click.stop
          />
        </template>

        <!-- Normal view -->
        <template v-else>
          <svg class="conv-item__icon" width="15" height="15" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          <span class="conv-item__name">{{ conv.name }}</span>

          <!-- Action buttons (visible on hover / active) -->
          <div class="conv-item__actions" @click.stop>
            <button
              class="conv-item__btn"
              title="Rename"
              @click="startEdit(conv)"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2.2"
                stroke-linecap="round" stroke-linejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </button>
            <button
              class="conv-item__btn conv-item__btn--delete"
              title="Delete"
              @click="askDelete(conv.id)"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2.2"
                stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                <path d="M10 11v6"/><path d="M14 11v6"/>
                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
              </svg>
            </button>
          </div>
        </template>
      </div>

      <!-- Empty state -->
      <div v-if="chatStore.conversations.length === 0" class="sidebar__empty">
        No conversations yet.<br/>Click <strong>+ New Conversation</strong> to start.
      </div>
    </nav>

    <!-- Delete confirmation modal -->
    <Teleport to="body">
      <div v-if="confirmDeleteId" class="modal-overlay" @click.self="cancelDelete">
        <div class="modal">
          <div class="modal__icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="1.8"
              stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
              <path d="M10 11v6"/><path d="M14 11v6"/>
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
            </svg>
          </div>
          <h3 class="modal__title">Delete Conversation?</h3>
          <p class="modal__body">This will permanently remove all messages in this conversation. This action cannot be undone.</p>
          <div class="modal__actions">
            <button class="modal__btn modal__btn--cancel" @click="cancelDelete">Cancel</button>
            <button class="modal__btn modal__btn--confirm" @click="confirmDelete">Delete</button>
          </div>
        </div>
      </div>
    </Teleport>
  </aside>

  <!-- Collapsed toggle (shown when sidebar is closed) -->
  <button
    v-if="!chatStore.isSidebarOpen"
    class="sidebar__reopen-btn"
    @click="chatStore.toggleSidebar"
    title="Open sidebar"
  >
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M9 18l6-6-6-6"/>
    </svg>
  </button>
</template>

// stores/user.ts
//
// Add loginWithFrappe() to your existing user store.
// It calls /frappe-auth, stores userId, and saves the Stream token
// so chatStore and Stream Chat client can use it.

import { defineStore } from 'pinia';
import { ref } from 'vue';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:5000';

export const useUserStore = defineStore('user', () => {
  const userId      = ref('');
  const userName    = ref('');
  const userEmail   = ref('');
  const streamToken = ref('');

  /**
   * Called once on ChatView mount.
   * Reads identity from Frappe session (passed in by the component),
   * hits /frappe-auth, and populates the store.
   * Never called again unless the page is hard-refreshed.
   */
  async function loginWithFrappe(email: string, name: string) {
    const { data } = await axios.post(`${API_BASE}/frappe-auth`, { email, name });
    // data = { userId, name, email, streamToken }
    userId.value      = data.userId;
    userName.value    = data.name;
    userEmail.value   = data.email;
    streamToken.value = data.streamToken;
  }

  return { userId, userName, userEmail, streamToken, loginWithFrappe };
});
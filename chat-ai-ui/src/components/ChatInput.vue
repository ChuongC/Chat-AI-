<script setup lang="ts">
import { ref } from 'vue';

const message = ref('');
const emit = defineEmits(['send']);

const sendMessage = () => {
    if(!message.value.trim()) return;

    emit('send', message.value);
    message.value = '';
}
</script>

<template>
    <div class="p-4 bg-gray-800 flex">
        <input 
            v-model="message" 
            @keyup.enter="sendMessage" 
            class="flex-1 p-2 rounded-lg bg-gray-700 text-white focus:outline-none" 
            placeholder="Type your message..."
        />
        <button 
            @click="sendMessage" 
            class="px-4 ml-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none"
        >
            Send
        </button>
    </div>
</template>
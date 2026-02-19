<template>
  <div class="chat-wrapper">
    <!-- Header -->
    <div class="chat-header">
      <h2>Global Chat</h2>
      <p>Pet Adoption Community</p>
      <small v-if="currentUser" style="opacity: 0.8">Logged in as: {{ currentUser }}</small>
    </div>

    <!-- Messages Container -->
    <div class="messages-container">
      <div v-if="loading" class="loading">
        <p>Loading messages...</p>
      </div>

      <div v-else class="messages">
        <div v-if="messages.length === 0" class="no-messages">
          <p>No messages yet. Start the conversation!</p>
        </div>

        <div
            v-for="msg in messages"
            :key="msg._id"
            :class="[
            'message',
            isCurrentUser(msg.senderId)
              ? 'message-sent'
              : 'message-received'
          ]"
        >
          <div class="message-bubble">
            <p class="message-sender">{{ msg.senderId }}</p>
            <p class="message-content">{{ msg.content }}</p>
            <small class="message-time">
              {{ formatDate(msg.timestamp) }}
            </small>
          </div>
        </div>

        <div ref="messagesEnd"></div>
      </div>
    </div>

    <!-- Input Section -->
    <div class="message-input-section">
      <div class="message-input">
        <input
            v-model="newMessage"
            placeholder="Type a message..."
            @keyup.enter="sendMessage"
            :disabled="loading"
        />
        <button
            @click="sendMessage"
            :disabled="!newMessage.trim() || loading"
        >
          Send
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, computed } from 'vue';
import chatService from '../services/chatService.js';
import { useAuthStore } from '../stores/authStore.js';

const authStore = useAuthStore();
const MAIN_ROOM_ID = '696d5e1c92151357fa8de666';

const messages = ref([]);
const newMessage = ref('');
const loading = ref(true);
const messagesEnd = ref(null);
let unsubscribe = null;

const currentUser = computed(() => authStore.user?.email || 'anonymous');

const formatDate = (value) => {
  if (!value) return '';

  const date =
      typeof value === 'object' && value.$date
          ? new Date(value.$date)
          : new Date(value);

  if (isNaN(date.getTime())) return '';

  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
};

const isCurrentUser = (senderId) => {
  return senderId === currentUser.value;
};

const scrollToBottom = () => {
  nextTick(() => {
    messagesEnd.value?.scrollIntoView({ behavior: 'smooth' });
  });
};

const loadMessages = async () => {
  try {
    messages.value = await chatService.getHistory(MAIN_ROOM_ID, 50);
  } catch (error) {
    console.error('Failed to load messages:', error);
  } finally {
    loading.value = false;
    scrollToBottom();
  }
};

const sendMessage = async () => {
  if (!newMessage.value.trim()) return;

  try {
    await chatService.sendMessage({
      roomId: MAIN_ROOM_ID,
      senderId: currentUser.value,
      content: newMessage.value,
    });

    newMessage.value = '';
    // Don't add message here - let WebSocket handle it
  } catch (error) {
    console.error('Failed to send message:', error);
  }
};

const handleSocketEvent = (event) => {
  console.log('Socket event:', event.type);

  if (event.type === 'new_message') {
    const msg = event.data;
    // Check if message already exists to avoid duplicates
    if (!messages.value.find(m => m._id === msg._id)) {
      messages.value.push(msg);
      scrollToBottom();
    }
  }

  if (event.type === 'user_joined') {
    console.log('User joined:', event.data);
  }

  if (event.type === 'user_left') {
    console.log('User left:', event.data);
  }
};

onMounted(async () => {
  // Load history first
  await loadMessages();

  // Initialize WebSocket connection
  console.log('Mounting chat component, current user:', currentUser.value);
  chatService.initSocket(MAIN_ROOM_ID, currentUser.value);

  // Subscribe to socket events
  unsubscribe = chatService.onSocketEvent(handleSocketEvent);
});

onUnmounted(() => {
  // Cleanup
  if (unsubscribe) {
    unsubscribe();
  }
  chatService.disconnectSocket();
});
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.chat-wrapper {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: linear-gradient(135deg, #fef3e2 0%, #fff8f0 100%);
}

/* Header */
.chat-header {
  background: linear-gradient(135deg, #ff7f50 0%, #ff6b35 100%);
  color: white;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.chat-header h2 {
  margin: 0;
  font-size: 1.75rem;
  font-weight: 700;
}

.chat-header p {
  margin: 0.25rem 0 0;
  font-size: 0.875rem;
  opacity: 0.9;
}

/* Messages */
.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
}

.loading,
.no-messages {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #999;
  font-size: 1rem;
}

.messages {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.message {
  display: flex;
}

.message-sent {
  justify-content: flex-end;
}

.message-received {
  justify-content: flex-start;
}

.message-bubble {
  max-width: 70%;
  padding: 0.75rem 1rem;
  border-radius: 1rem;
  word-wrap: break-word;
}

.message-sent .message-bubble {
  background: linear-gradient(135deg, #ff7f50 0%, #ff6b35 100%);
  color: white;
  border-bottom-right-radius: 0.25rem;
}

.message-received .message-bubble {
  background: white;
  border: 1px solid #e0e0e0;
  border-bottom-left-radius: 0.25rem;
}

.message-sender {
  font-size: 0.75rem;
  font-weight: 600;
  margin: 0 0 0.25rem 0;
  opacity: 0.8;
}

.message-content {
  font-size: 0.95rem;
  margin: 0;
  line-height: 1.4;
}

.message-time {
  font-size: 0.7rem;
  opacity: 0.7;
  margin-top: 0.5rem;
  display: block;
}

/* Input */
.message-input-section {
  padding: 1rem 1.5rem;
  background: white;
  border-top: 1px solid #e0e0e0;
  box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.05);
}
.message-input {
  display: flex;
  align-items: center;
  width: 100%;
  gap: 0.75rem;
}

.message-input input {
  flex: 1 1 auto;   /* grow and shrink as needed */
  min-width: 50px;     /* allow shrinking */
  padding: 0.75rem 1rem;
  border-radius: 1.5rem;
  border: 1px solid #ddd;
  font-size: 0.95rem;
  font-family: inherit;
  outline: none;
  transition: all 0.3s ease;
}

.message-input button {
  flex: 0 0 auto;   /* take only natural width */
  padding: 0.75rem 1.5rem;
  border-radius: 1.5rem;
  border: none;
  background: linear-gradient(135deg, #ff7f50 0%, #ff6b35 100%);
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  width: 20%;
}

.message-input input:focus {
  border-color: #ff7f50;
  box-shadow: 0 0 0 3px rgba(255, 127, 80, 0.1);
}


.message-input button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(255, 107, 53, 0.3);
}

.message-input button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
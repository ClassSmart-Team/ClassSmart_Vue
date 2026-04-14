<script setup lang="ts">
import SidebarLayout from '@/components/ParentSidebar.vue'
import { ref } from 'vue'

const messages = ref([
  {
    id: 1,
    user: 'Prof. Mario',
    text: 'Bienvenidos al foro de Matemáticas.',
    time: '09:00 AM',
    isMe: false,
  },
  {
    id: 2,
    user: 'Tú (Padre)',
    text: 'Gracias profesor, estaré pendiente.',
    time: '10:30 AM',
    isMe: true,
  },
])
const newMessage = ref('')

const sendMessage = () => {
  if (newMessage.value.trim()) {
    messages.value.push({
      id: Date.now(),
      user: 'Tú (Padre)',
      text: newMessage.value,
      time: 'Ahora',
      isMe: true,
    })
    newMessage.value = ''
  }
}
</script>

<template>
  <SidebarLayout>
    <div class="ContSmall center">
      <h1>Foro: Matemáticas IV</h1>
    </div>

    <div class="ContBig chat-container" style="margin-top: 40px">
      <div class="chat-window">
        <div v-for="m in messages" :key="m.id" :class="['bubble', { mine: m.isMe }]">
          <span class="user">{{ m.user }}</span>
          <p>{{ m.text }}</p>
          <span class="time">{{ m.time }}</span>
        </div>
      </div>

      <div class="chat-input">
        <input
          v-model="newMessage"
          placeholder="Escribe un mensaje..."
          @keyup.enter="sendMessage"
        />
        <button @click="sendMessage">Enviar</button>
      </div>
    </div>
  </SidebarLayout>
</template>

<style scoped>
.chat-container {
  display: flex;
  flex-direction: column;
  height: 600px;
  padding: 20px;
}

.chat-window {
  flex-grow: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 15px;
  padding: 10px;
}

.bubble {
  max-width: 70%;
  padding: 12px;
  border-radius: 15px;
  background: #f0f0f0;
  align-self: flex-start;
}

.bubble.mine {
  background: var(--color-AzulTres);
  color: white;
  align-self: flex-end;
}

.user {
  font-weight: bold;
  font-size: 0.7rem;
  display: block;
  margin-bottom: 4px;
}
.time {
  font-size: 0.6rem;
  opacity: 0.7;
  float: right;
  margin-top: 5px;
}

.chat-input {
  display: flex;
  gap: 10px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.chat-input input {
  flex-grow: 1;
  padding: 12px;
  border-radius: 10px;
  border: 1px solid #ddd;
}

.chat-input button {
  background: var(--color-Azul);
  color: white;
  border: none;
  padding: 0 20px;
  border-radius: 10px;
  cursor: pointer;
}

@media (max-width: 768px) {
  .chat-container {
    height: 500px;
    padding: 15px;
  }
  .bubble {
    max-width: 85%;
  }
}
</style>

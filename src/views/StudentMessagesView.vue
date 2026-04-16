<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import SidebarLayout from '@/components/StudentSideBar.vue'
import { useapi } from '@/assets/composables/useApi'
import { useAuthStore } from '@/stores/authStore'
import type { Chat, ChatMessage } from '@/types/types'

type ChatCandidateUser = {
  id: number
  name: string
  lastname: string
  email: string
  role_id: number
}

const ua = useAuthStore()

const selectedChatId = ref<number | null>(null)
const selectedChat = ref<Chat | null>(null)
const selectedChatLoading = ref(false)

const messageText = ref('')
const sending = ref(false)
const localError = ref('')
const messagesContainer = ref<HTMLElement | null>(null)

const showCreateModal = ref(false)
const creatingChat = ref(false)
const createChatError = ref('')
const createChatForm = ref({
  name: '',
  user_ids: [] as number[],
})

const {
  data: chatsData,
  error: chatsError,
  isFetching: chatsLoading,
  execute: reloadChats,
} = useapi('/chats', {
  method: 'GET',
}).json()

const chats = computed<Chat[]>(() => chatsData.value?.data ?? [])

const candidateUsers = ref<ChatCandidateUser[]>([])
const candidatesLoading = ref(false)
const candidatesError = ref('')
const roleFilter = ref<0 | 2 | 3 | 4>(0)

const filteredCandidateUsers = computed(() => {
  if (roleFilter.value === 0) return candidateUsers.value
  return candidateUsers.value.filter((u) => u.role_id === roleFilter.value)
})

const currentUserId = computed<number | null>(() => ua.credentials?.user?.id ?? null)
const currentUserName = computed<string>(() => ua.credentials?.user?.name ?? '')
const currentUserLastname = computed<string>(() => ua.credentials?.user?.lastname ?? '')

const currentUserInitials = computed<string>(() => {
  const first = currentUserName.value.charAt(0) || ''
  const last = currentUserLastname.value.charAt(0) || ''
  return `${first}${last}`.toUpperCase() || '??'
})

const messages = computed<ChatMessage[]>(() => selectedChat.value?.messages ?? [])

const selectedChatName = computed<string>(() => {
  if (!selectedChat.value) return 'Selecciona una conversación'

  if (selectedChat.value.name) return selectedChat.value.name

  const others = (selectedChat.value.users ?? []).filter(
    (user) => user.id !== currentUserId.value
  )

  if (!others.length) return 'Chat privado'

  return others.map((user) => `${user.name} ${user.lastname}`).join(', ')
})

function formatDate(date: string) {
  return new Date(date.replace(' ', 'T')).toLocaleString('es-MX', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function chatInitials(chat: Chat): string {
  if (chat.name) return chat.name.substring(0, 2).toUpperCase()

  const otherUser = (chat.users ?? []).find(
    (user) => user.id !== currentUserId.value
  )

  if (!otherUser) return 'CH'

  return `${otherUser.name.charAt(0)}${otherUser.lastname.charAt(0)}`.toUpperCase()
}

function chatDisplayName(chat: Chat): string {
  if (chat.name) return chat.name

  const others = (chat.users ?? []).filter(
    (user) => user.id !== currentUserId.value
  )

  if (!others.length) return 'Chat privado'

  return others.map((user) => `${user.name} ${user.lastname}`).join(', ')
}

function isOwnMessage(message: ChatMessage): boolean {
  return message.user?.id === currentUserId.value
}

async function scrollToBottom() {
  await nextTick()

  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

function leaveCurrentChannel() {
  if (selectedChatId.value && window.Echo) {
    window.Echo.leave(`chat.${selectedChatId.value}`)
  }
}

async function loadCandidateUsers() {
  candidatesLoading.value = true
  candidatesError.value = ''

  try {
    const response = await fetch('https://api.sutando-user.me/api/chat-users', {
      headers: {
        Authorization: `Bearer ${ua.credentials?.token ?? ''}`,
        Accept: 'application/json',
      },
    })

    const json = await response.json()

    if (!response.ok) {
      candidatesError.value = json?.message ?? 'Error al cargar usuarios'
      return
    }

    // MAPEO CORRECTO: Accedemos a u.role.id para que el filtro funcione
    candidateUsers.value = (json?.data ?? []).map((u: any) => ({
      id: u.id,
      name: u.name,
      lastname: u.lastname,
      email: u.email,
      role_id: u.role?.id ?? 0, // Aquí tomamos el ID del objeto role
    }))
  } catch (error) {
    console.error(error)
    candidatesError.value = 'Error de conexión al cargar usuarios'
  } finally {
    candidatesLoading.value = false
  }
} // <--- Asegúrate de que solo haya UNA llave aquí.

async function loadChat(chatId: number) {
  // Dentro de loadChat, busca la parte de Echo:
  if (window.Echo) {
    window.Echo.private(`chat.${chatId}`)
      .listen('.message.sent', async (event: ChatMessage) => {
        // ... resto del código igual
      })
  }
  selectedChatLoading.value = true
  localError.value = ''
  leaveCurrentChannel()

  try {
    const response = await fetch(`https://api.sutando-user.me/api/chats/${chatId}`, {
      headers: {
        Authorization: `Bearer ${ua.credentials?.token ?? ''}`,
        Accept: 'application/json',
      },
    })

    const json = await response.json()

    if (!response.ok) {
      localError.value = json?.message ?? 'No se pudo cargar el chat'
      return
    }

    selectedChat.value = json?.data ?? null
    selectedChatId.value = chatId

    window.Echo.private(`chat.${chatId}`)
      .listen('.message.sent', async (event: ChatMessage) => {
        if (!selectedChat.value) return

        const currentMessages = selectedChat.value.messages ?? []
        const exists = currentMessages.some((message) => message.id === event.id)

        if (!exists) {
          selectedChat.value = {
            ...selectedChat.value,
            messages: [...currentMessages, event],
          }
          await scrollToBottom()
        }
      })

    await scrollToBottom()
  } catch (error) {
    console.error(error)
    localError.value = 'Error al cargar la conversación'
  } finally {
    selectedChatLoading.value = false
  }
}

async function sendMessage() {
  const content = messageText.value.trim()

  if (!content || !selectedChatId.value || sending.value) return

  sending.value = true
  localError.value = ''

  try {
    const response = await fetch('https://api.sutando-user.me/api/messages', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${ua.credentials?.token ?? ''}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: selectedChatId.value,
        content,
      }),
    })

    const json = await response.json()

    if (!response.ok) {
      localError.value = json?.message ?? 'No se pudo enviar el mensaje'
      return
    }

    const newMessage = json?.data as ChatMessage

    if (selectedChat.value) {
      const exists = (selectedChat.value.messages ?? []).some(
        (message) => message.id === newMessage.id
      )

      if (!exists) {
        selectedChat.value = {
          ...selectedChat.value,
          messages: [...(selectedChat.value.messages ?? []), newMessage],
        }
      }
    }

    messageText.value = ''
    await scrollToBottom()
    await reloadChats()
  } catch (error) {
    console.error(error)
    localError.value = 'Error de conexión al enviar el mensaje'
  } finally {
    sending.value = false
  }
}

async function openCreateModal() {
  showCreateModal.value = true
  createChatError.value = ''
  roleFilter.value = 0
  await loadCandidateUsers()
}

function closeCreateModal() {
  showCreateModal.value = false
  createChatError.value = ''
  roleFilter.value = 0
  createChatForm.value = {
    name: '',
    user_ids: [],
  }
}

async function createChat() {
  createChatError.value = ''

  if (!createChatForm.value.user_ids.length) {
    createChatError.value = 'Debes seleccionar al menos un usuario.'
    return
  }

  creatingChat.value = true

  try {
    const response = await fetch('https://api.sutando-user.me/api/chats', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${ua.credentials?.token ?? ''}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: createChatForm.value.name.trim() || null,
        user_ids: createChatForm.value.user_ids,
      }),
    })

    const json = await response.json()

    if (!response.ok) {
      createChatError.value = json?.message ?? 'No se pudo crear el chat'
      return
    }

    await reloadChats()

    const createdChatId = json?.data?.id
    closeCreateModal()

    if (createdChatId) {
      await loadChat(createdChatId)
    }
  } catch (error) {
    console.error(error)
    createChatError.value = 'Error de conexión al crear el chat'
  } finally {
    creatingChat.value = false
  }
}

watch(
  chats,
  async (newChats) => {
    const firstChat = newChats[0]
    if (!selectedChatId.value && firstChat) {
      await loadChat(firstChat.id)
    }
  },
  { immediate: true }
)

watch(
  messages,
  async () => {
    await scrollToBottom()
  },
  { deep: true }
)

onMounted(async () => {
  const firstChat = chats.value[0]
  if (firstChat && !selectedChatId.value) {
    await loadChat(firstChat.id)
  }
})

onBeforeUnmount(() => {
  leaveCurrentChannel()
})
</script>

<template>
  <div class="messages-page">
    <SidebarLayout>
      <div class="messages-view">
        <div class="ContSmall">
          <div class="left">
            <div class="avatar">
              {{ currentUserInitials }}
            </div>

            <div>
              <h1>Mensajes</h1>
              <p v-if="chats.length">{{ chats.length }} conversaciones disponibles</p>
              <p v-else>No tienes conversaciones todavía</p>
            </div>
          </div>

          <div class="right">
            <button class="btn-create-chat" @click="openCreateModal">
              <span>＋</span> Nuevo chat
            </button>
          </div>
        </div>

        <div class="messages-layout">
          <div class="chat-list-box">
            <div class="panel-header">
              <h2>Conversaciones</h2>
              <span class="badge">{{ chats.length }}</span>
            </div>

            <div v-if="chatsLoading" class="loading-state">
              <div class="spinner"></div>
              <p>Cargando conversaciones...</p>
            </div>

            <div v-else-if="chatsError" class="error-banner">
              <p>No se pudieron cargar los chats.</p>
            </div>

            <div v-else-if="!chats.length" class="empty-state">
              <p>No tienes chats disponibles.</p>
              <button class="btn-empty-action" @click="openCreateModal">
                Crear primer chat
              </button>
            </div>

            <div v-else class="chat-list-scroll">
              <div class="chat-list">
                <button
                  v-for="chat in chats"
                  :key="chat.id"
                  class="chat-item"
                  :class="{ active: selectedChatId === chat.id }"
                  @click="loadChat(chat.id)"
                >
                  <div class="chat-avatar">
                    {{ chatInitials(chat) }}
                  </div>

                  <div class="chat-meta">
                    <div class="chat-title">
                      {{ chatDisplayName(chat) }}
                    </div>
                    <div class="chat-subtitle">
                      {{ chat.messages_count ?? 0 }} mensajes
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>

          <div class="chat-box">
            <div class="chat-box-header">
              <div>
                <h2>{{ selectedChatName }}</h2>
                <p v-if="selectedChat">
                  {{ selectedChat.users_count ?? selectedChat.users?.length ?? 0 }} participantes
                </p>
              </div>
            </div>

            <div v-if="selectedChatLoading" class="loading-state">
              <div class="spinner"></div>
              <p>Cargando conversación...</p>
            </div>

            <div v-else-if="localError" class="error-banner">
              <p>{{ localError }}</p>
            </div>

            <template v-else-if="selectedChat">
              <div ref="messagesContainer" class="messages-container">
                <div v-if="!messages.length" class="empty-state inner">
                  <p>Este chat todavía no tiene mensajes.</p>
                </div>

                <div
                  v-for="message in messages"
                  :key="message.id"
                  class="message-row"
                  :class="{ own: isOwnMessage(message) }"
                >
                  <div class="message-bubble">
                    <div v-if="!isOwnMessage(message)" class="message-author">
                      {{ message.user?.name }} {{ message.user?.lastname }}
                    </div>

                    <div class="message-content">
                      {{ message.content }}
                    </div>

                    <div class="message-date">
                      {{ formatDate(message.created_at) }}
                    </div>
                  </div>
                </div>
              </div>

              <form class="chat-form" @submit.prevent="sendMessage">
                <input
                  v-model="messageText"
                  type="text"
                  class="chat-input"
                  placeholder="Escribe un mensaje..."
                  :disabled="sending"
                />

                <button
                  type="submit"
                  class="btn-send"
                  :disabled="sending || !messageText.trim()"
                >
                  {{ sending ? 'Enviando...' : 'Enviar' }}
                </button>
              </form>
            </template>

            <div v-else class="empty-state chat-empty">
              <div class="chat-empty-content">
                <h3>Selecciona una conversación</h3>
                <p>Elige un chat del panel izquierdo o crea uno nuevo.</p>
                <button class="btn-empty-action" @click="openCreateModal">
                  Nuevo chat
                </button>
              </div>
            </div>
          </div>
        </div>

        <div v-if="showCreateModal" class="modal-overlay" @click.self="closeCreateModal">
          <div class="modal-card">
            <div class="modal-header">
              <h2>Crear chat</h2>
              <button class="close-btn" type="button" @click="closeCreateModal">
                Cerrar
              </button>
            </div>

            <form class="create-chat-form" @submit.prevent="createChat">
              <div v-if="createChatError" class="error-banner form-error">
                <p>{{ createChatError }}</p>
              </div>

              <div v-if="candidatesLoading" class="loading-state modal-loading">
                <div class="spinner"></div>
                <p>Cargando usuarios disponibles...</p>
              </div>

              <div v-else-if="candidatesError" class="error-banner form-error">
                <p>{{ candidatesError }}</p>
              </div>

              <template v-else>
                <div class="field">
                  <label>Nombre del chat (opcional)</label>
                  <input
                    v-model="createChatForm.name"
                    type="text"
                    class="input"
                    placeholder="Si lo dejas vacío y eliges un solo usuario, será privado"
                  />
                </div>

                <div class="field">
                  <label>Selecciona usuarios</label>

                  <div class="role-filter">
                    <button
                      type="button"
                      class="role-btn"
                      :class="{ active: roleFilter === 0 }"
                      @click="roleFilter = 0"
                    >
                      Todos
                    </button>
                    <button
                      type="button"
                      class="role-btn"
                      :class="{ active: roleFilter === 2 }"
                      @click="roleFilter = 2"
                    >
                      Profesores
                    </button>
                    <button
                      type="button"
                      class="role-btn"
                      :class="{ active: roleFilter === 3 }"
                      @click="roleFilter = 3"
                    >
                      Alumnos
                    </button>

                  </div>

                  <div v-if="filteredCandidateUsers.length" class="users-selector">
                    <label
                      v-for="user in filteredCandidateUsers"
                      :key="user.id"
                      class="user-option"
                    >
                      <input
                        v-model="createChatForm.user_ids"
                        type="checkbox"
                        :value="user.id"
                      />
                      <span>{{ user.name }} {{ user.lastname }}</span>
                    </label>
                  </div>

                  <div v-else class="empty-state modal-empty">
                    <p>No hay usuarios disponibles para este filtro.</p>
                  </div>
                </div>

                <div class="form-actions">
                  <button type="button" class="btn-secondary" @click="closeCreateModal">
                    Cancelar
                  </button>
                  <button type="submit" class="btn-primary" :disabled="creatingChat">
                    {{ creatingChat ? 'Creando...' : 'Crear chat' }}
                  </button>
                </div>
              </template>
            </form>
          </div>
        </div>
      </div>
    </SidebarLayout>
  </div>
</template>

<style scoped>
.messages-page {
  height: 100%;
  min-height: 100%;
  overflow: hidden;
  background: linear-gradient(180deg, var(--color-AzulDos), var(--color-ComplementoDos));
}

.messages-view {
  height: calc(100vh - 48px);
  max-height: calc(100vh - 48px);
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-width: 0;
  overflow: hidden;
}

.ContSmall {
  background: var(--color-Azul);
  width: 100%;
  border-radius: 20px;
  padding: 20px 25px;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-sizing: border-box;
  flex-shrink: 0;
}

.ContSmall h1 {
  margin: 0;
  font-size: 1.7rem;
  letter-spacing: -0.5px;
}

.ContSmall p {
  margin: 4px 0 0;
  font-size: 0.95rem;
  opacity: 0.88;
}

.left {
  display: flex;
  align-items: center;
  gap: 15px;
  min-width: 0;
}

.right {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.messages-layout {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: 320px minmax(0, 1fr);
  gap: 20px;
  align-items: stretch;
  min-width: 0;
  overflow: hidden;
}

.chat-list-box,
.chat-box {
  background: var(--color-Blanco);
  border-radius: 22px;
  padding: 24px;
  box-shadow: 0 10px 30px #00000020;
  box-sizing: border-box;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
}

.chat-list-box {
  display: flex;
  flex-direction: column;
}

.chat-box {
  display: flex;
  flex-direction: column;
}

.panel-header,
.chat-box-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 20px;
  flex-shrink: 0;
}

.panel-header h2,
.chat-box-header h2 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 800;
  color: var(--color-OscuroAzulado);
  word-break: break-word;
}

.chat-box-header p {
  margin: 6px 0 0;
  font-size: 0.82rem;
  color: #64748b;
}

.badge {
  background: var(--color-Azul);
  color: white;
  border-radius: 10px;
  padding: 4px 12px;
  font-size: 0.75rem;
  font-weight: 800;
  flex-shrink: 0;
}

.chat-list-scroll {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.chat-list {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow-y: auto;
  padding-right: 6px;
  min-height: 0;
}

.chat-item {
  width: 100%;
  border: 1px solid #bfdbfe;
  background: #dbeafe;
  border-radius: 18px;
  padding: 14px;
  display: flex;
  align-items: center;
  gap: 12px;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s ease;
  box-sizing: border-box;
}

.chat-item:hover {
  background: #eff6ff;
  border-color: #93c5fd;
  transform: translateY(-1px);
}

.chat-item.active {
  background: #dbeafe;
  border-color: var(--color-Azul);
  box-shadow: 0 0 0 2px rgba(75, 164, 223, 0.12);
}

.chat-avatar {
  width: 48px;
  height: 48px;
  border-radius: 16px;
  background: linear-gradient(135deg, var(--color-AzulDos), var(--color-AzulTres));
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  flex-shrink: 0;
}

.chat-meta {
  min-width: 0;
  flex: 1;
}

.chat-title {
  font-size: 0.98rem;
  font-weight: 800;
  color: #1e293b;
  line-height: 1.25;
  word-break: break-word;
}

.chat-subtitle {
  font-size: 0.82rem;
  color: #64748b;
  margin-top: 4px;
}

.messages-container {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  border: 1px solid #d9e4ee;
  border-radius: 22px;
  background: #f8fafc;
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  scroll-behavior: smooth;
}

.message-row {
  display: flex;
  justify-content: flex-start;
}

.message-row.own {
  justify-content: flex-end;
}

.message-bubble {
  max-width: min(70%, 520px);
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 18px;
  padding: 12px 14px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
  box-sizing: border-box;
}

.message-row.own .message-bubble {
  background: #dbeafe;
  border-color: #bfdbfe;
}

.message-author {
  font-size: 0.72rem;
  font-weight: 800;
  color: var(--color-AzulTres);
  margin-bottom: 6px;
  text-transform: uppercase;
  word-break: break-word;
}

.message-content {
  font-size: 0.96rem;
  color: #1f2937;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
}

.message-date {
  margin-top: 8px;
  font-size: 0.72rem;
  color: #6b7280;
  text-align: right;
}

.chat-form {
  display: flex;
  gap: 10px;
  margin-top: 16px;
  flex-shrink: 0;
}

.chat-input,
.input {
  flex: 1;
  border: 1px solid #cfd8e3;
  border-radius: 14px;
  padding: 12px 14px;
  font-size: 0.95rem;
  background: white;
  width: 100%;
  box-sizing: border-box;
}

.chat-input:focus,
.input:focus {
  outline: none;
  border-color: var(--color-AzulDos);
  box-shadow: 0 0 0 3px rgba(75, 164, 223, 0.15);
}

.btn-send,
.btn-primary {
  border: none;
  border-radius: 14px;
  background: var(--color-AzulTres);
  color: white;
  padding: 12px 18px;
  font-weight: 700;
  cursor: pointer;
  transition: 0.2s ease;
  flex-shrink: 0;
}

.btn-send:hover:not(:disabled),
.btn-primary:hover:not(:disabled) {
  background: var(--color-AzulCuatro);
}

.btn-send:disabled,
.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary,
.btn-empty-action {
  border: none;
  border-radius: 14px;
  background: #e5e7eb;
  color: #1f2937;
  padding: 12px 18px;
  font-weight: 700;
  cursor: pointer;
}

.btn-empty-action {
  background: var(--color-AzulTres);
  color: white;
  margin-top: 16px;
}

.loading-state,
.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #94a3b8;
}

.empty-state.inner {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.chat-empty {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.chat-empty-content h3 {
  margin: 0 0 10px;
  color: var(--color-OscuroAzulado);
  font-size: 1.4rem;
}

.chat-empty-content p {
  margin: 0;
  color: #64748b;
}

.error-banner {
  background: #fee2e2;
  color: #dc2626;
  padding: 18px;
  border-radius: 15px;
  font-weight: 700;
}

.form-error {
  margin-bottom: 16px;
}

.spinner {
  width: 45px;
  height: 45px;
  border: 4px solid #f1f5f9;
  border-top: 4px solid var(--color-Azul);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(17, 19, 27, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  z-index: 999;
}

.modal-card {
  width: 100%;
  max-width: 620px;
  background: white;
  border-radius: 18px;
  box-shadow: 0 20px 45px rgba(0, 0, 0, 0.22);
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 20px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h2 {
  margin: 0;
  color: var(--color-AzulCuatro);
}

.close-btn {
  background: transparent;
  border: none;
  font-size: 1rem;
  cursor: pointer;
  color: #64748b;
}

.create-chat-form {
  padding: 20px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.field label {
  font-weight: 700;
  color: #111827;
}

.role-filter {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.role-btn {
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  background: #f1f5f9;
  color: #475569;
  padding: 6px 14px;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;
}

.role-btn:hover {
  background: #dbeafe;
  border-color: #93c5fd;
}

.role-btn.active {
  background: var(--color-AzulTres);
  border-color: var(--color-AzulTres);
  color: white;
}

.users-selector {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 260px;
  overflow-y: auto;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 12px;
}

.user-option {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #1f2937;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 18px;
}

.modal-loading {
  padding: 30px 10px;
}

.chat-list::-webkit-scrollbar,
.messages-container::-webkit-scrollbar,
.users-selector::-webkit-scrollbar {
  width: 8px;
}

.chat-list::-webkit-scrollbar-track,
.messages-container::-webkit-scrollbar-track,
.users-selector::-webkit-scrollbar-track {
  background: transparent;
}

.chat-list::-webkit-scrollbar-thumb,
.messages-container::-webkit-scrollbar-thumb,
.users-selector::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 999px;
}

.chat-list::-webkit-scrollbar-thumb:hover,
.messages-container::-webkit-scrollbar-thumb:hover,
.users-selector::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.btn-create-chat {
  border: none;
  border-radius: 14px;
  background: white;
  color: var(--color-AzulCuatro);
  padding: 10px 18px;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.12);
}

.btn-create-chat:hover {
  background: #eff6ff;
  transform: translateY(-2px);
  box-shadow: 0 10px 22px rgba(0, 0, 0, 0.18);
}

.btn-create-chat:active {
  transform: scale(0.97);
}

@media (max-width: 980px) {
  .messages-view {
    height: auto;
    max-height: none;
    overflow: visible;
  }

  .messages-layout {
    grid-template-columns: 1fr;
    overflow: visible;
  }

  .chat-list-box {
    height: 320px;
  }

  .chat-box {
    height: 65vh;
  }
}

@media (max-width: 768px) {
  .messages-page {
    overflow-y: auto;
  }

  .messages-view {
    height: auto;
    max-height: none;
    overflow: visible;
    gap: 18px;
  }

  .ContSmall {
    padding: 18px 20px;
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .left,
  .right {
    width: 100%;
  }

  .message-bubble {
    max-width: 88%;
  }

  .chat-form,
  .form-actions {
    flex-direction: column;
  }

  .btn-send,
  .btn-primary,
  .btn-secondary,
  .btn-empty-action,
  .btn-create-chat {
    width: 100%;
  }

  .chat-list-box,
  .chat-box {
    height: auto;
    min-height: 420px;
  }

  .messages-container {
    min-height: 320px;
    max-height: 55vh;
  }
}
</style>

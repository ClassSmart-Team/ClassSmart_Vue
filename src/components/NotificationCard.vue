<script setup lang="ts">
import { computed } from 'vue'

// Definimos la interfaz aquí o la importamos de tu archivo de tipos
interface Notification {
  id: number
  title: string
  message?: string
  read_at: string | null
  created_at: string
  // ... otros campos
}

const props = defineProps<{
  notification: Notification
}>()

const emit = defineEmits(['navigate'])

// Lógica de formateo de fecha (movida al componente para que sea autónomo)
const formattedDate = computed(() => {
  if (!props.notification.created_at) return ''
  const date = new Date(props.notification.created_at)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  const diffHrs = Math.floor(diffMin / 60)
  const diffDays = Math.floor(diffHrs / 24)

  if (diffMin < 1) return 'Ahora mismo'
  if (diffMin < 60) return `Hace ${diffMin} min`
  if (diffHrs < 24) return `Hace ${diffHrs} h`
  if (diffDays === 1) return 'Ayer'
  return date.toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })
})
</script>

<template>
  <div
    class="notif-card"
    :class="{ unread: !notification.read_at }"
    @click="$emit('navigate', notification)"
  >
    <span v-if="!notification.read_at" class="unread-dot" />

    <div class="notif-icon">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
    </div>

    <div class="notif-body">
      <div class="notif-top">
        <span class="notif-title">{{ notification.title || 'Nueva Notificación' }}</span>
        <span class="notif-time">{{ formattedDate }}</span>
      </div>
      <p class="notif-text">
        {{ notification.message || 'Toca para ver el detalle de esta notificación.' }}
      </p>
    </div>
  </div>
</template>

<style scoped>
.notif-card {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 16px;
  border-radius: 15px;
  border: 1px solid #f1f5f9;
  background: #f8fafc;
  cursor: pointer;
  transition: all 0.15s;
  position: relative;
}
.notif-card:hover {
  background: #f1f5f9;
  border-color: #e2e8f0;
}
.notif-card.unread {
  background: #eff6ff;
  border-color: #bfdbfe;
  border-left: 3px solid #2563eb;
}

.unread-dot {
  position: absolute;
  top: 14px;
  right: 14px;
  width: 8px;
  height: 8px;
  background: #2563eb;
  border-radius: 50%;
}

.notif-icon {
  width: 38px;
  height: 38px;
  flex-shrink: 0;
  background: white;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #2563eb;
}
.notif-icon svg {
  width: 18px;
  height: 18px;
}

.notif-body {
  flex: 1;
  min-width: 0;
}
.notif-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 4px;
}
.notif-title {
  font-size: 0.88rem;
  font-weight: 700;
  color: #334155;
}
.notif-time {
  font-size: 0.72rem;
  color: #94a3b8;
  white-space: nowrap;
  flex-shrink: 0;
}
.notif-text {
  font-size: 0.8rem;
  color: #64748b;
  margin: 0;
  line-height: 1.5;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>

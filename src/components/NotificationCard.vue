<script setup lang="ts">
interface Notification {
  id: number
  type: 'task' | 'forum' | 'grade' | 'system'
  title: string
  message: string
  date: string
  isRead: boolean
  routeName: string // Nombre de la ruta a la que redirige
  params?: object // Parámetros para la ruta (ej: { id: 5 })
}

defineProps<{ notification: Notification }>()
const emit = defineEmits(['navigate'])

const getIcon = (type: string) => {
  const icons = {
    task: '📝',
    forum: '💬',
    grade: '🎓',
    system: '🔔',
  }
  return icons[type] || '🔔'
}
</script>

<template>
  <div
    @click="emit('navigate', notification)"
    :class="['notification-item', { unread: !notification.isRead }]"
  >
    <div class="icon-wrapper">
      {{ getIcon(notification.type) }}
    </div>

    <div class="content">
      <div class="header">
        <h4>{{ notification.title }}</h4>
        <span class="time">{{ notification.date }}</span>
      </div>
      <p>{{ notification.message }}</p>
    </div>

    <div v-if="!notification.isRead" class="unread-dot"></div>
  </div>
</template>

<style scoped>
.notification-item {
  display: flex;
  gap: 15px;
  padding: 15px;
  background: white;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  transition: background 0.2s;
  position: relative;
  align-items: center;
}

.notification-item:hover {
  background: #f8faff;
}

.notification-item.unread {
  background: #f0f4ff;
}

.icon-wrapper {
  font-size: 1.5rem;
  min-width: 45px;
  height: 45px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border-radius: 50%;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
}

.content {
  flex-grow: 1;
}

.header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
}

.header h4 {
  margin: 0;
  font-size: 0.95rem;
  color: var(--color-Azul);
}

.time {
  font-size: 0.75rem;
  color: #999;
}

.content p {
  margin: 0;
  font-size: 0.85rem;
  color: #666;
  line-height: 1.4;
}

.unread-dot {
  width: 10px;
  height: 10px;
  background: var(--color-AzulTres);
  border-radius: 50%;
  margin-left: 10px;
}

@media (max-width: 600px) {
  .notification-item {
    padding: 12px;
  }
  .time {
    font-size: 0.7rem;
  }
}
</style>

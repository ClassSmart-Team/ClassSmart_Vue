<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import SidebarLayout from '@/components/ParentSidebar.vue'
import NotificationItem from '@/components/NotificationCard.vue'

const router = useRouter()

const notifications = ref([
  {
    id: 1,
    type: 'task',
    title: 'Nueva Tarea: Mateo',
    message: 'Se ha publicado "Ensayo sobre la paz" en Historia.',
    date: 'Hace 5 min',
    isRead: false,
    routeName: 'activities',
  },
  {
    id: 2,
    type: 'forum',
    title: 'Nuevo mensaje en Foro',
    message: 'El Prof. Mario respondió en Matemáticas IV.',
    date: 'Hace 1 hora',
    isRead: false,
    routeName: 'forum-detail',
    params: { id: 1 },
  },
  {
    id: 3,
    type: 'grade',
    title: 'Calificación disponible',
    message: 'Sofía ha recibido una nota en Geografía.',
    date: 'Ayer',
    isRead: true,
    routeName: 'academic-history',
  },
])

const handleNavigation = (notif: any) => {
  notif.isRead = true

  if (notif.params) {
    router.push({ name: notif.routeName, params: notif.params })
  } else {
    router.push({ name: notif.routeName })
  }
}

const markAllRead = () => {
  notifications.value.forEach((n) => (n.isRead = true))
}
</script>

<template>
  <SidebarLayout>
    <div class="ContSmall center">
      <h1>Notificaciones</h1>
    </div>

    <div class="ContBig" style="margin-top: 40px">
      <div class="notif-header">
        <h3>Recientes</h3>
        <button @click="markAllRead" class="btn-link">Marcar todas como leídas</button>
      </div>

      <div class="notifications-container">
        <NotificationItem
          v-for="n in notifications"
          :key="n.id"
          :notification="n"
          @navigate="handleNavigation"
        />

        <div v-if="notifications.length === 0" class="empty-state">
          <p>No tienes notificaciones pendientes.</p>
        </div>
      </div>
    </div>
  </SidebarLayout>
</template>

<style scoped>
.ContSmall {
  background: var(--color-Azul);
  width: 95%;
  max-width: 800px;
  height: 60px;
  border-radius: 20px;
  margin: 0 auto;
  color: white;
}
.ContBig {
  background: var(--color-Blanco);
  width: 95%;
  max-width: 800px;
  border-radius: 20px;
  margin: 40px auto;
  padding: 0;
  overflow: hidden;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  max-height: 60vh;
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.ContBig::-webkit-scrollbar {
  width: 8px;
  display: none;
}
.ContBig::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 10px;
}

.notif-header {
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 2px solid #f5f5f5;
  background: #fafafa;
}

.notif-header h3 {
  margin: 0;
  color: var(--color-Azul);
  font-size: 1.1rem;
}

.btn-link {
  background: none;
  border: none;
  color: var(--color-AzulTres);
  font-size: 0.85rem;
  font-weight: bold;
  cursor: pointer;
}

.notifications-container {
  display: flex;
  flex-direction: column;
}

.empty-state {
  padding: 40px;
  text-align: center;
  color: #aaa;
}

@media (max-width: 768px) {
  .notif-header {
    padding: 15px;
  }
  .btn-link {
    font-size: 0.75rem;
  }
}
</style>

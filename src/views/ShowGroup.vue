<script setup lang="ts">
import SidebarLayout from '@/components/ParentSidebar.vue'
import ActivityCard from '@/components/TaskCard.vue'
import { ref } from 'vue'

const currentTab = ref('actividades') // 'actividades' | 'foro'

const groupInfo = ref({
  name: '6º Semestre - Grupo B',
  teacher: 'Ing. Isaac Newton',
  room: 'Laboratorio de Física',
})

const activities = ref([
  {
    id: 1,
    title: 'Proyecto Final: Termodinámica',
    subject: 'Física II',
    dueDate: '30 Mar',
    status: 'pendiente',
  },
  {
    id: 2,
    title: 'Práctica 4: Presión',
    subject: 'Física II',
    dueDate: '22 Mar',
    status: 'entregada',
  },
])

const forumPosts = ref([
  {
    id: 1,
    user: 'Profe Isaac',
    message: 'Recuerden traer su bata para la práctica de mañana.',
    time: 'Hace 2h',
  },
  { id: 2, user: 'Tú', message: '¿El reporte es a computadora o mano?', time: 'Hace 1h' },
])
</script>

<template>
  <SidebarLayout>
    <div class="ContSmall center">
      <h1>{{ groupInfo.name }}</h1>
    </div>

    <div class="ContBig" style="margin-top: 40px">
      <div class="tabs-container">
        <button
          @click="currentTab = 'actividades'"
          :class="{ active: currentTab === 'actividades' }"
        >
          Actividades
        </button>
        <button @click="currentTab = 'foro'" :class="{ active: currentTab === 'foro' }">
          Foro / Avisos
        </button>
      </div>

      <div class="content-wrapper">
        <section v-if="currentTab === 'actividades'" class="animate-fade">
          <div class="section-info">
            <p>Tareas y proyectos asignados a este grupo.</p>
            <span class="badge">{{ activities.length }} tareas</span>
          </div>
          <div class="activities-grid">
            <ActivityCard v-for="act in activities" :key="act.id" :activity="act" />
          </div>
        </section>

        <section v-if="currentTab === 'foro'" class="animate-fade">
          <div class="forum-container">
            <div class="forum-messages">
              <div
                v-for="post in forumPosts"
                :key="post.id"
                class="post-bubble"
                :class="{ 'is-me': post.user === 'Tú' }"
              >
                <span class="post-user">{{ post.user }}</span>
                <p>{{ post.message }}</p>
                <span class="post-time">{{ post.time }}</span>
              </div>
            </div>

            <div class="forum-input">
              <input type="text" placeholder="Escribe un mensaje al grupo..." />
              <button>Enviar</button>
            </div>
          </div>
        </section>
      </div>
    </div>
  </SidebarLayout>
</template>

<style scoped>
.ContSmall {
  background: var(--color-Azul);
  width: 95%;
  max-width: 1000px;
  height: 60px;
  border-radius: 20px;
  margin: 0 auto;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
}
.ContBig {
  background: var(--color-Blanco);
  width: 95%;
  max-width: 1000px;
  border-radius: 20px;
  margin: 40px auto;
  padding: 25px;
  box-sizing: border-box;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  max-height: 70vh;
  overflow-y: auto;
  overflow-x: hidden;
}

.ContBig::-webkit-scrollbar {
  width: 8px;
}
.ContBig::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 10px;
}

/* TABS ACTUALIZADAS */
.tabs-container {
  display: flex;
  gap: 5px;
  margin-bottom: 25px;
  background: #f1f5f9;
  padding: 5px;
  border-radius: 15px;
}

.tabs-container button {
  flex: 1;
  background: none;
  border: none;
  padding: 12px;
  cursor: pointer;
  font-weight: bold;
  color: #64748b;
  border-radius: 12px;
  transition: 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.tabs-container button.active {
  background: white;
  color: var(--color-Azul);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
}

/* CONTENIDO ACTIVIDADES */
.section-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  color: #666;
  font-size: 0.9rem;
}
.badge {
  background: #e0f2fe;
  color: #0369a1;
  padding: 4px 12px;
  border-radius: 20px;
  font-weight: bold;
  font-size: 0.8rem;
}
.activities-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 15px;
}

/* CONTENIDO FORO */
.forum-container {
  background: #f8fafc;
  border-radius: 20px;
  padding: 20px;
  height: 500px;
  display: flex;
  flex-direction: column;
}

.forum-messages {
  flex-grow: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-right: 10px;
}
.post-bubble {
  background: white;
  padding: 12px 16px;
  border-radius: 18px;
  border-bottom-left-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.03);
  max-width: 80%;
}
.post-bubble.is-me {
  align-self: flex-end;
  background: var(--color-AzulTres);
  color: white;
  border-bottom-left-radius: 18px;
  border-bottom-right-radius: 4px;
}
.post-user {
  font-weight: 800;
  font-size: 0.7rem;
  text-transform: uppercase;
  margin-bottom: 4px;
  opacity: 0.8;
}
.post-time {
  font-size: 0.6rem;
  margin-top: 5px;
  display: block;
  opacity: 0.6;
}

.forum-input {
  display: flex;
  gap: 10px;
  margin-top: 15px;
  background: white;
  padding: 8px;
  border-radius: 15px;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.02);
}
.forum-input input {
  flex: 1;
  border: none;
  padding: 10px;
  outline: none;
}
.forum-input button {
  background: var(--color-Azul);
  color: white;
  border: none;
  padding: 0 20px;
  border-radius: 10px;
  font-weight: bold;
  cursor: pointer;
}

/* ANIMACIÓN SIMPLE */
.animate-fade {
  animation: fadeIn 0.3s ease;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .tabs-container button {
    font-size: 0.85rem;
    padding: 10px;
  }
  .activities-grid {
    grid-template-columns: 1fr;
  }
}
</style>

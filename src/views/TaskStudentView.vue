<script setup lang="ts">
import SidebarLayout from '@/components/StudentSideBar.vue' 
import { useapi } from '@/assets/composables/useApi'
import { useAuthStore } from '@/stores/authStore.ts'
import { ref, computed, watch } from 'vue'
import StudentTaskCard from '@/components/StudentTaskCard.vue' 

// ── Auth ─────────────────────────────────────────────────────────────────────
const ua = useAuthStore()

// ── Estado ────────────────────────────────────────────────────────────────────
const currentTab = ref('pendientes')

// ── GET tareas ───────────────────────────────────────────────────────────────
const { data, error, isFetching } = useapi('/my-assignments', { method: 'GET' }).json()

// ── Debug ─────────────────────────────────────────────────────────────────────
watch(data, (val) => {
  const list = val?.data ?? val ?? []
 

    list.forEach((a: any) => {
  console.log('TASK:', a)
  console.log('submission:', a.submission)
})
})

// ── Filtros de actividades ───────────────────────────────────────────────────
const filteredActivities = computed(() => {
  const list = data.value?.data ?? data.value ?? []

  return list.filter((a: any) => {
    const hasSubmission = !!a.submission
    const isGraded = a.submission?.status === 'Calificada'

    const isLate =
      hasSubmission &&
      a.submission?.submission_date &&
      a.end_date &&
      new Date(a.submission.submission_date) > new Date(a.end_date)

    switch (currentTab.value) {
      case 'pendientes':
        return !hasSubmission

      case 'completadas':
        return hasSubmission && !isGraded

      case 'calificadas':
        return hasSubmission && isGraded

      case 'tardias':
        return isLate

      default:
        return false
    }
  })
})

// ── Utils ─────────────────────────────────────────────────────────────────────
const formatDate = (dateStr: string) => 
  new Date(dateStr).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })
</script>

<template>
  <div class="bg-page">
    <SidebarLayout>

      <!-- HEADER -->
      <div class="ContSmall">
        <div class="left">
          <div class="avatar">
            {{ ua.credentials?.user.name.charAt(0) }}{{ ua.credentials?.user.lastname.charAt(0) }}
          </div>
          <div>
            <h1>Mis Actividades</h1>
            <p v-if="data">{{ filteredActivities.length }} tareas encontradas</p>
          </div>
        </div>

        <div class="right">
          <span class="welcome-text">{{ ua.credentials?.user.name }}</span>
        </div>
      </div>

      <!-- CONTENIDO -->
      <div class="ContBig CenterItems">

        <!-- TABS -->
        <div class="tabs-container">
          <button @click="currentTab = 'pendientes'" :class="{ active: currentTab === 'pendientes' }">
            Por entregar
          </button>
          <button @click="currentTab = 'completadas'" :class="{ active: currentTab === 'completadas' }">
            Completadas
          </button>
          <button @click="currentTab = 'calificadas'" :class="{ active: currentTab === 'calificadas' }">
            Calificadas
          </button>
          <button @click="currentTab = 'tardias'" :class="{ active: currentTab === 'tardias' }">
            Fuera de tiempo
          </button>
        </div>

        <!-- LOADING -->
        <div v-if="isFetching" class="loading-state">
          <div class="spinner"></div>
          <p>Buscando tus tareas...</p>
        </div>

        <!-- ERROR -->
        <div v-if="error" class="error-banner">
          <span>⚠</span>
          <p>Hubo un problema al cargar las tareas.</p>
        </div>

        <!-- DATA -->
        <div v-if="!isFetching && !error">
          
          <div class="panel-header">
            <h2>{{ currentTab.toUpperCase() }}</h2>
            <span class="badge">{{ filteredActivities.length }}</span>
          </div>

          <!-- EMPTY -->
          <div v-if="!filteredActivities.length" class="empty-state">
            <div class="empty-icon">📂</div>
            <p>No tienes tareas en esta sección por ahora.</p>
          </div>

          <!-- GRID -->
          <div v-else class="tasks-grid">
            <StudentTaskCard
              v-for="task in filteredActivities"
              :key="task.id"
              :task="task"
            />
          </div>
        </div>

      </div>
    </SidebarLayout>
  </div>
</template>

<style scoped>
/* ── HEADER ─────────────────────────────────────────────────────────────── */
.ContSmall {
  background: var(--color-Azul);
  width: 1000px;
  min-height: 40px;
  border-radius: 20px;
  margin: 30px auto 0 auto;
  padding: 20px 25px;
  color: white;
  display: flex;               
  justify-content: space-between;
  align-items: center;
}

.ContSmall h1 {
  margin: 0;
  font-size: 1.5rem;
  letter-spacing: -0.5px;
}

.ContSmall p {
  margin: 0;
  font-size: 0.9rem;
  opacity: 0.8;
}

.left {
  display: flex;
  align-items: center;
  gap: 15px;
}

.welcome-text {
  font-weight: 600;
  font-size: 0.9rem;
  background: rgba(255, 255, 255, 0.1);
  padding: 8px 15px;
  border-radius: 10px;
}

/* ── CONTENEDOR PRINCIPAL ────────────────────────────────────────────────── */
.ContBig {
  background: var(--color-Blanco);
  width: 1000px;
  height: 400px;
  border-radius: 20px;
  margin: 30px auto;
  padding: 30px;
  box-shadow: 0 10px 30px #00000030;
  overflow-y: auto;
}

/* ── TABS ───────────────────────────────────────────────────────────────── */
.tabs-container {
  display: flex;
  gap: 8px;
  margin-bottom: 30px;
  background: #f1f5f9;
  padding: 6px;
  border-radius: 16px;
}

.tabs-container button {
  flex: 1;
  padding: 12px 10px;
  border: none;
  background: none;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 800;
  color: #64748b;
  font-size: 0.85rem;
  transition: all 0.2s ease;
}

.tabs-container button.active {
  background: white;
  color: var(--color-Azul);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

/* ── GRID ─────────────────────────────────────────────────────────────── */
.tasks-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.panel-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 25px;
}

.panel-header h2 {
  font-size: 1.1rem;
  font-weight: 800;
  color: var(--color-OscuroAzulado);
  margin: 0;
  letter-spacing: 0.5px;
}

.badge {
  background: var(--color-Azul);
  color: white;
  border-radius: 8px;
  padding: 4px 12px;
  font-size: 0.75rem;
  font-weight: 800;
}

/* ── STATES ─────────────────────────────────────────────────────────────── */
.loading-state, .empty-state {
  text-align: center;
  padding: 80px 20px;
  color: #94a3b8;
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

.empty-icon {
  font-size: 3rem;
  margin-bottom: 15px;
  opacity: 0.5;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-banner {
  background: #fee2e2;
  color: #dc2626;
  padding: 18px;
  border-radius: 15px;
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 700;
}

/* ── RESPONSIVE ──────────────────────────────────────────────────────────── */
@media (max-width: 1050px) {
  .ContSmall, .ContBig { width: 95%; }
}
</style>
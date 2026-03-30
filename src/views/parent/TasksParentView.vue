<script setup lang="ts">
import { ref, computed } from 'vue'
import SidebarLayout from '@/components/ParentSidebar.vue'
import ActivityCard from '@/components/TaskCard.vue'

const currentTab = ref('pendientes')

const activities = ref([
  {
    id: 1,
    child: 'Mateo',
    title: 'Ensayo Revolución',
    subject: 'Historia',
    end_date: '2026-03-25T23:59:59',
    submission: null,
  },
  {
    id: 2,
    child: 'Mateo',
    title: 'Ejercicios Álgebra',
    subject: 'Matemáticas',
    end_date: '2026-03-20T23:59:59',
    submission: { status: 'Entregada', grade: null, submission_date: '2026-03-21T10:00:00' },
  },
  {
    id: 3,
    child: 'Sofía',
    title: 'Maqueta Célula',
    subject: 'Ciencias',
    end_date: '2026-03-28T23:59:59',
    submission: { status: 'Entregada', grade: null, submission_date: '2026-03-24T12:00:00' },
  },
  {
    id: 4,
    child: 'Mateo',
    title: 'Resumen Libro',
    subject: 'Español',
    end_date: '2026-03-15T23:59:59',
    submission: { status: 'Calificada', grade: 10, submission_date: '2026-03-14T08:00:00' },
  },
])

const filteredActivities = computed(() => {
  return activities.value.filter((a) => {
    const hasSubmission = !!a.submission
    const isGraded = a.submission?.status === 'Calificada'
    const isLate = hasSubmission && new Date(a.submission.submission_date) > new Date(a.end_date)

    if (currentTab.value === 'pendientes') return !hasSubmission
    if (currentTab.value === 'entregadas') return hasSubmission && !isGraded && !isLate
    if (currentTab.value === 'calificadas') return isGraded
    if (currentTab.value === 'tardias') return isLate
    return false
  })
})
</script>

<template>
  <SidebarLayout>
    <div class="ContSmall center">
      <h1>Actividades y Tareas</h1>
    </div>

    <div class="ContBig" style="margin-top: 40px">
      <div class="tabs-container">
        <button @click="currentTab = 'pendientes'" :class="{ active: currentTab === 'pendientes' }">
          Pendientes
        </button>
        <button @click="currentTab = 'entregadas'" :class="{ active: currentTab === 'entregadas' }">
          Entregadas
        </button>
        <button
          @click="currentTab = 'calificadas'"
          :class="{ active: currentTab === 'calificadas' }"
        >
          Calificadas
        </button>
        <button @click="currentTab = 'tardias'" :class="{ active: currentTab === 'tardias' }">
          Entrega tardía
        </button>
      </div>

      <div class="content-wrapper">
        <div v-if="filteredActivities.length > 0">
          <div
            v-for="childName in [...new Set(activities.map((a) => a.child))]"
            :key="childName"
            class="child-group"
          >
            <h3 v-if="filteredActivities.some((a) => a.child === childName)" class="child-title">
              Alumno: {{ childName }}
            </h3>
            <div class="list">
              <ActivityCard
                v-for="act in filteredActivities.filter((a) => a.child === childName)"
                :key="act.id"
                :activity="act"
              />
            </div>
          </div>
        </div>

        <div v-else class="empty-state">
          <p>No hay actividades para mostrar en esta sección.</p>
        </div>
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
  min-height: 500px;
  border-radius: 20px;
  margin: 40px auto;
  padding: 25px;
  box-sizing: border-box;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
}

.tabs-container {
  display: flex;
  gap: 5px;
  margin-bottom: 30px;
  background: #f8fafc;
  padding: 6px;
  border-radius: 14px;
  overflow-x: auto;
}
.tabs-container button {
  flex: 1;
  padding: 10px 15px;
  border: none;
  background: none;
  border-radius: 10px;
  cursor: pointer;
  font-weight: bold;
  color: #64748b;
  white-space: nowrap;
  transition: 0.3s;
}
.tabs-container button.active {
  background: white;
  color: var(--color-Azul);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.child-title {
  font-size: 0.85rem;
  color: var(--color-AzulTres);
  margin: 25px 0 12px 0;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 800;
  border-bottom: 1px solid #f1f5f9;
  padding-bottom: 5px;
}
.empty-state {
  text-align: center;
  color: #94a3b8;
  margin-top: 60px;
  font-weight: 500;
}
</style>

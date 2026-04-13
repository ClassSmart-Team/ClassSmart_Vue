<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import SidebarLayout from '@/components/ParentSidebar.vue'
import TaskCard from '@/components/TaskCard.vue'
import { useapi } from '@/assets/composables/useApi'
import router from '@/router'
import type { GroupedChild, ParentActivity } from '@/types/types.ts'
import { useAuthStore } from '@/stores/authStore.ts'

const ua = useAuthStore()
const currentTab = ref('pendientes')
const openSubjects = ref<string[]>([])
const selectedChildId = ref<number | null>(null)

const {
  data,
  error: errorActivities,
  isFetching: isFetchingActivities,
} = useapi('/assignments').json()

const {
  data: childrenData,
  isFetching: loadingChildren,
  error: errorChildren,
} = useapi('/my-children').json()

const activities = computed<ParentActivity[]>(() => data.value?.data || [])
const children = computed(() => childrenData.value?.data || [])

const isFetching = computed(() => isFetchingActivities.value || loadingChildren.value)

watch(
  children,
  (newChildren) => {
    if (newChildren.length > 0 && !selectedChildId.value) {
      selectedChildId.value = newChildren[0].id
    }
  },
  { immediate: true },
)

function toggleSubject(subjectKey: string) {
  const index = openSubjects.value.indexOf(subjectKey)
  if (index === -1) {
    openSubjects.value.push(subjectKey)
  } else {
    openSubjects.value.splice(index, 1)
  }
}

const totalTasksCount = computed(() => {
  if (!activities.value) return 0

  return activities.value.filter((a: ParentActivity) => {
    return a.childId === selectedChildId.value && a.id !== null
  }).length
})

const filteredActivities = computed(() => {
  if (!activities.value) return []

  return activities.value.filter((a: ParentActivity) => {
    if (selectedChildId.value !== null && a.childId !== selectedChildId.value) return false

    if (a.id === null) return false

    const status = a.status?.toLowerCase()
    if (currentTab.value === 'pendientes') {
      return status === 'atrasada' || status === 'pendiente'
    }
    if (currentTab.value === 'entregadas') {
      return status === 'entregada' || status === 'calificada'
    }
    if (currentTab.value === 'tardias') {
      return status === 'tardia'
    }
    return false
  })
})

const groupedData = computed(() => {
  const result: Record<string, GroupedChild> = {}

  filteredActivities.value.forEach((act: ParentActivity) => {
    const childName = act.child || 'Estudiante'
    const subjectName = act.subject || 'Materia'
    const unitName = act.unit_name || 'Sin Unidad'

    if (!result[childName]) {
      result[childName] = { childName, childId: act.childId, subjects: {} }
    }
    if (!result[childName].subjects[subjectName]) {
      result[childName].subjects[subjectName] = { name: subjectName, units: {}, totalTasks: 0 }
    }
    if (!result[childName].subjects[subjectName].units[unitName]) {
      result[childName].subjects[subjectName].units[unitName] = {
        name: unitName,
        id: act.unit_id,
        tasks: [],
      }
    }

    result[childName].subjects[subjectName].units[unitName].tasks.push(act)
    result[childName].subjects[subjectName].totalTasks++
  })

  return result
})

function goToAssignment(assignmentId: number | null, childId: number) {
  router.push({ name: 'parentAssignmentsDetail', params: { id: assignmentId, childId: childId } })
}
</script>

<template>
  <div class="bg-page">
    <SidebarLayout>
      <div class="ContSmall">
        <div class="left">
          <div class="avatar">
            {{ ua.credentials?.user.name.charAt(0) }}{{ ua.credentials?.user.lastname.charAt(0) }}
          </div>
          <div>
            <h1>Actividades</h1>
            <p v-if="activities">{{ totalTasksCount }} tareas encontradas</p>
          </div>
        </div>
        <div class="right">
          <span class="welcome-text">{{ ua.credentials?.user.name }}</span>
        </div>
      </div>

      <div class="main-box" style="margin-top: 30px">
        <div v-if="isFetching" class="loading-state">
          <div class="spinner"></div>
          <p>Buscando actividades...</p>
        </div>

        <div v-else-if="errorActivities" class="error-banner">
          <span><img src="@/components/advertencia-triangulo.png" alt="error" /></span>
          <p>Hubo un problema al cargar la información.</p>
        </div>

        <template v-else>
          <template v-if="children.length > 0">
            <div class="child-selector">
              <label for="child-select">Ver tareas de: </label>
              <select id="child-select" v-model="selectedChildId">
                <option v-for="child in children" :key="child.id" :value="child.id">
                  {{ child.name }}
                </option>
              </select>
            </div>

            <div class="tabs-container">
              <button
                @click="currentTab = 'pendientes'"
                :class="{ active: currentTab === 'pendientes' }"
              >
                Por entregar
              </button>
              <button
                @click="currentTab = 'entregadas'"
                :class="{ active: currentTab === 'entregadas' }"
              >
                Completadas
              </button>
              <button @click="currentTab = 'tardias'" :class="{ active: currentTab === 'tardias' }">
                Fuera de tiempo
              </button>
            </div>

            <div class="content-wrapper">
              <div v-if="filteredActivities.length === 0" class="empty-state">
                <div class="empty-icon">📂</div>
                <p>No hay tareas en esta sección.</p>
              </div>

              <div v-else class="animate-fade">
                <div v-for="child in groupedData" :key="child.childName" class="child-section">
                  <div
                    v-for="(subject, subjectName) in child.subjects"
                    :key="subjectName"
                    class="subject-accordion-item"
                  >
                    <div
                      class="subject-header"
                      @click="toggleSubject(child.childName + subjectName)"
                    >
                      <span
                        class="arrow"
                        :class="{ rotated: openSubjects.includes(child.childName + subjectName) }"
                      >
                        <img src="@/components/flecha-abajo.png" alt="flecha" />
                      </span>
                      <div class="subject-info">
                        <h3>{{ subjectName }}</h3>
                        <span class="unit-badge">{{ subject.totalTasks }} actividades</span>
                      </div>
                    </div>

                    <div
                      v-if="openSubjects.includes(child.childName + subjectName)"
                      class="subject-content animate-slide"
                    >
                      <div
                        v-for="(unit, unitName) in subject.units"
                        :key="unitName"
                        class="unit-section"
                      >
                        <div class="unit-divider">
                          <span class="line"></span>
                          <span class="unit-title-text">{{ unitName }}</span>
                          <span class="line"></span>
                        </div>

                        <div class="activities-grid">
                          <TaskCard
                            v-for="act in unit.tasks"
                            :key="act.id ?? Math.random()"
                            :activity="act"
                            @click="goToAssignment(act.id, act.childId)"
                            style="cursor: pointer"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </template>

          <div v-if="errorChildren" class="no-children-empty">
            <span><img src="@/components/estudiante.png" /></span>
            <p>No se encontraron alumnos vinculados.</p>
          </div>
        </template>
      </div>
    </SidebarLayout>
  </div>
</template>

<style scoped>
.bg-page {
  min-height: 100vh;
  inset: 0;
  overflow-x: hidden;
  overflow-y: auto;
  z-index: -1;
}

.ContSmall {
  background: var(--color-Azul);
  width: 1000px;
  min-height: 40px;
  border-radius: 20px;
  margin: 0 auto;
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

.welcome-text {
  font-weight: 600;
  font-size: 0.9rem;
  background: rgba(255, 255, 255, 0.1);
  padding: 8px 15px;
  border-radius: 10px;
}

.loading-state,
.empty-state {
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
  to {
    transform: rotate(360deg);
  }
}

.no-children-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 0;
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

@media (max-width: 1050px) {
  .ContSmall,
  .ContBig {
    width: 95%;
  }
}

.tabs-container {
  display: flex;
  gap: 8px;
  margin-bottom: 30px;
  background: var(--color-Tabs);
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
  background: var(--color-Blanco);
  color: var(--color-Azul);
  box-shadow: 0 4px 12px var(--color-Bordes);
}

.tabs-container::-webkit-scrollbar {
  display: none;
}

.activities-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 15px;
}

.state-subtitle {
  font-size: 0.9rem;
  color: #999;
  margin-top: 5px;
}

.animate-fade {
  animation: fadeIn 0.3s ease-out;
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

/* grupos y unidades */
.unit-info h3 {
  margin: 0;
  font-size: 0.95rem;
  color: #334155;
  font-weight: 700;
}

.unit-badge {
  font-size: 0.75rem;
  background: var(--color-Blanco);
  color: #64748b;
  padding: 2px 10px;
  border-radius: 20px;
  font-weight: 600;
}

.arrow {
  width: 18px;
  transition: transform 0.3s ease;
}

.arrow.rotated {
  transform: rotate(-180deg);
}

.animate-slide {
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.empty-unit-msg {
  padding: 15px;
  text-align: center;
  border: 1px dashed #e2e8f0;
  border-radius: 8px;
  color: #94a3b8;
  font-size: 0.85rem;
}

/* Estilo del Acordeón de Materia */
.subject-accordion-item {
  margin-bottom: 15px;
  border: 1px solid var(--color-Bordes);
  border-radius: 15px;
  overflow: hidden;
  background: var(--color-Blanco);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
  width: 100%;
}

.subject-header {
  padding: 18px 25px;
  display: flex;
  align-items: center;
  gap: 15px;
  cursor: pointer;
  background: var(--color-Blanco);
  transition: 0.2s;
}

.subject-header:hover {
  background: var(--color-Hover);
}

.subject-info h3 {
  margin: 0;
  font-size: 1.05rem;
  color: var(--color-Azul);
  font-weight: 700;
}

.subject-content {
  padding: 10px 20px 25px 20px;
  border-top: 1px solid var(--color-Bordes);
  background: var(--color-Blanco);
}

/* --- ESTILO SEPARADOR DE UNIDAD --- */
.unit-divider {
  display: flex;
  align-items: center;
  margin: 30px 0 20px 0;
  text-align: center;
}

.unit-divider .line {
  flex: 1;
  height: 1px;
  background-color: #e2e8f0;
}

.unit-divider .unit-title-text {
  padding: 0 15px;
  color: #94a3b8;
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.unit-section {
  margin-bottom: 20px;
}

.unit-section:first-child .unit-divider {
  margin-top: 10px; /* Menos margen para la primera unidad */
}

.empty-unit-msg {
  padding: 10px;
  text-align: center;
  color: #cbd5e1;
  font-size: 0.85rem;
  font-style: italic;
}

/*SELECT*/
.child-selector {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 20px;
  margin-bottom: 10px;
}

.child-selector label {
  font-size: 0.85rem;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
}

.child-selector select {
  background-color: var(--color-Blanco);
  padding: 8px 15px;
  border-radius: 10px;
  border: 1px solid var(--color-Bordes);
  color: var(--color-Azul);
  font-weight: 600;
  cursor: pointer;
  outline: none;
  min-width: 200px;
}

.no-children-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 0;
}
</style>

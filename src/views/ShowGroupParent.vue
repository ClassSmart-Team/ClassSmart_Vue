<script setup lang="ts">
import SidebarLayout from '@/components/ParentSidebar.vue'
import TaskCard from '@/components/TaskCard.vue'
import { useapi } from '@/assets/composables/useApi'
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import router from '@/router'
import AnnouncementPostCard from '@/components/AnnouncementPostCard.vue'
import { useAuthStore } from '@/stores/authStore.ts'

const ua = useAuthStore()
const route = useRoute()
const currentTab = ref('actividades')
const groupId = route.params.id
const childId = route.params.childId

const { data, error, isFetching } = useapi(`/parent-groups/${groupId}?child_id=${childId}`).json()

const groupInfo = computed(
  () =>
    data.value?.data?.group || {
      name: '',
      teacher: '',
      description: '',
    },
)

const activities = computed(() => data.value?.data?.activities || [])
const forumPosts = computed(() => data.value?.data?.forum_posts || [])

function goToAssignment(id: number) {
  router.push({ name: 'parentGroupAssignmentDetail', params: { id: id, childId: childId } })
}

const openUnits = ref<number[]>([])

// Función para abrir/cerrar unidades
function toggleUnit(unitId: number) {
  const index = openUnits.value.indexOf(unitId)
  if (index === -1) {
    openUnits.value.push(unitId)
  } else {
    openUnits.value.splice(index, 1)
  }
}

const groupedActivities = computed(() => {
  const activitiesList = activities.value || []
  const unitsList = data.value?.data?.units || []

  const groups: any[] = []

  unitsList.forEach((unit: any) => {
    groups.push({
      id: unit.id,
      name: unit.name,
      tasks: [],
    })
  })

  activitiesList.forEach((act: any) => {
    if (act.status?.toLowerCase() !== 'cancelada') {
      const parentUnit = groups.find((g) => g.id === act.unit_id)
      if (parentUnit) {
        parentUnit.tasks.push(act)
      } else {
        let sinUnidad = groups.find((g) => g.id === 0)
        if (!sinUnidad) {
          sinUnidad = { id: 0, name: 'Sin Unidad', tasks: [] }
          groups.push(sinUnidad)
        }
        sinUnidad.tasks.push(act)
      }
    }
  })

  return groups
})
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
            <h1>{{ groupInfo.name }}</h1>
          </div>
        </div>
        <div class="right">
          <span class="welcome-text">{{ ua.credentials?.user.name }}</span>
        </div>
      </div>

      <div class="main-box" style="margin-top: 30px">
        <div v-if="isFetching" class="loading-state">
          <div class="spinner"></div>
          <p>Buscando grupos...</p>
        </div>

        <div v-else-if="error" class="error-banner">
          <span>
            <img src="@/components/advertencia-triangulo.png" alt="advertencia" />
          </span>
          <p>No se pudo cargar la información.</p>
        </div>

        <template v-else>
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
              <div v-if="groupedActivities.length === 0" class="empty-box">
                <p class="state-subtitle">No hay actividades asignadas.</p>
              </div>

              <div v-for="unit in groupedActivities" :key="unit.id" class="unit-wrapper">
                <div class="unit-header" @click="toggleUnit(unit.id)">
                  <span class="arrow" :class="{ rotated: openUnits.includes(unit.id) }">
                    <img src="@/components/flecha-abajo.png" alt="advertencia" />
                  </span>
                  <h3>{{ unit.name }}</h3>
                  <span class="unit-count">{{ unit.tasks.length }} actividades</span>
                </div>

                <div v-if="openUnits.includes(unit.id)" class="unit-content">
                  <div v-if="unit.tasks.length > 0" class="activities-grid">
                    <TaskCard
                      v-for="act in unit.tasks"
                      :key="act.id"
                      :activity="act"
                      style="cursor: pointer"
                      @click="goToAssignment(act.id)"
                    />
                  </div>

                  <div v-else class="empty-unit-msg">
                    <p class="state-subtitle">No hay actividades registradas en esta unidad.</p>
                  </div>
                </div>
              </div>
            </section>

            <section v-if="currentTab === 'foro'" class="animate-fade">
              <div v-if="forumPosts.length === 0" class="empty-box">
                <p class="state-subtitle">El docente aún no ha publicado anuncios.</p>
              </div>

              <div v-else class="forum-list">
                <AnnouncementPostCard
                  v-for="post in forumPosts"
                  :key="post.id"
                  :announcement="post"
                />
              </div>
            </section>
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
  background: var(--color-Blanco);
  padding: 5px;
  border-radius: 10px;
  margin-bottom: 20px;
}

.tabs-container button {
  flex: 1;
  padding: 10px;
  border: none;
  background: none;
  cursor: pointer;
  font-weight: 600;
  color: #94a3b8;
  border-radius: 8px;
  transition: 0.2s;
}

.tabs-container button.active {
  background: var(--color-Blanco);
  color: var(--color-Azul);
  box-shadow: 0 2px 5px var(--color-Bordes);
}

.forum-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.activities-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 15px;
}

.empty-box {
  padding: 40px;
  text-align: center;
  border: 1px dashed #cbd5e1;
  border-radius: 12px;
  color: #94a3b8;
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

.state-container {
  min-height: 500px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: var(--color-Blanco);
  width: 95%;
  max-width: 1000px;
  margin: 40px auto;
  border-radius: 20px;
}

.state-msg {
  font-size: 1.1rem;
  font-weight: 600;
  color: #555;
  margin-top: 15px;
}

.state-subtitle {
  font-size: 0.9rem;
  color: #999;
  margin-top: 5px;
}

.icon-circle {
  width: 70px;
  height: 70px;
  background: var(--color-Error);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  margin-bottom: 10px;
}

.loader-dots {
  width: 50px;
  aspect-ratio: 2;
  --_g: no-repeat radial-gradient(circle closest-side, var(--color-Texto) 90%, #0000);
  background:
    var(--_g) 0% 50%,
    var(--_g) 50% 50%,
    var(--_g) 100% 50%;
  background-size: calc(100% / 3) 50%;
  animation: l3 1s infinite linear;
  opacity: 0.3;
}
@keyframes l3 {
  20% {
    background-position:
      0% 0%,
      50% 50%,
      100% 50%;
  }
  40% {
    background-position:
      0% 100%,
      50% 0%,
      100% 50%;
  }
  60% {
    background-position:
      0% 50%,
      50% 100%,
      100% 0%;
  }
  80% {
    background-position:
      0% 50%,
      50% 50%,
      100% 100%;
  }
}

.unit-wrapper {
  margin-bottom: 15px;
  border: 1px solid var(--color-Bordes);
  border-radius: 12px;
  overflow: hidden;
}

.unit-header {
  background: var(--color-Blanco);
  padding: 15px 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: background 0.2s;
  user-select: none;
}

.unit-header:hover {
  background: var(--color-Hover);
}

.unit-header h3 {
  margin: 0;
  font-size: 1rem;
  flex: 1;
  color: var(--color-Unidad);
}

.unit-count {
  font-size: 0.75rem;
  color: var(--color-Texto);
  background: var(--color-Blanco);
  padding: 2px 8px;
  border-radius: 10px;
  border: 1px solid var(--color-Bordes);
}

.arrow {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s ease;
}

.arrow.rotated {
  transform: rotate(-180deg);
}

.unit-content {
  padding: 20px;
  background: var(--color-Blanco);
  border-top: 1px solid var(--color-Bordes);
  animation: slideDown 0.3s ease-out;
}

:deep(.activity-card) {
  transition: all 0.2s ease;
  cursor: pointer;
  border-top: 1px solid var(--color-Blanco);
  border-right: 1px solid var(--color-Blanco);
  border-bottom: 1px solid var(--color-Blanco);
}

:deep(.activity-card:hover) {
  filter: brightness(0.95);
  transform: translateY(-2px);
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
</style>

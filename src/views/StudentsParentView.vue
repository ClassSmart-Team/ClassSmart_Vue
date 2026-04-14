<script setup lang="ts">
import { computed, ref } from 'vue'
import SidebarLayout from '@/components/ParentSidebar.vue'
import ChildCard from '@/components/ChildCard.vue'
import ScheduleTable from '@/components/ScheduleTable.vue'
import { useapi } from '@/assets/composables/useApi'
import type { Child } from '@/types/types.ts'
import { useAuthStore } from '@/stores/authStore.ts'

const ua = useAuthStore()
const showModal = ref(false)
const isFetchingSchedule = ref(false)
const selectedChildName = ref('')
const currentSchedule = ref([])

const { data, isFetching, error } = useapi('/my-children').json()

const myChildren = computed(() => data.value?.data || [])

const selectedChildId = ref<number | null>(null)
const openSchedule = async (child: Child) => {
  selectedChildName.value = `${child.name} ${child.lastname || ''}`
  selectedChildId.value = child.id
  isFetchingSchedule.value = true
  showModal.value = true

  try {
    const { data: scheduleData } = await useapi(`/children/${child.id}/schedule`).json()

    if (scheduleData.value) {
      currentSchedule.value = scheduleData.value.data
    }
  } catch (err) {
    console.error('Error al obtener el horario', err)
    currentSchedule.value = []
  } finally {
    isFetchingSchedule.value = false
  }
}
</script>

<template>
  <div class="bg-page">
    <SidebarLayout>
      <div class="header-box header-flex">
        <div class="left">
          <div class="avatar">
            {{ ua.credentials?.user.name.charAt(0) }}{{ ua.credentials?.user.lastname.charAt(0) }}
          </div>
          <h1>Mis hijos</h1>
        </div>
      </div>

      <div class="main-box" style="margin-top: 10px">
        <div v-if="isFetching" class="loading-state">
          <div class="spinner"></div>
          <p>Buscando alumnos en el sistema...</p>
        </div>

        <div v-if="error" class="error-banner">
          <span><img src="@/components/advertencia-triangulo.png" alt="error" /></span>
          <p>Hubo un problema al cargar la información.</p>
        </div>

        <div v-else class="children-grid">
          <ChildCard
            v-for="child in myChildren"
            :key="child.id"
            :child="child"
            @view-schedule="openSchedule(child)"
          />
        </div>
      </div>

      <Transition name="modal-fade">
        <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
          <div class="modal-container">
            <div class="modal-header">
              <div class="header-info">
                <span class="subtitle">Horario Escolar</span>
                <h3>{{ selectedChildName }}</h3>
              </div>
              <button class="btn-close" @click="showModal = false">&times;</button>
            </div>

            <div class="modal-body">
              <div v-if="isFetchingSchedule" class="loading-schedule">
                <div class="spinner"></div>
                <p>Consultando calendario...</p>
              </div>

              <template v-else>
                <div v-if="selectedChildId" class="table-responsive-container">
                  <ScheduleTable
                    v-if="selectedChildId"
                    :childId="selectedChildId"
                    :key="selectedChildId"
                  />
                </div>

                <div v-else class="no-schedule">
                  <div class="icon-mini">
                    <img src="@/components/calendario.png" alt="calendario" />
                  </div>
                  <p>Sin clases registradas para este periodo.</p>
                </div>
              </template>
            </div>

            <div class="modal-footer">
              <button class="btn-primary" @click="showModal = false">Entendido</button>
            </div>
          </div>
        </div>
      </Transition>
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

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-container {
  background: var(--color-Blanco);
  width: 90%;
  max-width: 500px;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
}

.modal-header {
  padding: 12px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--color-Bordes);
}

.modal-header h3 {
  margin: 0;
  color: var(--color-Azul);
  font-size: 1rem;
}

.modal-body {
  padding: 10px;
}

.modal-footer {
  padding: 10px 20px;
  background: var(--color-Blanco);
  display: flex;
  justify-content: flex-end;
}

.subtitle {
  display: block;
  font-size: 0.6rem;
  font-weight: bold;
  color: var(--color-AzulTres);
  text-transform: uppercase;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.8rem;
  color: #ccc;
  cursor: pointer;
}

.btn-primary {
  background: var(--color-Azul);
  color: white;
  border: none;
  padding: 6px 15px;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
}

.table-responsive-container {
  width: 100%;
  overflow-x: auto;
  border-radius: 8px;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.table-responsive-container::-webkit-scrollbar {
  display: none;
}

.children-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 25px;
}
.ContSmall {
  background: var(--color-Azul);
  width: 95%;
  max-width: 1000px;
  height: 60px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin: 0 auto;
}
.ContBig {
  background: var(--color-Blanco);
  width: 98%;
  max-width: 1000px;
  min-height: 500px;
  border-radius: 20px;
  margin: 40px auto;
  padding: 30px;
  box-sizing: border-box;
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

.loading-schedule {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  padding: 40px 0;
  color: var(--color-AzulTres);
  font-weight: bold;
}

.spinner {
  width: 30px;
  height: 30px;
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-left-color: var(--color-AzulTres);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
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

.no-schedule {
  text-align: center;
  padding: 30px;
  background: var(--color-Blanco);
  border-radius: 15px;
  border: 2px dashed #eee;
  color: #888;
}

.icon-mini {
  font-size: 1.5rem;
  margin-bottom: 10px;
}

.no-children-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 0;
}
</style>

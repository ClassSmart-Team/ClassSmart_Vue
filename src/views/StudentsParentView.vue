<script setup lang="ts">
import { computed, ref } from 'vue'
import SidebarLayout from '@/components/ParentSidebar.vue'
import ChildCard from '@/components/ChildCard.vue'
import ScheduleTable from '@/components/ScheduleTable.vue'
import { useapi } from '@/assets/composables/useApi'

const showModal = ref(false)
const isFetchingSchedule = ref(false)
const selectedChildName = ref('')
const currentSchedule = ref([])

const { data, isFetching, error } = useapi('/my-children').json()

const myChildren = computed(() => data.value?.data || [])

const openSchedule = async (child: any) => {
  selectedChildName.value = `${child.name} ${child.lastname}`
  isFetchingSchedule.value = true
  showModal.value = true

  try {
    const { data: scheduleData } = await useapi(`/parent/children/${child.id}/schedule`).json()

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
  <SidebarLayout>
    <div class="ContSmall center">
      <h1>Mis Hijos</h1>
    </div>

    <div v-if="isFetching" class="state-container">
      <div class="loader-dots"></div>
      <p class="state-msg">Buscando alumnos en el sistema...</p>
    </div>

    <div v-else-if="error" class="state-container error">
      <div class="icon-circle">⚠️</div>
      <p class="state-msg">¡Ups! Hubo un problema al conectar con el servidor.</p>
    </div>

    <div v-else class="ContBig" style="margin-top: 40px">
      <div v-if="myChildren.length === 0" class="state-container empty">
        <div class="icon-circle">🎓</div>
        <p class="state-msg">No hay alumnos vinculados a tu cuenta.</p>
        <span class="state-subtitle">Contacta a la administración si crees que es un error.</span>
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
              <ScheduleTable v-if="currentSchedule.length > 0" :schedule="currentSchedule" />
              <div v-else class="no-schedule">
                <div class="icon-mini">🗓️</div>
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
</template>

<style scoped>
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
  background: white;
  width: 90%;
  max-width: 550px;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
}

.modal-header {
  padding: 20px 25px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #f0f0f0;
}

.subtitle {
  display: block;
  font-size: 0.7rem;
  font-weight: bold;
  color: var(--color-AzulTres);
  text-transform: uppercase;
}

.modal-header h3 {
  margin: 0;
  color: var(--color-Azul);
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.8rem;
  color: #ccc;
  cursor: pointer;
}

.modal-body {
  padding: 25px;
}

.modal-footer {
  padding: 15px 25px;
  background: #fcfcfc;
  display: flex;
  justify-content: flex-end;
}

.btn-primary {
  background: var(--color-Azul);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 12px;
  font-weight: bold;
  cursor: pointer;
}

/* TRANSICIÓN */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: all 0.3s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
  transform: scale(0.95);
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
  width: 95%;
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
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
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
  background: #f0f2f5;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  margin-bottom: 10px;
}

.error .icon-circle {
  background: #fff1f0;
}
.empty .icon-circle {
  background: #e6f7ff;
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
  --_g: no-repeat radial-gradient(circle closest-side, #000 90%, #0000);
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
  background: #fafafa;
  border-radius: 15px;
  border: 2px dashed #eee;
  color: #888;
}

.icon-mini {
  font-size: 1.5rem;
  margin-bottom: 10px;
}
</style>

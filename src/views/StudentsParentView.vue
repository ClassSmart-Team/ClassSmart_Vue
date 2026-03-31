<script setup lang="ts">
import { ref } from 'vue'
import SidebarLayout from '@/components/ParentSidebar.vue'
import ChildCard from '@/components/ChildCard.vue'
import ScheduleTable from '@/components/ScheduleTable.vue'
import { useapi } from '@/assets/composables/useApi'

const showModal = ref(false)
const selectedChildName = ref('')
const currentSchedule = ref([])

const openSchedule = (child: any) => {
  selectedChildName.value = child.name
  currentSchedule.value = child.schedule
  showModal.value = true
}
</script>

<template>
  <SidebarLayout>
    <div class="ContSmall center">
      <h1>Mis Hijos</h1>
    </div>

    <div class="ContBig" style="margin-top: 40px">
      <div class="children-grid">
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
            <ScheduleTable :schedule="currentSchedule" />
          </div>

          <div class="modal-footer">
            <button class="btn-primary" @click="showModal = false">Cerrar</button>
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

/* GRID Y BASES */
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
</style>

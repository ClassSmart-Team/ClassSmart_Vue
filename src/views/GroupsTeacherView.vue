<script setup lang="ts">
import SidebarLayout from '@/components/TeacherSidebar.vue'
import GroupTargect from '@/components/GroupTargect.vue'
import { useapi } from '@/assets/composables/useApi'
import Modal from '@/components/createGroupModal.vue'
import { useAuthStore } from '@/stores/authStore.ts'
import { type formgroup } from '@/types/types.ts'
import { ref } from 'vue'
const form = ref<formgroup>({
  period_id: 1,
  name: '',
  description: '',
  active: true,
})
const initialgroup = <formgroup>{
  period_id: 1,
  name: '',
  description: '',
  active: true,
}
const ua = useAuthStore()
const showModal = ref(false)
const { data, error, isFetching } = useapi('/groups', {
  method: 'GET',
}).json()

function creategroup() {
  const { data, onFetchResponse } = useapi('/groups', {
    method: 'POST',
  })
    .post(form.value)
    .json()
  onFetchResponse(() => {
    alert(data.value.message)
    showModal.value = false
    form.value = { ...initialgroup }
  })
}
</script>

<template>
  <div class="bg-page">
    <SidebarLayout>
      <!-- HEADER AZUL -->
      <div class="ContSmall center">
        <div>
          <h1>Explorar Grupos</h1>
          <p v-if="data">{{ data.data.length }} grupos académicos</p>
          <div class="avatar">
            {{ ua.credentials?.user.name.charAt(0) }}{{ ua.credentials?.user.lastname.charAt(0) }}
          </div>
          <button @click="showModal = true" class="btn-create-group">CREAR GRUPO</button>
        </div>
      </div>

      <!-- CONTENEDOR GRANDE -->
      <div class="ContBig CenterItems">
        <!-- LOADING -->
        <div v-if="isFetching" class="loading-state">
          <div class="spinner"></div>
          <p>Cargando grupos...</p>
        </div>

        <!-- ERROR -->
        <div v-if="error" class="error-banner">
          <span>⚠</span>
          <p>Error al conectar: {{ error }}</p>
        </div>
        <Modal v-model="showModal">
          <form class="group-form" @submit.prevent="creategroup">
            <label>Periodo ID</label>
            <input v-model="form.period_id" type="number" min="1" />

            <label>Nombre del Grupo</label>
            <input v-model="form.name" type="text" placeholder="Ej. Grupo chido" />

            <label>Descripción</label>
            <textarea
              v-model="form.description"
              placeholder="Ej. Este es un grupo chido"
            ></textarea>

            <label class="check-row">
              <input v-model="form.active" type="checkbox" />
              Grupo activo
            </label>

            <div class="actions">
              <button type="button" class="btn-cancel" @click="showModal = false">Cancelar</button>

              <button type="submit" class="btn-save">Guardar</button>
            </div>
          </form></Modal
        >
        <!-- GRID DE CARDS -->
        <div v-if="data && data.data" class="groups-grid">
          <GroupTargect v-for="group in data.data" :key="group.id" :group="group" />
        </div>
      </div>
    </SidebarLayout>
  </div>
</template>

<style scoped>
/* FONDO GENERAL */
.bg-page {
  position: fixed;
  inset: 0;
  overflow-x: hidden;
  overflow-y: auto;
  background: linear-gradient(180deg, var(--color-OscuroAzulado), var(--color-OscuroDos));
  z-index: -1;
}

/* HEADER */
.ContSmall {
  background: var(--color-Azul);
  width: 1000px;
  min-height: 70px;
  border-radius: 20px;
  margin: 30px auto 0 auto;
  padding: 15px;
  color: white;
}

.ContSmall h1 {
  margin: 0;
  font-size: 1.5rem;
}

.ContSmall p {
  margin: 0;
  font-size: 0.9rem;
  opacity: 0.9;
}

/* CONTENEDOR PRINCIPAL */
.ContBig {
  background: var(--color-Blanco);
  width: 1000px;
  min-height: 500px;
  border-radius: 20px;
  margin: 30px auto;
  padding: 30px;
  box-shadow: 0 10px 30px #00000030;
}

/* GRID (adaptado a tu estilo) */
.groups-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 25px;
  margin-top: 20px;
}

/* LOADING */
.loading-state {
  text-align: center;
  padding: 60px;
  color: var(--color-AzulTres);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e0e0e0;
  border-top: 4px solid var(--color-AzulTres);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 15px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* ERROR */
.error-banner {
  background: #ffe5e5;
  color: #b91c1c;
  padding: 15px;
  border-radius: 10px;
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
  align-items: center;
  font-weight: 600;
}
.btn-create-group {
  margin-top: 12px;
  padding: 12px 22px;
  border: none;
  border-radius: 14px;
  background: linear-gradient(135deg, #ffffff, #dbeafe);
  color: var(--color-OscuroAzulado);
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.25s ease;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.15);
  letter-spacing: 0.5px;
}

.btn-create-group:hover {
  transform: translateY(-2px);
  background: linear-gradient(135deg, #ffffff, #bfdbfe);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.btn-create-group:active {
  transform: translateY(0px) scale(0.98);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.18);
}

.btn-create-group:focus {
  outline: none;
  box-shadow:
    0 0 0 4px rgba(255, 255, 255, 0.35),
    0 10px 25px rgba(0, 0, 0, 0.2);
}
.avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: #e1f5ee;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 500;
  color: #0f6e56;
}
.group-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.group-form label {
  font-weight: 700;
  font-size: 0.9rem;
  color: #111827;
}

.group-form input,
.group-form textarea {
  border: 1px solid #d1d5db;
  border-radius: 12px;
  padding: 10px;
  font-size: 0.95rem;
  outline: none;
}

.group-form textarea {
  resize: none;
  min-height: 90px;
}

.check-row {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 700;
  margin-top: 5px;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 10px;
}

.btn-cancel {
  border: none;
  background: #e5e7eb;
  padding: 10px 18px;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 800;
}

.btn-save {
  border: none;
  background: #2563eb;
  color: white;
  padding: 10px 18px;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 800;
}

.btn-save:hover {
  background: #1d4ed8;
}
</style>

<script setup lang="ts">
import SidebarLayout from '@/components/TeacherSidebar.vue'
import GroupTargect from '@/components/GroupTargect.vue'
import { useapi } from '@/assets/composables/useApi'
import Modal from '@/components/createGroupModal.vue'
import { useAuthStore } from '@/stores/authStore.ts'
import { type formgroup } from '@/types/types.ts'
import { ref } from 'vue'
import router from '@/router'

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

const {
  data,
  error,
  isFetching,
  execute: reloadGroups,
} = useapi('/groups', {
  method: 'GET',
}).json()

function creategroup() {
  const { data: postData, onFetchResponse } = useapi('/groups', {
    method: 'POST',
  })
    .post(form.value)
    .json()
  onFetchResponse(async () => {
    alert(postData.value.message)
    showModal.value = false
    form.value = { ...initialgroup }

    await reloadGroups()
  })
}
// Petición para traer los periodos del backend
const { data: periodsData } = useapi('/periods', {
  method: 'GET',
}).json()

function showgroup(id:number){
  router.push({name:'teachershowgroup',params:{id}})
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
          <div>
            <h2>Explorar Grupos</h2>
            <p v-if="data">{{ data.data.length }} grupos académicos</p>
          </div>
        </div>

        <div class="right">
          <button @click="showModal = true" class="btn-create-group">
            CREAR GRUPO
          </button>
        </div>
      </div>

      <div class="main-box">

        <div v-if="isFetching" class="loading-state">
          <div class="spinner"></div>
          <p>Cargando grupos...</p>
        </div>

        <div v-if="error" class="error-banner">
          <span>⚠</span>
          <p>Error: {{ error }}</p>
        </div>

        <div v-if="data && data.data" class="groups-grid">
          <GroupTargect
            v-for="group in data.data"
            :key="group.id"
            :group="group"
            @click="showgroup(group.id)"
          />
        </div>

      </div>

      <Modal v-model="showModal">
        <form class="group-form" @submit.prevent="creategroup">
          <label>Periodo</label>
          <select v-model="form.period_id">
            <option v-for="period in periodsData?.data" :key="period.id" :value="period.id">
              {{ period.name }} - {{ period.year }}
            </option>
          </select>

          <label>Nombre del Grupo</label>
          <input v-model="form.name" type="text" />

          <label>Descripción</label>
          <textarea v-model="form.description"></textarea>

          <label class="check-row">
            <input v-model="form.active" type="checkbox" />
            Grupo activo
          </label>

          <div class="actions">
            <button type="button" class="btn-cancel" @click="showModal = false">Cancelar</button>
            <button type="submit" class="btn-save">Guardar</button>
          </div>
        </form>
      </Modal>

    </SidebarLayout>
  </div>
</template>

<style scoped>
/* FONDO GENERAL */
.bg-page {
  min-height: 100vh;
  inset: 0;
  overflow-x: hidden;
  overflow-y: auto;
  background: linear-gradient(180deg,var(--color-AzulDos),var(--color-ComplementoDos));
  z-index: -1;
}

/* HEADER */
.header-box {
  background: var(--color-Azul);
  width: 100%;
  max-width: 1200px;
  min-height: 40px;
  border-radius: 20px;
  margin: 20px auto;
  padding: 15px 25px;
  color: white;
}

/* Esta clase es la que hace la magia de mover el botón a la derecha */
.header-flex {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.right {
  display: flex;
  align-items: center;
}

/* CONTENEDOR PRINCIPAL */
.main-box {
  background: var(--color-Blanco);
  width: 100%;
  max-width: 1200px;
  min-height: 400px;
  overflow-y: auto;
  border-radius: 20px;
  margin: 0 auto;
  padding: 30px;
  box-shadow: 0 10px 30px #00000030;
}

/* GRID */
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
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
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

.group-form select {
  border: 1px solid #d1d5db;
  border-radius: 12px;
  padding: 10px;
  font-size: 0.95rem;
  outline: none;
  background: white;
  cursor: pointer;
}

@media (max-width: 768px) {
  .header-flex {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
}
</style>
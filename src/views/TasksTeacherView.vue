<script setup lang="ts">
import SidebarLayout from '@/components/TeacherSidebar.vue'
import Modal from '@/components/createGroupModal.vue'
import { useapi } from '@/assets/composables/useApi'
import { useAuthStore } from '@/stores/authStore.ts'
import { type formtask } from '@/types/types.ts'
import { watch, ref, computed } from 'vue'
import TeacherTaskCard from '@/components/TeacherTaskCard.vue'
import { type Unit } from '@/types/types.ts'

const initialTask: formtask = {
  title: '',
  description: '',
  start_date: '',
  end_date: '',
  status: 'Activa',
  group_id: null,
  unit_id: null,
}

const form = ref<formtask>({ ...initialTask })
const currentTab = ref('pendientes')

// ── Auth ─────────────────────────────────────────────────────────────────────
const ua = useAuthStore()

// ── Modal ────────────────────────────────────────────────────────────────────
const showModal = ref(false)

// ── GET tareas ───────────────────────────────────────────────────────────────
const { data, error, isFetching, execute: reloadTasks } = useapi('/assignments', {
  method: 'GET',
}).json()

// ── Selects auxiliares ───────────────────────────────────────────────────────
  const { data: groupsData } = useapi('/groups').json()
// Nota: unitsData ya no será necesario si usamos la data de groupsData
// Propiedad computada para obtener las unidades del grupo seleccionado
  const availableUnits = computed(() => { 
    const selectedGroupId = form.value.group_id
    if (!selectedGroupId||!groupsData.value?.data) return []
    const group = groupsData.value.data.find((g: any) => g.id === selectedGroupId)
    return group ? group.units : []
  })

  // Resetear la unidad si el grupo cambia
  watch(() => form.value.group_id, () => {
    form.value.unit_id = null
  })



// ── POST tarea ───────────────────────────────────────────────────────────────
function createTask() {

  if (!form.value.group_id || !form.value.unit_id) {
    alert('Debes seleccionar grupo y unidad')
    return
  }

 
  const payload = {
    ...form.value,
    group_id: Number(form.value.group_id),
    unit_id: Number(form.value.unit_id),
    start_date: form.value.start_date
      ? form.value.start_date.replace('T', ' ') + ':00'
      : null,
    end_date: form.value.end_date
      ? form.value.end_date.replace('T', ' ') + ':00'
      : null,
  }

  const { data: res, onFetchResponse } = useapi('/assignments', {
    method: 'POST',
  })
    .post(payload) 
    .json()

  onFetchResponse(async () => {
    alert(res.value.message)
    showModal.value = false
    form.value = { ...initialTask }
    await reloadTasks()
  })
}

const filteredActivities = computed(() => {
  const list = data.value?.data ?? data.value ?? []

  return list.filter((a: any) => {
    const hasSubmission = !!a.submission
    const isGraded = a.submission?.status === 'Calificada'
    const isLate =
      hasSubmission &&
      new Date(a.submission.submission_date) > new Date(a.end_date)

    if (currentTab.value === 'pendientes') return !hasSubmission
    if (currentTab.value === 'entregadas') return hasSubmission && !isGraded && !isLate
    if (currentTab.value === 'calificadas') return isGraded
    if (currentTab.value === 'tardias') return isLate
    return false
  })
})
</script>
<template>
  <div class="bg-page">
    <SidebarLayout>

      <!-- HEADER AZUL -->
      <div class="ContSmall">
        <div class="left">
          <div class="avatar">
            {{ ua.credentials?.user.name.charAt(0) }}{{ ua.credentials?.user.lastname.charAt(0) }}
          </div>
          <div>
            <h1>Explorar Tareas</h1>
            <p v-if="data">{{ filteredActivities.length }} tareas</p>
          </div>
        </div>

        <div class="right">
          <button @click="showModal = true" class="btn-create-task">
            CREAR TAREA
          </button>
        </div>
      </div>

      <!-- CONTENEDOR GRANDE -->
      <div class="ContBig CenterItems">

        <!-- TABS -->
        <div class="tabs-container">
          <button @click="currentTab = 'pendientes'" :class="{ active: currentTab === 'pendientes' }">
            Pendientes
          </button>
          <button @click="currentTab = 'entregadas'" :class="{ active: currentTab === 'entregadas' }">
            Entregadas
          </button>
          <button @click="currentTab = 'calificadas'" :class="{ active: currentTab === 'calificadas' }">
            Calificadas
          </button>
          <button @click="currentTab = 'tardias'" :class="{ active: currentTab === 'tardias' }">
            Entrega tardía
          </button>
        </div>

        <!-- LOADING -->
        <div v-if="isFetching" class="loading-state">
          <div class="spinner"></div>
          <p>Cargando tareas...</p>
        </div>

        <!-- ERROR -->
        <div v-if="error" class="error-banner">
          <span>⚠</span>
          <p>Error al conectar: {{ error }}</p>
        </div>

        <!-- PANEL -->
        <div v-if="!isFetching && !error">

          <div class="panel-header">
            <h2>Mis Tareas</h2>
            <span class="badge">{{ filteredActivities.length }}</span>
          </div>

          <!-- VACÍO -->
          <div v-if="!filteredActivities.length" class="empty-state">
            <p>No hay tareas en esta categoría.</p>
          </div>

          <!-- GRID -->
<div v-else class="tasks-grid">
  <TeacherTaskCard
    v-for="task in filteredActivities"
    :key="task.id"
    :task="task"
  />
</div>

        </div>

        <!-- MODAL -->
        <Modal v-model="showModal">
          <form class="task-form" @submit.prevent="createTask">

            <label>Título</label>
            <input v-model="form.title" type="text" placeholder="Ej. Titulo de tarea" />

            <label>Descripción</label>
            <textarea v-model="form.description" placeholder="Ej. Resolver ...."></textarea>

            <div class="grid-fields">
              <div>
                <label>Fecha de inicio</label>
                <input v-model="form.start_date" type="datetime-local" />
              </div>

              <div>
                <label>Fecha de entrega</label>
                <input v-model="form.end_date" type="datetime-local" />
              </div>

              <div>
                <label>Grupo</label>
                <select v-model="form.group_id">
                  <option value="">Selecciona un grupo</option>
                  <option v-for="g in groupsData?.data ?? []" :key="g.id" :value="g.id">
                    {{ g.name }}
                  </option>
                </select>
              </div>

              <div>
                <label>Unidad</label>
                <select v-model="form.unit_id":disabled="!form.group_id">
                  <option :value="null">Selecciona una unidad - Primero Selecciona Un Grupo</option>
                  <option v-for="u in availableUnits" :key="u.id" :value="u.id">
                    {{ u.name }}
                  </option>
                </select>
              </div>
            </div>

            <label class="check-row">
              Estado
              <select v-model="form.status" class="select-status">
                <option value="Activa">Activa</option>              
                <option value="Cerrada">Cerrada</option>
                <option value="Cancelada">Cancelada</option>
              </select>
            </label>

            <div class="actions">
              <button type="button" class="btn-cancel" @click="showModal = false">
                Cancelar
              </button>
              <button type="submit" class="btn-save">
                Guardar
              </button>
            </div>

          </form>
        </Modal>

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
  min-height: 40px;
  border-radius: 20px;
  margin: 30px auto 0 auto;
  padding: 15px;
  color: white;

  display: flex;               
  justify-content: space-between;
  align-items: center;
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

/* GRID */
.tasks-grid {
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
  0%   { transform: rotate(0deg); }
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

/* EMPTY */
.empty-state {
  text-align: center;
  padding: 60px;
  color: var(--color-AzulTres);
  font-size: 1rem;
}

/* BOTÓN CREAR */
.btn-create-task {
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

.btn-create-task:hover {
  transform: translateY(-2px);
  background: linear-gradient(135deg, #ffffff, #bfdbfe);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.btn-create-task:active {
  transform: translateY(0px) scale(0.98);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.18);
}

/* AVATAR */
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

/* FORMULARIO */
.task-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.task-form label {
  font-weight: 700;
  font-size: 0.9rem;
  color: #111827;
}

.task-form input,
.task-form textarea,
.task-form select {
  border: 1px solid #d1d5db;
  border-radius: 12px;
  padding: 10px;
  font-size: 0.95rem;
  outline: none;
  width: 100%;
  box-sizing: border-box;
}

.task-form textarea {
  resize: none;
  min-height: 80px;
}

/* GRID DENTRO DEL FORM */
.grid-fields {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.grid-fields label {
  display: block;
  margin-bottom: 4px;
}

/* STATUS */
.check-row {
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 700;
}

.select-status {
  flex: 1;
}

/* ACCIONES */
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

/* PANEL HEADER */
.panel-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.panel-header h2 {
  font-size: 1.2rem;
  font-weight: 800;
  color: var(--color-OscuroAzulado);
  margin: 0;
}

.badge {
  background: var(--color-Azul);
  color: white;
  border-radius: 20px;
  padding: 2px 12px;
  font-size: 0.85rem;
  font-weight: 700;
}

/* GRID DE TAREAS */
.tasks-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 18px;
}

/* TARJETA */
.task-card {
  border-radius: 16px;
  padding: 18px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  transition: transform 0.2s, box-shadow 0.2s;
}

.task-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.1);
}

/* STATUS COLORS */
.task-card.activa  { border-left: 4px solid #2563eb; }
.task-card.inactiva { border-left: 4px solid #9ca3af; }
.task-card.cerrada  { border-left: 4px solid #ef4444; }

.task-card-top {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 10px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
}

.activa  .status-dot { background: #2563eb; }
.inactiva .status-dot { background: #9ca3af; }
.cerrada  .status-dot { background: #ef4444; }

.status-label {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #6b7280;
}

/* CONTENIDO */
.task-title {
  font-size: 1rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 6px 0;
}

.task-desc {
  font-size: 0.85rem;
  color: #6b7280;
  margin: 0 0 12px 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.task-meta {
  display: flex;
  gap: 12px;
  font-size: 0.78rem;
  color: #9ca3af;
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
</style>
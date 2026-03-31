<script setup lang="ts">
import SidebarLayout from '@/components/TeacherSidebar.vue'
import TaskCard from '@/components/TaskCard.vue'
import Modal from '@/components/createGroupModal.vue'
import { useapi } from '@/assets/composables/useApi'
import { useAuthStore } from '@/stores/authStore.ts'
import { type formtask } from '@/types/types.ts'
import { ref } from 'vue'



const initialTask: formtask = {
  title: '',
  description: '',
  start_date: '',
  end_date: '',
  status: 'Activa',
  group_id: '',
  unit_id: '',
}

const form = ref<formtask>({ ...initialTask })

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
const { data: unitsData } = useapi('/units').json()

// ── POST tarea ───────────────────────────────────────────────────────────────
function createTask() {
  const { data: res, onFetchResponse } = useapi('/assignments', {
    method: 'POST',
  })
    .post(form.value)
    .json()

  onFetchResponse(async () => {
    alert(res.value.message)
    showModal.value = false
    form.value = { ...initialTask }
    await reloadTasks()
  })
}
</script>

<template>
  <div class="bg-page">
    <SidebarLayout>

      <!-- HEADER AZUL -->
      <div class="ContSmall center">
        <div>
          <h1>Explorar Tareas</h1>
          <p v-if="data">{{ (data.data ?? data).length }} tareas registradas</p>
          <div class="avatar">
            {{ ua.credentials?.user.name.charAt(0) }}{{ ua.credentials?.user.lastname.charAt(0) }}
          </div>
          <button @click="showModal = true" class="btn-create-task">CREAR TAREA</button>
        </div>
      </div>

      <!-- CONTENEDOR GRANDE -->
      <div class="ContBig CenterItems">

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

        <!-- MODAL -->
        <Modal v-model="showModal">
          <form class="task-form" @submit.prevent="createTask">

            <label>Título</label>
            <input v-model="form.title" type="text" placeholder="Ej. Tarea de matemáticas" />

            <label>Descripción</label>
            <textarea
              v-model="form.description"
              placeholder="Ej. Resolver los ejercicios del capítulo 3"
            ></textarea>

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
                  <option
                    v-for="g in groupsData?.data ?? []"
                    :key="g.id"
                    :value="g.id"
                  >
                    {{ g.name }}
                  </option>
                </select>
              </div>

              <div>
                <label>Unidad</label>
                <select v-model="form.unit_id">
                  <option value="">Selecciona una unidad</option>
                  <option
                    v-for="u in unitsData?.data ?? []"
                    :key="u.id"
                    :value="u.id"
                  >
                    {{ u.name }}
                  </option>
                </select>
              </div>
            </div>

            <label class="check-row">
              Estado
              <select v-model="form.status" class="select-status">
                <option value="Activa">Activa</option>
                <option value="Inactiva">Inactiva</option>
                <option value="Cerrada">Cerrada</option>
              </select>
            </label>

            <div class="actions">
              <button type="button" class="btn-cancel" @click="showModal = false">Cancelar</button>
              <button type="submit" class="btn-save">Guardar</button>
            </div>

          </form>
        </Modal>

        <!-- GRID DE CARDS -->
        <div v-if="data && (data.data ?? data).length" class="tasks-grid">
          <TaskCard
            v-for="task in (data.data ?? data)"
            :key="task.id"
            :activity="task"
          />
        </div>

        <!-- EMPTY -->
        <div v-else-if="!isFetching && !error" class="empty-state">
          No hay tareas registradas aún.
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
  min-height: 40px;
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
  min-height: 400px;
  border-radius: 20px;
  margin: 30px auto;
  padding: 30px;
  box-shadow: 0 10px 30px #00000030;
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
</style>
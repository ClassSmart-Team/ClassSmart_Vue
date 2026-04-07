<script setup lang="ts">
import SidebarLayout from '@/components/TeacherSidebar.vue'
import Modal from '@/components/createGroupModal.vue'
import { useapi } from '@/assets/composables/useApi'
import { useAuthStore } from '@/stores/authStore.ts'
import { type formtask } from '@/types/types.ts'
import { watch, ref, computed } from 'vue'
import TeacherTaskCard from '@/components/TeacherTaskCard.vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const ua = useAuthStore()

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
const loadingSubmissions = ref(false)

// MODALS
const showModal = ref(false)
const showEditModal = ref(false)
const selectedTask = ref<any>(null)

// ─────────────────────────────────────────
// LLAMADAS A API
// ─────────────────────────────────────────
const { data, execute: reloadTasks } = useapi('/assignments', {
  method: 'GET',
}).json()

const { data: groupsData } = useapi('/groups').json()

const availableUnits = computed(() => {
  const selectedGroupId = form.value.group_id
  if (!selectedGroupId || !groupsData.value?.data) return []
  const group = groupsData.value.data.find((g: any) => g.id === selectedGroupId)
  return group ? group.units : []
})

watch(() => form.value.group_id, () => {
  form.value.unit_id = null
})

// ─────────────────────────────────────────
// CARGAR ENTREGAS (Submissions)
// ─────────────────────────────────────────
async function loadSubmissions(list: any[]) {
  if (!list.length) return
  loadingSubmissions.value = true

  try {
    await Promise.all(
      list.map(async (task: any) => {
        try {
          const res = await fetch(`/api/submissions?assignment_id=${task.id}`, {
            headers: {
              Authorization: `Bearer ${ua.credentials?.token}`,
              Accept: 'application/json',
            },
          })
          const json = await res.json()
          task.submissions = json?.data ?? []
        } catch {
          task.submissions = []
        }
      })
    )
  } finally {
    loadingSubmissions.value = false
  }
}

watch(data, (newData) => {
  if (!newData) return
  const list = newData?.data ?? newData ?? []
  loadSubmissions(list)
})

// ─────────────────────────────────────────
// ACCIONES: CREAR, ACTUALIZAR, ELIMINAR
// ─────────────────────────────────────────
function createTask() {
  if (!form.value.group_id || !form.value.unit_id) {
    alert('Debes seleccionar grupo y unidad')
    return
  }

  const payload = {
    ...form.value,
    group_id: Number(form.value.group_id),
    unit_id: Number(form.value.unit_id),
    start_date: form.value.start_date?.replace('T', ' ') + ':00',
    end_date: form.value.end_date?.replace('T', ' ') + ':00',
  }

  const { onFetchResponse } = useapi('/assignments', { method: 'POST' }).post(payload).json()
  onFetchResponse(async () => {
    showModal.value = false
    form.value = { ...initialTask }
    await reloadTasks()
  })
}

function updateTask() {
  // Formateamos fechas antes de enviar por si se editaron en el modal
  const payload = {
    ...selectedTask.value,
    start_date: selectedTask.value.start_date?.replace('T', ' ').substring(0, 19),
    end_date: selectedTask.value.end_date?.replace('T', ' ').substring(0, 19),
  }

  const { onFetchResponse } = useapi(`/assignments/${selectedTask.value.id}`, {
    method: 'PUT',
  }).put(payload).json()

  onFetchResponse(async () => {
    showEditModal.value = false
    await reloadTasks()
  })
}

function deleteTask(id: number) {
  if (!confirm('¿Estás seguro de eliminar esta tarea? Esta acción no se puede deshacer.')) return

  const { onFetchResponse } = useapi(`/assignments/${id}`, {
    method: 'DELETE',
  }).json()

  onFetchResponse(async () => {
    showEditModal.value = false
    await reloadTasks()
  })
}

// ─────────────────────────────────────────
// FILTROS Y LÓGICA DE NAVEGACIÓN
// ─────────────────────────────────────────
const filteredActivities = computed(() => {
  const list = data.value?.data ?? data.value ?? []

  return list.filter((a: any) => {
    const subs: any[] = a.submissions ?? []
    const hasSubmission = subs.length > 0
    // Calificadas: Tareas donde hay entregas y TODAS están calificadas
    const allGraded = hasSubmission && subs.every((s: any) => s.status === 'Calificada')
    // Tardías: Tareas con al menos una entrega después de la fecha límite
    const isLate = subs.some((s: any) => new Date(s.submission_date) > new Date(a.end_date))

    if (currentTab.value === 'pendientes') return true // Muestra todo lo que el profesor ha subido
    if (currentTab.value === 'entregadas') return hasSubmission
    if (currentTab.value === 'calificadas') return allGraded
    if (currentTab.value === 'tardias') return isLate
    return false
  })
})

const tabCounts = computed(() => {
  const list = data.value?.data ?? data.value ?? []
  const counts = { pendientes: list.length, entregadas: 0, calificadas: 0, tardias: 0 }

  for (const a of list) {
    const subs: any[] = a.submissions ?? []
    const hasSubmission = subs.length > 0
    if (hasSubmission) counts.entregadas++
    if (hasSubmission && subs.every((s: any) => s.status === 'Calificada')) counts.calificadas++
    if (subs.some((s: any) => new Date(s.submission_date) > new Date(a.end_date))) counts.tardias++
  }
  return counts
})

function handleTaskClick(task: any) {
  if (currentTab.value === 'pendientes') {
    // Solo ver/editar/eliminar en un modal
    selectedTask.value = { ...task }
    showEditModal.value = true
  } else {
    // Redirigir al detalle de la tarea para calificar alumnos
    router.push(`/teacher/tasks/${task.id}`)
  }
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
            <h1>Explorar Tareas</h1>
            <p>{{ filteredActivities.length }} tareas encontradas</p>
          </div>
        </div>
        <div class="right">
          <button @click="showModal = true" class="btn-create-task">+ CREAR TAREA</button>
        </div>
      </div>

      <div class="ContBig">
        <div class="tabs-container">
          <button
            v-for="tab in [
              { key: 'pendientes', label: 'Pendientes' },
              { key: 'entregadas', label: 'Entregadas' },
              { key: 'calificadas', label: 'Calificadas' },
              { key: 'tardias', label: 'Tardías' },
            ]"
            :key="tab.key"
            @click="currentTab = tab.key"
            :class="{ active: currentTab === tab.key }"
          >
            {{ tab.label }}
            <span class="tab-count">{{ tabCounts[tab.key as keyof typeof tabCounts] }}</span>
          </button>
        </div>

        <div class="tasks-list">
          <TeacherTaskCard
            v-for="task in filteredActivities"
            :key="task.id"
            :task="task"
            :show-action-button="currentTab !== 'pendientes'"
            @click="handleTaskClick(task)"
          />
        </div>
      </div>

      <Modal v-model="showModal">
        <form @submit.prevent="createTask" class="task-form">
          <h3>Nueva Tarea</h3>
          <input v-model="form.title" placeholder="Título de la tarea" required />
          <textarea v-model="form.description" placeholder="Instrucciones para los alumnos"></textarea>

          <div class="grid-fields">
            <div>
              <label>Grupo</label>
              <select v-model="form.group_id" required>
                <option :value="null" disabled>Seleccionar Grupo</option>
                <option v-for="g in groupsData?.data ?? []" :key="g.id" :value="g.id">{{ g.name }}</option>
              </select>
            </div>
            <div>
              <label>Unidad</label>
              <select v-model="form.unit_id" required>
                <option :value="null" disabled>Seleccionar Unidad</option>
                <option v-for="u in availableUnits" :key="u.id" :value="u.id">{{ u.name }}</option>
              </select>
            </div>
          </div>

          <div class="grid-fields">
            <div>
              <label>Fecha Inicio</label>
              <input type="datetime-local" v-model="form.start_date" required />
            </div>
            <div>
              <label>Fecha Límite</label>
              <input type="datetime-local" v-model="form.end_date" required />
            </div>
          </div>

          <button type="submit" class="btn-save">Publicar Tarea</button>
        </form>
      </Modal>

      <Modal v-model="showEditModal">
        <div v-if="selectedTask" class="task-form">
          <h3>Gestionar Tarea</h3>
          <p style="font-size: 0.8rem; color: #64748b; margin-bottom: 15px;">
            Aquí puedes modificar los datos generales de la tarea o eliminarla permanentemente.
          </p>

          <label>Título</label>
          <input v-model="selectedTask.title" />

          <label>Descripción</label>
          <textarea v-model="selectedTask.description"></textarea>

          <div class="grid-fields">
            <div>
              <label>Fecha Inicio</label>
              <input type="datetime-local" v-model="selectedTask.start_date" />
            </div>
            <div>
              <label>Fecha Límite</label>
              <input type="datetime-local" v-model="selectedTask.end_date" />
            </div>
          </div>

          <div class="actions" style="margin-top: 20px;">
            <button @click="deleteTask(selectedTask.id)" class="btn-cancel" style="background: #fee2e2; color: #dc2626;">
              Eliminar Tarea
            </button>
            <button @click="updateTask" class="btn-save">
              Guardar Cambios
            </button>
          </div>
        </div>
      </Modal>

    </SidebarLayout>
  </div>
</template>

<style scoped>
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
  width: 95%;
  max-width: 1000px;
  border-radius: 20px;
  margin: 30px auto 0 auto;
  padding: 18px 24px;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.ContSmall h1 { margin: 0; font-size: 1.4rem; }
.ContSmall p  { margin: 0; font-size: 0.85rem; opacity: 0.85; }

.left  { display: flex; align-items: center; gap: 12px; }
.right { display: flex; align-items: center; }

/* CONTENEDOR PRINCIPAL */
.ContBig {
  background: var(--color-Blanco, white);
  width: 95%;
  max-width: 1000px;
  border-radius: 20px;
  margin: 20px auto 40px auto;
  padding: 28px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.12);
  overflow-y: auto;
}

/* LISTA — una columna */
.tasks-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 16px;
}

/* TABS */
.tabs-container {
  display: flex;
  gap: 5px;
  margin-bottom: 24px;
  background: #f1f5f9;
  padding: 5px;
  border-radius: 12px;
  overflow-x: auto;
}
.tabs-container button {
  flex: 1;
  padding: 9px 14px;
  border: none;
  background: none;
  border-radius: 9px;
  cursor: pointer;
  font-weight: 700;
  font-size: 0.82rem;
  color: #64748b;
  white-space: nowrap;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}
.tabs-container button.active {
  background: white;
  color: var(--color-Azul);
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}
.tab-count {
  background: #e2e8f0;
  border-radius: 20px;
  padding: 1px 7px;
  font-size: 0.7rem;
  font-weight: 800;
  color: #475569;
}
.tabs-container button.active .tab-count {
  background: #dbeafe;
  color: var(--color-Azul);
}

/* LOADING */
.loading-state {
  text-align: center;
  padding: 60px;
  color: var(--color-AzulTres, #2563eb);
}
.spinner {
  width: 36px;
  height: 36px;
  border: 3px solid #e0e0e0;
  border-top: 3px solid var(--color-AzulTres, #2563eb);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 14px;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ERROR */
.error-banner {
  background: #ffe5e5;
  color: #b91c1c;
  padding: 14px;
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
  padding: 50px;
  color: #94a3b8;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  font-size: 0.95rem;
}

/* PANEL HEADER */
.panel-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}
.panel-header h2 {
  font-size: 1.1rem;
  font-weight: 800;
  color: var(--color-OscuroAzulado, #1e293b);
  margin: 0;
}
.badge {
  background: var(--color-Azul);
  color: white;
  border-radius: 20px;
  padding: 2px 12px;
  font-size: 0.8rem;
  font-weight: 700;
}

/* BOTÓN CREAR */
.btn-create-task {
  padding: 10px 20px;
  border: none;
  border-radius: 12px;
  background: rgba(255,255,255,0.15);
  color: white;
  font-weight: 700;
  font-size: 0.88rem;
  cursor: pointer;
  transition: background 0.2s;
  border: 1.5px solid rgba(255,255,255,0.3);
}
.btn-create-task:hover {
  background: rgba(255,255,255,0.25);
}

/* AVATAR */
.avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: rgba(255,255,255,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 700;
  color: white;
}

/* FORMULARIO */
.task-form {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.task-form label {
  font-weight: 700;
  font-size: 0.85rem;
  color: #111827;
}
.task-form input,
.task-form textarea,
.task-form select {
  border: 1px solid #d1d5db;
  border-radius: 10px;
  padding: 9px 12px;
  font-size: 0.9rem;
  outline: none;
  width: 100%;
  box-sizing: border-box;
  transition: border-color 0.2s;
}
.task-form input:focus,
.task-form textarea:focus,
.task-form select:focus {
  border-color: var(--color-Azul);
}
.task-form textarea {
  resize: vertical;
  min-height: 75px;
}
.grid-fields {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
.grid-fields label { display: block; margin-bottom: 4px; }
.select-status { width: 100%; }
.actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 8px;
}
.btn-cancel {
  border: none;
  background: #e5e7eb;
  padding: 9px 18px;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 700;
}
.btn-save {
  border: none;
  background: #2563eb;
  color: white;
  padding: 9px 18px;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 700;
}
.btn-save:hover { background: #1d4ed8; }
</style>
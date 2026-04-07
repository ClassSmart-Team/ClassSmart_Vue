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

// TABS
const tabs = [
  { key: 'activas', label: 'Activas' },
  { key: 'tardias', label: 'Tardías' },
] as const

type TabKey = typeof tabs[number]['key']
const currentTab = ref<TabKey>('activas')

// FILTRO SOLO GRUPO
const selectedGroupFilter = ref<number | null>(null)

// ─────────────────────────────
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
const loadingSubmissions = ref(false)
const tasksList = ref<any[]>([])

// MODAL
const showModal = ref(false)

// API
const { data, execute: reloadTasks } = useapi('/assignments', {
  method: 'GET',
}).json()

const { data: groupsData } = useapi('/groups').json()

// unidades dinámicas SOLO PARA FORM
const availableUnits = computed(() => {
  const selectedGroupId = form.value.group_id
  if (!selectedGroupId || !groupsData.value?.data) return []
  const group = groupsData.value.data.find((g: any) => g.id === selectedGroupId)
  return group ? group.units : []
})

// reset unidad form
watch(() => form.value.group_id, () => {
  form.value.unit_id = null
})

// ─────────────────────────────
// LOAD SUBMISSIONS
async function loadSubmissions(list: any[]) {
  if (!list.length) {
    tasksList.value = []
    return
  }

  loadingSubmissions.value = true
  const tempTasks = JSON.parse(JSON.stringify(list))

  try {
    await Promise.all(
      tempTasks.map(async (task: any) => {
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

    tasksList.value = tempTasks
  } finally {
    loadingSubmissions.value = false
  }
}

watch(data, (newData) => {
  if (!newData) return
  const list = newData?.data ?? newData ?? []
  loadSubmissions(list)
}, { immediate: true })

// ─────────────────────────────
// FILTRO (YA SIN UNIDAD)
const filteredActivities = computed(() => {
  return tasksList.value.filter((task: any) => {
    const now = new Date()
    const end = new Date(task.end_date)

    const matchesTab =
      currentTab.value === 'activas' ? end >= now : end < now

const matchesGroup =
  !selectedGroupFilter.value ||
  Number(task.group_id) === Number(selectedGroupFilter.value)

    return matchesTab && matchesGroup
  })
})

// CONTADORES
const tabCounts = computed(() => {
  const counts: Record<TabKey, number> = {
    activas: 0,
    tardias: 0,
  }

  const now = new Date()

  for (const task of tasksList.value) {
    const end = new Date(task.end_date)
    if (end >= now) counts.activas++
    else counts.tardias++
  }

  return counts
})

// ─────────────────────────────
function handleTaskClick(task: any) {
  router.push(`/teacher/tasks/${task.id}`)
}


function handleEditTask(task: any) {
  editingTask.value = task

  form.value = {
    title: task.title,
    description: task.description,
    start_date: task.start_date?.replace(' ', 'T'),
    end_date: task.end_date?.replace(' ', 'T'),
    status: task.status,
    group_id: task.group_id,
    unit_id: task.unit_id,
  }

  showEditModal.value = true
}

// CRUD
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
const showEditModal = ref(false)
const editingTask = ref<any>(null)

async function updateTask() {
  if (!editingTask.value) return

  try {
    const payload = {
      ...form.value,
      group_id: Number(form.value.group_id),
      unit_id: Number(form.value.unit_id),
      start_date: form.value.start_date?.replace('T', ' ') + ':00',
      end_date: form.value.end_date?.replace('T', ' ') + ':00',
    }

    const res = await fetch(`/api/assignments/${editingTask.value.id}`, {
      method: 'PATCH', 
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ua.credentials?.token}`,
      },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      console.error(await res.text())
      alert('Error al actualizar la tarea')
      return
    }

    showEditModal.value = false
    editingTask.value = null
    form.value = { ...initialTask }

    await reloadTasks()

  } catch (err) {
    console.error(err)
    alert('Error inesperado al actualizar')
  }
}

async function deleteTask() {
  if (!editingTask.value) return

  const confirmDelete = confirm('¿Seguro que quieres eliminar esta tarea?')
  if (!confirmDelete) return

  try {
    const res = await fetch(`/api/assignments/${editingTask.value.id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${ua.credentials?.token}`,
      },
    })

    if (!res.ok) {
      console.error(await res.text())
      alert('Error al eliminar')
      return
    }

    showEditModal.value = false
    editingTask.value = null
    form.value = { ...initialTask }

    await reloadTasks()

  } catch (err) {
    console.error(err)
    alert('Error al eliminar')
  }
}
</script>



<template>
  <div class="bg-page">
    <SidebarLayout>

      <!-- HEADER -->
      <div class="ContSmall">
        <div class="left">
          <div class="avatar">
            {{ ua.credentials?.user.name.charAt(0) }}{{ ua.credentials?.user.lastname.charAt(0) }}
          </div>
          <div>
            <h1>Explorar Tareas</h1>
            <p v-if="loadingSubmissions">Sincronizando entregas...</p>
            <p v-else>{{ filteredActivities.length }} tareas filtradas</p>
          </div>
        </div>

        <div class="right">
          <button @click="showModal = true" class="btn-create-task">
            + CREAR TAREA
          </button>
        </div>
      </div>

      <div class="ContBig">

        <!-- TABS -->
        <div class="tabs-container">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            @click="currentTab = tab.key"
            :class="{ active: currentTab === tab.key }"
          >
            {{ tab.label }}
            <span class="tab-count">
              {{ tabCounts[tab.key] }}
            </span>
          </button>
        </div>

        <!--  FILTROS DENTRO DEL TAB -->
        <div class="filters-container">

          <select v-model="selectedGroupFilter">
            <option :value="null">Todos los grupos</option>
            <option
              v-for="g in groupsData?.data ?? []"
              :key="g.id"
              :value="g.id"
            >
              {{ g.name }}
            </option>
          </select>

        </div>

        <!-- LISTA -->
        <div class="tasks-list">

          <div v-if="loadingSubmissions && tasksList.length === 0" class="loading-state">
            <div class="spinner"></div>
            <p>Buscando entregas de alumnos...</p>
          </div>

          <TeacherTaskCard
  v-for="task in filteredActivities"
  :key="task.id"
  :task="task"
  @view="handleTaskClick"
  @edit="handleEditTask"
/>
          

          <div v-if="!loadingSubmissions && filteredActivities.length === 0" class="empty-state">
            <p>No hay tareas en esta categoría.</p>
          </div>

        </div>
      </div>

      <!-- MODAL -->
      <Modal v-model="showModal">
        <form @submit.prevent="createTask" class="task-form">
          <h3>Nueva Tarea</h3>

          <input v-model="form.title" placeholder="Título" required />
          <textarea v-model="form.description" placeholder="Instrucciones"></textarea>

          <div class="grid-fields">
            <select v-model="form.group_id" required>
              <option :value="null" disabled>Grupo</option>
              <option v-for="g in groupsData?.data ?? []" :key="g.id" :value="g.id">
                {{ g.name }}
              </option>
            </select>

            <select v-model="form.unit_id" required>
              <option :value="null" disabled>Unidad</option>
              <option v-for="u in availableUnits" :key="u.id" :value="u.id">
                {{ u.name }}
              </option>
            </select>
          </div>

          <div class="grid-fields">
            <input type="datetime-local" v-model="form.start_date" required />
            <input type="datetime-local" v-model="form.end_date" required />
          </div>

          <button type="submit" class="btn-save">Publicar</button>
        </form>
      </Modal>

    </SidebarLayout>
  </div>


<!-- MODAL EDITAR -->
<Modal v-model="showEditModal">
  <form @submit.prevent="updateTask" class="task-form">
    <h3>Editar Tarea</h3>

    <input v-model="form.title" placeholder="Título" required />
    <textarea v-model="form.description" placeholder="Instrucciones"></textarea>

    <div class="grid-fields">
      <select v-model="form.group_id" required>
        <option :value="null" disabled>Grupo</option>
        <option v-for="g in groupsData?.data ?? []" :key="g.id" :value="g.id">
          {{ g.name }}
        </option>
      </select>

      <select v-model="form.unit_id" required>
        <option :value="null" disabled>Unidad</option>
        <option v-for="u in availableUnits" :key="u.id" :value="u.id">
          {{ u.name }}
        </option>
      </select>
    </div>

    <div class="grid-fields">
      <input type="datetime-local" v-model="form.start_date" required />
      <input type="datetime-local" v-model="form.end_date" required />
    </div>

    <div class="actions">
  <button type="button" class="btn-delete" @click="deleteTask">
    Eliminar
  </button>

  <button type="submit" class="btn-save">
    Actualizar
  </button>
</div>
  </form>
</Modal>

</template>



<style scoped>

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

.filters-container {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

.filters-container select {
  padding: 8px 12px;
  border-radius: 10px;
  border: 1px solid #d1d5db;
  font-size: 0.85rem;
}

</style>
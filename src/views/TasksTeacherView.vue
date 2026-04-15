<script setup lang="ts">
import SidebarLayout from '@/components/TeacherSidebar.vue'
import Modal from '@/components/createGroupModal.vue'
import { useapi } from '@/assets/composables/useApi'
import { useAuthStore } from '@/stores/authStore.ts'
import { type formtask } from '@/types/types.ts'
import { watch, ref, computed, onMounted } from 'vue'
import TeacherTaskCard from '@/components/TeacherTaskCard.vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const ua = useAuthStore()

const tabs = [
  { key: 'activas', label: 'Activas' },
  { key: 'tardias', label: 'No activas' },
] as const

type TabKey = typeof tabs[number]['key']
const currentTab = ref<TabKey>('activas')

const selectedGroupFilter = ref<number | null>(null)

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
const selectedFiles = ref<File[]>([])

const showModal = ref(false)
const showEditModal = ref(false)
const editingTask = ref<any>(null)

const { data: groupsData } = useapi('/groups').json()

const availableUnits = computed(() => {
  const selectedGroupId = form.value.group_id
  if (!selectedGroupId || !groupsData.value?.data) return []
  const group = groupsData.value.data.find((g: any) => g.id === selectedGroupId)
  return group ? group.units : []
})

watch(() => form.value.group_id, (newVal, oldVal) => {
  if (oldVal !== null) form.value.unit_id = null
})

const { data: assignmentsData, execute: fetchAssignments } = useapi('/assignments').json()

async function reloadTasks() {
  await fetchAssignments()
}

watch(assignmentsData, (newData) => {
  if (!newData) return
  const list = newData?.data ?? newData ?? []
  loadSubmissions(list)
}, { immediate: true })

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

onMounted(() => {
  reloadTasks()
})

const filteredActivities = computed(() => {
  return tasksList.value.filter((task: any) => {
    const now = new Date()
    const end = new Date(task.end_date)
    const vencidaPorFecha = task.status === 'Activa' && end < now
    const matchesTab =
      currentTab.value === 'activas'
        ? task.status === 'Activa' && !vencidaPorFecha
        : task.status !== 'Activa' || vencidaPorFecha
    const matchesGroup =
      !selectedGroupFilter.value ||
      Number(task.group?.id ?? task.group_id) === Number(selectedGroupFilter.value)
    return matchesTab && matchesGroup
  })
})

const tabCounts = computed(() => {
  const counts: Record<TabKey, number> = { activas: 0, tardias: 0 }
  const now = new Date()
  for (const task of tasksList.value) {
    const end = new Date(task.end_date)
    const vencidaPorFecha = task.status === 'Activa' && end < now
    if (task.status === 'Activa' && !vencidaPorFecha) counts.activas++
    else counts.tardias++
  }
  return counts
})

function toBackendDate(value: string): string {
  const normalized = value.replace('T', ' ')
  const withoutSeconds = normalized.replace(/(\d{2}:\d{2})(:\d{2})?$/, '$1')
  return withoutSeconds + ':00'
}

function buildPayload() {
  return {
    title: form.value.title,
    description: form.value.description,
    start_date: toBackendDate(form.value.start_date),
    end_date: toBackendDate(form.value.end_date),
    group_id: form.value.group_id ? Number(form.value.group_id) : null,
    unit_id: form.value.unit_id ? Number(form.value.unit_id) : null,
    status: form.value.status,
  }
}

function handleTaskClick(task: any) {
  router.push(`/teacher/tasks/${task.id}`)
}

function handleEditTask(task: any) {
  editingTask.value = task;

  form.value = {
    title: task.title,
    description: task.description || '',
    start_date: task.start_date?.replace(' ', 'T').substring(0, 16) ?? '',
    end_date: task.end_date?.replace(' ', 'T').substring(0, 16) ?? '',
    group_id: task.group_id ? Number(task.group_id) : (task.group?.id || null),
    status: task.status ?? 'Activa',
    unit_id: null
  };

  setTimeout(() => {
    form.value.unit_id = task.unit_id ? Number(task.unit_id) : (task.unit?.id || null);
    showEditModal.value = true;
  }, 50);
}


function onFilesChange(e: Event) {
  const input = e.target as HTMLInputElement
  if (input.files) {
    const newFiles = Array.from(input.files)
    selectedFiles.value = [...selectedFiles.value, ...newFiles]
    input.value = ''
  }
}

function removeFile(index: number) {
  selectedFiles.value = selectedFiles.value.filter((_, i) => i !== index)
}

async function createTask() {
  if (!form.value.group_id || !form.value.unit_id) {
    alert('Debes seleccionar grupo y unidad')
    return
  }

  const baseUrl = import.meta.env.VITE_API_URL ?? 'https://api.sutando-user.me/api'
  const fd = new FormData()

  fd.append('title', form.value.title)
  fd.append('description', form.value.description || '')
  fd.append('start_date', toBackendDate(form.value.start_date))
  fd.append('end_date', toBackendDate(form.value.end_date))
  fd.append('group_id', String(form.value.group_id))
  fd.append('unit_id', String(form.value.unit_id))
  fd.append('status', form.value.status)

  selectedFiles.value.forEach((f) => {
    fd.append('files[]', f)
  })

  try {
    const res = await fetch(`${baseUrl}/assignments`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${ua.credentials?.token}`,
        Accept: 'application/json',
      },
      body: fd,
    })

    const text = await res.text()
    const json = text ? JSON.parse(text) : {}

    if (!res.ok) {
      alert('Error: ' + JSON.stringify(json?.errors ?? json?.message ?? json))
      return
    }

    showModal.value = false
    form.value = { ...initialTask }
    selectedFiles.value = []
    await reloadTasks()

  } catch (e) {
    console.error('[createTask] error →', e)
    alert('Ocurrió un error inesperado al crear la tarea')
  }
}

async function updateTask() {
  if (!editingTask.value) return
  if (!form.value.group_id || !form.value.unit_id) {
    alert('Grupo y unidad son obligatorios')
    return
  }
  const payload = buildPayload()
  const baseUrl = import.meta.env.VITE_API_URL ?? 'https://api.sutando-user.me/api'
  try {
    const res = await fetch(`${baseUrl}/assignments/${editingTask.value.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${ua.credentials?.token}`,
      },
      body: JSON.stringify(payload),
    })
    const text = await res.text()
    const json = text ? JSON.parse(text) : {}
    if (!res.ok) {
      alert('Error: ' + JSON.stringify(json?.errors ?? json?.message ?? json))
      return
    }
    showEditModal.value = false
    editingTask.value = null
    form.value = { ...initialTask }
    await reloadTasks()
  } catch (e) {
    console.error('[updateTask] error →', e)
  }
}

async function deleteTask() {
  if (!editingTask.value) return
  const confirmDelete = confirm('¿Seguro que quieres eliminar esta tarea?')
  if (!confirmDelete) return
  const { onFetchResponse, onFetchError, error } = useapi(
    `/assignments/${editingTask.value.id}`
  ).delete().json()
  onFetchResponse(async () => {
    showEditModal.value = false
    editingTask.value = null
    form.value = { ...initialTask }
    await reloadTasks()
  })
  onFetchError(() => {
    console.error('[deleteTask] error →', error.value)
    alert('Error al eliminar la tarea')
  })
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
            <p v-if="loadingSubmissions">Sincronizando entregas...</p>
            <p v-else>{{ filteredActivities.length }} tareas filtradas</p>
          </div>
        </div>
        <div class="right">
          <button @click="showModal = true" class="btn-create-task">+ CREAR TAREA</button>
        </div>
      </div>

      <div class="ContBig">
        <div class="tabs-container">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            @click="currentTab = tab.key"
            :class="{ active: currentTab === tab.key }"
          >
            {{ tab.label }}
            <span class="tab-count">{{ tabCounts[tab.key] }}</span>
          </button>
        </div>

        <div class="filters-container">
          <select v-model="selectedGroupFilter">
            <option :value="null">Todos los grupos</option>
            <option v-for="g in groupsData?.data ?? []" :key="g.id" :value="Number(g.id)">
              {{ g.name }}
            </option>
          </select>
        </div>

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

      <Modal v-model="showModal">
        <form @submit.prevent="createTask" class="task-form">
          <div class="form-header">
            <div class="header-info">
              <h3>Nueva Tarea</h3>
              <p>Configura los detalles de la nueva asignación</p>
            </div>
          </div>

          <div class="form-body">
            <div class="field-group">
              <label>Título</label>
              <input v-model="form.title" placeholder="Ej. Taller de integración" required />
            </div>

            <div class="field-group">
              <label>Instrucciones</label>
              <textarea v-model="form.description" placeholder="Escribe los detalles aquí..."></textarea>
            </div>

            <div class="grid-fields">
              <div class="field-group">
                <label>Grupo</label>
                <select v-model="form.group_id" required>
                  <option :value="null" disabled>Seleccionar grupo</option>
                  <option v-for="g in groupsData?.data ?? []" :key="g.id" :value="g.id">{{ g.name }}</option>
                </select>
              </div>
              <div class="field-group">
                <label>Unidad</label>
                <select v-model="form.unit_id" required>
                  <option :value="null" disabled>Seleccionar unidad</option>
                  <option v-for="u in availableUnits" :key="u.id" :value="u.id">{{ u.name }}</option>
                </select>
              </div>
            </div>

            <div class="grid-fields">
              <div class="field-group">
                <label>Fecha de apertura</label>
                <input type="datetime-local" v-model="form.start_date" required />
              </div>
              <div class="field-group">
                <label>Fecha de cierre</label>
                <input type="datetime-local" v-model="form.end_date" required />
              </div>
            </div>

            <div class="upload-container">
              <label class="section-label">Material de apoyo</label>
              <div class="drop-area" @click="($refs.fileInputCreate as HTMLInputElement).click()">
                <input ref="fileInputCreate" type="file" multiple class="hidden-input" @change="onFilesChange" />
                <p>Click para seleccionar archivos</p>
                <span>PDF, Word o Imágenes</span>
              </div>

              <div v-if="selectedFiles.length" class="files-preview">
                <div v-for="(f, i) in selectedFiles" :key="i" class="file-item">
                  <span class="file-name text-truncate" style="max-width: 100px;">{{ f.name }}</span>
                  <button type="button" @click="removeFile(i)" class="btn-remove">X</button>
                </div>
              </div>
            </div>
          </div>

          <div class="form-footer">
            <button type="button" class="btn-cancel" @click="showModal = false">Cancelar</button>
            <button type="submit" class="btn-primary">Publicar Tarea</button>
          </div>
        </form>
      </Modal>

    </SidebarLayout>
  </div>

  <Modal v-model="showEditModal">
    <form @submit.prevent="updateTask" class="task-form edit-mode">
      <div class="form-header">
        <div class="header-info">
          <h3>Editar Tarea</h3>
          <p>Modifica los parámetros de la tarea existente</p>
        </div>
      </div>

      <div class="form-body">
        <div class="field-group">
          <label>Título</label>
          <input v-model="form.title" required />
        </div>

        <div class="field-group">
          <label>Instrucciones</label>
          <textarea v-model="form.description" placeholder="Escribe los detalles aquí..."></textarea>
        </div>

        <div class="grid-fields">
          <div class="field-group">
            <label>Grupo</label>
            <select v-model="form.group_id" required>
              <option v-for="g in groupsData?.data ?? []" :key="g.id" :value="g.id">{{ g.name }}</option>
            </select>
          </div>
          <div class="field-group">
            <label>Unidad</label>
            <select v-model="form.unit_id" required>
              <option v-for="u in availableUnits" :key="u.id" :value="u.id">{{ u.name }}</option>
            </select>
          </div>
        </div>

        <div class="grid-fields">
          <div class="field-group">
            <label>Fecha de apertura</label>
            <input type="datetime-local" v-model="form.start_date" required />
          </div>
          <div class="field-group">
            <label>Fecha de cierre</label>
            <input type="datetime-local" v-model="form.end_date" required />
          </div>
        </div>

        <div class="status-selection">
          <label class="section-label">Estado de la entrega</label>
          <div class="status-grid">
            <label v-for="opt in [
              { value: 'Activa', color: '#16a34a' },
              { value: 'Cerrada', color: '#d97706' },
              { value: 'Cancelada', color: '#dc2626' }
            ]" :key="opt.value" class="status-card" :class="{ active: form.status === opt.value }">
              <input type="radio" v-model="form.status" :value="opt.value" />
              <span class="status-dot" :style="{ background: opt.color }"></span>
              {{ opt.value }}
            </label>
          </div>
        </div>
      </div>

      <div class="form-footer split">
        <button type="button" class="btn-danger-outline" @click="deleteTask">Eliminar Tarea</button>
        <div class="footer-right">
          <button type="button" class="btn-cancel" @click="showEditModal = false">Cerrar</button>
          <button type="submit" class="btn-primary">Guardar Cambios</button>
        </div>
      </div>
    </form>
  </Modal>
</template>

<style scoped>
/* Estructura Principal */
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

/* Tareas y Tabs */
.tasks-list { display: flex; flex-direction: column; gap: 10px; margin-top: 16px; }

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
.tabs-container button.active .tab-count { background: #dbeafe; color: var(--color-Azul); }

/* Estados de Carga */
.loading-state { text-align: center; padding: 60px; color: var(--color-AzulTres, #2563eb); }
.spinner {
  width: 36px; height: 36px;
  border: 3px solid #e0e0e0;
  border-top: 3px solid var(--color-AzulTres, #2563eb);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 14px;
}
@keyframes spin { to { transform: rotate(360deg); } }

.empty-state {
  text-align: center; padding: 50px; color: #94a3b8;
  display: flex; flex-direction: column; align-items: center; gap: 10px; font-size: 0.95rem;
}

/* Botón Crear en Header */
.btn-create-task {
  padding: 10px 20px;
  border: 1.5px solid rgba(255,255,255,0.3);
  border-radius: 12px;
  background: rgba(255,255,255,0.15);
  color: white;
  font-weight: 700;
  font-size: 0.88rem;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-create-task:hover { background: rgba(255,255,255,0.25); }

/* --- DISEÑO DE FORMULARIO EN MODALES --- */
.task-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
  padding: 10px;
}

.form-header {
  margin-bottom: 10px;
  border-left: 4px solid var(--color-AzulTres);
  padding-left: 15px;
}

.form-header h3 {
  margin: 0;
  color: var(--color-AzulCuatro);
  font-size: 1.3rem;
}

.form-header p {
  margin: 4px 0 0;
  color: #64748b;
  font-size: 0.85rem;
}

.form-body {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field-group label, .section-label {
  font-weight: 700;
  font-size: 0.85rem;
  color: var(--color-AzulCuatro);
}

.field-group input,
.field-group textarea,
.field-group select {
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  padding: 10px 14px;
  font-size: 0.9rem;
  background: #f8fafc;
  transition: all 0.2s;
  width: 100%;
  box-sizing: border-box;
}

.field-group input:focus,
.field-group textarea:focus,
.field-group select:focus {
  border-color: var(--color-Azul);
  background: white;
  outline: none;
}

.grid-fields {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

/* Sección de Archivos (Modal Crear) */
.drop-area {
  border: 2px dashed var(--color-Azul);
  background: var(--color-Contenedor);
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
}

.drop-area:hover { background: #dbeafe; }
.drop-area p { margin: 0; font-weight: 700; color: var(--color-AzulTres); font-size: 0.9rem; }
.drop-area span { font-size: 0.75rem; color: #64748b; }
.hidden-input { display: none; }

.files-preview {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 8px;
  margin-top: 10px;
}

.file-item {
  background: white;
  border: 1.5px solid #e2e8f0;
  padding: 6px 10px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.75rem;
}

.btn-remove {
  background: #fee2e2;
  color: #ef4444;
  border: none;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  cursor: pointer;
  font-weight: bold;
}

/* Selector de Estado (Modal Editar) */
.status-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-top: 5px;
}

.status-card {
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  padding: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 700;
  transition: all 0.2s;
  background: white;
}

.status-card input { display: none; }

.status-card.active {
  border-color: var(--color-AzulTres);
  background: #eff6ff;
  color: var(--color-AzulTres);
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

/* Footers de los Modales */
.form-footer {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  border-top: 1px solid #f1f5f9;
  padding-top: 15px;
}

.form-footer.split {
  justify-content: space-between;
}

.footer-right {
  display: flex;
  gap: 12px;
}

.btn-primary {
  background: var(--color-AzulTres);
  color: white;
  border: none;
  padding: 10px 24px;
  border-radius: 10px;
  font-weight: 700;
  cursor: pointer;
}

.btn-cancel {
  background: #f1f5f9;
  color: #64748b;
  border: none;
  padding: 10px 20px;
  border-radius: 10px;
  font-weight: 700;
  cursor: pointer;
}

.btn-danger-outline {
  background: transparent;
  color: #dc2626;
  border: 2px solid #fee2e2;
  padding: 10px 20px;
  border-radius: 10px;
  font-weight: 700;
  cursor: pointer;
}

.btn-danger-outline:hover { background: #fee2e2; }

/* Filtros Generales */
.filters-container { display: flex; gap: 10px; margin-bottom: 15px; }
.filters-container select {
  padding: 8px 12px;
  border-radius: 10px;
  border: 1px solid #d1d5db;
  font-size: 0.85rem;
}
</style>

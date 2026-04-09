<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import AdminNavBar from '@/components/AdminNavBar.vue'
import { useAuthStore } from '@/stores/authStore.ts'
import { useapi } from '@/assets/composables/useApi'

const ua = useAuthStore()

type Role = {
  id: number
  description: string
  created_at?: string | null
  updated_at?: string | null
}

type UserItem = {
  id: number
  name: string
  lastname: string
  email: string
  cellphone?: string | null
  active: boolean
  role?: Role | null
  created_at?: string | null
  updated_at?: string | null
}

type PeriodItem = {
  id: number
  name: string
  year: number
  start_date: string
  end_date: string
  created_at?: string | null
  updated_at?: string | null
}

type GroupItem = {
  id: number
  name: string
  description: string | null
  active: boolean
  owner?: UserItem | null
  period?: PeriodItem | null
  students_count?: number
  assignments_count?: number
  created_at?: string | null
  updated_at?: string | null
}

type UnitItem = {
  id: number
  name: string
  start_date: string
  end_date: string
  group?: GroupItem | null
  assignments_count?: number
  created_at?: string | null
  updated_at?: string | null
}

type FileItem = {
  id: number
  file_name: string
  file_path?: string | null
  url?: string | null
  type?: string | null
  size?: number | null
  created_at?: string | null
  updated_at?: string | null
}

type AssignmentItem = {
  id: number
  title: string
  description: string
  start_date: string
  end_date: string
  status: 'Activa' | 'Cerrada' | 'Cancelada'
  group?: GroupItem | null
  unit?: UnitItem | null
  files?: FileItem[]
  submissions_count?: number
  created_at?: string | null
  updated_at?: string | null
}

type AssignmentForm = {
  title: string
  description: string
  start_date: string
  end_date: string
  status: 'Activa' | 'Cerrada' | 'Cancelada' | ''
  group_id: number | ''
  unit_id: number | ''
}

type ApiErrorPayload = {
  message?: string
  errors?: Record<string, string[]>
}

const showModal = ref(false)
const isEditMode = ref(false)
const selectedAssignmentId = ref<number | null>(null)
const submitting = ref(false)
const actionLoadingId = ref<number | null>(null)
const formError = ref('')
const unitsLoading = ref(false)

const selectedFiles = ref<File[]>([])
const fileInputRef = ref<HTMLInputElement | null>(null)
const existingFiles = ref<FileItem[]>([])

const form = reactive<AssignmentForm>({
  title: '',
  description: '',
  start_date: '',
  end_date: '',
  status: 'Activa',
  group_id: '',
  unit_id: '',
})

const filters = reactive({
  search: '',
})

const statusOptions: Array<'Activa' | 'Cerrada' | 'Cancelada'> = ['Activa', 'Cerrada', 'Cancelada']

const authRoleDescription = computed(() =>
  (ua.credentials?.user.role?.description ?? '').trim().toLowerCase(),
)

const isAdmin = computed(() => {
  return authRoleDescription.value === 'admin' || ua.credentials?.user.role?.id === 1
})

const {
  data: assignmentsData,
  error: assignmentsError,
  isFetching: assignmentsLoading,
  execute: reloadAssignments,
} = useapi('/assignments', {
  method: 'GET',
}).json()

const {
  data: groupsData,
  error: groupsError,
  isFetching: groupsLoading,
  execute: reloadGroups,
} = useapi('/groups', {
  method: 'GET',
}).json()

const groups = computed<GroupItem[]>(() => groupsData.value?.data ?? [])
const assignments = computed<AssignmentItem[]>(() => assignmentsData.value?.data ?? [])

const availableGroups = computed(() => {
  return groups.value.filter((group) => Boolean(group.active))
})

const units = ref<UnitItem[]>([])

const filteredAssignments = computed(() => {
  const term = filters.search.trim().toLowerCase()

  if (!term) return assignments.value

  return assignments.value.filter((assignment) => {
    const title = (assignment.title ?? '').toLowerCase()
    const description = (assignment.description ?? '').toLowerCase()
    const groupName = (assignment.group?.name ?? '').toLowerCase()
    const unitName = (assignment.unit?.name ?? '').toLowerCase()
    const status = (assignment.status ?? '').toLowerCase()
    const fileNames = (assignment.files ?? [])
      .map((file) => (file.file_name ?? '').toLowerCase())
      .join(' ')

    return (
      title.includes(term) ||
      description.includes(term) ||
      groupName.includes(term) ||
      unitName.includes(term) ||
      status.includes(term) ||
      fileNames.includes(term)
    )
  })
})

function extractErrorMessage(data: unknown, fallback: string) {
  const payload = (data ?? {}) as ApiErrorPayload

  if (payload.errors) {
    return Object.values(payload.errors).flat().join(' ')
  }

  return payload.message || fallback
}

function resetFileInput() {
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}

function resetForm() {
  form.title = ''
  form.description = ''
  form.start_date = ''
  form.end_date = ''
  form.status = 'Activa'
  form.group_id = ''
  form.unit_id = ''
  selectedAssignmentId.value = null
  isEditMode.value = false
  formError.value = ''
  units.value = []
  selectedFiles.value = []
  existingFiles.value = []
  resetFileInput()
}

function clearFilters() {
  filters.search = ''
}

function closeModal() {
  showModal.value = false
  resetForm()
}

function formatDate(date?: string | null) {
  if (!date) return '—'

  return new Date(date.replace(' ', 'T')).toLocaleString('es-MX', {
    dateStyle: 'short',
    timeStyle: 'short',
  })
}

function toInputDateTimeValue(date?: string | null) {
  if (!date) return ''
  return date.replace(' ', 'T').slice(0, 16)
}

function formatGroup(group?: GroupItem | null) {
  return group?.name || 'Sin grupo'
}

function formatUnit(unit?: UnitItem | null) {
  return unit?.name || 'Sin unidad'
}

function resolveFileUrl(file?: FileItem | null) {
  if (!file) return ''

  if (file.url) return file.url

  if (file.file_path) {
    if (file.file_path.startsWith('http://') || file.file_path.startsWith('https://')) {
      return file.file_path
    }

    const cleanPath = file.file_path.startsWith('/')
      ? file.file_path
      : `/${file.file_path}`

    const apiBase = import.meta.env.VITE_API_URL ?? 'https://api.sutando-user.me/api'
    const baseOrigin = apiBase.replace(/\/api\/?$/, '')

    return `${baseOrigin}${cleanPath}`
  }

  return ''
}

function openFile(file?: FileItem | null) {
  const url = resolveFileUrl(file)

  if (!url) {
    alert('No se encontró una URL válida para este archivo.')
    return
  }

  window.open(url, '_blank', 'noopener,noreferrer')
}

function statusClass(status: string) {
  if (status === 'Activa') return 'tag active'
  if (status === 'Cerrada') return 'tag closed'
  return 'tag cancelled'
}

function resetUnitSelection() {
  form.unit_id = ''
  units.value = []
}

function loadUnitsByGroup(groupId: number): Promise<void> {
  unitsLoading.value = true

  return new Promise((resolve, reject) => {
    const { data, onFetchResponse, onFetchError } = useapi(`/units?group_id=${groupId}`, {
      method: 'GET',
    }).json()

    onFetchResponse(() => {
      units.value = data.value?.data ?? []
      unitsLoading.value = false
      resolve()
    })

    onFetchError((ctx) => {
      units.value = []
      unitsLoading.value = false
      reject(ctx)
      return ctx
    })
  })
}

watch(
  () => form.group_id,
  async (newGroupId, oldGroupId) => {
    if (!newGroupId) {
      resetUnitSelection()
      return
    }

    if (newGroupId !== oldGroupId) {
      form.unit_id = ''
    }

    try {
      await loadUnitsByGroup(Number(newGroupId))
    } catch (ctx: any) {
      formError.value = extractErrorMessage(
        ctx?.data,
        'No se pudieron cargar las unidades del grupo seleccionado.',
      )
    }
  },
)

function openCreateModal() {
  resetForm()
  showModal.value = true
}

async function openEditModal(assignment: AssignmentItem) {
  resetForm()
  isEditMode.value = true
  selectedAssignmentId.value = assignment.id
  showModal.value = true

  const { data, onFetchResponse, onFetchError } = useapi(`/assignments/${assignment.id}`, {
    method: 'GET',
  }).json()

  onFetchResponse(async () => {
    const detail = data.value?.data as AssignmentItem | undefined

    if (!detail) {
      formError.value = 'No se pudo cargar el detalle de la tarea.'
      return
    }

    form.title = detail.title ?? ''
    form.description = detail.description ?? ''
    form.start_date = toInputDateTimeValue(detail.start_date)
    form.end_date = toInputDateTimeValue(detail.end_date)
    form.status = detail.status ?? 'Activa'
    form.group_id = detail.group?.id ?? ''
    existingFiles.value = detail.files ?? []

    if (detail.group?.id) {
      try {
        await loadUnitsByGroup(detail.group.id)
        form.unit_id = detail.unit?.id ?? ''
      } catch (ctx: any) {
        formError.value = extractErrorMessage(
          ctx?.data,
          'No se pudieron cargar las unidades de esta tarea.',
        )
      }
    }
  })

  onFetchError((ctx) => {
    formError.value = extractErrorMessage(
      ctx.data,
      'No se pudo cargar la tarea.',
    )
    return ctx
  })
}

function validateForm() {
  formError.value = ''

  if (!form.title.trim()) {
    formError.value = 'El título es obligatorio.'
    return false
  }

  if (!form.description.trim()) {
    formError.value = 'La descripción es obligatoria.'
    return false
  }

  if (!form.start_date) {
    formError.value = 'La fecha de inicio es obligatoria.'
    return false
  }

  if (!form.end_date) {
    formError.value = 'La fecha de entrega es obligatoria.'
    return false
  }

  if (new Date(form.end_date) <= new Date(form.start_date)) {
    formError.value = 'La fecha de entrega debe ser posterior a la fecha de inicio.'
    return false
  }

  if (!form.status) {
    formError.value = 'Debes seleccionar un estado.'
    return false
  }

  if (!form.group_id) {
    formError.value = 'Debes seleccionar un grupo.'
    return false
  }

  if (!form.unit_id) {
    formError.value = 'Debes seleccionar una unidad.'
    return false
  }

  return true
}

function buildFormData() {
  const payload = new FormData()

  payload.append('title', form.title.trim())
  payload.append('description', form.description.trim())
  payload.append('start_date', form.start_date.replace('T', ' ') + ':00')
  payload.append('end_date', form.end_date.replace('T', ' ') + ':00')
  payload.append('status', form.status)
  payload.append('group_id', String(form.group_id))
  payload.append('unit_id', String(form.unit_id))

  selectedFiles.value.forEach((file) => {
    payload.append('files[]', file)
  })

  return payload
}

function onFilesChange(event: Event) {
  const target = event.target as HTMLInputElement
  const newFiles = target.files ? Array.from(target.files) : []

  if (!newFiles.length) return

  selectedFiles.value = [...selectedFiles.value, ...newFiles]
  resetFileInput()
}

function removeSelectedFile(index: number) {
  selectedFiles.value = selectedFiles.value.filter((_, i) => i !== index)
}

async function submitForm() {
  if (!validateForm()) return

  submitting.value = true
  formError.value = ''

  const baseUrl = import.meta.env.VITE_API_URL ?? 'https://api.sutando-user.me/api'
  const payload = buildFormData()

  try {
    let res: Response

    if (isEditMode.value && selectedAssignmentId.value) {
      payload.append('_method', 'PUT')

      res = await fetch(`${baseUrl}/assignments/${selectedAssignmentId.value}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${ua.credentials?.token}`,
          Accept: 'application/json',
        },
        body: payload,
      })
    } else {
      res = await fetch(`${baseUrl}/assignments`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${ua.credentials?.token}`,
          Accept: 'application/json',
        },
        body: payload,
      })
    }

    const text = await res.text()
    const json = text ? JSON.parse(text) : {}

    if (!res.ok) {
      formError.value =
        json?.errors
          ? Object.values(json.errors).flat().join(' ')
          : json?.message || 'Ocurrió un error al guardar la tarea.'
      submitting.value = false
      return
    }

    await reloadAssignments()
    alert(
      json?.message ||
        (isEditMode.value
          ? 'Tarea actualizada exitosamente'
          : 'Tarea creada exitosamente'),
    )

    closeModal()
    submitting.value = false
  } catch (e) {
    console.error('[submitAssignment] error →', e)
    formError.value = 'Ocurrió un error inesperado al guardar la tarea.'
    submitting.value = false
  }
}

function setAssignmentStatus(assignment: AssignmentItem, nextStatus: 'Activa' | 'Cerrada' | 'Cancelada') {
  const actionText =
    nextStatus === 'Cancelada'
      ? 'cancelar'
      : nextStatus === 'Cerrada'
        ? 'cerrar'
        : 'reactivar'

  const confirmed = window.confirm(
    `¿Seguro que quieres ${actionText} la tarea "${assignment.title}"?`,
  )

  if (!confirmed) return

  actionLoadingId.value = assignment.id

  const payload = {
    status: nextStatus,
  }

  const { data, onFetchResponse, onFetchError } = useapi(`/assignments/${assignment.id}`, {
    method: 'PUT',
  })
    .put(payload)
    .json()

  onFetchResponse(async () => {
    await reloadAssignments()
    alert(data.value?.message || 'Estado de la tarea actualizado exitosamente')
    actionLoadingId.value = null
  })

  onFetchError((ctx) => {
    alert(
      extractErrorMessage(
        ctx.data,
        'No se pudo actualizar el estado de la tarea.',
      ),
    )
    actionLoadingId.value = null
    return ctx
  })
}

function cancelAssignmentFromDelete(assignment: AssignmentItem) {
  const confirmed = window.confirm(
    `¿Seguro que quieres cancelar la tarea "${assignment.title}"?`,
  )

  if (!confirmed) return

  actionLoadingId.value = assignment.id

  const { data, onFetchResponse, onFetchError } = useapi(`/assignments/${assignment.id}`, {
    method: 'DELETE',
  })
    .delete()
    .json()

  onFetchResponse(async () => {
    await reloadAssignments()
    alert(data.value?.message || 'Tarea cancelada exitosamente')
    actionLoadingId.value = null
  })

  onFetchError((ctx) => {
    alert(
      extractErrorMessage(
        ctx.data,
        'No se pudo cancelar la tarea.',
      ),
    )
    actionLoadingId.value = null
    return ctx
  })
}
</script>

<template>
  <AdminNavBar>
    <div class="home-wrapper">
      <h1 class="titulo">Gestión de Tareas</h1>
      <p class="subtitulo">
        Administra las tareas del sistema,
        <strong>{{ ua.credentials?.user.name }}</strong>
      </p>

      <section class="panel">
        <div class="panel-header">
          <div>
            <h2>Tareas del sistema</h2>
            <p>Consulta, crea, edita y administra el estado de las tareas.</p>
          </div>

          <button class="btn primary" @click="openCreateModal">
            Crear tarea
          </button>
        </div>

        <div class="filters">
          <input
            v-model="filters.search"
            type="text"
            class="input"
            placeholder="Buscar por título, descripción, grupo, unidad, estado o archivo..."
          />

          <button class="btn secondary" @click="clearFilters">
            Limpiar
          </button>
        </div>

        <div v-if="assignmentsLoading || groupsLoading" class="state">
          Cargando tareas...
        </div>

        <div v-else-if="assignmentsError || groupsError" class="state error">
          {{ assignmentsError?.message || groupsError?.message || 'Error al cargar tareas' }}
        </div>

        <div v-else>
          <div class="table-wrapper">
            <table class="tasks-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tarea</th>
                  <th>Grupo</th>
                  <th>Unidad</th>
                  <th>Archivos</th>
                  <th>Estado</th>
                  <th>Inicio</th>
                  <th>Entrega</th>
                  <th>Entregas</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>
                <tr v-if="filteredAssignments.length === 0">
                  <td colspan="10" class="empty-cell">
                    No hay tareas para mostrar.
                  </td>
                </tr>

                <tr v-for="assignment in filteredAssignments" :key="assignment.id">
                  <td>{{ assignment.id }}</td>

                  <td>
                    <div class="task-title">{{ assignment.title }}</div>
                    <div class="task-description">{{ assignment.description }}</div>
                  </td>

                  <td>{{ formatGroup(assignment.group) }}</td>
                  <td>{{ formatUnit(assignment.unit) }}</td>

                  <td>
                    <div v-if="assignment.files?.length" class="files-chip-list">
                      <button
                        v-for="file in assignment.files"
                        :key="file.id"
                        type="button"
                        class="file-chip file-chip-link file-chip-button"
                        @click="openFile(file)"
                      >
                        {{ file.file_name }}
                      </button>
                    </div>
                    <span v-else class="no-files">Sin archivos</span>
                  </td>

                  <td>
                    <span :class="statusClass(assignment.status)">
                      {{ assignment.status }}
                    </span>
                  </td>

                  <td>{{ formatDate(assignment.start_date) }}</td>
                  <td>{{ formatDate(assignment.end_date) }}</td>

                  <td>
                    <span class="count-badge">
                      {{ assignment.submissions_count ?? 0 }}
                    </span>
                  </td>

                  <td>
                    <div class="actions">
                      <button class="btn-action edit" @click="openEditModal(assignment)">
                        Editar
                      </button>

                      <button
                        v-if="assignment.status === 'Activa'"
                        class="btn-action close"
                        :disabled="actionLoadingId === assignment.id"
                        @click="setAssignmentStatus(assignment, 'Cerrada')"
                      >
                        {{ actionLoadingId === assignment.id ? 'Guardando...' : 'Cerrar' }}
                      </button>

                      <button
                        v-if="assignment.status === 'Cerrada' || assignment.status === 'Cancelada'"
                        class="btn-action reactivate"
                        :disabled="actionLoadingId === assignment.id"
                        @click="setAssignmentStatus(assignment, 'Activa')"
                      >
                        {{ actionLoadingId === assignment.id ? 'Guardando...' : 'Reactivar' }}
                      </button>

                      <button
                        v-if="assignment.status !== 'Cancelada'"
                        class="btn-action cancel"
                        :disabled="actionLoadingId === assignment.id"
                        @click="cancelAssignmentFromDelete(assignment)"
                      >
                        {{ actionLoadingId === assignment.id ? 'Guardando...' : 'Cancelar' }}
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
        <div class="modal-card">
          <div class="modal-header">
            <h2>{{ isEditMode ? 'Editar tarea' : 'Crear tarea' }}</h2>
            <button class="close-btn" type="button" @click="closeModal">✕</button>
          </div>

          <form class="task-form" @submit.prevent="submitForm">
            <div v-if="formError" class="state error form-state">
              {{ formError }}
            </div>

            <div class="form-grid">
              <div class="field">
                <label>Título</label>
                <input v-model="form.title" type="text" class="input" />
              </div>

              <div class="field">
                <label>Estado</label>
                <select v-model="form.status" class="input">
                  <option value="">Selecciona un estado</option>
                  <option v-for="status in statusOptions" :key="status" :value="status">
                    {{ status }}
                  </option>
                </select>
              </div>

              <div class="field">
                <label>Grupo</label>
                <select v-model="form.group_id" class="input">
                  <option value="">Selecciona un grupo</option>
                  <option v-for="group in availableGroups" :key="group.id" :value="group.id">
                    {{ group.name }}
                  </option>
                </select>
              </div>

              <div class="field">
                <label>Unidad</label>
                <select v-model="form.unit_id" class="input" :disabled="!form.group_id || unitsLoading">
                  <option value="">
                    {{
                      !form.group_id
                        ? 'Primero selecciona un grupo'
                        : unitsLoading
                          ? 'Cargando unidades...'
                          : 'Selecciona una unidad'
                    }}
                  </option>
                  <option v-for="unit in units" :key="unit.id" :value="unit.id">
                    {{ unit.name }}
                  </option>
                </select>
              </div>

              <div class="field">
                <label>Fecha de inicio</label>
                <input v-model="form.start_date" type="datetime-local" class="input" />
              </div>

              <div class="field">
                <label>Fecha de entrega</label>
                <input v-model="form.end_date" type="datetime-local" class="input" />
              </div>

              <div class="field full-width">
                <label>Descripción</label>
                <textarea
                  v-model="form.description"
                  class="input textarea"
                  rows="5"
                  placeholder="Describe la tarea..."
                ></textarea>
              </div>

              <div class="field full-width">
                <label>Archivos adjuntos (opcional)</label>
                <input
                  ref="fileInputRef"
                  type="file"
                  class="input"
                  multiple
                  @change="onFilesChange"
                />

                <div v-if="selectedFiles.length" class="selected-files-box">
                  <div class="files-title">Archivos nuevos seleccionados</div>

                  <div class="selected-files-list">
                    <div
                      v-for="(file, index) in selectedFiles"
                      :key="`${file.name}-${index}`"
                      class="selected-file-item"
                    >
                      <span>{{ file.name }}</span>
                      <button
                        type="button"
                        class="remove-file-btn"
                        @click="removeSelectedFile(index)"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                </div>

                <div v-if="isEditMode && existingFiles.length" class="existing-files-box">
                  <div class="files-title">Archivos actuales</div>

                  <div class="existing-files-list">
                    <button
                      v-for="file in existingFiles"
                      :key="file.id"
                      type="button"
                      class="file-chip existing file-chip-link file-chip-button"
                      @click="openFile(file)"
                    >
                      {{ file.file_name }}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div class="form-actions">
              <button type="button" class="btn secondary" @click="closeModal">
                Cancelar
              </button>

              <button type="submit" class="btn primary" :disabled="submitting">
                {{ submitting ? 'Guardando...' : isEditMode ? 'Actualizar' : 'Crear' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </AdminNavBar>
</template>

<style scoped>
.home-wrapper {
  color: var(--color-Texto);
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.titulo {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--color-AzulCuatro);
  margin-bottom: 8px;
}

.subtitulo {
  font-size: 1rem;
  color: var(--color-OscuroAzulado);
  margin: 0;
}

.panel {
  background: var(--color-Blanco);
  border-radius: 18px;
  padding: 20px;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 18px;
  flex-wrap: wrap;
}

.panel-header h2 {
  margin: 0 0 6px;
  color: var(--color-AzulCuatro);
}

.panel-header p {
  margin: 0;
  color: var(--color-OscuroAzulado);
}

.filters {
  display: grid;
  grid-template-columns: minmax(220px, 1fr) auto;
  gap: 12px;
  margin-bottom: 20px;
}

.input {
  width: 100%;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid #cfd8e3;
  background: #fff;
  font-size: 0.95rem;
  box-sizing: border-box;
  font-family: inherit;
}

.input:focus {
  outline: none;
  border-color: var(--color-AzulDos);
  box-shadow: 0 0 0 3px rgba(75, 164, 223, 0.15);
}

.textarea {
  resize: vertical;
  min-height: 120px;
}

.btn {
  border: none;
  border-radius: 10px;
  padding: 10px 14px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s ease;
}

.btn:disabled,
.btn-action:disabled,
.close-btn:disabled,
.remove-file-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn.primary {
  background: var(--color-AzulTres);
  color: white;
}

.btn.primary:hover:not(:disabled) {
  background: var(--color-AzulCuatro);
}

.btn.secondary {
  background: #e9f2f9;
  color: var(--color-AzulCuatro);
}

.btn.secondary:hover:not(:disabled) {
  background: #dcecf8;
}

.state {
  padding: 20px;
  text-align: center;
  color: var(--color-OscuroAzulado);
}

.state.error {
  color: #c0392b;
  font-weight: 600;
}

.form-state {
  margin-bottom: 16px;
  border-radius: 10px;
  background: #fff1f1;
  border: 1px solid #f5c2c2;
  padding: 12px;
}

.table-wrapper {
  width: 100%;
  overflow-x: auto;
}

.tasks-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 1400px;
}

.tasks-table thead {
  background: #eef6fc;
}

.tasks-table th,
.tasks-table td {
  padding: 12px 10px;
  text-align: left;
  border-bottom: 1px solid #e6edf3;
  font-size: 0.95rem;
  vertical-align: middle;
}

.tasks-table th {
  color: var(--color-AzulCuatro);
  font-weight: 700;
}

.tasks-table tbody tr:hover {
  background: #f9fcff;
}

.task-title {
  font-weight: 700;
  color: var(--color-OscuroAzulado);
}

.task-description {
  margin-top: 4px;
  color: #64748b;
  font-size: 0.88rem;
  max-width: 320px;
  white-space: normal;
}

.count-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 34px;
  padding: 5px 10px;
  border-radius: 999px;
  background: #e0f2fe;
  color: #075985;
  font-weight: 700;
  font-size: 0.85rem;
}

.files-chip-list,
.existing-files-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.file-chip {
  display: inline-flex;
  align-items: center;
  padding: 5px 10px;
  border-radius: 999px;
  background: #e0f2fe;
  color: #075985;
  font-weight: 700;
  font-size: 0.8rem;
}

.file-chip.existing {
  background: #ede9fe;
  color: #5b21b6;
}

.file-chip-link {
  text-decoration: none;
}

.file-chip-link:hover {
  text-decoration: underline;
}

.file-chip-button {
  border: none;
  cursor: pointer;
  font-family: inherit;
}

.no-files {
  color: #6b7280;
  font-size: 0.9rem;
}

.empty-cell {
  text-align: center;
  color: #6b7280;
  padding: 24px;
}

.tag {
  display: inline-block;
  padding: 5px 10px;
  border-radius: 999px;
  font-size: 0.83rem;
  font-weight: 700;
  background: #edf2f7;
  color: #334155;
}

.tag.active {
  background: #dcfce7;
  color: #166534;
}

.tag.closed {
  background: #fef3c7;
  color: #92400e;
}

.tag.cancelled {
  background: #fee2e2;
  color: #b91c1c;
}

.actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.btn-action {
  border: none;
  border-radius: 10px;
  padding: 8px 12px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s ease;
}

.btn-action.edit {
  background: #dbeafe;
  color: #1d4ed8;
}

.btn-action.edit:hover:not(:disabled) {
  background: #bfdbfe;
}

.btn-action.close {
  background: #fef3c7;
  color: #92400e;
}

.btn-action.close:hover:not(:disabled) {
  background: #fde68a;
}

.btn-action.reactivate {
  background: #dcfce7;
  color: #166534;
}

.btn-action.reactivate:hover:not(:disabled) {
  background: #bbf7d0;
}

.btn-action.cancel {
  background: #fee2e2;
  color: #b91c1c;
}

.btn-action.cancel:hover:not(:disabled) {
  background: #fecaca;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(17, 19, 27, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  z-index: 999;
  overflow-y: auto;
}

.modal-card {
  width: 100%;
  max-width: 860px;
  max-height: 90vh;
  background: white;
  border-radius: 18px;
  box-shadow: 0 20px 45px rgba(0, 0, 0, 0.22);
  overflow-x: hidden;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 20px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h2 {
  margin: 0;
  color: var(--color-AzulCuatro);
}

.close-btn {
  background: transparent;
  border: none;
  font-size: 1.1rem;
  cursor: pointer;
  color: #64748b;
}

.task-form {
  padding: 20px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.full-width {
  grid-column: 1 / -1;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field label {
  font-weight: 700;
  color: #111827;
}

.selected-files-box,
.existing-files-box {
  margin-top: 12px;
  padding: 12px;
  border-radius: 12px;
  background: #f8fbff;
  border: 1px solid #e2edf7;
}

.files-title {
  font-weight: 700;
  color: var(--color-AzulCuatro);
  margin-bottom: 8px;
  font-size: 0.9rem;
}

.selected-files-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.selected-file-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  background: white;
  border: 1px solid #e5edf5;
  border-radius: 10px;
  font-size: 0.9rem;
}

.remove-file-btn {
  border: none;
  background: #fee2e2;
  color: #b91c1c;
  width: 28px;
  height: 28px;
  border-radius: 999px;
  cursor: pointer;
  font-weight: 700;
}

.form-actions {
  margin-top: 18px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

@media (max-width: 768px) {
  .panel {
    padding: 15px;
  }

  .titulo {
    font-size: 1.5rem;
  }

  .filters {
    grid-template-columns: 1fr;
  }

  .tasks-table {
    min-width: 1200px;
  }

  .panel-header {
    flex-direction: column;
    align-items: stretch;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column;
  }

  .form-actions .btn {
    width: 100%;
  }
}
</style>
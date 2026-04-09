<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
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
  students?: UserItem[]
  students_count?: number
  assignments_count?: number
  created_at?: string | null
  updated_at?: string | null
}

type GroupForm = {
  name: string
  description: string
  period_id: number | ''
  owner: number | ''
}

type ApiErrorPayload = {
  message?: string
  errors?: Record<string, string[]>
}

const showModal = ref(false)
const isEditMode = ref(false)
const selectedGroupId = ref<number | null>(null)
const submitting = ref(false)
const deletingId = ref<number | null>(null)
const formError = ref('')

const showStudentsModal = ref(false)
const selectedGroupForStudents = ref<GroupItem | null>(null)
const studentsModalLoading = ref(false)
const studentsModalError = ref('')
const currentStudents = ref<UserItem[]>([])
const availableStudents = ref<UserItem[]>([])
const selectedAvailableStudentId = ref<number | ''>('')
const studentSubmitting = ref(false)
const removingStudentId = ref<number | null>(null)

const currentStudentsSearch = ref('')
const availableStudentsSearch = ref('')

const initialForm = (): GroupForm => ({
  name: '',
  description: '',
  period_id: '',
  owner: '',
})

const form = reactive<GroupForm>(initialForm())

const filters = reactive({
  search: '',
})

const authRoleDescription = computed(() =>
  (ua.credentials?.user.role?.description ?? '').trim().toLowerCase(),
)

const isAdmin = computed(() => {
  return authRoleDescription.value === 'admin' || ua.credentials?.user.role?.id === 1
})

const {
  data: groupsData,
  error: groupsError,
  isFetching: groupsLoading,
  execute: reloadGroups,
} = useapi('/groups', {
  method: 'GET',
}).json()

const {
  data: periodsData,
  error: periodsError,
  isFetching: periodsLoading,
  execute: reloadPeriods,
} = useapi('/periods', {
  method: 'GET',
}).json()

const {
  data: usersData,
  error: usersError,
  isFetching: usersLoading,
  execute: reloadUsers,
} = useapi('/users', {
  method: 'GET',
}).json()

const groups = computed<GroupItem[]>(() => groupsData.value?.data ?? [])
const periods = computed<PeriodItem[]>(() => periodsData.value?.data ?? [])
const users = computed<UserItem[]>(() => usersData.value?.data ?? [])

const teacherCandidates = computed<UserItem[]>(() => {
  return users.value.filter((user) => {
    const roleDescription = (user.role?.description ?? '').trim().toLowerCase()
    return user.active && (roleDescription === 'teacher' || roleDescription === 'maestro')
  })
})

const filteredGroups = computed(() => {
  const term = filters.search.trim().toLowerCase()

  if (!term) return groups.value

  return groups.value.filter((group) => {
    const ownerName = `${group.owner?.name ?? ''} ${group.owner?.lastname ?? ''}`.toLowerCase()
    const periodLabel = `${group.period?.name ?? ''} ${group.period?.year ?? ''}`.toLowerCase()
    const status = group.active ? 'activo' : 'inactivo'

    return (
      (group.name ?? '').toLowerCase().includes(term) ||
      (group.description ?? '').toLowerCase().includes(term) ||
      ownerName.includes(term) ||
      periodLabel.includes(term) ||
      status.includes(term)
    )
  })
})

const filteredCurrentStudents = computed(() => {
  const term = currentStudentsSearch.value.trim().toLowerCase()

  if (!term) return currentStudents.value

  return currentStudents.value.filter((student) => {
    const fullName = `${student.name ?? ''} ${student.lastname ?? ''}`.toLowerCase()
    const email = (student.email ?? '').toLowerCase()

    return fullName.includes(term) || email.includes(term)
  })
})

const filteredAvailableStudents = computed(() => {
  const term = availableStudentsSearch.value.trim().toLowerCase()

  if (!term) return availableStudents.value

  return availableStudents.value.filter((student) => {
    const fullName = `${student.name ?? ''} ${student.lastname ?? ''}`.toLowerCase()
    const email = (student.email ?? '').toLowerCase()

    return fullName.includes(term) || email.includes(term)
  })
})

function extractErrorMessage(data: unknown, fallback: string) {
  const payload = (data ?? {}) as ApiErrorPayload

  if (payload.errors) {
    return Object.values(payload.errors).flat().join(' ')
  }

  return payload.message || fallback
}

function resetForm() {
  Object.assign(form, initialForm())
  selectedGroupId.value = null
  isEditMode.value = false
  formError.value = ''
}

function openCreateModal() {
  resetForm()
  showModal.value = true
}

function openEditModal(group: GroupItem) {
  resetForm()
  isEditMode.value = true
  selectedGroupId.value = group.id

  form.name = group.name ?? ''
  form.description = group.description ?? ''
  form.period_id = group.period?.id ?? ''
  form.owner = group.owner?.id ?? ''

  showModal.value = true
}

function closeModal() {
  showModal.value = false
  resetForm()
}

function clearFilters() {
  filters.search = ''
}

function statusLabel(active: boolean) {
  return active ? 'Activo' : 'Inactivo'
}

function statusClass(active: boolean) {
  return active ? 'tag active' : 'tag inactive'
}

function formatDate(date?: string | null) {
  if (!date) return '—'

  return new Date(date.replace(' ', 'T')).toLocaleString('es-MX', {
    dateStyle: 'short',
    timeStyle: 'short',
  })
}

function formatPeriod(period?: PeriodItem | null) {
  if (!period) return 'Sin periodo'
  return `${period.name} (${period.year})`
}

function formatTeacher(user?: UserItem | null) {
  if (!user) return 'Sin asignar'
  return `${user.name} ${user.lastname}`.trim()
}

function validateForm() {
  formError.value = ''

  if (!form.name.trim()) {
    formError.value = 'El nombre del grupo es obligatorio.'
    return false
  }

  if (!form.period_id) {
    formError.value = 'Debes seleccionar un periodo.'
    return false
  }

  if (isAdmin.value && !form.owner) {
    formError.value = 'Debes seleccionar un maestro responsable.'
    return false
  }

  return true
}

function submitForm() {
  if (!validateForm()) return

  submitting.value = true
  formError.value = ''

  const payload: Record<string, unknown> = {
    name: form.name.trim(),
    description: form.description.trim() || null,
    period_id: Number(form.period_id),
  }

  if (isAdmin.value && form.owner) {
    payload.owner = Number(form.owner)
  }

  if (!isEditMode.value) {
    payload.active = true
  }

  if (isEditMode.value && selectedGroupId.value) {
    const { data, onFetchResponse, onFetchError } = useapi(`/groups/${selectedGroupId.value}`, {
      method: 'PUT',
    })
      .put(payload)
      .json()

    onFetchResponse(async () => {
      await reloadGroups()
      alert(data.value?.message || 'Grupo actualizado exitosamente')
      closeModal()
      submitting.value = false
    })

    onFetchError((ctx) => {
      formError.value = extractErrorMessage(
        ctx.data,
        'Ocurrió un error al guardar el grupo.',
      )
      submitting.value = false
      return ctx
    })

    return
  }

  const { data, onFetchResponse, onFetchError } = useapi('/groups', {
    method: 'POST',
  })
    .post(payload)
    .json()

  onFetchResponse(async () => {
    await reloadGroups()
    alert(data.value?.message || 'Grupo creado exitosamente')
    closeModal()
    submitting.value = false
  })

  onFetchError((ctx) => {
    formError.value = extractErrorMessage(
      ctx.data,
      'Ocurrió un error al guardar el grupo.',
    )
    submitting.value = false
    return ctx
  })
}

function toggleGroupStatus(group: GroupItem) {
  const isCurrentlyActive = Boolean(group.active)

  const confirmed = window.confirm(
    isCurrentlyActive
      ? `¿Seguro que quieres desactivar el grupo "${group.name}"?`
      : `¿Seguro que quieres reactivar el grupo "${group.name}"?`,
  )

  if (!confirmed) return

  deletingId.value = group.id

  const payload: Record<string, unknown> = {
    active: !isCurrentlyActive,
  }

  const { data, onFetchResponse, onFetchError } = useapi(`/groups/${group.id}`, {
    method: 'PUT',
  })
    .put(payload)
    .json()

  onFetchResponse(async () => {
    await reloadGroups()

    alert(
      data.value?.message ||
        (isCurrentlyActive
          ? 'Grupo desactivado exitosamente'
          : 'Grupo reactivado exitosamente'),
    )

    deletingId.value = null
  })

  onFetchError((ctx) => {
    alert(
      extractErrorMessage(
        ctx.data,
        'No se pudo actualizar el estado del grupo.',
      ),
    )

    deletingId.value = null
    return ctx
  })
}

function closeStudentsModal() {
  showStudentsModal.value = false
  selectedGroupForStudents.value = null
  currentStudents.value = []
  availableStudents.value = []
  selectedAvailableStudentId.value = ''
  currentStudentsSearch.value = ''
  availableStudentsSearch.value = ''
  studentsModalError.value = ''
  studentsModalLoading.value = false
  studentSubmitting.value = false
  removingStudentId.value = null
}

function loadGroupStudents(groupId: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const { data, onFetchResponse, onFetchError } = useapi(`/groups/${groupId}`, {
      method: 'GET',
    }).json()

    onFetchResponse(() => {
      currentStudents.value = data.value?.data?.students ?? []
      resolve()
    })

    onFetchError((ctx) => {
      reject(ctx)
      return ctx
    })
  })
}

function loadAvailableStudents(groupId: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const { data, onFetchResponse, onFetchError } = useapi(`/groups/available-students/${groupId}`, {
      method: 'GET',
    }).json()

    onFetchResponse(() => {
      availableStudents.value = data.value?.data ?? []
      resolve()
    })

    onFetchError((ctx) => {
      reject(ctx)
      return ctx
    })
  })
}

async function openStudentsModal(group: GroupItem) {
  showStudentsModal.value = true
  selectedGroupForStudents.value = group
  selectedAvailableStudentId.value = ''
  currentStudentsSearch.value = ''
  availableStudentsSearch.value = ''
  studentsModalError.value = ''
  studentsModalLoading.value = true
  currentStudents.value = []
  availableStudents.value = []

  try {
    await Promise.all([
      loadGroupStudents(group.id),
      loadAvailableStudents(group.id),
    ])
  } catch (ctx: any) {
    studentsModalError.value = extractErrorMessage(
      ctx?.data,
      'No se pudo cargar la gestión de alumnos.',
    )
  } finally {
    studentsModalLoading.value = false
  }
}

async function refreshStudentsData() {
  if (!selectedGroupForStudents.value) return

  studentsModalLoading.value = true
  studentsModalError.value = ''

  try {
    await Promise.all([
      loadGroupStudents(selectedGroupForStudents.value.id),
      loadAvailableStudents(selectedGroupForStudents.value.id),
      reloadGroups(),
    ])
  } catch (ctx: any) {
    studentsModalError.value = extractErrorMessage(
      ctx?.data,
      'No se pudo actualizar la información de alumnos.',
    )
  } finally {
    studentsModalLoading.value = false
  }
}

function addStudentToGroup() {
  if (!selectedGroupForStudents.value || !selectedAvailableStudentId.value) {
    studentsModalError.value = 'Debes seleccionar un alumno disponible.'
    return
  }

  studentSubmitting.value = true
  studentsModalError.value = ''

  const payload = {
    student_id: Number(selectedAvailableStudentId.value),
  }

  const { data, onFetchResponse, onFetchError } = useapi(
    `/groups/${selectedGroupForStudents.value.id}/students`,
    { method: 'POST' },
  )
    .post(payload)
    .json()

  onFetchResponse(async () => {
    alert(data.value?.message || 'Alumno agregado al grupo exitosamente')
    selectedAvailableStudentId.value = ''
    studentSubmitting.value = false
    await refreshStudentsData()
  })

  onFetchError((ctx) => {
    studentsModalError.value = extractErrorMessage(
      ctx.data,
      'No se pudo agregar el alumno al grupo.',
    )
    studentSubmitting.value = false
    return ctx
  })
}

function removeStudentFromGroup(student: UserItem) {
  if (!selectedGroupForStudents.value) return

  const confirmed = window.confirm(
    `¿Seguro que quieres remover a ${student.name} ${student.lastname} de este grupo?`,
  )

  if (!confirmed) return

  removingStudentId.value = student.id
  studentsModalError.value = ''

  const payload = {
    student_id: student.id,
  }

  const { data, onFetchResponse, onFetchError } = useapi(
    `/groups/${selectedGroupForStudents.value.id}/students`,
    { method: 'DELETE' },
  )
    .delete(payload)
    .json()

  onFetchResponse(async () => {
    alert(data.value?.message || 'Alumno removido del grupo exitosamente')
    removingStudentId.value = null
    await refreshStudentsData()
  })

  onFetchError((ctx) => {
    studentsModalError.value = extractErrorMessage(
      ctx.data,
      'No se pudo remover el alumno del grupo.',
    )
    removingStudentId.value = null
    return ctx
  })
}
</script>

<template>
  <AdminNavBar>
    <div class="home-wrapper">
      <h1 class="titulo">Gestión de Grupos</h1>
      <p class="subtitulo">
        Administra los grupos del sistema,
        <strong>{{ ua.credentials?.user.name }}</strong>
      </p>

      <section class="panel">
        <div class="panel-header">
          <div>
            <h2>Grupos del sistema</h2>
            <p>Consulta, crea, edita, desactiva y administra alumnos por grupo.</p>
          </div>

          <button class="btn primary" @click="openCreateModal">
            Crear grupo
          </button>
        </div>

        <div class="filters">
          <input
            v-model="filters.search"
            type="text"
            class="input"
            placeholder="Buscar por nombre, descripción, maestro, periodo o estado..."
          />

          <button class="btn secondary" @click="clearFilters">
            Limpiar
          </button>
        </div>

        <div v-if="groupsLoading || periodsLoading || (isAdmin && usersLoading)" class="state">
          Cargando grupos...
        </div>

        <div
          v-else-if="groupsError || periodsError || (isAdmin && usersError)"
          class="state error"
        >
          {{
            groupsError?.message ||
            periodsError?.message ||
            usersError?.message ||
            'Error al cargar grupos'
          }}
        </div>

        <div v-else>
          <div class="table-wrapper">
            <table class="groups-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Grupo</th>
                  <th>Maestro</th>
                  <th>Periodo</th>
                  <th>Alumnos</th>
                  <th>Tareas</th>
                  <th>Estado</th>
                  <th>Creado</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>
                <tr v-if="filteredGroups.length === 0">
                  <td colspan="9" class="empty-cell">
                    No hay grupos para mostrar.
                  </td>
                </tr>

                <tr v-for="group in filteredGroups" :key="group.id">
                  <td>{{ group.id }}</td>

                  <td>
                    <div class="group-name">{{ group.name }}</div>
                    <div class="group-description">
                      {{ group.description || 'Sin descripción' }}
                    </div>
                  </td>

                  <td>{{ formatTeacher(group.owner) }}</td>
                  <td>{{ formatPeriod(group.period) }}</td>

                  <td>
                    <span class="count-badge">
                      {{ group.students_count ?? 0 }}
                    </span>
                  </td>

                  <td>
                    <span class="count-badge tasks">
                      {{ group.assignments_count ?? 0 }}
                    </span>
                  </td>

                  <td>
                    <span :class="statusClass(Boolean(group.active))">
                      {{ statusLabel(Boolean(group.active)) }}
                    </span>
                  </td>

                  <td>{{ formatDate(group.created_at) }}</td>

                  <td>
                    <div class="actions">
                      <button class="btn-action edit" @click="openEditModal(group)">
                        Editar
                      </button>

                      <button class="btn-action manage" @click="openStudentsModal(group)">
                        Alumnos
                      </button>

                      <button
                        class="btn-action"
                        :class="Boolean(group.active) ? 'delete' : 'reactivate'"
                        :disabled="deletingId === group.id"
                        @click="toggleGroupStatus(group)"
                      >
                        {{
                          deletingId === group.id
                            ? 'Guardando...'
                            : Boolean(group.active)
                              ? 'Desactivar'
                              : 'Reactivar'
                        }}
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
            <h2>{{ isEditMode ? 'Editar grupo' : 'Crear grupo' }}</h2>
            <button class="close-btn" type="button" @click="closeModal">✕</button>
          </div>

          <form class="group-form" @submit.prevent="submitForm">
            <div v-if="formError" class="state error form-state">
              {{ formError }}
            </div>

            <div class="form-grid">
              <div class="field">
                <label>Nombre</label>
                <input v-model="form.name" type="text" class="input" />
              </div>

              <div class="field">
                <label>Periodo</label>
                <select v-model="form.period_id" class="input">
                  <option value="">Selecciona un periodo</option>
                  <option v-for="period in periods" :key="period.id" :value="period.id">
                    {{ period.name }} ({{ period.year }})
                  </option>
                </select>
              </div>

              <div v-if="isAdmin" class="field">
                <label>Maestro responsable</label>
                <select v-model="form.owner" class="input">
                  <option value="">Selecciona un maestro</option>
                  <option v-for="teacher in teacherCandidates" :key="teacher.id" :value="teacher.id">
                    {{ teacher.name }} {{ teacher.lastname }}
                  </option>
                </select>
              </div>

              <div class="field full-width">
                <label>Descripción</label>
                <textarea
                  v-model="form.description"
                  class="input textarea"
                  rows="4"
                  placeholder="Describe brevemente el grupo..."
                ></textarea>
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

      <div v-if="showStudentsModal" class="modal-overlay" @click.self="closeStudentsModal">
        <div class="modal-card students-modal">
          <div class="modal-header">
            <div>
              <h2>Gestionar alumnos</h2>
              <p class="modal-subtitle">
                {{ selectedGroupForStudents?.name || 'Grupo' }}
              </p>
            </div>
            <button class="close-btn" type="button" @click="closeStudentsModal">✕</button>
          </div>

          <div class="students-content">
            <div v-if="studentsModalError" class="state error form-state">
              {{ studentsModalError }}
            </div>

            <div v-if="studentsModalLoading" class="state">
              Cargando alumnos...
            </div>

            <template v-else>
              <div class="student-add-box">
                <h3>Agregar alumno</h3>

                <input
                  v-model="availableStudentsSearch"
                  type="text"
                  class="input"
                  placeholder="Buscar alumno disponible por nombre o correo..."
                />

                <div class="student-add-form">
                  <select v-model="selectedAvailableStudentId" class="input">
                    <option value="">Selecciona un alumno disponible</option>
                    <option
                      v-for="student in filteredAvailableStudents"
                      :key="student.id"
                      :value="student.id"
                    >
                      {{ student.name }} {{ student.lastname }}
                    </option>
                  </select>

                  <button
                    class="btn primary"
                    :disabled="studentSubmitting || selectedAvailableStudentId === ''"
                    @click="addStudentToGroup"
                  >
                    {{ studentSubmitting ? 'Agregando...' : 'Agregar' }}
                  </button>
                </div>
              </div>

              <div class="students-list-box">
                <h3>Alumnos inscritos</h3>

                <input
                  v-model="currentStudentsSearch"
                  type="text"
                  class="input"
                  placeholder="Buscar alumno inscrito por nombre o correo..."
                />

                <div v-if="currentStudents.length === 0" class="empty-students">
                  Este grupo no tiene alumnos inscritos todavía.
                </div>

                <div v-else-if="filteredCurrentStudents.length === 0" class="empty-students">
                  No hay alumnos inscritos que coincidan con la búsqueda.
                </div>

                <div v-else class="student-list">
                  <div v-for="student in filteredCurrentStudents" :key="student.id" class="student-item">
                    <div>
                      <div class="student-name">
                        {{ student.name }} {{ student.lastname }}
                      </div>
                      <div class="student-email">
                        {{ student.email }}
                      </div>
                    </div>

                    <button
                      class="btn-action delete"
                      :disabled="removingStudentId === student.id"
                      @click="removeStudentFromGroup(student)"
                    >
                      {{ removingStudentId === student.id ? 'Removiendo...' : 'Remover' }}
                    </button>
                  </div>
                </div>
              </div>
            </template>

            <div class="form-actions">
              <button type="button" class="btn secondary" @click="closeStudentsModal">
                Cerrar
              </button>
            </div>
          </div>
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
  min-height: 100px;
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
.close-btn:disabled {
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

.groups-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 1250px;
}

.groups-table thead {
  background: #eef6fc;
}

.groups-table th,
.groups-table td {
  padding: 12px 10px;
  text-align: left;
  border-bottom: 1px solid #e6edf3;
  font-size: 0.95rem;
  vertical-align: middle;
}

.groups-table th {
  color: var(--color-AzulCuatro);
  font-weight: 700;
}

.groups-table tbody tr:hover {
  background: #f9fcff;
}

.group-name {
  font-weight: 700;
  color: var(--color-OscuroAzulado);
}

.group-description {
  margin-top: 4px;
  color: #64748b;
  font-size: 0.88rem;
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

.count-badge.tasks {
  background: #ede9fe;
  color: #5b21b6;
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

.tag.inactive {
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

.btn-action.manage {
  background: #e0f2fe;
  color: #0369a1;
}

.btn-action.manage:hover:not(:disabled) {
  background: #bae6fd;
}

.btn-action.delete {
  background: #fee2e2;
  color: #b91c1c;
}

.btn-action.delete:hover:not(:disabled) {
  background: #fecaca;
}

.btn-action.reactivate {
  background: #dcfce7;
  color: #166534;
}

.btn-action.reactivate:hover:not(:disabled) {
  background: #bbf7d0;
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
}

.modal-card {
  width: 100%;
  max-width: 820px;
  background: white;
  border-radius: 18px;
  box-shadow: 0 20px 45px rgba(0, 0, 0, 0.22);
  overflow: hidden;
}

.students-modal {
  max-width: 900px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 18px 20px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h2 {
  margin: 0;
  color: var(--color-AzulCuatro);
}

.modal-subtitle {
  margin: 4px 0 0;
  color: var(--color-OscuroAzulado);
  font-size: 0.92rem;
}

.close-btn {
  background: transparent;
  border: none;
  font-size: 1.1rem;
  cursor: pointer;
  color: #64748b;
}

.group-form,
.students-content {
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

.form-actions {
  margin-top: 18px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.student-add-box,
.students-list-box {
  background: #f8fbff;
  border: 1px solid #e2edf7;
  border-radius: 16px;
  padding: 16px;
}

.student-add-box h3,
.students-list-box h3 {
  margin: 0 0 12px;
  color: var(--color-AzulCuatro);
}

.student-add-box .input,
.students-list-box .input {
  margin-bottom: 12px;
}

.student-add-form {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 12px;
  align-items: center;
}

.empty-students {
  color: #64748b;
  padding: 12px 0;
}

.student-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.student-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: white;
  border: 1px solid #e5edf5;
  border-radius: 12px;
}

.student-name {
  font-weight: 700;
  color: var(--color-OscuroAzulado);
}

.student-email {
  color: #64748b;
  font-size: 0.9rem;
  margin-top: 4px;
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

  .groups-table {
    min-width: 1100px;
  }

  .panel-header {
    flex-direction: column;
    align-items: stretch;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .student-add-form {
    grid-template-columns: 1fr;
  }

  .student-item {
    flex-direction: column;
    align-items: stretch;
  }

  .form-actions {
    flex-direction: column;
  }

  .form-actions .btn {
    width: 100%;
  }
}
</style>
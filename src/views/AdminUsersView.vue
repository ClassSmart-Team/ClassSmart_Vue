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
  cellphone: string | null
  active: boolean
  role?: Role | null
  created_at?: string | null
  updated_at?: string | null
}

type UserForm = {
  name: string
  lastname: string
  email: string
  cellphone: string
  password: string
  role_id: number | ''
  student_id: number | ''
}

type ApiErrorPayload = {
  message?: string
  errors?: Record<string, string[]>
}

const showModal = ref(false)
const isEditMode = ref(false)
const selectedUserId = ref<number | null>(null)
const submitting = ref(false)
const deletingId = ref<number | null>(null)
const formError = ref('')

const initialForm = (): UserForm => ({
  name: '',
  lastname: '',
  email: '',
  cellphone: '',
  password: '',
  role_id: '',
  student_id: '',
})

const form = reactive<UserForm>(initialForm())

const filters = reactive({
  search: '',
})

const {
  data: usersData,
  error: usersError,
  isFetching: usersLoading,
  execute: reloadUsers,
} = useapi('/users', {
  method: 'GET',
}).json()

const {
  data: rolesData,
  error: rolesError,
  isFetching: rolesLoading,
} = useapi('/roles', {
  method: 'GET',
}).json()

const users = computed<UserItem[]>(() => usersData.value?.data ?? [])
const roles = computed<Role[]>(() => rolesData.value?.data ?? [])

const filteredUsers = computed(() => {
  const term = filters.search.trim().toLowerCase()

  if (!term) return users.value

  return users.value.filter((user) => {
    const fullName = `${user.name ?? ''} ${user.lastname ?? ''}`.toLowerCase()
    const email = (user.email ?? '').toLowerCase()
    const cellphone = (user.cellphone ?? '').toLowerCase()
    const roleDescription = (user.role?.description ?? '').toLowerCase()
    const status = user.active ? 'activo' : 'inactivo'

    return (
      fullName.includes(term) ||
      email.includes(term) ||
      cellphone.includes(term) ||
      roleDescription.includes(term) ||
      status.includes(term)
    )
  })
})

const studentCandidates = computed<UserItem[]>(() => {
  return users.value.filter((user) => {
    const roleDescription = (user.role?.description ?? '').trim().toLowerCase()

    return (
      user.active &&
      (roleDescription === 'student' || roleDescription === 'estudiante')
    )
  })
})

const selectedRoleDescription = computed(() => {
  return roles.value.find((role) => role.id === form.role_id)?.description || 'Sin rol'
})

const isParentRoleSelected = computed(() => Number(form.role_id) === 4)

function extractErrorMessage(data: unknown, fallback: string) {
  const payload = (data ?? {}) as ApiErrorPayload

  if (payload.errors) {
    return Object.values(payload.errors).flat().join(' ')
  }

  return payload.message || fallback
}

/**
 * Reemplaza el usuario dentro de usersData con una NUEVA referencia de array
 * para forzar reactividad consistente en la tabla.
 */
function syncUserInList(updatedUser: UserItem) {
  if (!usersData.value) return

  const currentUsers = Array.isArray(usersData.value.data) ? [...usersData.value.data] : []
  const index = currentUsers.findIndex((user: UserItem) => user.id === updatedUser.id)

  if (index === -1) return

  currentUsers[index] = {
    ...currentUsers[index],
    ...updatedUser,
  }

  usersData.value = {
    ...usersData.value,
    data: currentUsers,
  }
}

function resetForm() {
  Object.assign(form, initialForm())
  selectedUserId.value = null
  isEditMode.value = false
  formError.value = ''
}

function openCreateModal() {
  resetForm()
  showModal.value = true
}

function openEditModal(user: UserItem) {
  resetForm()
  isEditMode.value = true
  selectedUserId.value = user.id

  form.name = user.name ?? ''
  form.lastname = user.lastname ?? ''
  form.email = user.email ?? ''
  form.cellphone = user.cellphone ?? ''
  form.role_id = user.role?.id ?? ''
  form.password = ''
  form.student_id = ''

  showModal.value = true
}

function closeModal() {
  showModal.value = false
  resetForm()
}

function clearFilters() {
  filters.search = ''
}

function roleLabel(role?: Role | null) {
  return role?.description || 'Sin rol'
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

function onRoleChange() {
  if (!isParentRoleSelected.value) {
    form.student_id = ''
  }
}

function validateForm() {
  formError.value = ''

  if (!form.name.trim()) {
    formError.value = 'El nombre es obligatorio.'
    return false
  }

  if (!form.email.trim()) {
    formError.value = 'El correo es obligatorio.'
    return false
  }

  if (!isEditMode.value && !form.role_id) {
    formError.value = 'Debes seleccionar un rol.'
    return false
  }

  if (!isEditMode.value && !form.password.trim()) {
    formError.value = 'La contraseña es obligatoria al crear un usuario.'
    return false
  }

  if (!isEditMode.value && isParentRoleSelected.value && form.student_id === '') {
    formError.value = 'Si el rol es Padre, debes seleccionar un alumno.'
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
    lastname: form.lastname.trim() || null,
    email: form.email.trim(),
    cellphone: form.cellphone.trim() || null,
  }

  if (!isEditMode.value) {
    payload.role_id = Number(form.role_id)
    payload.active = true
  }

  if (form.password.trim()) {
    payload.password = form.password.trim()
  }

  if (!isEditMode.value && isParentRoleSelected.value && form.student_id !== '') {
    payload.student_id = Number(form.student_id)
  }

  if (isEditMode.value && selectedUserId.value) {
    const { data, onFetchResponse, onFetchError } = useapi(`/users/${selectedUserId.value}`, {
      method: 'PUT',
    })
      .put(payload)
      .json()

    onFetchResponse(async () => {
      await reloadUsers()
      alert(data.value?.message || 'Usuario actualizado exitosamente')
      closeModal()
      submitting.value = false
    })

    onFetchError((ctx) => {
      formError.value = extractErrorMessage(
        ctx.data,
        'Ocurrió un error al guardar el usuario.',
      )
      submitting.value = false
      return ctx
    })

    return
  }

  const { data, onFetchResponse, onFetchError } = useapi('/users', {
    method: 'POST',
  })
    .post(payload)
    .json()

  onFetchResponse(async () => {
    await reloadUsers()
    alert(data.value?.message || 'Usuario creado exitosamente')
    closeModal()
    submitting.value = false
  })

  onFetchError((ctx) => {
    formError.value = extractErrorMessage(
      ctx.data,
      'Ocurrió un error al guardar el usuario.',
    )
    submitting.value = false
    return ctx
  })
}

function toggleUserStatus(user: UserItem) {
  const isCurrentlyActive = Boolean(user.active)

  const confirmed = window.confirm(
    isCurrentlyActive
      ? `¿Seguro que quieres desactivar a ${user.name} ${user.lastname}?`
      : `¿Seguro que quieres reactivar a ${user.name} ${user.lastname}?`,
  )

  if (!confirmed) return

  deletingId.value = user.id

  const payload: Record<string, unknown> = {
    name: user.name ?? '',
    lastname: user.lastname ?? null,
    email: user.email ?? '',
    cellphone: user.cellphone ?? null,
    active: !isCurrentlyActive,
  }

  const { data, onFetchResponse, onFetchError } = useapi(`/users/${user.id}`, {
    method: 'PUT',
  })
    .put(payload)
    .json()

  onFetchResponse(async () => {
    await reloadUsers()

    alert(
      data.value?.message ||
        (isCurrentlyActive
          ? 'Usuario desactivado exitosamente'
          : 'Usuario reactivado exitosamente'),
    )

    deletingId.value = null
  })

  onFetchError((ctx) => {
    alert(
      extractErrorMessage(
        ctx.data,
        'No se pudo actualizar el estado del usuario.',
      ),
    )

    deletingId.value = null
    return ctx
  })
}
</script>

<template>
  <AdminNavBar>
    <div class="home-wrapper">
      <h1 class="titulo">Gestión de Usuarios</h1>
      <p class="subtitulo">
        Administra los usuarios del sistema,
        <strong>{{ ua.credentials?.user.name }}</strong>
      </p>

      <section class="panel">
        <div class="panel-header">
          <div>
            <h2>Usuarios del sistema</h2>
            <p>Consulta, crea, edita, desactiva y reactiva usuarios registrados.</p>
          </div>

          <button class="btn primary" @click="openCreateModal">
            Crear usuario
          </button>
        </div>

        <div class="filters">
          <input
            v-model="filters.search"
            type="text"
            class="input"
            placeholder="Buscar por nombre, correo, teléfono, rol o estado..."
          />

          <button class="btn secondary" @click="clearFilters">
            Limpiar
          </button>
        </div>

        <div v-if="usersLoading || rolesLoading" class="state">
          Cargando usuarios...
        </div>

        <div v-else-if="usersError || rolesError" class="state error">
          {{ usersError?.message || rolesError?.message || 'Error al cargar usuarios' }}
        </div>

        <div v-else>
          <div class="table-wrapper">
            <table class="users-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Usuario</th>
                  <th>Correo</th>
                  <th>Teléfono</th>
                  <th>Rol</th>
                  <th>Estado</th>
                  <th>Creado</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>
                <tr v-if="filteredUsers.length === 0">
                  <td colspan="8" class="empty-cell">
                    No hay usuarios para mostrar.
                  </td>
                </tr>

                <tr v-for="user in filteredUsers" :key="user.id">
                  <td>{{ user.id }}</td>

                  <td class="user-cell">
                    <div class="user-avatar">
                      {{ user.name?.charAt(0) }}{{ user.lastname?.charAt(0) }}
                    </div>
                    <div>
                      <div class="user-name">{{ user.name }} {{ user.lastname }}</div>
                    </div>
                  </td>

                  <td>{{ user.email }}</td>
                  <td>{{ user.cellphone || '—' }}</td>
                  <td>{{ roleLabel(user.role) }}</td>

                  <td>
                    <span :class="statusClass(Boolean(user.active))">
                      {{ statusLabel(Boolean(user.active)) }}
                    </span>
                  </td>

                  <td>{{ formatDate(user.created_at) }}</td>

                  <td>
                    <div class="actions">
                      <button class="btn-action edit" @click="openEditModal(user)">
                        Editar
                      </button>

                      <button
                        class="btn-action"
                        :class="Boolean(user.active) ? 'delete' : 'reactivate'"
                        :disabled="deletingId === user.id"
                        @click="toggleUserStatus(user)"
                      >
                        {{
                          deletingId === user.id
                            ? 'Guardando...'
                            : Boolean(user.active)
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
            <h2>{{ isEditMode ? 'Editar usuario' : 'Crear usuario' }}</h2>
            <button class="close-btn" type="button" @click="closeModal">✕</button>
          </div>

          <form class="user-form" @submit.prevent="submitForm">
            <div v-if="formError" class="state error form-state">
              {{ formError }}
            </div>

            <div class="form-grid">
              <div class="field">
                <label>Nombre</label>
                <input v-model="form.name" type="text" class="input" />
              </div>

              <div class="field">
                <label>Apellido</label>
                <input v-model="form.lastname" type="text" class="input" />
              </div>

              <div class="field">
                <label>Correo</label>
                <input v-model="form.email" type="email" class="input" />
              </div>

              <div class="field">
                <label>Teléfono</label>
                <input v-model="form.cellphone" type="text" class="input" />
              </div>

              <div class="field" v-if="!isEditMode">
                <label>Rol</label>
                <select v-model="form.role_id" class="input" @change="onRoleChange">
                  <option value="">Selecciona un rol</option>
                  <option v-for="role in roles" :key="role.id" :value="role.id">
                    {{ role.description }}
                  </option>
                </select>
              </div>

              <div class="field" v-else>
                <label>Rol</label>
                <input
                  :value="selectedRoleDescription"
                  type="text"
                  class="input input-disabled"
                  disabled
                />
              </div>

              <div class="field">
                <label>
                  {{ isEditMode ? 'Nueva contraseña (opcional)' : 'Contraseña' }}
                </label>
                <input
                  v-model="form.password"
                  type="password"
                  class="input"
                  :placeholder="isEditMode ? 'Déjala vacía para no cambiarla' : 'Ingresa una contraseña'"
                />
              </div>

              <div v-if="isParentRoleSelected && !isEditMode" class="field">
                <label>Alumno vinculado</label>
                <select v-model="form.student_id" class="input">
                  <option value="">Selecciona un alumno</option>
                  <option
                    v-for="student in studentCandidates"
                    :key="student.id"
                    :value="student.id"
                  >
                    {{ student.name }} {{ student.lastname }}
                  </option>
                </select>
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
}

.input:focus {
  outline: none;
  border-color: var(--color-AzulDos);
  box-shadow: 0 0 0 3px rgba(75, 164, 223, 0.15);
}

.input-disabled {
  background: #f1f5f9;
  color: #475569;
  cursor: not-allowed;
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

.users-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 1100px;
}

.users-table thead {
  background: #eef6fc;
}

.users-table th,
.users-table td {
  padding: 12px 10px;
  text-align: left;
  border-bottom: 1px solid #e6edf3;
  font-size: 0.95rem;
  vertical-align: middle;
}

.users-table th {
  color: var(--color-AzulCuatro);
  font-weight: 700;
}

.users-table tbody tr:hover {
  background: #f9fcff;
}

.user-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-AzulDos), var(--color-AzulTres));
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.82rem;
  flex-shrink: 0;
}

.user-name {
  font-weight: 600;
  color: var(--color-OscuroAzulado);
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
  max-width: 760px;
  background: white;
  border-radius: 18px;
  box-shadow: 0 20px 45px rgba(0, 0, 0, 0.22);
  overflow: hidden;
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

.user-form {
  padding: 20px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
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

  .users-table {
    min-width: 900px;
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
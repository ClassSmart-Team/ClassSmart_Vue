<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import AdminNavBar from '@/components/AdminNavBar.vue'
import { useAuthStore } from '@/stores/authStore.ts'
import { useapi } from '@/assets/composables/useApi'

const ua = useAuthStore()

type RoleItem = {
  id: number
  description: string
  users_count?: number
  created_at?: string | null
  updated_at?: string | null
}

type RoleForm = {
  description: string
}

type ApiErrorPayload = {
  message?: string
  errors?: Record<string, string[]>
}

const showModal = ref(false)
const isEditMode = ref(false)
const selectedRoleId = ref<number | null>(null)
const submitting = ref(false)
const deletingId = ref<number | null>(null)
const formError = ref('')

const initialForm = (): RoleForm => ({
  description: '',
})

const form = reactive<RoleForm>(initialForm())

const filters = reactive({
  search: '',
})

const {
  data: rolesData,
  error: rolesError,
  isFetching: rolesLoading,
  execute: reloadRoles,
} = useapi('/roles', {
  method: 'GET',
}).json()

const roles = computed<RoleItem[]>(() => rolesData.value?.data ?? [])

const filteredRoles = computed(() => {
  const term = filters.search.trim().toLowerCase()

  if (!term) return roles.value

  return roles.value.filter((role) =>
    (role.description ?? '').toLowerCase().includes(term),
  )
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
  selectedRoleId.value = null
  isEditMode.value = false
  formError.value = ''
}

function openCreateModal() {
  resetForm()
  showModal.value = true
}

function openEditModal(role: RoleItem) {
  resetForm()
  isEditMode.value = true
  selectedRoleId.value = role.id
  form.description = role.description ?? ''
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  resetForm()
}

function clearFilters() {
  filters.search = ''
}

function formatDate(date?: string | null) {
  if (!date) return '—'

  return new Date(date.replace(' ', 'T')).toLocaleString('es-MX', {
    dateStyle: 'short',
    timeStyle: 'short',
  })
}

function validateForm() {
  formError.value = ''

  if (!form.description.trim()) {
    formError.value = 'La descripción del rol es obligatoria.'
    return false
  }

  return true
}

function canDeleteRole(role: RoleItem) {
  return Number(role.users_count ?? 0) === 0
}

function submitForm() {
  if (!validateForm()) return

  submitting.value = true
  formError.value = ''

  const payload: Record<string, unknown> = {
    description: form.description.trim(),
  }

  if (isEditMode.value && selectedRoleId.value) {
    const { data, onFetchResponse, onFetchError } = useapi(`/roles/${selectedRoleId.value}`, {
      method: 'PUT',
    })
      .put(payload)
      .json()

    onFetchResponse(async () => {
      await reloadRoles()
      alert(data.value?.message || 'Rol actualizado exitosamente')
      closeModal()
      submitting.value = false
    })

    onFetchError((ctx) => {
      formError.value = extractErrorMessage(
        ctx.data,
        'Ocurrió un error al guardar el rol.',
      )
      submitting.value = false
      return ctx
    })

    return
  }

  const { data, onFetchResponse, onFetchError } = useapi('/roles', {
    method: 'POST',
  })
    .post(payload)
    .json()

  onFetchResponse(async () => {
    await reloadRoles()
    alert(data.value?.message || 'Rol creado exitosamente')
    closeModal()
    submitting.value = false
  })

  onFetchError((ctx) => {
    formError.value = extractErrorMessage(
      ctx.data,
      'Ocurrió un error al guardar el rol.',
    )
    submitting.value = false
    return ctx
  })
}

function deleteRole(role: RoleItem) {
  if (!canDeleteRole(role)) {
    alert('No se puede eliminar este rol porque tiene usuarios asignados.')
    return
  }

  const confirmed = window.confirm(
    `¿Seguro que quieres eliminar el rol "${role.description}"?`,
  )

  if (!confirmed) return

  deletingId.value = role.id

  const { data, onFetchResponse, onFetchError } = useapi(`/roles/${role.id}`, {
    method: 'DELETE',
  })
    .json()

  onFetchResponse(async () => {
    await reloadRoles()
    alert(data.value?.message || 'Rol eliminado exitosamente')
    deletingId.value = null
  })

  onFetchError((ctx) => {
    alert(
      extractErrorMessage(
        ctx.data,
        'No se pudo eliminar el rol.',
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
      <h1 class="titulo">Gestión de Roles</h1>
      <p class="subtitulo">
        Administra los roles del sistema,
        <strong>{{ ua.credentials?.user.name }}</strong>
      </p>

      <section class="panel">
        <div class="panel-header">
          <div>
            <h2>Roles del sistema</h2>
            <p>Consulta, crea, edita y elimina roles registrados.</p>
          </div>

          <button class="btn primary" @click="openCreateModal">
            Crear rol
          </button>
        </div>

        <div class="filters">
          <input
            v-model="filters.search"
            type="text"
            class="input"
            placeholder="Buscar por descripción del rol..."
          />

          <button class="btn secondary" @click="clearFilters">
            Limpiar
          </button>
        </div>

        <div v-if="rolesLoading" class="state">
          Cargando roles...
        </div>

        <div v-else-if="rolesError" class="state error">
          {{ rolesError?.message || 'Error al cargar roles' }}
        </div>

        <div v-else>
          <div class="table-wrapper">
            <table class="roles-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Descripción</th>
                  <th>Usuarios con este rol</th>
                  <th>Estado</th>
                  <th>Creado</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>
                <tr v-if="filteredRoles.length === 0">
                  <td colspan="6" class="empty-cell">
                    No hay roles para mostrar.
                  </td>
                </tr>

                <tr v-for="role in filteredRoles" :key="role.id">
                  <td>{{ role.id }}</td>

                  <td>
                    <div class="role-name">
                      {{ role.description }}
                    </div>
                  </td>

                  <td>
                    <span class="count-badge">
                      {{ role.users_count ?? 0 }}
                    </span>
                  </td>

                  <td>
                    <span
                      :class="canDeleteRole(role) ? 'tag available' : 'tag in-use'"
                    >
                      {{ canDeleteRole(role) ? 'Disponible' : 'En uso' }}
                    </span>
                  </td>

                  <td>{{ formatDate(role.created_at) }}</td>

                  <td>
                    <div class="actions">
                      <button class="btn-action edit" @click="openEditModal(role)">
                        Editar
                      </button>

                      <button
                        class="btn-action delete"
                        :class="{ disabledDelete: !canDeleteRole(role) }"
                        :disabled="deletingId === role.id || !canDeleteRole(role)"
                        :title="!canDeleteRole(role) ? 'No se puede eliminar porque tiene usuarios asignados' : ''"
                        @click="deleteRole(role)"
                      >
                        {{
                          deletingId === role.id
                            ? 'Eliminando...'
                            : canDeleteRole(role)
                              ? 'Eliminar'
                              : 'No eliminable'
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
            <h2>{{ isEditMode ? 'Editar rol' : 'Crear rol' }}</h2>
            <button class="close-btn" type="button" @click="closeModal">✕</button>
          </div>

          <form class="role-form" @submit.prevent="submitForm">
            <div v-if="formError" class="state error form-state">
              {{ formError }}
            </div>

            <div class="form-grid">
              <div class="field">
                <label>Descripción</label>
                <input
                  v-model="form.description"
                  type="text"
                  class="input"
                  placeholder="Ej. Coordinador, Tutor, Supervisor..."
                />
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

.roles-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 900px;
}

.roles-table thead {
  background: #eef6fc;
}

.roles-table th,
.roles-table td {
  padding: 12px 10px;
  text-align: left;
  border-bottom: 1px solid #e6edf3;
  font-size: 0.95rem;
  vertical-align: middle;
}

.roles-table th {
  color: var(--color-AzulCuatro);
  font-weight: 700;
}

.roles-table tbody tr:hover {
  background: #f9fcff;
}

.role-name {
  font-weight: 600;
  color: var(--color-OscuroAzulado);
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

.tag.available {
  background: #dcfce7;
  color: #166534;
}

.tag.in-use {
  background: #fef3c7;
  color: #92400e;
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

.btn-action.delete.disabledDelete {
  background: #e5e7eb;
  color: #6b7280;
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
  max-width: 640px;
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

.role-form {
  padding: 20px;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr;
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

  .roles-table {
    min-width: 780px;
  }

  .panel-header {
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
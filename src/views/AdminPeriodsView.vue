<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import AdminNavBar from '@/components/AdminNavBar.vue'
import { useAuthStore } from '@/stores/authStore.ts'
import { useapi } from '@/assets/composables/useApi'

const ua = useAuthStore()

type PeriodItem = {
  id: number
  name: string
  year: number
  start_date: string
  end_date: string
  created_at?: string | null
  updated_at?: string | null
}

type PeriodForm = {
  name: string
  year: number | ''
  start_date: string
  end_date: string
}

type ApiErrorPayload = {
  message?: string
  errors?: Record<string, string[]>
}

const showModal = ref(false)
const isEditMode = ref(false)
const selectedPeriodId = ref<number | null>(null)
const submitting = ref(false)
const deletingId = ref<number | null>(null)
const formError = ref('')

const initialForm = (): PeriodForm => ({
  name: '',
  year: '',
  start_date: '',
  end_date: '',
})

const form = reactive<PeriodForm>(initialForm())

const filters = reactive({
  search: '',
})

const {
  data: periodsData,
  error: periodsError,
  isFetching: periodsLoading,
  execute: reloadPeriods,
} = useapi('/periods', {
  method: 'GET',
}).json()

const periods = computed<PeriodItem[]>(() => periodsData.value?.data ?? [])

const filteredPeriods = computed(() => {
  const term = filters.search.trim().toLowerCase()

  if (!term) return periods.value

  return periods.value.filter((period) => {
    const name = (period.name ?? '').toLowerCase()
    const year = String(period.year ?? '')
    const startDate = (period.start_date ?? '').toLowerCase()
    const endDate = (period.end_date ?? '').toLowerCase()

    return (
      name.includes(term) ||
      year.includes(term) ||
      startDate.includes(term) ||
      endDate.includes(term)
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

function resetForm() {
  Object.assign(form, initialForm())
  selectedPeriodId.value = null
  isEditMode.value = false
  formError.value = ''
}

function openCreateModal() {
  resetForm()
  showModal.value = true
}

function toInputDateValue(date?: string | null) {
  if (!date) return ''
  return date.slice(0, 10)
}

function openEditModal(period: PeriodItem) {
  resetForm()
  isEditMode.value = true
  selectedPeriodId.value = period.id

  form.name = period.name ?? ''
  form.year = period.year ?? ''
  form.start_date = toInputDateValue(period.start_date)
  form.end_date = toInputDateValue(period.end_date)

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

  const normalized = date.includes('T') ? date : `${date}T00:00:00`

  return new Date(normalized).toLocaleDateString('es-MX', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

function validateForm() {
  formError.value = ''

  if (!form.name.trim()) {
    formError.value = 'El nombre del periodo es obligatorio.'
    return false
  }

  if (!form.year) {
    formError.value = 'El año es obligatorio.'
    return false
  }

  if (!form.start_date) {
    formError.value = 'La fecha de inicio es obligatoria.'
    return false
  }

  if (!form.end_date) {
    formError.value = 'La fecha de fin es obligatoria.'
    return false
  }

  if (new Date(form.end_date) < new Date(form.start_date)) {
    formError.value = 'La fecha de fin no puede ser menor a la fecha de inicio.'
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
    year: Number(form.year),
    start_date: form.start_date,
    end_date: form.end_date,
  }

  if (isEditMode.value && selectedPeriodId.value) {
    const { data, onFetchResponse, onFetchError } = useapi(`/periods/${selectedPeriodId.value}`, {
      method: 'PUT',
    })
      .put(payload)
      .json()

    onFetchResponse(async () => {
      await reloadPeriods()
      alert(data.value?.message || 'Periodo actualizado exitosamente')
      closeModal()
      submitting.value = false
    })

    onFetchError((ctx) => {
      formError.value = extractErrorMessage(
        ctx.data,
        'Ocurrió un error al guardar el periodo.',
      )
      submitting.value = false
      return ctx
    })

    return
  }

  const { data, onFetchResponse, onFetchError } = useapi('/periods', {
    method: 'POST',
  })
    .post(payload)
    .json()

  onFetchResponse(async () => {
    await reloadPeriods()
    alert(data.value?.message || 'Periodo creado exitosamente')
    closeModal()
    submitting.value = false
  })

  onFetchError((ctx) => {
    formError.value = extractErrorMessage(
      ctx.data,
      'Ocurrió un error al guardar el periodo.',
    )
    submitting.value = false
    return ctx
  })
}

function deletePeriod(period: PeriodItem) {
  const confirmed = window.confirm(
    `¿Seguro que quieres eliminar el periodo "${period.name}"?`,
  )

  if (!confirmed) return

  deletingId.value = period.id

  const { data, onFetchResponse, onFetchError } = useapi(`/periods/${period.id}`, {
    method: 'DELETE',
  }).json()

  onFetchResponse(async () => {
    await reloadPeriods()
    alert(data.value?.message || 'Periodo eliminado exitosamente')
    deletingId.value = null
  })

  onFetchError((ctx) => {
    alert(
      extractErrorMessage(
        ctx.data,
        'No se pudo eliminar el periodo.',
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
      <h1 class="titulo">Gestión de Periodos</h1>
      <p class="subtitulo">
        Administra los periodos del sistema,
        <strong>{{ ua.credentials?.user.name }}</strong>
      </p>

      <section class="panel">
        <div class="panel-header">
          <div>
            <h2>Periodos del sistema</h2>
            <p>Consulta, crea, edita y elimina periodos escolares registrados.</p>
          </div>

          <button class="btn primary" @click="openCreateModal">
            Crear periodo
          </button>
        </div>

        <div class="filters">
          <input
            v-model="filters.search"
            type="text"
            class="input"
            placeholder="Buscar por nombre, año o fechas..."
          />

          <button class="btn secondary" @click="clearFilters">
            Limpiar
          </button>
        </div>

        <div v-if="periodsLoading" class="state">
          Cargando periodos...
        </div>

        <div v-else-if="periodsError" class="state error">
          {{ periodsError?.message || 'Error al cargar periodos' }}
        </div>

        <div v-else>
          <div class="table-wrapper">
            <table class="periods-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Periodo</th>
                  <th>Año</th>
                  <th>Inicio</th>
                  <th>Fin</th>
                  <th>Creado</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>
                <tr v-if="filteredPeriods.length === 0">
                  <td colspan="7" class="empty-cell">
                    No hay periodos para mostrar.
                  </td>
                </tr>

                <tr v-for="period in filteredPeriods" :key="period.id">
                  <td>{{ period.id }}</td>

                  <td>
                    <div class="period-name">{{ period.name }}</div>
                  </td>

                  <td>{{ period.year }}</td>
                  <td>{{ formatDate(period.start_date) }}</td>
                  <td>{{ formatDate(period.end_date) }}</td>
                  <td>{{ formatDate(period.created_at) }}</td>

                  <td>
                    <div class="actions">
                      <button class="btn-action edit" @click="openEditModal(period)">
                        Editar
                      </button>

                      <button
                        class="btn-action delete"
                        :disabled="deletingId === period.id"
                        @click="deletePeriod(period)"
                      >
                        {{ deletingId === period.id ? 'Eliminando...' : 'Eliminar' }}
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
            <h2>{{ isEditMode ? 'Editar periodo' : 'Crear periodo' }}</h2>
            <button class="close-btn" type="button" @click="closeModal">✕</button>
          </div>

          <form class="period-form" @submit.prevent="submitForm">
            <div v-if="formError" class="state error form-state">
              {{ formError }}
            </div>

            <div class="form-grid">
              <div class="field">
                <label>Nombre</label>
                <input
                  v-model="form.name"
                  type="text"
                  class="input"
                  placeholder="Ej. Enero - Abril"
                />
              </div>

              <div class="field">
                <label>Año</label>
                <input
                  v-model="form.year"
                  type="number"
                  class="input"
                  placeholder="Ej. 2026"
                  min="2000"
                />
              </div>

              <div class="field">
                <label>Fecha de inicio</label>
                <input v-model="form.start_date" type="date" class="input" />
              </div>

              <div class="field">
                <label>Fecha de fin</label>
                <input v-model="form.end_date" type="date" class="input" />
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

.periods-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 950px;
}

.periods-table thead {
  background: #eef6fc;
}

.periods-table th,
.periods-table td {
  padding: 12px 10px;
  text-align: left;
  border-bottom: 1px solid #e6edf3;
  font-size: 0.95rem;
  vertical-align: middle;
}

.periods-table th {
  color: var(--color-AzulCuatro);
  font-weight: 700;
}

.periods-table tbody tr:hover {
  background: #f9fcff;
}

.period-name {
  font-weight: 700;
  color: var(--color-OscuroAzulado);
}

.empty-cell {
  text-align: center;
  color: #6b7280;
  padding: 24px;
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
  max-width: 720px;
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

.period-form {
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

  .periods-table {
    min-width: 820px;
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
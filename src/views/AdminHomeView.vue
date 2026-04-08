<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import AdminNavBar from '@/components/AdminNavBar.vue'
import { useAuthStore } from '@/stores/authStore.ts'
import { useapi } from '@/assets/composables/useApi'

const ua = useAuthStore()

type Actor = {
  id?: number | null
  name?: string | null
  lastname?: string | null
  email?: string | null
  role_id?: number | null
}

type AuditItem = {
  id: number
  action: string
  description: string | null
  entity_type: string | null
  entity_id: number | null
  actor: Actor | null
  created_at: string
}

const filters = reactive({
  search: '',
  action: '',
  entity_type: '',
  from: '',
  to: '',
  page: 1,
  per_page: 10,
})

const query = computed(() => {
  const params = new URLSearchParams()

  if (filters.search) params.append('search', filters.search)
  if (filters.from) params.append('from', filters.from)
  if (filters.to) params.append('to', filters.to)

  params.append('page', String(filters.page))
  params.append('per_page', String(filters.per_page))

  return `/audits?${params.toString()}`
})

const requestUrl = ref(query.value)

const {
  data,
  error,
  isFetching,
  execute: reloadAudits,
} = useapi(
  requestUrl,
  {
    method: 'GET',
  },
  {
    refetch: true,
  },
).json()

watch(query, (newQuery) => {
  requestUrl.value = newQuery
})

const audits = computed<AuditItem[]>(() => data.value?.data?.items ?? [])

const pagination = computed(() => {
  return (
    data.value?.data?.pagination ?? {
      current_page: 1,
      last_page: 1,
      per_page: filters.per_page,
      total: 0,
    }
  )
})

function fetchAudits() {
  requestUrl.value = query.value
  reloadAudits()
}

function applyFilters() {
  filters.page = 1
  fetchAudits()
}

function clearFilters() {
  filters.search = ''
  filters.from = ''
  filters.to = ''
  filters.page = 1
  filters.per_page = 10
  fetchAudits()
}

function nextPage() {
  if (pagination.value.current_page < pagination.value.last_page) {
    filters.page++
    fetchAudits()
  }
}

function prevPage() {
  if (pagination.value.current_page > 1) {
    filters.page--
    fetchAudits()
  }
}

function changePerPage() {
  filters.page = 1
  fetchAudits()
}

function actorName(actor: Actor | null | undefined) {
  if (!actor) return 'Sin actor'

  const fullName = `${actor.name ?? ''} ${actor.lastname ?? ''}`.trim()
  return fullName || actor.email || 'Sin actor'
}

function roleLabel(roleId: number | null | undefined) {
  const map: Record<number, string> = {
    1: 'Administrador',
    2: 'Docente',
    3: 'Estudiante',
  }

  if (!roleId) return '—'
  return map[roleId] || `Rol ${roleId}`
}

function formatDate(date: string) {
  if (!date) return '—'
  return new Date(date.replace(' ', 'T')).toLocaleString('es-MX', {
    dateStyle: 'short',
    timeStyle: 'short',
  })
}

function actionLabel(action: string) {
  const map: Record<string, string> = {
    create: 'Crear',
    update: 'Actualizar',
    delete: 'Eliminar',
    login: 'Inicio de sesión',
    logout: 'Cerrar sesión',
  }

  return map[action] || action
}

function actionClass(action: string) {
  const value = action?.toLowerCase?.() || ''

  if (value.includes('create')) return 'tag create'
  if (value.includes('update')) return 'tag update'
  if (value.includes('delete')) return 'tag delete'
  if (value.includes('login')) return 'tag login'
  if (value.includes('logout')) return 'tag logout'

  return 'tag'
}
</script>

<template>
  <AdminNavBar>
    <div class="home-wrapper">
      <h1 class="titulo">Panel de Administración</h1>
      <p class="subtitulo">
        Bienvenido al sistema ClassSmart,
        <strong>{{ ua.credentials?.user.name }}</strong>
      </p>

      <section class="panel">
        <div class="panel-header">
          <h2>Auditorías del sistema</h2>
          <p>Consulta las acciones registradas dentro de la plataforma.</p>
        </div>

        <div class="filters">
          <input
            v-model="filters.search"
            type="text"
            class="input"
            placeholder="Buscar por acción, descripción o actor..."
            @keyup.enter="applyFilters"
          />

          <input v-model="filters.from" type="date" class="input" />
          <input v-model="filters.to" type="date" class="input" />

          <select v-model="filters.per_page" class="input" @change="changePerPage">
            <option :value="10">10 por página</option>
            <option :value="20">20 por página</option>
            <option :value="50">50 por página</option>
            <option :value="100">100 por página</option>
          </select>

          <button class="btn primary" @click="applyFilters">
            Filtrar
          </button>

          <button class="btn secondary" @click="clearFilters">
            Limpiar
          </button>
        </div>

        <div v-if="isFetching" class="state">
          Cargando auditorías...
        </div>

        <div v-else-if="error" class="state error">
          {{ error?.message || 'Error al cargar auditorías' }}
        </div>

        <div v-else>
          <div class="table-wrapper">
            <table class="audit-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Acción</th>
                  <th>Descripción</th>
                  <th>Entidad</th>
                  <th>Actor</th>
                  <th>Fecha</th>
                </tr>
              </thead>

              <tbody>
                <tr v-if="audits.length === 0">
                  <td colspan="6" class="empty-cell">
                    No hay auditorías para mostrar.
                  </td>
                </tr>

                <tr v-for="audit in audits" :key="audit.id">
                  <td>{{ audit.id }}</td>

                  <td>
                    <span :class="actionClass(audit.action)">
                      {{ actionLabel(audit.action) }}
                    </span>
                  </td>

                  <td class="description-cell" :title="audit.description || '—'">
                    {{ audit.description || '—' }}
                  </td>

                  <td>
                    <div><strong>{{ audit.entity_type || '—' }}</strong></div>
                    <small>ID: {{ audit.entity_id ?? '—' }}</small>
                  </td>

                  <td>
                    <div>{{ actorName(audit.actor) }}</div>
                    <small>{{ audit.actor?.email || '—' }}</small>
                    <small>Rol: {{ roleLabel(audit.actor?.role_id) }}</small>
                  </td>

                  <td>{{ formatDate(audit.created_at) }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="pagination">
            <div class="pagination-info">
              Página {{ pagination.current_page }} de {{ pagination.last_page }}
              · Total: {{ pagination.total }}
            </div>

            <div class="pagination-actions">
              <button
                class="btn secondary"
                :disabled="pagination.current_page === 1"
                @click="prevPage"
              >
                Anterior
              </button>

              <button
                class="btn primary"
                :disabled="pagination.current_page === pagination.last_page"
                @click="nextPage"
              >
                Siguiente
              </button>
            </div>
          </div>
        </div>
      </section>
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

.panel-header h2 {
  margin: 0 0 6px;
  color: var(--color-AzulCuatro);
}

.panel-header p {
  margin: 0 0 18px;
  color: var(--color-OscuroAzulado);
}

.filters {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
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

.btn:disabled {
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

.table-wrapper {
  width: 100%;
  overflow-x: auto;
}

.audit-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 950px;
}

.audit-table thead {
  background: #eef6fc;
}

.audit-table th,
.audit-table td {
  padding: 12px 10px;
  text-align: left;
  border-bottom: 1px solid #e6edf3;
  font-size: 0.95rem;
  vertical-align: top;
}

.audit-table th {
  color: var(--color-AzulCuatro);
  font-weight: 700;
}

.audit-table tbody tr:hover {
  background: #f9fcff;
}

.description-cell {
  max-width: 280px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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

.tag.create {
  background: #dcfce7;
  color: #166534;
}

.tag.update {
  background: #dbeafe;
  color: #1d4ed8;
}

.tag.delete {
  background: #fee2e2;
  color: #b91c1c;
}

.tag.login {
  background: #fef3c7;
  color: #92400e;
}

.tag.logout {
  background: #ede9fe;
  color: #6d28d9;
}

.pagination {
  margin-top: 18px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.pagination-info {
  color: var(--color-OscuroAzulado);
  font-size: 0.95rem;
}

.pagination-actions {
  display: flex;
  gap: 10px;
}

small {
  display: block;
  color: #64748b;
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

  .audit-table {
    min-width: 800px;
  }

  .pagination {
    flex-direction: column;
    align-items: stretch;
  }

  .pagination-actions {
    justify-content: space-between;
  }
}
</style>
<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import AdminNavBar from '@/components/AdminNavBar.vue'
import { useAuthStore } from '@/stores/authStore.ts'
import { useapi } from '@/assets/composables/useApi'

const ua = useAuthStore()

type Role = {
  id: number
  description: string
}

type UserItem = {
  id: number
  name: string
  lastname: string
  email: string
  active: boolean
  role?: Role | null
}

type GroupItem = {
  id: number
  name: string
  description: string | null
  active: boolean
  owner?: UserItem | null
}

type AnnouncementItem = {
  id: number
  title: string
  message: string
  attachment_path?: string | null
  attachment_name?: string | null
  attachment_url?: string | null
  group?: GroupItem | null
  created_at?: string | null
  updated_at?: string | null
}

type AnnouncementForm = {
  group_id: number | ''
  title: string
  message: string
  attachment: File | null
}

type ApiErrorPayload = {
  message?: string
  errors?: Record<string, string[]>
}

const showModal = ref(false)
const isEditMode = ref(false)
const selectedAnnouncementId = ref<number | null>(null)
const submitting = ref(false)
const deletingId = ref<number | null>(null)
const formError = ref('')
const selectedFileName = ref('')
const fileInputRef = ref<HTMLInputElement | null>(null)

const form = reactive<AnnouncementForm>({
  group_id: '',
  title: '',
  message: '',
  attachment: null,
})

const currentAttachment = reactive({
  path: '',
  name: '',
  url: '',
})

const filters = reactive({
  search: '',
})

const {
  data: announcementsData,
  error: announcementsError,
  isFetching: announcementsLoading,
  execute: reloadAnnouncements,
} = useapi('/announcements', {
  method: 'GET',
}).json()

const {
  data: groupsData,
  error: groupsError,
  isFetching: groupsLoading,
} = useapi('/groups', {
  method: 'GET',
}).json()

const announcements = computed<AnnouncementItem[]>(() => announcementsData.value?.data ?? [])
const groups = computed<GroupItem[]>(() => groupsData.value?.data ?? [])

const availableGroups = computed(() => {
  return groups.value.filter((group) => Boolean(group.active))
})

const filteredAnnouncements = computed(() => {
  const term = filters.search.trim().toLowerCase()

  if (!term) return announcements.value

  return announcements.value.filter((announcement) => {
    const title = (announcement.title ?? '').toLowerCase()
    const message = (announcement.message ?? '').toLowerCase()
    const groupName = (announcement.group?.name ?? '').toLowerCase()
    const attachmentName = (announcement.attachment_name ?? '').toLowerCase()

    return (
      title.includes(term) ||
      message.includes(term) ||
      groupName.includes(term) ||
      attachmentName.includes(term)
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
  form.group_id = ''
  form.title = ''
  form.message = ''
  form.attachment = null
  selectedAnnouncementId.value = null
  isEditMode.value = false
  formError.value = ''
  selectedFileName.value = ''
  currentAttachment.path = ''
  currentAttachment.name = ''
  currentAttachment.url = ''
  resetFileInput()
}

function openCreateModal() {
  resetForm()
  showModal.value = true
}

function openEditModal(announcement: AnnouncementItem) {
  resetForm()
  isEditMode.value = true
  selectedAnnouncementId.value = announcement.id

  form.group_id = announcement.group?.id ?? ''
  form.title = announcement.title ?? ''
  form.message = announcement.message ?? ''
  form.attachment = null

  currentAttachment.path = announcement.attachment_path ?? ''
  currentAttachment.name = announcement.attachment_name ?? ''
  currentAttachment.url = announcement.attachment_url ?? ''

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

function formatGroup(group?: GroupItem | null) {
  return group?.name || 'Sin grupo'
}

function onFileChange(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0] ?? null

  form.attachment = file
  selectedFileName.value = file?.name || ''
}

function clearSelectedFile() {
  form.attachment = null
  selectedFileName.value = ''
  resetFileInput()
}

function validateForm() {
  formError.value = ''

  if (!form.group_id) {
    formError.value = 'Debes seleccionar un grupo.'
    return false
  }

  if (!form.title.trim()) {
    formError.value = 'El título es obligatorio.'
    return false
  }

  if (!form.message.trim()) {
    formError.value = 'El mensaje es obligatorio.'
    return false
  }

  return true
}

function buildFormData() {
  const payload = new FormData()

  payload.append('group_id', String(form.group_id))
  payload.append('title', form.title.trim())
  payload.append('message', form.message.trim())

  if (form.attachment) {
    payload.append('attachment', form.attachment)
  }

  return payload
}

async function submitForm() {
  if (!validateForm()) return

  submitting.value = true
  formError.value = ''

  const baseUrl = import.meta.env.VITE_API_URL ?? 'https://api.sutando-user.me/api'
  const payload = buildFormData()

  try {
    let res: Response

    if (isEditMode.value && selectedAnnouncementId.value) {
      payload.append('_method', 'PUT')

      res = await fetch(`${baseUrl}/announcements/${selectedAnnouncementId.value}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${ua.credentials?.token}`,
          Accept: 'application/json',
        },
        body: payload,
      })
    } else {
      res = await fetch(`${baseUrl}/announcements`, {
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
          : json?.message || 'Ocurrió un error al guardar el anuncio.'
      submitting.value = false
      return
    }

    await reloadAnnouncements()
    alert(
      json?.message ||
        (isEditMode.value
          ? 'Anuncio actualizado exitosamente'
          : 'Anuncio creado exitosamente'),
    )

    closeModal()
    submitting.value = false
  } catch (e) {
    console.error('[submitAnnouncement] error →', e)
    formError.value = 'Ocurrió un error inesperado al guardar el anuncio.'
    submitting.value = false
  }
}

function deleteAnnouncement(announcement: AnnouncementItem) {
  const confirmed = window.confirm(
    `¿Seguro que quieres eliminar el anuncio "${announcement.title}"?`,
  )

  if (!confirmed) return

  deletingId.value = announcement.id

  const { data, onFetchResponse, onFetchError } = useapi(`/announcements/${announcement.id}`, {
    method: 'DELETE',
  }).json()

  onFetchResponse(async () => {
    await reloadAnnouncements()
    alert(data.value?.message || 'Anuncio eliminado exitosamente')
    deletingId.value = null
  })

  onFetchError((ctx) => {
    alert(
      extractErrorMessage(
        ctx.data,
        'No se pudo eliminar el anuncio.',
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
      <h1 class="titulo">Gestión de Anuncios</h1>
      <p class="subtitulo">
        Administra los anuncios del sistema,
        <strong>{{ ua.credentials?.user.name }}</strong>
      </p>

      <section class="panel">
        <div class="panel-header">
          <div>
            <h2>Anuncios del sistema</h2>
            <p>Consulta, crea, edita y elimina anuncios con o sin archivo adjunto.</p>
          </div>

          <button class="btn primary" @click="openCreateModal">
            Crear anuncio
          </button>
        </div>

        <div class="filters">
          <input
            v-model="filters.search"
            type="text"
            class="input"
            placeholder="Buscar por título, mensaje, grupo o archivo..."
          />

          <button class="btn secondary" @click="clearFilters">
            Limpiar
          </button>
        </div>

        <div v-if="announcementsLoading || groupsLoading" class="state">
          Cargando anuncios...
        </div>

        <div v-else-if="announcementsError || groupsError" class="state error">
          {{ announcementsError?.message || groupsError?.message || 'Error al cargar anuncios' }}
        </div>

        <div v-else>
          <div class="table-wrapper">
            <table class="announcements-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Anuncio</th>
                  <th>Grupo</th>
                  <th>Adjunto</th>
                  <th>Creado</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>
                <tr v-if="filteredAnnouncements.length === 0">
                  <td colspan="6" class="empty-cell">
                    No hay anuncios para mostrar.
                  </td>
                </tr>

                <tr v-for="announcement in filteredAnnouncements" :key="announcement.id">
                  <td>{{ announcement.id }}</td>

                  <td>
                    <div class="announcement-title">{{ announcement.title }}</div>
                    <div class="announcement-message">{{ announcement.message }}</div>
                  </td>

                  <td>{{ formatGroup(announcement.group) }}</td>

                  <td>
                    <a
                      v-if="announcement.attachment_name && announcement.attachment_url"
                      :href="announcement.attachment_url"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="file-badge link-badge"
                    >
                      {{ announcement.attachment_name }}
                    </a>
                    <span v-else-if="announcement.attachment_name" class="file-badge">
                      {{ announcement.attachment_name }}
                    </span>
                    <span v-else class="no-file">Sin archivo</span>
                  </td>

                  <td>{{ formatDate(announcement.created_at) }}</td>

                  <td>
                    <div class="actions">
                      <button class="btn-action edit" @click="openEditModal(announcement)">
                        Editar
                      </button>

                      <button
                        class="btn-action delete"
                        :disabled="deletingId === announcement.id"
                        @click="deleteAnnouncement(announcement)"
                      >
                        {{ deletingId === announcement.id ? 'Eliminando...' : 'Eliminar' }}
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
            <h2>{{ isEditMode ? 'Editar anuncio' : 'Crear anuncio' }}</h2>
            <button class="close-btn" type="button" @click="closeModal">✕</button>
          </div>

          <form class="announcement-form" @submit.prevent="submitForm">
            <div v-if="formError" class="state error form-state">
              {{ formError }}
            </div>

            <div class="form-grid">
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
                <label>Título</label>
                <input v-model="form.title" type="text" class="input" />
              </div>

              <div class="field full-width">
                <label>Mensaje</label>
                <textarea
                  v-model="form.message"
                  class="input textarea"
                  rows="6"
                  placeholder="Escribe el contenido del anuncio..."
                ></textarea>
              </div>

              <div class="field full-width">
                <label>Archivo adjunto (opcional)</label>
                <input
                  ref="fileInputRef"
                  type="file"
                  class="input"
                  @change="onFileChange"
                />

                <div v-if="selectedFileName" class="file-info">
                  Nuevo archivo: <strong>{{ selectedFileName }}</strong>
                </div>

                <div v-else-if="isEditMode && currentAttachment.name" class="file-info">
                  Archivo actual:
                  <strong>{{ currentAttachment.name }}</strong>
                </div>

                <div class="file-actions" v-if="selectedFileName">
                  <button type="button" class="btn secondary btn-small" @click="clearSelectedFile">
                    Quitar selección
                  </button>
                </div>

                <div v-if="isEditMode && currentAttachment.url && !selectedFileName" class="file-link-row">
                  <a
                    :href="currentAttachment.url"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="file-link"
                  >
                    Abrir archivo actual
                  </a>
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
  min-height: 140px;
}

.btn {
  border: none;
  border-radius: 10px;
  padding: 10px 14px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s ease;
}

.btn-small {
  padding: 8px 12px;
  font-size: 0.88rem;
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

.announcements-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 1150px;
}

.announcements-table thead {
  background: #eef6fc;
}

.announcements-table th,
.announcements-table td {
  padding: 12px 10px;
  text-align: left;
  border-bottom: 1px solid #e6edf3;
  font-size: 0.95rem;
  vertical-align: middle;
}

.announcements-table th {
  color: var(--color-AzulCuatro);
  font-weight: 700;
}

.announcements-table tbody tr:hover {
  background: #f9fcff;
}

.announcement-title {
  font-weight: 700;
  color: var(--color-OscuroAzulado);
}

.announcement-message {
  margin-top: 4px;
  color: #64748b;
  font-size: 0.88rem;
  max-width: 360px;
  white-space: normal;
}

.file-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 5px 10px;
  border-radius: 999px;
  background: #e0f2fe;
  color: #075985;
  font-weight: 700;
  font-size: 0.82rem;
}

.link-badge {
  text-decoration: none;
}

.link-badge:hover {
  text-decoration: underline;
}

.no-file {
  color: #6b7280;
  font-size: 0.9rem;
}

.file-info {
  margin-top: 8px;
  color: #475569;
  font-size: 0.92rem;
}

.file-actions {
  margin-top: 10px;
}

.file-link-row {
  margin-top: 8px;
}

.file-link {
  color: #1d4ed8;
  text-decoration: none;
  font-weight: 600;
}

.file-link:hover {
  text-decoration: underline;
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
  max-width: 840px;
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

.announcement-form {
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

  .announcements-table {
    min-width: 980px;
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
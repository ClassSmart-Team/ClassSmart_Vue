<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useAuthStore } from '@/stores/authStore.ts'
import { useapi } from '@/assets/composables/useApi'
import SidebarLayout from '@/components/TeacherSidebar.vue'
import NoticeCard from '@/components/NoticeCard.vue'

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
  groupId: null as number | null,
})

const {
  data: announcementsData,
  error: announcementsError,
  isFetching: announcementsLoading,
  execute: reloadAnnouncements,
} = useapi('/announcements', { method: 'GET' }).json()

const {
  data: groupsData,
  error: groupsError,
  isFetching: groupsLoading,
} = useapi('/groups', { method: 'GET' }).json()

const announcements = computed<AnnouncementItem[]>(() => announcementsData.value?.data ?? [])
const groups = computed<GroupItem[]>(() => groupsData.value?.data ?? [])

const availableGroups = computed(() => groups.value.filter((g) => Boolean(g.active)))

const filteredAnnouncements = computed(() => {
  const term = filters.search.trim().toLowerCase()

  return announcements.value.filter((a) => {
    const matchesGroup = filters.groupId === null || a.group?.id === filters.groupId
    const matchesSearch =
      !term ||
      (a.title ?? '').toLowerCase().includes(term) ||
      (a.message ?? '').toLowerCase().includes(term) ||
      (a.group?.name ?? '').toLowerCase().includes(term) ||
      (a.attachment_name ?? '').toLowerCase().includes(term)
    return matchesGroup && matchesSearch
  })
})

const groupsWithAnnouncements = computed(() => {
  const ids = new Set(announcements.value.map((a) => a.group?.id).filter(Boolean))
  return availableGroups.value.filter((g) => ids.has(g.id))
})

function extractErrorMessage(data: unknown, fallback: string) {
  const payload = (data ?? {}) as ApiErrorPayload
  if (payload.errors) return Object.values(payload.errors).flat().join(' ')
  return payload.message || fallback
}

function resetFileInput() {
  if (fileInputRef.value) fileInputRef.value.value = ''
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
  filters.groupId = null
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
  if (!form.group_id) { formError.value = 'Debes seleccionar un grupo.'; return false }
  if (!form.title.trim()) { formError.value = 'El título es obligatorio.'; return false }
  if (!form.message.trim()) { formError.value = 'El mensaje es obligatorio.'; return false }
  return true
}

function buildFormData() {
  const payload = new FormData()
  payload.append('group_id', String(form.group_id))
  payload.append('title', form.title.trim())
  payload.append('message', form.message.trim())
  if (form.attachment) payload.append('attachment', form.attachment)
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
        headers: { Authorization: `Bearer ${ua.credentials?.token}`, Accept: 'application/json' },
        body: payload,
      })
    } else {
      res = await fetch(`${baseUrl}/announcements`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${ua.credentials?.token}`, Accept: 'application/json' },
        body: payload,
      })
    }

    const text = await res.text()
    const json = text ? JSON.parse(text) : {}

    if (!res.ok) {
      formError.value = json?.errors
        ? Object.values(json.errors).flat().join(' ')
        : json?.message || 'Ocurrió un error al guardar el anuncio.'
      submitting.value = false
      return
    }

    await reloadAnnouncements()
    alert(json?.message || (isEditMode.value ? 'Anuncio actualizado exitosamente' : 'Anuncio creado exitosamente'))
    closeModal()
    submitting.value = false
  } catch (e) {
    console.error('[submitAnnouncement] error →', e)
    formError.value = 'Ocurrió un error inesperado al guardar el anuncio.'
    submitting.value = false
  }
}

function deleteAnnouncement(announcement: AnnouncementItem) {
  const confirmed = window.confirm(`¿Seguro que quieres eliminar el anuncio "${announcement.title}"?`)
  if (!confirmed) return

  deletingId.value = announcement.id

  const { data, onFetchResponse, onFetchError } = useapi(`/announcements/${announcement.id}`, { method: 'DELETE' }).json()

  onFetchResponse(async () => {
    await reloadAnnouncements()
    alert(data.value?.message || 'Anuncio eliminado exitosamente')
    deletingId.value = null
  })

  onFetchError((ctx) => {
    alert(extractErrorMessage(ctx.data, 'No se pudo eliminar el anuncio.'))
    deletingId.value = null
    return ctx
  })
}
</script>

<template>
  <SidebarLayout>
    <div class="page-wrapper">

      <div class="page-header">
        <div class="page-header__left">
          <div class="page-header__icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
          </div>
          <div>
            <h1 class="page-header__title">Mis anuncios</h1>
            <p class="page-header__sub">Hola, <strong>{{ ua.credentials?.user.name }}</strong> — aquí puedes gestionar tus comunicados</p>
          </div>
        </div>

        <button class="btn-new" @click="openCreateModal">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Nuevo anuncio
        </button>
      </div>

      <div class="main-box">

        <div class="toolbar">
          <div class="search-wrap">
            <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              v-model="filters.search"
              type="text"
              class="search-input"
              placeholder="Buscar por título, mensaje o archivo..."
            />
            <button v-if="filters.search" class="search-clear" @click="clearFilters" title="Limpiar">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          <span class="toolbar__count">
            {{ filteredAnnouncements.length }}
            {{ filteredAnnouncements.length === 1 ? 'anuncio' : 'anuncios' }}
          </span>
        </div>

        <div v-if="groupsWithAnnouncements.length > 0" class="group-chips">
          <button
            class="group-chip"
            :class="{ 'group-chip--active': filters.groupId === null }"
            @click="filters.groupId = null"
          >
            Todos
          </button>
          <button
            v-for="group in groupsWithAnnouncements"
            :key="group.id"
            class="group-chip"
            :class="{ 'group-chip--active': filters.groupId === group.id }"
            @click="filters.groupId = group.id"
          >
            {{ group.name }}
          </button>
        </div>

        <div v-if="announcementsLoading || groupsLoading" class="state-msg">
          <div class="state-spinner"></div>
          Cargando anuncios...
        </div>

        <div v-else-if="announcementsError || groupsError" class="state-msg state-msg--error">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {{ announcementsError?.message || groupsError?.message || 'Error al cargar anuncios' }}
        </div>

        <div v-else-if="filteredAnnouncements.length === 0" class="empty-state">
          <div class="empty-state__icon">📢</div>
          <p class="empty-state__text">
            {{ filters.search || filters.groupId ? 'No hay anuncios que coincidan con los filtros.' : 'Aún no has creado ningún anuncio.' }}
          </p>
          <button v-if="!filters.search && !filters.groupId" class="btn-new" @click="openCreateModal">
            Crear mi primer anuncio
          </button>
        </div>

        <div v-else class="cards-grid">
          <NoticeCard
            v-for="announcement in filteredAnnouncements"
            :key="announcement.id"
            :announcement="announcement"
            :deleting="deletingId === announcement.id"
            @edit="openEditModal"
            @delete="deleteAnnouncement"
          />
        </div>
      </div>

      <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
        <div class="modal-card">

          <div class="modal-header">
            <div class="modal-header__left">
              <div class="modal-header__icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
              </div>
              <h2 class="modal-title">{{ isEditMode ? 'Editar anuncio' : 'Nuevo anuncio' }}</h2>
            </div>
            <button class="modal-close" type="button" @click="closeModal" aria-label="Cerrar">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          <form class="modal-form" @submit.prevent="submitForm">

            <div v-if="formError" class="form-error">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {{ formError }}
            </div>

            <div class="form-grid">
              <div class="field">
                <label class="field__label">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                  Grupo
                </label>
                <select v-model="form.group_id" class="field__input">
                  <option value="">Selecciona un grupo</option>
                  <option v-for="group in availableGroups" :key="group.id" :value="group.id">
                    {{ group.name }}
                  </option>
                </select>
              </div>

              <div class="field">
                <label class="field__label">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="21" y1="6" x2="3" y2="6"/><line x1="15" y1="12" x2="3" y2="12"/><line x1="17" y1="18" x2="3" y2="18"/>
                  </svg>
                  Título
                </label>
                <input v-model="form.title" type="text" class="field__input" placeholder="Ej. Tarea para la próxima clase" />
              </div>

              <div class="field field--full">
                <label class="field__label">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                  Mensaje
                </label>
                <textarea
                  v-model="form.message"
                  class="field__input field__textarea"
                  rows="5"
                  placeholder="Escribe el contenido del anuncio para tus alumnos..."
                ></textarea>
              </div>

              <div class="field field--full">
                <label class="field__label">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
                  </svg>
                  Archivo adjunto <span class="field__optional">(opcional)</span>
                </label>

                <label class="file-drop">
                  <input ref="fileInputRef" type="file" class="file-drop__input" @change="onFileChange" />
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="17 8 12 3 7 8"/>
                    <line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                  <span class="file-drop__text">
                    {{ selectedFileName || 'Haz clic para seleccionar un archivo' }}
                  </span>
                </label>

                <div v-if="selectedFileName" class="file-selected">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
                  </svg>
                  <span>{{ selectedFileName }}</span>
                  <button type="button" class="file-selected__remove" @click="clearSelectedFile">Quitar</button>
                </div>

                <div v-else-if="isEditMode && currentAttachment.name" class="file-current">
                  <span>Archivo actual: <strong>{{ currentAttachment.name }}</strong></span>
                  <a v-if="currentAttachment.url" :href="currentAttachment.url" target="_blank" rel="noopener noreferrer" class="file-current__link">
                    Abrir
                  </a>
                </div>
              </div>
            </div>

            <div class="form-actions">
              <button type="button" class="btn-cancel" @click="closeModal">Cancelar</button>
              <button type="submit" class="btn-submit" :disabled="submitting">
                <svg v-if="submitting" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="spin">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                </svg>
                {{ submitting ? 'Guardando...' : isEditMode ? 'Actualizar anuncio' : 'Publicar anuncio' }}
              </button>
            </div>
          </form>
        </div>
      </div>

    </div>
  </SidebarLayout>
</template>

<style scoped>
.page-wrapper {
  margin: -24px;
  padding: 24px;
  width: calc(100% + 48px);
  min-height: calc(100vh);
  box-sizing: border-box;

  background: linear-gradient(180deg, var(--color-AzulDos), var(--color-ComplementoDos));
  display: flex;
  flex-direction: column;
  gap: 20px;
  position: relative;
  overflow-x: hidden;
}

.page-wrapper::before,
.page-wrapper::after {
  content: '';
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  pointer-events: none;
  z-index: 0;
}

.page-wrapper::before {
  width: 420px;
  height: 420px;
  background: rgba(139, 194, 243, 0.35);
  top: -120px;
  right: -80px;
}

.page-wrapper::after {
  width: 320px;
  height: 320px;
  background: rgba(113, 225, 253, 0.3);
  bottom: 60px;
  left: -60px;
}

.page-wrapper > * {
  position: relative;
  z-index: 1;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.page-header__left {
  display: flex;
  align-items: center;
  gap: 14px;
}

.page-header__icon {
  width: 52px;
  height: 52px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(12px);
  border: 1.5px solid rgba(255, 255, 255, 0.4);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
}

.page-header__title {
  margin: 0 0 4px;
  font-size: 1.9rem;
  font-weight: 900;
  color: white;
  letter-spacing: -0.4px;
  text-shadow: 0 2px 12px rgba(0,0,0,0.15);
}

.page-header__sub {
  margin: 0;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.85);
}

.btn-new {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  background: white;
  color: var(--color-AzulTres);
  border: none;
  border-radius: 12px;
  padding: 10px 18px;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
  box-shadow: 0 2px 10px rgba(0,0,0,0.12);
  white-space: nowrap;
}

.btn-new:hover {
  background: #f0f9ff;
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(0,0,0,0.15);
}

.main-box {
  background: rgba(255, 255, 255, 0.18);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1.5px solid rgba(255, 255, 255, 0.35);
  border-radius: 24px;
  padding: 22px;
  box-shadow: 0 8px 40px rgba(8, 70, 122, 0.2), inset 0 1px 0 rgba(255,255,255,0.4);
}

.toolbar {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 22px;
  flex-wrap: wrap;
}

.search-wrap {
  position: relative;
  flex: 1;
  min-width: 220px;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-AzulTres);
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 10px 36px 10px 38px;
  border-radius: 12px;
  border: 1.5px solid rgba(255, 255, 255, 0.65);
  background: rgba(255, 255, 255, 0.82);
  backdrop-filter: blur(10px);
  font-size: 0.92rem;
  box-sizing: border-box;
  font-family: inherit;

  color: #0f172a;
  font-weight: 750;

  transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
}

.search-input::placeholder {
  color: rgba(15, 23, 42, 0.72);
  font-weight: 750;
}

.search-input:focus {
  outline: none;
  border-color: white;
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.25);
  background: rgba(255, 255, 255, 0.95);
}

.search-clear {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-AzulTres);
  display: flex;
  align-items: center;
  padding: 2px;
}

.search-clear:hover {
  color: var(--color-AzulCuatro);
}

.toolbar__count {
  font-size: 0.83rem;
  font-weight: 800;
  color: rgba(255, 255, 255, 0.92);
  white-space: nowrap;
  text-shadow: 0 2px 10px rgba(0,0,0,0.15);
}

/* 🔥 CHIPS BLANCOS SIEMPRE */
.group-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 20px;
}

.group-chip {
  padding: 7px 16px;
  border-radius: 999px;
  border: 1.5px solid rgba(255, 255, 255, 0.85);

  background: white;

  color: var(--color-AzulCuatro);
  font-size: 0.83rem;
  font-weight: 850;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.18s ease;
  white-space: nowrap;

  box-shadow: 0 3px 12px rgba(8, 70, 122, 0.18);
}

.group-chip:hover {
  transform: translateY(-1px);
  box-shadow: 0 5px 16px rgba(8, 70, 122, 0.22);
}

/* ACTIVO: MÁS FUERTE */
.group-chip--active {
  background: linear-gradient(135deg, var(--color-AzulDos), var(--color-AzulTres));
  color: white;
  border-color: transparent;
  box-shadow: 0 6px 18px rgba(8, 70, 122, 0.28);
}

/* CUANDO HAY UNO ACTIVO, LOS DEMÁS SE DIFUMINAN PERO SE LEEN */
.group-chips:has(.group-chip--active:not(:first-child)) .group-chip:not(.group-chip--active) {
  opacity: 0.72;
  filter: blur(0.2px) saturate(0.9);
  transform: scale(0.98);
}

/* ─── Estados ─── */
.state-msg {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 40px 20px;
  color: white;
  font-size: 0.95rem;
  font-weight: 500;
}

.state-msg--error {
  color: #fce8e6;
  font-weight: 600;
}

.state-spinner {
  width: 20px;
  height: 20px;
  border: 2.5px solid rgba(255,255,255,0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  padding: 50px 20px;
}

.empty-state__icon { font-size: 2.5rem; }

.empty-state__text {
  margin: 0;
  color: rgba(255, 255, 255, 0.85);
  font-size: 0.95rem;
  text-align: center;
  font-weight: 600;
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
  gap: 16px;
}

/* 🔥 MEJOR VISIBILIDAD EN NoticeCard */
.cards-grid :deep(.notice-card),
.cards-grid :deep(.card),
.cards-grid :deep(.notice),
.cards-grid :deep(.notice-content) {
  color: #0f172a;
}

.cards-grid :deep(.notice-card p),
.cards-grid :deep(.notice-card span),
.cards-grid :deep(.notice-card small),
.cards-grid :deep(.notice-card .meta),
.cards-grid :deep(.notice-card .description),
.cards-grid :deep(.notice-card .message) {
  color: rgba(15, 23, 42, 0.9) !important;
  font-weight: 650;
}

/* 🔥 FECHA NEGRA */
.cards-grid :deep(.notice-card .date),
.cards-grid :deep(.notice-card .created-at),
.cards-grid :deep(.notice-card .time),
.cards-grid :deep(.notice-card .timestamp),
.cards-grid :deep(.notice-card small) {
  color: #0f172a !important;
  font-weight: 800;
}

/* TITULO MÁS FUERTE */
.cards-grid :deep(.notice-card h3),
.cards-grid :deep(.notice-card .title) {
  color: #0f172a !important;
  font-weight: 900;
}

/* DESCRIPCIÓN MÁS CLARA */
.cards-grid :deep(.notice-card .description),
.cards-grid :deep(.notice-card .message) {
  color: rgba(15, 23, 42, 0.88) !important;
  font-weight: 650;
  line-height: 1.45;
}

/* ─── Modal ─── */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(17, 19, 27, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  z-index: 999;
  backdrop-filter: blur(3px);
}

.modal-card {
  width: 100%;
  max-width: 820px;
  background: var(--color-Blanco);
  border-radius: 20px;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.25);
  overflow: hidden;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 22px;
  border-bottom: 1.5px solid var(--color-Bordes);
  background: var(--color-Fondo);
  flex-shrink: 0;
}

.modal-header__left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.modal-header__icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: linear-gradient(135deg, var(--color-AzulDos), var(--color-AzulTres));
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.modal-title {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--color-AzulCuatro);
}

.modal-close {
  background: #f1f5f9;
  border: none;
  width: 34px;
  height: 34px;
  border-radius: 9px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  transition: background 0.15s;
}

.modal-close:hover {
  background: #e2e8f0;
  color: #1e293b;
}

.modal-form {
  padding: 22px;
  overflow-y: auto;
}

.form-error {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 14px;
  border-radius: 10px;
  background: #fff1f1;
  border: 1px solid #f5c2c2;
  color: #c0392b;
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 16px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.field--full { grid-column: 1 / -1; }

.field__label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--color-Anuncio);
}

.field__optional {
  font-weight: 400;
  color: #94a3b8;
}

.field__input {
  padding: 10px 12px;
  border-radius: 10px;
  border: 1.5px solid #e2e8f0;
  background: var(--color-Fondo);
  font-size: 0.92rem;
  font-family: inherit;
  color: var(--color-Texto);
  box-sizing: border-box;
  width: 100%;
  transition: border-color 0.2s, box-shadow 0.2s;
  font-weight: 600;
}

.field__input::placeholder {
  color: #64748b;
  font-weight: 600;
}

.field__input:focus {
  outline: none;
  border-color: var(--color-AzulDos);
  box-shadow: 0 0 0 3px rgba(75, 164, 223, 0.15);
  background: white;
}

.field__textarea {
  resize: vertical;
  min-height: 120px;
  line-height: 1.55;
}

.file-drop {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 22px 16px;
  border: 2px dashed #cbd5e1;
  border-radius: 12px;
  cursor: pointer;
  background: var(--color-Fondo);
  color: #64748b;
  transition: border-color 0.2s, background 0.2s;
  text-align: center;
}

.file-drop:hover {
  border-color: var(--color-AzulDos);
  background: #f0f9ff;
  color: var(--color-AzulTres);
}

.file-drop__input { display: none; }

.file-drop__text {
  font-size: 0.88rem;
  font-weight: 650;
}

.file-selected {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 0.85rem;
  color: #075985;
  background: #e0f2fe;
  padding: 7px 12px;
  border-radius: 8px;
  flex-wrap: wrap;
}

.file-selected__remove {
  margin-left: auto;
  background: none;
  border: none;
  cursor: pointer;
  color: #b91c1c;
  font-size: 0.82rem;
  font-weight: 600;
  padding: 0;
}

.file-selected__remove:hover { text-decoration: underline; }

.file-current {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.85rem;
  color: #475569;
  padding: 7px 0;
  flex-wrap: wrap;
}

.file-current__link {
  color: var(--color-AzulTres);
  font-weight: 600;
  text-decoration: none;
}

.file-current__link:hover { text-decoration: underline; }

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid var(--color-Bordes);
}

.btn-cancel {
  background: #f1f5f9;
  color: #475569;
  border: none;
  border-radius: 10px;
  padding: 10px 18px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
}

.btn-cancel:hover { background: #e2e8f0; }

.btn-submit {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  background: linear-gradient(135deg, var(--color-AzulDos), var(--color-AzulTres));
  color: white;
  border: none;
  border-radius: 10px;
  padding: 10px 20px;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.2s, transform 0.15s;
}

.btn-submit:hover:not(:disabled) {
  transform: translateY(-1px);
  opacity: 0.92;
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.spin { animation: spin 0.8s linear infinite; }

@media (max-width: 768px) {
  .page-wrapper {
    margin: -16px;
    width: calc(100% + 32px);
    padding: 16px;
    gap: 14px;
  }

  .page-header { flex-direction: column; align-items: stretch; }
  .page-header__left { flex-direction: row; }
  .btn-new { justify-content: center; }
  .cards-grid { grid-template-columns: 1fr; }
  .form-grid { grid-template-columns: 1fr; }
  .form-actions { flex-direction: column; }
  .form-actions .btn-cancel,
  .form-actions .btn-submit { width: 100%; justify-content: center; }
}
</style>

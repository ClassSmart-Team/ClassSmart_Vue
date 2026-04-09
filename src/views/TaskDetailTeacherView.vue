<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import SidebarLayout from '@/components/TeacherSidebar.vue'
import { useapi } from '@/assets/composables/useApi'

const route = useRoute()
const router = useRouter()
const taskId = route.params.id

const isGrading = ref(false)
const gradeError = ref('')
const gradeSuccess = ref(false)
const selectedSub = ref<any>(null)
const gradeForm = ref({ grade: '', feedback: '' })

const { data, error, isFetching, execute: reload } = useapi(`/assignments/${taskId}`).json()

const task = computed(() => data.value?.data ?? data.value ?? null)
const submissions = computed(() => task.value?.submissions ?? [])

const formatDate = (dateStr: string) => {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleString('es-MX', {
    day: '2-digit',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const formatDateShort = (dateStr: string) => {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

const isLate = (sub: any) =>
  task.value?.end_date
    ? new Date(sub.submission_date) > new Date(task.value.end_date)
    : false

const gradeColor = (grade: number | null) => {
  if (grade === null || grade === undefined) return '#94a3b8'
  if (grade >= 8) return '#16a34a'
  if (grade >= 6) return '#d97706'
  return '#dc2626'
}

const initials = (name: string = '', lastname: string = '') =>
  (name.charAt(0) + lastname.charAt(0)).toUpperCase()

const fileIcon = (type: string = '') => {
  if (type.includes('pdf')) return '📄'
  if (type.includes('image')) return '🖼️'
  if (type.includes('word') || type.includes('document')) return '📝'
  if (type.includes('sheet') || type.includes('excel')) return '📊'
  return '📎'
}

const resolveFileUrl = (f: any) => {
  if (!f) return ''

  if (f.url) return f.url
  if (f.attachment_url) return f.attachment_url

  const apiBase = import.meta.env.VITE_API_URL ?? 'https://api.sutando-user.me/api'
  const baseOrigin = apiBase.replace(/\/api\/?$/, '')

  const buildStorageUrl = (rawPath: string) => {
    if (!rawPath) return ''

    if (rawPath.startsWith('http://') || rawPath.startsWith('https://')) {
      return rawPath
    }

    let cleanPath = rawPath.startsWith('/') ? rawPath : `/${rawPath}`

    if (
      cleanPath.startsWith('/assignments/') ||
      cleanPath.startsWith('/announcements/')
    ) {
      cleanPath = `/storage${cleanPath}`
    } else if (!cleanPath.startsWith('/storage/')) {
      cleanPath = `/storage${cleanPath}`
    }

    return `${baseOrigin}${cleanPath}`
  }

  if (f.file_path) {
    return buildStorageUrl(String(f.file_path))
  }

  if (f.path) {
    return buildStorageUrl(String(f.path))
  }

  if (f.id) {
    return `${apiBase.replace(/\/$/, '')}/files/${f.id}/view`
  }

  return ''
}

const openFile = (f: any) => {
  const url = resolveFileUrl(f)

  if (!url) {
    alert('No se encontró una URL válida para este archivo.')
    return
  }

  window.open(url, '_blank', 'noopener,noreferrer')
}

function openGrade(sub: any) {
  selectedSub.value = sub
  gradeForm.value.grade = sub.grade != null ? String(sub.grade) : ''
  gradeForm.value.feedback = sub.feedback ?? ''
  isGrading.value = true
  gradeError.value = ''
  gradeSuccess.value = false
}

function cancelGrade() {
  isGrading.value = false
  selectedSub.value = null
}

function saveGrade() {
  const id = selectedSub.value?.id
  if (!id) return

  const gradeNum = Number(gradeForm.value.grade)
  if (isNaN(gradeNum) || gradeNum < 0 || gradeNum > 10) {
    gradeError.value = 'La calificación debe estar entre 0 y 10'
    return
  }

  const { data: res, onFetchResponse, onFetchError } = useapi(`/submissions/${id}/grade`)
    .patch({ grade: gradeNum, feedback: gradeForm.value.feedback })
    .json()

  onFetchResponse(async () => {
    gradeSuccess.value = true
    await reload()
    setTimeout(() => {
      isGrading.value = false
      gradeSuccess.value = false
      selectedSub.value = null
    }, 1200)
  })

  onFetchError(() => {
    gradeError.value = res.value?.message ?? 'Error al calificar'
  })
}
</script>

<template>
  <div class="bg-page">
    <SidebarLayout>
      <div v-if="isFetching" class="center-state">
        <div class="spinner"></div>
        <p>Cargando tarea...</p>
      </div>

      <div v-else-if="error" class="error-banner">
        <span>⚠</span> Error al cargar la tarea.
      </div>

      <template v-else-if="task">
        <div class="ContSmall">
          <button class="btn-back" @click="router.back()">← Volver</button>

          <div class="header-body">
            <div class="header-text">
              <h1>{{ task.title }}</h1>
              <p>{{ task.description }}</p>

              <div class="header-meta">
                <span class="meta-chip">Inicio: {{ formatDateShort(task.start_date) }}</span>
                <span class="meta-chip deadline">Límite: {{ formatDateShort(task.end_date) }}</span>
                <span :class="['status-pill', task.status?.toLowerCase()]">{{ task.status }}</span>
              </div>

              <div v-if="task.files?.length" class="task-files">
                <p class="task-files-label">Archivos adjuntos:</p>

                <div class="files-list">
                  <button
                    v-for="f in task.files"
                    :key="f.id"
                    type="button"
                    class="file-chip"
                    @click="openFile(f)"
                  >
                    <span class="file-icon">{{ fileIcon(f.type ?? f.mime_type ?? '') }}</span>
                    <span class="file-name">{{ f.file_name ?? f.name }}</span>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <div class="header-stats">
              <div class="hstat">
                <span class="hstat-num">{{ submissions.length }}</span>
                <span class="hstat-label">Entregas</span>
              </div>

              <div class="hstat graded">
                <span class="hstat-num">{{ submissions.filter((s: any) => s.status === 'Calificada').length }}</span>
                <span class="hstat-label">Calificadas</span>
              </div>

              <div class="hstat pending">
                <span class="hstat-num">{{ submissions.filter((s: any) => s.status !== 'Calificada').length }}</span>
                <span class="hstat-label">Pendientes</span>
              </div>
            </div>
          </div>
        </div>

        <div class="detail-container">
          <div class="ContBig">
            <div class="section-header">
              <h3>Entregas de alumnos</h3>
              <span class="badge">{{ submissions.length }}</span>
            </div>

            <div v-if="!submissions.length" class="empty-state">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" stroke-width="1.2">
                <path d="M9 12h6M9 16h6M17 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2z"/>
              </svg>
              <p>Ningún alumno ha entregado esta tarea todavía.</p>
            </div>

            <div v-else class="submissions-list">
              <div
                v-for="sub in submissions"
                :key="sub.id"
                :class="['sub-card', { late: isLate(sub), graded: sub.status === 'Calificada' }]"
              >
                <div class="sub-header">
                  <div class="student-info">
                    <div class="student-avatar">
                      {{ initials(sub.student?.name, sub.student?.lastname) }}
                    </div>

                    <div>
                      <p class="student-name">{{ sub.student?.name }} {{ sub.student?.lastname }}</p>
                      <p class="sub-date">Entregado: {{ formatDate(sub.submission_date) }}</p>
                    </div>
                  </div>

                  <div class="sub-right">
                    <span v-if="isLate(sub)" class="badge-status late">Tardía</span>
                    <span v-else :class="['badge-status', sub.status === 'Calificada' ? 'graded' : 'pending']">
                      {{ sub.status }}
                    </span>

                    <div v-if="sub.grade != null" class="grade-display">
                      <span class="grade-num" :style="{ color: gradeColor(sub.grade) }">{{ sub.grade }}</span>
                      <span class="grade-total">/10</span>
                    </div>

                    <button class="btn-grade" @click="openGrade(sub)">
                      {{ sub.status === 'Calificada' ? '✏️ Editar' : '📝 Calificar' }}
                    </button>
                  </div>
                </div>

                <div v-if="sub.files && sub.files.length" class="files-section">
                  <p class="files-label">Archivos adjuntos</p>

                  <div class="files-list">
                    <button
                      v-for="f in sub.files"
                      :key="f.id"
                      type="button"
                      class="file-chip"
                      @click="openFile(f)"
                    >
                      <span class="file-icon">{{ fileIcon(f.type ?? f.mime_type ?? '') }}</span>
                      <span class="file-name">{{ f.file_name ?? f.name }}</span>
                      <span class="file-size" v-if="f.size">{{ (f.size / 1024).toFixed(0) }} KB</span>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/>
                      </svg>
                    </button>
                  </div>
                </div>

                <div v-else class="no-files">Sin archivos adjuntos</div>

                <div v-if="sub.feedback" class="feedback-box">
                  <p class="feedback-label">Retroalimentación:</p>
                  <p class="feedback-text">{{ sub.feedback }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="isGrading" class="modal-overlay" @click.self="cancelGrade">
          <div class="modal-box">
            <div class="modal-header">
              <h2>Calificar entrega</h2>
              <button class="modal-close" @click="cancelGrade">✕</button>
            </div>

            <div class="modal-student">
              <div class="student-avatar lg">
                {{ initials(selectedSub?.student?.name, selectedSub?.student?.lastname) }}
              </div>

              <div>
                <p class="modal-student-name">{{ selectedSub?.student?.name }} {{ selectedSub?.student?.lastname }}</p>
                <p class="modal-student-date">Entregado: {{ formatDate(selectedSub?.submission_date) }}</p>
              </div>
            </div>

            <div v-if="selectedSub?.files?.length" class="modal-files">
              <p class="files-label">Archivos del alumno:</p>

              <div class="files-list">
                <button
                  v-for="f in selectedSub.files"
                  :key="f.id"
                  type="button"
                  class="file-chip"
                  @click="openFile(f)"
                >
                  <span class="file-icon">{{ fileIcon(f.type ?? f.mime_type ?? '') }}</span>
                  <span class="file-name">{{ f.file_name ?? f.name }}</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/>
                  </svg>
                </button>
              </div>
            </div>

            <div class="modal-fields">
              <div>
                <label>Calificación (0–10)</label>
                <input v-model="gradeForm.grade" type="number" min="0" max="10" step="0.1" placeholder="Ej. 8.5" />
              </div>

              <div>
                <label>Retroalimentación</label>
                <textarea v-model="gradeForm.feedback" placeholder="Comentario para el alumno..." rows="4"></textarea>
              </div>
            </div>

            <p v-if="gradeError" class="grade-error">⚠ {{ gradeError }}</p>
            <div v-if="gradeSuccess" class="grade-success">✅ Calificación guardada</div>

            <div class="modal-actions">
              <button class="btn-cancel" @click="cancelGrade">Cancelar</button>
              <button class="btn-save" @click="saveGrade">Guardar calificación</button>
            </div>
          </div>
        </div>
      </template>
    </SidebarLayout>
  </div>
</template>

<style scoped>
.ContSmall {
  background: var(--color-Azul);
  width: 95%;
  max-width: 1000px;
  border-radius: 20px;
  margin: 30px auto 0 auto;
  padding: 20px 28px;
  color: white;
}

.btn-back {
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.25);
  color: white;
  font-size: 0.82rem;
  font-weight: 700;
  padding: 6px 14px;
  border-radius: 8px;
  cursor: pointer;
  margin-bottom: 14px;
  transition: all 0.2s ease;
}

.btn-back:hover {
  background: rgba(255, 255, 255, 0.28);
  transform: translateX(-3px);
}

.header-body {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
  flex-wrap: wrap;
}

.header-text h1 {
  font-size: 1.4rem;
  margin: 0 0 6px 0;
  font-weight: 800;
}

.header-text > p {
  font-size: 0.85rem;
  opacity: 0.85;
  margin: 0 0 12px 0;
  line-height: 1.5;
}

.header-meta {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  align-items: center;
  margin-bottom: 12px;
}

.meta-chip {
  font-size: 0.72rem;
  background: rgba(255, 255, 255, 0.15);
  padding: 3px 10px;
  border-radius: 6px;
  font-weight: 600;
}

.meta-chip.deadline {
  background: rgba(251, 191, 36, 0.25);
  border: 1px solid rgba(251, 191, 36, 0.3);
}

.status-pill {
  font-size: 0.68rem;
  font-weight: 800;
  text-transform: uppercase;
  padding: 3px 12px;
  border-radius: 20px;
}

.status-pill.activa { background: #dbeafe; color: #1d4ed8; }
.status-pill.cerrada { background: #fee2e2; color: #dc2626; }
.status-pill.cancelada { background: #f3f4f6; color: #6b7280; }

.task-files {
  margin-top: 12px;
}

.task-files-label {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: rgba(255, 255, 255, 0.7);
  margin: 0 0 8px 0;
}

.header-stats {
  display: flex;
  gap: 12px;
  flex-shrink: 0;
}

.hstat {
  background: rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  padding: 10px 16px;
  text-align: center;
  min-width: 70px;
  transition: transform 0.2s;
}

.hstat:hover {
  transform: translateY(-3px);
}

.hstat.graded {
  background: rgba(16, 185, 129, 0.2);
}

.hstat.pending {
  background: rgba(251, 191, 36, 0.2);
}

.hstat-num {
  display: block;
  font-size: 1.6rem;
  font-weight: 900;
  line-height: 1;
}

.hstat-label {
  display: block;
  font-size: 0.65rem;
  opacity: 0.8;
  margin-top: 3px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.detail-container {
  width: 95%;
  max-width: 1000px;
  margin: 20px auto 50px auto;
}

.ContBig {
  background: var(--color-Blanco);
  width: 95%;
  max-width: 1000px;
  height: 600px;
  overflow-y: auto;
  border-radius: 20px;
  margin: 30px auto;
  padding: 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.section-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
  border-bottom: 1px solid #f1f5f9;
  padding-bottom: 15px;
}

.section-header h3 {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 800;
  color: #1e293b;
}

.badge {
  background: var(--color-Azul);
  color: white;
  border-radius: 20px;
  padding: 2px 12px;
  font-size: 0.8rem;
  font-weight: 700;
}

.submissions-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.sub-card {
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 20px;
  background: #fafbfd;
  border-left: 5px solid #e2e8f0;
  transition: all 0.2s ease;
}

.sub-card:hover {
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.06);
  transform: scale(1.005);
}

.sub-card.graded { border-left-color: #10b981; }
.sub-card.late { border-left-color: #f59e0b; }

.sub-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
}

.student-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.student-avatar {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: var(--color-Azul, #2563eb);
  color: white;
  font-weight: 800;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 4px 10px rgba(37, 99, 235, 0.2);
}

.student-avatar.lg {
  width: 48px;
  height: 48px;
  font-size: 1rem;
}

.student-name {
  margin: 0;
  font-weight: 700;
  font-size: 0.95rem;
  color: #1e293b;
}

.sub-date {
  margin: 2px 0 0;
  font-size: 0.75rem;
  color: #94a3b8;
}

.sub-right {
  display: flex;
  align-items: center;
  gap: 15px;
  flex-wrap: wrap;
}

.badge-status {
  font-size: 0.68rem;
  font-weight: 800;
  text-transform: uppercase;
  padding: 4px 12px;
  border-radius: 20px;
  letter-spacing: 0.4px;
}

.badge-status.graded { background: #dcfce7; color: #15803d; }
.badge-status.pending { background: #fffbeb; color: #b45309; }
.badge-status.late { background: #fef2f2; color: #dc2626; }

.grade-display {
  display: flex;
  align-items: baseline;
  gap: 2px;
  background: #f1f5f9;
  padding: 4px 12px;
  border-radius: 10px;
}

.grade-num {
  font-size: 1.4rem;
  font-weight: 900;
  line-height: 1;
  color: #1e293b;
}

.grade-total {
  font-size: 0.8rem;
  color: #94a3b8;
  font-weight: 600;
}

.btn-grade {
  background: #eff6ff;
  color: #2563eb;
  border: 1.5px solid #bfdbfe;
  font-weight: 700;
  font-size: 0.8rem;
  padding: 8px 18px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.btn-grade:hover {
  background: #2563eb;
  color: white;
  border-color: #2563eb;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
}

.files-section {
  margin-top: 18px;
  padding-top: 15px;
  border-top: 1px dashed #e2e8f0;
}

.files-label {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #94a3b8;
  margin: 0 0 10px 0;
}

.files-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.file-chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 8px 14px;
  font-size: 0.8rem;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s;
}

.file-chip:hover {
  background: #f8fafc;
  border-color: var(--color-Azul);
  color: var(--color-AzulTres);
  transform: translateY(-2px);
}

.file-name {
  font-weight: 600;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-size {
  color: #9ca3af;
  font-size: 0.7rem;
}

.no-files {
  margin-top: 14px;
  font-size: 0.85rem;
  color: #94a3b8;
}

.feedback-box {
  margin-top: 16px;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 12px;
  padding: 14px 18px;
}

.feedback-label {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  color: #15803d;
  margin-bottom: 6px;
}

.feedback-text {
  font-size: 0.88rem;
  color: #166534;
  margin: 0;
  line-height: 1.6;
}

.center-state {
  padding: 50px 20px;
  text-align: center;
}

.error-banner {
  width: 95%;
  max-width: 1000px;
  margin: 30px auto 0;
  padding: 14px 18px;
  border-radius: 14px;
  background: #fef2f2;
  color: #b91c1c;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 8px;
}

.empty-state {
  padding: 40px 20px;
  text-align: center;
  color: #94a3b8;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid var(--color-Azul, #2563eb);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  overflow-y: auto;
}

.modal-box {
  background: white;
  border-radius: 24px;
  padding: 32px;
  width: 100%;
  max-width: 520px;
  max-height: 90vh;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  display: flex;
  flex-direction: column;
  gap: 20px;
  overflow-y: auto;
  overflow-x: hidden;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.modal-header h2 {
  margin: 0;
  color: #0f172a;
  font-size: 1.25rem;
  font-weight: 800;
}

.modal-close {
  border: none;
  background: transparent;
  font-size: 1.1rem;
  cursor: pointer;
  color: #64748b;
}

.modal-student {
  display: flex;
  align-items: center;
  gap: 15px;
  background: #f8fafc;
  border-radius: 16px;
  padding: 15px;
  border: 1px solid #f1f5f9;
}

.modal-student-name {
  margin: 0;
  font-weight: 700;
  color: #1e293b;
}

.modal-student-date {
  margin: 4px 0 0;
  font-size: 0.8rem;
  color: #94a3b8;
}

.modal-files {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.modal-fields {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.modal-fields label {
  font-size: 0.85rem;
  font-weight: 700;
  color: #334155;
  margin-bottom: 6px;
  display: block;
}

.modal-fields input,
.modal-fields textarea {
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 12px 16px;
  font-size: 0.95rem;
  outline: none;
  width: 100%;
  box-sizing: border-box;
  transition: all 0.2s;
  background: #f8fafc;
}

.modal-fields input:focus,
.modal-fields textarea:focus {
  border-color: var(--color-Azul);
  background: white;
  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1);
}

.grade-error {
  margin: 0;
  color: #b91c1c;
  font-weight: 700;
  font-size: 0.9rem;
}

.grade-success {
  margin: 0;
  color: #15803d;
  font-weight: 700;
  font-size: 0.9rem;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.btn-cancel {
  padding: 12px 24px;
  border: 1px solid #cbd5e1;
  background: white;
  color: #334155;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
  font-size: 0.9rem;
}

.btn-save {
  padding: 12px 24px;
  border: none;
  background: #2563eb;
  color: white;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.btn-save:hover {
  background: #1d4ed8;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(29, 78, 216, 0.3);
}

@media (max-width: 768px) {
  .header-body {
    flex-direction: column;
  }

  .header-stats {
    width: 100%;
    justify-content: space-between;
  }

  .sub-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .sub-right {
    width: 100%;
    justify-content: space-between;
    gap: 10px;
  }

  .ContBig {
    width: 95%;
    padding: 20px;
  }

  .modal-box {
    padding: 22px;
  }

  .modal-actions {
    flex-direction: column;
  }

  .btn-cancel,
  .btn-save {
    width: 100%;
  }
}
</style>
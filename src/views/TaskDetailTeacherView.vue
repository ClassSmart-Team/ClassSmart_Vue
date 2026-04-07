<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import SidebarLayout from '@/components/TeacherSidebar.vue'
import { useapi } from '@/assets/composables/useApi'

const route  = useRoute()
const router = useRouter()
const taskId = route.params.id

// ── Estado ──────────────────────────────────────────────────────────────────
const isGrading      = ref(false)
const gradeError     = ref('')
const gradeSuccess   = ref(false)
const selectedSub    = ref<any>(null)
const gradeForm      = ref({ grade: '', feedback: '' })

// ── GET tarea (incluye submissions, student y files) ──────────────────────
const { data, error, isFetching, execute: reload } = useapi(
  `/assignments/${taskId}`
).json()

const task        = computed(() => data.value?.data ?? data.value ?? null)
const submissions = computed(() => task.value?.submissions ?? [])

// ── Helpers ────────────────────────────────────────────────────────────────
const formatDate = (dateStr: string) => {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleString('es-MX', {
    day: '2-digit', month: 'long', hour: '2-digit', minute: '2-digit'
  })
}

const formatDateShort = (dateStr: string) => {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('es-MX', {
    day: '2-digit', month: 'short', year: 'numeric'
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
  if (type.includes('pdf'))   return '📄'
  if (type.includes('image')) return '🖼️'
  if (type.includes('word') || type.includes('document')) return '📝'
  if (type.includes('sheet') || type.includes('excel'))   return '📊'
  return '📎'
}

const downloadFile = (file: any) => {
  // Si el backend expone una URL, abrirla; si no, usar file_path
  const url = file.url ?? `/storage/${file.file_path}`
  window.open(url, '_blank')
}

// ── Calificar ──────────────────────────────────────────────────────────────
function openGrade(sub: any) {
  selectedSub.value      = sub
  gradeForm.value.grade    = sub.grade != null ? String(sub.grade) : ''
  gradeForm.value.feedback = sub.feedback ?? ''
  isGrading.value  = true
  gradeError.value = ''
  gradeSuccess.value = false
}

function cancelGrade() {
  isGrading.value   = false
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
      isGrading.value    = false
      gradeSuccess.value = false
      selectedSub.value  = null
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

      <!-- LOADING -->
      <div v-if="isFetching" class="center-state">
        <div class="spinner"></div>
        <p>Cargando tarea...</p>
      </div>

      <!-- ERROR -->
      <div v-else-if="error" class="error-banner">
        <span>⚠</span> Error al cargar la tarea.
      </div>

      <template v-else-if="task">

        <!-- HEADER -->
        <div class="ContSmall">
          <button class="btn-back" @click="router.back()">← Volver</button>
          <div class="header-body">
            <div class="header-text">
              <h1>{{ task.title }}</h1>
              <p>{{ task.description }}</p>
              <div class="header-meta">
                <span class="meta-chip">
                  Inicio: {{ formatDateShort(task.start_date) }}
                </span>
                <span class="meta-chip deadline">
                  Límite: {{ formatDateShort(task.end_date) }}
                </span>
                <span :class="['status-pill', task.status?.toLowerCase()]">
                  {{ task.status }}
                </span>
              </div>
            </div>

            <div class="header-stats">
              <div class="hstat">
                <span class="hstat-num">{{ submissions.length }}</span>
                <span class="hstat-label">Entregas</span>
              </div>
              <div class="hstat graded">
                <span class="hstat-num">
                  {{ submissions.filter((s: any) => s.status === 'Calificada').length }}
                </span>
                <span class="hstat-label">Calificadas</span>
              </div>
              <div class="hstat pending">
                <span class="hstat-num">
                  {{ submissions.filter((s: any) => s.status !== 'Calificada').length }}
                </span>
                <span class="hstat-label">Pendientes</span>
              </div>
            </div>
          </div>
        </div>

        <!-- SUBMISSIONS -->
        <div class="detail-container">
          <div class="ContBig">

            <div class="section-header">
              <h3>Entregas de alumnos</h3>
              <span class="badge">{{ submissions.length }}</span>
            </div>

            <!-- VACÍO -->
            <div v-if="!submissions.length" class="empty-state">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" stroke-width="1.2">
                <path d="M9 12h6M9 16h6M17 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2z"/>
              </svg>
              <p>Ningún alumno ha entregado esta tarea todavía.</p>
            </div>

            <!-- LISTA DE SUBMISSIONS -->
            <div v-else class="submissions-list">
              <div
                v-for="sub in submissions"
                :key="sub.id"
                :class="['sub-card', { late: isLate(sub), graded: sub.status === 'Calificada' }]"
              >
                <!-- Encabezado del alumno -->
                <div class="sub-header">
                  <div class="student-info">
                    <div class="student-avatar">
                      {{ initials(sub.student?.name, sub.student?.lastname) }}
                    </div>
                    <div>
                      <p class="student-name">
                        {{ sub.student?.name }} {{ sub.student?.lastname }}
                      </p>
                      <p class="sub-date">
                        Entregado: {{ formatDate(sub.submission_date) }}
                      </p>
                    </div>
                  </div>

                  <div class="sub-right">
                    <!-- Badge de estado -->
                    <span v-if="isLate(sub)" class="badge-status late">Tardía</span>
                    <span
                      v-else
                      :class="['badge-status', sub.status === 'Calificada' ? 'graded' : 'pending']"
                    >
                      {{ sub.status }}
                    </span>

                    <!-- Calificación si existe -->
                    <div v-if="sub.grade != null" class="grade-display">
                      <span class="grade-num" :style="{ color: gradeColor(sub.grade) }">
                        {{ sub.grade }}
                      </span>
                      <span class="grade-total">/10</span>
                    </div>

                    <!-- Botón calificar / editar -->
                    <button class="btn-grade" @click="openGrade(sub)">
                      {{ sub.status === 'Calificada' ? '✏️ Editar' : '📝 Calificar' }}
                    </button>
                  </div>
                </div>

                <!-- Archivos adjuntos -->
                <div v-if="sub.files && sub.files.length" class="files-section">
                  <p class="files-label">Archivos adjuntos</p>
                  <div class="files-list">
                    <button
                      v-for="f in sub.files"
                      :key="f.id"
                      class="file-chip"
                      @click="downloadFile(f)"
                      :title="`Descargar ${f.file_name}`"
                    >
                      <span class="file-icon">{{ fileIcon(f.type) }}</span>
                      <span class="file-name">{{ f.file_name }}</span>
                      <span class="file-size" v-if="f.size">
                        {{ (f.size / 1024).toFixed(0) }} KB
                      </span>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/>
                      </svg>
                    </button>
                  </div>
                </div>
                <div v-else class="no-files">
                  Sin archivos adjuntos
                </div>

                <!-- Feedback previo -->
                <div v-if="sub.feedback" class="feedback-box">
                  <p class="feedback-label">Retroalimentación:</p>
                  <p class="feedback-text">{{ sub.feedback }}</p>
                </div>

              </div>
            </div>

          </div>
        </div>

        <!-- MODAL CALIFICAR -->
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
                <p class="modal-student-name">
                  {{ selectedSub?.student?.name }} {{ selectedSub?.student?.lastname }}
                </p>
                <p class="modal-student-date">
                  Entregado: {{ formatDate(selectedSub?.submission_date) }}
                </p>
              </div>
            </div>

            <!-- Archivos en el modal también -->
            <div v-if="selectedSub?.files?.length" class="modal-files">
              <p class="files-label">Archivos del alumno:</p>
              <div class="files-list">
                <button
                  v-for="f in selectedSub.files"
                  :key="f.id"
                  class="file-chip"
                  @click="downloadFile(f)"
                >
                  <span class="file-icon">{{ fileIcon(f.type) }}</span>
                  <span class="file-name">{{ f.file_name }}</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/>
                  </svg>
                </button>
              </div>
            </div>

            <div class="modal-fields">
              <div>
                <label>Calificación (0–10)</label>
                <input
                  v-model="gradeForm.grade"
                  type="number"
                  min="0"
                  max="10"
                  step="0.1"
                  placeholder="Ej. 8.5"
                />
              </div>
              <div>
                <label>Retroalimentación</label>
                <textarea
                  v-model="gradeForm.feedback"
                  placeholder="Comentario para el alumno..."
                  rows="4"
                ></textarea>
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
.bg-page {
  position: fixed;
  inset: 0;
  overflow-x: hidden;
  overflow-y: auto;
  background: linear-gradient(180deg, var(--color-OscuroAzulado), var(--color-OscuroDos));
  z-index: -1;
}

/* ── HEADER ─────────────────────────────────────────────────────────────── */
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
  background: rgba(255,255,255,0.15);
  border: 1px solid rgba(255,255,255,0.25);
  color: white;
  font-size: 0.82rem;
  font-weight: 700;
  padding: 6px 14px;
  border-radius: 8px;
  cursor: pointer;
  margin-bottom: 14px;
  transition: background 0.2s;
}
.btn-back:hover { background: rgba(255,255,255,0.28); }

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
}

.meta-chip {
  font-size: 0.72rem;
  background: rgba(255,255,255,0.15);
  padding: 3px 10px;
  border-radius: 6px;
  font-weight: 600;
}
.meta-chip.deadline { background: rgba(251,191,36,0.25); }

.status-pill {
  font-size: 0.68rem;
  font-weight: 800;
  text-transform: uppercase;
  padding: 3px 12px;
  border-radius: 20px;
}
.status-pill.activa   { background: #dbeafe; color: #1d4ed8; }
.status-pill.cerrada  { background: #fee2e2; color: #dc2626; }
.status-pill.cancelada { background: #f3f4f6; color: #6b7280; }

.header-stats {
  display: flex;
  gap: 12px;
  flex-shrink: 0;
}

.hstat {
  background: rgba(255,255,255,0.12);
  border-radius: 12px;
  padding: 10px 16px;
  text-align: center;
  min-width: 70px;
}
.hstat.graded  { background: rgba(16,185,129,0.2); }
.hstat.pending { background: rgba(251,191,36,0.2); }

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

/* ── LAYOUT ─────────────────────────────────────────────────────────────── */
.detail-container {
  width: 95%;
  max-width: 1000px;
  margin: 20px auto 50px auto;
}

.ContBig {
  background: var(--color-Blanco);
  width: 1000px;
  height: 300px;
  overflow-y: auto;
  border-radius: 20px;
  margin: 30px auto;
  padding: 30px;
  box-shadow: 0 10px 30px #00000030;
}
.section-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
}
.section-header h3 {
  margin: 0;
  font-size: 1.1rem;
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

/* ── SUBMISSION CARD ─────────────────────────────────────────────────────── */
.submissions-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.sub-card {
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 18px 20px;
  background: #fafbfd;
  border-left: 4px solid #e2e8f0;
  transition: box-shadow 0.2s;
}
.sub-card:hover   { box-shadow: 0 4px 16px rgba(0,0,0,0.07); }
.sub-card.graded  { border-left-color: #10b981; }
.sub-card.late    { border-left-color: #f59e0b; }

/* Encabezado */
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
  border-radius: 50%;
  background: var(--color-Azul, #2563eb);
  color: white;
  font-weight: 800;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
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
  gap: 10px;
  flex-wrap: wrap;
}

/* Badges de estado */
.badge-status {
  font-size: 0.68rem;
  font-weight: 800;
  text-transform: uppercase;
  padding: 3px 10px;
  border-radius: 20px;
  letter-spacing: 0.4px;
}
.badge-status.graded  { background: #dcfce7; color: #15803d; }
.badge-status.pending { background: #fffbeb; color: #b45309; }
.badge-status.late    { background: #fef2f2; color: #dc2626; }

/* Grade display */
.grade-display {
  display: flex;
  align-items: baseline;
  gap: 2px;
}
.grade-num   { font-size: 1.6rem; font-weight: 900; line-height: 1; }
.grade-total { font-size: 0.85rem; color: #94a3b8; }

/* Botón calificar */
.btn-grade {
  background: #eff6ff;
  color: #2563eb;
  border: 1px solid #bfdbfe;
  font-weight: 700;
  font-size: 0.8rem;
  padding: 8px 16px;
  border-radius: 9px;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}
.btn-grade:hover {
  background: #2563eb;
  color: white;
  border-color: #2563eb;
}

/* ── ARCHIVOS ─────────────────────────────────────────────────────────────── */
.files-section { margin-top: 14px; }
.files-label {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #94a3b8;
  margin: 0 0 8px 0;
}

.files-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.file-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 6px 12px;
  font-size: 0.78rem;
  color: #374151;
  cursor: pointer;
  transition: all 0.15s;
  font-family: inherit;
}
.file-chip:hover {
  background: #eff6ff;
  border-color: #bfdbfe;
  color: #2563eb;
}

.file-icon { font-size: 1rem; }
.file-name { font-weight: 600; max-width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.file-size { color: #9ca3af; font-size: 0.7rem; }

.no-files {
  margin-top: 12px;
  font-size: 0.78rem;
  color: #cbd5e1;
  font-style: italic;
}

/* ── FEEDBACK ─────────────────────────────────────────────────────────────── */
.feedback-box {
  margin-top: 14px;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 10px;
  padding: 12px 14px;
}
.feedback-label {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  color: #15803d;
  margin: 0 0 4px 0;
}
.feedback-text {
  font-size: 0.85rem;
  color: #166534;
  margin: 0;
  line-height: 1.5;
}

/* ── EMPTY / LOADING / ERROR ────────────────────────────────────────────── */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #94a3b8;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  font-size: 0.95rem;
}

.center-state {
  text-align: center;
  padding: 80px;
  color: var(--color-Azul, #2563eb);
}
.spinner {
  width: 38px;
  height: 38px;
  border: 3px solid #e0e0e0;
  border-top: 3px solid var(--color-Azul, #2563eb);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 14px;
}
@keyframes spin { to { transform: rotate(360deg); } }

.error-banner {
  background: #fee2e2;
  color: #b91c1c;
  border-radius: 12px;
  padding: 16px 24px;
  margin: 30px auto;
  width: 90%;
  max-width: 1000px;
  font-weight: 600;
}

/* ── MODAL ───────────────────────────────────────────────────────────────── */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-box {
  background: white;
  border-radius: 20px;
  padding: 28px;
  width: 100%;
  max-width: 520px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.2);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.modal-header h2 { margin: 0; font-size: 1.15rem; color: #111827; font-weight: 800; }
.modal-close {
  background: #f3f4f6;
  border: none;
  border-radius: 8px;
  padding: 4px 10px;
  font-size: 0.85rem;
  cursor: pointer;
  color: #6b7280;
}

.modal-student {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #f8fafc;
  border-radius: 12px;
  padding: 12px 14px;
}
.modal-student-name {
  margin: 0;
  font-weight: 700;
  color: #1e293b;
  font-size: 0.95rem;
}
.modal-student-date {
  margin: 2px 0 0;
  font-size: 0.75rem;
  color: #94a3b8;
}


.modal-fields {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.modal-fields label {
  font-size: 0.82rem;
  font-weight: 700;
  color: #374151;
  display: block;
  margin-bottom: 4px;
}
.modal-fields input,
.modal-fields textarea {
  border: 1px solid #d1d5db;
  border-radius: 10px;
  padding: 9px 12px;
  font-size: 0.9rem;
  outline: none;
  width: 100%;
  box-sizing: border-box;
  font-family: inherit;
  transition: border-color 0.2s;
}
.modal-fields input:focus,
.modal-fields textarea:focus { border-color: var(--color-Azul, #2563eb); }
.modal-fields textarea { resize: vertical; }

.grade-error {
  font-size: 0.82rem;
  color: #dc2626;
  font-weight: 600;
  margin: 0;
}

.grade-success {
  background: #f0fdf4;
  color: #166534;
  border: 1px solid #bbf7d0;
  border-radius: 10px;
  padding: 10px;
  font-size: 0.85rem;
  font-weight: 700;
  text-align: center;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
.btn-cancel {
  padding: 10px 18px;
  border: none;
  background: #f3f4f6;
  border-radius: 10px;
  font-weight: 700;
  cursor: pointer;
  font-size: 0.88rem;
}
.btn-save {
  padding: 10px 20px;
  border: none;
  background: #2563eb;
  color: white;
  border-radius: 10px;
  font-weight: 700;
  cursor: pointer;
  font-size: 0.88rem;
  transition: background 0.2s;
}
.btn-save:hover { background: #1d4ed8; }

/* ── RESPONSIVE ──────────────────────────────────────────────────────────── */
@media (max-width: 768px) {
  .header-body    { flex-direction: column; }
  .header-stats   { width: 100%; justify-content: space-between; }
  .sub-header     { flex-direction: column; align-items: flex-start; }
  .sub-right      { width: 100%; justify-content: space-between; }
}
</style>
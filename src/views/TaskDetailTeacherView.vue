<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import SidebarLayout from '@/components/TeacherSidebar.vue'
import { useapi } from '@/assets/composables/useApi'

const route = useRoute()
const router = useRouter()
const taskId = route.params.id

// ── Estado ────────────────────────────────────────────────────────────────────
const isEditing = ref(false)
const isSaving  = ref(false)
const saveError = ref('')

const isGrading    = ref(false)
const gradeError   = ref('')
const gradeSuccess = ref(false)

// ── GET tarea ─────────────────────────────────────────────────────────────────
const { data, error, isFetching, execute: reload } = useapi(`/assignments/${taskId}`).json()
const { data: groupsData } = useapi('/groups').json()
const { data: unitsData } = useapi('/units').json()

const task = computed(() => data.value?.data ?? data.value ?? null)

// ── Formulario de edición ─────────────────────────────────────────────────────
const form = ref({
  title: '',
  description: '',
  start_date: '',
  end_date: '',
  status: '',
  group_id: '',
  unit_id: '',
})

function openEdit() {
  if (!task.value) return
  form.value = {
    title:       task.value.title       ?? '',
    description: task.value.description ?? '',
    start_date:  task.value.start_date  ? task.value.start_date.slice(0, 16)  : '',
    end_date:    task.value.end_date    ? task.value.end_date.slice(0, 16)    : '',
    status:      task.value.status      ?? 'Activa',
    group_id:    task.value.group_id    ? String(task.value.group_id)         : '',
    unit_id:     task.value.unit_id     ? String(task.value.unit_id)          : '',
  }
  isEditing.value = true
}

function cancelEdit() {
  isEditing.value = false
  saveError.value  = ''
}

function saveEdit() {
  isSaving.value = true
  saveError.value = ''

  const payload = {
    ...form.value,
    group_id: Number(form.value.group_id),
    unit_id: Number(form.value.unit_id),
    start_date: form.value.start_date.replace('T', ' ') + ':00',
    end_date: form.value.end_date.replace('T', ' ') + ':00',
  }

  const { data: res, onFetchResponse, onFetchError } = useapi(`/assignments/${taskId}`)
    .put(payload)
    .json()

  onFetchResponse(async () => {
    isSaving.value = false
    isEditing.value = false
    await reload()
  })

  onFetchError(() => {
    isSaving.value = false
    saveError.value = res.value?.message ?? 'Error al guardar los cambios.'
  })
}

// ── Lógica de Calificación ────────────────────────────────────────────────────
const gradeForm = ref({ grade: '', feedback: '' })

function openGrade() {
  if (task.value?.submission?.grade != null) {
    gradeForm.value.grade = String(task.value.submission.grade)
    gradeForm.value.feedback = task.value.submission.feedback ?? ''
  } else {
    gradeForm.value = { grade: '', feedback: '' }
  }
  isGrading.value = true
  gradeError.value = ''
  gradeSuccess.value = false
}

function cancelGrade() {
  isGrading.value = false
  gradeError.value = ''
}

function saveGrade() {
  const submissionId = task.value?.submission?.id
  if (!submissionId) return

  const gradeNum = Number(gradeForm.value.grade)
  const maxPoints = task.value?.points ?? 100

  if (isNaN(gradeNum) || gradeNum < 0 || gradeNum > maxPoints) {
    gradeError.value = `La calificación debe estar entre 0 y ${maxPoints}.`
    return
  }

  const { data: res, onFetchResponse, onFetchError } = useapi(`/submissions/${submissionId}/grade`)
    .patch({ 
      grade: gradeNum, 
      feedback: gradeForm.value.feedback 
    })
    .json()

  onFetchResponse(async () => {
    gradeSuccess.value = true
    await reload()
    setTimeout(() => { 
      isGrading.value = false
      gradeSuccess.value = false 
    }, 1500)
  })

  onFetchError(() => {
    gradeError.value = res.value?.message ?? 'Error al procesar la calificación.'
  })
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleString('es-MX', {
    day: '2-digit', month: 'long', hour: '2-digit', minute: '2-digit',
  })

const isLate = computed(() => {
  if (!task.value?.submission) return false
  return new Date(task.value.submission.submission_date) > new Date(task.value.end_date)
})

const statusClass = computed(() => task.value?.status?.toLowerCase() ?? '')
</script>

<template>
  <div class="bg-page">
    <SidebarLayout>

      <div v-if="isFetching" class="center-state">
        <div class="spinner"></div>
        <p>Cargando tarea...</p>
      </div>

      <div v-else-if="error" class="error-banner">
        <span>⚠</span>
        <p>Error al cargar la tarea.</p>
      </div>

      <template v-else-if="task">

        <div class="ContSmall">
          <button class="btn-back" @click="router.back()">← Volver</button>

          <div class="header-body">
            <div class="header-text">
              <h1>{{ task.title }}</h1>
              <p>
                Inicio: {{ formatDate(task.start_date) }} &nbsp;·&nbsp;
                Límite: {{ formatDate(task.end_date) }}
              </p>
            </div>

            <div class="header-right">
              <span class="status-pill" :class="statusClass">{{ task.status }}</span>
              <button class="btn-edit" @click="openEdit">✏ Editar</button>
            </div>
          </div>
        </div>

        <Teleport to="body">
          <div v-if="isEditing" class="modal-overlay" @click.self="cancelEdit">
            <div class="modal-box">
              <h2>Editar Tarea</h2>

              <label>Título</label>
              <input v-model="form.title" type="text" placeholder="Título de la tarea" />

              <label>Descripción</label>
              <textarea v-model="form.description" placeholder="Descripción..."></textarea>

              <div class="modal-grid">
                <div>
                  <label>Fecha de inicio</label>
                  <input v-model="form.start_date" type="datetime-local" />
                </div>
                <div>
                  <label>Fecha de entrega</label>
                  <input v-model="form.end_date" type="datetime-local" />
                </div>
              </div>

              <div class="modal-grid">
                <div>
                  <label>Grupo</label>
                  <select v-model="form.group_id">
                    <option value="">Selecciona un grupo</option>
                    <option v-for="g in groupsData?.data ?? []" :key="g.id" :value="g.id">
                      {{ g.name }}
                    </option>
                  </select>
                </div>
                <div>
                  <label>Unidad</label>
                  <select v-model="form.unit_id">
                    <option value="">Selecciona una unidad</option>
                    <option v-for="u in unitsData?.data ?? []" :key="u.id" :value="u.id">
                      {{ u.name }}
                    </option>
                  </select>
                </div>
              </div>

              <label>Estado</label>
              <select v-model="form.status">
                <option value="Activa">Activa</option>
                <option value="Cerrada">Cerrada</option>
                <option value="Cancelada">Cancelada</option>
              </select>

              <p v-if="saveError" class="save-error">{{ saveError }}</p>

              <div class="modal-actions">
                <button class="btn-cancel" @click="cancelEdit" :disabled="isSaving">Cancelar</button>
                <button class="btn-save" @click="saveEdit" :disabled="isSaving">
                  {{ isSaving ? 'Guardando...' : 'Guardar cambios' }}
                </button>
              </div>
            </div>
          </div>
        </Teleport>

        <Teleport to="body">
          <div v-if="isGrading" class="modal-overlay" @click.self="cancelGrade">
            <div class="modal-box">
              <h2>Calificar entrega</h2>
              <p class="grade-subtitle">
                Alumno: <strong>{{ task.submission?.student_name ?? 'Estudiante' }}</strong>
              </p>

              <label>Calificación (0 – {{ task.points ?? 100 }})</label>
              <input v-model="gradeForm.grade" type="number" :max="task.points ?? 100" />

              <label>Retroalimentación</label>
              <textarea v-model="gradeForm.feedback" placeholder="Comentarios del profesor..."></textarea>

              <p v-if="gradeError" class="save-error">{{ gradeError }}</p>
              <div v-if="gradeSuccess" class="success-banner">✅ Calificación guardada con éxito.</div>

              <div class="modal-actions">
                <button class="btn-cancel" @click="cancelGrade">Cancelar</button>
                <button class="btn-save" @click="saveGrade" :disabled="!gradeForm.grade">
                  Guardar nota
                </button>
              </div>
            </div>
          </div>
        </Teleport>

        <div class="detail-container">

          <div class="ContBig">
            <div class="section-tag">Instrucciones</div>
            <p class="description-text">{{ task.description }}</p>
          </div>

          <div class="ContBig submission-section" :class="{ graded: task.submission?.status === 'Calificada' }">
            <div class="submission-header">
              <div class="title-group">
                <h3>Entrega del alumno</h3>
                <span v-if="isLate" class="late-status">Entrega tardía</span>
                <span v-else-if="task.submission" class="status-ok">{{ task.submission.status }}</span>
                <span v-else class="status-pending">Sin entrega</span>
              </div>

              <div class="header-actions">
                <div v-if="task.submission?.grade != null" class="grade-display">
                  <span class="score">{{ task.submission.grade }}</span>
                  <span class="sep">/</span>
                  <span class="total">{{ task.points ?? 100 }}</span>
                </div>
                <button v-if="task.submission" class="btn-grade" @click="openGrade">
                  {{ task.submission.status === 'Calificada' ? '✏ Editar nota' : '✔ Calificar' }}
                </button>
              </div>
            </div>

            <div v-if="task.submission" class="submission-body">
              <div v-if="task.submission.files?.length" class="student-files">
                <div v-for="file in task.submission.files" :key="file.id" class="student-file-item">
                  <span>📎</span>
                  <span class="file-name">{{ file.name }}</span>
                </div>
              </div>

              <div v-if="task.submission.feedback" class="comment-box">
                <div class="avatar-circle">
                  {{ task.submission.student_name?.charAt(0) ?? 'A' }}
                </div>
                <div class="comment-content">
                  <strong>Retroalimentación del profesor</strong>
                  <p>{{ task.submission.feedback }}</p>
                </div>
              </div>

              <p class="sub-date">
                Fecha de envío: {{ formatDate(task.submission.submission_date) }}
              </p>
            </div>

            <div v-else class="empty-submission">
              <p>El alumno aún no ha enviado su trabajo.</p>
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

/* ── LAYOUT ─────────────────────────────────────────────────────────────── */
.detail-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 95%;
  max-width: 1000px;
  margin: 20px auto 50px auto;
}

/* ── HEADER ─────────────────────────────────────────────────────────────── */
.ContSmall {
  background: var(--color-Azul);
  width: 95%;
  max-width: 1000px;
  border-radius: 20px;
  margin: 30px auto 0 auto;
  padding: 20px 30px;
  color: white;
}

.btn-back {
  background: rgba(255,255,255,0.15);
  border: none;
  color: white;
  font-size: 0.85rem;
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
  gap: 16px;
  flex-wrap: wrap;
}

.header-text h1 {
  font-size: 1.4rem;
  margin: 0 0 6px 0;
}
.header-text p {
  font-size: 0.82rem;
  opacity: 0.85;
  margin: 0;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.status-pill {
  font-size: 0.72rem;
  font-weight: 800;
  text-transform: uppercase;
  padding: 4px 12px;
  border-radius: 20px;
  letter-spacing: 0.5px;
}
.status-pill.activa   { background: #dbeafe; color: #1d4ed8; }
.status-pill.inactiva { background: #f3f4f6; color: #6b7280; }
.status-pill.cerrada  { background: #fee2e2; color: #dc2626; }

.btn-edit {
  background: white;
  color: var(--color-Azul);
  border: none;
  font-weight: 700;
  font-size: 0.85rem;
  padding: 8px 18px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}
.btn-edit:hover { background: #dbeafe; }

/* ── CONTENEDOR PRINCIPAL ────────────────────────────────────────────────── */
.ContBig {
  background: white;
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  border: 1px solid #e2e8f0;
}

.section-tag {
  font-size: 0.7rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: var(--color-Azul);
  margin-bottom: 14px;
}

.description-text {
  line-height: 1.7;
  color: #374151;
  white-space: pre-wrap;
  margin: 0;
}

/* ── ENTREGA ─────────────────────────────────────────────────────────────── */
.submission-section {
  border-top: 5px solid #e2e8f0;
}
.submission-section.graded { border-top-color: #10b981; }

.submission-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 12px;
}
.title-group h3 { margin: 0 0 6px 0; font-size: 1.1rem; color: #1e293b; }

.status-ok      { font-size: 0.8rem; font-weight: 700; color: #10b981; }
.late-status    { font-size: 0.8rem; font-weight: 700; color: #ef4444; }
.status-pending { font-size: 0.8rem; font-weight: 700; color: #f59e0b; }

.header-actions {
  display: flex;
  align-items: center;
  gap: 15px;
}

.grade-display { text-align: right; }
.grade-display .score { font-size: 1.8rem; font-weight: 900; color: #10b981; }
.grade-display .sep   { font-size: 1.1rem; color: #94a3b8; margin: 0 2px; }
.grade-display .total { font-size: 1rem;  color: #94a3b8; }

.btn-grade {
  background: var(--color-Azul);
  color: white;
  border: none;
  font-weight: 700;
  padding: 10px 18px;
  border-radius: 10px;
  cursor: pointer;
  transition: transform 0.1s;
}
.btn-grade:active { transform: scale(0.96); }

.student-files {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 20px;
}
.student-file-item {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f1f5f9;
  padding: 7px 14px;
  border-radius: 20px;
  font-size: 0.83rem;
  color: #334155;
}

.sub-date {
  font-size: 0.78rem;
  color: #94a3b8;
  margin-top: 16px;
  border-top: 1px solid #f1f5f9;
  padding-top: 12px;
}

.comment-box {
  display: flex;
  gap: 14px;
  padding-top: 18px;
  border-top: 1px solid #f1f5f9;
}
.avatar-circle {
  width: 34px;
  height: 34px;
  min-width: 34px;
  background: var(--color-Azul);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.9rem;
}
.comment-content strong { font-size: 0.85rem; color: #374151; }
.comment-content p { font-size: 0.88rem; color: #6b7280; margin: 5px 0 0 0; line-height: 1.5; }

.empty-submission {
  text-align: center;
  padding: 30px;
  color: #94a3b8;
  font-size: 0.95rem;
}

/* ── LOADING / ERROR ─────────────────────────────────────────────────────── */
.center-state {
  text-align: center;
  padding: 80px;
  color: var(--color-Azul);
}
.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e0e0e0;
  border-top: 4px solid var(--color-Azul);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
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
  display: flex;
  gap: 12px;
  align-items: center;
  font-weight: 600;
}

/* ── MODAL ───────────────────────────────────────────────────────────────── */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}
.modal-box {
  background: white;
  border-radius: 20px;
  padding: 32px;
  width: 100%;
  max-width: 560px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.2);
}
.modal-box h2 {
  margin: 0 0 8px 0;
  font-size: 1.2rem;
  color: #111827;
}
.modal-box label {
  font-size: 0.85rem;
  font-weight: 700;
  color: #374151;
}
.modal-box input,
.modal-box textarea,
.modal-box select {
  border: 1px solid #d1d5db;
  border-radius: 10px;
  padding: 10px 12px;
  font-size: 0.93rem;
  outline: none;
  width: 100%;
  box-sizing: border-box;
  transition: border-color 0.2s;
}
.modal-box input:focus,
.modal-box textarea:focus,
.modal-box select:focus {
  border-color: var(--color-Azul);
}

.grade-subtitle {
  font-size: 0.9rem;
  color: #6b7280;
  margin-bottom: 5px;
}

.success-banner {
  background: #f0fdf4;
  color: #166534;
  border: 1px solid #bbf7d0;
  padding: 10px;
  border-radius: 10px;
  font-size: 0.85rem;
  font-weight: 600;
  text-align: center;
}

.modal-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.save-error {
  color: #dc2626;
  font-size: 0.83rem;
  margin: 0;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 6px;
}
.btn-cancel {
  padding: 10px 18px;
  border: none;
  background: #f3f4f6;
  border-radius: 10px;
  font-weight: 700;
  cursor: pointer;
}
.btn-save {
  padding: 10px 20px;
  border: none;
  background: var(--color-Azul);
  color: white;
  border-radius: 10px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-save:hover:not(:disabled) { background: #1d4ed8; }
.btn-save:disabled,
.btn-cancel:disabled { opacity: 0.6; cursor: not-allowed; }

/* ── RESPONSIVE ──────────────────────────────────────────────────────────── */
@media (max-width: 768px) {
  .ContSmall { padding: 16px 20px; }
  .header-body { flex-direction: column; }
  .header-right { flex-wrap: wrap; }
  .ContBig { padding: 20px; }
  .modal-grid { grid-template-columns: 1fr; }
  .submission-header { flex-direction: column; }
  .grade-display { text-align: left; }
  .header-actions { width: 100%; justify-content: space-between; }
}
</style>
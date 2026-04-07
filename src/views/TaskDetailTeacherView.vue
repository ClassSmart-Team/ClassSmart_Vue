<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import SidebarLayout from '@/components/TeacherSidebar.vue'
import { useapi } from '@/assets/composables/useApi'

const route = useRoute()
const router = useRouter()
const taskId = route.params.id

// ── Estado ─────────────────────────────────────────
const isEditing = ref(false)
const isSaving  = ref(false)
const saveError = ref('')

const isGrading    = ref(false)
const gradeError   = ref('')
const gradeSuccess = ref(false)
const selectedSubmission = ref<any>(null)

// ── GET tarea ──────────────────────────────────────
const { data, error, isFetching, execute: reload } = useapi(`/assignments/${taskId}`).json()

const task = computed(() => data.value?.data ?? data.value ?? null)

//  IMPORTANTE: ahora sí usamos TODAS las submissions
const submissions = computed(() => task.value?.submissions ?? [])

// ── Calificar ──────────────────────────────────────
const gradeForm = ref({ grade: '', feedback: '' })

function openGrade(sub: any) {
  selectedSubmission.value = sub

  gradeForm.value.grade = sub.grade != null ? String(sub.grade) : ''
  gradeForm.value.feedback = sub.feedback ?? ''

  isGrading.value = true
  gradeError.value = ''
  gradeSuccess.value = false
}

function cancelGrade() {
  isGrading.value = false
  selectedSubmission.value = null
}

function saveGrade() {
  const submissionId = selectedSubmission.value?.id
  if (!submissionId) return

  const gradeNum = Number(gradeForm.value.grade)

  if (isNaN(gradeNum) || gradeNum < 0 || gradeNum > 10) {
    gradeError.value = 'La calificación debe estar entre 0 y 10'
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
      selectedSubmission.value = null
    }, 1200)
  })

  onFetchError(() => {
    gradeError.value = res.value?.message ?? 'Error al calificar'
  })
}

// ── Helpers ────────────────────────────────────────
const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleString('es-MX', {
    day: '2-digit',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit'
  })

const isLate = (sub: any) => {
  return new Date(sub.submission_date) > new Date(task.value.end_date)
}
</script>
<template>
  <div class="bg-page">
    <SidebarLayout>

      <!-- LOADING -->
      <div v-if="isFetching" class="center-state">
        <p>Cargando...</p>
      </div>

      <!-- ERROR -->
      <div v-else-if="error">
        <p>Error al cargar</p>
      </div>

      <!-- CONTENIDO -->
      <template v-else-if="task">

        <div class="ContSmall">
          <button @click="router.back()">← Volver</button>
          <h1>{{ task.title }}</h1>
        </div>

        <!-- LISTA DE ENTREGAS -->
        <div class="detail-container">

          <div class="ContBig">
            <h3>Entregas</h3>

            <!--  LOOP DE TODAS LAS SUBMISSIONS -->
            <div
              v-for="sub in submissions"
              :key="sub.id"
              class="submission-card"
            >
              <div class="submission-header">

                <div>
                  <strong>{{ sub.student?.name }}</strong>
                  <p>{{ formatDate(sub.submission_date) }}</p>

                  <span v-if="isLate(sub)" class="late">Tarde</span>
                  <span v-else>{{ sub.status }}</span>
                </div>

                <div>
                  <span v-if="sub.grade != null">
                    {{ sub.grade }}/10
                  </span>

                  <button @click="openGrade(sub)">
                    {{ sub.status === 'Calificada' ? 'Editar' : 'Calificar' }}
                  </button>
                </div>

              </div>

              <!-- ARCHIVOS -->
              <div v-if="sub.files?.length">
                <div v-for="f in sub.files" :key="f.id">
                  📎 {{ f.file_name }}
                </div>
              </div>

              <!-- FEEDBACK -->
              <div v-if="sub.feedback">
                <strong>Feedback:</strong>
                <p>{{ sub.feedback }}</p>
              </div>

            </div>

            <p v-if="!submissions.length">
              No hay entregas aún.
            </p>

          </div>

        </div>

        <!-- MODAL CALIFICAR -->
        <div v-if="isGrading" class="modal-overlay">
          <div class="modal-box">

            <h2>Calificar</h2>

            <p>
              Alumno:
              <strong>{{ selectedSubmission?.student?.name }}</strong>
            </p>

            <input
              v-model="gradeForm.grade"
              type="number"
              placeholder="Calificación"
            />

            <textarea
              v-model="gradeForm.feedback"
              placeholder="Feedback"
            />

            <p v-if="gradeError">{{ gradeError }}</p>
            <p v-if="gradeSuccess">Guardado ✅</p>

            <button @click="cancelGrade">Cancelar</button>
            <button @click="saveGrade">Guardar</button>

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
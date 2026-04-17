<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import SidebarLayout from '@/components/StudentSideBar.vue'
import { useapi } from '@/assets/composables/useApi'
import { useAuthStore } from '@/stores/authStore'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const taskId = route.params.id

// ── GET tarea ─────────────────────────────────────────────────────────────────
const { data, error, isFetching, execute: reload } = useapi(`/my-assignments/${taskId}`).json()
const task = computed(() => data.value?.data ?? data.value ?? null)

const submission = computed(() => {
  return task.value?.submissions?.[0] ?? null
})

const isGraded = computed(() => submission.value?.status === 'Calificada')

// ── Estado de entrega ─────────────────────────────────────────────────────────
const selectedFile = ref<File | null>(null)
const isSubmitting = ref(false)
const submitError = ref('')
const submitSuccess = ref(false)

function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement
  selectedFile.value = input.files?.[0] ?? null
}

async function submitTask() {
  if (!selectedFile.value) {
    submitError.value = 'Selecciona un archivo antes de entregar.'
    return
  }

  isSubmitting.value = true
  submitError.value = ''

  try {
    const fd = new FormData()
    fd.append('assignment_id', String(taskId))
    fd.append('file', selectedFile.value)

    const token = auth.credentials?.token

    const res = await fetch(`https://api.sutando-user.me/api/submissions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
      body: fd,
    })

    const json = await res.json()

    if (!res.ok) {
      submitError.value = json.message ?? 'Error al entregar la tarea.'
      return
    }

    submitSuccess.value = true
    selectedFile.value = null
    await reload()
  } catch (err) {
    submitError.value = 'Error de conexión. Intenta de nuevo.'
  } finally {
    isSubmitting.value = false
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const formatDate = (d: string) =>
  new Date(d).toLocaleString('es-MX', {
    day: '2-digit',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  })

const isLate = computed(() => {
  if (!submission.value) return false
  return new Date(submission.value.submission_date) > new Date(task.value.end_date)
})

const timeLeft = computed(() => {
  if (!task.value) return ''
  const diff = new Date(task.value.end_date).getTime() - Date.now()
  if (diff <= 0) return 'Fecha límite vencida'
  const days = Math.floor(diff / 86400000)
  const hours = Math.floor((diff % 86400000) / 3600000)
  return days > 0 ? `${days}d ${hours}h restantes` : `${hours}h restantes`
})
</script>

<template>
  <SidebarLayout>
    <!-- LOADING -->
    <div v-if="isFetching" class="center-state">
      <div class="spinner"></div>
      <p>Cargando tarea...</p>
    </div>

    <!-- ERROR -->
    <div v-else-if="error" class="error-banner">
      <span>⚠</span>
      <p>Error al cargar la tarea.</p>
    </div>

    <!-- CONTENIDO -->
    <template v-else-if="task">
      <!-- HEADER -->
      <div class="ContSmall">
        <button class="btn-back" @click="router.back()">← Volver</button>
        <div class="header-body">
          <div class="header-text">
            <h1>{{ task.title }}</h1>
            <p>Límite: {{ formatDate(task.end_date) }}</p>
          </div>
          <div class="header-right">
            <div class="header-meta-right">
              <span class="time-chip" :class="{ urgent: timeLeft.includes('h restantes') }">
                {{ timeLeft }}
              </span>
              <h3 class="header-subtitle">{{ task.group?.name }}</h3>
              <h3 class="header-subtitle2">Prof. {{ task.group?.owner?.name }}</h3>
            </div>
          </div>
        </div>
      </div>

      <!-- CUERPO -->
      <div class="detail-container">
        <!-- INSTRUCCIONES -->
        <div class="ContBig">
          <div class="section-tag">Instrucciones</div>
          <p class="description-text">{{ task.description }}</p>

          <div v-if="task.resources?.length" class="resources-grid">
            <div v-for="file in task.resources" :key="file.id" class="resource-card">
              <span>📄</span>
              <div class="file-meta">
                <span class="name">{{ file.name }}</span>
                <span class="size">{{ file.size }}</span>
              </div>
              <button class="download-mini">↓</button>
            </div>
          </div>
        </div>

        <!-- ENTREGA -->
        <div
          class="ContBig submission-section"
          :class="{
            graded: isGraded,
            submitted: submission && !isGraded,
          }"
        >
          <!-- CALIFICADA -->
          <template v-if="isGraded">
            <div class="submission-header">
              <div>
                <h3>Resultado</h3>
                <span class="status-ok">Calificada</span>
              </div>
              <div class="grade-display">
                <span class="score">{{ submission?.grade }}</span>
                <span class="sep">/</span>
                <span class="total">{{ task.points ?? 100 }}</span>
              </div>
            </div>

            <div v-if="submission?.feedback" class="feedback-box">
              <strong>💬 Retroalimentación del profesor</strong>
              <p>{{ submission?.feedback }}</p>
            </div>
          </template>

          <!-- ENTREGADA -->
          <template v-else-if="submission">
            <div class="submission-header">
              <div>
                <h3>Tu entrega</h3>
                <span v-if="isLate" class="late-status">Entregada con retraso</span>
                <span v-else class="status-pending">Pendiente de calificación</span>
              </div>
            </div>

            <div v-if="submission?.files?.length" class="student-files">
              <div v-for="file in submission.files" :key="file.id" class="student-file-item">
                <span>📎</span>
                <span>{{ file.name }}</span>
                <span class="file-size">({{ file.size }})</span>
              </div>
            </div>

            <p class="sub-date">Entregado: {{ formatDate(submission?.submission_date) }}</p>
          </template>

          <!-- NO ENTREGADA -->
          <template v-else>
            <h3>Entregar tarea</h3>

            <div class="upload-area" @click="($refs.fileInput as HTMLInputElement).click()">
              <input ref="fileInput" type="file" class="hidden-input" @change="onFileChange" />
              <div v-if="!selectedFile" class="upload-placeholder">
                <span class="upload-icon">📁</span>
                <p>Haz clic para seleccionar un archivo</p>
                <span class="upload-hint">PDF, Word, ZIP — máx. 10MB</span>
              </div>
              <div v-else class="upload-selected">
                <span>📎</span>
                <span class="file-name">{{ selectedFile.name }}</span>
                <span class="file-size">
                  ({{ (selectedFile.size / 1024 / 1024).toFixed(2) }} MB)
                </span>
              </div>
            </div>

            <p v-if="submitError" class="submit-error">{{ submitError }}</p>

            <div v-if="submitSuccess" class="success-banner">Tarea entregada correctamente.</div>

            <div class="submit-actions">
              <button
                v-if="selectedFile"
                class="btn-clear"
                @click="selectedFile = null"
                :disabled="isSubmitting"
              >
                Quitar archivo
              </button>
              <button
                class="btn-submit"
                @click="submitTask"
                :disabled="isSubmitting || !selectedFile"
              >
                {{ isSubmitting ? 'Entregando...' : 'Entregar tarea' }}
              </button>
            </div>
          </template>
        </div>
      </div>
    </template>
  </SidebarLayout>
</template>

<style scoped>
.detail-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 95%;
  max-width: 1000px;
  margin: 20px auto 50px auto;
}

/* HEADER */
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
  background: rgba(255, 255, 255, 0.15);
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
.btn-back:hover {
  background: rgba(255, 255, 255, 0.28);
}
.header-body {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 12px;
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
.time-chip {
  background: rgba(255, 255, 255, 0.2);
  padding: 5px 14px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 700;
}
.time-chip.urgent {
  background: #fef3c7;
  color: #92400e;
}

.header-right {
  text-align: right;
}

.header-meta-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.header-subtitle {
  font-weight: 600;
  margin: 0;
  opacity: 0.9;
  color: #f0f7ff;
  line-height: 1.2;
}

.header-subtitle2 {
  font-weight: 600;
  margin-bottom: 15%;
  opacity: 0.9;
  color: #f0f7ff;
  line-height: 1.2;
}

/* CONTENEDORES */
.ContBig {
  background: white;
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
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

/* RECURSOS */
.resources-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 12px;
  margin-top: 22px;
  border-top: 1px solid #f1f5f9;
  padding-top: 18px;
}
.resource-card {
  display: flex;
  align-items: center;
  gap: 10px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 10px 14px;
  cursor: pointer;
  transition: background 0.2s;
}
.resource-card:hover {
  background: #f8fafc;
}
.file-meta .name {
  display: block;
  font-size: 0.82rem;
  font-weight: 600;
  color: #1e293b;
  max-width: 130px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.file-meta .size {
  font-size: 0.7rem;
  color: #94a3b8;
}
.download-mini {
  margin-left: auto;
  background: none;
  border: none;
  color: var(--color-Azul);
  font-size: 1.1rem;
  cursor: pointer;
  font-weight: bold;
}

/* SUBMISSION */
.submission-section {
  border-top: 5px solid #e2e8f0;
}
.submission-section.graded {
  border-top-color: #10b981;
}
.submission-section.submitted {
  border-top-color: #f59e0b;
}

.submission-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 12px;
}
.submission-header h3 {
  margin: 0 0 6px 0;
  font-size: 1.1rem;
  color: #1e293b;
}
.status-ok {
  font-size: 0.8rem;
  font-weight: 700;
  color: #10b981;
}
.late-status {
  font-size: 0.8rem;
  font-weight: 700;
  color: #ef4444;
}
.status-pending {
  font-size: 0.8rem;
  font-weight: 700;
  color: #f59e0b;
}

.grade-display .score {
  font-size: 1.8rem;
  font-weight: 900;
  color: #10b981;
}
.grade-display .sep {
  font-size: 1.1rem;
  color: #94a3b8;
  margin: 0 2px;
}
.grade-display .total {
  font-size: 1rem;
  color: #94a3b8;
}

.feedback-box {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 12px;
  padding: 16px 20px;
  margin-top: 10px;
}
.feedback-box strong {
  font-size: 0.88rem;
  color: #15803d;
}
.feedback-box p {
  margin: 8px 0 0 0;
  color: #374151;
  line-height: 1.6;
}

.student-files {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 16px;
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
.file-size {
  color: #94a3b8;
  font-size: 0.75rem;
}
.sub-date {
  font-size: 0.78rem;
  color: #94a3b8;
  margin-top: 14px;
  border-top: 1px solid #f1f5f9;
  padding-top: 12px;
}

/* UPLOAD AREA */
.upload-area {
  border: 2px dashed #cbd5e1;
  border-radius: 14px;
  padding: 30px;
  text-align: center;
  cursor: pointer;
  transition:
    border-color 0.2s,
    background 0.2s;
  margin: 16px 0;
}
.upload-area:hover {
  border-color: var(--color-Azul);
  background: #f0f7ff;
}
.hidden-input {
  display: none;
}
.upload-icon {
  font-size: 2rem;
  display: block;
  margin-bottom: 10px;
}
.upload-placeholder p {
  margin: 0;
  color: #374151;
  font-weight: 600;
}
.upload-hint {
  font-size: 0.78rem;
  color: #94a3b8;
  margin-top: 6px;
  display: block;
}
.upload-selected {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-size: 0.9rem;
  color: #1e293b;
  font-weight: 600;
}
.file-name {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.submit-error {
  color: #dc2626;
  font-size: 0.83rem;
  margin: 0;
}
.success-banner {
  background: #f0fdf4;
  color: #15803d;
  border: 1px solid #bbf7d0;
  border-radius: 10px;
  padding: 12px 16px;
  font-weight: 600;
  font-size: 0.9rem;
}
.submit-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 10px;
}
.btn-clear {
  padding: 10px 18px;
  border: none;
  background: #f3f4f6;
  border-radius: 10px;
  font-weight: 700;
  cursor: pointer;
}
.btn-submit {
  padding: 10px 22px;
  border: none;
  background: var(--color-Azul);
  color: white;
  border-radius: 10px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-submit:hover:not(:disabled) {
  background: #1d4ed8;
}
.btn-submit:disabled,
.btn-clear:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

/* ESTADOS */
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
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
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

/* RESPONSIVE */
@media (max-width: 768px) {
  .ContSmall {
    padding: 16px 20px;
  }
  .header-body {
    flex-direction: column;
  }
  .ContBig {
    padding: 20px;
  }
  .submission-header {
    flex-direction: column;
  }
  .grade-display {
    text-align: left;
  }
}
@media (max-width: 480px) {
  .header-text h1 {
    font-size: 1.1rem;
  }
  .upload-area {
    padding: 20px 15px;
  }
  .resources-grid {
    grid-template-columns: 1fr;
  }
}
</style>

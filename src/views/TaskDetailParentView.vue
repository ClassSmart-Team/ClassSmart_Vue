<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useRouter } from 'vue-router'
import SidebarLayout from '@/components/ParentSidebar.vue'
import { useapi } from '@/assets/composables/useApi'

const route = useRoute()
const router = useRouter()
const assignmentId = route.params.id
const childId = route.params.childId

const { data, error, isFetching } = useapi(
  `/parent-assignments/${assignmentId}?child_id=${childId}`,
).json()

const assignment = computed(() => data.value?.data || null)

const formatDate = (dateStr: string) => {
  if (!dateStr) return ''

  const d = new Date(dateStr)

  const day = String(d.getUTCDate()).padStart(2, '0')
  const month = d.toLocaleString('es-MX', { month: 'short', timeZone: 'UTC' })
  const year = d.getUTCFullYear()
  const hours = String(d.getUTCHours()).padStart(2, '0')
  const minutes = String(d.getUTCMinutes()).padStart(2, '0')

  return `${day} ${month} ${year}, ${hours}:${minutes}`
}

const isLate = computed(() => {
  if (!assignment.value?.submission?.submission_date || !assignment.value?.end_date) {
    return false
  }
  return new Date(assignment.value.submission.submission_date) > new Date(assignment.value.end_date)
})

const isGraded = computed(() => {
  return !!assignment.value?.submission && assignment.value.submission.grade !== null
})

const downloadFile = async (fileId: number, fileName: string) => {
  // .blob() le dice a useapi que se espera un archivo binario
  const { data, error } = await useapi(`/files/${fileId}/download`).blob()

  if (error.value || !data.value) {
    alert('No se pudo descargar el archivo')
    return
  }

  const url = window.URL.createObjectURL(data.value)

  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', fileName)
  document.body.appendChild(link)
  link.click()

  link.remove()
  window.URL.revokeObjectURL(url)
}

const viewFile = async (fileId: number) => {
  const { data, error } = await useapi(`/files/${fileId}/view`).blob()

  if (error.value || !data.value) {
    alert('No se pudo abrir el visor de archivos')
    return
  }

  const url = window.URL.createObjectURL(data.value)
  window.open(url, '_blank')
}

const timeLeft = computed(() => {
  if (!assignment.value) return ''
  const diff = new Date(assignment.value.end_date).getTime() - Date.now()
  if (diff <= 0) return 'Fecha límite vencida'
  const days = Math.floor(diff / 86400000)
  const hours = Math.floor((diff % 86400000) / 3600000)
  return days > 0 ? `${days}d ${hours}h restantes` : `${hours}h restantes`
})
</script>

<template>
  <div class="bg-page">
    <SidebarLayout>
      <div v-if="assignment" class="header-box header-flex">
        <div class="header-body">
          <div class="header-left-section">
            <button class="back-btn" @click="router.back()" title="Regresar">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="3"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </button>

            <div class="header-text">
              <h1>{{ assignment?.title }}</h1>
              <p>Fecha límite: {{ formatDate(assignment.end_date) }}</p>
              <span class="time-chip" :class="{ urgent: timeLeft.includes('h restantes') }">
                {{ timeLeft }}
              </span>
            </div>
          </div>

          <div class="points-badge">
            <span class="pts-number">{{ assignment.points }}</span>
            <span class="pts-text">puntos</span>
          </div>
        </div>
      </div>

      <div v-if="isFetching" class="state-container">
        <div class="loader-dots"></div>
        <p class="state-msg">Cargando detalles de la tarea...</p>
      </div>

      <div v-else-if="error || !assignment" class="state-container error">
        <div class="icon-circle">
          <img src="@/components/advertencia-triangulo.png" alt="advertencia" />
        </div>
        <p class="state-msg">No se pudo cargar la información de la tarea.</p>
      </div>

      <div v-else class="detail-container">
        <section class="main-box assignment-info">
          <div class="section-tag">Instrucciones</div>
          <p class="description">{{ assignment.description }}</p>

          <div v-if="assignment.resources?.length > 0" class="files-grid">
            <div
              v-for="file in assignment.resources"
              :key="file.id"
              class="resource-card"
              @click="viewFile(file.id)"
              style="cursor: pointer"
            >
              <div class="file-preview">📄</div>
              <div class="file-meta">
                <span class="name">{{ file.name }}</span>
              </div>
              <button
                @click="downloadFile(file.id, file.name)"
                class="download-mini"
                title="Descargar"
                style="cursor: pointer"
              >
                <img src="@/components/descarga_logo.png" alt="descarga" />
              </button>
            </div>
          </div>
        </section>

        <section class="main-box submission-info">
          <div class="submission-header">
            <div class="title-group" style="width: 100%">
              <div class="submission-title-row">
                <div class="section-tag">Trabajo del estudiante</div>
                <div class="status-tags">
                  <span v-if="isLate" class="late-status">Entregado con retraso</span>
                  <span v-else-if="assignment.submission" class="status-pill">Entregado</span>
                  <span v-else class="status-pill pending">Sin entregar</span>
                </div>
              </div>

              <div
                v-if="!assignment.submission || assignment.submission.files?.length === 0"
                class="upload-area"
              >
                <div class="upload-placeholder">
                  <span class="upload-icon">📁</span>
                  <p>Aún no hay archivos registrados para esta entrega</p>
                  <span class="upload-hint"
                    >El estudiante debe subir su tarea desde su cuenta.</span
                  >
                </div>
              </div>

              <div v-if="assignment.submission?.files?.length > 0" class="files-grid">
                <div
                  v-for="file in assignment.submission.files"
                  :key="file.id"
                  class="resource-card"
                  @click="viewFile(file.id)"
                  style="cursor: pointer"
                >
                  <div class="file-preview">📄</div>
                  <div class="file-meta">
                    <span class="name">{{ file.name }}</span>
                  </div>
                  <button
                    @click="downloadFile(file.id, file.name)"
                    class="download-mini"
                    style="cursor: pointer"
                  >
                    <img src="@/components/descarga_logo.png" alt="descarga" />
                  </button>
                </div>
              </div>

              <div v-if="isGraded" class="grade-display">
                <div class="grade-circle">
                  <span class="score">{{ assignment.submission.grade }}</span>
                  <span class="total">/{{ assignment.points }}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section class="main-box feedback-info">
          <div class="section-tag">Retroalimentación</div>
          <div v-if="assignment.submission?.feedback" class="comment-box">
            <div class="avatar">{{ assignment.teacher?.charAt(0) || 'T' }}</div>
            <div class="comment-content">
              <div class="teacher-meta">
                <strong>{{ assignment.teacher || 'Docente' }}</strong>
              </div>
              <p class="feedback-text">{{ assignment.submission.feedback }}</p>
            </div>
          </div>

          <div v-else class="empty-feedback">
            <p class="state-subtitle">El docente aún no ha añadido comentarios a esta entrega.</p>
          </div>
        </section>
      </div>
    </SidebarLayout>
  </div>
</template>

<style scoped>
.bg-page {
  min-height: 100vh;
  inset: 0;
  overflow-x: hidden;
  overflow-y: auto;
  z-index: -1;
}

.detail-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 95%;
  max-width: 1000px;
  margin: 20px auto 50px auto;
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

.header-left-section {
  display: flex;
  align-items: flex-start; /* Alinea al inicio del h1 */
  gap: 40px;
}

/* Estilo del botón de regreso */
.back-btn {
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  width: 42px;
  height: 42px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0; /* Evita que se deforme */
  margin-top: 5px; /* Ajuste fino con el h1 */
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateX(-3px);
}

.back-btn svg {
  width: 20px;
  height: 20px;
}

/*UPLOAD AREA*/
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

.header-box {
  padding: 5px 10px;
}

.header-body {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: clamp(15px, 3vw, 25px);
}

.header-text h1 {
  font-size: clamp(1.2rem, 5vw, 1.8rem);
  margin: 0;
  font-weight: 700;
}

.points-badge {
  text-align: center;
  border-left: 1px solid rgba(255, 255, 255, 0.3);
  padding-left: clamp(20px, 4vw, 35px);
  flex-shrink: 0;
  margin-left: 20px;
}

.pts-number {
  font-size: 1.8rem;
  font-weight: 800;
  display: block;
}
.pts-text {
  font-size: 0.75rem;
  opacity: 0.8;
}

.section-tag {
  font-family: 'Roboto', sans-serif;
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--color-Azul, #1a73e8);
  text-transform: uppercase;
  margin-bottom: 15px;
}

.state-container {
  min-height: 500px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: var(--color-Blanco);
  width: 95%;
  max-width: 1000px;
  margin: 40px auto;
  border-radius: 20px;
}

.state-msg {
  font-size: 1.1rem;
  font-weight: 600;
  color: #555;
  margin-top: 15px;
}

.state-subtitle {
  font-size: 0.9rem;
  color: #999;
  margin-top: 5px;
}

.description {
  font-size: 1rem;
  line-height: 1.6;
  color: var(--color-Texto);
  white-space: pre-wrap;
}

.files-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
  margin-top: 25px;
}
@media (min-width: 768px) {
  .files-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (min-width: 1024px) {
  .files-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.resource-card {
  display: flex;
  align-items: center;
  padding: 12px;
  border: 1px solid var(--color-Bordes);
  border-radius: 8px;
  background: var(--color-Blanco);
}

.file-preview {
  font-size: 1.4rem;
  margin-right: 12px;
}

.file-meta {
  flex: 1;
  min-width: 0;
  margin-right: 15px;
}

.file-meta .name {
  display: block;
  font-size: 0.85rem;
  font-weight: 600;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}

.download-mini {
  background: none;
  border: none;
  color: var(--color-Azul);
  font-size: 1.2rem;
  cursor: pointer;
  padding: 5px;
}

.submission-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 20px;
}

.submission-info {
  border: 1px solid var(--color-Bordes);
  border-radius: 15px;
  margin: 20px 0;
  background-color: var(--color-Blanco);
}

.submission-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin-bottom: 10px;
}

.submission-title-row .section-tag {
  margin-bottom: 0;
}

.status-tags {
  display: flex;
  gap: 8px;
}

.status-tags {
  margin-left: auto;
  display: flex;
  gap: 8px;
  align-self: center;
}

.status-pill {
  display: inline-block;
  padding: 4px 12px;
  background: var(--color-Entregado);
  color: var(--color-StatusEntregado);
  border-radius: 16px;
  font-size: 0.8rem;
  font-weight: 600;
}

.status-pill.pending {
  background: var(--color-Pendente);
  color: var(--color-StatusPendente);
}

.late-status {
  background: var(--color-Tardio);
  color: var(--color-StatusTardio);
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 0.8rem;
  font-weight: 600;
}

.grade-circle {
  background: var(--color-Blanco);
  padding: 10px 25px;
  border-radius: 20px;
  border: 2px solid var(--color-Bordes);
  display: flex;
  align-items: baseline;
  gap: 2px;
}

.grade-display .score {
  font-size: 1.25rem;
  color: var(--color-Texto);
  font-weight: 800;
}

.comment-box {
  display: flex;
  gap: 15px;
  background: var(--color-Blanco);
  margin-top: 25px;
  align-items: flex-start;
}

.teacher-meta {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.teacher-meta strong {
  font-family: 'Roboto', sans-serif;
  font-size: 0.75rem;
  color: var(--color-Texto);
  font-weight: 700;
}

.feedback-text {
  font-size: 1.25rem;
  color: var();
  margin: 0;
  line-height: 1.4;
  margin-top: 10px;
  font-family: 'Roboto', sans-serif;
}

@media (max-width: 600px) {
  .header-body {
    flex-direction: column;
    text-align: center;
    padding: 15px 30px;
  }
  .points-badge {
    border-left: none;
    border-top: 1px solid rgba(255, 255, 255, 0.2);
    padding: 15px 0 0 0;
    width: 100%;
    margin-top: 15px;
  }

  .header-left-section {
    gap: 12px;
  }
  .back-btn {
    width: 36px;
    height: 36px;
  }
}

.loader-dots {
  width: 50px;
  aspect-ratio: 2;
  --_g: no-repeat radial-gradient(circle closest-side, var(--color-Texto) 90%, #0000);
  background:
    var(--_g) 0% 50%,
    var(--_g) 50% 50%,
    var(--_g) 100% 50%;
  background-size: calc(100% / 3) 50%;
  animation: l3 1s infinite linear;
  opacity: 0.3;
}
@keyframes l3 {
  20% {
    background-position:
      0% 0%,
      50% 50%,
      100% 50%;
  }
  40% {
    background-position:
      0% 100%,
      50% 0%,
      100% 50%;
  }
  60% {
    background-position:
      0% 50%,
      50% 100%,
      100% 0%;
  }
  80% {
    background-position:
      0% 50%,
      50% 50%,
      100% 100%;
  }
}

.icon-circle {
  width: 70px;
  height: 70px;
  background: var(--color-Aviso);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  margin-bottom: 10px;
}
</style>

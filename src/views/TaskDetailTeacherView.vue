<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
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

// ── GET tarea ─────────────────────────────────────────────────────────────────
const { data, error, isFetching, execute: reload } = useapi(`/assignments/${taskId}`, {
  method: 'GET',
}).json()

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
    group_id:    task.value.group_id    ? String(task.value.group_id)        : '',
    unit_id:     task.value.unit_id     ? String(task.value.unit_id)         : '',
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

      <!-- MODAL DE EDICIÓN -->
     <!-- MODAL DE EDICIÓN -->
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

      <!-- 👇 NUEVO -->
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

      <!-- CUERPO -->
      <div class="detail-container">

        <!-- DESCRIPCIÓN E INSTRUCCIONES -->
        <div class="ContBig">
          <div class="section-tag">Instrucciones</div>
          <p class="description-text">{{ task.description }}</p>

          <!-- Recursos adjuntos (si los hay) -->
          <div v-if="task.resources?.length" class="resources-grid">
            <div v-for="file in task.resources" :key="file.id" class="resource-card">
              <span class="file-icon">📄</span>
              <div class="file-meta">
                <span class="name">{{ file.name }}</span>
                <span class="size">{{ file.size }}</span>
              </div>
              <button class="download-mini">↓</button>
            </div>
          </div>
        </div>

        <!-- ENTREGA DEL ALUMNO -->
        <div class="ContBig submission-section" :class="{ graded: task.submission?.status === 'Calificada' }">
          <div class="submission-header">
            <div class="title-group">
              <h3>Entrega del alumno</h3>
              <span v-if="isLate" class="late-status">Entrega tardía</span>
              <span v-else-if="task.submission" class="status-ok">{{ task.submission.status }}</span>
              <span v-else class="status-pending">Sin entrega</span>
            </div>

            <div v-if="task.submission?.grade != null" class="grade-display">
              <span class="score">{{ task.submission.grade }}</span>
              <span class="sep">/</span>
              <span class="total">{{ task.points ?? 100 }}</span>
            </div>
          </div>

          <!-- Archivos entregados -->
          <div v-if="task.submission" class="submission-body">
            <div v-if="task.submission.files?.length" class="student-files">
              <div
                v-for="file in task.submission.files"
                :key="file.id"
                class="student-file-item"
              >
                <span>📎</span>
                <span class="file-name">{{ file.name }}</span>
                <span class="file-size">({{ file.size }})</span>
              </div>
            </div>

            <!-- Feedback -->
            <div v-if="task.submission.feedback" class="comment-box">
              <div class="avatar-circle">
                {{ task.submission.student_name?.charAt(0) ?? 'A' }}
              </div>
              <div class="comment-content">
                <strong>Retroalimentación</strong>
                <p>{{ task.submission.feedback }}</p>
              </div>
            </div>

            <p class="sub-date">
              Fecha de entrega: {{ formatDate(task.submission.submission_date) }}
            </p>
          </div>

          <div v-else class="empty-submission">
            <p>El alumno aún no ha entregado esta tarea.</p>
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
.btn-edit:hover {
  background: #dbeafe;
}

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

/* ── RECURSOS ────────────────────────────────────────────────────────────── */
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
  transition: background 0.2s;
}
.resource-card:hover { background: #f8fafc; }
.file-icon { font-size: 1.2rem; }
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
.file-meta .size { font-size: 0.7rem; color: #94a3b8; }
.download-mini {
  margin-left: auto;
  background: none;
  border: none;
  color: var(--color-Azul);
  font-size: 1.1rem;
  cursor: pointer;
  font-weight: bold;
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

.grade-display { text-align: right; }
.grade-display .score { font-size: 1.8rem; font-weight: 900; color: #10b981; }
.grade-display .sep   { font-size: 1.1rem; color: #94a3b8; margin: 0 2px; }
.grade-display .total { font-size: 1rem;  color: #94a3b8; }

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
.file-size { color: #94a3b8; font-size: 0.75rem; }

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
.modal-box textarea {
  min-height: 90px;
  resize: none;
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
}

@media (max-width: 480px) {
  .header-text h1 { font-size: 1.1rem; }
  .modal-box { padding: 22px 18px; }
  .resources-grid { grid-template-columns: 1fr; }
}
</style>
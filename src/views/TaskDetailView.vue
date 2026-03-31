<script setup lang="ts">
import { ref, computed } from 'vue'
import SidebarLayout from '@/components/ParentSidebar.vue'

const task = ref({
  id: 101,
  title: 'Proyecto Final: Termodinámica',
  description:
    'Realizar un ensayo detallado sobre las leyes de la termodinámica aplicadas en la vida cotidiana. Debe incluir ejemplos prácticos y bibliografía en formato APA.',
  subject: 'Física II',
  teacher: 'Ing. Isaac Newton',
  end_date: '2026-03-30T23:59:59',
  points: 100,
  resources: [
    { id: 1, name: 'Guia_Proyecto.pdf', size: '1.2 MB' },
    { id: 2, name: 'Rubrica_Evaluacion.pdf', size: '450 KB' },
  ],
  submission: {
    id: 50,
    submission_date: '2026-03-24T14:30:00',
    status: 'Calificada',
    grade: 95,
    feedback:
      'Excelente trabajo, Mateo. Los ejemplos son muy claros, solo cuida un poco más el formato de las gráficas.',
    files: [
      { id: 201, name: 'Ensayo_Mateo_Perez.pdf', size: '3.5 MB' },
      { id: 202, name: 'Anexos_Graficas.zip', size: '8.2 MB' },
    ],
  },
})

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleString('es-MX', {
    day: '2-digit',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const isLate = computed(() => {
  if (!task.value.submission) return false
  return new Date(task.value.submission.submission_date) > new Date(task.value.end_date)
})
</script>

<template>
  <SidebarLayout>
    <div class="ContSmall center">
      <div class="header-classroom">
        <div class="header-text">
          <h1>{{ task.title }}</h1>
          <p>{{ task.teacher }} • {{ formatDate(task.end_date) }}</p>
        </div>
        <div class="points-badge">{{ task.points }} puntos</div>
      </div>
    </div>

    <div class="classroom-container">
      <div class="ContBig assignment-section">
        <div class="section-header">
          <span class="subject-tag">{{ task.subject }}</span>
        </div>

        <div class="instruction-content">
          <h3>Instrucciones</h3>
          <p class="description">{{ task.description }}</p>
        </div>

        <div v-if="task.resources.length > 0" class="resources-grid">
          <div v-for="file in task.resources" :key="file.id" class="resource-card">
            <div class="file-preview">📄</div>
            <div class="file-meta">
              <span class="name">{{ file.name }}</span>
              <span class="type">PDF</span>
            </div>
            <button class="download-mini">↓</button>
          </div>
        </div>
      </div>

      <div class="ContBig submission-section" :class="{ 'is-graded': task.submission?.grade }">
        <div class="submission-header">
          <div class="title-group">
            <h3>Tu trabajo</h3>
            <span v-if="isLate" class="late-status">Completada con retraso</span>
            <span v-else class="status-pill">{{ task.submission?.status || 'Pendiente' }}</span>
          </div>

          <div v-if="task.submission?.grade" class="grade-display">
            <span class="score">{{ task.submission.grade }}</span>
            <span class="separator">/</span>
            <span class="total">{{ task.points }}</span>
          </div>
        </div>

        <div v-if="task.submission" class="submission-body">
          <div class="student-files">
            <div v-for="file in task.submission.files" :key="file.id" class="student-file-item">
              <span class="clip">📎</span>
              <span class="file-name">{{ file.name }}</span>
              <span class="file-size">({{ file.size }})</span>
            </div>
          </div>

          <div v-if="task.submission.feedback" class="comment-box">
            <div class="avatar">M</div>
            <div class="comment-content">
              <strong>Comentario privado</strong>
              <p>{{ task.submission.feedback }}</p>
            </div>
          </div>
        </div>

        <div v-else class="empty-submission">
          <p>No se han adjuntado archivos para esta tarea.</p>
        </div>
      </div>
    </div>
  </SidebarLayout>
</template>

<style scoped>
.classroom-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 95%;
  max-width: 1000px;
  margin: 0 auto 50px auto;
}

/* REUTILIZANDO TUS CONTENEDORES CON AJUSTES */
.ContSmall {
  background: var(--color-Azul);
  width: 95%;
  max-width: 1000px;
  height: 100px;
  border-radius: 20px;
  margin: 0 auto;
  color: white;
}

.header-classroom {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 0 30px;
  gap: 20px;
}

.icon-circle {
  width: 50px;
  height: 50px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.header-text h1 {
  font-size: 1.4rem;
  margin: 0;
}
.header-text p {
  font-size: 0.85rem;
  margin: 5px 0 0 0;
  opacity: 0.8;
}
.points-badge {
  margin-left: auto;
  font-weight: bold;
  border-left: 1px solid rgba(255, 255, 255, 0.3);
  padding-left: 20px;
}

.ContBig {
  background: white;
  border-radius: 15px;
  padding: 30px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  border: 1px solid #e0e0e0;
}

/* SECCIÓN ASIGNACIÓN */
.subject-tag {
  color: var(--color-Azul);
  font-weight: 800;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.instruction-content h3 {
  margin: 20px 0 10px 0;
  color: #3c4043;
}
.description {
  line-height: 1.6;
  color: #5f6368;
  white-space: pre-wrap;
}

.resources-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 15px;
  margin-top: 25px;
  border-top: 1px solid #eee;
  padding-top: 20px;
}

.resource-card {
  display: flex;
  align-items: center;
  border: 1px solid #dadce0;
  border-radius: 8px;
  padding: 10px;
  gap: 12px;
  transition: 0.2s;
}
.resource-card:hover {
  background: #f8f9fa;
  cursor: pointer;
}
.file-preview {
  font-size: 1.2rem;
}
.file-meta .name {
  display: block;
  font-size: 0.85rem;
  font-weight: 600;
  color: #3c4043;
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.file-meta .type {
  font-size: 0.7rem;
  color: #70757a;
}
.download-mini {
  background: none;
  border: none;
  color: var(--color-Azul);
  font-weight: bold;
  font-size: 1.1rem;
  cursor: pointer;
  margin-left: auto;
}

/* SECCIÓN ENTREGA */
.submission-section {
  border-top: 6px solid #dadce0;
}
.submission-section.is-graded {
  border-top-color: #1e8e3e;
}

.submission-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 25px;
}

.title-group h3 {
  margin: 0;
  font-size: 1.2rem;
}
.status-pill {
  font-size: 0.8rem;
  font-weight: bold;
  color: #1e8e3e;
}
.late-status {
  font-size: 0.8rem;
  color: #d93025;
  font-weight: bold;
}

.grade-display {
  text-align: right;
}
.grade-display .score {
  font-size: 1.8rem;
  font-weight: bold;
  color: #1e8e3e;
}
.grade-display .total {
  font-size: 1.1rem;
  color: #5f6368;
}

.student-files {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 25px;
}
.student-file-item {
  background: #f1f3f4;
  padding: 8px 15px;
  border-radius: 20px;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #3c4043;
}

/* COMENTARIO PRIVADO */
.comment-box {
  display: flex;
  gap: 15px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}
.avatar {
  width: 32px;
  height: 32px;
  background: var(--color-AzulTres);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}
.comment-content strong {
  font-size: 0.85rem;
  color: #3c4043;
}
.comment-content p {
  font-size: 0.9rem;
  margin: 5px 0 0 0;
  color: #5f6368;
}

@media (max-width: 600px) {
  .header-classroom {
    flex-direction: column;
    text-align: center;
    height: auto;
    padding: 20px;
  }
  .points-badge {
    border: none;
    padding: 0;
    margin: 10px 0;
  }
  .submission-header {
    flex-direction: column;
    gap: 10px;
  }
}
</style>

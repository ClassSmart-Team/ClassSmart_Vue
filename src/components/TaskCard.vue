<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  activity: any
}>()

// Lógica de estado basada en los modelos de Laravel
const computedStatus = computed(() => {
  const sub = props.activity.submission
  if (!sub) return 'pendiente'
  if (sub.status === 'Calificada') return 'calificada'
  if (new Date(sub.submission_date) > new Date(props.activity.end_date)) return 'tardia'
  return 'entregada'
})

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })
}
</script>

<template>
  <div :class="['activity-card', computedStatus]">
    <div class="activity-info">
      <div class="top-row">
        <span class="subject-tag">{{ activity.subject }}</span>
        <span v-if="computedStatus === 'tardia'" class="late-badge">Fuera de tiempo</span>
      </div>
      <h4>{{ activity.title }}</h4>
      <p class="due-date"> Límite: {{ formatDate(activity.end_date) }}</p>
    </div>

    <div class="activity-status-box">
      <div v-if="computedStatus === 'calificada'" class="grade-container">
        <span class="grade-label">Nota</span>
        <span class="grade-value">{{ activity.submission.grade }}</span>
      </div>
    </div>

    <div class="activity-actions">
      <router-link
        :to="{ name: 'parentTasksDetail', params: { id: activity.id } }"
        class="btn-open-task"
      >
        {{ computedStatus === 'calificada' ? 'Ver Retroalimentación' : 'Ver Detalles' }}
      </router-link>
    </div>
  </div>
</template>

<style scoped>
.activity-card {
  display: grid;
  grid-template-columns: 1fr auto auto;
  align-items: center;
  gap: 20px;
  background: white;
  padding: 18px 25px;
  border-radius: 16px;
  border: 1px solid #f1f5f9;
  border-left: 6px solid #cbd5e1;
  margin-bottom: 12px;
  transition: transform 0.2s;
}

.activity-card:hover {
  transform: scale(1.01);
  border-color: var(--color-AzulTres);
}

/* Colores de Borde basados en Submission Status */
.pendiente {
  border-left-color: #f59e0b;
}
.entregada {
  border-left-color: var(--color-AzulTres);
}
.tardia {
  border-left-color: #ef4444;
  background: #fffafb;
}
.calificada {
  border-left-color: #10b981;
}

.top-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 4px;
}
.subject-tag {
  font-size: 0.65rem;
  font-weight: 800;
  color: var(--color-Azul);
  text-transform: uppercase;
  background: #eff6ff;
  padding: 2px 8px;
  border-radius: 4px;
}
.late-badge {
  font-size: 0.6rem;
  color: #ef4444;
  font-weight: bold;
  text-transform: uppercase;
}

.activity-info h4 {
  margin: 0;
  font-size: 1.05rem;
  color: #1e293b;
  font-weight: 700;
}
.due-date {
  font-size: 0.8rem;
  color: #64748b;
  margin-top: 4px;
}

.grade-container {
  text-align: center;
  padding: 0 15px;
  border-left: 1px solid #f1f5f9;
}
.grade-label {
  display: block;
  font-size: 0.6rem;
  color: #94a3b8;
  text-transform: uppercase;
  font-weight: bold;
}
.grade-value {
  font-size: 1.4rem;
  font-weight: 900;
  color: #10b981;
}

/* AJUSTES PARA QUE EL LINK SE VEA COMO BOTÓN */
.btn-open-task {
  display: inline-block;
  text-decoration: none; /* Elimina el subrayado */
  padding: 10px 18px;
  border-radius: 10px;
  background: #f8fafc;
  color: var(--color-Azul);
  font-weight: bold;
  font-size: 0.8rem;
  text-align: center;
  transition: 0.2s;
}

.btn-open-task:hover {
  background: var(--color-Azul);
  color: white;
}

@media (max-width: 768px) {
  .activity-card {
    grid-template-columns: 1fr;
    gap: 15px;
  }
  .activity-status-box {
    justify-self: start;
    padding: 0;
    border: none;
  }
}
</style>

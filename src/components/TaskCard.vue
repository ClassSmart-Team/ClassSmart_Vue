<script setup lang="ts">
import { computed } from 'vue'
import type { ParentActivity } from '@/types/types.ts'

const props = defineProps<{
  activity: ParentActivity
}>()

const computedStatus = computed(() => {
  if (!props.activity?.status) return 'pendiente'

  const s = props.activity.status.toLowerCase()

  if (s === 'calificada' || s === 'calificado') return 'calificada'
  if (s === 'tardia' || s === 'tardía' || s === 'atrasada' || s === 'atrasado') return 'tardia'
  if (s === 'entregada' || s === 'entregado') return 'entregada'

  return 'pendiente'
})

const formatDate = (dateStr: string | null) => {
  if (!dateStr) return 'Sin fecha'
  return new Date(dateStr).toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'short',
    timeZone: 'UTC',
  })
}
</script>

<template>
  <div v-if="activity.status !== 'Cancelada'" :class="['activity-card', computedStatus]">
    <div class="activity-info">
      <h4 class="activity-tag">{{ activity?.title || 'Sin titulo' }}</h4>
      <p class="due-date">Límite: {{ formatDate(activity?.end_date) }}</p>
    </div>

    <div class="activity-status-box">
      <span class="simple-badge">{{ activity.status }}</span>

      <div v-if="computedStatus === 'calificada'" class="grade-pill">
        <span class="grade-label">Calificación</span>
        <span class="grade-value">{{
          activity?.submission?.grade != null ? Math.round(activity.submission.grade) : '--'
        }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.activity-card {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 20px;
  background: var(--color-Bordes);
  padding: 18px 24px;
  border-radius: 12px;
  border: 1px solid var(--color-Bordes);
  border-left: 4px solid #cbd5e1;
  margin-bottom: 12px;
  transition: all 0.2s ease;
}

.activity-card:hover {
  border-top-color: #cbd5e1;
  border-right-color: #cbd5e1;
  border-bottom-color: #cbd5e1;

  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.08);
}
.activity-card.pendiente {
  border-left-color: #fde68a !important;
}
.activity-card.entregada {
  border-left-color: #bfdbfe !important;
}
.activity-card.calificada {
  border-left-color: #bbf7d0 !important;
}
.activity-card.tardia {
  border-left-color: #fecaca !important;
}
/* Pendiente: Tonos ámbar/arena suaves */
.pendiente .simple-badge {
  color: #d97706;
}

/* Entregada: Tonos azulados suaves */
.entregada .simple-badge {
  color: #2563eb;
}

/* Tardía */
.tardia .simple-badge {
  color: #e11d48;
}

/* Calificada */
.calificada .simple-badge {
  color: #61d48d;
}

.activity-status-box {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 10px;
  min-width: 120px;
}

.activity-info h4 {
  margin: 0;
  font-size: 1.1rem;
  color: #1e293b;
  font-weight: 700;
}

.due-date {
  font-size: 0.8rem;
  color: #64748b;
  margin-top: 5px;
}

.simple-badge {
  font-size: 0.7rem;
  font-weight: 800;
  text-transform: uppercase;
  padding: 4px 12px;
  white-space: nowrap;
}

.grade-pill {
  text-align: center;
  background: var(--color-Bordes);
  padding: 4px 12px;
  border-radius: 8px;
  border: 1px solid var(--color-Texto);
}
.grade-label {
  font-family: 'Roboto', sans-serif;
  display: block;
  font-size: 0.5rem;
  color: #64748b;
  text-transform: uppercase;
  font-weight: bold;
}
.grade-value {
  font-size: 1.1rem;
  font-weight: 800;
  color: #61d48d;
}

@media (max-width: 600px) {
  .activity-card {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .activity-status-box {
    align-items: flex-start;
    flex-direction: row;
    justify-content: space-between;
    width: 100%;
  }
}
</style>

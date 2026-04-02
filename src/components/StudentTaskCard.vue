<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  task: any,
  isAdmin?: boolean 
}>()

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })
}


const detailRoute = computed(() => {
  return props.isAdmin ? 'teacherTasksDetail' : 'studentTasksDetail'
})

const statusColor = computed(() => {
  const s = props.task.status?.toLowerCase()
  if (s === 'activa')    return 'activa'
  if (s === 'cerrada')   return 'cerrada'
  if (s === 'cancelada') return 'cancelada'
  return ''
})

// Badge de calificación para el alumno
const grade = computed(() => props.task.submission?.grade)
</script>

<template>
  <div :class="['task-card', statusColor]">
    <div class="task-info">
      <div class="top-row">
        <span class="status-tag">{{ task.status }}</span>
        <span v-if="grade !== undefined && !isAdmin" class="grade-tag">
          Nota: {{ grade }}
        </span>
      </div>
      
      <h4>{{ task.title }}</h4>
      <p class="task-desc">{{ task.description }}</p>
      <p class="due-date">Límite: {{ formatDate(task.end_date) }}</p>
    </div>

    <div class="task-actions">
      <router-link
        :to="{ name: detailRoute, params: { id: task.id } }"
        class="btn-open-task"
      >
        {{ isAdmin ? 'Gestionar' : 'Ver Tarea' }}
      </router-link>
    </div>
  </div>
</template>

<style scoped>
/* ── BASE CARD ──────────────────────────────────────────────────────────── */
.task-card {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 20px;
  background: white;
  padding: 18px 25px;
  border-radius: 16px;
  border: 1px solid #f1f5f9;
  border-left: 6px solid #cbd5e1;
  margin-bottom: 12px;
  transition: all 0.2s ease;
}

.task-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0,0,0,0.05);
}

/* ── COLORES LATERALES ──────────────────────────────────────────────────── */
.activa    { border-left-color: #2563eb; }
.inactiva  { border-left-color: #9ca3af; }
.cerrada   { border-left-color: #ef4444; }
.cancelada { border-left-color: #64748b; }

/* ── TAGS ───────────────────────────────────────────────────────────────── */
.top-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.status-tag {
  font-size: 0.62rem;
  font-weight: 800;
  color: #2563eb;
  text-transform: uppercase;
  background: #eff6ff;
  padding: 3px 10px;
  border-radius: 6px;
  letter-spacing: 0.5px;
}

.grade-tag {
  font-size: 0.62rem;
  font-weight: 800;
  color: #059669;
  text-transform: uppercase;
  background: #ecfdf5;
  padding: 3px 10px;
  border-radius: 6px;
}

/* ── TEXTOS ─────────────────────────────────────────────────────────────── */
.task-info h4 {
  margin: 0;
  font-size: 1.1rem;
  color: #1e293b;
  font-weight: 700;
}

.task-desc {
  font-size: 0.85rem;
  color: #64748b;
  margin: 6px 0;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.due-date {
  font-size: 0.75rem;
  color: #94a3b8;
  font-weight: 600;
}

/* ── BOTÓN ──────────────────────────────────────────────────────────────── */
.btn-open-task {
  text-decoration: none;
  padding: 10px 20px;
  border-radius: 12px;
  background: #f8fafc;
  color: #1e293b;
  font-weight: 700;
  font-size: 0.82rem;
  transition: 0.2s;
  border: 1px solid #e2e8f0;
}

.btn-open-task:hover {
  background: #2563eb;
  color: white;
  border-color: #2563eb;
}

@media (max-width: 480px) {
  .task-card { grid-template-columns: 1fr; gap: 15px; }
  .btn-open-task { width: 100%; display: block; }
}
</style>
<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  task: any
}>()

const computedStatus = computed(() => {
  if (props.task.submissions_count > 0) return 'entregada'
  if (new Date(props.task.end_date) < new Date()) return 'tardia'
  return 'pendiente'
})

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })
}
</script>

<template>
  <div :class="['activity-card', computedStatus]">
    <div class="activity-info">
      <div class="top-row">
        <span class="subject-tag">{{ task.group?.name }}</span>
        <span v-if="computedStatus === 'entregada'" class="done-badge">Entregada</span>
        <span v-if="computedStatus === 'tardia'" class="late-badge">Fuera de tiempo</span>
      </div>
      <h4>{{ task.title }}</h4>
      <p class="due-date">Límite: {{ formatDate(task.end_date) }}</p>
    </div>

    <div class="activity-actions">
      <router-link
        :to="{ name: 'studentTasksDetail', params: { id: task.id } }"
        class="btn-open-task"
      >
        {{ computedStatus === 'entregada' ? 'Ver Entrega' : 'Ver Detalles' }}
      </router-link>
    </div>
  </div>
</template>

<style scoped>
.activity-card {
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
  transition: transform 0.2s;
}
.activity-card:hover {
  transform: scale(1.01);
  box-shadow: 0 4px 12px rgba(0,0,0,0.06);
}

.pendiente { border-left-color: #f59e0b; }
.entregada { border-left-color: #3b82f6; }
.tardia    { border-left-color: #ef4444; background: #fffafb; }

.top-row { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }

.subject-tag {
  font-size: 0.65rem;
  font-weight: 800;
  color: var(--color-Azul);
  text-transform: uppercase;
  background: #eff6ff;
  padding: 2px 8px;
  border-radius: 4px;
}
.done-badge {
  font-size: 0.6rem;
  color: #3b82f6;
  font-weight: bold;
  text-transform: uppercase;
}
.late-badge {
  font-size: 0.6rem;
  color: #ef4444;
  font-weight: bold;
  text-transform: uppercase;
}

.activity-info h4 { margin: 0; font-size: 1.05rem; color: #1e293b; font-weight: 700; }
.due-date { font-size: 0.8rem; color: #64748b; margin-top: 4px; }

.btn-open-task {
  display: inline-block;
  text-decoration: none;
  padding: 10px 18px;
  border-radius: 10px;
  background: #f8fafc;
  color: var(--color-Azul);
  font-weight: bold;
  font-size: 0.8rem;
  text-align: center;
  transition: 0.2s;
  white-space: nowrap;
}
.btn-open-task:hover {
  background: var(--color-Azul);
  color: white;
}

@media (max-width: 768px) {
  .activity-card { grid-template-columns: 1fr; gap: 15px; }
}
</style>
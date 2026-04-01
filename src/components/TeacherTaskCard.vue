<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  task: any
}>()

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })
}

const statusColor = computed(() => {
  const s = props.task.status?.toLowerCase()
  if (s === 'activa')   return 'activa'
  if (s === 'cerrada')  return 'cerrada'
  if (s === 'cancelada') return 'cancelada'
  return ''
})
</script>

<template>
  <div :class="['task-card', statusColor]">
    <div class="task-info">
      <div class="top-row">
        <span class="status-tag">{{ task.status }}</span>
      </div>
      <h4>{{ task.title }}</h4>
      <p class="task-desc">{{ task.description }}</p>
      <p class="due-date">Límite: {{ formatDate(task.end_date) }}</p>
    </div>

    <div class="task-actions">
      <router-link
        :to="{ name: 'teacherTasksDetail', params: { id: task.id } }"
        class="btn-open-task"
      >
        Ver Detalles
      </router-link>
    </div>
  </div>
</template>

<style scoped>
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
  transition: transform 0.2s;
}

.task-card:hover {
  transform: scale(1.01);
}

.activa  { border-left-color: #2563eb; }
.inactiva { border-left-color: #9ca3af; }
.cerrada  { border-left-color: #ef4444; }

.top-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 4px;
}

.status-tag {
  font-size: 0.65rem;
  font-weight: 800;
  color: var(--color-Azul);
  text-transform: uppercase;
  background: #eff6ff;
  padding: 2px 8px;
  border-radius: 4px;
}

.task-info h4 {
  margin: 0;
  font-size: 1.05rem;
  color: #1e293b;
  font-weight: 700;
}

.task-desc {
  font-size: 0.8rem;
  color: #94a3b8;
  margin: 4px 0;
  display: -webkit-box;
  line-clamp: 2;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.due-date {
  font-size: 0.8rem;
  color: #64748b;
  margin-top: 4px;
}

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
</style>
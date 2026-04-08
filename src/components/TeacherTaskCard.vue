<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ task: any }>()
const emit = defineEmits(['edit', 'view'])

const formatDate = (dateStr: string) => {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('es-MX', {
    day: '2-digit', month: 'short', year: 'numeric'
  })
}

const statusColor = computed(() => {
  const now = new Date()
  const end = new Date(props.task.end_date)
  const s = props.task.status
  if (s === 'Cerrada') return 'cerrada'
  if (s === 'Cancelada') return 'cancelada'
  if (s === 'Activa' && end < now) return 'cerrada'
  return 'activa'
})

const statusLabel = computed(() => {
  const now = new Date()
  const end = new Date(props.task.end_date)
  if (props.task.status === 'Activa' && end < now) return 'Vencida'
  return props.task.status
})

const submissions    = computed(() => props.task.submissions ?? [])
const submissionsCount = computed(() => submissions.value.length)
</script>

<template>
  <div :class="['task-card', statusColor]" style="cursor: pointer;" @click="$emit('view', task)">
    <div class="status-stripe"></div>
    <div class="card-body">
      <div class="top-row">
        <span :class="['status-tag', statusColor]">{{ statusLabel }}</span>
        <span class="group-tag" v-if="task.group?.name">{{ task.group.name }}</span>
        <span class="unit-tag" v-if="task.unit?.name">{{ task.unit.name }}</span>
      </div>
      <h4 class="task-title">{{ task.title }}</h4>
      <p class="task-desc">{{ task.description }}</p>
      <div class="dates-row">
        <span class="date-chip">Inicio: {{ formatDate(task.start_date) }}</span>
        <span class="date-chip deadline">Límite: {{ formatDate(task.end_date) }}</span>
      </div>
      <div class="stats-row">
        <div class="stat-pill total">
          <span class="stat-num">{{ submissionsCount }}</span>
          <span class="stat-label">entregas</span>
        </div>
      </div>
    </div>
    <div class="card-action">
      <button class="btn-edit" @click.stop="emit('edit', task)">Editar</button>
      <button class="btn-detail" @click.stop="emit('view', task)">
        Ver detalle
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M5 12h14M12 5l7 7-7 7"/>
        </svg>
      </button>
    </div>
  </div>
</template>



<style scoped>
.task-card {
  display: flex;
  align-items: stretch;
  background: white;
  border-radius: 16px;
  border: 1px solid #e8edf3;
  overflow: hidden;
  transition: all 0.25s ease;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
}

.task-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.08);
  border-color: #d1d9e2;
}

.status-stripe {
  width: 6px;
  flex-shrink: 0;
  background: #cbd5e1;
}

.task-card.activa .status-stripe { background: var(--color-AzulTres, #2563eb); }
.task-card.cerrada .status-stripe { background: #ef4444; }
.task-card.cancelada .status-stripe { background: #9ca3af; }

.card-body {
  flex: 1;
  padding: 18px 22px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.top-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.status-tag {
  font-size: 0.65rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  padding: 3px 10px;
  border-radius: 6px;
  background: #eff6ff;
  color: #2563eb;
}

.status-tag.cerrada { background: #fee2e2; color: #dc2626; }
.status-tag.cancelada { background: #f3f4f6; color: #6b7280; }

.group-tag, .unit-tag {
  font-size: 0.65rem;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 6px;
  background: #f0fdf4;
  color: #166534;
}

.unit-tag {
  background: #fefce8;
  color: #854d0e;
}

.task-title {
  margin: 2px 0;
  font-size: 1.05rem;
  color: #1e293b;
  font-weight: 800;
  line-height: 1.4;
}

.task-desc {
  font-size: 0.82rem;
  color: #64748b;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.dates-row {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 4px;
}

.date-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.75rem;
  color: #475569;
  background: #f8fafc;
  padding: 4px 10px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  font-weight: 600;
}

.date-chip.deadline {
  color: #b45309;
  background: #fffbeb;
  border-color: #fde68a;
}

.stats-row {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 4px;
}

.stat-pill {
  display: flex;
  align-items: baseline;
  gap: 4px;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  border: 1.5px solid transparent;
}

.stat-num {
  font-weight: 900;
  font-size: 0.9rem;
}

.stat-pill.total {
  background: #eff6ff;
  color: #1d4ed8;
  border-color: #dbeafe;
}

.card-action {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  padding: 20px;
  min-width: 190px;
  background: #fafbfc;
  border-left: 1px solid #f1f5f9;
}

.btn-detail {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 18px;
  border-radius: 12px;
  background: var(--color-AzulTres, #2563eb);
  color: white;
  font-weight: 700;
  font-size: 0.8rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-detail:hover {
  background: #1d4ed8;
  transform: scale(1.03);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);
}

.btn-edit {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1.5px solid #e2e8f0;
  background: white;
  color: #475569;
  padding: 10px 18px;
  border-radius: 12px;
  font-weight: 700;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-edit:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
  color: #1e293b;
  transform: scale(1.03);
}

@media (max-width: 640px) {
  .task-card { flex-direction: column; }
  .status-stripe { width: 100%; height: 6px; }
  .card-action {
    width: 100%;
    min-width: auto;
    padding: 15px 22px;
    border-left: none;
    border-top: 1px solid #f1f5f9;
    justify-content: space-between;
  }
  .btn-detail, .btn-edit { flex: 1; }
}
</style>
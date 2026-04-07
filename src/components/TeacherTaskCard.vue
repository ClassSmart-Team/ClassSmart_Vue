<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  task: any
}>()

const emit = defineEmits(['edit', 'view'])

const formatDate = (dateStr: string) => {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

const statusColor = computed(() => {
  const s = props.task.status?.toLowerCase()
  if (s === 'activa') return 'activa'
  if (s === 'cerrada') return 'cerrada'
  if (s === 'cancelada') return 'cancelada'
  return ''
})

const submissions = computed(() => props.task.submissions ?? [])
const submissionsCount = computed(() => submissions.value.length)

const gradedCount = computed(() =>
  submissions.value.filter((s: any) => s.status === 'Calificada').length
)

const lateCount = computed(() =>
  submissions.value.filter((s: any) =>
    new Date(s.submission_date) > new Date(props.task.end_date)
  ).length
)

const pendingGrade = computed(() =>
  submissionsCount.value - gradedCount.value
)
</script>

<template>
  <div
    :class="['task-card', statusColor]"
    style="cursor: pointer;"
    @click="$emit('view', task)"
  >
    <div class="status-stripe"></div>

    <div class="card-body">
      <div class="top-row">
        <span :class="['status-tag', statusColor]">{{ task.status }}</span>

        <span class="group-tag" v-if="task.group?.name">
          {{ task.group.name }}
        </span>

        <span class="unit-tag" v-if="task.unit?.name">
          {{ task.unit.name }}
        </span>
      </div>

      <h4 class="task-title">{{ task.title }}</h4>
      <p class="task-desc">{{ task.description }}</p>

      <div class="dates-row">
        <span class="date-chip">
          Inicio: {{ formatDate(task.start_date) }}
        </span>
        <span class="date-chip deadline">
          Límite: {{ formatDate(task.end_date) }}
        </span>
      </div>

      <div class="stats-row">
        <div class="stat-pill total">
          <span class="stat-num">{{ submissionsCount }}</span>
          <span class="stat-label">entregas</span>
        </div>
      </div>
    </div>

    <!-- 🔥 BOTONES -->
    <div class="card-action">

      <!-- EDITAR -->
      <button
        class="btn-edit"
        @click.stop="emit('edit', task)"
      >
        Editar
      </button>

      <!-- VER DETALLE -->
      <button
        class="btn-detail"
        @click.stop="emit('view', task)"
      >
        Ver detalle
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
        >
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
  border-radius: 14px;
  border: 1px solid #e8edf3;
  overflow: hidden;
  transition: box-shadow 0.2s, transform 0.2s;
  box-shadow: 0 1px 4px rgba(0,0,0,0.05);
}

.task-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0,0,0,0.1);
}

/* Franja lateral */
.status-stripe {
  width: 5px;
  flex-shrink: 0;
  background: #cbd5e1;
}
.task-card.activa   .status-stripe { background: #2563eb; }
.task-card.cerrada  .status-stripe { background: #ef4444; }
.task-card.cancelada .status-stripe { background: #9ca3af; }

/* Cuerpo */
.card-body {
  flex: 1;
  padding: 16px 18px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* Top row */
.top-row {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.status-tag {
  font-size: 0.62rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  padding: 2px 8px;
  border-radius: 4px;
  background: #eff6ff;
  color: #2563eb;
}
.status-tag.cerrada   { background: #fee2e2; color: #dc2626; }
.status-tag.cancelada { background: #f3f4f6; color: #6b7280; }

.group-tag, .unit-tag {
  font-size: 0.62rem;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 4px;
  background: #f0fdf4;
  color: #166534;
}
.unit-tag {
  background: #fefce8;
  color: #854d0e;
}

/* Título */
.task-title {
  margin: 0;
  font-size: 0.97rem;
  color: #1e293b;
  font-weight: 700;
  line-height: 1.3;
}

.task-desc {
  font-size: 0.78rem;
  color: #94a3b8;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Fechas */
.dates-row {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.date-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.72rem;
  color: #64748b;
  background: #f8fafc;
  padding: 3px 8px;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
}

.date-chip.deadline {
  color: #b45309;
  background: #fffbeb;
  border-color: #fde68a;
}

/* Stats */
.stats-row {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-top: 2px;
}

.stat-pill {
  display: flex;
  align-items: baseline;
  gap: 3px;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 0.72rem;
  border: 1px solid transparent;
}

.stat-num {
  font-weight: 800;
  font-size: 0.85rem;
}

.stat-pill.total   { background: #eff6ff; color: #1d4ed8; border-color: #bfdbfe; }
.stat-pill.graded  { background: #f0fdf4; color: #15803d; border-color: #bbf7d0; }
.stat-pill.pending { background: #fffbeb; color: #b45309; border-color: #fde68a; }
.stat-pill.late    { background: #fef2f2; color: #dc2626; border-color: #fecaca; }

/* Acción */
.card-action {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  padding: 16px;
  min-width: 170px;
}

.btn-detail {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 9px 14px;
  border-radius: 10px;
  background: #2563eb;
  color: white;
  font-weight: 700;
  font-size: 0.75rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-detail:hover {
  background: #1d4ed8;
  transform: translateY(-1px);
}

.btn-edit {
  border: none;
  background: #f1f5f9;
  color: #334155;
  padding: 9px 14px;
  border-radius: 10px;
  font-weight: 700;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid #e2e8f0;
}

.btn-edit:hover {
  background: #e2e8f0;
  color: #1e293b;
  transform: translateY(-1px);
}
</style>
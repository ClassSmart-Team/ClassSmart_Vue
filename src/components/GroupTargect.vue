<script setup lang="ts">
import type { Group } from '@/types/types.ts'

defineProps<{ group: Group }>()
</script>

<template>
  <div class="card" :class="{ inactive: !group.active }">
    <!-- Header con gradiente azul -->
    <div class="card-header">
      <div class="header-top">
        <div class="period-badge">{{ group.period.name }} {{ group.period.year }}</div>
        <div class="status-badge" :class="{ active: group.active }">
          {{ group.active ? 'Activo' : 'Finalizado' }}
        </div>
      </div>
      <h2 class="group-title">{{ group.name }}</h2>
    </div>

    <!-- Contenido principal -->
    <div class="card-content">
      <!-- Sección de fechas -->
      <div class="dates-section">
        <div class="date-block">
          <p class="date-label">INICIO</p>
          <p class="date-value">01 Feb 2026</p>
        </div>
        <div class="date-separator"></div>
        <div class="date-block">
          <p class="date-label">FIN</p>
          <p class="date-value">30 Jun 2026</p>
        </div>
      </div>

      <!-- Sección de estadísticas -->
      <div class="stats-section">
        <div class="stat-item">
          <div class="stat-icon students-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
          <div>
            <p class="stat-number">{{ group.students_count }}</p>
            <p class="stat-label">Alumnos</p>
          </div>
        </div>

        <div class="stat-item">
          <div class="stat-icon assignments-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="12" y1="13" x2="16" y2="13"></line>
              <line x1="12" y1="17" x2="16" y2="17"></line>
            </svg>
          </div>
          <div>
            <p class="stat-number">{{ group.assignments_count }}</p>
            <p class="stat-label">Tareas</p>
          </div>
        </div>
      </div>

      <!-- Sección de profesor -->
      <div class="teacher-section">
        <div class="teacher-avatar">
          {{ group.owner.name.charAt(0) }}{{ group.owner.lastname.charAt(0) }}
        </div>
        <div class="teacher-info">
          <p class="teacher-name">{{ group.owner.name }} {{ group.owner.lastname }}</p>
          <p class="teacher-role">Docente titular</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card {
  width: 100%;
  max-width: 320px;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.4);
}

.card.inactive {
  opacity: 0.65;
}

/* Header con gradiente azul */
.card-header {
  background: linear-gradient(135deg, #1d65d8 0%, #c5c1c1 100%);
  padding: 16px;
  color: white;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.period-badge {
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(10px);
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.status-badge {
  background: rgba(255, 255, 255, 0.25);
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.status-badge.active {
  background: rgba(0, 255, 91, 0.79);
  border-color: rgba(6, 255, 102, 0.76);
}

.group-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
  color: white;
}

/* Contenido principal */
.card-content {
  background: #d0e4f7;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

/* Sección de fechas */
.dates-section {
  display: flex;
  align-items: center;
  gap: 16px;
}

.date-block {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.date-label {
  font-size: 0.7rem;
  font-weight: 700;
  color: #4b7ba7;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0;
}

.date-value {
  font-size: 0.95rem;
  font-weight: 600;
  color: #1e3a5f;
  margin: 0;
}

.date-separator {
  width: 1px;
  height: 40px;
  background: rgba(30, 58, 95, 0.15);
}

/* Sección de estadísticas */
.stats-section {
  display: flex;
  gap: 12px;
}

.stat-item {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(255, 255, 255, 0.6);
  padding: 12px;
  border-radius: 12px;
}

.stat-icon {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: white;
  font-weight: 700;
}

.stat-icon svg {
  width: 24px;
  height: 24px;
}

.students-icon {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
}

.assignments-icon {
  background: linear-gradient(135deg, #4ade80 0%, #22c55e 100%);
}

.stat-number {
  font-size: 1.1rem;
  font-weight: 700;
  color: #1e3a5f;
  margin: 0;
}

.stat-label {
  font-size: 0.75rem;
  color: #4b7ba7;
  margin: 0;
}

/* Sección de profesor */
.teacher-section {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-top: 8px;
  border-top: 1px solid rgba(30, 58, 95, 0.1);
}

.teacher-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 0.95rem;
  flex-shrink: 0;
}

.teacher-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.teacher-name {
  font-size: 0.95rem;
  font-weight: 600;
  color: #1e3a5f;
  margin: 0;
}

.teacher-role {
  font-size: 0.75rem;
  color: #4b7ba7;
  margin: 0;
}

/* Responsive */
@media (max-width: 640px) {
  .card {
    max-width: 100%;
  }

  .group-title {
    font-size: 1.3rem;
  }

  .date-value {
    font-size: 0.85rem;
  }
}
</style>

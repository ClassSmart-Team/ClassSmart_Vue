<script setup lang="ts">
// Definimos las propiedades que recibirá el componente

import type { Child } from '@/types/types.ts'

defineProps<{
  child: Child
}>()

const emit = defineEmits(['view-schedule', 'view-grades'])
</script>

<template>
  <div class="child-card">
    <div class="card-header">
      <div class="avatar-mini">
        {{ child.name.charAt(0).toUpperCase() || '?' }}
      </div>
      <div class="header-text">
        <h3>{{ child.name }}</h3>
      </div>
    </div>

    <hr class="divider" />

    <div class="card-body">
      <div class="info-row">
        <span class="label">Correo:</span>
        <span class="value">{{ child.email }}</span>
      </div>
      <div class="info-row">
        <span class="label">Periodo:</span>
        <span class="value">
          {{
            child.groups && child.groups.length > 0
              ? `${child.groups[0].period.name} - ${child.groups[0].period.year}`
              : 'Sin asignar'
          }}
        </span>
      </div>
      <div class="info-row">
        <span class="label">Estado:</span>
        <span :class="['status-pill', child.active ? 'activo' : 'inactivo']">
          {{ child.active ? 'Activo' : 'Inactivo' }}
        </span>
      </div>
    </div>

    <div class="card-footer">
      <button @click="emit('view-schedule', child)" class="btn-action primary">Horario</button>
    </div>
  </div>
</template>

<style scoped>
.child-card {
  background: var(--color-Blanco);
  border: 1px solid var(--color-ContenedorClaro);
  border-radius: 18px;
  padding: 20px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
}

.child-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
  border-color: var(--color-Azul);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar-mini {
  width: 45px;
  height: 45px;
  background: var(--color-AzulTres);
  color: white;
  border-radius: 12px; /* Un poco más cuadrado para variar */
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.1rem;
}

.header-text h3 {
  margin: 0;
  font-size: 1rem;
  color: var(--color-Azul);
}

.id-tag {
  font-size: 0.75rem;
  color: #888;
}

.divider {
  border: 0;
  border-top: 1px solid var(--color-Bordes);
  margin: 15px 0;
}

.card-body {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
}

.label {
  color: #777;
}
.value {
  font-weight: 600;
  color: var(--color-Texto);
}

.status-pill {
  padding: 2px 8px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: bold;
}

.status-pill.activo {
  background: #e3f9e5;
  color: #1f7a28;
}

.card-footer {
  margin-top: 20px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.btn-action {
  padding: 8px;
  border-radius: 10px;
  border: none;
  font-weight: bold;
  font-size: 0.8rem;
  cursor: pointer;
  transition: background 0.2s;
}

.primary {
  background: var(--color-Azul);
  color: white;
}
.secondary {
  background: var(--color-ContenedorClaro);
  color: var(--color-Azul);
}

.btn-action:active {
  transform: scale(0.95);
}
</style>

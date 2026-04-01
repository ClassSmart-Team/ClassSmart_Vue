<script setup lang="ts">
import router from '@/router'

export interface Group {
  id: number
  name: string
  description?: string
  active: boolean
  owner: {
    name: string
    lastname: string
  }
  period: {
    name: string
    year: number
  }
}

defineProps<{
  group: Group
}>()

function goToGroup(id: number) {
  router.push({ name: 'parentGroupDetail', params: { id } })
}
</script>

<template>
  <div class="card" :class="{ inactive: !group.active }">
    <div class="card-top">
      <span class="period-pill"> {{ group.period.name }} · {{ group.period.year }} </span>
      <div class="dot" :class="{ 'dot-active': group.active, 'dot-inactive': !group.active }"></div>
    </div>

    <div class="card-body">
      <p class="card-title">{{ group.name }}</p>
      <p class="card-desc">
        {{ group.description || 'Sin descripción disponible.' }}
      </p>

      <div class="meta">
        <div class="meta-box full">
          <div class="meta-label">Docente</div>
          <div class="meta-value teacher">{{ group.owner.name }} {{ group.owner.lastname }}</div>
        </div>
      </div>
    </div>

    <div class="card-action">
      <button @click="goToGroup(group.id)" class="view-btn">Ver detalles</button>
    </div>
  </div>
</template>

<style scoped>
.card {
  width: 100%;
  background: var(--color-Blanco);
  border: 1px solid var(--color-ContenedorClaro);
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  border-color: var(--color-Azul);
}

.card.inactive {
  opacity: 0.8;
  filter: grayscale(0.4);
}

/* HEADER */
.card-top {
  background: linear-gradient(135deg, var(--color-Azul), var(--color-AzulTres));
  padding: 12px 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.inactive .card-top {
  background: #95a5a6;
}

.period-pill {
  background: rgba(255, 255, 255, 0.9);
  color: var(--color-Azul);
  font-size: 10px;
  font-weight: bold;
  padding: 3px 10px;
  border-radius: 20px;
  text-transform: uppercase;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: white;
}

.dot-active {
  box-shadow: 0 0 8px #2ecc71;
}

/* BODY */
.card-body {
  padding: 20px 15px;
  flex-grow: 1;
}

.card-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--color-Texto);
  margin-bottom: 8px;
}

.card-desc {
  font-size: 0.85rem;
  color: #777;
  line-height: 1.4;
  margin-bottom: 15px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* META */
.meta-box.full {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 10px;
  border: 1px solid #eee;
}

.meta-label {
  font-size: 10px;
  color: #999;
  text-transform: uppercase;
  font-weight: bold;
}

.meta-value.teacher {
  font-weight: 600;
  color: var(--color-Azul);
  font-size: 0.9rem;
}

/* FOOTER */
.card-footer {
  padding: 12px 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid #f5f5f5;
}

.status {
  font-size: 11px;
  font-weight: bold;
  padding: 2px 8px;
  border-radius: 6px;
}

.status-active {
  background: #e3f9e5;
  color: #1f7a28;
}
.status-inactive {
  background: #feeef0;
  color: #e74c3c;
}

.counts {
  font-size: 12px;
  display: flex;
  gap: 12px;
  font-weight: 600;
  color: #555;
}

/* ACTION */
.card-action {
  padding: 0 15px 15px;
}

.view-btn {
  width: 100%;
  padding: 10px;
  border-radius: 12px;
  background: var(--color-Azul);
  color: white;
  border: none;
  font-weight: bold;
  font-size: 0.85rem;
  cursor: pointer;
  transition: 0.2s;
}

.view-btn:hover {
  background: var(--color-AzulTres);
  transform: scale(1.02);
}

.view-btn:active {
  transform: scale(0.98);
}
</style>

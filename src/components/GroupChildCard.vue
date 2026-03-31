<script setup lang="ts">
export interface Group {
  id: number
  name: string
  description: string
  active: boolean
  owner: {
    name: string
    lastname: string
  }
  period: {
    name: string
    year: number
  }
  assignments_count: number
  completed_tasks: number
  pending_tasks: number
}

export interface Student {
  name: string
  lastname: string
}

defineProps<{
  group: Group
  student: Student
}>()
</script>

<template>
  <div class="card" :class="{ inactive: !group.active }">
    <!-- HEADER -->
    <div class="card-top">
      <span class="period-pill"> {{ group.period.name }} · {{ group.period.year }} </span>

      <div class="dot" :class="{ inactive: !group.active }"></div>
    </div>

    <!-- BODY -->
    <div class="card-body">
      <!-- 👦 HIJO -->
      <p class="student-name">{{ student.name }} {{ student.lastname }}</p>

      <!-- 📚 GRUPO -->
      <p class="card-title">{{ group.name }}</p>

      <p class="card-desc">
        {{ group.description || 'Sin descripción disponible.' }}
      </p>

      <!-- 👨‍🏫 DOCENTE -->
      <div class="meta">
        <div class="meta-box full">
          <div class="meta-label">Docente</div>
          <div class="meta-value teacher">{{ group.owner.name }} {{ group.owner.lastname }}</div>
        </div>
      </div>
    </div>

    <!-- FOOTER -->
    <div class="card-footer">
      <span class="status" :class="{ inactive: !group.active }">
        {{ group.active ? 'Activo' : 'Finalizado' }}
      </span>

      <!-- 📊 PROGRESO -->
      <div class="counts">
        <span>✔ {{ group.completed_tasks }}</span>
        <span>⏳ {{ group.pending_tasks }}</span>
      </div>
    </div>

    <!-- ACTION -->
    <div class="card-action">
      <button class="view-btn">Ver detalles</button>
    </div>
  </div>
</template>

<style scoped>
.card {
  width: 100%;
  max-width: 300px;
  background: var(--color-Contenedor);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 10px 25px #00000030;
  transition: all 0.25s ease;
}

.card:hover {
  transform: translateY(-6px);
}

/* HEADER */
.card-top {
  background: linear-gradient(135deg, var(--color-Azul), var(--color-AzulTres));
  padding: 15px;
  display: flex;
  justify-content: space-between;
}

.inactive .card-top {
  background: var(--color-OscuroDos);
}

.period-pill {
  background: var(--color-Blanco);
  font-size: 11px;
  padding: 4px 10px;
  border-radius: 20px;
}

/* BODY */
.card-body {
  padding: 15px;
}

.student-name {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--color-AzulTres);
  margin-bottom: 5px;
}

.card-title {
  font-size: 1rem;
  font-weight: 700;
}

.card-desc {
  font-size: 0.85rem;
  opacity: 0.8;
  margin-bottom: 15px;
}

/* META */
.meta-box.full {
  width: 100%;
  background: var(--color-ContenedorClaro);
  border-radius: 10px;
  padding: 10px;
}

.meta-label {
  font-size: 11px;
  opacity: 0.7;
}

.meta-value.teacher {
  font-weight: 600;
}

/* FOOTER */
.card-footer {
  padding: 12px 15px;
  display: flex;
  justify-content: space-between;
}

.status {
  font-size: 12px;
  color: #2ecc71;
}

.status.inactive {
  color: #e74c3c;
}

.counts {
  font-size: 12px;
  display: flex;
  gap: 10px;
}

/* ACTION */
.card-action {
  padding: 10px 15px 15px;
}

.view-btn {
  width: 100%;
  padding: 8px;
  border-radius: 10px;
  background: var(--color-Azul);
  color: white;
  font-weight: 600;
  transition: 0.2s;
}

.view-btn:hover {
  background: var(--color-AzulTres);
}
</style>

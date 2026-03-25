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
  students_count: number
  assignments_count: number
}


defineProps<{ group: Group }>()
</script>

<template>
  <div class="card" :class="{ inactive: !group.active }">

    <!-- HEADER -->
    <div class="card-top">
      <span class="period-pill">
        {{ group.period.name }} · {{ group.period.year }}
      </span>

      <div class="dot" :class="{ inactive: !group.active }"></div>
    </div>

    <!-- BODY -->
    <div class="card-body">
      <p class="card-title">{{ group.name }}</p>

      <p class="card-desc">
        {{ group.description || 'Sin descripción disponible.' }}
      </p>

      <div class="meta">
        <div class="meta-box">
          <div class="meta-label">ID</div>
          <div class="meta-value id">#{{ group.id }}</div>
        </div>

        <div class="meta-box">
          <div class="meta-label">Docente</div>
          <div class="meta-value teacher">
            {{ group.owner.name }} {{ group.owner.lastname }}
          </div>
        </div>
      </div>
    </div>

    <!-- FOOTER -->
    <div class="card-footer">
      <span class="status" :class="{ inactive: !group.active }">
        {{ group.active ? 'Activo' : 'Finalizado' }}
      </span>

      <div class="counts">
        <span>{{ group.students_count }} alumnos</span>
        <span>{{ group.assignments_count }} tareas</span>
      </div>
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
  box-shadow: 0 15px 35px #00000040;
}

/* HEADER */
.card-top {
  background: linear-gradient(
    135deg,
    var(--color-Azul),
    var(--color-AzulTres)
  );
  padding: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.inactive .card-top {
  background: var(--color-OscuroDos);
}

.period-pill {
  background: var(--color-Blanco);
  color: var(--color-AzulCuatro);
  font-size: 11px;
  padding: 4px 10px;
  border-radius: 20px;
  font-weight: 600;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #4cff88;
}

.dot.inactive {
  background: #ff6b6b;
}

/* BODY */
.card-body {
  padding: 15px;
}

.card-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-TitulosMenu);
  margin-bottom: 5px;
}

.card-desc {
  font-size: 0.85rem;
  color: var(--color-Texto);
  opacity: 0.8;
  margin-bottom: 15px;
}

/* META */
.meta {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.meta-box {
  background: var(--color-ContenedorClaro);
  border-radius: 10px;
  padding: 10px;
}

.meta-label {
  font-size: 11px;
  opacity: 0.7;
}

.meta-value {
  font-size: 0.9rem;
  font-weight: 600;
}

.meta-value.id {
  color: var(--color-AzulCuatro);
}

.meta-value.teacher {
  color: var(--color-AzulTres);
}

/* FOOTER */
.card-footer {
  padding: 12px 15px;
  background: rgba(0,0,0,0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.status {
  font-size: 12px;
  font-weight: 600;
  color: #2ecc71;
}

.status.inactive {
  color: #e74c3c;
}

.counts {
  font-size: 12px;
  color: var(--color-Texto);
  display: flex;
  gap: 10px;
}
</style>
<script setup lang="ts">
interface Grade {
  unit_name: string
  grade: any
}

defineProps<{ grade: Grade }>()

const formatGrade = (value: any) => {
  const num = parseFloat(value)
  return isNaN(num) ? '0.0' : num.toFixed(1)
}
</script>

<template>
  <div class="unit-grade-item">
    <div class="unit-info">
      <p class="unit-name">{{ grade.unit_name }}</p>
    </div>
    <div :class="['grade-badge', parseFloat(grade.grade) >= 7 ? 'pass' : 'fail']">
      {{ formatGrade(grade.grade) }}
    </div>
  </div>
</template>

<style scoped>
.unit-grade-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 15px;
  background: var(--color-Blanco);
  border: 1px solid var(--color-Bordes);
  border-radius: 10px;
  margin-bottom: 8px;
}

.unit-name {
  margin: 0;
  font-size: 0.9rem;
  color: var(--color-Texto);
  font-weight: 500;
}

.grade-badge {
  font-weight: 800;
  font-size: 1rem;
  padding: 4px 10px;
  border-radius: 8px;
  min-width: 35px;
  text-align: center;
}

.pass {
  background: var(--color-Entregado);
  color: var(--color-StatusEntregado);
}
.fail {
  background: var(--color-Tardio);
  color: var(--color-StatusTardio);
}
</style>

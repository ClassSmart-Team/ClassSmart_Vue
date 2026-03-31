<script setup lang="ts">
interface Grade {
  unit_name: string
  grade: number
  order: number
}

defineProps<{ grade: Grade }>()
</script>

<template>
  <div class="unit-grade-item">
    <div class="unit-info">
      <span class="unit-number">Unidad {{ grade.order }}</span>
      <p class="unit-name">{{ grade.unit_name }}</p>
    </div>
    <div :class="['grade-badge', grade.grade >= 7 ? 'pass' : 'fail']">
      {{ grade.grade.toFixed(1) }}
    </div>
  </div>
</template>

<style scoped>
.unit-grade-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 15px;
  background: #f8f9fa;
  border-radius: 10px;
  margin-bottom: 8px;
}

.unit-number {
  font-size: 0.7rem;
  font-weight: bold;
  color: var(--color-AzulTres);
  text-transform: uppercase;
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
  background: #e3f9e5;
  color: #1f7a28;
}
.fail {
  background: #fee2e2;
  color: #b91c1c;
}
</style>

<script setup lang="ts">
// La interfaz ahora coincide con los campos del modelo Group de Laravel
interface Subject {
  id: number
  name: string
  teacher: string // Desde group.ownerUser.name
  description: string // Mapeado a room/descripción
  grade?: number
}

defineProps<{
  subject: Subject
}>()

const emit = defineEmits(['view-details'])
</script>

<template>
  <div class="subject-card">
    <div class="card-main">
      <div class="subject-icon">📖</div>
      <div class="subject-info">
        <h4>{{ subject.name }}</h4>
        <p class="teacher">Prof. {{ subject.teacher }}</p>
        <p class="room">{{ subject.description }}</p>
      </div>

      <div v-if="subject.grade !== undefined" class="subject-grade">
        <span class="label">Puntos</span>
        <span :class="['score', subject.grade >= 7 ? 'pass' : 'fail']">
          {{ subject.grade }}
        </span>
      </div>
    </div>

    <div class="card-footer">
      <router-link
        :to="{ name: 'parentGroupDetail', params: { id: subject.id } }"
        class="btn-link-view"
      >
        <span>Ver clase </span>
        <i class="icon-arrow">→</i>
      </router-link>
    </div>
  </div>
</template>

<style scoped>
.subject-card {
  background: white;
  border-radius: 18px;
  border: 1px solid #edf2f7;
  display: flex;
  flex-direction: column;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
}

.subject-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.05);
  border-color: var(--color-AzulTres);
}

.card-main {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 20px;
}

.subject-icon {
  font-size: 1.4rem;
  background: #f0f4ff;
  width: 45px;
  height: 45px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
}

.subject-info {
  flex-grow: 1;
}
.subject-info h4 {
  margin: 0;
  color: var(--color-Azul);
  font-size: 1rem;
  font-weight: 700;
}
.teacher {
  margin: 2px 0;
  font-size: 0.85rem;
  color: #555;
}
.room {
  margin: 0;
  font-size: 0.75rem;
  color: #999;
}

.subject-grade {
  text-align: center;
  padding-left: 15px;
  border-left: 1px solid #eee;
}

.label {
  display: block;
  font-size: 0.6rem;
  color: #aaa;
  text-transform: uppercase;
}
.score {
  font-weight: 800;
  font-size: 1.1rem;
}
.pass {
  color: #2ecc71;
}
.fail {
  color: #e74c3c;
}

.card-footer {
  padding: 10px 20px;
  background: #fcfcfc;
  border-top: 1px solid #f5f5f5;
  border-radius: 0 0 18px 18px;
}

.btn-action {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: transparent;
  border: none;
  color: var(--color-AzulTres);
  font-weight: 700;
  font-size: 0.85rem;
  cursor: pointer;
}

.arrow {
  transition: transform 0.2s;
}
.btn-action:hover .arrow {
  transform: translateX(5px);
}
</style>

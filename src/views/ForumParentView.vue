<script setup lang="ts">
import { ref, computed } from 'vue'
import SidebarLayout from '@/components/ParentSidebar.vue'
import ForumCard from '@/components/ForumCard.vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const selectedChild = ref('todos')

const childrenNames = ref(['Mateo', 'Sofía'])

const forums = ref([
  {
    id: 1,
    childName: 'Mateo',
    subjectName: 'Matemáticas IV',
    lastMessage: 'Profe, ¿el examen es el lunes?',
    unreadCount: 3,
  },
  {
    id: 2,
    childName: 'Mateo',
    subjectName: 'Física I',
    lastMessage: 'Materiales listos para la práctica.',
    unreadCount: 0,
  },
  {
    id: 3,
    childName: 'Sofía',
    subjectName: 'Español',
    lastMessage: 'No olviden su libro de lecturas.',
    unreadCount: 1,
  },
  {
    id: 4,
    childName: 'Sofía',
    subjectName: 'Historia',
    lastMessage: 'Ensayo entregado.',
    unreadCount: 0,
  },
])

const filteredForums = computed(() => {
  if (selectedChild.value === 'todos') return forums.value
  return forums.value.filter((f) => f.childName === selectedChild.value)
})
</script>

<template>
  <SidebarLayout>
    <div class="ContSmall center">
      <h1>Foros de Discusión</h1>
    </div>

    <div class="ContBig" style="margin-top: 40px">
      <div class="filter-section">
        <label for="child-select">Filtrar por hijo:</label>
        <select id="child-select" v-model="selectedChild" class="custom-select">
          <option value="todos">Todos los hijos</option>
          <option v-for="name in childrenNames" :key="name" :value="name">
            {{ name }}
          </option>
        </select>
      </div>

      <hr class="divider" />

      <div v-if="filteredForums.length > 0" class="forums-grid">
        <TransitionGroup name="list">
          <ForumCard v-for="f in filteredForums" :key="f.id" :forum="f" />
        </TransitionGroup>
      </div>

      <div v-else class="empty-state">
        <p>No hay foros disponibles para esta selección.</p>
      </div>
    </div>
  </SidebarLayout>
</template>

<style scoped>
.filter-section {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
}

.filter-section label {
  font-weight: bold;
  color: #666;
  font-size: 0.9rem;
}

.custom-select {
  padding: 8px 15px;
  border-radius: 10px;
  border: 1px solid var(--color-ContenedorClaro);
  background-color: #f9f9f9;
  color: var(--color-Azul);
  font-weight: bold;
  outline: none;
  cursor: pointer;
}

.custom-select:focus {
  border-color: var(--color-AzulTres);
}

.divider {
  border: 0;
  border-top: 1px solid #eee;
  margin-bottom: 25px;
}

.forums-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

.empty-state {
  text-align: center;
  padding: 50px;
  color: #aaa;
}

.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

@media (max-width: 600px) {
  .filter-section {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  .custom-select {
    width: 100%;
  }
}

.ContBig {
  background: var(--color-Blanco);
  width: 95%;
  max-width: 800px;
  min-height: min-content;
  border-radius: 20px;
  margin: 40px auto;
  padding: 40px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  box-sizing: border-box;
  max-height: 60vh;
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.ContBig::-webkit-scrollbar {
  width: 8px;
  display: none;
}
.ContBig::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 10px;
}
</style>

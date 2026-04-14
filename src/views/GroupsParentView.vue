<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import SidebarLayout from '@/components/ParentSidebar.vue'
import GroupCard from '@/components/GroupChildCard.vue'
import { useapi } from '@/assets/composables/useApi'
import { useAuthStore } from '@/stores/authStore.ts'

const ua = useAuthStore()
const { data, error, isFetching } = useapi('/parent/groups').json()

const selectedChildId = ref<number | string | null>(null)

const childrenGroups = computed(() => {
  if (!data.value) return []
  return data.value.data || data.value || []
})

watch(childrenGroups, (newVal) => {
  if (newVal.length > 0 && !selectedChildId.value) {
    selectedChildId.value = newVal[0].childId
  }
})

const totalGroupsCount = computed(() => {
  const selectedChild = childrenGroups.value.find((a: any) => a.childId === selectedChildId.value)

  if (!selectedChild) return 0

  const groupsArray = selectedChild.groups || selectedChild.enrolled_groups || []

  return groupsArray.length
})

const selectedChildData = computed(() => {
  return childrenGroups.value.find((child: any) => child.childId === selectedChildId.value)
})
</script>

<template>
  <div class="bg-page">
    <SidebarLayout>
      <div class="ContSmall">
        <div class="left">
          <div class="avatar">
            {{ ua.credentials?.user.name.charAt(0) }}{{ ua.credentials?.user.lastname.charAt(0) }}
          </div>
          <div>
            <h1>Grupos</h1>
            <p v-if="childrenGroups">{{ totalGroupsCount }} grupos encontrados</p>
          </div>
        </div>
        <div class="right">
          <span class="welcome-text">{{ ua.credentials?.user.name }}</span>
        </div>
      </div>

      <div class="main-box" style="margin-top: 30px">
        <div v-if="isFetching" class="loading-state">
          <div class="spinner"></div>
          <p>Buscando grupos...</p>
        </div>

        <div v-else-if="error" class="error-banner">
          <span>
            <img src="@/components/advertencia-triangulo.png" alt="advertencia" />
          </span>
          <p>No se pudo cargar la información.</p>
        </div>

        <template v-else>
          <template v-if="childrenGroups.length > 0">
            <div class="child-selector">
              <label for="child-select">Ver grupos de: </label>
              <select id="child-select" v-model="selectedChildId">
                <option v-for="child in childrenGroups" :key="child.childId" :value="child.childId">
                  {{ child.childName }}
                </option>
              </select>
            </div>

            <div v-if="selectedChildData" class="child-section">
              <div class="groups-grid">
                <GroupCard
                  v-for="group in selectedChildData.groups ||
                  selectedChildData.enrolled_groups ||
                  []"
                  :key="group.id"
                  :group="group"
                  :childId="selectedChildData.childId"
                />
              </div>
            </div>
          </template>
        </template>
      </div>
    </SidebarLayout>
  </div>
</template>

<style scoped>
.bg-page {
  min-height: 100vh;
  inset: 0;
  overflow-x: hidden;
  overflow-y: auto;
  z-index: -1;
}

.ContSmall {
  background: var(--color-Azul);
  width: 1000px;
  min-height: 40px;
  border-radius: 20px;
  margin: 0 auto;
  padding: 20px 25px;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.ContSmall h1 {
  margin: 0;
  font-size: 1.5rem;
  letter-spacing: -0.5px;
}

.ContSmall p {
  margin: 0;
  font-size: 0.9rem;
  opacity: 0.8;
}

.welcome-text {
  font-weight: 600;
  font-size: 0.9rem;
  background: rgba(255, 255, 255, 0.1);
  padding: 8px 15px;
  border-radius: 10px;
}

.loading-state,
.empty-state {
  text-align: center;
  padding: 80px 20px;
  color: #94a3b8;
}
.spinner {
  width: 45px;
  height: 45px;
  border: 4px solid #f1f5f9;
  border-top: 4px solid var(--color-Azul);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}
.empty-icon {
  font-size: 3rem;
  margin-bottom: 15px;
  opacity: 0.5;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.error-banner {
  background: #fee2e2;
  color: #dc2626;
  padding: 18px;
  border-radius: 15px;
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 700;
}

@media (max-width: 1050px) {
  .ContSmall,
  .ContBig {
    width: 95%;
  }
}

.state-msg {
  font-size: 1.1rem;
  font-weight: 600;
  color: #555;
  margin-top: 15px;
}

.child-section {
  margin-bottom: 40px;
}

.child-header h2 {
  font-size: 1.1rem;
  color: var(--color-AzulTres);
  white-space: nowrap;
  font-weight: bold;
}

/*GRUPOS*/
.groups-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 25px;
  margin-top: 20px;
}

@media (max-width: 768px) {
  .groups-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 15px;
  }
}

/*SELECT*/
.child-selector {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 20px;
}

.child-selector label {
  font-size: 0.85rem;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
}

.child-selector select {
  background-color: var(--color-Blanco);
  padding: 8px 15px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  color: var(--color-Azul);
  font-weight: 600;
  cursor: pointer;
  outline: none;
  min-width: 200px;
}

.no-children-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 0;
}
</style>

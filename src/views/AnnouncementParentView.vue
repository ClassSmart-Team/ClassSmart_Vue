<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import SidebarLayout from '@/components/ParentSidebar.vue'
import AnnouncementCard from '@/components/AnnouncementCard.vue'
import { useapi } from '@/assets/composables/useApi'
import type { Announcement, Child, Group, GroupedForum } from '@/types/types.ts'
import { useAuthStore } from '@/stores/authStore.ts'

const ua = useAuthStore()
const {
  data: childrenData,
  isFetching: loadingChildren,
  error: errorChildren,
} = useapi('/my-children').json()
const children = computed(() => childrenData.value?.data || [])

const {
  data: announcementsData,
  isFetching: loadingAnnouncements,
  error,
} = useapi('/announcements').json()
const announcements = computed<Announcement[]>(() => announcementsData.value?.data || [])

const selectedChild = ref<number | null>(null)

watch(
  children,
  (newChildren) => {
    if (newChildren.length > 0 && !selectedChild.value) {
      selectedChild.value = newChildren[0].id
    }
  },
  { immediate: true },
)

const groupedForums = computed<GroupedForum[]>(() => {
  if (!selectedChild.value) return []
  const forumsList: GroupedForum[] = []

  const child = children.value.find((c: Child) => Number(c.id) === Number(selectedChild.value))
  if (!child || !child.groups) return []

  child.groups.forEach((group: Group) => {
    const ads = announcements.value.filter(
      (a) => (a.group?.id !== undefined && Number(a.group?.id)) === Number(group.id),
    )
    const latestAd = ads.length > 0 ? ads[0] : null

    forumsList.push({
      group: group,
      latestAnnouncement: latestAd,
      count: ads.length,
    })
  })

  return forumsList
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
            <h1>Anuncios</h1>
          </div>
        </div>
        <div class="right">
          <span class="welcome-text">{{ ua.credentials?.user.name }}</span>
        </div>
      </div>

      <div class="main-box" style="margin-top: 30px">
        <div v-if="loadingAnnouncements || loadingChildren" class="loading-state">
          <div class="spinner"></div>
          <p>Cargando anuncios...</p>
        </div>

        <div v-else-if="error" class="error-banner">
          <span><img src="@/components/advertencia-triangulo.png" alt="error" /></span>
          <p>Hubo un problema al cargar la información.</p>
        </div>

        <template v-else>
          <template v-if="children.length > 0">
            <div class="filter-section">
              <label for="child-select">Filtrar por hijo:</label>
              <select id="child-select" v-model="selectedChild" class="custom-select">
                <option v-for="child in children" :key="child.id" :value="child.id">
                  {{ child.name }}
                </option>
              </select>
            </div>

            <hr class="divider" />

            <div v-if="loadingAnnouncements || loadingChildren" class="empty-state">
              <div class="loader-dots"></div>
              <p>Cargando anuncios...</p>
            </div>

            <div v-else-if="groupedForums.length > 0" class="forums-grid">
              <TransitionGroup name="list">
                <AnnouncementCard
                  v-for="item in groupedForums"
                  :key="item.group.id"
                  :group="item.group"
                  :latest-announcement="item.latestAnnouncement"
                  :total-ads="item.count"
                />
              </TransitionGroup>
            </div>
          </template>

          <div v-if="errorChildren" class="no-children-empty">
            <span><img src="@/components/estudiante.png" /></span>
            <p>No se encontraron alumnos vinculados.</p>
          </div>
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

/*SELECT*/
.filter-section {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
}

.filter-section label {
  font-weight: bold;
  color: var(--color-Texto);
  font-size: 0.9rem;
}

.custom-select {
  padding: 8px 15px;
  border-radius: 10px;
  border: 1px solid var(--color-ContenedorClaro);
  background-color: var(--color-Blanco);
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
  border-top: 1px solid var(--color-Bordes);
  margin-bottom: 25px;
}

.forums-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
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
</style>

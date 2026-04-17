<script setup lang="ts">
import { computed } from 'vue'
import SidebarLayout from '@/components/ParentSidebar.vue'
import AnnouncementPostCard from '@/components/AnnouncementPostCard.vue'
import { useRoute } from 'vue-router'
import { useapi } from '@/assets/composables/useApi.ts'
import type { Announcement } from '@/types/types.ts'
import { useAuthStore } from '@/stores/authStore.ts'

const ua = useAuthStore()
const route = useRoute()
const groupId = route.params.id
const childId = route.params.childId

const { data: announcementsData, isFetching: loadingAds, error } = useapi('/announcements').json()

const { data: groupData, isFetching: loadingGroup } = useapi(
  `/groups/${groupId}?child_id=${childId}`,
).json()

const filteredAnnouncements = computed(() => {
  const announcementList = announcementsData.value?.data || []

  const filtered = announcementList.filter(
    (a: Announcement) => Number(a.group?.id) === Number(groupId),
  )

  return filtered.sort((a: Announcement, b: Announcement) => {
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  })
})

const isFetching = computed(() => loadingAds.value || loadingGroup.value)
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

      <div class="main-box forum-layout" style="margin-top: 40px; padding: 25px">
        <div v-if="isFetching" class="loading-state">
          <div class="spinner"></div>
          <p>Cargando anuncios de grupos...</p>
        </div>

        <div v-else-if="error" class="error-banner">
          <span><img src="@/components/advertencia-triangulo.png" alt="error" /></span>
          <p>Hubo un problema al cargar la información.</p>
        </div>

        <template v-else>
          <div v-if="filteredAnnouncements.length > 0" class="announcements-list">
            <AnnouncementPostCard
              v-for="item in filteredAnnouncements"
              :key="item.id"
              :announcement="item"
              :teacher-name="
                item.group?.owner
                  ? `${item.group.owner.name} ${item.group.owner.lastname}`
                  : 'Profesor'
              "
            />
          </div>

          <div v-else class="empty-state">
            <p>No hay avisos en este grupo.</p>
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

.header-nav {
  width: 100%;
  display: flex;
  align-items: center;
  padding: 0 30px;
  position: relative;
}
.btn-back {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  padding: 5px 12px;
  border-radius: 10px;
  cursor: pointer;
  font-size: 0.8rem;
}

.author-info h3 {
  margin: 0;
  font-size: 1rem;
  color: var(--color-Azul);
}

.post-body p {
  line-height: 1.6;
  color: #475569;
  font-size: 1rem;
}

.icon-circle {
  width: 70px;
  height: 70px;
  background: var(--color-Aviso);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  margin-bottom: 10px;
}
</style>

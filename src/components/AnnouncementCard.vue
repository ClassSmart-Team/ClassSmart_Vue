<script setup lang="ts">
import { useRouter } from 'vue-router'
import type { Announcement, Group } from '@/types/types.ts'

const router = useRouter()

const props = defineProps<{
  group: Group
  latestAnnouncement: Announcement | null | undefined
}>()
function goToForum() {
  router.push({ name: 'parentAnnouncementDetail', params: { id: props.group.id } })
}
</script>

<template>
  <div class="forum-card">
    <div class="forum-header">
      <span class="child-tag">{{ group.name || 'General' }}</span>
    </div>

    <div class="forum-body">
      <template v-if="latestAnnouncement">
        <h4>{{ latestAnnouncement.title }}</h4>
        <p class="last-msg">"{{ latestAnnouncement.message }}"</p>
      </template>
      <template v-else>
        <h4 class="no-ads">Sin anuncios</h4>
        <p class="last-msg">No hay publicaciones recientes en esta materia.</p>
      </template>
    </div>

    <button @click="goToForum()" class="btn-forum">Ver anuncios</button>
  </div>
</template>

<style scoped>
.forum-card {
  background: var(--color-Blanco);
  border-radius: 15px;
  padding: 20px;
  border: 1px solid var(--color-ContenedorClaro);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition: all 0.3s ease;
  min-height: 180px;
}

.forum-card:hover {
  transform: translateY(-5px);
  border-color: var(--color-AzulTres);
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.05);
}

.forum-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.child-tag {
  font-size: 0.7rem;
  font-weight: 800;
  color: var(--color-Azul);
  text-transform: uppercase;
  background: var(--color-Blanco);
  padding: 4px 8px;
  border-radius: 6px;
}

.forum-body h4 {
  margin: 0;
  color: var(--color-Anuncio);
  font-size: 1.1rem;
  line-height: 1.2;
}

.last-msg {
  font-size: 0.85rem;
  color: var(--color-Texto);
  font-style: italic;
  margin: 12px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.btn-forum {
  background: var(--color-Azul);
  color: white;
  border: none;
  padding: 12px;
  border-radius: 10px;
  cursor: pointer;
  font-weight: bold;
  margin-top: 10px;
  transition: background 0.2s;
}

.btn-forum:hover {
  background: var(--color-AzulTres);
}

.no-ads {
  color: #ccc !important;
  font-style: italic;
}
</style>

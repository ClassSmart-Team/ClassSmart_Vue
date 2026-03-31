<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

function goToTask(id) {
  router.push({ name: 'parentForumDetail', params: { id } })
}
interface Forum {
  id: number
  subjectName: string
  childName: string
  lastMessage: string
  unreadCount: number
}

defineProps<{ forum: Forum }>()
</script>

<template>
  <div class="forum-card">
    <div class="forum-header">
      <span class="child-tag">{{ forum.childName }}</span>
      <div v-if="forum.unreadCount > 0" class="unread-badge">{{ forum.unreadCount }}</div>
    </div>

    <div class="forum-body">
      <h4>{{ forum.subjectName }}</h4>
      <p class="last-msg">"{{ forum.lastMessage }}"</p>
    </div>

    <button @click="goToTask(forum.id)" class="btn-forum">Entrar al Foro</button>
  </div>
</template>

<style scoped>
.forum-card {
  background: white;
  border-radius: 15px;
  padding: 20px;
  border: 1px solid var(--color-ContenedorClaro);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition: transform 0.2s;
}

.forum-card:hover {
  transform: translateY(-5px);
  border-color: var(--color-AzulTres);
}

.forum-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.child-tag {
  font-size: 0.7rem;
  font-weight: bold;
  color: var(--color-AzulTres);
  text-transform: uppercase;
}

.unread-badge {
  background: #e74c3c;
  color: white;
  font-size: 0.7rem;
  padding: 2px 8px;
  border-radius: 10px;
  font-weight: bold;
}

.forum-body h4 {
  margin: 0;
  color: var(--color-Azul);
}

.last-msg {
  font-size: 0.85rem;
  color: #888;
  font-style: italic;
  margin: 10px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.btn-forum {
  background: var(--color-Azul);
  color: white;
  border: none;
  padding: 10px;
  border-radius: 10px;
  cursor: pointer;
  font-weight: bold;
  margin-top: 10px;
}
</style>

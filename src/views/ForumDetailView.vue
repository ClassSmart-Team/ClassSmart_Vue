<script setup lang="ts">
import { ref } from 'vue'
import SidebarLayout from '@/components/ParentSidebar.vue'
import AnnouncementCard from '@/components/AnnouncementCard.vue'

const announcements = ref([
  {
    id: 1,
    title: 'Material para la práctica de Termodinámica',
    message:
      'Buen día a todos. Les recuerdo que para la sesión de mañana es obligatorio traer su bata de laboratorio y el manual impreso.',
    attachment_path: '/uploads/manual_p3.pdf',
    attachment_name: 'Manual_Practica_3.pdf',
    created_at: '2026-03-25T09:00:00',
  },
  {
    id: 2,
    title: 'Cambio de salón para el examen',
    message:
      'El examen parcial del viernes se aplicará en el Aula Magna en lugar del salón habitual. Favor de llegar 5 minutos antes.',
    attachment_path: '',
    attachment_name: '',
    created_at: '2026-03-24T15:30:00',
  },
])

const teacherName = 'Ing. Isaac Newton'
</script>

<template>
  <SidebarLayout>
    <div class="ContSmall center">
      <div class="header-nav">
        <button class="btn-back" @click="$router.back()">← Volver</button>
        <h1>Foro de Discusión</h1>
      </div>
    </div>

    <div class="ContBig forum-layout" style="margin-top: 40px; padding: 25px;">
      <div class="announcements-list">
        <AnnouncementCard
          v-for="item in announcements"
          :key="item.id"
          :announcement="item"
          :teacher-name="teacherName"
        />

        <div v-if="announcements.length === 0" class="empty-state">
          <p>No hay avisos recientes en este grupo.</p>
        </div>
      </div>
    </div>
  </SidebarLayout>
</template>

<style scoped>
.ContSmall {
  background: var(--color-Azul);
  width: 95%;
  max-width: 900px;
  height: 60px;
  border-radius: 20px;
  margin: 0 auto;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
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
h1 {
  flex-grow: 1;
  text-align: center;
  font-size: 1.2rem;
  margin-right: 50px;
}

.ContBig {
  background: var(--color-Blanco);
  width: 95%;
  max-width: 900px;
  border-radius: 24px;
  margin: 40px auto;
  padding: 0;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
}

.main-post {
  padding: 30px;
  border-bottom: 2px solid #f8fafc;
  background: linear-gradient(to bottom, #ffffff, #fcfcfc);
}
.post-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
}
.author-avatar {
  width: 45px;
  height: 45px;
  background: var(--color-AzulTres);
  color: white;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.2rem;
}
.author-info h3 {
  margin: 0;
  font-size: 1rem;
  color: var(--color-Azul);
}
.role-badge {
  background: #e0f2fe;
  color: #0369a1;
  font-size: 0.65rem;
  padding: 2px 8px;
  border-radius: 5px;
  font-weight: bold;
  text-transform: uppercase;
}
.post-date {
  display: block;
  font-size: 0.75rem;
  color: #94a3b8;
  margin-top: 3px;
}

.post-title {
  font-size: 1.4rem;
  color: #1e293b;
  margin: 15px 0 10px 0;
}
.post-body p {
  line-height: 1.6;
  color: #475569;
  font-size: 1rem;
}
.post-footer {
  margin-top: 20px;
  padding-top: 15px;
  border-top: 1px solid #f1f5f9;
}
.replies-stat {
  font-size: 0.85rem;
  color: #64748b;
  font-weight: 600;
}

.replies-section {
  padding: 30px;
  background: #f8fafc;
}
.replies-header h4 {
  margin-bottom: 20px;
  color: #475569;
  font-size: 1.1rem;
}

.replies-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 30px;
}
.reply-card {
  background: white;
  padding: 15px 20px;
  border-radius: 15px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
  border: 1px solid #f1f5f9;
}
.highlight-child {
  border-left: 4px solid var(--color-AzulTres);
  background: #f0f7ff;
}

.reply-user-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}
.reply-user {
  font-weight: 800;
  font-size: 0.85rem;
  color: var(--color-Azul);
}
.child-tag {
  background: var(--color-AzulTres);
  color: white;
  font-size: 0.6rem;
  padding: 1px 6px;
  border-radius: 4px;
  font-weight: bold;
}
.reply-time {
  font-size: 0.7rem;
  color: #94a3b8;
  margin-left: auto;
}
.reply-text {
  font-size: 0.95rem;
  color: #334155;
  margin: 0;
  line-height: 1.5;
}
</style>

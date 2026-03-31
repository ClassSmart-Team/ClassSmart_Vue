<script setup lang="ts">
// Definimos la interfaz basada en tu modelo de Laravel
interface Announcement {
  id: number
  title: string
  message: string
  attachment_path?: string
  attachment_name?: string
  created_at: string
}

defineProps<{
  announcement: Announcement
  teacherName: string
}>()

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}
</script>

<template>
  <div class="announcement-card">
    <div class="card-header">
      <div class="teacher-avatar">👨‍🏫</div>
      <div class="meta-info">
        <span class="teacher-name">{{ teacherName }}</span>
        <span class="post-date">{{ formatDate(announcement.created_at) }}</span>
      </div>
    </div>

    <div class="card-body">
      <h3 class="announcement-title">{{ announcement.title }}</h3>
      <p class="announcement-message">{{ announcement.message }}</p>
    </div>

    <div v-if="announcement.attachment_path" class="attachment-box">
      <div class="attachment-info">
        <span class="icon">📎</span>
        <span class="filename">{{ announcement.attachment_name || 'Archivo adjunto' }}</span>
      </div>
      <a :href="announcement.attachment_path" target="_blank" class="btn-download">Ver</a>
    </div>
  </div>
</template>

<style scoped>
.announcement-card {
  background: white;
  border-radius: 18px;
  padding: 25px;
  border: 1px solid #f1f5f9;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.02);
  margin-bottom: 20px;
  transition: transform 0.2s;
}

.announcement-card:hover {
  transform: translateY(-3px);
  border-color: var(--color-AzulTres);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 15px;
}

.teacher-avatar {
  width: 40px;
  height: 40px;
  background: #f0f7ff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
}

.teacher-name {
  display: block;
  font-weight: 800;
  color: var(--color-Azul);
  font-size: 0.9rem;
}

.post-date {
  font-size: 0.75rem;
  color: #94a3b8;
}

.announcement-title {
  font-size: 1.15rem;
  color: #1e293b;
  margin-bottom: 10px;
  font-weight: 700;
}

.announcement-message {
  color: #475569;
  line-height: 1.6;
  font-size: 0.95rem;
  white-space: pre-wrap; /* Mantiene saltos de línea de la DB */
}

/* ESTILO DEL ADJUNTO */
.attachment-box {
  margin-top: 20px;
  padding: 12px 15px;
  background: #f8fafc;
  border-radius: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px dashed #cbd5e1;
}

.attachment-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.filename {
  font-size: 0.85rem;
  font-weight: 600;
  color: #334155;
}

.btn-download {
  text-decoration: none;
  font-size: 0.8rem;
  font-weight: bold;
  color: var(--color-Azul);
  background: white;
  padding: 5px 12px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

@media (max-width: 600px) {
  .announcement-card {
    padding: 18px;
  }
  .attachment-box {
    flex-direction: column;
    gap: 10px;
    align-items: flex-start;
  }
  .btn-download {
    width: 100%;
    text-align: center;
  }
}
</style>

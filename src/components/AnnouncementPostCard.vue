<script setup lang="ts">
import type { Announcement } from '@/types/types.ts'
import { computed } from 'vue'

const props = defineProps<{
  announcement: Announcement
  teacherName?: string
}>()

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

const TeacherFullName = computed(() => {
  if (props.teacherName) return props.teacherName

  const teacher = props.announcement.group?.owner
  return teacher ? `${teacher.name} ${teacher.lastname}` : 'Profesor'
})

const teacherInitials = computed(() => {
  // Caso 1: Si el nombre viene por props
  if (props.teacherName) {
    const words = props.teacherName.split(' ')
    let initials = ''

    words.forEach((word) => {
      if (word.length > 0) {
        initials += word[0].toUpperCase()
      }
    })

    return initials.substring(0, 2) // Retorna máximo 2 letras
  }

  // Caso 2: Si viene del objeto announcement
  const teacher = props.announcement.group?.owner
  if (teacher) {
    let initials = ''
    const names = [teacher.name, teacher.lastname]

    names.forEach((name) => {
      if (name && name.length > 0) {
        initials += name[0].toUpperCase()
      }
    })

    return initials
  }

  return 'P' // Valor por defecto
})
</script>

<template>
  <div class="announcement-card">
    <div class="card-header">
      <div class="avatar">
        {{ teacherInitials }}
      </div>
      <div class="meta-info">
        <span class="teacher-name">{{ TeacherFullName }}</span>
        <span class="post-date">{{ formatDate(announcement.created_at) }}</span>
      </div>
    </div>

    <div class="card-body">
      <h3 class="announcement-title">{{ announcement.title }}</h3>
      <p class="announcement-message">{{ announcement.message }}</p>
    </div>

    <div v-if="announcement.attachment_path" class="attachment-box">
      <div class="attachment-info">
        <div class="file-preview">📄</div>
        <span class="filename">{{ announcement.attachment_name || 'Archivo adjunto' }}</span>
      </div>
      <a
        :href="`http://localhost:8000/storage/${announcement.attachment_path}`"
        target="_blank"
        class="btn-download"
        >Ver</a
      >
    </div>
  </div>
</template>

<style scoped>
.announcement-card {
  background: var(--color-Blanco);
  border-radius: 18px;
  padding: 25px;
  border: 1px solid var(--color-Bordes);
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
  margin-bottom: 30px;
}

.avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: var(--color-Avatar);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 500;
  color: #0f6e56;
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
  color: var(--color-Anuncio);
  margin-bottom: 10px;
  font-weight: 700;
}

.announcement-message {
  color: var(--color-Texto);
  line-height: 1.6;
  font-size: 0.95rem;
  white-space: pre-wrap;
}

/* ESTILO DEL ADJUNTO */
.attachment-box {
  margin-top: 20px;
  padding: 12px 15px;
  background: var(--color-Blanco);
  border-radius: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px dashed var(--color-Bordes);
}

.attachment-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.filename {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-Texto);
}

.file-preview {
  font-size: 1.4rem;
  margin-right: 12px;
}

.btn-download {
  text-decoration: none;
  font-size: 0.8rem;
  font-weight: bold;
  color: var(--color-Azul);
  background: var(--color-Blanco);
  padding: 5px 12px;
  border-radius: 8px;
  border: 1px solid var(--color-Bordes);
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

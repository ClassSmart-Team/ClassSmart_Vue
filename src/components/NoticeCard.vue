<script setup lang="ts">
type GroupItem = {
  id: number
  name: string
  description: string | null
  active: boolean
}

type AnnouncementItem = {
  id: number
  title: string
  message: string
  attachment_path?: string | null
  attachment_name?: string | null
  attachment_url?: string | null
  group?: GroupItem | null
  created_at?: string | null
  updated_at?: string | null
}

const props = defineProps<{
  announcement: AnnouncementItem
  deleting?: boolean
}>()

const emit = defineEmits<{
  edit: [announcement: AnnouncementItem]
  delete: [announcement: AnnouncementItem]
}>()

function formatDate(date?: string | null) {
  if (!date) return '—'
  return new Date(date.replace(' ', 'T')).toLocaleString('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function groupInitial(name?: string) {
  return name ? name.charAt(0).toUpperCase() : 'G'
}
</script>

<template>
  <article class="ann-card">
    <!-- Header de la card -->
    <div class="ann-card__header">
      <div class="ann-card__group-badge">
        <span class="ann-card__group-initial">{{ groupInitial(announcement.group?.name) }}</span>
        <span class="ann-card__group-name">{{ announcement.group?.name ?? 'Sin grupo' }}</span>
      </div>

      <div class="ann-card__actions">
        <button
          class="ann-card__action-btn ann-card__action-btn--edit"
          title="Editar anuncio"
          @click="emit('edit', announcement)"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
        </button>

        <button
          class="ann-card__action-btn ann-card__action-btn--delete"
          :disabled="deleting"
          title="Eliminar anuncio"
          @click="emit('delete', announcement)"
        >
          <svg v-if="!deleting" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
            <path d="M10 11v6M14 11v6"/>
            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
          </svg>
          <svg v-else width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="ann-card__spin">
            <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- Cuerpo -->
    <div class="ann-card__body">
      <h3 class="ann-card__title">{{ announcement.title }}</h3>
      <p class="ann-card__message">{{ announcement.message }}</p>
    </div>

    <!-- Footer -->
    <div class="ann-card__footer">
      <a
        v-if="announcement.attachment_name && announcement.attachment_url"
        :href="announcement.attachment_url"
        target="_blank"
        rel="noopener noreferrer"
        class="ann-card__attachment ann-card__attachment--link"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
        </svg>
        {{ announcement.attachment_name }}
      </a>
      <span v-else-if="announcement.attachment_name" class="ann-card__attachment">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
        </svg>
        {{ announcement.attachment_name }}
      </span>

      <span class="ann-card__date">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12 6 12 12 16 14"/>
        </svg>
        {{ formatDate(announcement.created_at) }}
      </span>
    </div>
  </article>
</template>

<style scoped>
.ann-card {
  background: var(--color-Blanco);
  border-radius: 18px;
  border: 1px solid var(--color-Bordes);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  transition: box-shadow 0.2s ease, transform 0.2s ease;
}

.ann-card:hover {
  box-shadow: 0 8px 28px rgba(30, 103, 163, 0.13);
  transform: translateY(-2px);
}

/* Header */
.ann-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.ann-card__group-badge {
  display: flex;
  align-items: center;
  gap: 8px;
}

.ann-card__group-initial {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  background: linear-gradient(135deg, var(--color-AzulDos), var(--color-AzulTres));
  color: white;
  font-size: 0.85rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.ann-card__group-name {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--color-AzulTres);
  background: var(--color-Rol);
  padding: 3px 10px;
  border-radius: 999px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 160px;
}

.ann-card__actions {
  display: flex;
  gap: 6px;
  flex-shrink: 0;
}

.ann-card__action-btn {
  width: 32px;
  height: 32px;
  border-radius: 9px;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.18s ease, transform 0.15s ease;
}

.ann-card__action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.ann-card__action-btn--edit {
  background: #dbeafe;
  color: #1d4ed8;
}

.ann-card__action-btn--edit:hover:not(:disabled) {
  background: #bfdbfe;
  transform: scale(1.08);
}

.ann-card__action-btn--delete {
  background: #fee2e2;
  color: #b91c1c;
}

.ann-card__action-btn--delete:hover:not(:disabled) {
  background: #fecaca;
  transform: scale(1.08);
}

/* Body */
.ann-card__body {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
}

.ann-card__title {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  color: var(--color-Anuncio);
  line-height: 1.3;
}

.ann-card__message {
  margin: 0;
  font-size: 0.88rem;
  color: #64748b;
  line-height: 1.55;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Footer */
.ann-card__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding-top: 10px;
  border-top: 1px solid var(--color-Bordes);
  flex-wrap: wrap;
}

.ann-card__attachment {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 0.78rem;
  font-weight: 600;
  color: #075985;
  background: #e0f2fe;
  padding: 4px 10px;
  border-radius: 999px;
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-decoration: none;
}

.ann-card__attachment--link:hover {
  background: #bae6fd;
  text-decoration: underline;
}

.ann-card__date {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.78rem;
  color: #94a3b8;
  margin-left: auto;
  white-space: nowrap;
}

/* Spinner */
@keyframes spin {
  to { transform: rotate(360deg); }
}

.ann-card__spin {
  animation: spin 0.8s linear infinite;
}
</style>

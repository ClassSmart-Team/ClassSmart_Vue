<script setup lang="ts">
import { computed, ref } from 'vue'
import { useapi } from '@/assets/composables/useApi'
import SidebarLayout from "@/components/StudentSideBar.vue";

const { data, isFetching, error } = useapi('/announcements', {
  method: 'GET',
}).json()

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
}

const announcements = computed<AnnouncementItem[]>(() => data.value?.data ?? [])

const search = ref('')
const selectedGroupId = ref<number | null>(null)
const expandedId = ref<number | null>(null)

const uniqueGroups = computed(() => {
  const map = new Map<number, GroupItem>()
  announcements.value.forEach((a) => {
    if (a.group && !map.has(a.group.id)) map.set(a.group.id, a.group)
  })
  return Array.from(map.values())
})

const filtered = computed(() => {
  const term = search.value.trim().toLowerCase()
  return announcements.value.filter((a) => {
    const matchGroup = selectedGroupId.value === null || a.group?.id === selectedGroupId.value
    const matchSearch =
      !term ||
      (a.title ?? '').toLowerCase().includes(term) ||
      (a.message ?? '').toLowerCase().includes(term) ||
      (a.group?.name ?? '').toLowerCase().includes(term)
    return matchGroup && matchSearch
  })
})

function toggleExpand(id: number) {
  expandedId.value = expandedId.value === id ? null : id
}

function formatDate(date?: string | null) {
  if (!date) return '—'
  return new Date(date.replace(' ', 'T')).toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function groupInitial(name?: string) {
  return name ? name.charAt(0).toUpperCase() : 'G'
}

function hue(name?: string) {
  let hash = 0
  for (const c of name ?? '') hash = c.charCodeAt(0) + ((hash << 5) - hash)
  return Math.abs(hash) % 360
}
</script>

<template>
  <SidebarLayout>
    <div class="page">

      <!-- Orbes de blur decorativos -->
      <div class="orb orb--1"></div>
      <div class="orb orb--2"></div>
      <div class="orb orb--3"></div>

      <!-- Header -->
      <div class="page__header">
        <div class="page__header-left">
          <div class="page__header-icon">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
          </div>
          <div>
            <h1 class="page__title">Tablero de anuncios</h1>
            <p class="page__sub">Mantente al día con lo que publican tus maestros</p>
          </div>
        </div>
      </div>

      <!-- Panel glass -->
      <div class="panel">

        <!-- Buscador -->
        <div class="search-bar">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="search-bar__icon">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            v-model="search"
            class="search-bar__input"
            type="text"
            placeholder="Buscar anuncio o materia..."
          />
          <button v-if="search" class="search-bar__clear" @click="search = ''">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <!-- Chips -->
        <div v-if="uniqueGroups.length > 0" class="chips">
          <button
            class="chip"
            :class="{ 'chip--active': selectedGroupId === null }"
            @click="selectedGroupId = null"
          >
            <span class="chip__dot" style="background: white"></span>
            Todas las materias
          </button>
          <button
            v-for="g in uniqueGroups"
            :key="g.id"
            class="chip"
            :class="{ 'chip--active': selectedGroupId === g.id }"
            @click="selectedGroupId = g.id"
          >
            <span class="chip__dot" :style="`background: hsl(${hue(g.name)}, 65%, 55%)`"></span>
            {{ g.name }}
          </button>
        </div>

        <!-- Loading -->
        <div v-if="isFetching" class="state">
          <div class="state__spinner"></div>
          <span>Cargando anuncios...</span>
        </div>

        <!-- Error -->
        <div v-else-if="error" class="state state--error">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          No se pudieron cargar los anuncios.
        </div>

        <!-- Empty -->
        <div v-else-if="filtered.length === 0" class="empty">
          <span class="empty__emoji">📭</span>
          <p class="empty__text">
            {{ search || selectedGroupId ? 'Sin resultados para tu búsqueda.' : 'No hay anuncios por ahora.' }}
          </p>
        </div>

        <!-- Lista -->
        <div v-else class="ann-list">
          <div
            v-for="(ann, i) in filtered"
            :key="ann.id"
            class="ann-card"
            :style="`--i:${i}; --hue:${hue(ann.group?.name)}`"
          >
            <div class="ann-card__stripe"></div>

            <div class="ann-card__body">
              <!-- Top -->
              <div class="ann-card__top">
                <div class="ann-card__group">
                  <div class="ann-card__avatar">{{ groupInitial(ann.group?.name) }}</div>
                  <span class="ann-card__group-name">{{ ann.group?.name ?? 'Sin materia' }}</span>
                </div>
                <div class="ann-card__meta">
                  <span class="ann-card__date">{{ formatDate(ann.created_at) }}</span>
                  <button class="ann-card__chevron" @click="toggleExpand(ann.id)">
                    <svg
                      width="16" height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2.2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      :class="{ 'rotated': expandedId === ann.id }"
                      class="chevron-icon"
                    >
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                  </button>
                </div>
              </div>

              <!-- Título -->
              <h3 class="ann-card__title">{{ ann.title }}</h3>

              <!-- Mensaje colapsable -->
              <div class="ann-card__collapse" :class="{ 'ann-card__collapse--open': expandedId === ann.id }">
                <p class="ann-card__message">{{ ann.message }}</p>
              </div>

              <!-- Footer -->
              <div class="ann-card__footer">
                <a
                  v-if="ann.attachment_name && ann.attachment_url"
                  :href="ann.attachment_url"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="ann-card__file"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
                  </svg>
                  {{ ann.attachment_name }}
                </a>
                <span v-else></span>

                <button class="ann-card__read-btn" @click="toggleExpand(ann.id)">
                  {{ expandedId === ann.id ? 'Colapsar' : 'Leer más' }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Contador -->
        <p v-if="!isFetching && filtered.length > 0" class="count">
          {{ filtered.length }} {{ filtered.length === 1 ? 'anuncio' : 'anuncios' }}
          <span v-if="selectedGroupId || search">· filtrado</span>
        </p>

      </div>
    </div>
  </SidebarLayout>
</template>

<style scoped>
/* ─── FULL-BLEED: escapa el padding del SidebarLayout ─── */
.page {
  margin: -24px;
  width: calc(100% + 48px);
  min-height: calc(100vh);
  box-sizing: border-box;

  padding: 28px;

  background: linear-gradient(180deg, var(--color-AzulDos), var(--color-ComplementoDos));

  display: flex;
  flex-direction: column;
  gap: 24px;
  position: relative;
  overflow-x: hidden;
}

/* ─── Orbes blur decorativos ─── */
.orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  pointer-events: none;
  z-index: 0;
}

.orb--1 {
  width: 420px;
  height: 420px;
  background: rgba(139, 194, 243, 0.35);
  top: -120px;
  right: -80px;
}

.orb--2 {
  width: 320px;
  height: 320px;
  background: rgba(113, 225, 253, 0.3);
  bottom: 60px;
  left: -60px;
}

.orb--3 {
  width: 200px;
  height: 200px;
  background: rgba(75, 164, 223, 0.25);
  top: 50%;
  left: 40%;
}

.page > *:not(.orb) {
  position: relative;
  z-index: 1;
}

/* ─── Header ─── */
.page__header {
  display: flex;
  align-items: center;
  gap: 16px;
}

.page__header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.page__header-icon {
  width: 58px;
  height: 58px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(12px);
  border: 1.5px solid rgba(255, 255, 255, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
}

.page__title {
  margin: 0 0 5px;
  font-size: 2rem;
  font-weight: 900;
  color: white;
  letter-spacing: -0.5px;
}

.page__sub {
  margin: 0;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.95);
  font-weight: 500;
}

/* ─── Panel glassmorphism ─── */
.panel {
  position: relative;
  z-index: 1;
  background: rgba(255, 255, 255, 0.18);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1.5px solid rgba(255, 255, 255, 0.35);
  border-radius: 24px;
  padding: 24px;
  box-shadow: 0 8px 40px rgba(8, 70, 122, 0.2), inset 0 1px 0 rgba(255,255,255,0.4);
  display: flex;
  flex-direction: column;
  gap: 18px;
}

/* ─── Buscador ─── */
.search-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(255, 255, 255, 0.85);
  border: 1.5px solid rgba(255, 255, 255, 0.9);
  border-radius: 14px;
  padding: 0 16px;
  transition: background 0.2s, border-color 0.2s, box-shadow 0.2s;
}

.search-bar:focus-within {
  background: rgba(255, 255, 255, 0.95);
  border-color: var(--color-AzulDos);
  box-shadow: 0 0 0 3px rgba(75, 164, 223, 0.25);
  backdrop-filter: blur(10px);
}

.search-bar__icon { color: var(--color-AzulTres); flex-shrink: 0; }

.search-bar__input {
  flex: 1;
  border: none;
  background: transparent;
  padding: 14px 0;
  font-size: 1rem;
  font-family: inherit;
  color: var(--color-AzulCuatro);
  font-weight: 600;
  outline: none;
}

.search-bar__input::placeholder { color: rgba(30, 103, 163, 0.55); }

.search-bar__clear {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-AzulTres);
  display: flex;
  align-items: center;
  padding: 2px;
  transition: color 0.15s;
}

.search-bar__clear:hover { color: var(--color-AzulCuatro); }

/* ─── Chips ─── */
.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 16px;
  border-radius: 999px;
  border: 1.5px solid rgba(255, 255, 255, 0.6);
  background: rgba(255, 255, 255, 0.25);
  color: white;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.18s ease;
  white-space: nowrap;
}

.chip:hover {
  background: rgba(255, 255, 255, 0.35);
  border-color: rgba(255,255,255,0.8);
}

.chip--active {
  background: rgba(255, 255, 255, 0.9);
  color: var(--color-AzulCuatro);
  border-color: transparent;
  box-shadow: 0 3px 14px rgba(8, 70, 122, 0.25);
  backdrop-filter: blur(10px);
}

.chip--active:hover {
  background: rgba(255, 255, 255, 0.95);
  color: var(--color-AzulCuatro);
}

.chip__dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}

/* ─── Estados ─── */
.state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 48px 20px;
  color: white;
  font-size: 1rem;
  font-weight: 600;
}

.state--error { color: #fce8e6; font-weight: 700; }

.state__spinner {
  width: 22px;
  height: 22px;
  border: 2.5px solid rgba(255,255,255,0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 56px 20px;
}

.empty__emoji { font-size: 2.8rem; }

.empty__text {
  margin: 0;
  color: rgba(255,255,255,0.95);
  font-size: 1rem;
  font-weight: 600;
}

/* ─── Lista ─── */
.ann-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* ─── Card ─── */
.ann-card {
  display: flex;
  border-radius: 16px;
  overflow: hidden;
  animation: slideUp 0.3s ease both;
  animation-delay: calc(var(--i) * 55ms);
  transition: box-shadow 0.2s, transform 0.2s;
  box-shadow: 0 2px 12px rgba(8, 70, 122, 0.1);
}

.ann-card:hover {
  box-shadow: 0 6px 28px rgba(8, 70, 122, 0.2);
  transform: translateY(-2px);
}

.ann-card__stripe {
  width: 5px;
  flex-shrink: 0;
  background: hsl(var(--hue), 65%, 55%);
}

.ann-card__body {
  flex: 1;
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
  background: rgba(255, 255, 255, 0.95);
}

/* ─── Top ─── */
.ann-card__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.ann-card__group {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

/* AVATAR FIJO AZUL */
.ann-card__avatar {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  background: var(--color-AzulDos);
  color: white;
  font-size: 0.85rem;
  font-weight: 900;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.ann-card__group-name {
  font-size: 0.82rem;
  font-weight: 800;
  color: var(--color-AzulCuatro);
  background: rgba(219, 234, 254, 0.85);
  padding: 4px 12px;
  border-radius: 999px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 220px;
}

.ann-card__meta {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.ann-card__date {
  font-size: 0.8rem;
  color: #111827;
  font-weight: 700;
  white-space: nowrap;
}

.ann-card__chevron {
  background: rgba(219, 234, 254, 0.9);
  border: 1px solid rgba(30,103,163,0.15);
  width: 28px;
  height: 28px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-AzulTres);
  transition: all 0.15s;
}

.ann-card__chevron:hover {
  background: rgba(191, 219, 254, 0.95);
  backdrop-filter: blur(10px);
}

.chevron-icon { transition: transform 0.25s ease; }
.chevron-icon.rotated { transform: rotate(180deg); }

.ann-card__title {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 900;
  color: var(--color-AzulCuatro);
  line-height: 1.3;
}

.ann-card__collapse {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.35s ease;
}

.ann-card__collapse--open { max-height: 800px; }

.ann-card__message {
  margin: 0;
  font-size: 0.95rem;
  color: #334155;
  line-height: 1.7;
  padding-top: 2px;
  font-weight: 500;
}

.ann-card__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding-top: 10px;
  border-top: 1px solid rgba(30,103,163,0.1);
  flex-wrap: wrap;
}

.ann-card__file {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 0.8rem;
  font-weight: 700;
  color: #075985;
  background: rgba(224, 242, 254, 0.95);
  padding: 4px 12px;
  border-radius: 999px;
  text-decoration: none;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: all 0.15s;
}

.ann-card__file:hover {
  background: rgba(186, 230, 253, 0.95);
  backdrop-filter: blur(10px);
}

.ann-card__read-btn {
  margin-left: auto;
  background: none;
  border: none;
  font-size: 0.85rem;
  font-weight: 800;
  color: var(--color-AzulTres);
  cursor: pointer;
  padding: 0;
  font-family: inherit;
  transition: all 0.15s;
}

.ann-card__read-btn:hover {
  color: var(--color-AzulCuatro);
  text-decoration: underline;
}

/* ─── Contador ─── */
.count {
  margin: 0;
  text-align: center;
  font-size: 0.85rem;
  color: rgba(255,255,255,0.95);
  font-weight: 600;
}

/* ─── Animaciones ─── */
@keyframes slideUp {
  from { opacity: 0; transform: translateY(14px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ─── Responsive ─── */
@media (max-width: 768px) {
  .page {
    margin: -16px;
    width: calc(100% + 32px);
    padding: 20px 16px 32px;
  }

  .page__title { font-size: 1.6rem; }
  .ann-card__group-name { max-width: 130px; }
  .orb--1 { width: 260px; height: 260px; }
  .orb--2 { width: 200px; height: 200px; }
}
</style>

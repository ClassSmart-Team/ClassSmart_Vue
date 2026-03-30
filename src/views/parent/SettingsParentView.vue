<script setup lang="ts">
import { ref } from 'vue'
import SidebarLayout from '@/components/ParentSidebar.vue'

const config = ref({
  email_notification: true,
  push_notification: true,
  email_reply: true,
  theme: 'light', // 'light' | 'dark'
})

const saving = ref(false)
</script>

<template>
  <SidebarLayout>
    <div class="ContSmall center">
      <h1>Configuración</h1>
    </div>

    <div class="ContBig" style="margin-top: 40px">
      <div class="settings-content">
        <section class="settings-section">
          <h3>Notificaciones</h3>
          <p class="section-desc">
            Controla cómo y cuándo quieres recibir noticias sobre tus hijos.
          </p>

          <div class="setting-item">
            <div class="setting-info">
              <label>Notificaciones por Correo</label>
              <span>Recibe resúmenes semanales y avisos importantes.</span>
            </div>
            <label class="switch">
              <input type="checkbox" v-model="config.email_notification" />
              <span class="slider"></span>
            </label>
          </div>

          <div class="setting-item">
            <div class="setting-info">
              <label>Notificaciones Push</label>
              <span>Alertas instantáneas en tu navegador o móvil.</span>
            </div>
            <label class="switch">
              <input type="checkbox" v-model="config.push_notification" />
              <span class="slider"></span>
            </label>
          </div>

          <div class="setting-item">
            <div class="setting-info">
              <label>Respuestas por Email</label>
              <span>Permitir responder a los avisos directamente desde tu correo.</span>
            </div>
            <label class="switch">
              <input type="checkbox" v-model="config.email_reply" />
              <span class="slider"></span>
            </label>
          </div>
        </section>

        <hr class="divider" />

        <section class="settings-section">
          <h3>Personalización</h3>
          <p class="section-desc">Ajusta la apariencia visual de la plataforma.</p>

          <div class="setting-item">
            <div class="setting-info">
              <label>Tema de la Interfaz</label>
              <span>Elige entre un modo claro o uno oscuro para descansar la vista.</span>
            </div>
            <select v-model="config.theme" class="theme-select">
              <option value="light">Modo Claro</option>
              <option value="dark">Modo Oscuro</option>
            </select>
          </div>
        </section>

        <div class="settings-actions">
          <button class="btn-save" :disabled="saving">
            {{ saving ? 'Guardando...' : 'Guardar Cambios' }}
          </button>
        </div>
      </div>
    </div>
  </SidebarLayout>
</template>

<style scoped>
.ContSmall {
  background: var(--color-Azul);
  width: 95%;
  max-width: 800px;
  height: 60px;
  border-radius: 20px;
  margin: 0 auto;
  color: white;
}
.ContBig {
  background: var(--color-Blanco);
  width: 95%;
  max-width: 800px;
  min-height: min-content;
  border-radius: 20px;
  margin: 40px auto;
  padding: 40px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  box-sizing: border-box;
}

.settings-section {
  margin-bottom: 30px;
}

.settings-section h3 {
  color: var(--color-Azul);
  font-size: 1.2rem;
  margin-bottom: 5px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.section-desc {
  color: #888;
  font-size: 0.85rem;
  margin-bottom: 20px;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 0;
  border-bottom: 1px solid #f5f5f5;
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-right: 20px;
}

.setting-info label {
  font-weight: bold;
  color: var(--color-Texto);
  font-size: 0.95rem;
}

.setting-info span {
  font-size: 0.8rem;
  color: #777;
  line-height: 1.3;
}

.switch {
  position: relative;
  display: inline-block;
  width: 46px;
  height: 24px;
  flex-shrink: 0;
}
.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}
.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: 0.4s;
  border-radius: 34px;
}
.slider:before {
  position: absolute;
  content: '';
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.4s;
  border-radius: 50%;
}
input:checked + .slider {
  background-color: var(--color-AzulTres);
}
input:checked + .slider:before {
  transform: translateX(22px);
}

.theme-select {
  padding: 8px 12px;
  border-radius: 10px;
  border: 1px solid #ddd;
  outline: none;
  font-weight: bold;
}

.settings-actions {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.btn-save {
  background: var(--color-Azul);
  color: white;
  border: none;
  padding: 12px 30px;
  border-radius: 12px;
  font-weight: bold;
  cursor: pointer;
  transition: opacity 0.2s;
}

.btn-save:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.divider {
  border: 0;
  border-top: 1px solid #eee;
  margin: 20px 0;
}

@media (max-width: 600px) {
  .ContBig {
    padding: 20px;
  }
  .setting-item {
    flex-direction: row;
    align-items: center;
    .setting-info span {
      font-size: 0.75rem;
    }
  }
}
</style>

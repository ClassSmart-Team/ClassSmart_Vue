<script setup lang="ts">
import SidebarLayout from '@/components/TeacherSidebar.vue'
import { useAuthStore } from '@/stores/authStore.ts'
import { computed } from 'vue'

const ua = useAuthStore()

const getRoleName = computed(() => {
  const roles: Record<number, string> = {
    1: 'Administrador del Sistema',
    2: 'Docente Titular',
    3: 'Estudiante',
    4: 'Padre de Familia'
  }
  const roleId = ua.credentials?.user.role?.id
  return roleId ? roles[roleId] : 'Cargando rol...'
})

const userInitials = computed(() => {
  const name = ua.credentials?.user.name?.charAt(0) || ''
  const lastname = ua.credentials?.user.lastname?.charAt(0) || ''
  return (name + lastname).toUpperCase()
})

const memberSince = computed(() => {
  const date = ua.credentials?.user.role?.created_at 
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
})
</script>

<template>
  <div class="bg-page flex-center">
    <SidebarLayout>
      <div class="profile-wrapper">
        <div class="profile-container">
          
          <div class="profile-aside">
            <div class="avatar-giant">
              {{ userInitials }}
            </div>
            <div class="aside-info">
              <h2>{{ ua.credentials?.user.name }}</h2>
              <p class="role-text">{{ getRoleName }}</p>
              <div class="status-indicator">
                <span class="dot"></span> 
                {{ ua.credentials?.user.active ? 'Cuenta Activa' : 'Inactiva' }}
              </div>
            </div>
          </div>

          <div class="profile-main-content">
            <div class="content-header">
              <h3>Información del Expediente</h3>
              <div class="header-line"></div>
            </div>

            <div class="details-grid">
              <div class="detail-group">
                <label>Nombre Institucional</label>
                <div class="detail-value">
                  {{ ua.credentials?.user.name }} {{ ua.credentials?.user.lastname }}
                </div>
              </div>

              <div class="detail-group">
                <label>Correo Electrónico</label>
                <div class="detail-value">{{ ua.credentials?.user.email }}</div>
              </div>

              <div class="detail-group">
                <label>Teléfono / Celular</label>
                <div class="detail-value">
                  {{ ua.credentials?.user.cellphone || 'No registrado' }}
                </div>
              </div>


              <div class="detail-group">
                <label>Departamento</label>
                <div class="detail-value">
                  {{ ua.credentials?.user.role?.description || 'Docencia' }}
                </div>
              </div>

              <div class="detail-group">
                <label>Miembro desde</label>
                <div class="detail-value">
                  {{ memberSince }}
                </div>

              </div>

            </div>
            
            <div class="footer-decoration">
              <p>ClassSmart</p>
            </div>
          </div>

        </div>
      </div>
    </SidebarLayout>
  </div>
</template>

<style scoped>
/* Clase para centrado total */
.flex-center {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.profile-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px 20px;
  width: 100%;
}

.profile-container {
  display: flex;
  background: var(--color-Blanco);
  width: 100%;
  max-width: 1100px;
  min-height: 580px;
  border-radius: 30px;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  animation: fadeIn 0.6s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.profile-aside {
  width: 340px;
  background: var(--color-OscuroAzulado);
  padding: 60px 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  text-align: center;
}

.avatar-giant {
  width: 150px;
  height: 150px;
  background: linear-gradient(135deg, var(--color-Azul), var(--color-ComplementoDos));
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 55px;
  font-weight: 900;
  color: white;
  margin-bottom: 30px;
  border: 8px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 15px 30px rgba(0,0,0,0.2);
}

.aside-info h2 {
  margin: 0;
  font-size: 1.8rem;
  font-weight: 800;
  letter-spacing: -0.5px;
}

.role-text {
  color: var(--color-Azul);
  font-size: 1rem;
  margin-top: 8px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.status-indicator {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  margin-top: 25px;
  font-size: 0.85rem;
  background: rgba(255, 255, 255, 0.1);
  padding: 8px 20px;
  border-radius: 30px;
  font-weight: 500;
}

.dot {
  width: 10px;
  height: 10px;
  background: #4ade80;
  border-radius: 50%;
  box-shadow: 0 0 12px #4ade80;
}

.profile-main-content {
  flex: 1;
  padding: 60px;
  display: flex;
  flex-direction: column;
}

.content-header h3 {
  margin: 0;
  color: var(--color-TitulosMenu);
  font-size: 1.7rem;
  font-weight: 800;
}

.header-line {
  width: 50px;
  height: 5px;
  background: var(--color-AzulDos);
  margin-top: 12px;
  border-radius: 10px;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 35px;
  margin-top: 45px;
}

.detail-group label {
  display: block;
  font-size: 0.8rem;
  color: #94a3b8;
  font-weight: 700;
  text-transform: uppercase;
  margin-bottom: 10px;
  letter-spacing: 0.5px;
}

.detail-value {
  font-size: 1.1rem;
  color: var(--color-Texto);
  font-weight: 600;
  padding: 16px 20px;
  background: #f8fafc;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
}

.detail-value:hover {
  background: var(--color-Contenedor);
  border-color: var(--color-Azul);
}

.footer-decoration {
  margin-top: auto;
  text-align: center;
  padding-top: 40px;
}

.footer-decoration p {
  font-size: 0.8rem;
  color: #cbd5e1;
  font-weight: 500;
  letter-spacing: 1px;
}

@media (max-width: 1024px) {
  .details-grid { grid-template-columns: 1fr; gap: 20px; }
  .profile-container { max-width: 700px; flex-direction: column; }
  .profile-aside { width: 100%; padding: 40px; }
}
</style>
<script setup lang="ts">
import { ref } from 'vue'
import SidebarLayout from '@/components/ParentSidebar.vue'

// Basado en los campos de tu modelo User
const user = ref({
  name: 'Juan',
  lastname: 'Pérez García',
  email: 'juan.perez@email.com',
  cellphone: '8711234567',
  password: 'pollo',
  role_id: 4, // Padre
  active: true,
  // Relación children()
  children: [
    { id: 1, name: 'Mateo', lastname: 'Pérez', role: 'Estudiante' },
    { id: 2, name: 'Sofía', lastname: 'Pérez', role: 'Estudiante' },
  ],
})

const getRoleName = (id: number) => {
  const roles: Record<number, string> = {
    1: 'Admin',
    2: 'Maestro',
    3: 'Alumno',
    4: 'Padre de Familia',
  }
  return roles[id] || 'Usuario'
}

const showPassword = ref(false)

const togglePassword = () => {
  showPassword.value = !showPassword.value
}
</script>

<template>
  <SidebarLayout>
    <div class="ContSmall center profile-header">
      <div class="avatar-circle">{{ user.name.charAt(0) }}{{ user.lastname.charAt(0) }}</div>
      <h1>Mi Perfil</h1>
    </div>

    <div class="ContBig" style="margin-top: 40px">
      <div class="profile-grid">
        <section class="info-section">
          <h3>Información Personal</h3>
          <div class="details-list">
            <div class="detail-item">
              <label>Nombre Completo</label>
              <p>{{ user.name }} {{ user.lastname }}</p>
            </div>
            <div class="detail-item">
              <label>Correo Electrónico</label>
              <p>{{ user.email }}</p>
            </div>
            <div class="detail-item">
              <label>Teléfono Celular</label>
              <p>{{ user.cellphone || 'No registrado' }}</p>
            </div>
            <div class="detail-item">
              <label>Contraseña Actual</label>
              <div class="password-viewer">
                <input
                  :type="showPassword ? 'text' : 'password'"
                  :value="user.password"
                  readonly
                  class="password-input"
                />
                <button type="button" @click="togglePassword" class="btn-show">
                  {{ showPassword ? '👁️' : '🙈' }}
                </button>
              </div>
            </div>
            <div class="detail-item">
              <label>Rol de Usuario</label>
              <span class="role-badge">{{ getRoleName(user.role_id) }}</span>
            </div>
            <div class="detail-item">
              <label>Estado de Cuenta</label>
              <span :class="['status-pill', user.active ? 'active' : 'inactive']">
                {{ user.active ? 'Cuenta Activa' : 'Inactiva' }}
              </span>
            </div>
          </div>

          <button class="btn-edit">Editar Datos</button>
        </section>

        <section class="children-section">
          <h3>Mis Hijos Vinculados</h3>
          <p class="section-help">Cuentas de estudiantes asociadas a tu tutela.</p>

          <div class="children-list">
            <div v-for="child in user.children" :key="child.id" class="child-card">
              <div class="child-avatar">🎓</div>
              <div class="child-info">
                <h4>{{ child.name }} {{ child.lastname }}</h4>
                <span>{{ child.role }}</span>
              </div>
            </div>
          </div>

          <div class="info-box">
            <p>Si falta algún hijo en esta lista, por favor contacte a control escolar.</p>
          </div>
        </section>
      </div>
    </div>
  </SidebarLayout>
</template>

<style scoped>
.ContSmall {
  background: var(--color-Azul);
  width: 95%;
  max-width: 1000px;
  height: 80px;
  border-radius: 20px;
  margin: 0 auto;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
}

.avatar-circle {
  width: 50px;
  height: 50px;
  background: var(--color-AzulTres);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  border: 2px solid white;
}

.ContBig {
  background: var(--color-Blanco);
  width: 95%;
  max-width: 1000px;
  border-radius: 20px;
  margin: 40px auto;
  padding: 50px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  max-height: 60vh;
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.ContBig::-webkit-scrollbar {
  width: 8px;
  display: none;
}
.ContBig::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 10px;
}

.profile-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: start;
  gap: 20px;
}

h3 {
  color: var(--color-Azul);
  margin-bottom: 20px;
  font-size: 1.2rem;
  border-bottom: 2px solid #f5f5f5;
  padding-bottom: 10px;
}

.details-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 30px;
}
.detail-item label {
  display: block;
  font-size: 0.75rem;
  color: #888;
  font-weight: bold;
  text-transform: uppercase;
  margin-bottom: 4px;
}
.detail-item p {
  margin: 0;
  font-size: 1rem;
  color: var(--color-Texto);
  font-weight: 500;
}

.role-badge {
  background: #f0f4ff;
  color: var(--color-AzulTres);
  padding: 4px 12px;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: bold;
}

.status-pill {
  font-size: 0.8rem;
  font-weight: bold;
}
.status-pill.active {
  color: #27ae60;
}
.status-pill.inactive {
  color: #e74c3c;
}

.children-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 15px;
}
.child-card {
  display: flex;
  align-items: center;
  gap: 15px;
  background: #f9f9f9;
  padding: 15px;
  border-radius: 15px;
  border: 1px solid #eee;
}

.child-info h4 {
  margin: 0;
  font-size: 0.95rem;
  color: var(--color-Texto);
}
.child-info span {
  font-size: 0.8rem;
  color: #999;
}

.btn-view-child {
  margin-left: auto;
  background: white;
  border: 1px solid var(--color-AzulTres);
  color: var(--color-AzulTres);
  padding: 5px 10px;
  border-radius: 8px;
  font-size: 0.75rem;
  cursor: pointer;
  font-weight: bold;
}

.info-box {
  margin-top: 25px;
  background: #fffde7;
  padding: 15px;
  border-radius: 10px;
  border-left: 4px solid #fbc02d;
  font-size: 0.8rem;
  color: #7f8c8d;
}

.btn-edit {
  background: var(--color-Azul);
  color: white;
  border: none;
  padding: 10px 25px;
  border-radius: 10px;
  font-weight: bold;
  cursor: pointer;
}

@media (max-width: 850px) {
  .profile-grid {
    grid-template-columns: 1fr;
    gap: 40px;
  }
  .ContBig {
    padding: 25px;
  }
}
</style>

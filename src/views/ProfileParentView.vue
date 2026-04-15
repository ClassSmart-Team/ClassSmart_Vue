<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import SidebarLayout from '@/components/ParentSidebar.vue'
import { useapi } from '@/assets/composables/useApi'
import { useAuthStore } from '@/stores/authStore.ts'

const ua = useAuthStore()
const isModalOpen = ref(false)

const { data, error, isFetching, execute: refetchProfile } = useapi('/profile').json()
const user = computed(() => data.value?.data)

const getRoleName = computed(() => {
  const roles: Record<number, string> = {
    1: 'Administrador del Sistema',
    2: 'Docente Titular',
    3: 'Estudiante',
    4: 'Padre de Familia',
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
    day: 'numeric',
  })
})

const form = reactive({
  name: '',
  lastname: '',
  email: '',
  cellphone: '',
  password: '',
  role_id: 4,
})

watch(
  user,
  (newUser) => {
    if (newUser) {
      form.name = newUser.name
      form.lastname = newUser.lastname
      form.email = newUser.email
      form.cellphone = newUser.cellphone || ''
      form.role_id = newUser.role.id
    }
  },
  { immediate: true },
)

const openEditModal = () => {
  isModalOpen.value = true
}
const closeEditModal = () => {
  isModalOpen.value = false
  form.password = ''
}

async function updateProfile() {
  const payload: any = {
    name: form.name,
    lastname: form.lastname,
    email: form.email,
    cellphone: form.cellphone,
  }

  if (form.password && form.password.trim().length >= 8) {
    payload.password = form.password
  } else if (form.password && form.password.trim().length > 0) {
    alert('La contraseña debe tener al menos 8 caracteres')
    return
  }

  const { error: updateError } = await useapi('/profile').put(payload).json()

  if (!updateError.value) {
    alert('Perfil actualizado con éxito')
    closeEditModal()
    refetchProfile()

    form.password = ''
  } else {
    alert('Error al actualizar: Revisa los datos o el correo duplicado')
  }
}
</script>

<template>
  <div class="bg-page">
    <SidebarLayout>
      <div v-if="isFetching" class="loading-state">
        <div class="spinner"></div>
        <p>Cargando datos del perfil...</p>
      </div>

      <div v-else-if="error" class="error-banner">
        <span>
          <img src="@/components/advertencia-triangulo.png" alt="advertencia" />
        </span>
        <p>No se pudo cargar la información.</p>
      </div>

      <div v-else class="profile-wrapper">
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
                  {{ ua.credentials?.user.role?.description || 'Padre de familia' }}
                </div>
              </div>

              <div class="detail-group">
                <label>Miembro desde</label>
                <div class="detail-value">
                  {{ memberSince }}
                </div>
              </div>

              <div class="detail-group">
                <label>Contraseña</label>
                <div class="detail-value">********</div>
              </div>

              <button @click="openEditModal" class="btn-edit">Editar Datos</button>

              <div class="content-header2">
                <h3>Hijos Vinculados</h3>
                <div class="header-line"></div>
              </div>

              <p class="info-section">Cuentas de estudiantes asociadas a tu tutela.</p>

              <div class="children-list">
                <div v-for="child in user?.children" :key="child.id" class="child-card">
                  <div class="child-avatar">🎓</div>
                  <div class="child-info">
                    <h4>{{ child.name }} {{ child.lastname }}</h4>
                  </div>
                </div>

                <div v-if="!user?.children?.length" class="no-children-empty">
                  <p>No hay hijos vinculados a esta cuenta.</p>
                </div>
              </div>

              <div class="info-box">
                <p>Si falta algún hijo en esta lista, por favor contacte a control escolar.</p>
              </div>
            </div>

            <div class="footer-decoration">
              <p>ClassSmart</p>
            </div>

            <div v-if="isModalOpen" class="modal-overlay">
              <div class="modal-content">
                <button class="btn-close" @click="closeEditModal">&times;</button>
                <h3>Editar Mi Perfil</h3>

                <form @submit.prevent="updateProfile">
                  <div class="form-group">
                    <label>Nombre</label>
                    <input v-model="form.name" type="text" disabled class="input-disabled" />
                  </div>

                  <div class="form-group">
                    <label>Apellido</label>
                    <input v-model="form.lastname" type="text" disabled class="input-disabled" />
                  </div>

                  <div class="form-group">
                    <label>Correo</label>
                    <input v-model="form.email" type="text" required />
                  </div>

                  <div class="form-group">
                    <label>Teléfono Celular</label>
                    <input v-model="form.cellphone" type="text" />
                  </div>

                  <div class="form-group">
                    <label>Contraseña</label>
                    <input
                      v-model="form.password"
                      type="password"
                      placeholder="Dejar en blanco para no cambiar"
                    />
                  </div>

                  <div class="modal-actions">
                    <button type="button" @click="closeEditModal" class="btn-cancel">
                      Cancelar
                    </button>
                    <button type="submit" class="btn-save">Guardar Cambios</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SidebarLayout>
  </div>
</template>

<style scoped>
.bg-page {
  min-height: 100vh;
  inset: 0;
  overflow-x: hidden;
  overflow-y: auto;
  z-index: -1;
}

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
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
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
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.2);
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


.content-header2 h3 {
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
  .details-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  .profile-container {
    max-width: 700px;
    flex-direction: column;
  }
  .profile-aside {
    width: 100%;
    padding: 40px;
  }
}

.no-children-empty {
  text-align: center;
  padding: 30px;
  background: var(--color-Blanco);
  border-radius: 15px;
  border: 2px dashed var(--color-Bordes);
  color: #888;
}

h3 {
  color: var(--color-Azul);
  margin-bottom: 20px;
  font-size: 1.2rem;
  border-bottom: 2px solid var(--color-Bordes);
  padding-bottom: 10px;
}

.children-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.child-card {
  display: flex;
  align-items: center;
  gap: 15px;
  background: var(--color-Bordes);
  padding: 15px;
  border-radius: 15px;
  border: 1px solid #eee;
}

.child-info h4 {
  margin: 0;
  font-size: 0.95rem;
  color: var(--color-Texto);
}

.info-box {
  margin-top: 25px;
  background: var(--color-Aviso);
  padding: 10px;
  border-radius: 10px;
  font-size: 0.8rem;
  color: #7f8c8d;
}

.info-section {
  display: block;
  font-size: 0.8rem;
  color: #94a3b8;
  font-weight: 700;
  text-transform: uppercase;
  margin-bottom: 5px;
  letter-spacing: 0.5px;
}

.btn-edit {
  background: var(--color-Azul);
  color: white;
  border: none;
  padding: 10px 25px;
  border-radius: 10px;
  font-weight: bold;
  cursor: pointer;
  align-self: flex-end;
  transition: background 0.3s ease;
  margin-bottom: 30px;
}

.btn-edit:hover {
  background: var(--color-AzulTres);
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

/* Modal Estilos */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  position: relative; /* Importante para el botón absoluto */
  background: var(--color-Blanco);
  padding: 30px;
  border-radius: 20px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  font-family: 'Roboto', sans-serif;
}

.modal-content h3 {
  margin-top: 0;
  padding-right: 30px;
}

.btn-close {
  position: absolute;
  top: 15px;
  right: 20px;
  background: none;
  border: none;
  font-size: 1.8rem;
  color: #ccc;
  cursor: pointer;
  line-height: 1;
  transition: color 0.2s ease;
  padding: 5px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-size: 0.85rem;
  color: var(--color-Texto);
  margin-bottom: 8px;
  font-weight: bold;
  font-family: 'Roboto', sans-serif;
}
.form-group input {
  width: 95%;
  padding: 12px;
  border: 1px solid var(--color-Bordes);
  border-radius: 10px;
  font-size: 1rem;
  box-sizing: border-box;
  font-family: 'Roboto', sans-serif;
  color: var(--color-Texto);
  background: var(--color-Blanco);
}
.input-disabled {
  background: var(--color-Blanco);
}
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  margin-top: 30px;
}
.btn-cancel {
  background: var(--color-Blanco);
  border: 1px solid #ddd;
  color: var(--color-Texto);
  padding: 10px 20px;
  border-radius: 10px;
  cursor: pointer;
  font-weight: bold;
}
.btn-save {
  background: var(--color-AzulTres);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 10px;
  cursor: pointer;
  font-weight: bold;
}
</style>

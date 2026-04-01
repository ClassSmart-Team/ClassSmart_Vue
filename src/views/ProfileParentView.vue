<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import SidebarLayout from '@/components/ParentSidebar.vue'
import { useapi } from '@/assets/composables/useApi'

export interface Role {
  id: number
  description: string
}

export interface Child {
  id: number
  name: string
  lastname: string
  role_id: number
}
export interface User {
  id: number
  name: string
  lastname: string
  email: string
  cellphone: string
  password: string
  role: Role
  active: boolean
  children: Child[]
}

const isModalOpen = ref(false)

const { data, error, isFetching, execute: refetchProfile } = useapi('/profile').json()

const user = computed(() => data.value?.data)

const getRoleName = (id: number) => {
  const roles: Record<number, string> = {
    1: 'Admin',
    2: 'Maestro',
    3: 'Alumno',
    4: 'Padre de Familia',
  }
  return roles[id] || 'Usuario'
}

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
  const payload = { ...form }
  if (!payload.password) delete payload.password

  const { error: updateError } = await useapi('/profile').put(payload).json()

  if (!updateError.value) {
    alert('Perfil actualizado con éxito')
    closeEditModal()
    refetchProfile() // Recarga los datos automáticamente
  } else {
    alert('Error al actualizar: Revisa los datos o el correo duplicado')
  }
}
</script>

<template>
  <SidebarLayout>
    <div v-if="isFetching" class="state-container">
      <div class="loader-dots"></div>
      <p class="state-msg">Cargando datos del perfil...</p>
    </div>

    <div v-else-if="error" class="state-container error">
      <div class="icon-circle">⚠️</div>
      <p class="state-msg">Hubo un error al cargar tu información.</p>
      <span class="state-subtitle">Intenta recargar la página más tarde.</span>
    </div>

    <template v-else-if="user">
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
                <span class="helper-text">Deja en blanco si no cambias la contraseña</span>
                <div class="password-viewer">
                  <p>********</p>
                </div>
              </div>
              <div class="detail-item">
                <label>Rol de Usuario</label>
                <span class="role-badge">{{ getRoleName(user.role.id) }}</span>
              </div>
            </div>

            <button @click="openEditModal" class="btn-edit">Editar Datos</button>
          </section>

          <section class="children-section">
            <h3>Mis Hijos Vinculados</h3>
            <p class="section-help">Cuentas de estudiantes asociadas a tu tutela.</p>

            <div class="children-list">
              <div v-for="child in user.children || []" :key="child.id" class="child-card">
                <div class="child-avatar">🎓</div>
                <div class="child-info">
                  <h4>{{ child.name }} {{ child.lastname }}</h4>
                </div>
              </div>

              <div v-if="!user.children?.length" class="no-children-empty">
                <div class="icon-mini">👨‍👩‍👧‍👦</div>
                <p>No hay hijos vinculados a esta cuenta.</p>
              </div>
            </div>

            <div class="info-box">
              <p>Si falta algún hijo en esta lista, por favor contacte a control escolar.</p>
            </div>
          </section>
        </div>
      </div>

      <div v-if="isModalOpen" class="modal-overlay">
        <div class="modal-content">
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
              <button type="button" @click="closeEditModal" class="btn-cancel">Cancelar</button>
              <button type="submit" class="btn-save">Guardar Cambios</button>
            </div>
          </form>
        </div>
      </div>
    </template>
  </SidebarLayout>
</template>

<style scoped>
.state-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  text-align: center;
}

.state-msg {
  font-size: 1.1rem;
  font-weight: 600;
  color: #555;
  margin-top: 15px;
}

.state-subtitle {
  font-size: 0.9rem;
  color: #999;
  margin-top: 5px;
}

.icon-circle {
  width: 70px;
  height: 70px;
  background: #f0f2f5;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  margin-bottom: 10px;
}

.error .icon-circle {
  background: #fff1f0;
}

.loader-dots {
  width: 50px;
  aspect-ratio: 2;
  --_g: no-repeat radial-gradient(circle closest-side, #000 90%, #0000);
  background:
    var(--_g) 0% 50%,
    var(--_g) 50% 50%,
    var(--_g) 100% 50%;
  background-size: calc(100% / 3) 50%;
  animation: l3 1s infinite linear;
  opacity: 0.3;
}
@keyframes l3 {
  20% {
    background-position:
      0% 0%,
      50% 50%,
      100% 50%;
  }
  40% {
    background-position:
      0% 100%,
      50% 0%,
      100% 50%;
  }
  60% {
    background-position:
      0% 50%,
      50% 100%,
      100% 0%;
  }
  80% {
    background-position:
      0% 50%,
      50% 50%,
      100% 100%;
  }
}

.no-children-empty {
  text-align: center;
  padding: 30px;
  background: #fafafa;
  border-radius: 15px;
  border: 2px dashed #eee;
  color: #888;
}

.icon-mini {
  font-size: 1.5rem;
  margin-bottom: 10px;
}

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
  width: 90%;
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
  display: none;
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
  background: white;
  padding: 30px;
  border-radius: 20px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.form-group {
  margin-bottom: 20px;
}
.form-group label {
  display: block;
  font-size: 0.85rem;
  color: #666;
  margin-bottom: 8px;
  font-weight: bold;
}
.form-group input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 10px;
  font-size: 1rem;
  box-sizing: border-box;
}
.input-disabled {
  background: #f5f5f5;
}
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  margin-top: 30px;
}
.btn-cancel {
  background: #f5f5f5;
  border: none;
  color: #666;
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
.helper-text {
  display: block;
  font-size: 0.68rem;
  color: #a0a0a0;
  margin-top: -2px;
  margin-bottom: 5px;
}
</style>

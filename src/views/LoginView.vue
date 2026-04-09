<script setup lang="ts">
import { ref } from 'vue'
import { type Login } from '@/types/types.ts'
import { useFetch } from '@vueuse/core'
import { useAuthStore } from '@/stores/authStore.ts'
import { useRouter } from 'vue-router'
import Logo from '@/components/Logo.svg'

const router = useRouter()
const uas = useAuthStore()

const credentials = ref<Login>({
  email: '',
  password: '',
})

// Variable para manejar el error
const errorMessage = ref('')

function login() {
  errorMessage.value = '' // Limpiar errores previos

  const { data, onFetchError, onFetchResponse } = useFetch('https://api.sutando-user.me/api/login', {
    method: 'post',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  })
    .post(credentials.value)
    .json()

  onFetchResponse(() => {
    uas.setCredentials(data.value.data)
    const role = uas.credentials?.user.role.id
    if (role === 1) router.push('/admin/home')
    else if (role === 2) router.push('/teacher/home')
    else if (role === 3) router.push('/student/home')
    else if (role === 4) router.push('/parent/home')
    else router.push('/login')
  })

  onFetchError((error) => {
    console.error('Error al iniciar sesión:', error)
    errorMessage.value = 'Credenciales incorrectas o problema de conexión.'
  })
}
</script>

<template>
  <div class="login-page">
    <div class="visual-section">
      <div class="welcome-text">
        <h2 class="branding">ClassSmart<span>App</span></h2>
        <p>Tu portal educativo.</p>
      </div>
    </div>

    <div class="form-section">
      <div class="login-box">
        
        <h1>Iniciar sesión</h1>
        <p class="subtitle">Ingresa tus credenciales</p>

        <form class="login-form" @submit.prevent="login">
          
          <div class="input-container">
            <input
              v-model="credentials.email"
              type="email"
              placeholder=" "
              class="styled-input"
              id="email-field"
              required
            />
            <label for="email-field" class="styled-label">Correo electrónico</label>
            <div class="input-highlight"></div>
          </div>

          <div class="input-container">
            <input
              v-model="credentials.password"
              type="password"
              placeholder=" "
              class="styled-input"
              id="pass-field"
              required
            />
            <label for="pass-field" class="styled-label">Contraseña</label>
            <div class="input-highlight"></div>
          </div>

          <div v-if="errorMessage" class="error-alert">
            {{ errorMessage }}
          </div>

          <div class="footer-links">
            ¿No tienes cuenta? 
            <a href="/register">Regístrate aquí</a>
          </div>

          <button type="submit" class="btn-login-executive">
            Acceder
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Los estilos anteriores se mantienen intactos. 
   Solo añado el estilo de la alerta de error: */

.error-alert {
  background-color: #fee2e2;
  color: #dc2626;
  padding: 12px;
  border-radius: 8px;
  font-size: 0.85rem;
  margin-bottom: 15px;
  border-left: 4px solid #dc2626;
  animation: shake 0.4s ease-in-out;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

/* El resto del CSS sigue exactamente igual... */
.login-page {
  position: fixed;
  inset: 0;
  display: flex;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  font-family: inherit;
}

/* Reemplaza tu .visual-section con esto */
.visual-section {
  flex: 1;
  position: relative;
  background-color: var(--color-AzulTres); /* Color de fondo base */
  background-image: 
    radial-gradient(at 0% 0%, var(--color-Complemento) 0px, transparent 50%),
    radial-gradient(at 100% 0%, var(--color-Azul) 0px, transparent 50%),
    radial-gradient(at 100% 100%, var(--color-ComplementoDos) 0px, transparent 50%),
    radial-gradient(at 0% 100%, var(--color-AzulTres) 0px, transparent 50%);
  animation: mesh-glow 10s ease-in-out infinite alternate;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

@keyframes mesh-glow {
  0% { background-size: 100% 100%; }
  50% { background-size: 150% 150%; }
  100% { background-size: 120% 120%; }
}

.welcome-text {
  color: white;
  text-align: center;
  text-shadow: 0 2px 10px rgba(0,0,0,0.2);
}

.branding {
  font-size: 3.5rem;
  font-weight: 800;
  margin-bottom: 10px;
  color: white;
}

.branding span {
  font-weight: 300;
  color: var(--color-Contenedor);
}

.form-section {
  width: 420px;
  background: var(--color-Blanco);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  box-shadow: -10px 0 30px rgba(0, 0, 0, 0.05);
  z-index: 10;
}

.login-box {
  width: 100%;
  max-width: 320px;
}

h1 {
  color: var(--color-TitulosMenu);
  font-size: 2.2rem;
  margin-bottom: 8px;
  font-weight: 700;
}

.subtitle {
  color: #64748b;
  margin-bottom: 40px;
  font-size: 1rem;
}

.login-form {
  display: flex;
  flex-direction: column;
}

.input-container {
  position: relative;
  margin-bottom: 25px;
}

.styled-input {
  width: 100%;
  padding: 16px;
  padding-left: 10px;
  border: none;
  border-bottom: 2px solid #e2e8f0;
  background: transparent;
  color: var(--color-Texto);
  font-size: 1rem;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.styled-label {
  position: absolute;
  left: 10px;
  top: 16px;
  color: #94a3b8;
  font-size: 1rem;
  pointer-events: none;
  transition: all 0.3s ease;
  font-weight: 500;
}

.styled-input:focus ~ .styled-label,
.styled-input:not(:placeholder-shown) ~ .styled-label {
  top: -12px;
  left: 0;
  font-size: 0.8rem;
  color: var(--color-AzulTres);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.input-highlight {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 2px;
  width: 0;
  background: var(--color-AzulDos);
  transition: all 0.4s ease;
}

.styled-input:focus ~ .input-highlight {
  width: 100%;
}

.styled-input:focus {
  outline: none;
  background: #f8fafc;
  border-bottom-color: transparent;
  border-radius: 8px 8px 0 0;
}

.footer-links {
  margin-top: 5px;
  font-size: 0.9rem;
  color: #64748b;
}

.footer-links a {
  color: var(--color-AzulCuatro);
  text-decoration: none;
  font-weight: 600;
  transition: color 0.2s;
}

.footer-links a:hover {
  color: var(--color-AzulDos);
}

.btn-login-executive {
  margin-top: 40px;
  padding: 16px;
  border: none;
  border-radius: 12px;
  background: var(--color-AzulTres);
  color: white;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.btn-login-executive:hover {
  background: var(--color-AzulCuatro);
  transform: translateY(-3px);
  box-shadow: 0 10px 20px -5px rgba(8, 70, 122, 0.3);
}

@media (max-width: 900px) {
  .visual-section {
    display: none;
  }
  .form-section {
    width: 100%;
    background: var(--color-Contenedor);
  }
  .login-box {
    background: white;
    padding: 30px;
    border-radius: 15px;
    box-shadow: 0 10px 25px rgba(0,0,0,0.1);
  }
}
</style>
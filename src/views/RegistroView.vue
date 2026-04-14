<script setup lang="ts">
import { ref } from 'vue'
import { type Register } from '@/types/types.ts'
import { useFetch } from '@vueuse/core'
import { useRouter } from 'vue-router'

const router = useRouter()
const errorMessage = ref('')

const form = ref<Register>({
  name: '',
  lastname: '',
  email: '',
  password: '',
  cellphone: '',
})

const passwordConfirmation = ref('')

function registrar() {
  errorMessage.value = ''

  if (form.value.password !== passwordConfirmation.value) {
    errorMessage.value = 'Las contraseñas no coinciden.'
    return
  }

  const { data, onFetchError, onFetchResponse } = useFetch(
    'https://api.sutando-user.me/api/register',
    {
      method: 'post',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    }
  )
    .post(form.value)
    .json()

  onFetchResponse(() => {
    alert(data.value?.message || '¡Registro exitoso!')
    router.push('/login')
  })

  onFetchError(() => {
    errorMessage.value = 'Hubo un error al crear la cuenta. Revisa los datos.'
  })
}
</script>

<template>
  <div class="register-page">
    <div class="form-section-dark">
      <div class="register-box">

        <h1 class="title-dark">Crear Cuenta</h1>
        <p class="subtitle-dark">Únete a nuestra comunidad educativa</p>

        <form class="register-form" @submit.prevent="registrar">

          <div class="form-grid">
            <div class="input-container">
              <input v-model="form.name" type="text" placeholder=" " class="styled-input-dark" id="name" required />
              <label for="name" class="styled-label-dark">Nombre</label>
              <div class="input-highlight-dark"></div>
            </div>

            <div class="input-container">
              <input v-model="form.lastname" type="text" placeholder=" " class="styled-input-dark" id="lastname" required />
              <label for="lastname" class="styled-label-dark">Apellido</label>
              <div class="input-highlight-dark"></div>
            </div>
          </div>

          <div class="input-container">
            <input v-model="form.email" type="email" placeholder=" " class="styled-input-dark" id="email" required />
            <label for="email" class="styled-label-dark">Correo electrónico</label>
            <div class="input-highlight-dark"></div>
          </div>

          <div class="input-container">
            <input v-model="form.cellphone" type="text" placeholder=" " class="styled-input-dark" id="phone" />
            <label for="phone" class="styled-label-dark">Teléfono (opcional)</label>
            <div class="input-highlight-dark"></div>
          </div>

          <div class="input-container">
            <input v-model="form.password" type="password" placeholder=" " class="styled-input-dark" id="password" required />
            <label for="password" class="styled-label-dark">Contraseña</label>
            <div class="input-highlight-dark"></div>
          </div>

          <div class="input-container">
            <input v-model="passwordConfirmation" type="password" placeholder=" " class="styled-input-dark" id="password_confirm" required />
            <label for="password_confirm" class="styled-label-dark">Confirmar contraseña</label>
            <div class="input-highlight-dark"></div>
          </div>

          <div v-if="errorMessage" class="error-alert-dark">
            {{ errorMessage }}
          </div>

          <div class="footer-links-dark">
            ¿Ya tienes cuenta?
            <a href="/login">Inicia sesión aquí</a>
          </div>

          <button type="submit" class="btn-register-dark">
            Confirmar Registro
          </button>
        </form>
      </div>
    </div>

    <div class="visual-section-dark">
      <div class="welcome-text">
        <h2 class="branding-dark">ClassSmart</h2>
        <p>Tu futuro educativo comienza aquí.</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* CONFIGURACIÓN DE PÁGINA */
.register-page {
  position: fixed;
  inset: 0;
  display: flex;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background-color: #0f172a;
}

/* --- SECCIÓN FORMULARIO --- */
.form-section-dark {
  width: 500px;
  background: #1e293b;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  box-shadow: 20px 0 50px rgba(0, 0, 0, 0.3);
  z-index: 20;
  overflow-y: auto;
}

.register-box {
  width: 100%;
  max-width: 380px;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.title-dark {
  color: #f8fafc;
  font-size: 2.3rem;
  margin-bottom: 5px;
  font-weight: 800;
  letter-spacing: -1px;
}

.subtitle-dark {
  color: #94a3b8;
  margin-bottom: 40px;
  font-size: 1rem;
}

/* --- INPUTS ESTILO DARK --- */
.input-container {
  position: relative;
  margin-bottom: 25px;
}

.styled-input-dark {
  width: 100%;
  padding: 14px 10px 14px 0;
  border: none;
  border-bottom: 2px solid #334155;
  background: transparent;
  color: #f8fafc;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.styled-input-dark:focus {
  outline: none;
}

.styled-label-dark {
  position: absolute;
  left: 0;
  top: 14px;
  color: #64748b;
  font-size: 0.95rem;
  pointer-events: none;
  transition: all 0.3s ease;
}

.styled-input-dark:focus ~ .styled-label-dark,
.styled-input-dark:not(:placeholder-shown) ~ .styled-label-dark {
  top: -12px;
  font-size: 0.8rem;
  color: #a78bfa;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.input-highlight-dark {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 2px;
  width: 0;
  background: linear-gradient(90deg, #a78bfa, #60a5fa);
  transition: all 0.4s ease;
}

.styled-input-dark:focus ~ .input-highlight-dark {
  width: 100%;
}

/* --- BOTÓN Y LINKS --- */
.btn-register-dark {
  width: 100%;
  margin-top: 25px;
  padding: 16px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(45deg, #6d28d9, #1d4ed8);
  color: white;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 1px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.btn-register-dark:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(29, 78, 216, 0.3);
  background: linear-gradient(45deg, #5b21b6, #1e40af);
}

.footer-links-dark {
  font-size: 0.85rem;
  color: #94a3b8;
  margin-top: 10px;
}

.footer-links-dark a {
  color: #a78bfa;
  text-decoration: none;
  font-weight: 700;
}

/* --- SECCIÓN VISUAL (GRADIENTE + ESTRELLAS) --- */
.visual-section-dark {
  flex: 1;
  position: relative;
  background: linear-gradient(
    135deg,
    #1e1b4b,
    #312e81,
    #1e3a8a,
    #0f172a
  );
  background-size: 400% 400%;
  animation: gradient-dark 12s ease infinite;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.visual-section-dark::before {
  content: "";
  position: absolute;
  inset: 0;
  background-image:
    radial-gradient(1px 1px at 15% 25%, #fff, transparent),
    radial-gradient(1.5px 1.5px at 40% 15%, #fff, transparent),
    radial-gradient(1px 1px at 70% 45%, #fff, transparent),
    radial-gradient(2px 2px at 20% 75%, #fff, transparent),
    radial-gradient(1px 1px at 85% 85%, #fff, transparent);
  background-size: 250px 250px;
  opacity: 0;
  animation: twinkle 5s infinite ease-in-out;
}

.visual-section-dark::after {
  content: "";
  position: absolute;
  inset: 0;
  background-image:
    radial-gradient(1px 1px at 35% 65%, #fff, transparent),
    radial-gradient(2px 2px at 55% 35%, #fff, transparent),
    radial-gradient(1.5px 1.5px at 75% 15%, #fff, transparent);
  background-size: 350px 350px;
  opacity: 0;
  animation: twinkle 7s infinite ease-in-out 1.5s;
}

@keyframes twinkle {
  0%, 100% { opacity: 0; transform: translateY(0) scale(0.9); }
  50% { opacity: 0.4; transform: translateY(-15px) scale(1.1); }
}

@keyframes gradient-dark {
  0% { background-position: 0% 50% }
  50% { background-position: 100% 50% }
  100% { background-position: 0% 50% }
}

.welcome-text {
  position: relative;
  z-index: 10;
  color: white;
  text-align: center;
  text-shadow: 0 4px 15px rgba(0,0,0,0.4);
}

.branding-dark {
  font-size: 3.5rem;
  font-weight: 900;
  color: #f8fafc;
}

.branding-dark span {
  font-weight: 200;
  color: #60a5fa;
}

.error-alert-dark {
  background-color: rgba(220, 38, 38, 0.1);
  color: #fca5a5;
  padding: 12px;
  border-radius: 10px;
  font-size: 0.85rem;
  margin-bottom: 15px;
  border: 1px solid rgba(220, 38, 38, 0.2);
}

@media (max-width: 900px) {
  .visual-section-dark { display: none; }
  .form-section-dark { width: 100%; }
  .form-grid { grid-template-columns: 1fr; }
}
</style>
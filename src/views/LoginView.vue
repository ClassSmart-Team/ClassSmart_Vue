<script setup lang="ts">
import { ref } from 'vue'
import { type Login } from '@/types/types.ts'
import { useFetch } from '@vueuse/core'
import { useAuthStore } from '@/stores/authStore.ts'
import { useRouter } from 'vue-router'

const router = useRouter()
const uas = useAuthStore()

const credentials = ref<Login>({
  email: '',
  password: '',
})

function login() {
  const { data, onFetchError, onFetchResponse } = useFetch(
    'https://sutando-user.me/api/login',
    {
      method: 'post',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    }
  )
    .post(credentials.value) 
    .json()

  onFetchResponse(() => {
    console.log(data.value) 

    uas.setCredentials(data.value.data)

    const role = uas.credentials?.user.role.id

    if (role === 1) router.push('/teacher/home')
    else if (role === 2) router.push('/teacher/home')
    else if (role === 3) router.push('/student/home')
    else router.push('/login')
  })

  onFetchError(() => {
    console.log('Error al iniciar sesión')
  })
}
</script>

<template>
  <div class="bg-page center">
    
    <div class="login-container">
      <h1>Iniciar sesión</h1>

      <!-- IMPORTANTE: form con prevent -->
      <form class="login-form" @submit.prevent="login">
        
        <div>
          <label>Correo electrónico</label>
          <input 
            v-model="credentials.email"
            type="email" 
            placeholder="correo@example.com" 
          />
        </div>

        <div>
          <label>Contraseña</label>
          <input 
            v-model="credentials.password"
            type="password" 
            placeholder="••••••" 
          />
        </div>

        <button type="submit" class="btn-login">
          Entrar
        </button>
      </form>
    </div>
    
  </div>
</template>

<style scoped>
.bg-page {
  position: fixed;
  inset: 0;

  background: linear-gradient(
    -45deg,
    var(--color-Complemento),
    var(--color-AzulTres),
    var(--color-Azul),
    var(--color-AzulCuatro)
  );

  background-size: 400% 400%;
  animation: gradient 15s ease infinite;

  z-index: 0;
}

@keyframes gradient {
  0% { background-position: 0% 50% }
  50% { background-position: 100% 50% }
  100% { background-position: 0% 50% }
}

.login-container {
  background: var(--color-Contenedor);
  padding: 40px;
  border-radius: 15px;
  width: 400px;
  margin: auto;
  text-align: center;
}

h1 {
  color: var(--color-TitulosMenu);
  margin-bottom: 30px;
}

.login-form {
  display: flex;
  flex-direction: column;
  text-align: left;
}

label {
  margin-top: 15px;
  margin-bottom: 5px;
  color: var(--color-Texto);
  font-weight: bold;
}

input {
  width: 100%;
  padding: 12px;
  border-radius: 8px;
  border: none;
  background: var(--color-ContenedorClaro);
  color: var(--color-Texto);
  outline: none;
}

input::placeholder {
  color: #343a55;
}

.btn-login {
  margin-top: 30px;
  padding: 15px;
  border: none;
  border-radius: 10px;
  background: var(--color-AzulTres);
  color: white;
  font-size: 16px;
  cursor: pointer;
}

.btn-login:hover {
  background: var(--color-AzulCuatro);
}
</style>
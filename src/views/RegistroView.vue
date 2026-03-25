<script setup lang="ts">
import { ref } from 'vue'
import { type Register } from '@/types/types.ts'
import { useFetch } from '@vueuse/core'
import { useRouter } from 'vue-router'

const router = useRouter()

const form = ref<Register>({
  name: '',
  lastname: '',
  email: '',
  password: '',
  cellphone: '',
})

function registrar() {
  const { data, onFetchError, onFetchResponse } = useFetch(
    'https://sutando-user.me/api/register',
    {
      method: 'post',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    }
  )
    .post(form)
    .json()

  onFetchResponse(() => {
    alert(data.value.message)
    router.push('/login')
  })

  onFetchError(() => {
    console.log('Error en registro')
  })
}
</script>

<template>
  <div class="bg-page center">
    <div class="form-container">
      <h1>Crear Cuenta</h1>

      <!-- IMPORTANTE -->
      <form class="form-grid" @submit.prevent="registrar">
        
        <label>Nombre</label>
        <input v-model="form.name" type="text" placeholder="Nombre" />

        <label>Apellido</label>
        <input v-model="form.lastname" type="text" placeholder="Apellido" />

        <label>Correo electrónico</label>
        <input v-model="form.email" type="email" placeholder="correo@example.com" />

        <label>Teléfono (opcional)</label>
        <input v-model="form.cellphone" type="text" placeholder="Teléfono" />

        <label>Contraseña</label>
        <input v-model="form.password" type="password" placeholder="••••••" />

        <label>Confirmar contraseña</label>
        <input type="password" placeholder="••••••" />
        <!-- (esto luego lo puedes validar 👀) -->

        <button type="submit" class="btn-submit">
          Confirmar Registro
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.bg-page {
  position: fixed;
  inset: 0;
  overflow-x: hidden;
  overflow-y: auto;
  background: linear-gradient(180deg,var(--color-Azul),var(--color-AzulTres));
  z-index: -1;
}

.form-container {
  background: var(--color-Contenedor);
  padding: 50px;
  border-radius: 15px;
  width: 45%;
  height: auto;
  margin: auto;
  text-align: center;
  box-shadow: 0px 0px 30px #01a2ff80;
}

h1 {
  color: var(--color-TitulosMenu);
  background-color: var(--color-AzulDos);
  border-radius: 40px;
  padding: 10px;
}

.form-grid {
  display: flex;
  flex-direction: column;
  text-align: left;
}

label {
  display: block;
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
  color: #343a55;
  outline: none;
}

input::placeholder {
  color: #343a55;
}

.btn-submit {
  margin-top: 40px;
  padding: 15px;
  border: none;
  border-radius: 10px;
  background: var(--color-AzulTres);
  color: white;
  font-size: 16px;
  cursor: pointer;
  transition: 0.2s;
}

.btn-submit:hover {
  background: var(--color-OscuroAzulado);
}
</style>
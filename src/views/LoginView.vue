<template>
  <div class="bg-page center">
    
    <div class="login-container">
      <h1>Iniciar sesión</h1>

      <form class="login-form">
        <div>
          <label>Correo electrónico</label>
          <input type="email" placeholder="correo@example.com" />
        </div>

        <div>
          <label>Contraseña</label>
          <input type="password" placeholder="••••••" />
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
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: linear-gradient(180deg,var(--color-Azul),var(--color-AzulFuerte));
  z-index: -1;
}

.login-container {
  background: var(--color-BlancoBg);
  padding: 40px;
  border-radius: 15px;
  width: 400px;
  margin: auto;
  text-align: center;
}

h1 {
  color: var(--color-AzulFuerte);
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
  background: var(--color-Azul);
  color: white;
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
  background: var(--color-AzulFuerte);
  color: white;
  font-size: 16px;
  cursor: pointer;
}

.btn-login:hover {
  background: var(--color-OscuroAzulado);
}
</style>

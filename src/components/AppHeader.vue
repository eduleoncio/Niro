<template>
  <header :class="['navbar', { scrolled: scrolled }]">
    <div class="navbar_container">

      <!-- Logo -->
      <div class="navbar_marca">
        <img class="navbar_logo" src="../assets/logotipo.svg" alt="Logotipo">
      </div>

      <!-- Menu -->
      <nav :class="['menu_principal', { ativo: menuAberto }]">
        <ul class="links_navbar">
          <li><router-link to="/">Como funciona</router-link></li>
          <li><router-link to="/contato">Resultados</router-link></li>
          <li><router-link to="/funcionalidades">Depoimentos</router-link></li>
          <li><router-link to="/funcionalidades">FAQ</router-link></li>
        </ul>
      </nav>

      <!-- Botão login -->
      <button class="button" type="button" @click="router.push('/login')">
        Entrar
      </button>

      <!-- Botão hamburguer -->
      <button class="menu_toggle" @click="menuAberto = !menuAberto">
        ☰
      </button>
    </div>
  </header>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { ref, onMounted, onUnmounted } from 'vue'

const router = useRouter()

const menuAberto = ref(false)
const scrolled = ref(false)

const handleScroll = () => {
  scrolled.value = window.scrollY > 50
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1000;
  background: transparent;
  transition: all 0.3s ease;
  z-index: 1000;
}

/* quando rolar */
.navbar.scrolled {
   background: rgba(4, 4, 4, 0.25);
  backdrop-filter: blur(25px);
}

/* container interno controla o espaçamento */
.navbar_container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1440px;
  margin: 0 auto;
  padding: 1rem 2rem;
}

.navbar_marca {
  justify-self: start;
}

.navbar_logo {
  height: 2rem;
}

.menu_principal {
  display: flex;
  justify-content: center;
}

.links_navbar {
  display: flex;
  gap: 1.1rem;
  list-style: none;
  background: rgba(0, 0, 0, 0.25);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  border-radius: 50px;
  padding: 0.8rem 2rem;
}

.links_navbar a {
  color: rgb(177, 177, 177);
  text-decoration: none;
  font-weight: 400;
  transition: 0.3s;
}

.links_navbar a:hover {
  opacity: 0.7;
  color: rgb(0, 255, 64);
}

.button {
  justify-self: end;
  background: rgba(115, 115, 115, 0.15);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  border: 1px solid;
  border-radius: 50px;
  padding: 0.5rem 1.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: 0.3s;
}

.button:hover {
  background: #ffffff;
  color: black;
}

.button:active {
  transform: scale(0.96);
}

/* BOTÃO LOGIN */
#botao_login {
  justify-self: end;
  padding: 0.5rem 1.2rem;
  cursor: pointer;
}

/* BOTÃO HAMBURGUER */
.menu_toggle {
  display: none;
  font-size: 2rem;
  background: none;
  border: none;
  color: white;
  cursor: pointer;
}

/* RESPONSIVO */
@media (max-width: 768px) {

  .navbar {
    grid-template-columns: auto auto;
  }

  /* mostra hamburguer */
  .menu_toggle {
    display: block;
    justify-self: end;
  }

  /* menu vira dropdown */
  .menu_principal {
    position: absolute;
    top: 100%;
    left: 0;
    width: 100%;
    background: rgba(0, 0, 0, 0.95);
    display: none;
    flex-direction: column;
    padding: 2rem 0;
  }

  .menu_principal.ativo {
    display: flex;
  }

  .links_navbar {
    flex-direction: column;
    align-items: center;
    gap: 2rem;
  }
}
</style>
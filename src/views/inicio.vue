<template>

  <!-- Importação do componente para a Header -->
  <div>
    <AppHeader />
  </div>

  <!-- PÁGINA 1 -->
  <section class="page">

    <h1 class="texto_principal">
      Organize, monitore e otimize <br> seu estoque de EPIs
    </h1>

    <p class="paragrafo">
      Niro é um sistema de controle de estoque de EPIs que centraliza a gestão dos equipamentos de <br> proteção de
      forma simples e segura. Ao substituir controles em papel por uma solução digital,<br> sua empresa evita
      perdas de registros e gastos desnecessários com reposições.
    </p>

    <div class="buttons">
      <!-- Botão Acessar Conta -->
      <button class="button_account" type="button" @click="router.push('/login')">
        Acessar conta
      </button>

      <!-- Botão Demonstração -->
      <button class="button_demonstration" type="button" @click="router.push('/login')">
        Demonstração
      </button>
    </div>

    <div class="window">
      <img id="window_stock" src="../assets/window-visualizer.svg" alt="Tela do estoque de EPIs">
    </div>
  </section>

  <section class="page2">

    <!-- <div class="brands_section">

      <p class="subtitle">
      </p>

      <div class="brands_slider">
        <div class="brands_track">

          <img src="../assets/brand2.svg" alt="" draggable="false">
          <img src="../assets/brand3.svg" alt="" draggable="false">
          <img src="../assets/brand4.svg" alt="" draggable="false">
          <img src="../assets/brand5.svg" alt="" draggable="false">
          <img src="../assets/brand6.svg" alt="" draggable="false">
          <img src="../assets/brand7.svg" alt="" draggable="false">


          <img src="../assets/brand2.svg" alt="" draggable="false">
          <img src="../assets/brand3.svg" alt="" draggable="false">
          <img src="../assets/brand4.svg" alt="" draggable="false">
          <img src="../assets/brand5.svg" alt="" draggable="false">
          <img src="../assets/brand6.svg" alt="" draggable="false">
          <img src="../assets/brand7.svg" alt="" draggable="false">

        </div>
      </div>
    </div> -->

    <!-- resto da page 2 -->
    <div class="features_section">
    </div>

  </section>

</template>

<script>
import router from '../router'
import AppHeader from '../components/AppHeader.vue'
import { onMounted, onUnmounted, ref } from 'vue'

export default {
  name: 'Navbar',

  components: {
    AppHeader
  },

  setup() {
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

    return {
      router,
      menuAberto,
      scrolled
    }
  }
}

</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap');

.page {
  min-height: 100vh;
  position: relative;
  overflow: visible;
  padding-top: 5rem;
  background: url('../assets/background-inicio.svg') no-repeat top center;
  background-repeat: no-repeat;
  background-size: 100%;
}

.texto_principal {
  display: flex;
  text-align: start;
  background: -webkit-linear-gradient(#ffffff, #b6b6b6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-top: 5rem;
  font-size: 4.5rem;
  font-family: "Poppins", sans-serif;
  font-weight: 600;
  line-height: 4rem;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.paragrafo {
  display: flex;
  text-align: center;
  margin-top: 2rem;
  justify-content: center;
  font-family: "Poppins", sans-serif;
  font-weight: 400;
  font-size: 1rem;
}

.buttons {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 2rem;
}

.button_demonstration {
  background-color: transparent;
  border: solid;
  border-radius: 2px;
  border-color: #898989;
  color: #ffffff;
  border-radius: 5px;
  padding: 0.5rem 1.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: 0.3s;
  text-align: center;

}

.button_account {
  background-color: #ffffff;
  border: solid;
  color: black;
  border-radius: 5px;
  border-color: #ffffff;
  padding: 0.5rem 1.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: 0.3s;
}

.button_account:hover {
  background: #c2c2c2;
}

.button_account:active {
  transform: scale(0.96);
}

.window {
  display: flex;
  justify-content: center;
}

#window_stock {
  width: 70%;
  margin-top: 2rem;
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

/* 
.page2 {
  background: #050505;
  min-height: 100vh;
  padding-bottom: 8rem;
}

.subtitle {
  text-align: center;
  color: #8a8a8a;
  font-size: 14px;
  margin-bottom: 2rem;
}

.brands_section {
  background: #0B0B0B;
  padding-top: 1.5rem;
  padding-bottom: 2.5rem;
  border-top: 1px solid rgba(255,255,255,0.05);
  border-bottom: 1px solid rgba(255,255,255,0.05);
}

.brands_slider {
  width: 100%;
  overflow: hidden;
  position: relative;
  white-space: nowrap;
}

.brands_track {
  display: inline-flex;
  align-items: center;
  gap: 5rem;

  animation: scrollBrands 30s linear infinite;

  will-change: transform;
}

.brands_track img {
  height: 35px;
  flex-shrink: 0;
  opacity: 0.8;
  transition: transform 0.3s ease, opacity 0.3s ease;
  cursor: pointer;
}

.brands_track img:hover {
  transform: scale(1.08);
  opacity: 1;
}

.brands_slider:hover .brands_track {
  animation-play-state: paused;
}

@keyframes scrollBrands {
  from {
    transform: translate3d(0, 0, 0);
  }

  to {
    transform: translate3d(-50%, 0, 0);
  }
} */

</style>
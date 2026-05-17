<template>

  <!-- Importação do componente para a Header -->
  <div>
    <AppHeader />
  </div>

  <!-- PÁGINA 1 -->
  <section id="page" class="page">

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

  <section id="page2" class="page2">

    <div class="funcionalidades-text">

      <h2 class="title-page2">Intuitivo, rápido e eficiente,</h2>
      <p class="paragraph-page2">para você que deseja otimizar o seu estoque, organizar os EPIs e concentrá-los em um
        estoque virtual, <br> evitando gastos desnecessários com a compra de novos equipamentos que, por falta de
        controle, foram <br> “perdidos”.</p>

    </div>

    <div class="cards-funcionalidades-page2">

      <img id="card-funcionalidades" src="../assets/card-funcionalidades.svg"
        alt="Card de funcionalidades do sistema Niro">
      <img id="card-documentacao" src="../assets/card-documentacao.svg" alt="Card de documentação do sistema Niro">
      <img id="card-dinheiro" src="../assets/card-dinheiro.svg" alt="Card de economia do sistema Niro">
    </div>

  </section>

  <section id="page3" class="page3">

    <div class="telas-text">

      <h2 class="title-page3">Muitas telas para gerenciar o seu estoque,</h2>
      <p class="paragraph-page3">com diversas ferramentas para você acompanhar de perto tudo que está acontecendo com os
        seus <br> equipamentos.</p>
    </div>

    <div class="screens">
      <img id="sceens-page3" src="../assets/telas-page3.svg" alt="Tela do estoque de EPIs">
    </div>

  </section>

  <footer id="contato" class="site-footer">

    <div class="footer-inner">

      <div class="footer-brand">
        <img class="footer-logo" :src="LogoSvg" alt="Niro logotipo" />
      </div>

      <div class="footer-block">

        <h3 class="footer-title">Links</h3>
        <RouterLink :to="{ path: '/', hash: '#page' }">
          <p class="footer-link">Home</p>
        </RouterLink>
        <RouterLink :to="{ path: '/', hash: '#page2' }">
          <p class="footer-link">Funcionalidades</p>
        </RouterLink>

      </div>

      <div class="footer-block">

        <h3 class="footer-title">Contato</h3>
        <a href="https://github.com/eduleoncio" target="_blank" rel="noreferrer">
          <p class="footer-link">https://github.com/eduleoncio</p>
        </a>

      </div>

      <div class="footer-block footer-location">

        <h3 class="footer-title">Onde estamos</h3>
        <a href="https://www.sp.senai.br/unidade/campinas/" target="_blank" rel="noreferrer">
          <p class="footer-link">Escola e Faculdade de Tecnologia SENAI "Roberto Mange"</p>
        </a>

      </div>

    </div>
    <div class="footer-copy">© 2026 — Projeto Acadêmico</div>
  </footer>

</template>

<script>
import router from '../router'
import AppHeader from '../components/AppHeader.vue'
import LogoSvg from '../assets/logotipo.svg'
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
      scrolled,
      LogoSvg
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
  background: -webkit-linear-gradient(#ffffff, #92FFB6);
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

.page2 {
  min-height: 100vh;
  background-color: #061600;
  background: linear-gradient(180deg, #061600 0%, #00100A 100%);
  background-repeat: no-repeat, no-repeat;
  background-position: top center, center;
  background-size: 100%, cover;
  padding: 0rem 0rem 3rem 0rem;
}

.funcionalidades-text {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  margin-top: 4rem;
}

.title-page2 {
  font-family: "Poppins", sans-serif;
  font-weight: 600;
  font-size: 2.5rem;
  background: -webkit-linear-gradient(#ffffff, #92FFB6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.paragraph-page2 {
  font-family: "Poppins", sans-serif;
  font-weight: 300;
  font-size: 0.8rem;
  margin-top: 1rem;
}

.cards-funcionalidades-page2 {
  display: inline-block;
  justify-content: center;
  margin-top: 3rem;
  text-align: center;

}

.page3 {
  min-height: 100vh;
  background-color: #061600;
  background-size: 100%, cover;
  background: url(../assets/backgroun-page3.svg);
  background-repeat: no-repeat;
  background-position: top center;
  background-size: cover;
}

.telas-text {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  margin-top: 3rem;
}

.title-page3 {
  font-family: "Poppins", sans-serif;
  font-weight: 600;
  font-size: 2.5rem;
  background: -webkit-linear-gradient(#ffffff, #92FFB6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.paragraph-page3 {
  font-family: "Poppins", sans-serif;
  font-weight: 300;
  font-size: 0.8rem;
  margin-top: 1rem;
}

.screens {
  display: flex;
  justify-content: center;
}

#sceens-page3 {
  width: 80%;
  margin-top: 2rem;
}

.site-footer {
  background-color: #010c04;
  padding: 3rem 2rem 2rem;
  margin-top: 2rem;
}

.footer-inner {
  display: grid;
  grid-template-columns: 1.5fr repeat(3, 2fr);
  gap: 2rem;
  max-width: 1440px;
  margin: 0 auto;
}

.footer-block {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.footer-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 1rem;
  color: rgba(107, 106, 106, 0.72);
  text-decoration: none;
}

.footer-link {
  color: rgba(255, 255, 255);
  text-decoration: none;
  transition: color 0.3s;
}

.footer-block a:hover {
  color: #b6f5d9;
}

.footer-location p {
  line-height: 1.7;
}

.footer-copy {
  max-width: 1200px;
  margin: 1.5rem auto 0;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.58);
  text-align: center;
}

.footer-logo {
  width: 5.5rem;
  height: auto;
  display: block;
  margin-left: 2rem;
}

.site-footer {
  font-family: 'Montserrat', sans-serif;
}

@media (max-width: 900px) {
  .footer-inner {
    grid-template-columns: 1fr;
  }
}
</style>
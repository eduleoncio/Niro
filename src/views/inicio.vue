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
      Niro é um sistema de controle de estoque de EPIs que centraliza a gestão dos equipamentos de
      proteção de forma simples e segura. Ao substituir controles em papel por uma solução digital,
      sua empresa evita perdas de registros e gastos desnecessários com reposições.
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

/* ─── PAGE 1 ─────────────────────────────────────────── */

.page {
  min-height: 100vh;
  position: relative;
  overflow: visible;
  padding: 5rem 1.5rem 3rem;
  background: url('../assets/background-inicio.svg') no-repeat top center;
  background-size: 100%;
}

.texto_principal {
  background: -webkit-linear-gradient(#ffffff, #92FFB6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-top: 5rem;
  font-size: 4.5rem;
  font-family: "Poppins", sans-serif;
  font-weight: 600;
  line-height: 1.1;
  text-align: center;
}

.paragrafo {
  text-align: center;
  margin-top: 2rem;
  font-family: "Poppins", sans-serif;
  font-weight: 400;
  font-size: 1rem;
  line-height: 1.7;
  max-width: 680px;
  margin-left: auto;
  margin-right: auto;
}

.buttons {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 2rem;
  flex-wrap: wrap;
}

.button_demonstration {
  background-color: transparent;
  border: 2px solid var(--color-primary);
  border-radius: 5px;
  color: var(--color-primary);
  padding: 0.5rem 1.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: 0.3s;
  text-align: center;
}

.button_account {
  background-color: var(--color-primary);
  border: 2px solid var(--color-primary);
  border-radius: 5px;
  color: #061600;
  padding: 0.5rem 1.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: 0.3s;
}

.button_account:hover {
  background: var(--color-primary-dark);
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

/* ─── PAGE 2 ─────────────────────────────────────────── */

.page2 {
  min-height: 100vh;
  background: linear-gradient(180deg, #061600 0%, #00100A 100%);
  padding: 0 1.5rem 3rem;
}

.funcionalidades-text {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  margin-top: 4rem;
  padding: 0 1rem;
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
  font-size: 0.9rem;
  margin-top: 1rem;
  line-height: 1.7;
  max-width: 640px;
}

.cards-funcionalidades-page2 {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1.5rem;
  margin-top: 3rem;
}

.cards-funcionalidades-page2 img {
  max-width: 100%;
  height: auto;
}

/* ─── PAGE 3 ─────────────────────────────────────────── */

.page3 {
  min-height: 100vh;
  background: url('../assets/backgroun-page3.svg') no-repeat top center;
  background-size: cover;
  padding: 0 1.5rem 3rem;
}

.telas-text {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  margin-top: 3rem;
  padding: 0 1rem;
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
  font-size: 0.9rem;
  margin-top: 1rem;
  line-height: 1.7;
  max-width: 560px;
}

.screens {
  display: flex;
  justify-content: center;
}

#sceens-page3 {
  width: 80%;
  margin-top: 2rem;
  max-width: 100%;
  height: auto;
}

/* ─── FOOTER ─────────────────────────────────────────── */

.site-footer {
  background-color: #010c04;
  padding: 3rem 2rem 2rem;
  margin-top: 2rem;
  font-family: 'Montserrat', sans-serif;
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
}

.footer-link {
  color: rgba(255, 255, 255);
  text-decoration: none;
  transition: color 0.3s;
}

.footer-block a:hover .footer-link {
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

/* ─── BREAKPOINTS ────────────────────────────────────── */

/* Tablet (≤ 1024px) */
@media (max-width: 1024px) {
  .texto_principal {
    font-size: 3.5rem;
  }

  .title-page2,
  .title-page3 {
    font-size: 2rem;
  }

  #window_stock {
    width: 85%;
  }

  #sceens-page3 {
    width: 90%;
  }
}

/* Mobile grande (≤ 768px) */
@media (max-width: 768px) {
  .texto_principal {
    font-size: 2.6rem;
    line-height: 1.15;
    margin-top: 3rem;
  }

  .paragrafo {
    font-size: 0.95rem;
  }

  .title-page2,
  .title-page3 {
    font-size: 1.75rem;
  }

  #window_stock {
    width: 95%;
  }

  #sceens-page3 {
    width: 95%;
  }

  .footer-inner {
    grid-template-columns: 1fr 1fr;
  }

  .footer-logo {
    margin-left: 0;
  }
}

/* Mobile pequeno (≤ 480px) */
@media (max-width: 480px) {
  .texto_principal {
    font-size: 2rem;
  }

  .buttons {
    flex-direction: column;
    align-items: center;
  }

  .button_account,
  .button_demonstration {
    width: 100%;
    max-width: 280px;
  }

  .title-page2,
  .title-page3 {
    font-size: 1.5rem;
  }

  .footer-inner {
    grid-template-columns: 1fr;
  }
}
</style>
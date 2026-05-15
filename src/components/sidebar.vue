<template>
  <aside :class="['sidebar', { 'sidebar--collapsed': isCollapsed }]">
    <div class="sidebar-top">
      <button class="hamburger-button" @click="toggleSidebar" :aria-expanded="!isCollapsed" aria-label="Alternar menu">
        <span></span>
        <span></span>
        <span></span>
      </button>

      <div class="logo" v-if="!isCollapsed">
        <img class="navbar_logo" src="../assets/logotipo.svg" alt="Logotipo">
      </div>
    </div>

    <nav class="menu">
      <RouterLink to="/dashboard" class="menu-item" exact-active-class="active">
        <div class="icon-box">
          <img src="../assets/icon-dashboard.svg" class="menu-icon" />
        </div>
        <span class="menu-label">Dashboard</span>
      </RouterLink>

      <RouterLink to="/dashboard/estoque" class="menu-item" active-class="active">
        <div class="icon-box">
          <img src="../assets/icon-estoque.svg" class="menu-icon" />
        </div>
        <span class="menu-label">Estoque</span>
      </RouterLink>

      <RouterLink to="/dashboard/cadastrarEPI" class="menu-item" active-class="active">
        <div class="icon-box">
          <img src="../assets/icon-cadastrar.svg" class="menu-icon" />
        </div>
        <span class="menu-label">Cadastrar EPI</span>
      </RouterLink>

      <RouterLink to="/dashboard/rastrearEPI" class="menu-item" active-class="active">
        <div class="icon-box">
          <img src="../assets/icon-rastrear.svg" class="menu-icon" />
        </div>
        <span class="menu-label">Rastrear EPI</span>
      </RouterLink>

      <RouterLink to="/dashboard/retirarEPI" class="menu-item" active-class="active">
        <div class="icon-box">
          <img src="../assets/icon-retirar.svg" class="menu-icon" />
        </div>
        <span class="menu-label">Retirar EPI</span>
      </RouterLink>

      <RouterLink to="/dashboard/relatorios" class="menu-item" active-class="active">
        <div class="icon-box">
          <img src="../assets/icon-relatorios.svg" class="menu-icon" />
        </div>
        <span class="menu-label">Relatórios</span>
      </RouterLink>

      <RouterLink to="/dashboard/funcionarios" class="menu-item" active-class="active">
        <div class="icon-box">
          <img src="../assets/icon-funcionarios.svg" class="menu-icon" />
        </div>
        <span class="menu-label">Funcionários</span>
      </RouterLink>

      <RouterLink to="/dashboard/aluno" class="menu-item" active-class="active">
        <div class="icon-box">
          <img src="../assets/icon-alunos.svg" class="menu-icon" />
        </div>
        <span class="menu-label">Alunos</span>
      </RouterLink>

      <RouterLink to="/dashboard/perfil" class="menu-item" active-class="active">
        <div class="icon-box">
          <img src="../assets/icon-perfil.svg" class="menu-icon" />
        </div>
        <span class="menu-label">Perfil</span>
      </RouterLink>
    </nav>

    <button @click="sair" class="botao-sair">
      <div class="icon-box">
        <img src="../assets/icon-logout.svg" class="menu-icon-logout" />
      </div>
      <span class="menu-label">Sair</span>
    </button>
  </aside>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useSupabase } from '../composables/useSupabase'
import { useRouter } from 'vue-router'

const props = defineProps({
  collapsed: {
    type: Boolean,
    default: true
  }
})
const emit = defineEmits(['update:collapsed'])
const isCollapsed = ref(props.collapsed)

watch(
  () => props.collapsed,
  (value) => {
    isCollapsed.value = value
  }
)

const { supabase } = useSupabase()
const router = useRouter()

async function sair() {
  await supabase.auth.signOut()
  router.push('/login')
}

function toggleSidebar() {
  isCollapsed.value = !isCollapsed.value
  emit('update:collapsed', isCollapsed.value)
}
</script>

<style scoped>
.logo {
  display: flex;
  justify-content: center;
  align-items: center;
}

.navbar_logo {
  width: auto;
  margin-top: 1rem;
  width: 3.5rem;
}

.sidebar {
  width: 250px;
  background: #001C00;
  color: white;
  position: fixed;
  height: 100vh;
  padding: 1.3rem;
  transition: width 0.2s ease;
}

.sidebar--collapsed {
  width: 80px;
}

.sidebar-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.sidebar--collapsed .sidebar-top {
  justify-content: center;
}

.hamburger-button {
  width: 38px;
  height: 38px;
  display: inline-flex;
  flex-direction: column;
  justify-content: center;
  gap: 5px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  cursor: pointer;
  padding: 6px;
}

.hamburger-button span {
  display: block;
  width: 100%;
  height: 3px;
  background: #fff;
  border-radius: 999px;
}

.menu {
  text-align: start;
  justify-content: center;
  margin-top: 30px;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  color: rgba(255, 255, 255, 0.288);
  text-decoration: none;
  padding: 10px;
  font-weight: 400;
}

.sidebar--collapsed .menu-item {
  justify-content: center;
}

.menu-label {
  white-space: nowrap;
  overflow: hidden;
  transition: opacity 0.2s ease, width 0.2s ease, margin 0.2s ease;
}

.sidebar--collapsed .menu-label {
  opacity: 0;
  width: 0;
  margin: 0;
}

.menu-icon {
  width: 15px;
  height: 15px;
  object-fit: contain;
  opacity: 0.3;
  transition: 0.2s;
}

.menu-item.active {
  background: rgba(64, 137, 60, 1);
  border-radius: 5px;
  color: rgb(255, 255, 255);
}

.botao-sair {
  border: solid;
  border-radius: 6px;
  border-style: solid;
  border-width: 1px;
  border-color: rgb(0, 255, 47);
  color: rgb(255, 255, 255);
  font-family: 'Montserrat', sans-serif;
  font-size: 1rem;
  background-color: #ffffff08;
  align-items: center;
  justify-content: center;
  display: flex;
  gap: 0.5rem;
  width: 100%;
  margin-top: 4.2rem;
}

.sidebar--collapsed .botao-sair {
  justify-content: center;
}

.menu-icon-logout {
  width: 15px;
  height: 18px;
}

.icon-box {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 4px;
  transition: 0.2s;
}

.menu-item.active .icon-box {
  background-color: rgba(0, 0, 0, 0.358);
}

.menu-item.active .menu-icon {
  opacity: 1;
  filter: brightness(0) invert(1);
}

.sidebar--collapsed .icon-box,
.sidebar--collapsed .menu-icon-logout {
  margin: 0;
}
</style>
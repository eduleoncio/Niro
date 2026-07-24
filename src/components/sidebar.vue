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
          <img src="../assets/icon-dashboard.svg" class="menu-icon" alt="Dashboard" />
        </div>

        <span class="menu-label">
          Dashboard
        </span>
      </RouterLink>

      <RouterLink to="/dashboard/lancamentos" class="menu-item" active-class="active">
        <div class="icon-box">
          <img src="../assets/lancamentos.svg" class="menu-icon" alt="Lançamentos" />
        </div>

        <span class="menu-label">
          Lançamentos
        </span>
      </RouterLink>

      <RouterLink to="/dashboard/mensal" class="menu-item" active-class="active">
        <div class="icon-box">
          <img src="../assets/mensal.svg" class="menu-icon" alt="Mensal" />
        </div>

        <span class="menu-label">
          Mensal
        </span>
      </RouterLink>

      <RouterLink to="/dashboard/historico" class="menu-item" active-class="active">
        <div class="icon-box">
          <img src="../assets/historico.svg" class="menu-icon" alt="Histórico" />
        </div>

        <span class="menu-label">
          Histórico
        </span>
      </RouterLink>

      <RouterLink to="/dashboard/perfil" class="menu-item" active-class="active">
        <div class="icon-box">
          <img src="../assets/icon-perfil.svg" class="menu-icon" alt="Perfil" />
        </div>

        <span class="menu-label">
          Perfil
        </span>
      </RouterLink>

      <RouterLink v-if="session?.user?.email" :to="{
        name: 'dashboard-perfil-equipe',
        params: {
          email: session.user.email
        }
      }" class="menu-item" active-class="active">
        <div class="icon-box">
          <img src="../assets/icon-perfil.svg" class="menu-icon" alt="Perfil" />
        </div>

        <span class="menu-label">
          Perfil
        </span>
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
.sidebar {
  --ink: #0a1510;
  --panel: #101d16;
  --line: rgba(255, 255, 255, 0.08);
  --paper: #eef4ee;
  --paper-dim: rgba(238, 244, 238, 0.5);
  --jade: #6fe3a0;
  --jade-dim: rgba(111, 227, 160, 0.14);
  --radius: 0.9rem;

  width: 15.625rem;
  background: var(--ink);
  color: var(--paper);
  position: fixed;
  height: 100vh;
  padding: 1.5rem 1.1rem;
  border-right: 1px solid var(--line);
  box-sizing: border-box;
  font-family: 'Inter', system-ui, sans-serif;
  display: flex;
  flex-direction: column;
  transition: width 0.2s ease, padding 0.2s ease;
  z-index: 20;
}

.sidebar--collapsed {
  width: 5.25rem;
  padding: 1.5rem 0.85rem;
}

/* ===== Top / brand ===== */
.sidebar-top {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-height: 2.375rem;
}

.sidebar:not(.sidebar--collapsed) .sidebar-top {
  justify-content: flex-start;
}

.sidebar--collapsed .sidebar-top {
  justify-content: center;
}

.logo {
  display: flex;
  align-items: center;
  justify-content: center;
}

.navbar_logo {
  width: 2.4rem;
  height: auto;
  display: block;
}

.hamburger-button {
  flex-shrink: 0;
  width: 2.375rem;
  height: 2.375rem;
  display: inline-flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 0.3rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--line);
  border-radius: 0.7rem;
  cursor: pointer;
  padding: 0;
  transition: background 0.15s ease, border-color 0.15s ease;
}

.hamburger-button:hover {
  background: var(--jade-dim);
  border-color: rgba(111, 227, 160, 0.3);
}

.hamburger-button span {
  display: block;
  width: 1.05rem;
  height: 0.125rem;
  border-radius: 999px;
  background: var(--paper);
  opacity: 0.75;
  transition: background 0.15s ease;
}

.hamburger-button:hover span {
  background: var(--jade);
  opacity: 1;
}

/* ===== Nav ===== */
.menu {
  margin-top: 2.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  color: var(--paper-dim);
  text-decoration: none;
  padding: 0.7rem 0.75rem;
  border-radius: 0.65rem;
  font-size: 0.9rem;
  font-weight: 500;
  transition: background 0.15s ease, color 0.15s ease;
}

.menu-item:hover {
  background: rgba(255, 255, 255, 0.045);
  color: var(--paper);
}

.sidebar--collapsed .menu-item {
  padding: 0.7rem;
  gap: 0;
  width: 2.9rem;
  justify-content: center;
}

.menu-label {
  white-space: nowrap;
  overflow: hidden;
  transition: opacity 0.15s ease, width 0.2s ease, margin 0.2s ease;
}

.sidebar--collapsed .menu-label {
  opacity: 0;
  width: 0;
  margin: 0;
}

.icon-box {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.9rem;
  height: 1.9rem;
  border-radius: 0.5rem;
  flex-shrink: 0;
  transition: background 0.15s ease;
}

.menu-icon {
  width: 1rem;
  height: 1rem;
  object-fit: contain;
  opacity: 0.55;
  filter: brightness(0) invert(1);
  transition: opacity 0.15s ease;
}

.menu-item:hover .menu-icon {
  opacity: 0.85;
}

.menu-item.active {
  background: var(--jade-dim);
  color: var(--jade);
}

.menu-item.active .icon-box {
  background: rgba(111, 227, 160, 0.18);
}

.menu-item.active .menu-icon {
  opacity: 1;
  filter: brightness(0) invert(1);
}

/* ===== Sign out ===== */
.botao-sair {
  margin-top: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.7rem;
  width: 100%;
  padding: 0.7rem 0.9rem;
  border: 1px solid var(--line);
  border-radius: 0.65rem;
  background: rgba(255, 255, 255, 0.03);
  color: var(--paper-dim);
  font-family: inherit;
  font-size: 0.86rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease, color 0.15s ease;
}

.botao-sair:hover {
  background: var(--jade-dim);
  border-color: rgba(111, 227, 160, 0.3);
  color: var(--jade);
}

.botao-sair:hover .menu-icon-logout {
  opacity: 1;
}

.sidebar--collapsed .botao-sair {
  padding: 0.7rem;
  gap: 0;
  width: 2.9rem;
  margin-left: auto;
  margin-right: auto;
}

.menu-icon-logout {
  width: 0.95rem;
  height: 0.95rem;
  opacity: 0.6;
  filter: brightness(0) invert(1);
  transition: opacity 0.15s ease;
}
</style>
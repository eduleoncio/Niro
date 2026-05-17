import { createRouter, createWebHistory } from 'vue-router'
import { useSupabase } from '../composables/useSupabase'
const { supabase } = useSupabase()

// Importa todos os componentes das páginas
import Inicio from '../views/inicio.vue'
import Contato from '../views/contato.vue'
import Funcionalidades from '../views/funcionalidades.vue'
import Login from '../views/login.vue'
import Dashboard from '../views/dashboard.vue'
import Estoque from '../views/estoque.vue'
import CadastrarEPI from '../views/cadastrarEPI.vue'
import RastrearEPI from '../views/rastrearEPI.vue'
import RetirarEPI from '../views/retirarEPI.vue'
import Relatorios from '../views/relatorios.vue'
import Funcionarios from '../views/funcionarios.vue'
import Aluno from '../views/aluno.vue'
import Perfil from '../views/perfil.vue'

// Define todas as rotas da aplicação
const routes = [
  { 
    path: '/',           // URL raiz
    component: Inicio    // Mostra o componente Home
  },
  { 
    path: '/contato',       // URL /sobre
    component: Contato   // Mostra o componente Sobre
  },
  { 
    path: '/funcionalidades',     // URL /contato
    component: Funcionalidades // Mostra o componente Contato
  },
  { 
    path: '/login',    // URL /produtos
    component: Login // Mostra o componente Produtos
  }, 
  {
    path: '/estoque', // URL /produtos
    component: Estoque  // Mostra o componente Produtos
  },
  {
    path: '/cadastrarEPI', // URL /produtos
    component: CadastrarEPI // Mostra o componente Produtos
  },
  {
    path: '/rastrearEPI', // URL /produtos 
    component: RastrearEPI // Mostra o componente Produtos
  },
  {
    path: '/retirarEPI', // URL /produtos 
    component: RetirarEPI // Mostra o componente Produtos
  },
   {
    path: '/relatorios', // URL /produtos
    component: Relatorios  // Mostra o componente Produtos
  },
  {
    path: '/funcionarios', // URL /produtos
    component: Funcionarios  // Mostra o componente Produtos
  },
  {
    path: '/aluno', // URL /produtos
    component: Aluno  // Mostra o componente Produtos
  },
  {
    path: '/perfil', // URL /produtos
    component: Perfil  // Mostra o componente Produtos
  },
  
  // Rota protegida com subrotas
{
  path: '/dashboard',
  component: Dashboard,
  meta: { requiresAuth: true },
  children: [
    { path: 'estoque', component: Estoque },
    { path: 'cadastrarEPI', component: CadastrarEPI },
    { path: 'rastrearEPI', component: RastrearEPI },
    { path: 'retirarEPI', component: RetirarEPI },
    { path: 'relatorios', component: Relatorios },
    { path: 'funcionarios', component: Funcionarios },
    { path: 'aluno', component: Aluno },
    { path: 'perfil', component: Perfil }
    ]
}
]

// Cria a instância do router
const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }
    if (to.hash) {
      const headerOffset = 88
      const element = document.querySelector(to.hash)
      if (element) {
        const top = element.getBoundingClientRect().top + window.pageYOffset - headerOffset
        return {
          left: 0,
          top: top > 0 ? top : 0,
          behavior: 'smooth'
        }
      }
      return {
        el: to.hash,
        behavior: 'smooth'
      }
    }
    return { top: 0 }
  }
})

router.beforeEach(async (to, from, next) => {
 const requiresAuth = to.matched.some(r => r.meta.requiresAuth);

const { data: { session } } = await supabase.auth.getSession();
if (requiresAuth && !session) { next('/login'); }
 else { next(); }
});

// Exporta para usar em main.js
export default router
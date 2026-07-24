import {
  createRouter,
  createWebHistory
} from 'vue-router'

import {
  useSupabase
} from '../composables/useSupabase'

import Contato from '../views/contato.vue'
import Funcionalidades from '../views/funcionalidades.vue'

import Login from '../views/login.vue'
import EsqueciSenha from '../views/esqueciSenha.vue'
import AlterarSenha from '../views/alterarSenha.vue'

import Dashboard from '../views/dashboard.vue'
import Estoque from '../views/estoque.vue'
import CadastrarEPI from '../views/cadastrarEPI.vue'
import Lancamentos from '../views/lancamentos.vue'
import RetirarEPI from '../views/retirarEPI.vue'
import Historico from '../views/historico.vue'
import Perfil from '../views/perfil.vue'
import Mensal from '../views/mensal.vue'

const {
  supabase
} = useSupabase()

const routes = [
  /*
    Páginas públicas.
  */
  {
    path: '/',
    redirect: {
      name: 'login'
    }
  },

  {
    path: '/contato',
    name: 'contato',
    component: Contato
  },

  {
    path: '/funcionalidades',
    name: 'funcionalidades',
    component: Funcionalidades
  },

  {
    path: '/login',
    name: 'login',
    component: Login
  },

  {
    path: '/esqueci-senha',
    name: 'esqueci-senha',
    component: EsqueciSenha
  },

  {
    path: '/alterar-senha',
    name: 'alterar-senha',
    component: AlterarSenha
  },

  /*
    Links antigos redirecionados para
    as páginas internas do Dashboard.
  */
  {
    path: '/estoque',
    redirect: '/dashboard/estoque'
  },

  {
    path: '/cadastrarEPI',
    redirect: '/dashboard/cadastrarEPI'
  },

  {
    path: '/lancamentos',
    redirect: '/dashboard/lancamentos'
  },

  {
    path: '/retirarEPI',
    redirect: '/dashboard/retirarEPI'
  },

  {
    path: '/historico',
    redirect: '/dashboard/historico'
  },

  /*
    Dashboard e páginas internas.
  */
  {
    path: '/dashboard',
    name: 'dashboard',
    component: Dashboard,

    meta: {
      requiresAuth: true
    },

    children: [
      {
        path: 'mensal',
        name: 'dashboard-mensal',
        component: Mensal
      },

      {
        path: 'estoque',
        name: 'dashboard-estoque',
        component: Estoque
      },

      {
        path: 'cadastrarEPI',
        name: 'dashboard-cadastrar-epi',
        component: CadastrarEPI
      },

      {
        path: 'lancamentos',
        name: 'dashboard-lancamentos',
        component: Lancamentos
      },

      {
        path: 'retirarEPI',
        name: 'dashboard-retirar-epi',
        component: RetirarEPI
      },

      {
        path: 'historico',
        name: 'dashboard-historico',
        component: Historico
      },

      /*
        Rota do próprio perfil.

        Ao acessar /dashboard/perfil,
        o sistema encontra o e-mail da sessão
        e redireciona para o perfil do usuário.
      */
      {
        path: 'perfil',
        name: 'dashboard-meu-perfil',

        beforeEnter: async () => {
          try {
            const {
              data,
              error
            } = await supabase.auth.getSession()

            if (error) {
              throw error
            }

            const email =
              data.session?.user?.email

            if (!email) {
              return {
                name: 'login',

                query: {
                  redirect: '/dashboard/perfil'
                }
              }
            }

            return {
              name: 'dashboard-perfil-equipe',

              params: {
                email
              }
            }
          } catch (error) {
            console.error(
              'Erro ao abrir o perfil:',
              error
            )

            return {
              name: 'login',

              query: {
                redirect: '/dashboard/perfil'
              }
            }
          }
        }
      },

      /*
        Perfil de um integrante da equipe.

        Exemplo:
        /dashboard/equipe/usuario@email.com
      */
      {
        path: 'equipe/:email',
        name: 'dashboard-perfil-equipe',
        component: Perfil,
        props: true
      }
    ]
  },

  /*
    URL antiga de perfil.

    Exemplo:
    /perfil/usuario@email.com

    Será redirecionada para:
    /dashboard/equipe/usuario@email.com
  */
  {
    path: '/perfil/:email',

    redirect: to => ({
      name: 'dashboard-perfil-equipe',

      params: {
        email: to.params.email
      }
    })
  },

  /*
    URL antiga de equipe.
  */
  {
    path: '/equipe/:email',

    redirect: to => ({
      name: 'dashboard-perfil-equipe',

      params: {
        email: to.params.email
      }
    })
  },

  /*
    Qualquer endereço inexistente
    volta para a página inicial.
  */
  {
    path: '/:pathMatch(.*)*',
    redirect: {
      name: 'login'
    }
  }
]

const router = createRouter({
  history: createWebHistory(),

  routes,

  scrollBehavior(
    to,
    from,
    savedPosition
  ) {
    if (savedPosition) {
      return savedPosition
    }

    if (to.hash) {
      const headerOffset = 88

      const element =
        document.querySelector(to.hash)

      if (element) {
        const top =
          element
            .getBoundingClientRect()
            .top +
          window.pageYOffset -
          headerOffset

        return {
          left: 0,
          top: Math.max(top, 0),
          behavior: 'smooth'
        }
      }

      return {
        el: to.hash,
        behavior: 'smooth'
      }
    }

    return {
      top: 0
    }
  }
})

/*
  Proteção das rotas privadas.
*/
router.beforeEach(async to => {
  const requiresAuth =
    to.matched.some(
      route =>
        route.meta.requiresAuth
    )

  /*
    Se a rota não exige autenticação,
    permite o acesso normalmente.
  */
  if (!requiresAuth) {
    return true
  }

  try {
    const {
      data,
      error
    } = await supabase.auth.getSession()

    if (error) {
      throw error
    }

    /*
      Se não houver sessão, envia para login.
  */
    if (!data.session) {
      return {
        name: 'login',

        query: {
          redirect: to.fullPath
        }
      }
    }

    return true
  } catch (error) {
    console.error(
      'Erro ao verificar sessão:',
      error
    )

    return {
      name: 'login',

      query: {
        redirect: to.fullPath
      }
    }
  }
})

export default router
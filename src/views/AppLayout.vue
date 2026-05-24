<template>

    <div class="shell">
        <!-- ── SIDEBAR: menu lateral fixo ── -->
        <aside class="sidebar">
            <nav>
                <RouterLink to="/funcionarios">e
                    Funcionários</RouterLink>
                <RouterLink to="/entregas">Ô Entregas de EPI</RouterLink>

                <button @click="sair">Sair</button>
            </nav>
        </aside>
        <!-- ── CONTEÚDO: cada rota filho carrega aqui ── -->
        <main>
            <RouterView />
        </main>
    </div>

</template>

<script setup>
import { useSupabase } from '@/composables/useSupabase'
import { useRouter } from 'vue-router'
const { supabase } = useSupabase()
const router = useRouter()
async function sair() {
    await supabase.auth.signOut()
    router.push('/login')
}

const routes = [ // Rota pública — sem sidebar
    { path: '/login', component: LoginView },
    {
        path: '/', component: AppLayout, // esqueleto com sidebar
        children: [ // ↓ filhos aparecem DENTRO do AppLayout
            { path: 'dashboard', component: DashboardView },
            { path: 'funcionarios', component: FuncionariosView },
            { path: 'entregas', component: EntregasView },
        ]
    }]
// ── NAVIGATION GUARD: bloqueia quem não está logado ──
router.beforeEach(async (to) => {
    const { data } = await
        supabase.auth.getSession()
    // Se não há sessão E a rota não é /login → redireciona
    if (!data.session && to.path !== '/login') { return '/login' }
})

</script>

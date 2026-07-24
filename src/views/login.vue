<template>
  <section class="login-page">
    <div class="login-card">
      <p class="eyebrow">Confirmação · 2026</p>

      <h1>Bem-vindo(a) de volta</h1>

      <p class="login-subtitle">
        Entre com seu e-mail e senha para acessar o controle de
        recebíveis.
      </p>

      <form class="login-form" @submit.prevent="fazerLogin">
        <label class="field">
          <span>E-mail</span>

          <input
            id="email"
            v-model.trim="email"
            type="email"
            placeholder="seunome@confirmahub.com.br"
            autocomplete="username"
            required
          />
        </label>

        <label class="field">
          <span>Senha</span>

          <input
            id="senha"
            v-model="senha"
            type="password"
            placeholder="Digite sua senha"
            autocomplete="current-password"
            required
          />
        </label>

        <div class="password-options">
          <RouterLink to="/esqueci-senha">
            Esqueci minha senha
          </RouterLink>
        </div>

        <p v-if="sucesso" class="success-banner">
          {{ sucesso }}
        </p>

        <p v-if="erro" class="error-banner">
          {{ erro }}
        </p>

        <button
          type="submit"
          class="btn btn--primary"
          :disabled="carregando"
        >
          <span v-if="carregando">Entrando…</span>
          <span v-else>Entrar</span>
        </button>
      </form>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSupabase } from '../composables/useSupabase'

const { supabase } = useSupabase()

const router = useRouter()
const route = useRoute()

const email = ref('')
const senha = ref('')
const erro = ref('')

const sucesso = ref(
  route.query.senhaAlterada === 'true'
    ? 'Senha alterada com sucesso. Entre usando sua nova senha.'
    : ''
)

const carregando = ref(false)

async function fazerLogin() {
  erro.value = ''
  sucesso.value = ''

  if (!email.value || !senha.value) {
    erro.value = 'Por favor, preencha todos os campos.'
    return
  }

  carregando.value = true

  try {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: senha.value
    })

    if (error) {
      console.error('Erro retornado pelo Supabase:', error)
      erro.value = 'E-mail ou senha incorretos. Tente novamente.'
      return
    }

    const destino =
      typeof route.query.redirect === 'string' &&
      route.query.redirect.startsWith('/')
        ? route.query.redirect
        : '/dashboard'

    await router.replace(destino)
  } catch (error) {
    console.error('Erro inesperado ao fazer login:', error)
    erro.value = 'Erro ao fazer login. Tente novamente mais tarde.'
  } finally {
    carregando.value = false
  }
}
</script>

<style scoped>
.login-page {
  --ink: #0a1510;
  --panel: #101d16;
  --line: rgba(255, 255, 255, 0.08);
  --paper: #eef4ee;
  --paper-dim: rgba(238, 244, 238, 0.62);
  --jade: #6fe3a0;
  --bad: #ff9797;

  min-height: 100svh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: clamp(1rem, 4vw, 1.5rem);
  box-sizing: border-box;
  font-family: 'Inter', system-ui, sans-serif;
  color: var(--paper);
  background:
    radial-gradient(circle at 15% 10%, rgba(111, 227, 160, 0.08), transparent 45%),
    radial-gradient(circle at 85% 90%, rgba(127, 182, 227, 0.06), transparent 45%),
    var(--ink);
}

.login-card {
  width: min(100%, 400px);
  padding: clamp(1.5rem, 5vw, 2.5rem) clamp(1.2rem, 5vw, 2.25rem);
  border: 1px solid var(--line);
  border-radius: 1.1rem;
  background: var(--panel);
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.35);
}

.eyebrow {
  margin: 0 0 0.5rem;
  color: var(--jade);
  font-size: 0.76rem;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.login-card h1 {
  margin: 0;
  font-family: 'Space Grotesk', 'Inter', sans-serif;
  font-size: clamp(1.35rem, 6vw, 1.55rem);
  font-weight: 600;
  letter-spacing: -0.01em;
}

.login-subtitle {
  margin: 0.6rem 0 1.75rem;
  color: var(--paper-dim);
  font-size: 0.9rem;
  line-height: 1.5;
}

.login-form {
  display: grid;
  gap: 1.1rem;
}

.field {
  display: grid;
  gap: 0.4rem;
  color: var(--paper-dim);
  font-size: 0.85rem;
}

.field input {
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
  padding: 0.75rem 0.9rem;
  border: 1px solid var(--line);
  border-radius: 0.6rem;
  background: rgba(255, 255, 255, 0.04);
  color: var(--paper);
  font-family: inherit;
  font-size: 16px;
}

.field input:focus {
  outline: 2px solid var(--jade);
  outline-offset: 1px;
}

.password-options {
  display: flex;
  justify-content: center;
  width: 100%;
  margin-top: -0.5rem;
  text-align: center;
}

.password-options a {
  color: var(--jade);
  font-size: 0.8rem;
  font-weight: 600;
  text-decoration: none;
}

.password-options a:hover {
  text-decoration: underline;
}

.error-banner,
.success-banner {
  margin: 0;
  padding: 0.75rem 0.9rem;
  border-radius: 0.6rem;
  font-size: 0.85rem;
  line-height: 1.5;
}

.error-banner {
  border: 1px solid rgba(255, 148, 148, 0.35);
  background: rgba(255, 148, 148, 0.1);
  color: var(--bad);
}

.success-banner {
  border: 1px solid rgba(111, 227, 160, 0.35);
  background: rgba(111, 227, 160, 0.1);
  color: var(--jade);
}

.btn {
  width: 100%;
  min-height: 46px;
  border: none;
  border-radius: 0.7rem;
  padding: 0.85rem 1.1rem;
  font-family: 'Inter', sans-serif;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  transition: filter 0.12s ease, transform 0.12s ease;
}

.btn:active {
  transform: translateY(1px);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn--primary {
  background: linear-gradient(135deg, #7bf0a6, #2fa85e);
  color: #05170c;
}

.btn--primary:hover:not(:disabled) {
  filter: brightness(1.06);
}

@media (max-width: 380px) {
  .login-page {
    padding: 0.75rem;
  }

  .login-card {
    padding: 1.35rem 1rem;
    border-radius: 0.9rem;
  }

  .eyebrow {
    font-size: 0.68rem;
  }

  .login-subtitle {
    font-size: 0.84rem;
  }
}

@media (max-height: 650px) {
  .login-page {
    align-items: flex-start;
    overflow-y: auto;
  }
}
</style>

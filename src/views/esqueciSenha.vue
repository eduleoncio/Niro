<template>
  <section class="auth-page">
    <div class="auth-card">
      <p class="eyebrow">
        Recuperação de acesso
      </p>

      <h1>Esqueceu sua senha?</h1>

      <p class="auth-subtitle">
        Informe o e-mail utilizado no sistema.
        Enviaremos um link para você criar uma nova senha.
      </p>

      <form
        v-if="!emailEnviado"
        class="auth-form"
        @submit.prevent="enviarEmail"
      >
        <label class="field">
          <span>E-mail</span>

          <input
            v-model.trim="email"
            type="email"
            placeholder="seunome@confirmahub.com.br"
            autocomplete="email"
            required
          />
        </label>

        <p
          v-if="erro"
          class="message message--error"
        >
          {{ erro }}
        </p>

        <button
          type="submit"
          class="btn btn--primary"
          :disabled="carregando"
        >
          <span v-if="carregando">
            Enviando…
          </span>

          <span v-else>
            Enviar link de recuperação
          </span>
        </button>

        <RouterLink
          class="back-link"
          to="/login"
        >
          ← Voltar para o login
        </RouterLink>
      </form>

      <div
        v-else
        class="success-content"
      >
        <p class="message message--success">
          Caso exista uma conta associada ao e-mail
          <strong>{{ email }}</strong>, você receberá um link
          para alterar sua senha.
        </p>

        <p class="help-text">
          Verifique também a caixa de spam ou lixo eletrônico.
        </p>

        <button
          type="button"
          class="btn btn--ghost"
          :disabled="carregando"
          @click="reenviarEmail"
        >
          <span v-if="carregando">
            Reenviando…
          </span>

          <span v-else>
            Enviar novamente
          </span>
        </button>

        <RouterLink
          class="back-link"
          to="/login"
        >
          Voltar para o login
        </RouterLink>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'

import { useSupabase } from '../composables/useSupabase'

const { supabase } = useSupabase()

const email = ref('')
const erro = ref('')

const carregando = ref(false)
const emailEnviado = ref(false)

async function solicitarRecuperacao() {
  const redirectTo =
    `${window.location.origin}/alterar-senha`

  const {
    error
  } = await supabase.auth.resetPasswordForEmail(
    email.value,
    {
      redirectTo
    }
  )

  if (error) {
    throw error
  }
}

async function enviarEmail() {
  erro.value = ''

  if (!email.value) {
    erro.value =
      'Informe seu endereço de e-mail.'

    return
  }

  carregando.value = true

  try {
    await solicitarRecuperacao()

    emailEnviado.value = true
  } catch (error) {
    console.error(
      'Erro ao solicitar recuperação de senha:',
      error
    )

    const mensagem =
      String(error?.message || '').toLowerCase()

    if (
      mensagem.includes('rate limit') ||
      mensagem.includes('too many requests')
    ) {
      erro.value =
        'Muitas solicitações foram feitas. Aguarde alguns minutos e tente novamente.'

      return
    }

    erro.value =
      'Não foi possível enviar o e-mail de recuperação. Tente novamente.'
  } finally {
    carregando.value = false
  }
}

async function reenviarEmail() {
  erro.value = ''
  carregando.value = true

  try {
    await solicitarRecuperacao()
  } catch (error) {
    console.error(
      'Erro ao reenviar recuperação de senha:',
      error
    )

    erro.value =
      'Não foi possível reenviar o e-mail. Aguarde alguns minutos e tente novamente.'
  } finally {
    carregando.value = false
  }
}
</script>

<style scoped>
.auth-page {
  --ink: #0a1510;
  --panel: #101d16;
  --line: rgba(255, 255, 255, 0.08);
  --paper: #eef4ee;
  --paper-dim: rgba(238, 244, 238, 0.62);
  --jade: #6fe3a0;
  --bad: #ff9797;

  min-height: 100vh;

  display: flex;
  align-items: center;
  justify-content: center;

  padding: 1.5rem;
  box-sizing: border-box;

  color: var(--paper);

  font-family:
    'Inter',
    system-ui,
    sans-serif;

  background:
    radial-gradient(
      circle at 15% 10%,
      rgba(111, 227, 160, 0.08),
      transparent 45%
    ),
    radial-gradient(
      circle at 85% 90%,
      rgba(127, 182, 227, 0.06),
      transparent 45%
    ),
    var(--ink);
}

.auth-card {
  width: 100%;
  max-width: 420px;

  padding: 2.5rem 2.25rem;

  border: 1px solid var(--line);
  border-radius: 1.1rem;

  background: var(--panel);

  box-shadow:
    0 24px 60px rgba(0, 0, 0, 0.35);
}

.eyebrow {
  margin: 0 0 0.5rem;

  color: var(--jade);

  font-size: 0.76rem;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.auth-card h1 {
  margin: 0;

  font-family:
    'Space Grotesk',
    'Inter',
    sans-serif;

  font-size: 1.55rem;
  font-weight: 600;
}

.auth-subtitle {
  margin: 0.6rem 0 1.75rem;

  color: var(--paper-dim);

  font-size: 0.9rem;
  line-height: 1.5;
}

.auth-form,
.success-content {
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
  box-sizing: border-box;

  padding: 0.75rem 0.9rem;

  border: 1px solid var(--line);
  border-radius: 0.6rem;

  background: rgba(255, 255, 255, 0.04);
  color: var(--paper);

  font-family: inherit;
  font-size: 0.95rem;
}

.field input:focus {
  outline: 2px solid var(--jade);
  outline-offset: 1px;
}

.message {
  margin: 0;

  padding: 0.8rem 0.9rem;

  border-radius: 0.6rem;

  font-size: 0.85rem;
  line-height: 1.5;
}

.message--error {
  border:
    1px solid rgba(255, 148, 148, 0.35);

  background:
    rgba(255, 148, 148, 0.1);

  color: var(--bad);
}

.message--success {
  border:
    1px solid rgba(111, 227, 160, 0.35);

  background:
    rgba(111, 227, 160, 0.1);

  color: var(--jade);
}

.help-text {
  margin: 0;

  color: var(--paper-dim);

  font-size: 0.85rem;
  line-height: 1.5;
}

.btn {
  width: 100%;

  border: none;
  border-radius: 0.7rem;

  padding: 0.85rem 1.1rem;

  box-sizing: border-box;

  font-family: inherit;
  font-size: 0.95rem;
  font-weight: 700;

  cursor: pointer;

  transition:
    filter 0.12s ease,
    transform 0.12s ease;
}

.btn:active {
  transform: translateY(1px);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn--primary {
  background:
    linear-gradient(
      135deg,
      #7bf0a6,
      #2fa85e
    );

  color: #05170c;
}

.btn--primary:hover:not(:disabled) {
  filter: brightness(1.06);
}

.btn--ghost {
  border: 1px solid var(--line);

  background: rgba(255, 255, 255, 0.05);
  color: var(--paper);
}

.btn--ghost:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.09);
}

.back-link {
  color: var(--paper-dim);

  font-size: 0.85rem;
  text-align: center;
  text-decoration: none;
}

.back-link:hover {
  color: var(--jade);
}

@media (max-width: 480px) {
  .auth-card {
    padding: 2rem 1.5rem;
  }
}
</style>
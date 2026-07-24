<template>
  <section class="auth-page">
    <div class="auth-card">
      <p class="eyebrow">
        Segurança da conta
      </p>

      <div v-if="verificandoLink">
        <h1>Verificando link…</h1>

        <p class="auth-subtitle">
          Aguarde enquanto validamos sua solicitação.
        </p>

        <div class="loading-container">
          <span class="loading-spinner"></span>
        </div>
      </div>

      <div v-else-if="linkInvalido">
        <h1>Link inválido ou expirado</h1>

        <p class="auth-subtitle">
          O link de recuperação não é válido, já expirou
          ou já foi utilizado.
        </p>

        <p
          v-if="erro"
          class="message message--error"
        >
          {{ erro }}
        </p>

        <RouterLink
          class="btn btn--primary router-button"
          to="/esqueci-senha"
        >
          Solicitar novo link
        </RouterLink>

        <RouterLink
          class="back-link"
          to="/login"
        >
          Voltar para o login
        </RouterLink>
      </div>

      <div v-else-if="senhaAlterada">
        <h1>Senha alterada</h1>

        <p class="message message--success">
          Sua senha foi atualizada com sucesso.
          Agora você já pode entrar usando sua nova senha.
        </p>

        <RouterLink
          class="btn btn--primary router-button"
          :to="{
            name: 'login',
            query: {
              senhaAlterada: 'true'
            }
          }"
        >
          Entrar com a nova senha
        </RouterLink>
      </div>

      <template v-else>
        <h1>Crie uma nova senha</h1>

        <p class="auth-subtitle">
          Escolha uma senha segura para acessar novamente
          sua conta.
        </p>

        <form
          class="auth-form"
          @submit.prevent="alterarSenha"
        >
          <label class="field">
            <span>Nova senha</span>

            <div class="password-field">
              <input
                v-model="novaSenha"
                :type="mostrarSenha ? 'text' : 'password'"
                placeholder="Digite a nova senha"
                autocomplete="new-password"
                minlength="8"
                required
              />

              <button
                type="button"
                class="show-password"
                @click="mostrarSenha = !mostrarSenha"
              >
                {{ mostrarSenha ? 'Ocultar' : 'Mostrar' }}
              </button>
            </div>
          </label>

          <label class="field">
            <span>Confirmar nova senha</span>

            <input
              v-model="confirmacaoSenha"
              :type="mostrarSenha ? 'text' : 'password'"
              placeholder="Digite a senha novamente"
              autocomplete="new-password"
              minlength="8"
              required
            />
          </label>

          <div class="password-requirements">
            <span
              :class="{
                valid: validacoes.tamanho
              }"
            >
              {{ validacoes.tamanho ? '✓' : '•' }}
              Pelo menos 8 caracteres
            </span>

            <span
              :class="{
                valid: validacoes.letra
              }"
            >
              {{ validacoes.letra ? '✓' : '•' }}
              Pelo menos uma letra
            </span>

            <span
              :class="{
                valid: validacoes.numero
              }"
            >
              {{ validacoes.numero ? '✓' : '•' }}
              Pelo menos um número
            </span>

            <span
              :class="{
                valid: validacoes.iguais
              }"
            >
              {{ validacoes.iguais ? '✓' : '•' }}
              As duas senhas são iguais
            </span>
          </div>

          <p
            v-if="erro"
            class="message message--error"
          >
            {{ erro }}
          </p>

          <button
            type="submit"
            class="btn btn--primary"
            :disabled="
              carregando ||
              !formularioValido
            "
          >
            <span v-if="carregando">
              Alterando…
            </span>

            <span v-else>
              Alterar senha
            </span>
          </button>
        </form>
      </template>
    </div>
  </section>
</template>

<script setup>
import {
  computed,
  onBeforeUnmount,
  onMounted,
  ref
} from 'vue'

import { useRouter } from 'vue-router'

import { useSupabase } from '../composables/useSupabase'

const { supabase } = useSupabase()

const router = useRouter()

const novaSenha = ref('')
const confirmacaoSenha = ref('')

const erro = ref('')

const carregando = ref(false)
const verificandoLink = ref(true)
const linkInvalido = ref(false)
const senhaAlterada = ref(false)
const mostrarSenha = ref(false)

let authSubscription = null
let verificationTimeout = null
let redirectTimeout = null

const validacoes = computed(() => {
  return {
    tamanho:
      novaSenha.value.length >= 8,

    letra:
      /[A-Za-zÀ-ÿ]/.test(
        novaSenha.value
      ),

    numero:
      /\d/.test(
        novaSenha.value
      ),

    iguais:
      novaSenha.value.length > 0 &&
      novaSenha.value ===
        confirmacaoSenha.value
  }
})

const formularioValido = computed(() => {
  return (
    validacoes.value.tamanho &&
    validacoes.value.letra &&
    validacoes.value.numero &&
    validacoes.value.iguais
  )
})

function obterErroDaURL() {
  const queryParams =
    new URLSearchParams(
      window.location.search
    )

  const hashParams =
    new URLSearchParams(
      window.location.hash.replace(
        /^#/,
        ''
      )
    )

  return (
    queryParams.get('error_description') ||
    hashParams.get('error_description') ||
    queryParams.get('error') ||
    hashParams.get('error')
  )
}

function urlPossuiDadosDeAutenticacao() {
  const queryParams =
    new URLSearchParams(
      window.location.search
    )

  const hashParams =
    new URLSearchParams(
      window.location.hash.replace(
        /^#/,
        ''
      )
    )

  return (
    queryParams.has('code') ||
    queryParams.has('token_hash') ||
    hashParams.has('access_token') ||
    hashParams.get('type') === 'recovery'
  )
}

function liberarFormulario() {
  if (verificationTimeout) {
    window.clearTimeout(
      verificationTimeout
    )
  }

  verificandoLink.value = false
  linkInvalido.value = false
  erro.value = ''
}

function mostrarLinkInvalido(
  mensagem =
    'Não encontramos uma sessão válida para alterar a senha.'
) {
  if (verificationTimeout) {
    window.clearTimeout(
      verificationTimeout
    )
  }

  verificandoLink.value = false
  linkInvalido.value = true
  erro.value = mensagem
}

async function verificarSessaoDeRecuperacao() {
  verificandoLink.value = true
  linkInvalido.value = false
  erro.value = ''

  const erroDaURL =
    obterErroDaURL()

  if (erroDaURL) {
    mostrarLinkInvalido(
      decodeURIComponent(
        erroDaURL.replace(/\+/g, ' ')
      )
    )

    return
  }

  try {
    const {
      data,
      error
    } = await supabase.auth.getSession()

    if (error) {
      throw error
    }

    if (data.session) {
      liberarFormulario()
      return
    }

    if (!urlPossuiDadosDeAutenticacao()) {
      mostrarLinkInvalido(
        'Abra esta página pelo link enviado ao seu e-mail.'
      )

      return
    }

    /*
      O Supabase pode precisar de alguns instantes
      para processar o código que chegou pela URL.
      O listener de autenticação liberará a tela
      assim que a sessão for criada.
    */
    verificationTimeout =
      window.setTimeout(
        async () => {
          try {
            const {
              data: sessionData
            } = await supabase.auth.getSession()

            if (sessionData.session) {
              liberarFormulario()
              return
            }

            mostrarLinkInvalido(
              'O link expirou ou já foi utilizado. Solicite um novo link.'
            )
          } catch (error) {
            console.error(
              'Erro ao verificar sessão após o redirecionamento:',
              error
            )

            mostrarLinkInvalido()
          }
        },
        4000
      )
  } catch (error) {
    console.error(
      'Erro ao validar link de recuperação:',
      error
    )

    mostrarLinkInvalido(
      'Não foi possível validar o link de recuperação.'
    )
  }
}

async function alterarSenha() {
  erro.value = ''

  if (!formularioValido.value) {
    erro.value =
      'Confira os requisitos da senha e tente novamente.'

    return
  }

  carregando.value = true

  try {
    const {
      data: sessionData,
      error: sessionError
    } = await supabase.auth.getSession()

    if (
      sessionError ||
      !sessionData.session
    ) {
      mostrarLinkInvalido(
        'Sua sessão de recuperação expirou. Solicite um novo link.'
      )

      return
    }

    const {
      error
    } = await supabase.auth.updateUser({
      password: novaSenha.value
    })

    if (error) {
      console.error(
        'Erro retornado ao alterar senha:',
        error
      )

      const mensagem =
        String(error.message || '')
          .toLowerCase()

      if (
        mensagem.includes('same password') ||
        mensagem.includes('different from the old password')
      ) {
        erro.value =
          'A nova senha precisa ser diferente da senha atual.'

        return
      }

      if (
        mensagem.includes('weak password') ||
        mensagem.includes('password should be')
      ) {
        erro.value =
          'A senha escolhida não atende aos requisitos de segurança.'

        return
      }

      erro.value =
        'Não foi possível alterar sua senha. Solicite um novo link e tente novamente.'

      return
    }

    senhaAlterada.value = true

    novaSenha.value = ''
    confirmacaoSenha.value = ''

    /*
      Encerra a sessão temporária criada pelo
      link de recuperação.
    */
    const {
      error: signOutError
    } = await supabase.auth.signOut()

    if (signOutError) {
      console.warn(
        'A senha foi alterada, mas houve erro ao encerrar a sessão:',
        signOutError
      )
    }

    /*
      Remove tokens ou códigos de autenticação da URL.
    */
    window.history.replaceState(
      {},
      document.title,
      '/alterar-senha'
    )

    redirectTimeout =
      window.setTimeout(
        async () => {
          await router.replace({
            name: 'login',
            query: {
              senhaAlterada: 'true'
            }
          })
        },
        2000
      )
  } catch (error) {
    console.error(
      'Erro inesperado ao alterar senha:',
      error
    )

    erro.value =
      'Ocorreu um erro inesperado. Tente novamente.'
  } finally {
    carregando.value = false
  }
}

onMounted(async () => {
  const {
    data
  } = supabase.auth.onAuthStateChange(
    (event, newSession) => {
      console.log(
        'Evento na recuperação de senha:',
        event
      )

      if (
        newSession &&
        (
          event === 'PASSWORD_RECOVERY' ||
          event === 'SIGNED_IN' ||
          event === 'INITIAL_SESSION'
        )
      ) {
        liberarFormulario()
      }
    }
  )

  authSubscription =
    data.subscription

  await verificarSessaoDeRecuperacao()
})

onBeforeUnmount(() => {
  authSubscription?.unsubscribe()

  if (verificationTimeout) {
    window.clearTimeout(
      verificationTimeout
    )
  }

  if (redirectTimeout) {
    window.clearTimeout(
      redirectTimeout
    )
  }
})
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

.auth-form {
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

.password-field {
  position: relative;
}

.password-field input {
  padding-right: 5.2rem;
}

.show-password {
  position: absolute;
  top: 50%;
  right: 0.8rem;

  padding: 0;

  border: none;

  background: transparent;
  color: var(--jade);

  font-family: inherit;
  font-size: 0.78rem;
  font-weight: 700;

  cursor: pointer;

  transform: translateY(-50%);
}

.password-requirements {
  display: grid;
  gap: 0.35rem;

  color: var(--paper-dim);

  font-size: 0.78rem;
}

.password-requirements span {
  transition: color 0.15s ease;
}

.password-requirements .valid {
  color: var(--jade);
}

.message {
  margin: 1rem 0;

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

.btn {
  width: 100%;
  box-sizing: border-box;

  border: none;
  border-radius: 0.7rem;

  padding: 0.85rem 1.1rem;

  font-family: inherit;
  font-size: 0.95rem;
  font-weight: 700;

  cursor: pointer;
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

.router-button {
  display: flex;
  align-items: center;
  justify-content: center;

  margin-top: 1rem;

  text-decoration: none;
}

.back-link {
  display: block;

  margin-top: 1rem;

  color: var(--paper-dim);

  font-size: 0.85rem;
  text-align: center;
  text-decoration: none;
}

.back-link:hover {
  color: var(--jade);
}

.loading-container {
  display: flex;
  justify-content: center;

  padding: 1rem;
}

.loading-spinner {
  width: 2rem;
  height: 2rem;

  border:
    3px solid rgba(111, 227, 160, 0.2);

  border-top-color: var(--jade);
  border-radius: 50%;

  animation:
    spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 480px) {
  .auth-card {
    padding: 2rem 1.5rem;
  }
}
</style>
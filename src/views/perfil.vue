<template>
  <main class="perfil-page">
    <section class="perfil-card">
      <div class="perfil-card__header">
        <div class="perfil-card__avatar">{{ initials(profile.nome || profile.email || 'U') }}</div>
        <div class="perfil-card__header-info">
          <span class="perfil-card__section">Perfil</span>
          <h1 class="perfil-card__name">{{ profile.nome || 'Usuário' }}</h1>
          <p class="perfil-card__role">{{ profile.cargo || 'Sem cargo definido' }}</p>
        </div>
      </div>

      <div v-if="loading" class="perfil-loading">Carregando perfil...</div>

      <div v-else class="perfil-card__fields">
        <div class="perfil-field">
          <label>Nome</label>
          <input readonly v-model="profile.nome" placeholder="Informe seu nome" />
        </div>
        <div class="perfil-field">
          <label>Setor</label>
          <input readonly v-model="profile.setor" placeholder="Informe seu setor" />
        </div>
        <div class="perfil-field">
          <label>Cargo</label>
          <input readonly v-model="profile.cargo" placeholder="Informe seu cargo" />
        </div>
        <div class="perfil-field">
          <label>ID</label>
          <input readonly :value="profile.codigo || 'Não definido'" />
        </div>
        <div class="perfil-field">
          <label>Telefone</label>
          <input readonly v-model="profile.telefone" placeholder="(xx) xxxxx-xxxx" />
        </div>
        <div class="perfil-field">
          <label>Data de Nascimento</label>
          <input readonly v-model="profile.data_nascimento" type="date" />
        </div>
        <div class="perfil-field">
          <label>E-mail</label>
          <input readonly v-model="profile.email" type="email" placeholder="seu@email.com" />
        </div>
      </div>

      <div class="perfil-card__message" v-if="message">{{ message }}</div>
      <div class="perfil-card__error" v-if="errorMessage">{{ errorMessage }}</div>
    </section>
  </main>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSupabase } from '../composables/useSupabase'

const { supabase } = useSupabase()
const router = useRouter()

const loading = ref(true)
const message = ref('')
const errorMessage = ref('')
const profileRow = ref(null)
const originalEmail = ref('')

const profile = reactive({
  nome: '',
  setor: '',
  cargo: '',
  codigo: '',
  telefone: '',
  data_nascimento: '',
  email: ''
})

function initials(name) {
  return String(name || '')
    .split(' ')
    .map(part => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

function setMessage(text) {
  message.value = text
  errorMessage.value = ''
}

function setError(text) {
  errorMessage.value = text
  message.value = ''
}

function fillProfile(data) {
  profile.nome = data.nome || profile.nome
  profile.setor = data.setor || profile.setor
  profile.cargo = data.cargo || profile.cargo
  profile.codigo = data.matricula || data.codigo_funcionario || data.id || profile.codigo
  profile.telefone = data.telefone || profile.telefone
  profile.data_nascimento = data.data_nascimento || profile.data_nascimento
  profile.email = data.email || profile.email
}

async function loadProfile() {
  loading.value = true
  setMessage('')
  setError('')

  try {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
    if (sessionError) {
      throw new Error('Não foi possível obter a sessão.')
    }

    const user = sessionData?.session?.user
    if (!user) {
      router.push('/login')
      return
    }

    profile.email = user.email || ''
    profile.nome = user.user_metadata?.name || user.user_metadata?.nome || profile.nome

    const { data, error } = await supabase
      .from('funcionarios')
      .select('*')
      .or(`auth_user_id.eq.${user.id},email.eq.${profile.email}`)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.warn('Erro ao buscar dados de funcionário:', error.message)
    }

    if (data) {
      profileRow.value = data
      originalEmail.value = data.email || profile.email
      fillProfile(profileRow.value)
    } else {
      profileRow.value = null
      setError(
        'Nenhum funcionário encontrado para este login. Configure um usuário no Auth do Supabase com o mesmo e-mail cadastrado na tabela funcionarios.'
      )
    }

    if (!profile.nome && profile.email) {
      profile.nome = profile.email.split('@')[0]
    }
  } catch (err) {
    setError(err.message || 'Erro ao carregar o perfil.')
  } finally {
    loading.value = false
  }
}

// Edit and delete operations removed; profile is read-only in the UI

onMounted(loadProfile)
</script>

<style scoped>
.perfil-page {
  min-height: auto;
  display: grid;
  place-items: center;
  align-items: center; 
  
}

.perfil-card {
  width: min(1200px, 100%);
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 32px;
  backdrop-filter: blur(20px);
  padding: 2rem;
}

.perfil-card__header {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 2rem;
  align-items: center;
  padding-bottom: 1.8rem;
  margin-bottom: 1.8rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.perfil-card__avatar {
  width: 124px;
  height: 124px;
  border-radius: 50%;
  background: linear-gradient(135deg, #2ad8b7 0%, #10a4ff 100%);
  display: grid;
  place-items: center;
  font-size: 2rem;
  font-weight: 700;
  color: #fff;
  box-shadow: 0 24px 60px rgba(13, 92, 148, 0.28);
}

.perfil-card__section {
  display: inline-flex;
  margin-bottom: 0.75rem;
  padding: 0.5rem 0.9rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.06);
  color: #b7d2e4;
  font-size: 0.82rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.perfil-card__name {
  margin: 0;
  font-size: 2.5rem;
  color: #fff;
}

.perfil-card__role {
  margin: 0.65rem 0 0;
  color: #aac1d8;
  font-size: 1rem;
}

.perfil-card__fields {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.4rem;
}

.perfil-field {
  display: grid;
  gap: 0.65rem;
}

.perfil-field label {
  color: #92a5bd;
  font-size: 0.85rem;
  letter-spacing: 0.02em;
}

.perfil-field input {
  width: 100%;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.03);
  color: #f4f7fb;
  border-radius: 18px;
  padding: 1rem 1.2rem;
  font-size: 0.98rem;
  outline: none;
}

.perfil-field input:focus {
  border-color: rgba(34, 186, 133, 0.9);
}

.perfil-card__message,
.perfil-card__error,
.perfil-loading {
  margin-top: 1.25rem;
  color: #dfeee0;
  font-size: 0.95rem;
}

.perfil-card__error {
  color: #f6b5b0;
}

.perfil-card__actions {
  margin-top: 2rem;
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.btn {
  min-width: 49.2%;
  border: none;
  border-radius: 14px;
  padding: 1rem 1.45rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease, filter 0.2s ease, box-shadow 0.2s ease;
}

.btn:hover {
  transform: translateY(-1px);
}

.btn-edit {
  background: #0679c5;
  color: #f4f7fb;
}

.btn-cancel {
  background: #53697d;
  color: #f4f7fb;
}

.btn-delete {
  background: #c72e39;
  color: #ffffff;
}

@media (max-width: 900px) {
  .perfil-card {
    padding: 2rem;
  }

  .perfil-card__header {
    grid-template-columns: 1fr;
    text-align: center;
  }

  .perfil-card__avatar {
    margin: 0 auto;
  }

  .perfil-card__fields {
    grid-template-columns: 1fr;
  }

  .perfil-card__actions {
    justify-content: center;
  }
}
</style>

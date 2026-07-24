<template>
  <section class="perfil-page">
    <!-- Verificação de sessão -->
    <div v-if="checkingSession" class="access-gate">
      <span class="loading-spinner"></span>

      <div>
        <p class="eyebrow">Perfil</p>
        <h2>Verificando sua sessão...</h2>
      </div>
    </div>

    <!-- Usuário deslogado -->
    <div v-else-if="!activeSession" class="access-gate">
      <p class="eyebrow">Acesso restrito</p>

      <h2>
        Você precisa estar logado para ver esta página.
      </h2>

      <RouterLink class="btn btn--primary" to="/login">
        Ir para o login
      </RouterLink>
    </div>

    <!-- Usuário autenticado -->
    <template v-else>
      <p v-if="loadError" class="message message--error">
        {{ loadError }}
      </p>

      <p v-if="successMessage" class="message message--success">
        {{ successMessage }}
      </p>

      <div v-if="loading" class="loading-card">
        <span class="loading-spinner"></span>

        <div>
          <strong>Carregando perfil...</strong>

          <p>
            Aguarde enquanto buscamos os dados da pessoa.
          </p>
        </div>
      </div>

      <template v-else-if="pessoa">
        <!-- Capa -->
        <div class="cover" :style="coverStyle">
          <div class="cover-overlay"></div>

          <div v-if="podeEditar && editando" class="cover-image-actions">
            <button v-if="podeEditar" type="button" class="cover-action-button cover-edit-button"
              :disabled="uploadingCover" aria-label="Alterar foto de capa" title="Alterar foto de capa"
              @click.stop="abrirSeletorCapa">
              <span v-if="uploadingCover" class="button-spinner"></span>

              <svg v-else viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M9 4.5 10.3 3h3.4L15 4.5h3A2.5 2.5 0 0 1 20.5 7v10A2.5 2.5 0 0 1 18 19.5H6A2.5 2.5 0 0 1 3.5 17V7A2.5 2.5 0 0 1 6 4.5h3Zm3 3A4.5 4.5 0 1 0 12 16.5 4.5 4.5 0 0 0 12 7.5Zm0 2A2.5 2.5 0 1 1 12 14.5 2.5 2.5 0 0 1 12 9.5Z" />
              </svg>
            </button>

            <button v-if="pessoa.cover_url" type="button" class="modern-image-button modern-image-button--danger"
              :disabled="uploadingCover" title="Remover foto de capa" aria-label="Remover foto de capa"
              @click="removerImagem('cover')">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M9 3h6l1 2h4v2H4V5h4l1-2Zm-2 6h10l-.7 11H7.7L7 9Zm3 2v7h2v-7h-2Zm4 0v7h2v-7h-2Z" />
              </svg>
            </button>
          </div>

          <input ref="coverInput" class="file-input" type="file" accept="image/jpeg,image/png,image/webp"
            @change="selecionarCapa" />
        </div>

        <!-- Cabeçalho -->
        <header class="perfil-header">
          <div class="avatar-wrapper">
            <div class="perfil-header__avatar" :style="avatarStyle">
              <img v-if="pessoa.avatar_url" :src="pessoa.avatar_url" :alt="`Foto de ${pessoa.name}`" />

              <span v-else>
                {{ initials(pessoa.name) }}
              </span>
            </div>

            <button v-if="podeEditar && editando" type="button" class="avatar-edit-button" :disabled="uploadingAvatar"
              aria-label="Alterar foto de perfil" title="Alterar foto de perfil" @click.stop="abrirSeletorAvatar">
              <span v-if="uploadingAvatar" class="button-spinner"></span>

              <svg v-else viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M9 4.5 10.3 3h3.4L15 4.5h3A2.5 2.5 0 0 1 20.5 7v10A2.5 2.5 0 0 1 18 19.5H6A2.5 2.5 0 0 1 3.5 17V7A2.5 2.5 0 0 1 6 4.5h3Zm3 3A4.5 4.5 0 1 0 12 16.5 4.5 4.5 0 0 0 12 7.5Zm0 2A2.5 2.5 0 1 1 12 14.5 2.5 2.5 0 0 1 12 9.5Z" />
              </svg>
            </button>

            <input ref="avatarInput" class="file-input" type="file" accept="image/jpeg,image/png,image/webp"
              @change="selecionarAvatar" />
          </div>

          <div class="perfil-header__info">
            <h1>{{ pessoa.name }}</h1>

            <div class="profile-tags">
              <span class="tag" :class="pessoa.role === 'gerencia'
                ? 'tag--steel'
                : 'tag--jade'
                ">
                {{
                  pessoa.role === 'gerencia'
                    ? 'Gerência'
                    : 'Confirmação'
                }}
              </span>

              <span v-if="pessoa.job_title" class="tag tag--neutral">
                {{ pessoa.job_title }}
              </span>

              <span v-if="pessoa.is_supervisor" class="tag tag--brass">
                Supervisão
              </span>
            </div>
          </div>

          <div class="header-actions">
            <button v-if="podeEditar && !editando" type="button" class="btn btn--primary" @click="iniciarEdicao">
              Editar perfil
            </button>

            <button v-if="podeEditar && editando && pessoa.avatar_url" type="button" class="btn btn--danger-soft"
              :disabled="uploadingAvatar" @click="removerImagem('avatar')">
              Remover foto
            </button>

            <RouterLink v-if="!podeEditar" class="btn btn--ghost" to="/dashboard/historico">
              ← Voltar
            </RouterLink>
          </div>
        </header>

        <!-- Formulário de edição -->
        <section v-if="editando && podeEditar" class="edit-card">
          <header class="edit-card__header">
            <div>
              <p class="eyebrow">Configurações</p>
              <h2>Editar perfil</h2>

              <p>
                Atualize as informações que serão exibidas
                no seu perfil.
              </p>
            </div>

            <button type="button" class="close-button" aria-label="Fechar edição" @click="cancelarEdicao">
              ×
            </button>
          </header>

          <form class="edit-form" @submit.prevent="salvarPerfil">
            <div class="form-grid">
              <label class="field">
                <span>Nome completo</span>

                <input v-model.trim="form.name" type="text" maxlength="100" placeholder="Seu nome completo" required />
              </label>

              <label class="field">
                <span>WhatsApp</span>

                <input v-model="form.whatsapp" type="tel" maxlength="20" placeholder="(00) 00000-0000"
                  @input="formatarWhatsapp" />
              </label>

              <label class="field">
                <span>Cargo ou função</span>

                <input v-model.trim="form.job_title" type="text" maxlength="80"
                  placeholder="Ex.: Analista de confirmação" />
              </label>

              <label class="field">
                <span>Cidade</span>

                <input v-model.trim="form.city" type="text" maxlength="80" placeholder="Ex.: Campinas - SP" />
              </label>

              <label class="field field--full">
                <span>LinkedIn</span>

                <input v-model.trim="form.linkedin_url" type="url" maxlength="255"
                  placeholder="https://www.linkedin.com/in/seu-perfil" />
              </label>

              <label class="field field--full">
                <span>Biografia</span>

                <textarea v-model.trim="form.bio" rows="5" maxlength="500"
                  placeholder="Conte um pouco sobre você, sua função e suas responsabilidades."></textarea>

                <small>
                  {{ form.bio.length }}/500 caracteres
                </small>
              </label>
            </div>

            <p v-if="editError" class="message message--error">
              {{ editError }}
            </p>

            <div class="form-actions">
              <button type="button" class="btn btn--ghost" :disabled="saving" @click="cancelarEdicao">
                Cancelar
              </button>

              <button type="submit" class="btn btn--primary" :disabled="saving">
                {{
                  saving
                    ? 'Salvando...'
                    : 'Salvar alterações'
                }}
              </button>
            </div>
          </form>
        </section>

        <!-- Informações e histórico -->
        <section class="perfil-grid">
          <aside class="perfil-card">
            <div class="card-title">
              <h3>Sobre</h3>

              <button v-if="podeEditar && !editando" type="button" class="text-button" @click="iniciarEdicao">
                Editar
              </button>
            </div>

            <p class="perfil-bio">
              {{
                pessoa.bio ||
                'Sem biografia cadastrada.'
              }}
            </p>

            <dl class="perfil-facts">
              <div>
                <dt>E-mail</dt>
                <dd>{{ pessoa.email }}</dd>
              </div>

              <div>
                <dt>WhatsApp</dt>

                <dd>
                  <a v-if="pessoa.whatsapp" :href="whatsappLink" target="_blank" rel="noopener noreferrer">
                    {{ pessoa.whatsapp }}
                  </a>

                  <span v-else>—</span>
                </dd>
              </div>

              <div>
                <dt>Cargo</dt>
                <dd>{{ pessoa.job_title || '—' }}</dd>
              </div>

              <div>
                <dt>Cidade</dt>
                <dd>{{ pessoa.city || '—' }}</dd>
              </div>

              <div>
                <dt>LinkedIn</dt>

                <dd>
                  <a v-if="pessoa.linkedin_url" :href="pessoa.linkedin_url" target="_blank" rel="noopener noreferrer">
                    Abrir perfil
                  </a>

                  <span v-else>—</span>
                </dd>
              </div>

              <div>
                <dt>Carteiras</dt>

                <dd>
                  {{
                    carteirasDoPerfil.length
                      ? carteirasDoPerfil.join(', ')
                      : pessoa.is_supervisor
                        ? 'Todas'
                        : '—'
                  }}
                </dd>
              </div>

              <div>
                <dt>No sistema desde</dt>
                <dd>{{ formatDate(pessoa.created_at) }}</dd>
              </div>
            </dl>
          </aside>

          <div class="perfil-timeline">
            <div class="timeline-header">
              <div>
                <p class="eyebrow">Histórico</p>

                <h3>
                  Lançamentos
                  ({{ itensDoPerfil.length }})
                </h3>
              </div>
            </div>

            <p v-if="itensDoPerfil.length === 0" class="info-message">
              Nenhum lançamento encontrado para esta
              pessoa ainda.
            </p>

            <article v-for="item in itensDoPerfil" :key="item.id" class="perfil-item">
              <span class="tag" :class="item.snapshot_type === 'inicio'
                ? 'tag--steel'
                : 'tag--jade'
                ">
                {{ formatDate(item.captured_at) }}
              </span>

              <div class="perfil-item__body">
                <strong>
                  {{
                    item.snapshot_type === 'inicio'
                      ? 'Início'
                      : 'Fim'
                  }}
                  da semana
                </strong>

                <small>
                  Carteira {{ item.wallet }}
                </small>
              </div>

              <div class="perfil-item__totals">
                {{
                  formatCurrency(
                    sumObject(item.fidc) +
                    sumObject(item.factor)
                  )
                }}
              </div>
            </article>
          </div>
        </section>
      </template>

      <div v-else-if="!loadError" class="access-gate">
        <p class="eyebrow">Perfil</p>
        <h2>Perfil não encontrado.</h2>

        <RouterLink class="btn btn--ghost" to="/dashboard/historico">
          ← Voltar para histórico
        </RouterLink>
      </div>
    </template>

    <!-- Editor de corte e zoom -->
    <Teleport to="body">
      <div v-if="cropModal.open" class="crop-modal-backdrop" @click.self="fecharEditorImagem">
        <section class="crop-modal" role="dialog" aria-modal="true" :aria-label="cropModal.tipo === 'avatar'
          ? 'Ajustar foto de perfil'
          : 'Ajustar foto de capa'">
          <header class="crop-modal__header">
            <div>
              <p class="eyebrow">Ajustar imagem</p>

              <h2>
                {{
                  cropModal.tipo === 'avatar'
                    ? 'Foto de perfil'
                    : 'Foto de capa'
                }}
              </h2>
            </div>

            <button type="button" class="crop-close-button" aria-label="Fechar" @click="fecharEditorImagem">
              ×
            </button>
          </header>

          <div class="crop-stage" :class="{
            'crop-stage--avatar':
              cropModal.tipo === 'avatar'
          }">
            <Cropper ref="cropperRef" class="profile-cropper" :src="cropModal.previewUrl"
              :stencil-props="cropStencilProps" :canvas="cropCanvasOptions" :resize-image="{
                touch: true,
                wheel: {
                  ratio: 0.08
                },
                adjustStencil: false
              }" :move-image="{
                touch: true,
                mouse: true
              }" image-restriction="stencil" :auto-zoom="true" :transitions="true" />
          </div>

          <p class="crop-help">
            Arraste a imagem para posicionar. Use o scroll,
            os gestos de pinça ou os controles abaixo para dar zoom.
          </p>

          <div class="crop-controls">
            <button type="button" class="crop-control-button" aria-label="Diminuir zoom" title="Diminuir zoom"
              @click="alterarZoom(0.9)">
              −
            </button>

            <button type="button" class="crop-control-button" aria-label="Aumentar zoom" title="Aumentar zoom"
              @click="alterarZoom(1.1)">
              +
            </button>

            <button type="button" class="crop-control-button crop-control-button--wide" @click="resetarCorte">
              Redefinir
            </button>
          </div>

          <p v-if="cropModal.error" class="message message--error crop-error">
            {{ cropModal.error }}
          </p>

          <footer class="crop-modal__footer">
            <button type="button" class="btn btn--ghost" :disabled="cropModal.saving" @click="fecharEditorImagem">
              Cancelar
            </button>

            <button type="button" class="btn btn--primary" :disabled="cropModal.saving" @click="salvarImagemCortada">
              {{
                cropModal.saving
                  ? 'Salvando...'
                  : 'Aplicar e salvar'
              }}
            </button>
          </footer>
        </section>
      </div>
    </Teleport>
  </section>
</template>

<script setup>
import {
  computed,
  onBeforeUnmount,
  onMounted,
  reactive,
  ref,
  watch
} from 'vue'

import { useRoute } from 'vue-router'
import { Cropper } from 'vue-advanced-cropper'
import 'vue-advanced-cropper/dist/style.css'
import { useSupabase } from '../composables/useSupabase'

const route = useRoute()

const {
  session,
  supabase
} = useSupabase()

const BUCKET = 'profile-images'
const MAX_FILE_SIZE = 5 * 1024 * 1024

const checkingSession = ref(true)
const activeSession = ref(null)

const pessoa = ref(null)
const rawItems = ref([])
const carteirasDoPerfil = ref([])

const loading = ref(false)
const saving = ref(false)

const uploadingAvatar = ref(false)
const uploadingCover = ref(false)

const editando = ref(false)

const loadError = ref('')
const editError = ref('')
const successMessage = ref('')

const avatarInput = ref(null)
const coverInput = ref(null)

function abrirSeletorAvatar() {
  if (
    uploadingAvatar.value ||
    !podeEditar.value
  ) {
    return
  }

  avatarInput.value?.click()
}

function abrirSeletorCapa() {
  if (
    uploadingCover.value ||
    !podeEditar.value
  ) {
    return
  }

  coverInput.value?.click()
}

const cropperRef = ref(null)

const cropModal = reactive({
  open: false,
  tipo: 'avatar',
  file: null,
  previewUrl: '',
  saving: false,
  error: ''
})

const cropStencilProps = computed(() => ({
  aspectRatio:
    cropModal.tipo === 'avatar'
      ? 1
      : 16 / 5,

  handlers: {},
  movable: false,
  resizable: false,

  ...(cropModal.tipo === 'avatar'
    ? {
      class: 'avatar-stencil'
    }
    : {})
}))

const cropCanvasOptions = computed(() => (
  cropModal.tipo === 'avatar'
    ? {
      width: 640,
      height: 640,
      imageSmoothingEnabled: true,
      imageSmoothingQuality: 'high'
    }
    : {
      width: 1600,
      height: 500,
      imageSmoothingEnabled: true,
      imageSmoothingQuality: 'high'
    }
))

let authSubscription = null
let successTimeout = null

const form = reactive({
  name: '',
  whatsapp: '',
  job_title: '',
  city: '',
  linkedin_url: '',
  bio: ''
})

const podeEditar = computed(() => {
  const emailLogado =
    activeSession.value?.user?.email
      ?.trim()
      .toLowerCase()

  const emailDoPerfil =
    pessoa.value?.email
      ?.trim()
      .toLowerCase()

  return Boolean(
    emailLogado &&
    emailDoPerfil &&
    emailLogado === emailDoPerfil
  )
})

const itensDoPerfil = computed(() => {
  return rawItems.value
})

const whatsappLink = computed(() => {
  const numero = String(
    pessoa.value?.whatsapp || ''
  ).replace(/\D/g, '')

  if (!numero) {
    return '#'
  }

  const numeroComPais =
    numero.startsWith('55')
      ? numero
      : `55${numero}`

  return `https://wa.me/${numeroComPais}`
})

const coverStyle = computed(() => {
  if (pessoa.value?.cover_url) {
    return {
      backgroundImage: `url("${pessoa.value.cover_url}")`
    }
  }

  return {
    background: coverGradient.value
  }
})

const avatarStyle = computed(() => {
  if (pessoa.value?.avatar_url) {
    return {
      background: '#101d16'
    }
  }

  return {
    background: avatarColor.value
  }
})

function mostrarSucesso(mensagem) {
  successMessage.value = mensagem

  if (successTimeout) {
    window.clearTimeout(successTimeout)
  }

  successTimeout = window.setTimeout(() => {
    successMessage.value = ''
  }, 4000)
}

function formatDate(value) {
  if (!value) {
    return '—'
  }

  const datePart =
    String(value).split('T')[0]

  const parts =
    datePart.split('-')

  if (parts.length !== 3) {
    return String(value)
  }

  return parts.reverse().join('/')
}

function formatCurrency(value) {
  return Number(value || 0).toLocaleString(
    'pt-BR',
    {
      style: 'currency',
      currency: 'BRL'
    }
  )
}

function sumObject(object) {
  if (!object) {
    return 0
  }

  return Object.values(object).reduce(
    (total, value) =>
      total + Number(value || 0),
    0
  )
}

function initials(name) {
  if (!name) {
    return '?'
  }

  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map(word => word[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

function hueFromEmail(email = '') {
  let hash = 0

  for (
    let index = 0;
    index < email.length;
    index++
  ) {
    hash =
      email.charCodeAt(index) +
      ((hash << 5) - hash)
  }

  return Math.abs(hash) % 360
}

const avatarColor = computed(() => {
  if (!pessoa.value) {
    return '#333333'
  }

  const hue =
    hueFromEmail(pessoa.value.email)

  return `
    linear-gradient(
      135deg,
      hsl(${hue}, 55%, 32%),
      hsl(${hue}, 55%, 20%)
    )
  `
})

const coverGradient = computed(() => {
  if (!pessoa.value) {
    return '#111111'
  }

  const hue =
    hueFromEmail(pessoa.value.email)

  return `
    linear-gradient(
      120deg,
      hsl(${hue}, 45%, 14%),
      hsl(${(hue + 40) % 360}, 45%, 10%)
    )
  `
})

function iniciarEdicao() {
  editError.value = ''

  form.name =
    pessoa.value?.name || ''

  form.whatsapp =
    pessoa.value?.whatsapp || ''

  form.job_title =
    pessoa.value?.job_title || ''

  form.city =
    pessoa.value?.city || ''

  form.linkedin_url =
    pessoa.value?.linkedin_url || ''

  form.bio =
    pessoa.value?.bio || ''

  editando.value = true
}

function cancelarEdicao() {
  editError.value = ''
  editando.value = false
}

function formatarWhatsapp(event) {
  let value =
    event.target.value.replace(/\D/g, '')

  value = value.slice(0, 11)

  if (value.length <= 2) {
    form.whatsapp =
      value ? `(${value}` : ''

    return
  }

  if (value.length <= 6) {
    form.whatsapp =
      `(${value.slice(0, 2)}) ${value.slice(2)}`

    return
  }

  if (value.length <= 10) {
    form.whatsapp =
      `(${value.slice(0, 2)}) ` +
      `${value.slice(2, 6)}-` +
      `${value.slice(6)}`

    return
  }

  form.whatsapp =
    `(${value.slice(0, 2)}) ` +
    `${value.slice(2, 7)}-` +
    `${value.slice(7)}`
}

async function salvarPerfil() {
  editError.value = ''
  successMessage.value = ''

  if (!podeEditar.value) {
    editError.value =
      'Você só pode editar o próprio perfil.'

    return
  }

  if (!form.name.trim()) {
    editError.value =
      'Informe seu nome completo.'

    return
  }

  if (
    form.linkedin_url &&
    !/^https?:\/\//i.test(form.linkedin_url)
  ) {
    editError.value =
      'Informe um endereço válido do LinkedIn.'

    return
  }

  saving.value = true

  try {
    const dadosAtualizados = {
      name: form.name.trim(),

      whatsapp:
        form.whatsapp.trim() || null,

      job_title:
        form.job_title.trim() || null,

      city:
        form.city.trim() || null,

      linkedin_url:
        form.linkedin_url.trim() || null,

      bio:
        form.bio.trim() || null,

      updated_at:
        new Date().toISOString()
    }

    const {
      data,
      error
    } = await supabase
      .from('team_access')
      .update(dadosAtualizados)
      .eq(
        'user_id',
        activeSession.value.user.id
      )
      .select()
      .single()

    if (error) {
      throw error
    }

    pessoa.value = {
      ...pessoa.value,
      ...data
    }

    editando.value = false

    mostrarSucesso(
      'Perfil atualizado com sucesso.'
    )
  } catch (error) {
    console.error(
      'Erro ao atualizar perfil:',
      error
    )

    editError.value =
      'Não foi possível salvar as alterações.'
  } finally {
    saving.value = false
  }
}

function validarImagem(file) {
  if (!file) {
    throw new Error(
      'Nenhuma imagem foi selecionada.'
    )
  }

  const tiposPermitidos = [
    'image/jpeg',
    'image/png',
    'image/webp'
  ]

  if (!tiposPermitidos.includes(file.type)) {
    throw new Error(
      'Use uma imagem JPG, PNG ou WEBP.'
    )
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error(
      'A imagem deve ter no máximo 5 MB.'
    )
  }
}

function extensaoDoArquivo(file) {
  const extensao =
    file.name
      ?.split('.')
      .pop()
      ?.toLowerCase()

  if (
    extensao &&
    ['jpg', 'jpeg', 'png', 'webp']
      .includes(extensao)
  ) {
    return extensao === 'jpeg'
      ? 'jpg'
      : extensao
  }

  if (file.type === 'image/png') {
    return 'png'
  }

  if (file.type === 'image/webp') {
    return 'webp'
  }

  return 'jpg'
}

async function enviarImagem(file, tipo) {
  validarImagem(file)

  if (!podeEditar.value) {
    throw new Error(
      'Você só pode editar o próprio perfil.'
    )
  }

  const userId =
    activeSession.value.user.id

  const extensao =
    extensaoDoArquivo(file)

  /*
    Cada upload recebe um nome diferente para evitar
    cache antigo da CDN.
  */
  const caminho =
    `${userId}/${tipo}-${Date.now()}.${extensao}`

  const {
    error: uploadError
  } = await supabase.storage
    .from(BUCKET)
    .upload(
      caminho,
      file,
      {
        cacheControl: '3600',
        contentType: file.type,
        upsert: false
      }
    )

  if (uploadError) {
    throw uploadError
  }

  const {
    data: publicUrlData
  } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(caminho)

  const coluna =
    tipo === 'avatar'
      ? 'avatar_url'
      : 'cover_url'

  const urlAntiga =
    pessoa.value?.[coluna]

  const {
    data,
    error: updateError
  } = await supabase
    .from('team_access')
    .update({
      [coluna]:
        publicUrlData.publicUrl,

      updated_at:
        new Date().toISOString()
    })
    .eq('user_id', userId)
    .select()
    .single()

  if (updateError) {
    await supabase.storage
      .from(BUCKET)
      .remove([caminho])

    throw updateError
  }

  pessoa.value = {
    ...pessoa.value,
    ...data
  }

  /*
    Remove a imagem anterior somente depois que
    a nova imagem for salva com sucesso.
  */
  if (urlAntiga) {
    const caminhoAntigo =
      obterCaminhoStorage(urlAntiga)

    if (caminhoAntigo) {
      const {
        error: removeError
      } = await supabase.storage
        .from(BUCKET)
        .remove([caminhoAntigo])

      if (removeError) {
        console.warn(
          'Não foi possível remover a imagem anterior:',
          removeError
        )
      }
    }
  }
}

function obterCaminhoStorage(publicUrl) {
  if (!publicUrl) {
    return null
  }

  try {
    const marker =
      `/storage/v1/object/public/${BUCKET}/`

    const index =
      publicUrl.indexOf(marker)

    if (index === -1) {
      return null
    }

    return decodeURIComponent(
      publicUrl.slice(
        index + marker.length
      )
    )
  } catch {
    return null
  }
}

function abrirEditorImagem(file, tipo) {
  validarImagem(file)

  if (cropModal.previewUrl) {
    URL.revokeObjectURL(cropModal.previewUrl)
  }

  cropModal.tipo = tipo
  cropModal.file = file
  cropModal.previewUrl = URL.createObjectURL(file)
  cropModal.error = ''
  cropModal.saving = false
  cropModal.open = true
}

function fecharEditorImagem() {
  if (cropModal.saving) {
    return
  }

  cropModal.open = false
  cropModal.file = null
  cropModal.error = ''

  if (cropModal.previewUrl) {
    URL.revokeObjectURL(cropModal.previewUrl)
    cropModal.previewUrl = ''
  }

  if (avatarInput.value) {
    avatarInput.value.value = ''
  }

  if (coverInput.value) {
    coverInput.value.value = ''
  }
}

function alterarZoom(fator) {
  cropperRef.value?.zoom(fator)
}

function resetarCorte() {
  cropperRef.value?.reset()
}

function canvasParaArquivo(canvas, tipo) {
  return new Promise((resolve, reject) => {
    if (!canvas) {
      reject(
        new Error(
          'Não foi possível gerar o recorte da imagem.'
        )
      )

      return
    }

    canvas.toBlob(
      blob => {
        if (!blob) {
          reject(
            new Error(
              'Não foi possível processar a imagem.'
            )
          )

          return
        }

        resolve(
          new File(
            [blob],
            `${tipo}-${Date.now()}.webp`,
            {
              type: 'image/webp'
            }
          )
        )
      },
      'image/webp',
      0.9
    )
  })
}

async function salvarImagemCortada() {
  cropModal.error = ''

  try {
    const resultado =
      cropperRef.value?.getResult()

    const arquivoCortado =
      await canvasParaArquivo(
        resultado?.canvas,
        cropModal.tipo
      )

    cropModal.saving = true

    if (cropModal.tipo === 'avatar') {
      uploadingAvatar.value = true
    } else {
      uploadingCover.value = true
    }

    await enviarImagem(
      arquivoCortado,
      cropModal.tipo
    )

    mostrarSucesso(
      cropModal.tipo === 'avatar'
        ? 'Foto de perfil atualizada.'
        : 'Foto de capa atualizada.'
    )

    cropModal.saving = false
    fecharEditorImagem()
  } catch (error) {
    console.error(
      'Erro ao cortar e salvar imagem:',
      error
    )

    cropModal.error =
      error.message ||
      'Não foi possível salvar a imagem.'
  } finally {
    cropModal.saving = false
    uploadingAvatar.value = false
    uploadingCover.value = false
  }
}

function selecionarAvatar(event) {
  const file =
    event.target.files?.[0]

  if (!file) {
    return
  }

  loadError.value = ''

  try {
    abrirEditorImagem(file, 'avatar')
  } catch (error) {
    loadError.value =
      error.message ||
      'Não foi possível abrir a imagem.'

    event.target.value = ''
  }
}

function selecionarCapa(event) {
  const file =
    event.target.files?.[0]

  if (!file) {
    return
  }

  loadError.value = ''

  try {
    abrirEditorImagem(file, 'cover')
  } catch (error) {
    loadError.value =
      error.message ||
      'Não foi possível abrir a imagem.'

    event.target.value = ''
  }
}

async function removerImagem(tipo) {
  if (!podeEditar.value) {
    return
  }

  const coluna =
    tipo === 'avatar'
      ? 'avatar_url'
      : 'cover_url'

  const urlAtual =
    pessoa.value?.[coluna]

  if (!urlAtual) {
    return
  }

  const confirmou = window.confirm(
    tipo === 'avatar'
      ? 'Deseja remover sua foto de perfil?'
      : 'Deseja remover sua foto de capa?'
  )

  if (!confirmou) {
    return
  }

  if (tipo === 'avatar') {
    uploadingAvatar.value = true
  } else {
    uploadingCover.value = true
  }

  loadError.value = ''

  try {
    const caminho =
      obterCaminhoStorage(urlAtual)

    const {
      data,
      error
    } = await supabase
      .from('team_access')
      .update({
        [coluna]: null,

        updated_at:
          new Date().toISOString()
      })
      .eq(
        'user_id',
        activeSession.value.user.id
      )
      .select()
      .single()

    if (error) {
      throw error
    }

    pessoa.value = {
      ...pessoa.value,
      ...data
    }

    if (caminho) {
      const {
        error: storageError
      } = await supabase.storage
        .from(BUCKET)
        .remove([caminho])

      if (storageError) {
        console.warn(
          'Erro ao excluir arquivo:',
          storageError
        )
      }
    }

    mostrarSucesso(
      tipo === 'avatar'
        ? 'Foto de perfil removida.'
        : 'Foto de capa removida.'
    )
  } catch (error) {
    console.error(
      'Erro ao remover imagem:',
      error
    )

    loadError.value =
      'Não foi possível remover a imagem.'
  } finally {
    uploadingAvatar.value = false
    uploadingCover.value = false
  }
}

async function carregarPerfil() {
  const routeEmail =
    route.params.email

  if (!routeEmail) {
    pessoa.value = null
    rawItems.value = []
    carteirasDoPerfil.value = []

    loadError.value =
      'O e-mail do perfil não foi informado na rota.'

    loading.value = false
    return
  }

  const email = decodeURIComponent(
    String(routeEmail)
  )

  loading.value = true
  loadError.value = ''

  pessoa.value = null
  rawItems.value = []
  carteirasDoPerfil.value = []

  try {
    const {
      data: pessoaData,
      error: pessoaError
    } = await supabase
      .from('team_access')
      .select('*')
      .eq('email', email)
      .maybeSingle()

    if (pessoaError) {
      throw pessoaError
    }

    pessoa.value = pessoaData

    if (!pessoaData) {
      return
    }

    const {
      data: walletsData,
      error: walletsError
    } = await supabase
      .from('analyst_wallets')
      .select('wallet')
      .eq('email', email)

    if (walletsError) {
      throw walletsError
    }

    carteirasDoPerfil.value = (
      walletsData || []
    ).map(item => item.wallet)

    const {
      data: itemsData,
      error: itemsError
    } = await supabase
      .from('weekly_snapshots')
      .select('*')
      .eq('analyst_email', email)
      .order('created_at', {
        ascending: false
      })

    if (itemsError) {
      throw itemsError
    }

    rawItems.value = itemsData || []
  } catch (error) {
    console.error(
      'Erro ao carregar perfil:',
      error
    )

    loadError.value =
      'Não foi possível carregar este perfil.'
  } finally {
    loading.value = false
  }
}

async function verificarSessao() {
  checkingSession.value = true

  try {
    const {
      data,
      error
    } = await supabase.auth.getSession()

    if (error) {
      throw error
    }

    activeSession.value =
      data.session

    if (data.session) {
      await carregarPerfil()
    }
  } catch (error) {
    console.error(
      'Erro ao verificar sessão:',
      error
    )

    activeSession.value = null
  } finally {
    checkingSession.value = false
  }
}

watch(
  () => session.value,
  async newSession => {
    if (!newSession) {
      return
    }

    activeSession.value =
      newSession

    checkingSession.value = false

    if (!pessoa.value) {
      await carregarPerfil()
    }
  }
)

watch(
  () => route.params.email,
  async (newEmail, oldEmail) => {
    if (
      newEmail &&
      newEmail !== oldEmail &&
      activeSession.value
    ) {
      editando.value = false
      await carregarPerfil()
    }
  }
)

onMounted(async () => {
  await verificarSessao()

  const {
    data
  } = supabase.auth.onAuthStateChange(
    async (event, newSession) => {
      if (event === 'SIGNED_OUT') {
        activeSession.value = null
        pessoa.value = null
        return
      }

      if (
        event === 'SIGNED_IN' ||
        event === 'TOKEN_REFRESHED' ||
        event === 'INITIAL_SESSION'
      ) {
        activeSession.value =
          newSession

        if (
          newSession &&
          !pessoa.value
        ) {
          await carregarPerfil()
        }
      }
    }
  )

  authSubscription =
    data.subscription
})

onBeforeUnmount(() => {
  authSubscription?.unsubscribe()

  if (successTimeout) {
    window.clearTimeout(successTimeout)
  }

  if (cropModal.previewUrl) {
    URL.revokeObjectURL(cropModal.previewUrl)
  }
})
</script>

<style scoped>
.perfil-page {
  --ink: #0a1510;
  --panel: #101d16;
  --panel-raised: #16261c;
  --line: rgba(255, 255, 255, 0.08);
  --paper: #eef4ee;
  --paper-dim: rgba(238, 244, 238, 0.62);
  --jade: #6fe3a0;
  --jade-dim: rgba(111, 227, 160, 0.16);
  --steel: #7fb6e3;
  --steel-dim: rgba(127, 182, 227, 0.16);
  --brass: #eab766;
  --bad: #ff9797;
  --radius: 0.9rem;

  width: 100%;
  max-width: 1000px;
  min-height: 100%;

  margin: 0 auto;
  padding-bottom: 2.5rem;

  overflow: hidden;

  border: 1px solid var(--line);
  border-radius: 1.1rem;

  background: var(--ink);
  color: var(--paper);

  box-sizing: border-box;

  font-family:
    'Inter',
    system-ui,
    sans-serif;
}



.perfil-page h1,
.perfil-page h2,
.perfil-page h3 {
  margin: 0;

  font-family:
    'Space Grotesk',
    'Inter',
    sans-serif;

  font-weight: 600;
}

.perfil-page strong {
  font-family:
    'IBM Plex Mono',
    ui-monospace,
    monospace;

  font-variant-numeric:
    tabular-nums;
}

.eyebrow {
  margin: 0 0 0.35rem;

  color: var(--jade);

  font-size: 0.76rem;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.access-gate {
  display: flex;
  align-items: center;
  gap: 1rem;

  padding: 3rem 1.5rem;
}

.message {
  margin: 1rem 1.5rem;
  padding: 0.9rem 1.1rem;

  border-radius: 0.7rem;

  font-size: 0.88rem;
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

.loading-card {
  display: flex;
  align-items: center;
  gap: 1rem;

  margin: 2rem 1.5rem;
  padding: 1.2rem;

  border: 1px solid var(--line);
  border-radius: var(--radius);

  background: var(--panel);
}

.loading-card p {
  margin: 0.3rem 0 0;

  color: var(--paper-dim);
  font-size: 0.85rem;
}

.loading-spinner {
  width: 1.5rem;
  height: 1.5rem;

  flex: 0 0 1.5rem;

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

.cover {
  position: relative;

  width: 100%;
  height: 210px;

  overflow: hidden;

  border-radius: 1.1rem 1.1rem 0 0;

  background-size: cover !important;
  background-position: center !important;
  background-repeat: no-repeat !important;
}

.cover-overlay {
  position: absolute;
  inset: 0;

  pointer-events: none;

  background:
    linear-gradient(to bottom,
      transparent 25%,
      rgba(5, 15, 9, 0.52));
}

.file-input {
  display: none;
}

.cover-image-actions {
  position: absolute;
  right: 1rem;
  bottom: 1rem;
  z-index: 2;

  display: flex;
  gap: 0.55rem;
}

.modern-image-button,
.avatar-edit-button {
  display: grid;
  place-items: center;

  width: 2.4rem;
  height: 2.4rem;

  padding: 0;

  border:
    1px solid rgba(255, 255, 255, 0.18);
  border-radius: 999px;

  background:
    rgba(10, 21, 16, 0.82);

  color: #ffffff;

  box-shadow:
    0 6px 22px rgba(0, 0, 0, 0.28);

  backdrop-filter: blur(12px);

  cursor: pointer;

  transition:
    transform 160ms ease,
    background 160ms ease,
    border-color 160ms ease;
}

.modern-image-button:hover,
.avatar-edit-button:hover {
  transform: translateY(-1px) scale(1.04);

  border-color:
    rgba(111, 227, 160, 0.5);

  background:
    rgba(22, 38, 28, 0.96);
}

.modern-image-button:disabled,
.avatar-edit-button:disabled {
  opacity: 0.58;
  cursor: not-allowed;
  transform: none;
}

.modern-image-button svg,
.avatar-edit-button svg {
  width: 1.12rem;
  height: 1.12rem;

  fill: currentColor;
}

.modern-image-button--danger {
  color: var(--bad);
}

.mini-spinner {
  width: 0.9rem;
  height: 0.9rem;

  border:
    2px solid rgba(255, 255, 255, 0.3);
  border-top-color: currentColor;
  border-radius: 50%;

  animation:
    spin 0.7s linear infinite;
}

.perfil-header {
  display: flex;
  align-items: flex-end;
  gap: 1rem;
  flex-wrap: wrap;

  margin-top: -3.25rem;
  padding: 0 1.5rem;

  position: relative;
  z-index: 3;
}

.avatar-wrapper {
  position: relative;

  flex-shrink: 0;
}

.perfil-header__avatar {
  display: flex;
  align-items: center;
  justify-content: center;

  width: 7rem;
  height: 7rem;

  overflow: hidden;

  border: 5px solid var(--ink);
  border-radius: 999px;

  color: #ffffff;
  font-size: 1.8rem;
  font-weight: 700;
}

.perfil-header__avatar img {
  width: 100%;
  height: 100%;

  display: block;

  object-fit: cover;
}

.avatar-edit-button {
  position: absolute;
  right: 0.05rem;
  bottom: 0.1rem;

  width: 2.35rem;
  height: 2.35rem;

  border:
    3px solid var(--ink);

  background:
    rgba(238, 244, 238, 0.96);

  color: #0a1510;
}

.perfil-header__info {
  flex: 1;

  min-width: 180px;
  padding-bottom: 0.35rem;
}

.perfil-header__info h1 {
  font-size: 1.55rem;
}

.profile-tags {
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
}

.tag {
  display: inline-flex;

  margin-top: 0.4rem;
  padding: 0.2rem 0.6rem;

  border-radius: 999px;

  font-size: 0.72rem;
  font-weight: 700;
}

.tag--jade {
  background: var(--jade-dim);
  color: var(--jade);
}

.tag--steel {
  background: var(--steel-dim);
  color: var(--steel);
}

.tag--neutral {
  background: rgba(255, 255, 255, 0.08);
  color: var(--paper-dim);
}

.tag--brass {
  background: rgba(234, 183, 102, 0.16);
  color: var(--brass);
}

.header-actions {
  display: flex;
  gap: 0.55rem;
  flex-wrap: wrap;

  padding-bottom: 0.4rem;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;

  border: none;
  border-radius: 0.7rem;

  padding: 0.65rem 1rem;

  font-family: inherit;
  font-size: 0.85rem;
  font-weight: 600;
  text-decoration: none;

  cursor: pointer;
}

.btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.btn--primary {
  background:
    linear-gradient(135deg,
      #7bf0a6,
      #2fa85e);

  color: #05170c;
}

.btn--ghost {
  border: 1px solid var(--line);

  background:
    rgba(255, 255, 255, 0.06);

  color: var(--paper);
}

.btn--danger-soft {
  border:
    1px solid rgba(255, 151, 151, 0.3);

  background:
    rgba(255, 151, 151, 0.1);

  color: var(--bad);
}

.edit-card {
  margin: 1.5rem;
  padding: 1.4rem;

  border: 1px solid var(--line);
  border-radius: var(--radius);

  background: var(--panel-raised);
}

.edit-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;

  margin-bottom: 1.3rem;
}

.edit-card__header p:last-child {
  margin: 0.4rem 0 0;

  color: var(--paper-dim);
  font-size: 0.86rem;
}

.close-button {
  border: none;

  background: transparent;
  color: var(--paper-dim);

  font-size: 1.6rem;
  cursor: pointer;
}

.edit-form {
  display: grid;
  gap: 1rem;
}

.form-grid {
  display: grid;

  grid-template-columns:
    repeat(2, minmax(0, 1fr));

  gap: 1rem;
}

.field {
  display: grid;
  gap: 0.4rem;

  color: var(--paper-dim);
  font-size: 0.82rem;
}

.field--full {
  grid-column: 1 / -1;
}

.field input,
.field textarea {
  width: 100%;
  box-sizing: border-box;

  padding: 0.75rem 0.9rem;

  border: 1px solid var(--line);
  border-radius: 0.65rem;

  outline: none;

  background:
    rgba(255, 255, 255, 0.04);

  color: var(--paper);

  font: inherit;
}

.field textarea {
  resize: vertical;
  min-height: 115px;
}

.field input:focus,
.field textarea:focus {
  border-color:
    rgba(111, 227, 160, 0.55);

  box-shadow:
    0 0 0 3px rgba(111, 227, 160, 0.1);
}

.field small {
  justify-self: end;

  color: var(--paper-dim);
  font-size: 0.72rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.7rem;
}

.perfil-grid {
  display: grid;

  grid-template-columns:
    280px minmax(0, 1fr);

  gap: 1.25rem;
  padding: 1.5rem;
}

.perfil-card {
  align-self: start;

  padding: 1.1rem;

  border: 1px solid var(--line);
  border-radius: var(--radius);

  background: var(--panel);
}

.card-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.text-button {
  border: none;

  background: transparent;
  color: var(--jade);

  font-family: inherit;
  font-size: 0.78rem;
  font-weight: 700;

  cursor: pointer;
}

.perfil-bio {
  margin: 0.6rem 0 1.1rem;

  color: var(--paper-dim);

  font-size: 0.88rem;
  line-height: 1.5;
}

.perfil-facts {
  display: grid;
  gap: 0.8rem;

  margin: 0;
}

.perfil-facts dt {
  color: var(--paper-dim);

  font-size: 0.72rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.perfil-facts dd {
  margin: 0.15rem 0 0;

  overflow-wrap: anywhere;

  font-size: 0.86rem;
}

.perfil-facts a {
  color: var(--jade);
  text-decoration: none;
}

.perfil-facts a:hover {
  text-decoration: underline;
}

.perfil-timeline {
  display: grid;
  align-content: start;
  gap: 0.8rem;

  min-width: 0;
}

.timeline-header {
  display: flex;
  justify-content: space-between;
}

.info-message {
  margin: 0;
  padding: 0.9rem 1.1rem;

  border-left: 3px solid var(--steel);
  border-radius: 0.8rem;

  background:
    rgba(255, 255, 255, 0.05);

  color: var(--paper-dim);
}

.perfil-item {
  display: flex;
  align-items: center;
  gap: 0.9rem;

  padding: 0.85rem 1rem;

  border: 1px solid var(--line);
  border-radius: 0.7rem;

  background: var(--panel);
}

.perfil-item .tag {
  flex-shrink: 0;
  margin-top: 0;
}

.perfil-item__body {
  display: grid;
  flex: 1;
  gap: 0.1rem;

  min-width: 0;
}

.perfil-item__body strong,
.perfil-item__body small {
  overflow: hidden;

  text-overflow: ellipsis;
  white-space: nowrap;
}

.perfil-item__body small {
  color: var(--paper-dim);
  font-size: 0.78rem;
}

.perfil-item__totals {
  flex-shrink: 0;

  color: var(--jade);

  font-family:
    'IBM Plex Mono',
    ui-monospace,
    monospace;

  font-size: 0.9rem;
  font-weight: 700;
}

.crop-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 9999;

  display: grid;
  place-items: center;

  padding: 1rem;

  background:
    rgba(2, 8, 5, 0.78);

  backdrop-filter: blur(8px);
}

.crop-modal {
  width: min(760px, 100%);
  max-height: calc(100vh - 2rem);

  overflow-y: auto;

  border:
    1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1rem;

  background: #101d16;
  color: #eef4ee;

  box-shadow:
    0 30px 90px rgba(0, 0, 0, 0.48);
}

.crop-modal__header,
.crop-modal__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;

  padding: 1rem 1.15rem;
}

.crop-modal__header {
  border-bottom:
    1px solid rgba(255, 255, 255, 0.08);
}

.crop-modal__footer {
  justify-content: flex-end;

  border-top:
    1px solid rgba(255, 255, 255, 0.08);
}

.crop-close-button {
  width: 2.25rem;
  height: 2.25rem;

  border: none;
  border-radius: 999px;

  background:
    rgba(255, 255, 255, 0.06);

  color: rgba(238, 244, 238, 0.72);

  font-size: 1.5rem;
  line-height: 1;

  cursor: pointer;
}

.crop-stage {
  height: min(430px, 55vh);
  margin: 1rem;

  overflow: hidden;

  border-radius: 0.85rem;

  background: #07110c;
}

.crop-stage--avatar {
  max-width: 520px;
  margin-inline: auto;
}

.profile-cropper {
  width: 100%;
  height: 100%;

  background: #07110c;
}

.crop-stage--avatar :deep(.vue-rectangle-stencil__preview) {
  border-radius: 50%;
}

.crop-stage--avatar :deep(.vue-rectangle-stencil__wrapper) {
  border-radius: 50%;
}

.crop-help {
  margin: 0 1rem;

  color: rgba(238, 244, 238, 0.62);

  font-size: 0.8rem;
  line-height: 1.5;
  text-align: center;
}

.crop-controls {
  display: flex;
  justify-content: center;
  gap: 0.6rem;

  padding: 1rem;
}

.crop-control-button {
  min-width: 2.6rem;
  height: 2.6rem;

  border:
    1px solid rgba(255, 255, 255, 0.1);
  border-radius: 999px;

  background:
    rgba(255, 255, 255, 0.06);

  color: #eef4ee;

  font: inherit;
  font-size: 1.2rem;
  font-weight: 700;

  cursor: pointer;
}

.crop-control-button:hover {
  border-color:
    rgba(111, 227, 160, 0.4);

  background:
    rgba(111, 227, 160, 0.1);
}

.crop-control-button--wide {
  padding: 0 1rem;

  font-size: 0.8rem;
}

.crop-error {
  margin-top: 0;
}

@media (max-width: 760px) {
  .cover {
    height: 170px;
  }

  .perfil-header {
    align-items: center;

    padding: 0 1rem;
  }

  .header-actions {
    width: 100%;
  }

  .header-actions .btn {
    flex: 1;
  }

  .edit-card {
    margin: 1rem;
    padding: 1rem;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .field--full {
    grid-column: auto;
  }

  .perfil-grid {
    grid-template-columns: 1fr;
    padding: 1rem;
  }

  .form-actions {
    flex-direction: column-reverse;
  }

  .form-actions .btn {
    width: 100%;
  }

  .perfil-item {
    align-items: flex-start;
    flex-wrap: wrap;
  }

  .perfil-item__totals {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .perfil-header__avatar {
    width: 6rem;
    height: 6rem;
  }

  .perfil-header__info {
    flex-basis: calc(100% - 7rem);
  }

  .header-actions {
    flex-direction: column;
  }

  .header-actions .btn {
    width: 100%;
    box-sizing: border-box;
  }
}

.cover-overlay {
  position: absolute;
  inset: 0;

  pointer-events: none;

  background:
    linear-gradient(to bottom,
      transparent 25%,
      rgba(5, 15, 9, 0.52));
}

.cover-action-button {
  position: static;
  z-index: 10;

  display: grid;
  place-items: center;

  width: 2.65rem;
  height: 2.65rem;

  padding: 0;

  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 50%;

  background: rgba(8, 20, 13, 0.78);
  color: #ffffff;

  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);

  box-shadow:
    0 5px 18px rgba(0, 0, 0, 0.3);

  cursor: pointer;

  transition:
    transform 0.2s ease,
    background 0.2s ease,
    border-color 0.2s ease;
}

.cover-action-button:hover {
  transform: scale(1.07);

  border-color:
    rgba(111, 227, 160, 0.65);

  background:
    rgba(20, 48, 31, 0.94);
}

.cover-action-button:focus-visible {
  outline: 3px solid rgba(111, 227, 160, 0.35);
  outline-offset: 3px;
}

.cover-action-button:disabled {
  opacity: 0.65;
  cursor: wait;
}

.cover-action-button svg {
  width: 1.15rem;
  height: 1.15rem;

  fill: currentColor;
}

.cover-edit-button {
  flex: 0 0 auto;
}

.avatar-edit-button {
  position: absolute;
  right: 0.15rem;
  bottom: 0.15rem;
  z-index: 10;

  display: grid;
  place-items: center;

  width: 2.35rem;
  height: 2.35rem;

  padding: 0;

  border: 3px solid var(--ink);
  border-radius: 50%;

  background: var(--jade);
  color: #06180d;

  box-shadow:
    0 4px 14px rgba(0, 0, 0, 0.3);

  cursor: pointer;

  transition:
    transform 0.2s ease,
    filter 0.2s ease;
}

.avatar-edit-button:hover {
  transform: scale(1.08);
  filter: brightness(1.06);
}

.avatar-edit-button:focus-visible {
  outline: 3px solid rgba(111, 227, 160, 0.35);
  outline-offset: 2px;
}

.avatar-edit-button svg {
  width: 1.05rem;
  height: 1.05rem;

  fill: currentColor;
}

.button-spinner {
  width: 1rem;
  height: 1rem;

  border: 2px solid rgba(255, 255, 255, 0.35);
  border-top-color: currentColor;
  border-radius: 50%;

  animation: spin 0.7s linear infinite;
}



/* ============================================================
   RESPONSIVIDADE — PERFIL
   ============================================================ */
.perfil-page,
.perfil-header,
.perfil-grid,
.perfil-card,
.perfil-timeline,
.edit-card,
.form-grid,
.crop-modal {
  min-width: 0;
}

@media (max-width: 900px) {
  .perfil-page {
    width: calc(100% - 1.5rem);
    margin: 0.75rem auto;
  }

  .cover {
    height: 180px;
  }

  .perfil-header {
    align-items: center;
    margin-top: -2.5rem;
  }

  .perfil-grid {
    grid-template-columns: 1fr;
  }

  .perfil-card,
  .perfil-timeline {
    width: 100%;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .field--full {
    grid-column: auto;
  }

  .crop-modal {
    width: min(92vw, 720px);
    max-height: 92vh;
    overflow-y: auto;
  }
}

@media (max-width: 640px) {
  .perfil-page {
    width: calc(100% - 1rem);
    margin: 0.5rem auto;
    border-radius: 0.9rem;
  }

  .cover {
    height: 145px;
  }

  .cover-image-actions {
    right: 0.65rem;
    bottom: 0.65rem;
  }

  .perfil-header {
    flex-direction: column;
    align-items: center;
    margin-top: -3rem;
    padding: 0 1rem;
    text-align: center;
  }

  .perfil-header__avatar {
    width: 6rem;
    height: 6rem;
  }

  .perfil-header__info {
    width: 100%;
    padding-bottom: 0;
  }

  .profile-tags,
  .header-actions {
    justify-content: center;
  }

  .header-actions {
    width: 100%;
  }

  .header-actions .btn {
    width: 100%;
  }

  .edit-card,
  .perfil-grid {
    margin-left: 0.75rem;
    margin-right: 0.75rem;
  }

  .edit-card {
    padding: 1rem;
  }

  .edit-card__header {
    gap: 0.5rem;
  }

  .form-actions {
    display: grid;
    grid-template-columns: 1fr;
  }

  .form-actions .btn {
    width: 100%;
  }

  .perfil-facts>div {
    grid-template-columns: 1fr;
    gap: 0.15rem;
  }

  .perfil-item {
    grid-template-columns: 1fr;
    align-items: flex-start;
    gap: 0.65rem;
  }

  .perfil-item__totals {
    text-align: left;
  }

  .crop-modal-backdrop {
    padding: 0.75rem;
  }

  .crop-modal {
    width: 100%;
  }

  .crop-stage {
    min-height: 280px;
  }

  .crop-modal__footer {
    display: grid;
    grid-template-columns: 1fr;
  }
}
</style>
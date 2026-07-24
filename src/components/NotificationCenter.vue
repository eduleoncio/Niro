<template>
  <div class="notif-root">
    <!-- ===== Sino + histórico ===== -->
    <div class="notif-bell-wrap" ref="bellWrapRef">
      <button type="button" class="notif-bell" @click="open = !open" aria-label="Notificações">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M6 8a6 6 0 1 1 12 0c0 4 1.5 5.5 2 6.5H4c.5-1 2-2.5 2-6.5Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" />
          <path d="M9.5 18a2.5 2.5 0 0 0 5 0" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
        </svg>
        <span v-if="notifications.length" class="notif-bell__badge">{{ notifications.length > 9 ? '9+' : notifications.length }}</span>
      </button>

      <div v-if="open" class="notif-panel">
        <div class="notif-panel__head">
          <strong>Notificações</strong>
          <button type="button" class="btn-mini" @click="mostrarEnvio = !mostrarEnvio">Enviar lembrete</button>
        </div>

        <form v-if="mostrarEnvio" class="notif-send" @submit.prevent="enviarLembreteManual">
          <input v-model="mensagemManual" type="text" placeholder="Ex.: Não esqueçam de lançar os valores!" required />
          <button type="submit" class="btn-mini btn-mini--primary" :disabled="enviando">
            {{ enviando ? 'Enviando…' : 'Disparar para todos' }}
          </button>
        </form>

        <ul class="notif-list">
          <li v-for="n in notifications" :key="n.id">
            <span class="notif-list__dot" :class="`notif-list__dot--${n.type}`"></span>
            <div>
              <p>{{ n.message }}</p>
              <small>{{ n.created_by || 'Sistema' }} · {{ formatWhen(n.created_at) }}</small>
            </div>
          </li>
          <li v-if="!notifications.length" class="notif-list__empty">Nenhuma notificação ainda.</li>
        </ul>
      </div>
    </div>

    <!-- ===== Toast de canto (lançamentos) ===== -->
    <Teleport to="body">
      <transition name="notif-fade">
        <div v-if="toast" class="notif-toast">
          <span class="notif-list__dot notif-list__dot--lancamento"></span>
          <p>{{ toast.message }}</p>
          <button type="button" @click="dismissToast" aria-label="Fechar">✕</button>
        </div>
      </transition>
    </Teleport>

    <!-- ===== Pop-up central (lembretes / manual) ===== -->
    <Teleport to="body">
      <div v-if="modal" class="notif-modal-backdrop" @click.self="dismissModal">
        <div class="notif-modal">
          <span class="notif-modal__icon">🔔</span>
          <p>{{ modal.message }}</p>
          <small v-if="modal.created_by">Enviado por {{ modal.created_by }}</small>
          <button type="button" class="btn-mini btn-mini--primary" @click="dismissModal">Entendi</button>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useSupabase } from '../composables/useSupabase'
import { useNotifications } from '../composables/useNotifications'

const { session, supabase } = useSupabase()
const { notifications, toast, modal, enviarNotificacao, dismissToast, dismissModal } = useNotifications()

const open = ref(false)
const bellWrapRef = ref(null)
const mostrarEnvio = ref(false)
const mensagemManual = ref('')
const enviando = ref(false)
const meuNome = ref('Alguém do time')

async function carregarMeuNome() {
  const email = session.value?.user?.email
  if (!email) return
  const { data } = await supabase.from('team_access').select('name').eq('email', email).maybeSingle()
  if (data?.name) meuNome.value = data.name
}

async function enviarLembreteManual() {
  enviando.value = true
  const ok = await enviarNotificacao({ type: 'manual', message: mensagemManual.value, created_by: meuNome.value })
  enviando.value = false
  if (ok) {
    mensagemManual.value = ''
    mostrarEnvio.value = false
  }
}

function formatWhen(iso) {
  const d = new Date(iso)
  return d.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
}

function handleClickOutside(event) {
  if (bellWrapRef.value && !bellWrapRef.value.contains(event.target)) open.value = false
}

onMounted(() => {
  carregarMeuNome()
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.notif-root {
  --panel: #101d16;
  --panel-raised: #16261c;
  --line: rgba(255, 255, 255, 0.08);
  --paper: #eef4ee;
  --paper-dim: rgba(238, 244, 238, 0.62);
  --jade: #6fe3a0;
  font-family: 'Inter', system-ui, sans-serif;
  position: relative;
}

.notif-bell-wrap { position: relative; }

.notif-bell {
  position: relative;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 999px;
  border: 1px solid var(--line);
  background: rgba(255, 255, 255, 0.05);
  color: var(--paper);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.notif-bell:hover { background: rgba(255, 255, 255, 0.09); }

.notif-bell__badge {
  position: absolute;
  top: -0.3rem;
  right: -0.3rem;
  background: #ff5c5c;
  color: #250505;
  font-size: 0.65rem;
  font-weight: 700;
  min-width: 1.2rem;
  height: 1.2rem;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 0.25rem;
}

.notif-panel {
  position: absolute;
  top: calc(100% + 0.6rem);
  right: 0;
  width: 320px;
  max-height: 420px;
  overflow-y: auto;
  background: var(--panel-raised);
  border: 1px solid var(--line);
  border-radius: 0.9rem;
  box-shadow: 0 20px 45px rgba(0, 0, 0, 0.4);
  z-index: 60;
  padding: 0.75rem;
}

.notif-panel__head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.3rem 0.3rem 0.7rem;
  color: var(--paper);
}

.btn-mini {
  border: 1px solid var(--line);
  background: rgba(255, 255, 255, 0.06);
  color: var(--paper);
  border-radius: 0.5rem;
  padding: 0.35rem 0.6rem;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
}

.btn-mini--primary { background: linear-gradient(135deg, #7bf0a6, #2fa85e); color: #05170c; border: none; }
.btn-mini:disabled { opacity: 0.5; cursor: not-allowed; }

.notif-send {
  display: flex;
  gap: 0.4rem;
  padding: 0 0.3rem 0.7rem;
}

.notif-send input {
  flex: 1;
  padding: 0.45rem 0.6rem;
  border-radius: 0.5rem;
  border: 1px solid var(--line);
  background: rgba(255, 255, 255, 0.04);
  color: var(--paper);
  font-size: 0.8rem;
}

.notif-list { list-style: none; margin: 0; padding: 0; display: grid; gap: 0.4rem; }

.notif-list li {
  display: flex;
  gap: 0.6rem;
  padding: 0.5rem 0.4rem;
  border-radius: 0.6rem;
}

.notif-list li:hover { background: rgba(255, 255, 255, 0.04); }
.notif-list p { margin: 0; font-size: 0.82rem; color: var(--paper); line-height: 1.35; }
.notif-list small { color: var(--paper-dim); font-size: 0.72rem; }
.notif-list__empty { color: var(--paper-dim); font-size: 0.82rem; justify-content: center; padding: 1rem; }

.notif-list__dot { width: 0.5rem; height: 0.5rem; border-radius: 999px; margin-top: 0.4rem; flex-shrink: 0; }
.notif-list__dot--lancamento { background: var(--jade); }
.notif-list__dot--lembrete { background: #eab766; }
.notif-list__dot--manual { background: #7fb6e3; }

/* ===== Toast ===== */
.notif-toast {
  position: fixed;
  top: 1.25rem;
  right: 1.25rem;
  z-index: 200;
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  max-width: 320px;
  padding: 0.8rem 0.9rem;
  border-radius: 0.8rem;
  background: var(--panel-raised);
  border: 1px solid var(--line);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.4);
  color: var(--paper);
  font-size: 0.85rem;
}

.notif-toast p { margin: 0; flex: 1; line-height: 1.4; }
.notif-toast button { background: none; border: none; color: var(--paper-dim); cursor: pointer; font-size: 0.85rem; }

.notif-fade-enter-active, .notif-fade-leave-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.notif-fade-enter-from, .notif-fade-leave-to { opacity: 0; transform: translateY(-8px); }

/* ===== Modal central ===== */
.notif-modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(5, 10, 7, 0.7);
  backdrop-filter: blur(2px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 300;
}

.notif-modal {
  width: min(360px, 90vw);
  background: var(--panel-raised);
  border: 1px solid var(--line);
  border-radius: 1rem;
  padding: 1.75rem 1.5rem;
  text-align: center;
  display: grid;
  gap: 0.6rem;
  justify-items: center;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.5);
  color: var(--paper);
}

.notif-modal__icon { font-size: 1.8rem; }
.notif-modal p { margin: 0; font-size: 0.95rem; line-height: 1.5; }
.notif-modal small { color: var(--paper-dim); font-size: 0.78rem; }
.notif-modal .btn-mini { margin-top: 0.5rem; padding: 0.55rem 1.4rem; }
</style>
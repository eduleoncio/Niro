import { ref } from 'vue'
import { useSupabase } from './useSupabase'

const { supabase } = useSupabase()

// Estado a nível de módulo — compartilhado entre todos os componentes que
// chamarem useNotifications(), então a inscrição no Realtime só acontece uma vez.
const notifications = ref([])
const toast = ref(null) // aviso pequeno de canto (lançamentos do dia a dia)
const modal = ref(null) // aviso central (lembretes de horário / manuais)
let channel = null
let loaded = false

async function fetchRecent() {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(30)

  if (!error) notifications.value = data
}

function subscribe() {
  if (channel) return

  channel = supabase
    .channel('notifications-feed')
    .on(
      'postgres_changes',
      { event: 'insert', schema: 'public', table: 'notifications' },
      (payload) => {
        const n = payload.new
        notifications.value = [n, ...notifications.value]

        if (n.type === 'lancamento') {
          toast.value = n
          setTimeout(() => {
            if (toast.value?.id === n.id) toast.value = null
          }, 6000)
        } else {
          modal.value = n
        }
      }
    )
    .subscribe()
}

async function enviarNotificacao({ type, message, created_by }) {
  const { error } = await supabase.from('notifications').insert({ type, message, created_by })
  if (error) console.error('Erro ao enviar notificação:', error)
  return !error
}

export function useNotifications() {
  if (!loaded) {
    loaded = true
    fetchRecent()
    subscribe()
  }

  return {
    notifications,
    toast,
    modal,
    enviarNotificacao,
    dismissToast: () => { toast.value = null },
    dismissModal: () => { modal.value = null }
  }
}
import {
  createClient
} from '@supabase/supabase-js'

import {
  ref
} from 'vue'

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL

const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY

if (
  !supabaseUrl ||
  !supabaseAnonKey
) {
  throw new Error(
    'Supabase não configurado. Verifique VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env.'
  )
}

const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'pkce'
    }
  }
)

const session = ref(null)
const loadingSession = ref(true)

async function carregarSessaoInicial() {
  loadingSession.value = true

  try {
    const {
      data,
      error
    } = await supabase.auth.getSession()

    if (error) {
      console.error(
        'Erro ao recuperar sessão:',
        error
      )

      session.value = null
      return
    }

    session.value =
      data.session ?? null
  } catch (error) {
    console.error(
      'Erro inesperado ao recuperar sessão:',
      error
    )

    session.value = null
  } finally {
    loadingSession.value = false
  }
}

carregarSessaoInicial()

supabase.auth.onAuthStateChange(
  (event, newSession) => {
    console.log(
      'Evento global de autenticação:',
      event
    )

    session.value =
      newSession ?? null

    loadingSession.value = false
  }
)

export function useSupabase() {
  return {
    supabase,
    session,
    loadingSession
  }
}
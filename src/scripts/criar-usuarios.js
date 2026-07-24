// Rode com "node criar-usuarios.js" — cria os 8 logins direto no projeto ÚNICO
// (bxsegwaylelxagblxnyw), que agora cuida de login E dados juntos.
//
// Precisa da SERVICE ROLE KEY do projeto bxsegwaylelxagblxnyw (Project Settings > API > service_role).
// Nunca comitar essa chave nem deixar em código que vai pro navegador.

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://bxsegwaylelxagblxnyw.supabase.co'
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4c2Vnd2F5bGVseGFnYmx4bnl3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDEzOTE5NCwiZXhwIjoyMDk5NzE1MTk0fQ.BkZzvsbI2ZgFft1lHHE-RxYn_dnXF1FRPc2LvpCc20M'

const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

const SENHA_PADRAO = 'santacri123'

const usuarios = [
  { nome: 'Eduardo',   email: 'eduardo@confirmahub.com.br' },
  { nome: 'Bruno',     email: 'bruno@confirmahub.com.br' },
  { nome: 'Eliane',    email: 'eliane@confirmahub.com.br' },
  { nome: 'Débora',    email: 'debora@confirmahub.com.br' },
  { nome: 'Tamara',    email: 'tamara@confirmahub.com.br' },
  { nome: 'Tainá',     email: 'taina@confirmahub.com.br' },
  { nome: 'Jefferson', email: 'jefferson@confirmahub.com.br' },
  { nome: 'Edson',     email: 'edson@confirmahub.com.br' },
]

async function criarUsuarios() {
  for (const usuario of usuarios) {
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: usuario.email,
      password: SENHA_PADRAO,
      email_confirm: true,
      user_metadata: { nome: usuario.nome }
    })

    if (error) {
      console.error(`Erro ao criar ${usuario.email}:`, error.message)
    } else {
      console.log(`Criado: ${usuario.email} (id: ${data.user.id})`)
    }
  }
}

criarUsuarios()
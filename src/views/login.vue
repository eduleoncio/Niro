<template>

  <div class="background">
    <img src="../assets/background-login.svg" alt="Fundo da tela de login">
  </div>

  <!-- Container principal da tela de login -->
  <div class="container-login">
    <!-- Caixa do formulário -->
    <div class="form-box">

      <img class="logotipo" src="../assets/logotipo.svg" alt="Logotipo do Niro">
      <!-- Título da página -->
      <h1 class="titulo">Bem-vindo(a) de volta!</h1>

      <!-- Formulário de login -->
      <!-- @submit.prevent="fazerLogin" = quando o usuário clica em "Entrar", chama a função fazerLogin() -->
      <form @submit.prevent="fazerLogin" class="formulario">
        <!-- Campo de e-mail -->
        <!-- v-model="email" = vincula o valor do input com a variável email -->
        <!-- Quando o usuário digita, a variável email é atualizada automaticamente -->
        <div class="form-group">
          <label for="email" class="label">E-mail</label>
          <input id="email" v-model="email" type="email" placeholder="seu@email.com" class="input" required />
        </div>

        <!-- Campo de senha -->
        <!-- v-model="senha" = vincula o valor do input com a variável senha -->
        <div class="form-group">
          <label for="senha" class="label">Senha</label>
          <input id="senha" v-model="senha" type="password" placeholder="Digite sua senha" class="input" required />
        </div>

        <!-- Mensagem de erro -->
        <!-- v-if="erro" = só mostra a mensagem se houver um erro -->
        <div v-if="erro" class="mensagem-erro">
          <i class="fas fa-exclamation-circle"></i>
          {{ erro }}
        </div>

        <!-- Botão de envio -->
        <!-- :disabled="carregando" = desabilita o botão enquanto está fazendo login -->
        <!-- Isso evita que o usuário clique múltiplas vezes -->
        <button type="submit" class="botao-entrar" :disabled="carregando">
          <!-- Mostra um spinner enquanto está carregando -->
          <i v-if="carregando" class="fas fa-spinner fa-spin"></i>
          <!-- Mostra o texto normal quando não está carregando -->
          <span v-else>Entrar</span>
        </button>
      </form>

    </div>
  </div>
</template>

<script setup>
// ===== IMPORTAÇÕES =====
// Importar a função ref do Vue para criar variáveis reativas
// ref() = cria uma variável que, quando muda, atualiza a tela automaticamente
import { ref } from 'vue'

// Importar o composable do Supabase que já está configurado no projeto
// useSupabase() = retorna o cliente Supabase pronto para usar
import { useSupabase } from '../composables/useSupabase'

// Importar o router do Vue Router para navegar entre páginas
// useRouter() = permite usar router.push() para ir para outras páginas
import { useRouter } from 'vue-router'

// ===== CONFIGURAÇÃO =====
// Pegar o cliente Supabase já configurado
// supabase = objeto que tem os métodos para autenticação, banco de dados, etc
const { supabase } = useSupabase()

// Pegar o router para navegar entre páginas
// router = objeto que permite router.push('/pagina') para navegar
const router = useRouter()

// ===== VARIÁVEIS REATIVAS =====
// Essas variáveis são "reativas", ou seja, quando mudam, a tela atualiza automaticamente

// Variável que guarda o e-mail digitado pelo usuário
// ref('') = começa vazia
// email.value = para acessar o valor dentro do script
// {{ email }} = para usar no template
const email = ref('')

// Variável que guarda a senha digitada pelo usuário
// ref('') = começa vazia
const senha = ref('')

// Variável que guarda a mensagem de erro (se houver)
// Quando tem um erro, mostra na tela
// Quando não tem erro, a mensagem fica vazia e não aparece
const erro = ref('')

// Variável que indica se o login está em progresso
// Usamos isso para:
// 1. Desabilitar o botão enquanto aguarda a resposta do Supabase
// 2. Mostrar um spinner de carregamento
// 3. Evitar que o usuário clique múltiplas vezes
const carregando = ref(false)

// ===== FUNÇÃO PRINCIPAL: FAZER LOGIN =====
// Esta função é chamada quando o usuário clica no botão "Entrar"
// async = significa que essa função pode fazer operações que demoram (como chamar o Supabase)
// await = espera a operação terminar antes de continuar
async function fazerLogin() {
  // ===== PASSO 1: LIMPAR ERROS ANTERIORES =====
  // Se havia uma mensagem de erro da tentativa anterior, apagar
  // Assim a tela fica limpa para a nova tentativa
  erro.value = ''

  // ===== PASSO 2: VALIDAR SE OS CAMPOS ESTÃO PREENCHIDOS =====
  // Verificar se o usuário digitou algo nos campos
  // Se não digitou nada, mostrar erro e parar a função
  if (!email.value || !senha.value) {
    // !email.value = se email está vazio (falsy)
    // || = OU (se email está vazio OU senha está vazia)
    // Se algum estiver vazio, entra neste if
    erro.value = 'Por favor, preencha todos os campos'
    // Mostra a mensagem de erro na tela
    return
    // return = para a execução da função aqui
    // Não continua para o Supabase se os campos estão vazios
  }

  // ===== PASSO 3: MOSTRAR QUE ESTÁ CARREGANDO =====
  // Muda carregando para true
  // Isso faz com que:
  // 1. O botão fica desabilitado (não pode clicar de novo)
  // 2. Aparece um spinner de carregamento
  carregando.value = true

  try {
    // ===== PASSO 4: TENTAR FAZER LOGIN COM O SUPABASE =====
    // supabase.auth.signInWithPassword() = função do Supabase que autentica o usuário
    // Recebe um objeto com email e password
    // Retorna um objeto com { data, error }
    // - data = informações do usuário se o login funcionou
    // - error = mensagem de erro se o login falhou
    const { error } = await supabase.auth.signInWithPassword({
      // email: email.value = envia o e-mail que o usuário digitou
      email: email.value,
      // password: senha.value = envia a senha que o usuário digitou
      password: senha.value
    })
    // await = espera o Supabase responder antes de continuar

    // ===== PASSO 5: VERIFICAR SE HOUVE ERRO =====
    // Se o Supabase retornou um erro, significa que:
    // - O e-mail não existe
    // - A senha está incorreta
    // - Algum outro problema de autenticação
    if (error) {
      // if (error) = se houve erro
      // O Supabase retorna um erro se o e-mail ou senha estiverem incorretos
      // Mostrar a mensagem de erro para o usuário
      erro.value = 'E-mail ou senha incorretos. Tente novamente.'
      // Desabilitar o carregamento (botão volta ao normal)
      carregando.value = false
      // return = para a função aqui, não continua
      return
    }

    // ===== PASSO 6: LOGIN BEM-SUCEDIDO - REDIRECIONAR =====
    // Se chegou aqui, significa que o login funcionou!
    // Não houve erro, então o usuário está autenticado
    // Agora precisamos levar o usuário para a página principal
    // router.push('/') = navega para a página inicial
    // '/' = rota raiz (onde está o AppLayout com a Sidebar)
    // Isso acontece sem recarregar a página (SPA - Single Page Application)
    router.push('/dashboard')
    // Depois que router.push() é executado, o usuário é levado para a página inicial
  }
  // ===== PASSO 7: CAPTURAR ERROS INESPERADOS =====
  // Se houver um erro que não foi previsto (erro de rede, erro do servidor, etc)
  // Este catch captura e trata
  catch (err) {
    // err = objeto com informações do erro
    // Mostrar uma mensagem genérica para o usuário
    // Não mostramos o erro técnico para não assustar o usuário
    erro.value = 'Erro ao fazer login. Tente novamente mais tarde.'
    // Mostrar o erro completo no console do navegador (para debug)
    // Isso ajuda o desenvolvedor a entender o que deu errado
    console.error('Erro ao fazer login:', err)
    // Desabilitar o carregamento (botão volta ao normal)
    carregando.value = false
  }
}
</script>

<style scoped>
/* ===== ESTILOS GERAIS ===== */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
}

.background img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

/* ===== CONTAINER PRINCIPAL ===== */
/* Centraliza o formulário na tela */
.container-login {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  min-height: 100vh;
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
}

.logotipo {
  display: block;
  margin: 0 auto 2rem auto;
  width: 5rem;
  height: auto;
}

/* ===== CAIXA DO FORMULÁRIO ===== */
/* Estilo da caixa que envolve o formulário */
.form-box {
  width: 100%;
  max-width: 450px;
  padding: 50px 40px;
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  background-color: rgba(10, 18, 12, 0.3);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(1px);
  -webkit-backdrop-filter: blur(10px);
}

/* ===== TÍTULOS ===== */
/* Título principal */
.titulo {
  font-size: 1.7rem;
  color: #ffffff;
  font-weight: 600;
  margin-bottom: 1rem;
  text-align: center;
  font-family: 'Montserrat', sans-serif;
}

/* ===== FORMULÁRIO ===== */
/* Estilos do formulário */
.formulario {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* ===== GRUPOS DE FORMULÁRIO ===== */
/* Cada campo (e-mail, senha) é envolvido em um form-group */
.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* ===== LABELS ===== */
/* Rótulos dos campos (E-mail, Senha) */
.label {
  font-size: 0.9rem;
  font-weight: 500;
  color: #888888;
  font-family: 'Montserrat', sans-serif;

}

/* ===== INPUTS ===== */
/* Estilo dos campos de entrada (e-mail, senha) */
.input {
  padding: 12px 16px;
  border: 1px solid #E2E8F0;
  border-radius: 4px;
  font-size: 16px;
  color: #ffffff;
  transition: all 0.3s ease;

}

/* Quando o usuário clica no input, muda a borda para azul */
.input:focus {
  outline: none;
  border-color: #003D99;
  box-shadow: 0 0 0 3px rgba(0, 61, 153, 0.1);

}

/* ===== MENSAGEM DE ERRO ===== */
/* Estilo da mensagem de erro */
.mensagem-erro {
  padding: 12px 16px;
  background-color: #FEE2E2;
  border: 1px solid #FECACA;
  border-radius: 4px;
  color: #DC2626;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Ícone de erro */
.mensagem-erro i {
  font-size: 18px;
}

/* ===== BOTÃO DE ENTRAR ===== */
/* Estilo do botão de login */
.botao-entrar {
  padding: 12px 24px;
  background-color: var(--color-primary);
  color: #061600;
  border: none;
  border-radius: 5px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 44px;
  font-family: 'Montserrat', sans-serif;
}

/* Quando passa o mouse no botão, muda a cor */
.botao-entrar:hover:not(:disabled) {
  background-color: var(--color-primary-dark);
}

/* Quando o botão está desabilitado (carregando), muda a aparência */
.botao-entrar:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* ===== RESPONSIVIDADE ===== */
/* Em telas pequenas (celulares), reduz o tamanho do formulário */
@media (max-width: 600px) {
  .form-box {
    padding: 30px 20px;
  }

  .titulo {
    font-size: 24px;
  }

  .subtitulo {
    font-size: 14px;
  }
}
</style>

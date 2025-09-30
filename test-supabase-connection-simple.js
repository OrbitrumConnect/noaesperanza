// =====================================================
// TESTE SIMPLES DE CONECTIVIDADE COM SUPABASE
// =====================================================

console.log('🔧 Testando conectividade com Supabase...')

// Teste 1: Verificar se as variáveis de ambiente estão carregadas
console.log('📋 Variáveis de ambiente:')
console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL ? 'Configurada' : 'Não configurada')
console.log('VITE_SUPABASE_PUBLISHABLE_KEY:', import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ? 'Configurada' : 'Não configurada')

// Teste 2: Verificar se o client está funcionando
import { supabase } from './src/integrations/supabase/client.js'

console.log('🔧 Client Supabase:', supabase ? 'OK' : 'ERRO')

// Teste 3: Teste de conectividade básica (sem tabela específica)
async function testarConectividadeBasica() {
  try {
    console.log('🌐 Testando conectividade básica...')
    
    // Teste mais simples - apenas verificar se consegue conectar
    const { data, error } = await supabase
      .from('_supabase_migrations')
      .select('version')
      .limit(1)
    
    if (error) {
      console.log('❌ Erro na conectividade:', error.message)
      return false
    } else {
      console.log('✅ Conectividade básica OK')
      return true
    }
  } catch (error) {
    console.log('❌ Erro de rede:', error.message)
    return false
  }
}

// Teste 4: Teste de autenticação
async function testarAuth() {
  try {
    console.log('🔐 Testando autenticação...')
    
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      console.log('❌ Erro na sessão:', error.message)
    } else {
      console.log('✅ Sessão:', session ? 'Ativa' : 'Inativa')
    }
    
    return !error
  } catch (error) {
    console.log('❌ Erro de autenticação:', error.message)
    return false
  }
}

// Teste 5: Teste de tabela específica
async function testarTabelaAvaliacoes() {
  try {
    console.log('📊 Testando tabela avaliacoes_iniciais...')
    
    const { data, error } = await supabase
      .from('avaliacoes_iniciais')
      .select('id')
      .limit(1)
    
    if (error) {
      console.log('❌ Erro na tabela:', error.message)
      console.log('💡 Possíveis causas:')
      console.log('   - Tabela não existe')
      console.log('   - Sem permissão de acesso')
      console.log('   - RLS (Row Level Security) bloqueando')
      return false
    } else {
      console.log('✅ Tabela avaliacoes_iniciais OK')
      return true
    }
  } catch (error) {
    console.log('❌ Erro na tabela:', error.message)
    return false
  }
}

// Executar todos os testes
async function executarTestes() {
  console.log('🚀 Iniciando testes de conectividade...')
  console.log('=====================================')
  
  const conectividadeBasica = await testarConectividadeBasica()
  const auth = await testarAuth()
  const tabela = await testarTabelaAvaliacoes()
  
  console.log('=====================================')
  console.log('📊 Resultados:')
  console.log(`   Conectividade básica: ${conectividadeBasica ? '✅' : '❌'}`)
  console.log(`   Autenticação: ${auth ? '✅' : '❌'}`)
  console.log(`   Tabela avaliacoes_iniciais: ${tabela ? '✅' : '❌'}`)
  
  if (!conectividadeBasica) {
    console.log('🔧 Soluções:')
    console.log('   1. Verificar conexão com internet')
    console.log('   2. Verificar URL do Supabase')
    console.log('   3. Verificar se o projeto está ativo')
  }
  
  if (!tabela) {
    console.log('🔧 Soluções para tabela:')
    console.log('   1. Executar script SQL no Supabase')
    console.log('   2. Verificar permissões RLS')
    console.log('   3. Verificar se a tabela foi criada')
  }
}

// Executar se estiver no navegador
if (typeof window !== 'undefined') {
  executarTestes()
}

export { testarConectividadeBasica, testarAuth, testarTabelaAvaliacoes }

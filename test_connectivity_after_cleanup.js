// =====================================================
// TESTE DE CONECTIVIDADE APÓS LIMPEZA
// =====================================================

console.log('🧪 Testando conectividade após limpeza...')

// Teste 1: Verificar se as variáveis de ambiente estão carregadas
console.log('📋 Variáveis de ambiente:')
console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL ? 'Configurada' : 'Não configurada')
console.log('VITE_SUPABASE_PUBLISHABLE_KEY:', import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ? 'Configurada' : 'Não configurada')

// Teste 2: Verificar se o client está funcionando
import { supabase } from './src/integrations/supabase/client.js'

console.log('🔧 Client Supabase:', supabase ? 'OK' : 'ERRO')

// Teste 3: Teste de conectividade com a tabela avaliacoes_iniciais
async function testarConectividadeAvaliacoes() {
  try {
    console.log('🌐 Testando conectividade com avaliacoes_iniciais...')
    
    const { data, error } = await supabase
      .from('avaliacoes_iniciais')
      .select('id')
      .limit(1)
    
    if (error) {
      console.log('❌ Erro na tabela avaliacoes_iniciais:', error.message)
      console.log('💡 Código do erro:', error.code)
      return false
    } else {
      console.log('✅ Tabela avaliacoes_iniciais OK')
      console.log('📊 Dados retornados:', data)
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

// Teste 5: Teste de inserção (se possível)
async function testarInsercao() {
  try {
    console.log('📝 Testando inserção...')
    
    const { data, error } = await supabase
      .from('avaliacoes_iniciais')
      .insert({
        user_id: 'teste-connectivity',
        apresentacao: 'Teste de conectividade',
        created_at: new Date().toISOString()
      })
      .select()
    
    if (error) {
      console.log('❌ Erro na inserção:', error.message)
      console.log('💡 Código do erro:', error.code)
      return false
    } else {
      console.log('✅ Inserção OK')
      console.log('📊 Dados inseridos:', data)
      
      // Limpar o teste
      await supabase
        .from('avaliacoes_iniciais')
        .delete()
        .eq('user_id', 'teste-connectivity')
      
      return true
    }
  } catch (error) {
    console.log('❌ Erro na inserção:', error.message)
    return false
  }
}

// Executar todos os testes
async function executarTestes() {
  console.log('🚀 Iniciando testes de conectividade...')
  console.log('=====================================')
  
  const conectividade = await testarConectividadeAvaliacoes()
  const auth = await testarAuth()
  const insercao = await testarInsercao()
  
  console.log('=====================================')
  console.log('📊 Resultados:')
  console.log(`   Conectividade: ${conectividade ? '✅' : '❌'}`)
  console.log(`   Autenticação: ${auth ? '✅' : '❌'}`)
  console.log(`   Inserção: ${insercao ? '✅' : '❌'}`)
  
  if (conectividade && auth) {
    console.log('🎉 SUPABASE FUNCIONANDO PERFEITAMENTE!')
    console.log('✅ A limpeza resolveu os problemas!')
  } else {
    console.log('⚠️ Ainda há problemas de conectividade')
    console.log('🔧 Verifique:')
    console.log('   1. Se ainda há warnings no Supabase')
    console.log('   2. Se as políticas RLS estão corretas')
    console.log('   3. Se a conexão de rede está estável')
  }
}

// Executar se estiver no navegador
if (typeof window !== 'undefined') {
  executarTestes()
}

export { testarConectividadeAvaliacoes, testarAuth, testarInsercao }

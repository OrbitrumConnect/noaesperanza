// =====================================================
// TESTE DE CONEXÃO COM SUPABASE
// Script para testar a conexão e autenticação
// =====================================================

// Teste 1: Verificar se Supabase está configurado
console.log('🔧 Testando configuração do Supabase...')
console.log('URL:', import.meta.env.VITE_SUPABASE_URL)
console.log('Key:', import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ? 'Configurada' : 'Não configurada')

// Teste 2: Verificar se o client está funcionando
import { supabase } from './src/integrations/supabase/client.js'

console.log('🔧 Testando client Supabase...')
console.log('Client:', supabase ? 'OK' : 'ERRO')

// Teste 3: Verificar sessão
async function testSession() {
  try {
    console.log('🔧 Testando sessão...')
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('❌ Erro na sessão:', error)
    } else {
      console.log('✅ Sessão:', session ? 'Ativa' : 'Inativa')
    }
  } catch (error) {
    console.error('❌ Erro ao verificar sessão:', error)
  }
}

// Teste 4: Verificar usuário
async function testUser() {
  try {
    console.log('🔧 Testando usuário...')
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error) {
      console.error('❌ Erro no usuário:', error)
    } else {
      console.log('✅ Usuário:', user ? 'Logado' : 'Não logado')
    }
  } catch (error) {
    console.error('❌ Erro ao verificar usuário:', error)
  }
}

// Teste 5: Verificar tabela users
async function testUsersTable() {
  try {
    console.log('🔧 Testando tabela users...')
    const { data, error } = await supabase
      .from('users')
      .select('id, email, name')
      .limit(1)
    
    if (error) {
      console.error('❌ Erro na tabela users:', error)
    } else {
      console.log('✅ Tabela users:', data ? 'OK' : 'Vazia')
    }
  } catch (error) {
    console.error('❌ Erro ao verificar tabela users:', error)
  }
}

// Executar todos os testes
async function runTests() {
  console.log('🚀 Iniciando testes de conexão...')
  
  await testSession()
  await testUser()
  await testUsersTable()
  
  console.log('🏁 Testes concluídos!')
}

// Executar se estiver no navegador
if (typeof window !== 'undefined') {
  runTests()
}

export { testSession, testUser, testUsersTable }

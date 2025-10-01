// 🧪 TESTE DE DIAGNÓSTICO SUPABASE
// Execute este teste para verificar a conexão

import { supabase } from '../integrations/supabase/client'

export async function testSupabaseConnection() {
  console.log('🔍 INICIANDO TESTE DE DIAGNÓSTICO SUPABASE...\n')
  
  // 1. Verificar configuração
  console.log('1️⃣ VERIFICANDO CONFIGURAÇÃO:')
  const url = import.meta.env.VITE_SUPABASE_URL
  const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
  
  console.log('   URL:', url)
  console.log('   Key:', key ? `${key.substring(0, 20)}...` : 'NÃO CONFIGURADA')
  
  if (url === 'https://your-project.supabase.co' || !key || key === 'your-anon-key') {
    console.error('   ❌ CONFIGURAÇÃO INVÁLIDA!')
    console.log('\n📋 SOLUÇÃO:')
    console.log('   1. Crie arquivo .env na raiz do projeto')
    console.log('   2. Adicione:')
    console.log('      VITE_SUPABASE_URL=https://lhclqebtkyfftkevumix.supabase.co')
    console.log('      VITE_SUPABASE_PUBLISHABLE_KEY=sua_anon_key_aqui')
    return false
  }
  
  console.log('   ✅ Configuração OK\n')
  
  // 2. Testar conexão básica
  console.log('2️⃣ TESTANDO CONEXÃO:')
  try {
    const { data, error } = await supabase.from('noa_users').select('count', { count: 'exact', head: true })
    
    if (error) {
      console.error('   ❌ Erro de conexão:', error.message)
      console.log('\n   Possíveis causas:')
      console.log('   - Anon key incorreta')
      console.log('   - RLS bloqueando acesso')
      console.log('   - Tabela não existe')
      return false
    }
    
    console.log('   ✅ Conexão OK\n')
  } catch (err) {
    console.error('   ❌ Erro inesperado:', err)
    return false
  }
  
  // 3. Testar tabela noa_users
  console.log('3️⃣ TESTANDO TABELA noa_users:')
  try {
    const { data, error } = await supabase
      .from('noa_users')
      .select('*')
      .limit(1)
    
    if (error) {
      console.error('   ❌ Erro ao acessar noa_users:', error.message)
      console.log('\n   📋 VERIFICAR NO SUPABASE:')
      console.log('   1. Tabela "noa_users" existe?')
      console.log('   2. RLS está configurado?')
      console.log('   3. Executou o SQL de criação?')
      return false
    }
    
    console.log('   ✅ Tabela acessível')
    console.log('   📊 Registros encontrados:', data?.length || 0)
    if (data && data.length > 0) {
      console.log('   📝 Exemplo:', data[0])
    }
    console.log('')
  } catch (err) {
    console.error('   ❌ Erro inesperado:', err)
    return false
  }
  
  // 4. Testar autenticação
  console.log('4️⃣ TESTANDO AUTENTICAÇÃO:')
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('   ❌ Erro na sessão:', error.message)
      return false
    }
    
    if (!session) {
      console.log('   ⚠️ Nenhuma sessão ativa (usuário não logado)')
      console.log('   ℹ️ Isso é normal se não estiver autenticado')
    } else {
      console.log('   ✅ Sessão ativa!')
      console.log('   👤 User ID:', session.user.id)
      console.log('   📧 Email:', session.user.email)
      
      // 5. Buscar perfil do usuário logado
      console.log('\n5️⃣ TESTANDO PERFIL DO USUÁRIO:')
      const { data: profile, error: profileError } = await supabase
        .from('noa_users')
        .select('*')
        .eq('user_id', session.user.id)
        .single()
      
      if (profileError) {
        console.error('   ❌ Perfil não encontrado:', profileError.message)
        console.log('\n   📋 SOLUÇÃO:')
        console.log('   1. Cadastre-se novamente pela Landing Page')
        console.log('   2. Ou execute SQL manualmente:')
        console.log(`   INSERT INTO noa_users (user_id, user_type, name) VALUES`)
        console.log(`   ('${session.user.id}', 'paciente', 'Seu Nome');`)
        return false
      }
      
      console.log('   ✅ Perfil encontrado!')
      console.log('   📝 Dados:', profile)
    }
    
    console.log('')
  } catch (err) {
    console.error('   ❌ Erro inesperado:', err)
    return false
  }
  
  console.log('✅ TODOS OS TESTES PASSARAM!')
  return true
}

// Auto-executar no console
if (typeof window !== 'undefined') {
  (window as any).testSupabase = testSupabaseConnection
  console.log('💡 Execute no console: testSupabase()')
}


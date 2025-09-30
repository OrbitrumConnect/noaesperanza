// Utilitários para tratamento de timeout do Supabase
export class SupabaseTimeoutError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'SupabaseTimeoutError'
  }
}

// Função para executar operações do Supabase com timeout
export async function withTimeout<T>(
  promise: Promise<T>, 
  timeoutMs: number = 5000,
  errorMessage: string = 'Operação timeout'
): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) => 
    setTimeout(() => reject(new SupabaseTimeoutError(errorMessage)), timeoutMs)
  )
  
  return Promise.race([promise, timeoutPromise])
}

// Função específica para verificação de autenticação com fallback
export async function verificarAuthComFallback(supabase: any): Promise<any> {
  try {
    // Primeiro tenta getSession (mais rápido)
    const sessionResult = await withTimeout(
      supabase.auth.getSession(),
      2000,
      'Timeout na verificação de sessão'
    ) as any
    
    if (sessionResult?.data?.session?.user) {
      return sessionResult.data.session.user
    }
    
    // Se não há sessão, tenta getUser com timeout maior
    const userResult = await withTimeout(
      supabase.auth.getUser(),
      3000,
      'Timeout na verificação de usuário'
    ) as any
    
    return userResult?.data?.user || null
  } catch (error) {
    console.warn('⚠️ Erro na verificação de autenticação:', error)
    return null
  }
}

// Função para testar conectividade básica
export async function testarConectividade(supabase: any): Promise<boolean> {
  try {
    // Teste com a tabela que sabemos que existe
    const result = await withTimeout(
      supabase.from('avaliacoes_iniciais').select('id').limit(1),
      5000, // Aumentei o timeout para 5 segundos
      'Timeout no teste de conectividade'
    ) as any
    
    if (result?.error) {
      console.warn('⚠️ Erro na tabela avaliacoes_iniciais:', result.error)
      // Se der erro de RLS, tenta um teste mais básico
      const basicResult = await withTimeout(
        supabase.from('_supabase_migrations').select('version').limit(1),
        3000,
        'Timeout no teste básico'
      ) as any
      return !basicResult?.error
    }
    
    return true
  } catch (error) {
    console.warn('⚠️ Teste de conectividade falhou:', error)
    return false
  }
}


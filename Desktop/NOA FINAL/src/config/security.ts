// Configurações de segurança e HTTPS
// Resolve problemas de URL não segura e autenticação

export const SECURITY_CONFIG = {
  // Força HTTPS em produção
  forceHTTPS: process.env.NODE_ENV === 'production',
  
  // Configurações de CORS para Supabase
  supabase: {
    // URLs permitidas para CORS (apenas produção)
    allowedOrigins: [
      'https://noaesperanza.vercel.app',
      'https://lhclqebtkyfftkevumix.supabase.co'
    ],
    
    // Configurações de timeout
    timeout: 30000, // 30 segundos
    
    // Configurações de retry
    retryAttempts: 3,
    retryDelay: 1000 // 1 segundo
  },
  
  // Configurações de voz
  voice: {
    // Requer HTTPS para Speech Recognition
    requiresHTTPS: true,
    
    // Fallback para HTTP (desenvolvimento)
    allowHTTPInDevelopment: process.env.NODE_ENV === 'development'
  }
}

// Função para verificar se está em HTTPS
export const isHTTPS = (): boolean => {
  return window.location.protocol === 'https:'
}

// Função para verificar se pode usar Speech Recognition
export const canUseSpeechRecognition = (): boolean => {
  if (SECURITY_CONFIG.voice.requiresHTTPS && !isHTTPS()) {
    if (!SECURITY_CONFIG.voice.allowHTTPInDevelopment) {
      console.warn('⚠️ Speech Recognition requer HTTPS')
      return false
    }
  }
  return true
}

// Função para mostrar aviso de HTTPS
export const showHTTPSWarning = (): void => {
  if (!isHTTPS()) {
    console.warn(`
⚠️ AVISO DE SEGURANÇA:
Para melhor experiência e segurança, acesse via HTTPS:
https://noaesperanza.vercel.app

Recursos que podem não funcionar em HTTP:
- Speech Recognition (reconhecimento de voz)
- Algumas APIs do navegador
- Autenticação segura
    `)
  }
}

// Função para configurar Supabase com retry
export const configureSupabaseWithRetry = async (supabaseClient: any, operation: () => Promise<any>, retries: number = SECURITY_CONFIG.supabase.retryAttempts): Promise<any> => {
  try {
    return await operation()
  } catch (error) {
    if (retries > 0) {
      console.log(`🔄 Tentativa ${SECURITY_CONFIG.supabase.retryAttempts - retries + 1} falhou, tentando novamente em ${SECURITY_CONFIG.supabase.retryDelay}ms...`)
      await new Promise(resolve => setTimeout(resolve, SECURITY_CONFIG.supabase.retryDelay))
      return configureSupabaseWithRetry(supabaseClient, operation, retries - 1)
    }
    throw error
  }
}

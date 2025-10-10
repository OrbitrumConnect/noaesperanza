import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// Verificar se as credenciais são válidas
const isValidConfig = supabaseUrl && 
                     supabaseKey && 
                     supabaseUrl !== 'https://your-project.supabase.co' && 
                     supabaseKey !== 'your-anon-key' &&
                     !supabaseUrl.includes('your-project')

if (isValidConfig) {
  console.log('✅ Supabase configurado:', supabaseUrl)
} else {
  console.log('💾 Modo LOCAL ativo - usando localStorage (Supabase desabilitado)')
}

// Criar cliente apenas se configurado, senão usa URL fake que não fará requisições
const clientUrl = isValidConfig ? supabaseUrl : 'http://localhost:54321'
const clientKey = isValidConfig ? supabaseKey : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJsb2NhbCIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNjQ1MTkyMDAwLCJleHAiOjE5NjA1NTIwMDB9.fake-key-for-local-mode'

export const supabase = createClient(clientUrl, clientKey)
export const isSupabaseConfigured = isValidConfig

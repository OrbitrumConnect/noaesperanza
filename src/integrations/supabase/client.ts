import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'your-anon-key'

console.log('🔧 Configuração Supabase:')
console.log('URL:', supabaseUrl)
console.log('Key:', supabaseKey ? 'Configurada' : 'Não configurada')

// Verificar se as credenciais são válidas
const isValidConfig = supabaseUrl !== 'https://your-project.supabase.co' && 
                     supabaseKey !== 'your-anon-key'

if (!isValidConfig) {
  console.warn('⚠️ Supabase não configurado - usando modo local')
}

export const supabase = createClient(supabaseUrl, supabaseKey)

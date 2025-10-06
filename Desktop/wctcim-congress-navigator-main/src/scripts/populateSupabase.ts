import { supabase } from '@/lib/supabase-client'
import scientificWorksData from '@/data/scientificWorks.json'

// Script para popular o Supabase com os dados existentes
export const populateSupabase = async () => {
  try {
    console.log('🚀 Iniciando população do Supabase...')

    // Verificar se as tabelas existem
    const { data: tables, error: tablesError } = await supabase
      .from('scientific_works')
      .select('id')
      .limit(1)

    if (tablesError && tablesError.code === 'PGRST205') {
      console.log('❌ Tabelas não existem. Execute o SQL schema primeiro!')
      console.log('📋 Acesse: https://supabase.com/dashboard/project/omvsjvvkfwlemfjwabhk/sql')
      console.log('📄 Execute o arquivo: supabase-schema.sql')
      return false
    }

    // Verificar se já existem dados
    const { data: existingData } = await supabase
      .from('scientific_works')
      .select('id')
      .limit(1)

    if (existingData && existingData.length > 0) {
      console.log('✅ Dados já existem no Supabase!')
      return true
    }

    // Inserir os trabalhos científicos
    const { data, error } = await supabase
      .from('scientific_works')
      .insert(scientificWorksData)
      .select()

    if (error) {
      console.error('❌ Erro ao inserir trabalhos:', error)
      return false
    }

    console.log(`✅ ${data.length} trabalhos inseridos com sucesso!`)
    return true

  } catch (err) {
    console.error('❌ Erro geral:', err)
    return false
  }
}

// Criar tabelas necessárias
const createTables = async () => {
  console.log('📋 Criando tabelas...')

  // SQL para criar a tabela de trabalhos científicos
  const createScientificWorksTable = `
    CREATE TABLE IF NOT EXISTS scientific_works (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      authors JSONB NOT NULL,
      category TEXT NOT NULL CHECK (category IN ('científico', 'relato_experiencia', 'relato_caso')),
      modality TEXT NOT NULL CHECK (modality IN ('oral', 'pôster', 'vídeo')),
      presentation_type TEXT NOT NULL,
      abstract TEXT NOT NULL,
      keywords TEXT[] NOT NULL,
      schedule JSONB NOT NULL,
      location JSONB NOT NULL,
      media JSONB,
      status TEXT NOT NULL,
      institution TEXT NOT NULL,
      region TEXT NOT NULL,
      language TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `

  // SQL para criar a tabela de analytics
  const createAnalyticsTable = `
    CREATE TABLE IF NOT EXISTS analytics (
      id SERIAL PRIMARY KEY,
      metric TEXT NOT NULL,
      value INTEGER DEFAULT 1,
      metadata JSONB,
      date DATE DEFAULT CURRENT_DATE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      UNIQUE(metric, date)
    );
  `

  // SQL para criar índices
  const createIndexes = `
    CREATE INDEX IF NOT EXISTS idx_scientific_works_category ON scientific_works(category);
    CREATE INDEX IF NOT EXISTS idx_scientific_works_modality ON scientific_works(modality);
    CREATE INDEX IF NOT EXISTS idx_scientific_works_schedule_day ON scientific_works USING GIN ((schedule->>'day'));
    CREATE INDEX IF NOT EXISTS idx_scientific_works_keywords ON scientific_works USING GIN (keywords);
    CREATE INDEX IF NOT EXISTS idx_analytics_metric_date ON analytics(metric, date);
  `

  try {
    // Executar as queries
    await supabase.rpc('exec_sql', { sql: createScientificWorksTable })
    await supabase.rpc('exec_sql', { sql: createAnalyticsTable })
    await supabase.rpc('exec_sql', { sql: createIndexes })
    
    console.log('✅ Tabelas criadas com sucesso!')
  } catch (err) {
    console.log('ℹ️ Tabelas já existem ou erro na criação:', err)
  }
}

// Função para executar o script
export const runPopulateScript = async () => {
  const success = await populateSupabase()
  
  if (success) {
    console.log('🎉 Supabase populado com sucesso!')
    console.log('📊 Dados disponíveis:')
    console.log('- 8 trabalhos científicos')
    console.log('- Tabelas de analytics')
    console.log('- Índices otimizados')
  } else {
    console.log('❌ Falha ao popular o Supabase')
  }
  
  return success
}

// Executar automaticamente se chamado diretamente
if (typeof window === 'undefined') {
  runPopulateScript()
}

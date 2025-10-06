import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://omvsjvvkfwlemfjwabhk.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9tdnNqdnZrZndsZW1mandhYmhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwMzUwODcsImV4cCI6MjA3MzYxMTA4N30.e_8N9DtwgoS4PiAMdgFWPJf4dVbBasTUe0hHuMN4FOI'

export const supabase = createClient(supabaseUrl, supabaseKey)

// Tipos para os trabalhos científicos
export interface ScientificWork {
  id: string
  title: string
  authors: Array<{
    name: string
    institution: string
    email: string
    country: string
  }>
  category: 'científico' | 'relato_experiencia' | 'relato_caso'
  modality: 'oral' | 'pôster' | 'vídeo'
  presentationType: 'pesquisa' | 'relato' | 'case' | 'revisao'
  abstract: string
  keywords: string[]
  schedule: {
    day: number
    time: string
    room: string
    duration: number
  }
  location: {
    type: string
    name: string
    coordinates: { x: number; y: number }
  }
  media: {
    pdf?: string
    video?: string
    podcast?: string
  }
  status: string
  institution: string
  region: string
  language: string
  created_at?: string
  updated_at?: string
}

// Funções para trabalhos científicos
export const scientificWorksService = {
  // Buscar todos os trabalhos
  async getAll(): Promise<ScientificWork[]> {
    const { data, error } = await supabase
      .from('scientific_works')
      .select('*')
      .order('schedule->day', { ascending: true })
      .order('schedule->time', { ascending: true })

    if (error) {
      console.error('Erro ao buscar trabalhos:', error)
      return []
    }

    return data || []
  },

  // Buscar por ID
  async getById(id: string): Promise<ScientificWork | null> {
    const { data, error } = await supabase
      .from('scientific_works')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Erro ao buscar trabalho:', error)
      return null
    }

    return data
  },

  // Buscar por categoria
  async getByCategory(category: string): Promise<ScientificWork[]> {
    const { data, error } = await supabase
      .from('scientific_works')
      .select('*')
      .eq('category', category)
      .order('schedule->day', { ascending: true })

    if (error) {
      console.error('Erro ao buscar por categoria:', error)
      return []
    }

    return data || []
  },

  // Buscar por modalidade
  async getByModality(modality: string): Promise<ScientificWork[]> {
    const { data, error } = await supabase
      .from('scientific_works')
      .select('*')
      .eq('modality', modality)
      .order('schedule->day', { ascending: true })

    if (error) {
      console.error('Erro ao buscar por modalidade:', error)
      return []
    }

    return data || []
  },

  // Buscar por dia
  async getByDay(day: number): Promise<ScientificWork[]> {
    const { data, error } = await supabase
      .from('scientific_works')
      .select('*')
      .eq('schedule->day', day)
      .order('schedule->time', { ascending: true })

    if (error) {
      console.error('Erro ao buscar por dia:', error)
      return []
    }

    return data || []
  },

  // Busca por texto
  async search(query: string): Promise<ScientificWork[]> {
    const { data, error } = await supabase
      .from('scientific_works')
      .select('*')
      .or(`title.ilike.%${query}%, abstract.ilike.%${query}%, keywords.cs.{${query}}`)
      .order('schedule->day', { ascending: true })

    if (error) {
      console.error('Erro na busca:', error)
      return []
    }

    return data || []
  },

  // Buscar por palavra-chave
  async getByKeyword(keyword: string): Promise<ScientificWork[]> {
    const { data, error } = await supabase
      .from('scientific_works')
      .select('*')
      .contains('keywords', [keyword])
      .order('schedule->day', { ascending: true })

    if (error) {
      console.error('Erro ao buscar por palavra-chave:', error)
      return []
    }

    return data || []
  },

  // Inserir novo trabalho
  async create(work: Omit<ScientificWork, 'id' | 'created_at' | 'updated_at'>): Promise<ScientificWork | null> {
    const { data, error } = await supabase
      .from('scientific_works')
      .insert([work])
      .select()
      .single()

    if (error) {
      console.error('Erro ao criar trabalho:', error)
      return null
    }

    return data
  },

  // Atualizar trabalho
  async update(id: string, updates: Partial<ScientificWork>): Promise<ScientificWork | null> {
    const { data, error } = await supabase
      .from('scientific_works')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Erro ao atualizar trabalho:', error)
      return null
    }

    return data
  },

  // Deletar trabalho
  async delete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('scientific_works')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Erro ao deletar trabalho:', error)
      return false
    }

    return true
  }
}

// Funções para analytics
export const analyticsService = {
  // Contar visitantes
  async incrementVisitor(): Promise<void> {
    const { error } = await supabase
      .from('analytics')
      .upsert({ 
        metric: 'visitors', 
        value: 1,
        date: new Date().toISOString().split('T')[0]
      }, { 
        onConflict: 'metric,date',
        ignoreDuplicates: false 
      })

    if (error) {
      console.error('Erro ao incrementar visitante:', error)
    }
  },

  // Contar stands visitados
  async incrementStandVisit(standId: number): Promise<void> {
    const { error } = await supabase
      .from('analytics')
      .upsert({ 
        metric: 'stand_visits', 
        value: 1,
        metadata: { stand_id: standId },
        date: new Date().toISOString().split('T')[0]
      }, { 
        onConflict: 'metric,date',
        ignoreDuplicates: false 
      })

    if (error) {
      console.error('Erro ao incrementar visita ao stand:', error)
    }
  },

  // Contar trabalhos visualizados
  async incrementWorkView(workId: string): Promise<void> {
    const { error } = await supabase
      .from('analytics')
      .upsert({ 
        metric: 'work_views', 
        value: 1,
        metadata: { work_id: workId },
        date: new Date().toISOString().split('T')[0]
      }, { 
        onConflict: 'metric,date',
        ignoreDuplicates: false 
      })

    if (error) {
      console.error('Erro ao incrementar visualização de trabalho:', error)
    }
  },

  // Buscar analytics
  async getAnalytics(): Promise<any[]> {
    const { data, error } = await supabase
      .from('analytics')
      .select('*')
      .order('date', { ascending: false })
      .limit(100)

    if (error) {
      console.error('Erro ao buscar analytics:', error)
      return []
    }

    return data || []
  }
}

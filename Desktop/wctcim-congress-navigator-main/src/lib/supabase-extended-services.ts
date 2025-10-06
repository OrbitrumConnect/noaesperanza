import { supabase } from './supabase-client'

// Serviços para palestrantes
export const speakersService = {
  async getAll(): Promise<any[]> {
    const { data, error } = await supabase
      .from('speakers')
      .select('*')
      .order('name', { ascending: true })

    if (error) {
      console.error('Erro ao buscar palestrantes:', error)
      return []
    }

    return data || []
  },

  async getByDay(day: number): Promise<any[]> {
    const { data, error } = await supabase
      .from('schedule')
      .select(`
        *,
        speakers (*)
      `)
      .eq('day', day)
      .order('time_start', { ascending: true })

    if (error) {
      console.error('Erro ao buscar palestrantes por dia:', error)
      return []
    }

    return data || []
  },

  async getById(id: number): Promise<any | null> {
    const { data, error } = await supabase
      .from('speakers')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Erro ao buscar palestrante:', error)
      return null
    }

    return data
  }
}

// Serviços para programação
export const scheduleService = {
  async getByDay(day: number): Promise<any[]> {
    const { data, error } = await supabase
      .from('schedule')
      .select(`
        *,
        speakers (*),
        scientific_works (*)
      `)
      .eq('day', day)
      .order('time_start', { ascending: true })

    if (error) {
      console.error('Erro ao buscar programação:', error)
      return []
    }

    return data || []
  },

  async getByRoom(room: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('schedule')
      .select(`
        *,
        speakers (*),
        scientific_works (*)
      `)
      .eq('room', room)
      .order('time_start', { ascending: true })

    if (error) {
      console.error('Erro ao buscar programação por sala:', error)
      return []
    }

    return data || []
  },

  async getAll(): Promise<any[]> {
    const { data, error } = await supabase
      .from('schedule')
      .select(`
        *,
        speakers (*),
        scientific_works (*)
      `)
      .order('day', { ascending: true })
      .order('time_start', { ascending: true })

    if (error) {
      console.error('Erro ao buscar programação completa:', error)
      return []
    }

    return data || []
  }
}

// Serviços para estands/empresas
export const exhibitorsService = {
  async getAll(): Promise<any[]> {
    const { data, error } = await supabase
      .from('exhibitors')
      .select('*')
      .order('name', { ascending: true })

    if (error) {
      console.error('Erro ao buscar estands:', error)
      return []
    }

    return data || []
  },

  async getByCategory(category: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('exhibitors')
      .select('*')
      .eq('category', category)
      .order('name', { ascending: true })

    if (error) {
      console.error('Erro ao buscar estands por categoria:', error)
      return []
    }

    return data || []
  },

  async getById(id: number): Promise<any | null> {
    const { data, error } = await supabase
      .from('exhibitors')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Erro ao buscar stand:', error)
      return null
    }

    return data
  }
}

// Serviços para salas
export const roomsService = {
  async getAll(): Promise<any[]> {
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .order('name', { ascending: true })

    if (error) {
      console.error('Erro ao buscar salas:', error)
      return []
    }

    return data || []
  },

  async getById(id: number): Promise<any | null> {
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Erro ao buscar sala:', error)
      return null
    }

    return data
  }
}

// Serviços para analytics/interações
export const interactionsService = {
  async trackInteraction(
    interactionType: string,
    targetId: string,
    targetType: string,
    duration?: number,
    metadata?: any
  ): Promise<boolean> {
    const { error } = await supabase
      .from('interactions')
      .insert([{
        interaction_type: interactionType,
        target_id: targetId,
        target_type: targetType,
        duration,
        metadata
      }])

    if (error) {
      console.error('Erro ao registrar interação:', error)
      return false
    }

    return true
  },

  async getAnalytics(metric: string, date?: string): Promise<any[]> {
    const query = supabase
      .from('interactions')
      .select('*')
      .eq('interaction_type', metric)

    if (date) {
      query.gte('created_at', `${date}T00:00:00`)
      query.lt('created_at', `${date}T23:59:59`)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) {
      console.error('Erro ao buscar analytics:', error)
      return []
    }

    return data || []
  },

  async getPopularContent(limit: number = 10): Promise<any[]> {
    const { data, error } = await supabase
      .from('interactions')
      .select('target_id, target_type, count(*)')
      .group('target_id, target_type')
      .order('count', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Erro ao buscar conteúdo popular:', error)
      return []
    }

    return data || []
  }
}

// Serviço unificado para dados do congresso
export const congressService = {
  async getCongressData(day?: number) {
    try {
      const [speakers, schedule, exhibitors, rooms] = await Promise.all([
        speakersService.getAll(),
        day ? scheduleService.getByDay(day) : scheduleService.getAll(),
        exhibitorsService.getAll(),
        roomsService.getAll()
      ])

      return {
        speakers,
        schedule,
        exhibitors,
        rooms,
        day
      }
    } catch (error) {
      console.error('Erro ao buscar dados do congresso:', error)
      return {
        speakers: [],
        schedule: [],
        exhibitors: [],
        rooms: [],
        day
      }
    }
  },

  async getDaySummary(day: number) {
    try {
      const [schedule, speakers] = await Promise.all([
        scheduleService.getByDay(day),
        speakersService.getByDay(day)
      ])

      return {
        day,
        totalSessions: schedule.length,
        totalSpeakers: speakers.length,
        schedule,
        speakers
      }
    } catch (error) {
      console.error('Erro ao buscar resumo do dia:', error)
      return {
        day,
        totalSessions: 0,
        totalSpeakers: 0,
        schedule: [],
        speakers: []
      }
    }
  }
}

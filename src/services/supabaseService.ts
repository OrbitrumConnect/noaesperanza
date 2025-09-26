import { createClient } from '@supabase/supabase-js'

// Configuração do Supabase
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || 'https://lhclqebtkyfftkevumix.supabase.co'
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_PUBLISHABLE_KEY || 'your-anon-key'
const supabaseProjectId = (import.meta as any).env?.VITE_SUPABASE_PROJECT_ID || 'lhclqebtkyfftkevumix'

console.log('🔧 Supabase configurado:', { 
  url: supabaseUrl, 
  projectId: supabaseProjectId,
  hasAnonKey: !!supabaseAnonKey,
  isDefaultUrl: supabaseUrl === 'https://lhclqebtkyfftkevumix.supabase.co'
})

if (!supabaseUrl || !supabaseAnonKey || supabaseAnonKey === 'your-anon-key') {
  console.warn('⚠️ Configuração do Supabase não encontrada. Verifique o arquivo .env')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Funções para dashboard administrativo
export interface AdminMetrics {
  totalUsers: number
  activeSubscriptions: number
  monthlyRevenue: number
  systemUptime: number
  totalDoctors: number
  totalPatients: number
  totalInteractions: number
  aiLearningCount: number
}

export const getAdminMetrics = async (): Promise<AdminMetrics> => {
  try {
    // Buscar contagem de usuários
    const { count: totalUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })

    // Buscar contagem de médicos
    const { count: totalDoctors } = await supabase
      .from('doctors')
      .select('*', { count: 'exact', head: true })

    // Buscar contagem de pacientes
    const { count: totalPatients } = await supabase
      .from('patients')
      .select('*', { count: 'exact', head: true })

    // Buscar contagem de interações da IA
    const { count: totalInteractions } = await supabase
      .from('ai_learning')
      .select('*', { count: 'exact', head: true })

    // Buscar dados de aprendizado da IA
    const { count: aiLearningCount } = await supabase
      .from('ai_keywords')
      .select('*', { count: 'exact', head: true })

    // Calcular receita mensal (simulado baseado em assinaturas)
    const activeSubscriptions = totalUsers || 0
    const monthlyRevenue = activeSubscriptions * 89.90 // Valor da assinatura

    return {
      totalUsers: totalUsers || 0,
      activeSubscriptions: activeSubscriptions,
      monthlyRevenue: monthlyRevenue,
      systemUptime: 99.9, // Simulado
      totalDoctors: totalDoctors || 0,
      totalPatients: totalPatients || 0,
      totalInteractions: totalInteractions || 0,
      aiLearningCount: aiLearningCount || 0
    }
  } catch (error) {
    console.error('Erro ao buscar métricas administrativas:', error)
    // Retornar valores padrão em caso de erro
    return {
      totalUsers: 0,
      activeSubscriptions: 0,
      monthlyRevenue: 0,
      systemUptime: 99.9,
      totalDoctors: 0,
      totalPatients: 0,
      totalInteractions: 0,
      aiLearningCount: 0
    }
  }
}

export const getRecentUsers = async (limit: number = 10) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Erro ao buscar usuários recentes:', error)
    return []
  }
}

export const getSystemStats = async () => {
  try {
    // Buscar estatísticas de uso da IA
    const { data: aiStats } = await supabase
      .from('ai_learning')
      .select('category, usage_count')
      .order('usage_count', { ascending: false })
      .limit(10)

    // Buscar palavras-chave mais usadas
    const { data: topKeywords } = await supabase
      .from('ai_keywords')
      .select('keyword, usage_count, category')
      .order('usage_count', { ascending: false })
      .limit(10)

    return {
      aiStats: aiStats || [],
      topKeywords: topKeywords || []
    }
  } catch (error) {
    console.error('Erro ao buscar estatísticas do sistema:', error)
    return {
      aiStats: [],
      topKeywords: []
    }
  }
}

// Tipos para o banco de dados
export interface User {
  id: string
  email: string
  name: string
  role: 'patient' | 'doctor' | 'admin'
  specialty?: 'rim' | 'neuro' | 'cannabis'
  created_at: string
  updated_at: string
}

export interface Patient {
  id: string
  user_id: string
  cpf: string
  phone: string
  birth_date: string
  address: string
  emergency_contact: string
  medical_history: any
  created_at: string
  updated_at: string
}

export interface Doctor {
  id: string
  user_id: string
  crm: string
  specialty: 'rim' | 'neuro' | 'cannabis'
  phone: string
  consultation_price: number
  available_hours: any
  created_at: string
  updated_at: string
}

export interface Appointment {
  id: string
  patient_id: string
  doctor_id: string
  date: string
  time: string
  status: 'scheduled' | 'completed' | 'cancelled'
  notes: string
  prescription?: string
  created_at: string
  updated_at: string
}

export interface Payment {
  id: string
  user_id: string
  amount: number
  status: 'pending' | 'completed' | 'failed'
  payment_method: 'pix' | 'credit_card'
  mercado_pago_id?: string
  plan: 'basic' | 'premium' | 'enterprise'
  created_at: string
  updated_at: string
}

export interface ClinicalEvaluation {
  id: string
  user_id?: string
  session_id: string
  status: 'in_progress' | 'completed'
  etapa_atual: string
  dados: {
    apresentacao?: string
    cannabis_medicinal?: string
    lista_indiciaria: string[]
    queixa_principal?: string
    desenvolvimento_indiciario?: {
      localizacao?: string
      inicio?: string
      qualidade?: string
      sintomas_associados?: string
      fatores_melhora?: string
      fatores_piora?: string
    }
    historia_patologica: string[]
    historia_familiar: {
      mae: string[]
      pai: string[]
    }
    habitos_vida: string[]
    alergias?: string
    medicacoes?: {
      continuas?: string
      eventuais?: string
    }
    relatorio_narrativo?: string
  }
  created_at: string
  updated_at: string
}

// Serviços de autenticação
export class AuthService {
  async signUp(email: string, password: string, userData: Partial<User>) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    })
    
    if (error) throw error
    return data
  }

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    if (error) throw error
    return data
  }

  async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error
    return user
  }

  async getUserProfile(userId: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (error) throw error
    return data
  }
}

// Serviços de dados
export class DataService {
  // Pacientes
  async getPatients() {
    const { data, error } = await supabase
      .from('patients')
      .select(`
        *,
        users (
          id,
          name,
          email,
          role
        )
      `)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  }

  async getPatient(patientId: string) {
    const { data, error } = await supabase
      .from('patients')
      .select(`
        *,
        users (
          id,
          name,
          email,
          role
        )
      `)
      .eq('id', patientId)
      .single()
    
    if (error) throw error
    return data
  }

  async createPatient(patientData: Partial<Patient>) {
    const { data, error } = await supabase
      .from('patients')
      .insert(patientData)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  // Médicos
  async getDoctors() {
    const { data, error } = await supabase
      .from('doctors')
      .select(`
        *,
        users (
          id,
          name,
          email,
          role
        )
      `)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  }

  async getDoctor(doctorId: string) {
    const { data, error } = await supabase
      .from('doctors')
      .select(`
        *,
        users (
          id,
          name,
          email,
          role
        )
      `)
      .eq('id', doctorId)
      .single()
    
    if (error) throw error
    return data
  }

  // Consultas
  async getAppointments(doctorId?: string, patientId?: string) {
    let query = supabase
      .from('appointments')
      .select(`
        *,
        patients (
          id,
          users (
            name,
            email
          )
        ),
        doctors (
          id,
          users (
            name,
            email
          )
        )
      `)
      .order('date', { ascending: true })

    if (doctorId) {
      query = query.eq('doctor_id', doctorId)
    }
    
    if (patientId) {
      query = query.eq('patient_id', patientId)
    }

    const { data, error } = await query
    if (error) throw error
    return data
  }

  async createAppointment(appointmentData: Partial<Appointment>) {
    const { data, error } = await supabase
      .from('appointments')
      .insert(appointmentData)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  async updateAppointment(appointmentId: string, updates: Partial<Appointment>) {
    const { data, error } = await supabase
      .from('appointments')
      .update(updates)
      .eq('id', appointmentId)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  // Pagamentos
  async getPayments(userId?: string) {
    let query = supabase
      .from('payments')
      .select('*')
      .order('created_at', { ascending: false })

    if (userId) {
      query = query.eq('user_id', userId)
    }

    const { data, error } = await query
    if (error) throw error
    return data
  }

  async createPayment(paymentData: Partial<Payment>) {
    const { data, error } = await supabase
      .from('payments')
      .insert(paymentData)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  async updatePayment(paymentId: string, updates: Partial<Payment>) {
    const { data, error } = await supabase
      .from('payments')
      .update(updates)
      .eq('id', paymentId)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  // Avaliações Clínicas
  async createClinicalEvaluation(evaluationData: Partial<ClinicalEvaluation>) {
    const { data, error } = await supabase
      .from('clinical_evaluations')
      .insert(evaluationData)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  async updateClinicalEvaluation(evaluationId: string, updates: Partial<ClinicalEvaluation>) {
    const { data, error } = await supabase
      .from('clinical_evaluations')
      .update(updates)
      .eq('id', evaluationId)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  async getClinicalEvaluation(evaluationId: string) {
    const { data, error } = await supabase
      .from('clinical_evaluations')
      .select('*')
      .eq('id', evaluationId)
      .single()
    
    if (error) throw error
    return data
  }

  async getClinicalEvaluationsByUser(userId: string) {
    const { data, error } = await supabase
      .from('clinical_evaluations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  }

  async getClinicalEvaluationBySession(sessionId: string) {
    const { data, error } = await supabase
      .from('clinical_evaluations')
      .select('*')
      .eq('session_id', sessionId)
      .single()
    
    if (error) throw error
    return data
  }
}

// Instâncias dos serviços
export const authService = new AuthService()
export const dataService = new DataService()

// Stub para compatibilidade com noaGPT
export const supabaseService = {
  async salvarArquivoViaTexto(message: string): Promise<string> {
    console.log('📁 Supabase Service: Funcionalidade em desenvolvimento')
    return `💾 Supabase: Funcionalidade em desenvolvimento. Comando recebido: "${message}"`
  }
}
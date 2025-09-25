import { createClient } from '@supabase/supabase-js'

// Configuração do Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Configuração do Supabase não encontrada')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

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
}

// Instâncias dos serviços
export const authService = new AuthService()
export const dataService = new DataService()

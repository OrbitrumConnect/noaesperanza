/**
 * 🔗 SHARING SERVICE - Compartilhamento de Dados
 * 
 * Gerencia compartilhamento de relatórios entre pacientes e médicos
 * Sistema de permissões granular
 * Notificações automáticas
 * Compliance com LGPD
 * 
 * @version 1.0.0
 * @date 2025-10-09
 */

import { supabase } from '../integrations/supabase/client'
import { consentService } from './consentService'

// ========================================
// TIPOS E INTERFACES
// ========================================

export interface SharedReport {
  id: string
  patient_id: string
  doctor_id: string
  report_id: string
  permission_level: 1 | 2 | 3 // 1: read, 2: read+comment, 3: full
  shared_at: string
  status: 'active' | 'revoked'
  notes?: string
  doctor_notes?: string
}

export interface SharingResult {
  success: boolean
  sharedReportId?: string
  error?: string
}

export interface Doctor {
  id: string
  name: string
  email: string
  specialty: string
  crm: string
}

// ========================================
// SHARING SERVICE
// ========================================

export const sharingService = {
  
  /**
   * Compartilha relatório com médico
   */
  async shareReportWithDoctor(
    patientId: string,
    doctorId: string,
    reportId: string,
    permissionLevel: 1 | 2 | 3 = 1
  ): Promise<SharingResult> {
    try {
      // 1. Verificar consentimento de compartilhamento
      const hasConsent = await consentService.hasConsent(patientId, 'dataSharing')
      
      if (!hasConsent) {
        return {
          success: false,
          error: 'Você precisa autorizar compartilhamento de dados nas configurações'
        }
      }
      
      // 2. Verificar se relatório existe
      const { data: report, error: reportError } = await supabase
        .from('avaliacoes_iniciais')
        .select('id, user_id')
        .eq('id', reportId)
        .eq('user_id', patientId)
        .single()
      
      if (reportError || !report) {
        return {
          success: false,
          error: 'Relatório não encontrado ou você não tem permissão'
        }
      }
      
      // 3. Verificar se médico existe
      const { data: doctor, error: doctorError } = await supabase
        .from('profiles')
        .select('id, name, role')
        .eq('id', doctorId)
        .eq('role', 'doctor')
        .single()
      
      if (doctorError || !doctor) {
        return {
          success: false,
          error: 'Médico não encontrado'
        }
      }
      
      // 4. Verificar se já existe compartilhamento ativo
      const { data: existing } = await supabase
        .from('shared_reports')
        .select('id, status')
        .eq('patient_id', patientId)
        .eq('doctor_id', doctorId)
        .eq('report_id', reportId)
        .single()
      
      if (existing && existing.status === 'active') {
        return {
          success: true,
          sharedReportId: existing.id
        }
      }
      
      // 5. Criar novo compartilhamento
      const { data, error } = await supabase
        .from('shared_reports')
        .insert({
          patient_id: patientId,
          doctor_id: doctorId,
          report_id: reportId,
          permission_level: permissionLevel,
          status: 'active',
          shared_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error
      
      // 6. Criar notificação para o médico
      await this.createNotification(
        doctorId,
        'report_shared',
        'Novo Relatório Compartilhado',
        `Um paciente compartilhou um relatório clínico com você`,
        `/app/medico?report=${reportId}`,
        'normal'
      )
      
      console.log(`✅ [SharingService] Relatório compartilhado com sucesso`)
      
      return {
        success: true,
        sharedReportId: data.id
      }
      
    } catch (error: any) {
      console.error('[SharingService] Erro ao compartilhar relatório:', error)
      return {
        success: false,
        error: error.message || 'Erro ao compartilhar relatório'
      }
    }
  },
  
  /**
   * Busca relatórios compartilhados com médico
   */
  async getDoctorSharedReports(doctorId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('shared_reports')
        .select(`
          *,
          report:avaliacoes_iniciais(
            id,
            relatorio_narrativo,
            nft_hash,
            status,
            created_at,
            updated_at
          ),
          patient:profiles!patient_id(
            id,
            name,
            email
          )
        `)
        .eq('doctor_id', doctorId)
        .eq('status', 'active')
        .order('shared_at', { ascending: false })

      if (error) throw error
      
      console.log(`📊 [SharingService] ${data?.length || 0} relatórios compartilhados com médico`)
      
      return data || []
      
    } catch (error) {
      console.error('[SharingService] Erro ao buscar relatórios compartilhados:', error)
      return []
    }
  },
  
  /**
   * Busca médicos disponíveis para compartilhamento
   */
  async getAvailableDoctors(specialty?: string): Promise<Doctor[]> {
    try {
      let query = supabase
        .from('profiles')
        .select('id, name, email, specialty, crm')
        .eq('role', 'doctor')
        .order('name')
      
      if (specialty) {
        query = query.eq('specialty', specialty)
      }
      
      const { data, error } = await query
      
      if (error) throw error
      
      return data || []
      
    } catch (error) {
      console.error('[SharingService] Erro ao buscar médicos:', error)
      return []
    }
  },
  
  /**
   * Revoga compartilhamento
   */
  async revokeSharing(
    sharedReportId: string,
    reason?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('shared_reports')
        .update({
          status: 'revoked',
          notes: reason || 'Compartilhamento revogado pelo paciente',
          updated_at: new Date().toISOString()
        })
        .eq('id', sharedReportId)

      if (error) throw error
      
      console.log(`✅ [SharingService] Compartilhamento revogado`)
      
      return { success: true }
      
    } catch (error: any) {
      console.error('[SharingService] Erro ao revogar compartilhamento:', error)
      return {
        success: false,
        error: error.message || 'Erro ao revogar compartilhamento'
      }
    }
  },
  
  /**
   * Busca compartilhamentos do paciente
   */
  async getPatientSharings(patientId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('shared_reports')
        .select(`
          *,
          doctor:profiles!doctor_id(
            id,
            name,
            email,
            specialty
          )
        `)
        .eq('patient_id', patientId)
        .eq('status', 'active')
        .order('shared_at', { ascending: false })

      if (error) throw error
      
      return data || []
      
    } catch (error) {
      console.error('[SharingService] Erro ao buscar compartilhamentos:', error)
      return []
    }
  },
  
  /**
   * Médico adiciona anotação em relatório compartilhado
   */
  async addDoctorNote(
    sharedReportId: string,
    doctorId: string,
    note: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('shared_reports')
        .update({
          doctor_notes: note,
          updated_at: new Date().toISOString()
        })
        .eq('id', sharedReportId)
        .eq('doctor_id', doctorId) // Apenas o médico dono pode adicionar nota

      if (error) throw error
      
      console.log(`✅ [SharingService] Nota do médico adicionada`)
      
      return { success: true }
      
    } catch (error: any) {
      console.error('[SharingService] Erro ao adicionar nota:', error)
      return {
        success: false,
        error: error.message || 'Erro ao adicionar nota'
      }
    }
  },
  
  /**
   * Criar notificação
   */
  async createNotification(
    userId: string,
    type: string,
    title: string,
    message: string,
    link?: string,
    priority: 'urgent' | 'high' | 'normal' | 'low' = 'normal'
  ): Promise<void> {
    try {
      await supabase.from('notifications').insert({
        user_id: userId,
        type,
        title,
        message,
        link: link || null,
        priority,
        read: false,
        created_at: new Date().toISOString()
      })
      
      console.log(`🔔 [SharingService] Notificação criada para usuário ${userId}`)
      
    } catch (error) {
      console.error('[SharingService] Erro ao criar notificação:', error)
    }
  },
  
  /**
   * Busca notificações não lidas
   */
  async getUnreadNotifications(userId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .eq('read', false)
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) throw error
      
      return data || []
      
    } catch (error) {
      console.error('[SharingService] Erro ao buscar notificações:', error)
      return []
    }
  },
  
  /**
   * Marca notificação como lida
   */
  async markAsRead(notificationId: string): Promise<void> {
    try {
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId)
        
    } catch (error) {
      console.error('[SharingService] Erro ao marcar como lida:', error)
    }
  },
  
  /**
   * Marca todas notificações como lidas
   */
  async markAllAsRead(userId: string): Promise<void> {
    try {
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', userId)
        .eq('read', false)
        
      console.log(`✅ [SharingService] Todas notificações marcadas como lidas`)
      
    } catch (error) {
      console.error('[SharingService] Erro ao marcar todas como lidas:', error)
    }
  }
}


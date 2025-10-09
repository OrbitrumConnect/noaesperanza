/**
 * 🔐 CONSENT SERVICE - Sistema de Consentimentos LGPD
 * 
 * Gerencia todos os consentimentos do usuário
 * Compliance com LGPD (Lei Geral de Proteção de Dados)
 * Rastreabilidade completa
 * 
 * @version 1.0.0
 * @date 2025-10-09
 */

import { supabase } from '../integrations/supabase/client'

// ========================================
// TIPOS E INTERFACES
// ========================================

export type ConsentType =
  | 'lgpd'                  // Política de Privacidade LGPD (obrigatório)
  | 'termsOfUse'            // Termos de Uso (obrigatório)
  | 'dataSharing'           // Compartilhar dados com médicos (opcional)
  | 'research'              // Usar dados para pesquisa anonimizada (opcional)
  | 'emailNotifications'    // Receber notificações por email (opcional)
  | 'smsNotifications'      // Receber notificações por SMS (opcional)

export interface UserConsent {
  id: string
  user_id: string
  consent_type: ConsentType
  consent_given: boolean
  consent_date: string
  revoked_date?: string
  metadata?: Record<string, any>
  created_at: string
  updated_at: string
}

export interface ConsentSummary {
  lgpd: boolean
  termsOfUse: boolean
  dataSharing: boolean
  research: boolean
  emailNotifications: boolean
  smsNotifications: boolean
  allMandatoryGiven: boolean
}

// ========================================
// CONSENT SERVICE
// ========================================

export const consentService = {
  
  /**
   * Salva consentimento de usuário
   */
  async saveConsent(
    userId: string,
    consentType: ConsentType,
    consentGiven: boolean,
    metadata?: Record<string, any>
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.from('user_consents').insert({
        user_id: userId,
        consent_type: consentType,
        consent_given: consentGiven,
        consent_date: new Date().toISOString(),
        metadata: metadata || {}
      })

      if (error) throw error
      
      console.log(`✅ [ConsentService] Consentimento salvo: ${consentType} = ${consentGiven}`)
      
      return { success: true }
      
    } catch (error: any) {
      console.error('[ConsentService] Erro ao salvar consentimento:', error)
      return { 
        success: false, 
        error: error.message || 'Erro ao salvar consentimento' 
      }
    }
  },
  
  /**
   * Salva múltiplos consentimentos de uma vez
   */
  async saveMultipleConsents(
    userId: string,
    consents: Record<ConsentType, boolean>,
    metadata?: Record<string, any>
  ): Promise<{ success: boolean; saved: number; errors: string[] }> {
    const errors: string[] = []
    let saved = 0
    
    for (const [consentType, consentGiven] of Object.entries(consents)) {
      const result = await this.saveConsent(
        userId,
        consentType as ConsentType,
        consentGiven,
        metadata
      )
      
      if (result.success) {
        saved++
      } else {
        errors.push(`${consentType}: ${result.error}`)
      }
    }
    
    return {
      success: errors.length === 0,
      saved,
      errors
    }
  },
  
  /**
   * Busca todos os consentimentos de um usuário
   */
  async getUserConsents(userId: string): Promise<UserConsent[]> {
    try {
      const { data, error } = await supabase
        .from('user_consents')
        .select('*')
        .eq('user_id', userId)
        .is('revoked_date', null) // Apenas ativos
        .order('created_at', { ascending: false })

      if (error) throw error
      
      return data || []
      
    } catch (error) {
      console.error('[ConsentService] Erro ao buscar consentimentos:', error)
      return []
    }
  },
  
  /**
   * Busca resumo dos consentimentos do usuário
   */
  async getConsentSummary(userId: string): Promise<ConsentSummary> {
    const consents = await this.getUserConsents(userId)
    
    const summary: ConsentSummary = {
      lgpd: false,
      termsOfUse: false,
      dataSharing: false,
      research: false,
      emailNotifications: false,
      smsNotifications: false,
      allMandatoryGiven: false
    }
    
    consents.forEach(consent => {
      if (consent.consent_type in summary) {
        summary[consent.consent_type as keyof ConsentSummary] = consent.consent_given as any
      }
    })
    
    // Verificar se todos os obrigatórios foram dados
    summary.allMandatoryGiven = summary.lgpd && summary.termsOfUse
    
    return summary
  },
  
  /**
   * Verifica se usuário deu consentimento específico
   */
  async hasConsent(userId: string, consentType: ConsentType): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('user_consents')
        .select('consent_given')
        .eq('user_id', userId)
        .eq('consent_type', consentType)
        .is('revoked_date', null)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (error) return false
      
      return data?.consent_given || false
      
    } catch (error) {
      return false
    }
  },
  
  /**
   * Revoga consentimento
   */
  async revokeConsent(
    userId: string,
    consentType: ConsentType,
    reason?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('user_consents')
        .update({
          revoked_date: new Date().toISOString(),
          metadata: supabase.rpc('jsonb_set', {
            target: 'metadata',
            path: '{revocation_reason}',
            value: reason || 'User requested'
          }),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('consent_type', consentType)
        .is('revoked_date', null)

      if (error) throw error
      
      console.log(`✅ [ConsentService] Consentimento revogado: ${consentType}`)
      
      return { success: true }
      
    } catch (error: any) {
      console.error('[ConsentService] Erro ao revogar consentimento:', error)
      return { 
        success: false, 
        error: error.message || 'Erro ao revogar consentimento' 
      }
    }
  },
  
  /**
   * Atualiza consentimento (revoga anterior e cria novo)
   */
  async updateConsent(
    userId: string,
    consentType: ConsentType,
    consentGiven: boolean,
    reason?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Revogar consentimento anterior
      await this.revokeConsent(userId, consentType, reason)
      
      // Criar novo consentimento
      return await this.saveConsent(userId, consentType, consentGiven, {
        update_reason: reason || 'User updated preference'
      })
      
    } catch (error: any) {
      console.error('[ConsentService] Erro ao atualizar consentimento:', error)
      return { 
        success: false, 
        error: error.message || 'Erro ao atualizar consentimento' 
      }
    }
  },
  
  /**
   * Valida se usuário pode prosseguir com ação
   */
  async validateForAction(
    userId: string,
    requiredConsents: ConsentType[]
  ): Promise<{ valid: boolean; missing: ConsentType[] }> {
    const missing: ConsentType[] = []
    
    for (const consentType of requiredConsents) {
      const hasIt = await this.hasConsent(userId, consentType)
      if (!hasIt) {
        missing.push(consentType)
      }
    }
    
    return {
      valid: missing.length === 0,
      missing
    }
  },
  
  /**
   * Exporta consentimentos do usuário (LGPD - direito do titular)
   */
  async exportUserConsents(userId: string): Promise<string> {
    const consents = await this.getUserConsents(userId)
    
    let exportText = `RELATÓRIO DE CONSENTIMENTOS - LGPD\n`
    exportText += `Data: ${new Date().toLocaleString('pt-BR')}\n`
    exportText += `Usuário ID: ${userId}\n`
    exportText += `\n═══════════════════════════════════════\n\n`
    
    consents.forEach(consent => {
      exportText += `Tipo: ${consent.consent_type}\n`
      exportText += `Consentimento dado: ${consent.consent_given ? 'SIM' : 'NÃO'}\n`
      exportText += `Data: ${new Date(consent.consent_date).toLocaleString('pt-BR')}\n`
      if (consent.revoked_date) {
        exportText += `Revogado em: ${new Date(consent.revoked_date).toLocaleString('pt-BR')}\n`
      }
      exportText += `\n───────────────────────────────────────\n\n`
    })
    
    return exportText
  }
}


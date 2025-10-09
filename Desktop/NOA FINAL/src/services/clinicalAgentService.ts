/**
 * Serviço do Agente Clínico - Nôa Esperanza
 * Especialista em avaliação clínica inicial com restrições de segurança
 */

import { supabase } from '../integrations/supabase/client'
import { openAIService } from './openaiService'
import { clinicalAssessmentService, ClinicalReport } from './clinicalAssessmentService'
import { logger } from '../utils/logger'

export interface PatientContext {
  userId: string
  userEmail: string
  patientName: string
  consentGiven: boolean
  nftHash: string | null
  sessionId: string
  permissions: {
    canAccessClinicalData: boolean
    canGenerateReports: boolean
    canCreateNFT: boolean
    lgpdCompliant: boolean
  }
}

export interface ClinicalSession {
  id: string
  patientId: string
  sessionType: 'assessment' | 'consultation' | 'followup'
  status: 'active' | 'completed' | 'cancelled'
  startedAt: Date
  completedAt?: Date
  assessmentReport?: ClinicalReport
  nftHash?: string
  lgpdCompliance: {
    consentGiven: boolean
    dataRetention: number // dias
    purpose: string
    lawfulBasis: string
  }
}

export class ClinicalAgentService {
  private activeSessions: Map<string, ClinicalSession> = new Map()

  /**
   * Inicializar sessão clínica para paciente
   */
  async initializePatientSession(patientContext: PatientContext): Promise<ClinicalSession> {
    try {
      logger.info('🏥 Inicializando sessão clínica para paciente', {
        userId: patientContext.userId,
        sessionId: patientContext.sessionId,
      })

      // Verificar permissões LGPD
      if (!patientContext.permissions.lgpdCompliant) {
        throw new Error('Sessão não autorizada: LGPD não cumprida')
      }

      if (!patientContext.consentGiven) {
        throw new Error('Sessão não autorizada: Consentimento não fornecido')
      }

      // Criar sessão clínica
      const session: ClinicalSession = {
        id: patientContext.sessionId,
        patientId: patientContext.userId,
        sessionType: 'assessment',
        status: 'active',
        startedAt: new Date(),
        lgpdCompliance: {
          consentGiven: patientContext.consentGiven,
          dataRetention: 365, // 1 ano
          purpose: 'Avaliação clínica inicial para consulta médica',
          lawfulBasis: 'Consentimento explícito do paciente',
        },
      }

      // Salvar no Supabase
      await this.saveSessionToDatabase(session)

      // Armazenar sessão ativa
      this.activeSessions.set(session.id, session)

      logger.info('✅ Sessão clínica inicializada com sucesso', { sessionId: session.id })
      return session
    } catch (error) {
      logger.error('❌ Erro ao inicializar sessão clínica', error)
      throw error
    }
  }

  /**
   * Processar mensagem do paciente com contexto clínico
   */
  async processPatientMessage(
    message: string,
    patientContext: PatientContext,
    sessionId: string
  ): Promise<{
    response: string
    action: string
    data?: any
    requiresConsent?: boolean
  }> {
    try {
      logger.info('💬 Processando mensagem do paciente', {
        sessionId,
        messageLength: message.length,
      })

      // Verificar se sessão está ativa
      const session = this.activeSessions.get(sessionId)
      if (!session || session.status !== 'active') {
        return {
          response: 'Sua sessão expirou. Por favor, inicie uma nova avaliação clínica.',
          action: 'session_expired',
          requiresConsent: true,
        }
      }

      // Verificar permissões
      if (!this.hasPermissionToProcess(patientContext, message)) {
        return {
          response:
            'Desculpe, não tenho permissão para processar esta solicitação. Verifique se forneceu o consentimento necessário.',
          action: 'permission_denied',
          requiresConsent: true,
        }
      }

      // Processar com Nôa Esperanza especialista
      const noaResponse = await this.generateClinicalResponse(message, patientContext, session)

      // Salvar interação
      await this.savePatientInteraction(sessionId, message, noaResponse, patientContext)

      return {
        response: noaResponse,
        action: 'clinical_response',
        data: {
          sessionId,
          timestamp: new Date(),
          lgpdCompliant: true,
        },
      }
    } catch (error) {
      logger.error('❌ Erro ao processar mensagem do paciente', error)
      return {
        response: 'Desculpe, ocorreu um erro interno. Tente novamente em alguns momentos.',
        action: 'error',
        requiresConsent: false,
      }
    }
  }

  /**
   * Gerar resposta clínica especializada
   */
  private async generateClinicalResponse(
    message: string,
    patientContext: PatientContext,
    session: ClinicalSession
  ): Promise<string> {
    // Prompt especializado para Nôa Esperanza como agente clínico
    const clinicalPrompt = `
Você é Nôa Esperanza, assistente médica especializada em avaliação clínica inicial.

CONTEXTO DO PACIENTE:
- Nome: ${patientContext.patientName}
- ID da Sessão: ${session.id}
- Status LGPD: ✅ Cumprido
- Consentimento: ✅ Fornecido

RESTRIÇÕES DE SEGURANÇA:
- NUNCA forneça diagnósticos ou prescrições
- NUNCA substitua consulta médica presencial
- SEMPRE mantenha confidencialidade total
- SEMPRE registre apenas com consentimento explícito
- SEMPRE explique o propósito da coleta de dados

FUNÇÃO PRINCIPAL:
Conduzir avaliação clínica inicial baseada no método do Dr. Ricardo Valença para:
1. Triagem para consultas clínicas
2. Coleta de dados primários estruturados
3. Preparação para atendimento médico

RESPOSTA ESPECIALIZADA:
Responda de forma empática, profissional e segura, focando em:
- Escuta ativa e respeitosa
- Coleta de informações relevantes
- Orientação sobre próximos passos
- Manutenção da confidencialidade

MENSAGEM DO PACIENTE: "${message}"

Responda como Nôa Esperanza especialista em avaliação clínica:
    `

    try {
      const response = await openAIService.getNoaResponse(message, [
        { role: 'system', content: clinicalPrompt },
      ])

      return (
        response || 'Desculpe, não consegui processar sua mensagem. Pode reformular sua pergunta?'
      )
    } catch (error) {
      logger.error('❌ Erro ao gerar resposta clínica', error)
      return 'Estou com dificuldades técnicas no momento. Por favor, tente novamente.'
    }
  }

  /**
   * Verificar permissões para processar mensagem
   */
  private hasPermissionToProcess(patientContext: PatientContext, message: string): boolean {
    // Verificar LGPD
    if (!patientContext.permissions.lgpdCompliant) {
      return false
    }

    // Verificar consentimento
    if (!patientContext.consentGiven) {
      return false
    }

    // Verificar acesso a dados clínicos
    if (!patientContext.permissions.canAccessClinicalData) {
      return false
    }

    // Verificar se mensagem não contém informações sensíveis não autorizadas
    const sensitiveKeywords = ['diagnóstico', 'prescrição', 'medicamento específico']
    const lowerMessage = message.toLowerCase()

    for (const keyword of sensitiveKeywords) {
      if (lowerMessage.includes(keyword)) {
        logger.warn('⚠️ Tentativa de acesso a informação sensível', { keyword, message })
        return false
      }
    }

    return true
  }

  /**
   * Salvar sessão no banco de dados
   */
  private async saveSessionToDatabase(session: ClinicalSession): Promise<void> {
    try {
      const { error } = await supabase.from('clinical_sessions').insert({
        id: session.id,
        patient_id: session.patientId,
        session_type: session.sessionType,
        status: session.status,
        started_at: session.startedAt.toISOString(),
        lgpd_compliance: JSON.stringify(session.lgpdCompliance),
        created_at: new Date().toISOString(),
      })

      if (error) {
        logger.error('❌ Erro ao salvar sessão no Supabase', error)
        throw error
      }

      logger.info('✅ Sessão salva no banco de dados', { sessionId: session.id })
    } catch (error) {
      logger.error('❌ Erro ao salvar sessão', error)
      throw error
    }
  }

  /**
   * Salvar interação do paciente
   */
  private async savePatientInteraction(
    sessionId: string,
    patientMessage: string,
    noaResponse: string,
    patientContext: PatientContext
  ): Promise<void> {
    try {
      const { error } = await supabase.from('patient_interactions').insert({
        session_id: sessionId,
        patient_id: patientContext.userId,
        patient_message: patientMessage,
        noa_response: noaResponse,
        lgpd_compliant: true,
        consent_verified: patientContext.consentGiven,
        nft_hash: patientContext.nftHash,
        created_at: new Date().toISOString(),
      })

      if (error) {
        logger.error('❌ Erro ao salvar interação do paciente', error)
        // Não falhar a operação por erro de log
      } else {
        logger.info('✅ Interação do paciente salva', { sessionId })
      }
    } catch (error) {
      logger.error('❌ Erro ao salvar interação', error)
    }
  }

  /**
   * Finalizar sessão clínica
   */
  async completeClinicalSession(
    sessionId: string,
    assessmentReport?: ClinicalReport,
    nftHash?: string
  ): Promise<boolean> {
    try {
      const session = this.activeSessions.get(sessionId)
      if (!session) {
        logger.warn('⚠️ Sessão não encontrada para finalização', { sessionId })
        return false
      }

      // Atualizar sessão
      session.status = 'completed'
      session.completedAt = new Date()
      session.assessmentReport = assessmentReport
      session.nftHash = nftHash

      // Salvar no banco
      const { error } = await supabase
        .from('clinical_sessions')
        .update({
          status: 'completed',
          completed_at: session.completedAt.toISOString(),
          assessment_report: assessmentReport ? JSON.stringify(assessmentReport) : null,
          nft_hash: nftHash,
        })
        .eq('id', sessionId)

      if (error) {
        logger.error('❌ Erro ao finalizar sessão', error)
        return false
      }

      // Remover da memória ativa
      this.activeSessions.delete(sessionId)

      logger.info('✅ Sessão clínica finalizada', { sessionId })
      return true
    } catch (error) {
      logger.error('❌ Erro ao finalizar sessão clínica', error)
      return false
    }
  }

  /**
   * Obter sessões ativas do paciente
   */
  async getPatientActiveSessions(patientId: string): Promise<ClinicalSession[]> {
    try {
      const { data, error } = await supabase
        .from('clinical_sessions')
        .select('*')
        .eq('patient_id', patientId)
        .eq('status', 'active')
        .order('started_at', { ascending: false })

      if (error) {
        logger.error('❌ Erro ao buscar sessões ativas', error)
        return []
      }

      return (
        data?.map(session => ({
          id: session.id,
          patientId: session.patient_id,
          sessionType: session.session_type,
          status: session.status,
          startedAt: new Date(session.started_at),
          completedAt: session.completed_at ? new Date(session.completed_at) : undefined,
          lgpdCompliance: JSON.parse(session.lgpd_compliance || '{}'),
        })) || []
      )
    } catch (error) {
      logger.error('❌ Erro ao buscar sessões do paciente', error)
      return []
    }
  }

  /**
   * Verificar compliance LGPD
   */
  validateLGPDCompliance(patientContext: PatientContext): {
    compliant: boolean
    issues: string[]
    recommendations: string[]
  } {
    const issues: string[] = []
    const recommendations: string[] = []

    if (!patientContext.consentGiven) {
      issues.push('Consentimento não fornecido')
      recommendations.push('Solicitar consentimento explícito antes de iniciar')
    }

    if (!patientContext.permissions.lgpdCompliant) {
      issues.push('LGPD não cumprida')
      recommendations.push('Verificar políticas de privacidade')
    }

    if (!patientContext.permissions.canAccessClinicalData) {
      issues.push('Sem permissão para dados clínicos')
      recommendations.push('Verificar níveis de acesso do usuário')
    }

    return {
      compliant: issues.length === 0,
      issues,
      recommendations,
    }
  }
}

// Instância global do serviço
export const clinicalAgentService = new ClinicalAgentService()

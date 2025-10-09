/**
 * Serviço de Avaliação Clínica Inicial - Nôa Esperanza
 * Baseado no método desenvolvido pelo Dr. Ricardo Valença
 */

export interface ClinicalAssessmentData {
  id: string
  userId: string
  timestamp: Date
  stage: AssessmentStage
  responses: AssessmentResponse[]
  finalReport?: ClinicalReport
  nftHash?: string
  status: 'in_progress' | 'completed' | 'pending_consent'
}

export interface AssessmentResponse {
  question: string
  answer: string
  timestamp: Date
  category: 'identification' | 'complaints' | 'history' | 'family' | 'habits' | 'medications'
}

export interface ClinicalReport {
  patientName: string
  mainComplaint: string
  complaintsList: string[]
  developmentDetails: string
  medicalHistory: string[]
  familyHistory: {
    maternal: string[]
    paternal: string[]
  }
  lifestyleHabits: string[]
  medications: {
    regular: string[]
    sporadic: string[]
  }
  allergies: string[]
  summary: string
  recommendations: string[]
}

export type AssessmentStage = 
  | 'identification'
  | 'complaints_list'
  | 'main_complaint'
  | 'complaint_development'
  | 'medical_history'
  | 'family_history'
  | 'lifestyle_habits'
  | 'medications_allergies'
  | 'review'
  | 'final_report'
  | 'completed'

import { supabase } from '../integrations/supabase/client'

export class ClinicalAssessmentService {
  private currentAssessment: ClinicalAssessmentData | null = null
  private assessmentResponses: AssessmentResponse[] = []

  /**
   * Inicia nova avaliação clínica
   */
  startAssessment(userId: string): ClinicalAssessmentData {
    this.currentAssessment = {
      id: `assessment_${Date.now()}`,
      userId,
      timestamp: new Date(),
      stage: 'identification',
      responses: [],
      status: 'in_progress'
    }

    this.assessmentResponses = []
    return this.currentAssessment
  }

  /**
   * Obtém próxima pergunta baseada no estágio atual
   */
  getNextQuestion(): string {
    if (!this.currentAssessment) {
      throw new Error('Nenhuma avaliação ativa')
    }

    const stage = this.currentAssessment.stage
    const responses = this.assessmentResponses

    switch (stage) {
      case 'identification':
        if (responses.length === 0) {
          return "Olá! Eu sou Nôa Esperanza. Por favor, apresente-se também e vamos iniciar a sua avaliação inicial para consultas com Dr. Ricardo Valença."
        }
        if (responses.length === 1) {
          return "O que trouxe você à nossa avaliação hoje?"
        }
        this.advanceStage()
        return this.getNextQuestion()

      case 'complaints_list':
        if (responses.filter(r => r.category === 'complaints').length === 0) {
          return "O que trouxe você à nossa avaliação hoje?"
        }
        const lastComplaintResponse = responses.filter(r => r.category === 'complaints').slice(-1)[0]
        if (lastComplaintResponse && lastComplaintResponse.answer.toLowerCase().includes('não') && 
            lastComplaintResponse.answer.toLowerCase().includes('mais')) {
          this.advanceStage()
          return this.getNextQuestion()
        }
        return "O que mais?"

      case 'main_complaint':
        const complaints = responses.filter(r => r.category === 'complaints').map(r => r.answer)
        return `De todas essas questões (${complaints.join(', ')}), qual mais o(a) incomoda?`

      case 'complaint_development':
        const mainComplaint = responses.filter(r => r.category === 'complaints').slice(-1)[0]?.answer
        const developmentResponses = responses.filter(r => r.category === 'complaints' && r.question.includes('Onde'))
        
        if (developmentResponses.length === 0) {
          return `Vamos explorar suas questões mais detalhadamente. Onde você sente ${mainComplaint}?`
        }
        if (developmentResponses.length === 1) {
          return `Quando essa ${mainComplaint} começou?`
        }
        if (developmentResponses.length === 2) {
          return `Como é a ${mainComplaint}?`
        }
        if (developmentResponses.length === 3) {
          return `O que mais você sente quando está com a ${mainComplaint}?`
        }
        if (developmentResponses.length === 4) {
          return `O que parece melhorar a ${mainComplaint}?`
        }
        if (developmentResponses.length === 5) {
          return `O que parece piorar a ${mainComplaint}?`
        }
        this.advanceStage()
        return this.getNextQuestion()

      case 'medical_history':
        const historyResponses = responses.filter(r => r.category === 'history')
        if (historyResponses.length === 0) {
          return "E agora, sobre o restante sua vida até aqui, desde seu nascimento, quais as questões de saúde que você já viveu? Vamos ordenar do mais antigo para o mais recente, o que veio primeiro?"
        }
        const lastHistoryResponse = historyResponses.slice(-1)[0]
        if (lastHistoryResponse && lastHistoryResponse.answer.toLowerCase().includes('não') && 
            lastHistoryResponse.answer.toLowerCase().includes('mais')) {
          this.advanceStage()
          return this.getNextQuestion()
        }
        return "O que mais?"

      case 'family_history':
        const familyResponses = responses.filter(r => r.category === 'family')
        const maternalResponses = familyResponses.filter(r => r.question.includes('mãe'))
        const paternalResponses = familyResponses.filter(r => r.question.includes('pai'))
        
        if (maternalResponses.length === 0) {
          return "E na sua família? Começando pela parte de sua mãe, quais as questões de saúde dela e desse lado da família?"
        }
        if (maternalResponses.length > 0 && maternalResponses.slice(-1)[0].answer.toLowerCase().includes('não') && 
            maternalResponses.slice(-1)[0].answer.toLowerCase().includes('mais')) {
          return "E por parte de seu pai?"
        }
        if (paternalResponses.length > 0 && paternalResponses.slice(-1)[0].answer.toLowerCase().includes('não') && 
            paternalResponses.slice(-1)[0].answer.toLowerCase().includes('mais')) {
          this.advanceStage()
          return this.getNextQuestion()
        }
        return "O que mais?"

      case 'lifestyle_habits':
        const habitResponses = responses.filter(r => r.category === 'habits')
        if (habitResponses.length === 0) {
          return "Além dos hábitos de vida que já verificamos em nossa conversa, que outros hábitos você acha importante mencionar?"
        }
        const lastHabitResponse = habitResponses.slice(-1)[0]
        if (lastHabitResponse && lastHabitResponse.answer.toLowerCase().includes('não') && 
            lastHabitResponse.answer.toLowerCase().includes('mais')) {
          this.advanceStage()
          return this.getNextQuestion()
        }
        return "O que mais?"

      case 'medications_allergies':
        const medResponses = responses.filter(r => r.category === 'medications')
        if (medResponses.length === 0) {
          return "Você tem alguma alergia (mudança de tempo, medicação, poeira...)?"
        }
        if (medResponses.length === 1) {
          return "Quais as medicações que você utiliza regularmente?"
        }
        if (medResponses.length === 2) {
          return "Quais as medicações você utiliza esporadicamente (de vez em quando) e porque utiliza?"
        }
        this.advanceStage()
        return this.getNextQuestion()

      case 'review':
        return "Vamos revisar a sua história para garantir que não perdemos nenhum detalhe importante."

      case 'final_report':
        return this.generateFinalReport()

      default:
        return "Avaliação concluída. Obrigada por sua participação!"
    }
  }

  /**
   * Registra resposta do usuário
   */
  recordResponse(question: string, answer: string, category: AssessmentResponse['category']): void {
    if (!this.currentAssessment) {
      throw new Error('Nenhuma avaliação ativa')
    }

    const response: AssessmentResponse = {
      question,
      answer,
      timestamp: new Date(),
      category
    }

    this.assessmentResponses.push(response)
    this.currentAssessment.responses.push(response)
  }

  /**
   * Avança para próximo estágio
   */
  private advanceStage(): void {
    if (!this.currentAssessment) return

    const stages: AssessmentStage[] = [
      'identification',
      'complaints_list',
      'main_complaint',
      'complaint_development',
      'medical_history',
      'family_history',
      'lifestyle_habits',
      'medications_allergies',
      'review',
      'final_report',
      'completed'
    ]

    const currentIndex = stages.indexOf(this.currentAssessment.stage)
    if (currentIndex < stages.length - 1) {
      this.currentAssessment.stage = stages[currentIndex + 1]
    }
  }

  /**
   * Gera relatório final
   */
  private generateFinalReport(): string {
    if (!this.currentAssessment) return ""

    const complaints = this.assessmentResponses.filter(r => r.category === 'complaints')
    const history = this.assessmentResponses.filter(r => r.category === 'history')
    const family = this.assessmentResponses.filter(r => r.category === 'family')
    const habits = this.assessmentResponses.filter(r => r.category === 'habits')
    const medications = this.assessmentResponses.filter(r => r.category === 'medications')

    const patientName = this.assessmentResponses[0]?.answer || 'Não informado'
    const mainComplaint = complaints.slice(-1)[0]?.answer || ''
    const maternal = family.filter(f => f.question.includes('mãe')).map(f => f.answer).join(', ')
    const paternal = family.filter(f => f.question.includes('pai')).map(f => f.answer).join(', ')
    const regularMeds = medications.filter(m => m.question.includes('regularmente')).map(m => m.answer).join(', ')
    const sporadicMeds = medications.filter(m => m.question.includes('esporadicamente')).map(m => m.answer).join(', ')
    const allergies = medications.filter(m => m.question.includes('alergia')).map(m => m.answer).join(', ')

    const narrative = [
      `Este é o relatório da Avaliação Clínica Inicial de ${patientName}.`,
      mainComplaint
        ? `A queixa que mais o(a) incomoda é: ${mainComplaint}.`
        : '',
      complaints.length > 0
        ? `Ao explorar a história atual, o(a) paciente relatou: ${complaints.map(c => c.answer).join('; ')}.`
        : '',
      history.length > 0
        ? `Sobre a história patológica pregressa, mencionou: ${history.map(h => h.answer).join('; ')}.`
        : '',
      family.length > 0
        ? `Na história familiar, por parte materna: ${maternal || 'sem dados'}; por parte paterna: ${paternal || 'sem dados'}.`
        : '',
      habits.length > 0
        ? `Quanto aos hábitos de vida, citou: ${habits.map(h => h.answer).join('; ')}.`
        : '',
      (regularMeds || sporadicMeds || allergies)
        ? `Alergias: ${allergies || 'não referidas'}. Medicações em uso: regulares (${regularMeds || 'não referidas'}) e esporádicas (${sporadicMeds || 'não referidas'}).`
        : ''
    ].filter(Boolean).join('\n\n')

    this.currentAssessment.finalReport = {
      patientName,
      mainComplaint: complaints[0]?.answer || '',
      complaintsList: complaints.map(c => c.answer),
      developmentDetails: complaints.filter(c => c.question.toLowerCase().includes('onde')).map(c => c.answer).join(', '),
      medicalHistory: history.map(h => h.answer),
      familyHistory: {
        maternal: family.filter(f => f.question.includes('mãe')).map(f => f.answer),
        paternal: family.filter(f => f.question.includes('pai')).map(f => f.answer)
      },
      lifestyleHabits: habits.map(h => h.answer),
      medications: {
        regular: medications.filter(m => m.question.includes('regularmente')).map(m => m.answer),
        sporadic: medications.filter(m => m.question.includes('esporadicamente')).map(m => m.answer)
      },
      allergies: medications.filter(m => m.question.includes('alergia')).map(m => m.answer),
      summary: `RELATÓRIO DE AVALIAÇÃO CLÍNICA INICIAL\n\n${narrative}\n\nEsta é uma avaliação inicial segundo o método do Dr. Ricardo Valença para aperfeiçoar o atendimento.`,
      recommendations: [
        'Agendar consulta com Dr. Ricardo Valença',
        'Manter acompanhamento regular',
        'Seguir orientações médicas'
      ]
    }

    return this.currentAssessment.finalReport.summary
  }

  /**
   * Finaliza avaliação e gera NFT
   */
  async completeAssessment(): Promise<{ report: ClinicalReport; nftHash: string }> {
    if (!this.currentAssessment || !this.currentAssessment.finalReport) {
      throw new Error('Avaliação não pode ser finalizada')
    }

    // Simular geração de NFT
    const nftHash = `nft_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    this.currentAssessment.nftHash = nftHash
    this.currentAssessment.status = 'completed'

    // Persistir no Supabase (quando disponível) para métricas globais
    try {
      const payload: any = {
        id: this.currentAssessment.id,
        user_id: this.currentAssessment.userId,
        session_id: this.currentAssessment.id,
        status: 'completed',
        etapa_atual: this.currentAssessment.stage,
        dados: this.currentAssessment.finalReport ? JSON.stringify(this.currentAssessment.finalReport) : null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      await supabase.from('avaliacoes_iniciais').upsert(payload, { onConflict: 'id' })
    } catch (e) {
      // Fallback local: incrementar contador para uso no Admin
      try {
        const total = Number(localStorage.getItem('kpi_total_assessments') || '0') + 1
        localStorage.setItem('kpi_total_assessments', String(total))
      } catch {}
    }

    return {
      report: this.currentAssessment.finalReport,
      nftHash
    }
  }

  /**
   * Obtém avaliação atual
   */
  getCurrentAssessment(): ClinicalAssessmentData | null {
    return this.currentAssessment
  }

  /**
   * Obtém estatísticas para KPIs
   */
  getAssessmentStats(): {
    totalAssessments: number
    completedAssessments: number
    averageDuration: number
    currentStage: string
  } {
    // Simular dados para KPIs
    return {
      totalAssessments: this.currentAssessment ? 1 : 0,
      completedAssessments: this.currentAssessment?.status === 'completed' ? 1 : 0,
      averageDuration: 18, // minutos
      currentStage: this.currentAssessment?.stage || 'none'
    }
  }
}

// Instância global do serviço
export const clinicalAssessmentService = new ClinicalAssessmentService()

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
  private contadorOqMais: number = 0 // 🛡️ LIMITE "O que mais?"
  private ultimaPerguntaFeita: string = '' // 🚫 Evita repetir a mesma pergunta

  /**
   * 💬 Gera variações naturais de perguntas para parecer mais humana
   */
  private getDynamicQuestion(context: 'first' | 'follow_up' | 'final'): string {
    const variations = {
      first: [
        "O que trouxe você até aqui hoje?",
        "O que motivou sua vinda para esta avaliação?",
        "Como posso te ajudar hoje?",
        "O que te traz aqui neste momento?"
      ],
      follow_up: [
        "Há algo mais que você queira mencionar?",
        "O que mais você percebeu?",
        "Quer me contar mais alguma coisa?",
        "Algo mais que esteja te incomodando?"
      ],
      final: [
        "Há mais alguma coisa que você gostaria de acrescentar?",
        "Algo mais que julgue importante compartilhar?",
        "Quer comentar algo mais antes de seguirmos?",
        "Mais alguma informação que queira me passar?"
      ]
    }
    const options = variations[context]
    return options[Math.floor(Math.random() * options.length)]
  }

  /**
   * 💙 Gera resposta empática reconhecendo o que o paciente disse
   */
  private respostaEmpatica(resposta: string): string {
    if (!resposta || resposta.trim().length < 3) return ''
    
    const respostasEmpaticas = [
      "Entendo, obrigada por compartilhar isso.",
      "Compreendo o que você está dizendo.",
      "Certo, entendi.",
      "Está bem, obrigada.",
      "Compreendo.",
      resposta.length > 40 ? "Entendo, deve ser desconfortável." : "Certo."
    ]
    
    return respostasEmpaticas[Math.floor(Math.random() * respostasEmpaticas.length)]
  }

  /**
   * 🛡️ Detecta se o paciente sinalizou que terminou de falar
   */
  private detectaFinalizacao(answer: string = ''): boolean {
    const palavrasFinalizacao = [
      'não mais', 'nada mais', 'nada', 'só isso', 'so isso',
      'apenas', 'apenas isso', 'chega', 'nenhuma', 'nenhum',
      'acabou', 'terminei', 'é isso'
    ]
    
    const text = answer.toLowerCase().trim()
    return palavrasFinalizacao.some(palavra => 
      text.includes(palavra) || 
      (text.length < 15 && text === palavra)
    )
  }

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
    
    // 💾 Salvar no Supabase
    this.saveToSupabase()
    
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
        return "O que trouxe você à nossa avaliação hoje?"

      case 'complaints_list':
        if (responses.filter(r => r.category === 'complaints').length === 0) {
          this.contadorOqMais = 0 // Reset
          return this.getDynamicQuestion('first')
        }
        const lastComplaintResponse = responses.filter(r => r.category === 'complaints').slice(-1)[0]
        const complaintCount = responses.filter(r => r.category === 'complaints').length
        
        // 🛡️ PROTEÇÃO: Detecta finalização
        const usuarioTerminou = 
          this.detectaFinalizacao(lastComplaintResponse?.answer) ||
          this.contadorOqMais >= 2 || // MÁXIMO 2 vezes
          complaintCount >= 4 // MÁXIMO 4 queixas
        
        if (usuarioTerminou) {
          this.contadorOqMais = 0 // Reset
          this.advanceStage()
          return this.getNextQuestion()
        }
        
        this.contadorOqMais++
        
        // 💙 Resposta empática + pergunta variada
        const empatiaComplaint = this.respostaEmpatica(lastComplaintResponse?.answer || '')
        const perguntaComplaint = this.getDynamicQuestion('follow_up')
        return empatiaComplaint ? `${empatiaComplaint} ${perguntaComplaint}` : perguntaComplaint

      case 'main_complaint':
        const complaints = responses.filter(r => r.category === 'complaints').map(r => r.answer)
        
        // 🧹 LIMPEZA: Remover respostas vazias ou de finalização
        const complaintsLimpos = complaints.filter(c => c && c.trim().length > 3)
        
        if (complaintsLimpos.length === 0) {
          return "Qual é a sua queixa principal?"
        }
        
        if (complaintsLimpos.length === 1) {
          // Se só tem 1 queixa, não precisa perguntar "qual mais incomoda"
          this.advanceStage()
          return "Onde você sente essa dor? Como começou?"
        }
        
        const perguntaPrincipal = `De todas essas questões (${complaintsLimpos.join(', ')}), qual mais o(a) incomoda?`
        
        // 🚫 PROTEÇÃO: Se já fez essa pergunta, não repetir!
        if (this.ultimaPerguntaFeita === perguntaPrincipal) {
          console.log('⚠️ Pergunta já feita, avançando automaticamente...')
          this.advanceStage()
          return this.getNextQuestion()
        }
        
        this.ultimaPerguntaFeita = perguntaPrincipal
        return perguntaPrincipal

      case 'complaint_development':
        // 🎯 DESENVOLVIMENTO COMPLETO DA QUEIXA (Protocolo IMRE)
        const mainComplaint = responses.filter(r => r.category === 'complaints').slice(-1)[0]?.answer || 'isso'
        const developmentResponses = responses.filter(r => r.category === 'complaints' && r.question.includes('Onde'))
        
        // 📋 SEQUÊNCIA COMPLETA: Onde → Quando → Como → O que melhora → O que piora
        if (developmentResponses.length === 0) {
          return `Vamos explorar suas questões mais detalhadamente. Onde você sente ${mainComplaint}?`
        }
        if (developmentResponses.length === 1) {
          return `Quando isso começou? Há quanto tempo?`
        }
        if (developmentResponses.length === 2) {
          return `Como é essa sensação? Pode descrever?`
        }
        if (developmentResponses.length === 3) {
          return `O que você percebe que ajuda a melhorar?`
        }
        if (developmentResponses.length === 4) {
          return `E o que costuma piorar?`
        }
        
        // ✅ Desenvolvimento completo - avança para próxima etapa
        this.advanceStage()
        return "Agora vamos falar sobre sua saúde ao longo da vida. Quais questões de saúde você já viveu, desde o mais antigo até o mais recente?"

      case 'medical_history':
        const historyResponses = responses.filter(r => r.category === 'history')
        if (historyResponses.length === 0) {
          this.contadorOqMais = 0 // Reset
          return "Agora vamos falar sobre sua saúde ao longo da vida. Quais questões de saúde você já viveu, desde o mais antigo até o mais recente?"
        }
        const lastHistoryResponse = historyResponses.slice(-1)[0]
        const historyCount = historyResponses.length
        
        // 🛡️ PROTEÇÃO: Detecta finalização
        const historyTerminou = 
          this.detectaFinalizacao(lastHistoryResponse?.answer) ||
          this.contadorOqMais >= 2 || // MÁXIMO 2 vezes
          historyCount >= 4 // MÁXIMO 4 histórias
        
        if (historyTerminou) {
          this.contadorOqMais = 0 // Reset
          this.advanceStage()
          return this.getNextQuestion()
        }
        
        this.contadorOqMais++
        
        // 💙 Resposta empática + pergunta variada
        const empatiaHistory = this.respostaEmpatica(lastHistoryResponse?.answer || '')
        const perguntaHistory = this.getDynamicQuestion('follow_up')
        return empatiaHistory ? `${empatiaHistory} ${perguntaHistory}` : perguntaHistory

      case 'family_history':
        const familyResponses = responses.filter(r => r.category === 'family')
        const maternalResponses = familyResponses.filter(r => r.question.includes('mãe'))
        const paternalResponses = familyResponses.filter(r => r.question.includes('pai'))
        
        if (maternalResponses.length === 0) {
          this.contadorOqMais = 0 // Reset
          return "E na sua família? Começando pela parte de sua mãe, quais as questões de saúde dela e desse lado da família?"
        }
        
        // 🛡️ PROTEÇÃO: Detecta finalização (mãe)
        const lastMaternal = maternalResponses.slice(-1)[0]
        const maternalTerminou = 
          this.detectaFinalizacao(lastMaternal?.answer) ||
          this.contadorOqMais >= 2 || // MÁXIMO 2 vezes
          maternalResponses.length >= 4 // MÁXIMO 4 histórias
        
        if (maternalResponses.length > 0 && maternalTerminou) {
          this.contadorOqMais = 0 // Reset para parte do pai
          const empatia = this.respostaEmpatica(lastMaternal?.answer || '')
          return empatia ? `${empatia} E por parte de seu pai?` : "E por parte de seu pai?"
        }
        
        // 🛡️ PROTEÇÃO: Detecta finalização (pai)
        const lastPaternal = paternalResponses.slice(-1)[0]
        const paternalTerminou = 
          this.detectaFinalizacao(lastPaternal?.answer) ||
          this.contadorOqMais >= 2 || // MÁXIMO 2 vezes
          paternalResponses.length >= 4 // MÁXIMO 4 histórias
        
        if (paternalResponses.length > 0 && paternalTerminou) {
          this.contadorOqMais = 0 // Reset
          this.advanceStage()
          return this.getNextQuestion()
        }
        
        this.contadorOqMais++
        
        // 💙 Resposta empática + pergunta variada
        const ultimaRespostaFamily = paternalResponses.length > 0 ? lastPaternal : lastMaternal
        const empatiaFamily = this.respostaEmpatica(ultimaRespostaFamily?.answer || '')
        const perguntaFamily = this.getDynamicQuestion('follow_up')
        return empatiaFamily ? `${empatiaFamily} ${perguntaFamily}` : perguntaFamily

      case 'lifestyle_habits':
        const habitResponses = responses.filter(r => r.category === 'habits')
        if (habitResponses.length === 0) {
          this.contadorOqMais = 0 // Reset
          return "Agora sobre seus hábitos de vida - sono, alimentação, atividades. Como é sua rotina diária?"
        }
        const lastHabitResponse = habitResponses.slice(-1)[0]
        const habitCount = habitResponses.length
        
        // 🛡️ PROTEÇÃO: Detecta finalização
        const habitTerminou = 
          this.detectaFinalizacao(lastHabitResponse?.answer) ||
          this.contadorOqMais >= 2 || // MÁXIMO 2 vezes
          habitCount >= 4 // MÁXIMO 4 hábitos
        
        if (habitTerminou) {
          this.contadorOqMais = 0 // Reset
          this.advanceStage()
          return this.getNextQuestion()
        }
        
        this.contadorOqMais++
        
        // 💙 Resposta empática + pergunta variada
        const empatiaHabit = this.respostaEmpatica(lastHabitResponse?.answer || '')
        const perguntaHabit = this.getDynamicQuestion('follow_up')
        return empatiaHabit ? `${empatiaHabit} ${perguntaHabit}` : perguntaHabit

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
      console.error('❌ Nenhuma avaliação ativa! Inicie uma nova avaliação.')
      throw new Error('Nenhuma avaliação ativa')
    }

    // 🛡️ FILTRO: Não salvar respostas de finalização como dados reais
    const respostasFinalizacao = [
      'só isso',
      'so isso',
      'apenas',
      'chega',
      'nada',
      'nada mais',
      'não mais',
      'não',
      'nenhuma',
      'nenhum',
      'acabou',
      'e agora',
      'proxima',
      'próxima',
      'avançar',
      'vamos',
      'continuar',
      'seguir'
    ]
    
    const answerLower = answer.toLowerCase().trim()
    const ehFinalizacao = respostasFinalizacao.some(f => 
      answerLower === f || // Exatamente igual
      answerLower === f + '?' || // Com interrogação
      (answerLower.length < 15 && answerLower.includes(f)) // Curto e contém
    )
    
    // Se for tentativa de finalização, não salvar
    if (ehFinalizacao) {
      console.log('🚫 Resposta de finalização detectada, não salvando:', answer)
      return
    }

    const response: AssessmentResponse = {
      question,
      answer,
      timestamp: new Date(),
      category
    }

    this.assessmentResponses.push(response)
    this.currentAssessment.responses.push(response)
    
    // 💾 Salvar no Supabase após cada resposta
    this.saveToSupabase()
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
   * 💾 Salva avaliação atual no Supabase
   */
  private async saveToSupabase(): Promise<void> {
    if (!this.currentAssessment) return
    
    try {
      const payload = {
        id: this.currentAssessment.id,
        user_id: this.currentAssessment.userId,
        session_id: this.currentAssessment.id,
        status: this.currentAssessment.status,
        etapa_atual: this.currentAssessment.stage,
        dados: JSON.stringify({
          responses: this.assessmentResponses,
          stage: this.currentAssessment.stage
        }),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      await supabase.from('avaliacoes_iniciais').upsert(payload, { onConflict: 'id' })
      console.log('💾 Avaliação salva no Supabase:', this.currentAssessment.id)
    } catch (error) {
      console.warn('⚠️ Erro ao salvar no Supabase:', error)
    }
  }

  /**
   * 📄 Gera PDF do relatório
   */
  private generatePDFBlob(): Blob {
    if (!this.currentAssessment?.finalReport) {
      throw new Error('Nenhum relatório para gerar PDF')
    }

    const { patientName, summary, recommendations } = this.currentAssessment.finalReport
    
    // Criar conteúdo do relatório em texto
    const content = `
╔══════════════════════════════════════════════════════════╗
║     RELATÓRIO DE AVALIAÇÃO CLÍNICA INICIAL              ║
║     Nôa Esperanza - Assistente Médica Inteligente       ║
╚══════════════════════════════════════════════════════════╝

Paciente: ${patientName}
Data: ${new Date().toLocaleDateString('pt-BR')}
Hora: ${new Date().toLocaleTimeString('pt-BR')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 AVALIAÇÃO CLÍNICA:

${summary}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 RECOMENDAÇÕES:

${recommendations.map((r, i) => `${i + 1}. ${r}`).join('\n')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔐 NFT Hash: ${this.currentAssessment.nftHash || 'Gerando...'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

👨‍⚕️ Desenvolvido pelo Dr. Ricardo Valença
🏥 Método IMRE - Arte da Entrevista Clínica
    `.trim()

    return new Blob([content], { type: 'text/plain; charset=utf-8' })
  }

  /**
   * 📤 Faz upload do PDF no Supabase Storage
   */
  private async uploadPDFToSupabase(): Promise<string | null> {
    if (!this.currentAssessment) return null

    try {
      const pdfBlob = this.generatePDFBlob()
      const fileName = `relatorio_${this.currentAssessment.userId}_${this.currentAssessment.id}.txt`
      const filePath = `relatorios-clinicos/${fileName}`

      // Upload no Supabase Storage
      const { data, error } = await supabase.storage
        .from('documents') // ou criar bucket 'relatorios-clinicos'
        .upload(filePath, pdfBlob, {
          contentType: 'text/plain',
          upsert: true
        })

      if (error) {
        console.error('❌ Erro ao fazer upload do PDF:', error)
        return null
      }

      // Gerar URL pública
      const { data: urlData } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath)

      console.log('✅ PDF enviado para Supabase:', urlData.publicUrl)
      return urlData.publicUrl

    } catch (error) {
      console.error('❌ Erro ao fazer upload:', error)
      return null
    }
  }

  /**
   * Finaliza avaliação e gera NFT
   */
  async completeAssessment(): Promise<{ report: ClinicalReport; nftHash: string; pdfUrl?: string }> {
    if (!this.currentAssessment || !this.currentAssessment.finalReport) {
      throw new Error('Avaliação não pode ser finalizada')
    }

    // Simular geração de NFT
    const nftHash = `nft_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    this.currentAssessment.nftHash = nftHash
    this.currentAssessment.status = 'completed'

    // 📤 Upload do PDF no Supabase Storage
    const pdfUrl = await this.uploadPDFToSupabase()

    // Persistir no Supabase com URL do PDF
    try {
      const payload: any = {
        id: this.currentAssessment.id,
        user_id: this.currentAssessment.userId,
        session_id: this.currentAssessment.id,
        status: 'completed',
        etapa_atual: this.currentAssessment.stage,
        dados: JSON.stringify(this.currentAssessment.finalReport),
        pdf_url: pdfUrl, // 📄 URL do PDF
        nft_hash: nftHash,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      await supabase.from('avaliacoes_iniciais').upsert(payload, { onConflict: 'id' })
      
      console.log('✅ Avaliação finalizada e salva no Supabase')
      console.log('📄 PDF URL:', pdfUrl)
    } catch (e) {
      console.warn('⚠️ Erro ao salvar no Supabase:', e)
      // Fallback local
      try {
        const total = Number(localStorage.getItem('kpi_total_assessments') || '0') + 1
        localStorage.setItem('kpi_total_assessments', String(total))
      } catch {}
    }

    return {
      report: this.currentAssessment.finalReport,
      nftHash,
      pdfUrl: pdfUrl || undefined
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

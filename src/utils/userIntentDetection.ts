// 🧠 SISTEMA INTELIGENTE DE DETECÇÃO DE INTENÇÃO DO USUÁRIO
// Detecta 10 perfis diferentes e múltiplas formas de falar

export interface UserIntent {
  type:
    | 'start_evaluation'
    | 'ask_about_method'
    | 'greeting'
    | 'presentation'
    | 'symptom'
    | 'question'
    | 'unknown'
  confidence: number
  detectedProfile?: 'paciente' | 'profissional' | 'aluno' | 'unknown'
  context?: any
}

export class UserIntentDetector {
  // 🩺 DETECTA INTENÇÃO DE INICIAR AVALIAÇÃO (10+ variações)
  static detectStartEvaluation(message: string): boolean {
    const lower = message.toLowerCase()

    const patterns = [
      // Direto
      'avaliação clínica',
      'avaliacao clinica',
      'iniciar avaliação',
      'iniciar avaliacao',
      'fazer avaliação',
      'fazer avaliacao',

      // Arte da Entrevista
      'arte da entrevista',
      'entrevista clínica',
      'entrevista clinica',
      'método imre',
      'metodo imre',

      // Variações naturais
      'quero fazer uma avaliação',
      'quero fazer uma avaliacao',
      'preciso de uma avaliação',
      'preciso de uma avaliacao',
      'gostaria de fazer avaliação',
      'gostaria de fazer avaliacao',
      'pode me avaliar',
      'quero ser avaliado',
      'avaliar minha saúde',
      'avaliar minha saude',

      // Início rápido
      'começar avaliação',
      'começar avaliacao',
      'iniciar entrevista',
      'começar entrevista',
      'comecar entrevista',

      // Referências ao Dr. Ricardo
      'consulta com dr ricardo',
      'consulta dr ricardo',
      'avaliação dr ricardo',
      'avaliacao dr ricardo',
    ]

    return patterns.some(pattern => lower.includes(pattern))
  }

  // 📚 DETECTA PERGUNTA SOBRE O MÉTODO
  static detectAskAboutMethod(message: string): boolean {
    const lower = message.toLowerCase()

    const patterns = [
      'o que é arte da entrevista',
      'o que e arte da entrevista',
      'que é entrevista clínica',
      'que e entrevista clinica',
      'como funciona a entrevista',
      'como funciona entrevista',
      'explique arte da entrevista',
      'explique entrevista clínica',
      'explique entrevista clinica',
      'o que é imre',
      'o que e imre',
      'como funciona imre',
      'o que significa imre',
    ]

    return patterns.some(pattern => lower.includes(pattern))
  }

  // 👤 DETECTA SE USUÁRIO SE APRESENTOU
  static detectUserPresentation(message: string, allMessages: any[]): boolean {
    const lower = message.toLowerCase()

    // Verifica mensagem atual
    const hasName =
      lower.includes('meu nome') ||
      lower.includes('me chamo') ||
      lower.includes('sou ') ||
      Boolean(lower.match(/\b[A-Z][a-z]+ [A-Z][a-z]+\b/)) // Nome próprio

    // Verifica histórico de mensagens
    const hasIntroducedBefore = allMessages.some(
      msg =>
        msg.sender === 'user' &&
        (msg.message.toLowerCase().includes('meu nome') ||
          msg.message.toLowerCase().includes('me chamo') ||
          msg.message.toLowerCase().includes('sou '))
    )

    return hasName || hasIntroducedBefore
  }

  // 🎭 DETECTA PERFIL DO USUÁRIO (10 PERFIS DIFERENTES)
  static detectUserProfile(message: string): 'paciente' | 'profissional' | 'aluno' | 'unknown' {
    const lower = message.toLowerCase()

    // PERFIL 1-3: Pacientes (variações)
    const pacientePatterns = [
      'sou paciente',
      'estou doente',
      'tenho sintomas',
      'estou sentindo',
      'preciso de ajuda médica',
      'quero consulta',
      'marcar consulta',
      'não estou bem',
      'nao estou bem',
      'tenho dor',
    ]

    // PERFIL 4-6: Profissionais (variações)
    const profissionalPatterns = [
      'sou médico',
      'sou medico',
      'sou doutor',
      'sou doutora',
      'sou profissional',
      'trabalho na saúde',
      'trabalho na saude',
      'sou enfermeiro',
      'sou terapeuta',
      'sou psicólogo',
      'sou psicologo',
    ]

    // PERFIL 7-10: Alunos (variações)
    const alunoPatterns = [
      'sou aluno',
      'sou estudante',
      'estudo medicina',
      'curso de medicina',
      'faculdade de medicina',
      'estou estudando',
      'quero aprender',
      'estudante de saúde',
      'estudante de saude',
      'residência médica',
      'residencia medica',
    ]

    if (pacientePatterns.some(p => lower.includes(p))) return 'paciente'
    if (profissionalPatterns.some(p => lower.includes(p))) return 'profissional'
    if (alunoPatterns.some(p => lower.includes(p))) return 'aluno'

    return 'unknown'
  }

  // 🎯 DETECTA INTENÇÃO COMPLETA
  static detectIntent(message: string, allMessages: any[]): UserIntent {
    // Detecta tipo de intenção
    if (this.detectStartEvaluation(message)) {
      return {
        type: 'start_evaluation',
        confidence: 0.95,
        detectedProfile: this.detectUserProfile(message),
      }
    }

    if (this.detectAskAboutMethod(message)) {
      return {
        type: 'ask_about_method',
        confidence: 0.9,
      }
    }

    if (this.detectUserPresentation(message, allMessages)) {
      return {
        type: 'presentation',
        confidence: 0.85,
        detectedProfile: this.detectUserProfile(message),
      }
    }

    // Detecta sintomas (provavelmente paciente)
    const symptomPatterns = ['dor', 'febre', 'cansaço', 'cansaco', 'tontura', 'náusea', 'nausea']
    if (symptomPatterns.some(s => message.toLowerCase().includes(s))) {
      return {
        type: 'symptom',
        confidence: 0.8,
        detectedProfile: 'paciente',
      }
    }

    // Saudação genérica
    const greetingPatterns = ['oi', 'olá', 'ola', 'bom dia', 'boa tarde', 'boa noite']
    if (greetingPatterns.some(g => message.toLowerCase().includes(g))) {
      return {
        type: 'greeting',
        confidence: 0.7,
      }
    }

    return {
      type: 'unknown',
      confidence: 0.5,
    }
  }

  // 🔄 DETECTA SE DEVE PULAR BLOCOS
  static shouldSkipBlock(blockOrder: number, allMessages: any[]): boolean {
    // Bloco 1 (apresentação) - pula se já se apresentou
    if (blockOrder === 1) {
      return this.detectUserPresentation('', allMessages)
    }

    // Outros blocos - pode expandir lógica aqui
    return false
  }

  // 📊 EXTRAI INFORMAÇÕES DO CONTEXTO
  static extractContext(allMessages: any[]): {
    userName?: string
    userSymptoms?: string[]
    userProfile?: 'paciente' | 'profissional' | 'aluno'
    hasPresented?: boolean
  } {
    const context: any = {}

    // Extrai nome
    const nameMessages = allMessages.filter(
      msg =>
        msg.sender === 'user' &&
        (msg.message.toLowerCase().includes('meu nome') ||
          msg.message.toLowerCase().includes('me chamo'))
    )
    if (nameMessages.length > 0) {
      const match = nameMessages[0].message.match(
        /(?:meu nome é|me chamo) ([A-Z][a-z]+(?: [A-Z][a-z]+)*)/i
      )
      if (match) context.userName = match[1]
    }

    // Extrai sintomas
    const symptomMessages = allMessages.filter(
      msg =>
        msg.sender === 'user' &&
        (msg.message.toLowerCase().includes('dor') ||
          msg.message.toLowerCase().includes('sintoma') ||
          msg.message.toLowerCase().includes('sinto'))
    )
    if (symptomMessages.length > 0) {
      context.userSymptoms = symptomMessages.map(m => m.message)
    }

    // Detecta perfil
    const userMessages = allMessages.filter(msg => msg.sender === 'user')
    for (const msg of userMessages) {
      const profile = this.detectUserProfile(msg.message)
      if (profile !== 'unknown') {
        context.userProfile = profile
        break
      }
    }

    // Detecta se já se apresentou
    context.hasPresented = this.detectUserPresentation('', allMessages)

    return context
  }
}

export default UserIntentDetector

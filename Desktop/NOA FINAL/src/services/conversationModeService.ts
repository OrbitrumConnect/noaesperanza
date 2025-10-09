// 🎯 SERVIÇO DE MODOS DE CONVERSA - NÔA ESPERANZA
// Gerencia alternância entre modo explicativo e avaliação clínica

import { supabase } from '../integrations/supabase/client'
import { aiSmartLearningService } from './aiSmartLearningService'
import { avaliacaoClinicaService } from './avaliacaoClinicaService'
import { noaSystemService } from './noaSystemService'

export type ConversationMode = 'explicativo' | 'avaliacao_clinica' | 'curso'

export interface ConversationContext {
  sessionId: string
  userId: string
  currentMode: ConversationMode
  previousMode?: ConversationMode
  modeStartTime: Date
  contextData: any
  conversationHistory: any[]
  isFirstInteraction: boolean
}

export interface ModeTransition {
  from: ConversationMode
  to: ConversationMode
  trigger: string
  timestamp: Date
  confidence: number
}

export class ConversationModeService {
  private contexts: Map<string, ConversationContext> = new Map()
  private modeTransitions: ModeTransition[] = []

  // 🎯 INICIALIZAR CONTEXTO DE CONVERSA
  inicializarContexto(sessionId: string, userId: string): ConversationContext {
    const ctx: ConversationContext = {
      sessionId,
      userId,
      currentMode: 'explicativo', // Modo padrão
      modeStartTime: new Date(),
      contextData: {},
      conversationHistory: [],
      isFirstInteraction: true
    }
    
    this.contexts.set(sessionId, ctx)
    this.logModeTransition('explicativo', 'explicativo', 'inicializacao', 1.0)
    
    return ctx
  }

  // 🧠 PROCESSAR MENSAGEM COM DETECÇÃO DE MODO
  async processarMensagem(
    userMessage: string,
    sessionId: string,
    userId: string
  ): Promise<{
    response: string
    shouldChangeMode: boolean
    newMode?: ConversationMode
    context: ConversationContext
    confidence: number
  }> {
    
    let ctx = this.contexts.get(sessionId)
    if (!ctx) {
      ctx = this.inicializarContexto(sessionId, userId)
    }

    // Atualizar histórico
    ctx.conversationHistory.push({ 
      role: 'user', 
      content: userMessage,
      timestamp: new Date()
    })

    // 🔍 DETECTAR INTENÇÃO E POSSÍVEL MUDANÇA DE MODO
    const intentDetection = await this.detectarIntencaoEModo(userMessage, ctx)
    
    // 🎯 SE DETECTOU MUDANÇA DE MODO
    if (intentDetection.shouldChangeMode && intentDetection.newMode) {
      return await this.mudarModo(
        ctx,
        intentDetection.newMode,
        userMessage,
        intentDetection.confidence
      )
    }

    // 🧠 PROCESSAR NO MODO ATUAL
    const response = await this.processarNoModoAtual(userMessage, ctx)
    
    return {
      response,
      shouldChangeMode: false,
      context: ctx,
      confidence: intentDetection.confidence
    }
  }

  // 🔍 DETECTAR INTENÇÃO E POSSÍVEL MUDANÇA DE MODO
  private async detectarIntencaoEModo(
    userMessage: string, 
    ctx: ConversationContext
  ): Promise<{
    shouldChangeMode: boolean
    newMode?: ConversationMode
    confidence: number
    intent: string
  }> {
    
    const lower = userMessage.toLowerCase()
    
    // 🩺 DETECTAR AVALIAÇÃO CLÍNICA (15+ variações)
    const avaliacaoPatterns = [
      'avaliação clínica', 'avaliacao clinica',
      'iniciar avaliação', 'iniciar avaliacao',
      'fazer avaliação', 'fazer avaliacao',
      'quero fazer uma avaliação', 'quero fazer uma avaliacao',
      'preciso de uma avaliação', 'preciso de uma avaliacao',
      'gostaria de fazer avaliação', 'gostaria de fazer avaliacao',
      'pode me avaliar', 'quero ser avaliado',
      'avaliar minha saúde', 'avaliar minha saude',
      'começar avaliação', 'começar avaliacao',
      'iniciar entrevista', 'começar entrevista',
      'arte da entrevista', 'entrevista clínica',
      'método imre', 'metodo imre',
      'consulta com dr ricardo', 'avaliação dr ricardo'
    ]

    // 📚 DETECTAR MODO CURSO (10+ variações)
    const cursoPatterns = [
      'quero aprender', 'quero estudar',
      'curso de medicina', 'curso medicina',
      'estudar entrevista', 'aprender entrevista',
      'método dr ricardo', 'metodo dr ricardo',
      'como fazer entrevista', 'como fazer avaliacao',
      'técnicas de entrevista', 'tecnicas de entrevista',
      'aprender imre', 'estudar imre',
      'curso online', 'aula online'
    ]

    // 🔄 DETECTAR VOLTA AO MODO EXPLICATIVO
    const explicativoPatterns = [
      'voltar ao chat', 'sair da avaliação',
      'cancelar avaliação', 'parar avaliação',
      'quero conversar', 'modo normal',
      'chat normal', 'conversa normal'
    ]

    // 🩺 AVALIAÇÃO CLÍNICA
    if (avaliacaoPatterns.some(pattern => lower.includes(pattern))) {
      return {
        shouldChangeMode: true,
        newMode: 'avaliacao_clinica',
        confidence: 0.95,
        intent: 'start_evaluation'
      }
    }

    // 📚 MODO CURSO
    if (cursoPatterns.some(pattern => lower.includes(pattern))) {
      return {
        shouldChangeMode: true,
        newMode: 'curso',
        confidence: 0.9,
        intent: 'start_course'
      }
    }

    // 🔄 VOLTA AO EXPLICATIVO
    if (explicativoPatterns.some(pattern => lower.includes(pattern))) {
      return {
        shouldChangeMode: true,
        newMode: 'explicativo',
        confidence: 0.9,
        intent: 'back_to_chat'
      }
    }

    // 🧠 BUSCAR NO BANCO DE APRENDIZADOS
    const aprendizado = await aiSmartLearningService.buscarAprendizadosSimilares(
      userMessage,
      'intent_detection',
      1
    )

    if (aprendizado.length > 0 && aprendizado[0].confidence_score > 0.8) {
      const intent = aprendizado[0].category
      
      if (intent === 'start_evaluation') {
        return {
          shouldChangeMode: true,
          newMode: 'avaliacao_clinica',
          confidence: aprendizado[0].confidence_score,
          intent
        }
      }
      
      if (intent === 'start_course') {
        return {
          shouldChangeMode: true,
          newMode: 'curso',
          confidence: aprendizado[0].confidence_score,
          intent
        }
      }
    }

    return {
      shouldChangeMode: false,
      confidence: 0.5,
      intent: 'general_chat'
    }
  }

  // 🎯 MUDAR MODO DE CONVERSA
  private async mudarModo(
    ctx: ConversationContext,
    newMode: ConversationMode,
    trigger: string,
    confidence: number
  ): Promise<{
    response: string
    shouldChangeMode: boolean
    newMode: ConversationMode
    context: ConversationContext
    confidence: number
  }> {
    
    const previousMode = ctx.currentMode
    ctx.previousMode = previousMode
    ctx.currentMode = newMode
    ctx.modeStartTime = new Date()
    
    // Log da transição
    this.logModeTransition(previousMode, newMode, trigger, confidence)
    
    // 🩺 MODO AVALIAÇÃO CLÍNICA
    if (newMode === 'avaliacao_clinica') {
      const avaliacaoResponse = await avaliacaoClinicaService.iniciarAvaliacao(ctx.userId)
      ctx.contextData = avaliacaoResponse
      
      return {
        response: `🩺 **Avaliação Clínica Inicial Iniciada**\n\nOlá! Vou conduzi-lo através de uma avaliação clínica completa seguindo o método IMRE do Dr. Ricardo Valença.\n\nEsta avaliação possui 28 blocos estruturados que nos ajudarão a compreender melhor sua condição de saúde.\n\nVamos começar?`,
        shouldChangeMode: true,
        newMode,
        context: ctx,
        confidence
      }
    }

    // 📚 MODO CURSO
    if (newMode === 'curso') {
      return {
        response: `📚 **Modo Curso Ativado**\n\nBem-vindo ao curso "Arte da Entrevista Clínica"!\n\nAqui você aprenderá:\n• Os 28 blocos IMRE\n• Técnicas de escuta ativa\n• Como conduzir entrevistas clínicas\n• Casos práticos e exemplos\n\nPor onde gostaria de começar?`,
        shouldChangeMode: true,
        newMode,
        context: ctx,
        confidence
      }
    }

    // 🔄 VOLTA AO EXPLICATIVO
    if (newMode === 'explicativo') {
      return {
        response: `💬 **Modo Conversa Normal**\n\nVoltamos ao chat normal! Posso ajudar com:\n• Dúvidas sobre cannabis medicinal\n• Informações sobre neuro e nefro\n• Explicações educativas\n• Evidências científicas\n\nO que gostaria de saber?`,
        shouldChangeMode: true,
        newMode,
        context: ctx,
        confidence
      }
    }

    return {
      response: 'Modo alterado com sucesso!',
      shouldChangeMode: true,
      newMode,
      context: ctx,
      confidence
    }
  }

  // 🧠 PROCESSAR MENSAGEM NO MODO ATUAL
  private async processarNoModoAtual(
    userMessage: string,
    ctx: ConversationContext
  ): Promise<string> {
    
    switch (ctx.currentMode) {
      case 'avaliacao_clinica':
        return await this.processarAvaliacaoClinica(userMessage, ctx)
      
      case 'curso':
        return await this.processarModoCurso(userMessage, ctx)
      
      case 'explicativo':
      default:
        return await this.processarModoExplicativo(userMessage, ctx)
    }
  }

  // 🩺 PROCESSAR AVALIAÇÃO CLÍNICA
  private async processarAvaliacaoClinica(
    userMessage: string,
    ctx: ConversationContext
  ): Promise<string> {
    
    // Inicializar contexto se não existir
    if (!ctx.contextData || !ctx.contextData.avaliacaoIniciada) {
      console.log('🩺 Inicializando contexto de avaliação...')
      const avaliacaoContext = await avaliacaoClinicaService.iniciarAvaliacao(ctx.userId, ctx.sessionId)
      ctx.contextData = avaliacaoContext
    }
    
    // Se está em avaliação, delega para o serviço específico
    const avaliacaoResponse = await avaliacaoClinicaService.processarResposta(
      ctx.sessionId,
      userMessage,
      ctx.contextData
    )
    
    // Se avaliação terminou (etapa 28), volta ao modo explicativo
    if (avaliacaoResponse.etapaAtual >= 28) {
      await this.mudarModo(ctx, 'explicativo', 'avaliacao_completa', 1.0)
      return '🎉 Avaliação clínica concluída! Voltamos ao chat normal!'
    }
    
    // Retorna a próxima pergunta
    const proximaPergunta = await avaliacaoClinicaService.getProximaPergunta(avaliacaoResponse.etapaAtual)
    return proximaPergunta
  }

  // 📚 PROCESSAR MODO CURSO
  private async processarModoCurso(
    userMessage: string,
    ctx: ConversationContext
  ): Promise<string> {
    
    // Buscar conteúdo educacional no banco
    const conteudoEducacional = await aiSmartLearningService.buscarAprendizadosSimilares(
      userMessage,
      'curso_educativo',
      3
    )

    if (conteudoEducacional.length > 0) {
      const melhorConteudo = conteudoEducacional[0]
      return `📚 **Conteúdo Educacional**\n\n${melhorConteudo.ai_response}\n\nQuer que eu explique mais detalhadamente ou tem alguma dúvida específica?`
    }

    // Fallback para conteúdo padrão do curso
    return `📚 **Curso - Arte da Entrevista Clínica**\n\nPosso explicar sobre:\n• Blocos IMRE (1-28)\n• Técnicas de escuta ativa\n• Casos práticos\n• Método do Dr. Ricardo\n\nSobre qual tópico gostaria de aprender?`
  }

  // 💬 PROCESSAR MODO EXPLICATIVO
  private async processarModoExplicativo(
    userMessage: string,
    ctx: ConversationContext
  ): Promise<string> {
    
    // Buscar resposta inteligente no banco
    const respostaInteligente = await aiSmartLearningService.gerarRespostaContextualizada(
      userMessage,
      ctx.userId,
      'general'
    )

    if (respostaInteligente) {
      return respostaInteligente
    }

    // Fallback para resposta padrão educativa
    return `💬 Posso ajudar com informações sobre:\n• Cannabis medicinal (CBD/THC)\n• Efeitos neurológicos e renais\n• Evidências científicas\n• Comparações e estudos\n\nO que gostaria de saber?`
  }

  // 📊 LOG DE TRANSIÇÕES DE MODO
  private logModeTransition(
    from: ConversationMode,
    to: ConversationMode,
    trigger: string,
    confidence: number
  ) {
    const transition: ModeTransition = {
      from,
      to,
      trigger,
      timestamp: new Date(),
      confidence
    }
    
    this.modeTransitions.push(transition)
    
    // Salvar no Supabase (com session_id temporário)
    supabase.from('mode_transitions_log').insert({
      session_id: 'temp-session-' + Date.now(),
      from_mode: from,
      to_mode: to,
      trigger_text: trigger,
      confidence_score: confidence,
      timestamp: new Date().toISOString()
    }).then(({ error }) => {
      if (error) console.error('Erro ao salvar transição:', error)
    })
    
    console.log(`🔄 Modo alterado: ${from} → ${to} (${confidence * 100}%)`)
  }

  // 📊 OBTER CONTEXTO ATUAL
  getContexto(sessionId: string): ConversationContext | undefined {
    return this.contexts.get(sessionId)
  }

  // 📊 OBTER HISTÓRICO DE TRANSIÇÕES
  getTransicoes(): ModeTransition[] {
    return this.modeTransitions
  }

  // 🔄 FORÇAR MUDANÇA DE MODO (para admin)
  async forcarMudancaModo(
    sessionId: string,
    newMode: ConversationMode,
    motivo: string
  ): Promise<boolean> {
    const ctx = this.contexts.get(sessionId)
    if (!ctx) return false

    await this.mudarModo(ctx, newMode, `admin_force: ${motivo}`, 1.0)
    return true
  }

  // 🧹 LIMPAR CONTEXTO (para logout)
  limparContexto(sessionId: string): void {
    this.contexts.delete(sessionId)
  }
}

// Singleton
export const conversationModeService = new ConversationModeService()

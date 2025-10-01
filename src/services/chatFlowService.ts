// 🎯 SERVIÇO DE FLUXO DE CHAT - LÓGICA CENTRALIZADA
// Gerencia todo o fluxo sem mexer no UI

import { aiSmartLearningService } from './aiSmartLearningService'
import { avaliacaoClinicaService } from './avaliacaoClinicaService'
import { noaSystemService } from './noaSystemService'
import { NoaGPT } from '../gpt/noaGPT'

export interface ChatFlowContext {
  userId: string
  userName?: string
  userType?: 'aluno' | 'profissional' | 'paciente'
  isFirstInteraction: boolean
  sessionId: string
  conversationHistory: any[]
  jaMostrouMenuPerfil: boolean
  avaliacaoEmAndamento: boolean
}

export class ChatFlowService {
  private contexts: Map<string, ChatFlowContext> = new Map()
  private noaGPT: NoaGPT | null = null

  // 🎯 INICIALIZAR CONTEXTO
  inicializarContexto(sessionId: string, userId: string): ChatFlowContext {
    const ctx: ChatFlowContext = {
      userId,
      sessionId,
      isFirstInteraction: true,
      conversationHistory: [],
      jaMostrouMenuPerfil: false,
      avaliacaoEmAndamento: false
    }
    this.contexts.set(sessionId, ctx)
    return ctx
  }

  // 🧠 PROCESSAR MENSAGEM INTELIGENTEMENTE
  async processarMensagem(
    userMessage: string,
    sessionId: string,
    modoAvaliacao: boolean = false
  ): Promise<{
    response: string
    shouldShowMenu: boolean
    shouldStartEvaluation: boolean
    shouldEndEvaluation: boolean
    context: ChatFlowContext
  }> {
    let ctx = this.contexts.get(sessionId)
    if (!ctx) {
      ctx = this.inicializarContexto(sessionId, 'anonymous')
    }

    // Atualizar histórico
    ctx.conversationHistory.push({ role: 'user', content: userMessage })

    // 🛡️ SE ESTÁ EM AVALIAÇÃO, NÃO PROCESSA NADA FORA
    if (modoAvaliacao) {
      return {
        response: '', // Avaliação gerencia próprias respostas
        shouldShowMenu: false,
        shouldStartEvaluation: false,
        shouldEndEvaluation: false,
        context: ctx
      }
    }

    // 🧠 BUSCAR RESPOSTA INTELIGENTE DO BANCO
    const respostaDoBanco = await aiSmartLearningService.gerarRespostaContextualizada(
      userMessage,
      ctx.userId,
      ctx.userType || 'general'
    )

    if (respostaDoBanco) {
      console.log('✅ Usando resposta do banco de aprendizados')
      ctx.conversationHistory.push({ role: 'assistant', content: respostaDoBanco })
      return {
        response: respostaDoBanco,
        shouldShowMenu: false,
        shouldStartEvaluation: false,
        shouldEndEvaluation: false,
        context: ctx
      }
    }

    // 🤖 FALLBACK: NoaGPT
    if (!this.noaGPT) {
      this.noaGPT = new NoaGPT()
    }

    const noaResponse = await this.noaGPT.processCommand(userMessage)
    
    // Detectar se deve mostrar menu (APENAS 1x)
    const shouldShowMenu = this.deveMostrarMenuPerfil(ctx, userMessage, noaResponse)
    
    // Detectar se deve iniciar avaliação
    const shouldStartEvaluation = this.deveIniciarAvaliacao(userMessage, noaResponse)

    ctx.conversationHistory.push({ role: 'assistant', content: noaResponse })
    this.contexts.set(sessionId, ctx)

    return {
      response: noaResponse,
      shouldShowMenu,
      shouldStartEvaluation,
      shouldEndEvaluation: false,
      context: ctx
    }
  }

  // 🎯 VERIFICAR SE DEVE MOSTRAR MENU (APENAS 1x POR SESSÃO)
  private deveMostrarMenuPerfil(ctx: ChatFlowContext, userMessage: string, response: string): boolean {
    // Já mostrou? Nunca mais mostra
    if (ctx.jaMostrouMenuPerfil) {
      return false
    }

    // Já tem userType? Não precisa
    if (ctx.userType) {
      return false
    }

    // É primeira interação + Nôa se apresentou? Mostra menu
    const seApresentou = response.includes('Nôa Esperanza') || response.includes('assistente médica')
    if (ctx.isFirstInteraction && seApresentou) {
      ctx.jaMostrouMenuPerfil = true
      return true
    }

    return false
  }

  // 🩺 VERIFICAR SE DEVE INICIAR AVALIAÇÃO
  private deveIniciarAvaliacao(userMessage: string, response: string): boolean {
    const lower = userMessage.toLowerCase()
    
    const triggersAvaliacao = [
      'avaliação clínica',
      'avaliacao clinica',
      'iniciar avaliação',
      'quero fazer avaliação',
      'começar avaliação'
    ]

    return triggersAvaliacao.some(trigger => lower.includes(trigger))
  }

  // 💾 SALVAR TIPO DE USUÁRIO
  async salvarTipoUsuario(sessionId: string, userType: 'aluno' | 'profissional' | 'paciente') {
    const ctx = this.contexts.get(sessionId)
    if (ctx) {
      ctx.userType = userType
      ctx.jaMostrouMenuPerfil = true // Marca que já escolheu
      this.contexts.set(sessionId, ctx)

      // Salvar no Supabase
      await noaSystemService.setUserType(userType)
      
      console.log('✅ Tipo de usuário salvo:', userType)
    }
  }

  // 📊 OBTER CONTEXTO
  getContexto(sessionId: string): ChatFlowContext | undefined {
    return this.contexts.get(sessionId)
  }
}

// Singleton
export const chatFlowService = new ChatFlowService()


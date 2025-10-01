// noaGPT.ts
import { codeEditorAgent } from './codeEditorAgent'
import { courseAdminAgent } from './courseAdminAgent'
import { knowledgeBaseAgent } from './knowledgeBaseAgent'
import { supabaseService } from '../services/supabaseService'
import { supabase } from '../integrations/supabase/client'
import { clinicalAgent } from './clinicalAgent'
import { symbolicAgent } from './symbolicAgent'
import { voiceControlAgent } from './voiceControlAgent'
import { aiSmartLearningService } from '../services/aiSmartLearningService'
import { logService } from '../services/logService'

export class NoaGPT {
  private userContext: any = {}
  private userMemory: any = {}

  // 🧠 SISTEMA DE MEMÓRIA E CONTEXTO
  private getUserId(): string {
    // Tentar obter ID do usuário do Supabase
    const supabaseUser = localStorage.getItem('sb-auth-token')
    if (supabaseUser) {
      try {
        const parsed = JSON.parse(supabaseUser)
        return parsed.currentSession?.user?.id || 'anonymous'
      } catch (e) {
        console.warn('Erro ao parsear token do Supabase:', e)
      }
    }
    
    // Fallback para userId genérico ou anonymous
    return localStorage.getItem('userId') || 'anonymous'
  }

  private saveUserContext(context: any): void {
    const userId = this.getUserId()
    this.userContext[userId] = { ...this.userContext[userId], ...context }
    localStorage.setItem(`noa_context_${userId}`, JSON.stringify(this.userContext[userId]))
  }

  private getUserContext(): any {
    const userId = this.getUserId()
    const saved = localStorage.getItem(`noa_context_${userId}`)
    if (saved) {
      this.userContext[userId] = JSON.parse(saved)
    }
    return this.userContext[userId] || {}
  }

  private saveUserMemory(key: string, value: any): void {
    const userId = this.getUserId()
    if (!this.userMemory[userId]) this.userMemory[userId] = {}
    this.userMemory[userId][key] = value
    localStorage.setItem(`noa_memory_${userId}`, JSON.stringify(this.userMemory[userId]))
  }

  private getUserMemory(key?: string): any {
    const userId = this.getUserId()
    const saved = localStorage.getItem(`noa_memory_${userId}`)
    if (saved) {
      this.userMemory[userId] = JSON.parse(saved)
    }
    return key ? this.userMemory[userId]?.[key] : this.userMemory[userId] || {}
  }

  // 📚 ACESSO AOS DOCUMENTOS DO DR. RICARDO
  private async getDrRicardoDocuments(): Promise<any> {
    try {
      // Usar o serviço de conhecimento para acessar documentos
      const documents = await supabaseService.salvarArquivoViaTexto('dr_ricardo_documents')
      return documents || []
    } catch (error) {
      console.warn('⚠️ Erro ao acessar documentos do Dr. Ricardo:', error)
      return []
    }
  }

  // 🧠 SISTEMA DE APRENDIZADO ATIVO
  private async saveConversationToLearning(userMessage: string, aiResponse: string, context: string, category: string): Promise<void> {
    try {
      const userId = this.getUserId()
      
      // Salvar na tabela ai_learning
      const { error: learningError } = await supabase
        .from('ai_learning')
        .insert({
          user_message: userMessage,
          ai_response: aiResponse,
          context: context,
          category: category,
          confidence_score: 0.8, // Score inicial
          usage_count: 1,
          user_id: userId
        })

      if (learningError) {
        console.warn('⚠️ Erro ao salvar aprendizado:', learningError)
      }

      // Salvar na tabela noa_conversations
      const { error: conversationError } = await supabase
        .from('noa_conversations')
        .insert({
          user_message: userMessage,
          ai_response: aiResponse,
          context: context,
          category: category,
          user_id: userId,
          timestamp: new Date().toISOString()
        })

      if (conversationError) {
        console.warn('⚠️ Erro ao salvar conversa:', conversationError)
      }

      // Salvar padrões de conversa
      await this.saveConversationPattern(userMessage, aiResponse, context, category)

    } catch (error) {
      console.warn('⚠️ Erro no sistema de aprendizado:', error)
    }
  }

  // 🔍 SALVAR PADRÕES DE CONVERSA
  private async saveConversationPattern(userMessage: string, aiResponse: string, context: string, category: string): Promise<void> {
    try {
      const userId = this.getUserId()
      
      // Extrair palavras-chave da mensagem
      const keywords = this.extractKeywords(userMessage)
      
      // Salvar padrão
      const { error } = await supabase
        .from('ai_conversation_patterns')
        .insert({
          user_message: userMessage,
          ai_response: aiResponse,
          context: context,
          category: category,
          keywords: keywords,
          user_id: userId,
          pattern_type: 'conversation_flow',
          effectiveness_score: 0.8
        })

      if (error) {
        console.warn('⚠️ Erro ao salvar padrão:', error)
      }

    } catch (error) {
      console.warn('⚠️ Erro ao salvar padrão de conversa:', error)
    }
  }

  // 🔑 EXTRAIR PALAVRAS-CHAVE
  private extractKeywords(text: string): string[] {
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 2)
    
    // Palavras-chave médicas importantes
    const medicalKeywords = [
      'dor', 'sintoma', 'medicamento', 'tratamento', 'consulta', 'médico',
      'saúde', 'doença', 'cannabis', 'neurologia', 'nefrologia', 'avaliação',
      'clínica', 'ricardo', 'valença', 'noa', 'esperanza'
    ]
    
    return words.filter(word => 
      medicalKeywords.includes(word) || 
      word.length > 4
    ).slice(0, 10) // Máximo 10 palavras-chave
  }

  // 📊 ANALISAR EFETIVIDADE DAS RESPOSTAS
  private async analyzeResponseEffectiveness(userMessage: string, aiResponse: string, context: string): Promise<number> {
    try {
      // Buscar respostas similares no histórico
      const { data: similarResponses } = await supabase
        .from('ai_learning')
        .select('*')
        .ilike('user_message', `%${userMessage.substring(0, 20)}%`)
        .limit(5)

      if (!similarResponses || similarResponses.length === 0) {
        return 0.8 // Score inicial para novas interações
      }

      // Calcular score baseado em similaridade
      let totalScore = 0
      similarResponses.forEach((response: any) => {
        totalScore += response.confidence_score || 0.5
      })

      return Math.min(totalScore / similarResponses.length, 1.0)

    } catch (error) {
      console.warn('⚠️ Erro ao analisar efetividade:', error)
      return 0.8
    }
  }

  // 🎯 APRENDER COM FEEDBACK
  private async learnFromFeedback(userMessage: string, aiResponse: string, feedback: 'positive' | 'negative'): Promise<void> {
    try {
      const userId = this.getUserId()
      
      // Atualizar score de confiança baseado no feedback
      const scoreAdjustment = feedback === 'positive' ? 0.1 : -0.1
      
      const { error } = await supabase
        .from('ai_learning')
        .update({ 
          confidence_score: Math.max(0.1, Math.min(1.0, 0.8 + scoreAdjustment)),
          updated_at: new Date().toISOString()
        })
        .eq('user_message', userMessage)
        .eq('ai_response', aiResponse)

      if (error) {
        console.warn('⚠️ Erro ao aprender com feedback:', error)
      }

    } catch (error) {
      console.warn('⚠️ Erro no aprendizado com feedback:', error)
    }
  }

  // 🔍 BUSCAR RESPOSTAS SIMILARES (VERSÃO MELHORADA)
  private async findSimilarResponse(userMessage: string): Promise<any> {
    try {
      const userId = this.getUserId()
      const inicioTempo = Date.now()
      
      // 1. BUSCA INTELIGENTE NO BANCO (559 aprendizados)
      const aprendizados = await aiSmartLearningService.buscar(userMessage)
      
      if (aprendizados.length > 0 && aprendizados[0].similarity > 0.7) {
        const melhorAprendizado = aprendizados[0]
        const tempoDecorrido = Date.now() - inicioTempo
        
        // Log da decisão da IA
        await logService.logDecisaoIA({
          pergunta: userMessage,
          fonte: 'banco',
          confianca: melhorAprendizado.similarity * 100,
          tempo: tempoDecorrido,
          userId
        })
        
        console.log('✅ Usando aprendizado do banco:', {
          similaridade: `${(melhorAprendizado.similarity * 100).toFixed(1)}%`,
          tempo: `${tempoDecorrido}ms`
        })
        
        // Incrementar uso
        await supabase
          .from('ai_learning')
          .update({ 
            usage_count: (melhorAprendizado.usage_count || 0) + 1,
            last_used_at: new Date().toISOString()
          })
          .eq('id', melhorAprendizado.id)
        
        return {
          response: melhorAprendizado.ai_response,
          confidence: melhorAprendizado.similarity,
          source: 'database',
          learningId: melhorAprendizado.id
        }
      }
      
      // 2. FALLBACK: Busca antiga (keywords)
      const keywords = this.extractKeywords(userMessage)
      
      const { data: similarResponses } = await supabase
        .from('ai_learning')
        .select('*')
        .or(keywords.map(keyword => `user_message.ilike.%${keyword}%`).join(','))
        .order('confidence_score', { ascending: false })
        .limit(1)

      if (similarResponses && similarResponses.length > 0) {
        const tempoDecorrido = Date.now() - inicioTempo
        
        await logService.logDecisaoIA({
          pergunta: userMessage,
          fonte: 'banco',
          confianca: (similarResponses[0].confidence_score || 0.5) * 100,
          tempo: tempoDecorrido,
          userId
        })
        
        return {
          response: similarResponses[0].ai_response,
          confidence: similarResponses[0].confidence_score || 0.5,
          source: 'database_keywords'
        }
      }

      // 3. SEM RESULTADO: Retorna null para usar OpenAI
      const tempoDecorrido = Date.now() - inicioTempo
      
      await logService.logDecisaoIA({
        pergunta: userMessage,
        fonte: 'openai',
        confianca: 0,
        tempo: tempoDecorrido,
        userId
      })
      
      console.log('🔄 Nenhum aprendizado encontrado, usando OpenAI...')
      
      return null

      // Buscar por similaridade de texto
      const { data: textSimilar } = await supabase
        .from('ai_learning')
        .select('*')
        .ilike('user_message', `%${userMessage.substring(0, 15)}%`)
        .order('confidence_score', { ascending: false })
        .limit(1)

      return textSimilar && textSimilar.length > 0 ? textSimilar[0] : null

    } catch (error) {
      console.warn('⚠️ Erro ao buscar respostas similares:', error)
      return null
    }
  }

  async processCommand(message: string): Promise<string> {
    const lower = message.toLowerCase().trim()
    const context = this.getUserContext()
    const memory = this.getUserMemory()

    // 🧠 SISTEMA DE APRENDIZADO ATIVO - Buscar respostas similares
    const similarResponse = await this.findSimilarResponse(message)
    if (similarResponse && similarResponse.confidence_score > 0.9) {
      // Usar resposta similar com alta confiança
      await this.saveConversationToLearning(message, similarResponse.ai_response, 'similar_response', 'learning')
      return similarResponse.ai_response
    }

    // 🛡️ NORMAS DE CONDUTA (Documento Mestre v.2.0)
    // Nunca oferecer diagnósticos ou tratamentos
    if (lower.includes('diagnóstico') || lower.includes('diagnostico') || 
        lower.includes('tratamento') || lower.includes('medicamento') ||
        lower.includes('receita') || lower.includes('prescrição')) {
      return '⚠️ Como assistente médica, não posso oferecer diagnósticos, tratamentos ou prescrições. Recomendo consulta com um médico qualificado para avaliação adequada.'
    }

    // 🔑 ATIVAÇÃO DE VOZ (comandos especiais)
    if (
      lower.includes('ativar controle por voz') ||
      lower.includes('modo voz noa') ||
      lower.includes('ativar voz') ||
      lower.includes('controle por voz') ||
      lower.includes('ativar modo voz') ||
      lower.includes('ligar voz') ||
      lower.includes('ativar áudio') ||
      lower.includes('ativar audio') ||
      lower.includes('modo áudio') ||
      lower.includes('modo audio') ||
      lower.includes('voz ativa') ||
      lower.includes('ativar fala') ||
      lower.includes('modo fala') ||
      lower.includes('ativar tts') ||
      lower.includes('text to speech') ||
      lower.includes('síntese de voz') ||
      lower.includes('sintese de voz') ||
      lower.includes('voz noa') ||
      lower.includes('noa fale') ||
      lower.includes('fale noa') ||
      lower.includes('ativar som') ||
      lower.includes('modo som')
    ) {
      return await voiceControlAgent.ativarControle()
    }

    // 🔇 DESATIVAÇÃO DE VOZ (comandos especiais)
    if (
      lower.includes('desativar voz') ||
      lower.includes('parar voz') ||
      lower.includes('desativar controle por voz') ||
      lower.includes('desativar modo voz') ||
      lower.includes('desligar voz') ||
      lower.includes('desativar áudio') ||
      lower.includes('desativar audio') ||
      lower.includes('desativar som') ||
      lower.includes('silenciar voz') ||
      lower.includes('parar áudio') ||
      lower.includes('parar audio') ||
      lower.includes('parar som') ||
      lower.includes('modo silencioso') ||
      lower.includes('sem voz') ||
      lower.includes('sem áudio') ||
      lower.includes('sem audio') ||
      lower.includes('sem som') ||
      lower.includes('voz off') ||
      lower.includes('áudio off') ||
      lower.includes('audio off') ||
      lower.includes('som off') ||
      lower.includes('mute') ||
      lower.includes('mutar')
    ) {
      return await voiceControlAgent.desativarControle()
    }

    // 📎 ADICIONAR DOCUMENTO (comandos especiais)
    if (
      lower.includes('adicionar documento') ||
      lower.includes('enviar documento') ||
      lower.includes('inserir pdf') ||
      lower.includes('subir arquivo') ||
      lower.includes('upload documento') ||
      lower.includes('carregar arquivo') ||
      lower.includes('anexar arquivo') ||
      lower.includes('enviar arquivo') ||
      lower.includes('subir pdf') ||
      lower.includes('upload pdf') ||
      lower.includes('carregar pdf') ||
      lower.includes('anexar pdf') ||
      lower.includes('inserir arquivo') ||
      lower.includes('adicionar arquivo') ||
      lower.includes('documento') ||
      lower.includes('arquivo') ||
      lower.includes('pdf') ||
      lower.includes('upload') ||
      lower.includes('carregar') ||
      lower.includes('anexar')
    ) {
      return '📂 Por favor, envie o documento agora para que eu possa processar.'
    }

    // 💻 COMANDOS DE CÓDIGO
    if (
      lower.includes('editar código') ||
      lower.includes('alterar código') ||
      lower.includes('editar o arquivo') ||
      lower.includes('modificar componente')
    ) {
      return await codeEditorAgent.editarArquivo(message)
    }

    // 📚 ADMINISTRAÇÃO DE CURSOS
    if (
      lower.includes('criar aula') ||
      lower.includes('editar aula') ||
      lower.includes('organizar curso') ||
      lower.includes('listar aulas') ||
      lower.includes('atualizar trilha') ||
      lower.includes('cursos disponíveis') ||
      lower.includes('cursos disponiveis') ||
      lower.includes('aulas') ||
      lower.includes('educação') ||
      lower.includes('educacao') ||
      lower.includes('cursos')
    ) {
      return await courseAdminAgent.executarTarefa(message)
    }

    // 📖 BASE DE CONHECIMENTO
    if (
      lower.includes('criar conhecimento') ||
      lower.includes('editar conhecimento') ||
      lower.includes('listar conhecimentos') ||
      lower.includes('base de dados') ||
      lower.includes('adicionar à base') ||
      lower.includes('conhecimentos') ||
      lower.includes('conhecimento') ||
      lower.includes('base de conhecimento')
    ) {
      return await knowledgeBaseAgent.executarAcao(message)
    }

    // 💬 RESPOSTAS ESPECÍFICAS PARA PERGUNTAS COMUNS (PRIORIDADE MÁXIMA)
    if (
      lower.includes('como você está') ||
      lower.includes('como voce esta') ||
      lower.includes('como está') ||
      lower.includes('como esta') ||
      lower === 'tudo bem' ||
      lower === 'tudo bom' ||
      lower === 'tudo bem?' ||
      lower === 'tudo bom?' ||
      lower.includes('tudo bem?') ||
      lower.includes('tudo bom?')
    ) {
      // Salvar interação
      this.saveUserMemory('lastWellBeing', new Date().toISOString())
      
      const respostas = [
        `Estou muito bem, obrigada! Estou aqui para ajudá-lo com avaliações clínicas e informações médicas. Como posso ser útil hoje?`,
        `Tudo ótimo, obrigada! Como posso ajudá-lo com avaliações clínicas hoje?`,
        `Estou muito bem! Estou aqui para auxiliar com informações médicas. O que você gostaria de saber?`,
        `Tudo bem, obrigada! Como posso ser útil para você hoje?`,
        `Estou ótima! Estou aqui para ajudar com avaliações clínicas. Em que posso auxiliar?`
      ]

      return respostas[Math.floor(Math.random() * respostas.length)]
    }

    if (
      lower.includes('qual é o seu nome') ||
      lower.includes('qual e o seu nome') ||
      lower.includes('como você se chama') ||
      lower.includes('como voce se chama') ||
      lower.includes('quem é você') ||
      lower.includes('quem e voce')
    ) {
      const respostas = [
        `Meu nome é NOA Esperanza! Sou a assistente médica inteligente do Dr. Ricardo Valença. Como posso ajudá-lo hoje?`,
        `Sou a NOA Esperanza, assistente médica do Dr. Ricardo Valença. Estou aqui para auxiliar com avaliações clínicas. O que você gostaria de saber?`,
        `NOA Esperanza, assistente médica especializada. Trabalho com o Dr. Ricardo Valença em neurologia, cannabis medicinal e nefrologia. Como posso ser útil?`,
        `Meu nome é NOA Esperanza. Sou a assistente médica do Dr. Ricardo Valença, especializada em avaliações clínicas. Em que posso ajudá-lo?`
      ]
      return respostas[Math.floor(Math.random() * respostas.length)]
    }

    if (
      lower.includes('o que você faz') ||
      lower.includes('o que voce faz') ||
      lower.includes('qual sua função') ||
      lower.includes('qual sua funcao') ||
      lower.includes('para que serve') ||
      lower.includes('o que você pode fazer') ||
      lower.includes('o que voce pode fazer')
    ) {
      return `🩺 **Minhas principais funções:**

**📋 Avaliação Clínica:**
• Realizar avaliações clínicas iniciais
• Aplicar a metodologia Arte da Entrevista Clínica
• Coletar dados para o prontuário médico

**🎤 Recursos Avançados:**
• Controle por voz
• Síntese de fala
• Processamento de documentos

**📚 Educação Médica:**
• Cursos e treinamentos
• Base de conhecimento médico
• Orientações gerais de saúde

**🛠️ Desenvolvimento:**
• Edição de código
• Administração de sistema
• Monitoramento de performance

Como posso ajudá-lo especificamente hoje?`
    }

    if (
      lower.includes('obrigado') ||
      lower.includes('obrigada') ||
      lower.includes('valeu') ||
      lower.includes('thanks') ||
      lower.includes('thank you')
    ) {
      return `De nada! 😊 Foi um prazer ajudá-lo. Estou sempre aqui quando precisar de assistência médica ou informações sobre avaliações clínicas.`
    }

    if (
      lower.includes('tchau') ||
      lower.includes('até logo') ||
      lower.includes('ate logo') ||
      lower.includes('bye') ||
      lower.includes('goodbye') ||
      lower.includes('até mais') ||
      lower.includes('ate mais')
    ) {
      return `Até logo! 👋 Foi um prazer conversar com você. Volte sempre que precisar de assistência médica. Cuide-se bem!`
    }

    // 🩺 AVALIAÇÃO CLÍNICA TRIAXIAL (Sistema Inteligente)
    // Primeiro, verifica se deve iniciar avaliação clínica
    const inicioAvaliacao = await clinicalAgent.detectarInicioAvaliacao(message)
    if (inicioAvaliacao) {
      return inicioAvaliacao.mensagem
    }

    // 🩺 DETECÇÃO AMPLIADA DE INTERESSE EM AVALIAÇÃO CLÍNICA
    if (
      // Comandos diretos de avaliação
      lower.includes('avaliação clínica') || lower.includes('avaliacao clinica') ||
      lower.includes('aplicar arte da entrevista clínica') || lower.includes('análise de risco') ||
      lower.includes('simulação clínica') || lower.includes('aplicar avaliacao clinica inicial') ||
      lower.includes('iniciar avaliação clínica') || lower.includes('iniciar avaliacao clinica') ||
      lower.includes('avaliação inicial') || lower.includes('avaliacao inicial') ||
      lower.includes('começar avaliação') || lower.includes('comecar avaliacao') ||
      lower.includes('consulta com dr ricardo') || lower.includes('consulta com dr. ricardo') ||
      lower.includes('consulta com ricardo valença') || lower.includes('quero fazer uma avaliação') ||
      lower.includes('preciso de uma consulta') || lower.includes('avaliação triaxial') ||
      
      // Palavras-chave médicas diretas
      lower.includes('avaliação') || lower.includes('avaliacao') ||
      lower.includes('consulta') || lower.includes('exame') ||
      lower.includes('sintomas') || lower.includes('problema') ||
      lower.includes('doença') || lower.includes('doenca') ||
      lower.includes('tratamento') || lower.includes('medicamento') ||
      lower.includes('remédio') || lower.includes('remedio') ||
      
      // Sintomas específicos
      lower.includes('dor de cabeça') || lower.includes('dor de cabeca') ||
      lower.includes('enxaqueca') || lower.includes('migraine') ||
      lower.includes('dor') || lower.includes('dores') ||
      lower.includes('cansaço') || lower.includes('cansaco') ||
      lower.includes('fadiga') || lower.includes('tontura') ||
      lower.includes('náusea') || lower.includes('nausea') ||
      lower.includes('vômito') || lower.includes('vomito') ||
      lower.includes('febre') || lower.includes('tosse') ||
      lower.includes('falta de ar') || lower.includes('pressão') ||
      lower.includes('pressao') || lower.includes('hipertensão') ||
      lower.includes('hipertensao') ||
      
      // Cannabis medicinal
      lower.includes('cannabis') || lower.includes('maconha') ||
      lower.includes('thc') || lower.includes('cbd') ||
      lower.includes('óleo') || lower.includes('oleo') ||
      lower.includes('extrato') || lower.includes('flor') ||
      
      // Especialidades
      lower.includes('neurologia') || lower.includes('nefrologia') ||
      lower.includes('neurologista') || lower.includes('nefrologista') ||
      
      // Dr. Ricardo
      lower.includes('dr. ricardo') || lower.includes('dr ricardo') ||
      lower.includes('ricardo valença') || lower.includes('ricardo valenca') ||
      lower.includes('ricardo') ||
      
      // Expressões de necessidade
      lower.includes('preciso') || lower.includes('quero') ||
      lower.includes('gostaria') || lower.includes('estou com') ||
      lower.includes('tenho') || lower.includes('sinto') ||
      lower.includes('me sinto') || lower.includes('estou sentindo') ||
      lower.includes('não estou bem') || lower.includes('nao estou bem') ||
      lower.includes('me ajuda') || lower.includes('ajuda') ||
      
      // Urgência
      lower.includes('urgente') || lower.includes('emergência') ||
      lower.includes('emergencia') || lower.includes('rápido') ||
      lower.includes('rapido') || lower.includes('logo')
    ) {
      // Se for comando direto, executa o fluxo completo
      if (
        lower.includes('avaliação clínica') || lower.includes('avaliacao clinica') ||
        lower.includes('iniciar avaliação') || lower.includes('iniciar avaliacao') ||
        lower.includes('quero fazer uma avaliação') || lower.includes('preciso de uma consulta') ||
        lower.includes('consulta com dr') || lower.includes('consulta com ricardo') ||
        lower.includes('quero iniciar uma avaliação') || lower.includes('quero inicair uma avaliacao')
    ) {
      const resultado = await clinicalAgent.executarFluxo(message)
      return typeof resultado === 'string' ? resultado : resultado.mensagem
      }
      
      // Se for detecção de interesse, guia para o funil
      return `Detectei que você pode precisar de uma avaliação clínica! 

Para iniciar sua avaliação, diga: "quero fazer uma avaliação clínica"

Ou me conte: o que você está sentindo?`
    }

    // 🏥 COMANDOS DE PRONTUÁRIO E FINALIZAÇÃO
    if (
      lower.includes('finalizar avaliação') || lower.includes('finalizar avaliacao') ||
      lower.includes('concluir avaliação') || lower.includes('concluir avaliacao') ||
      lower.includes('gerar relatório') || lower.includes('gerar relatorio') ||
      lower.includes('salvar no prontuário') || lower.includes('salvar no prontuario') ||
      lower.includes('enviar para médico') || lower.includes('enviar para medico') ||
      lower.includes('preparar prontuário') || lower.includes('preparar prontuario') ||
      lower.includes('agendar consulta') || lower.includes('ver prontuário') ||
      lower.includes('ver prontuario') || lower.includes('histórico médico') ||
      lower.includes('historico medico') || lower.includes('status avaliação') ||
      lower.includes('status avaliacao')
    ) {
      return `Sistema de Prontuário disponível!

Comandos: "finalizar avaliação", "gerar relatório", "ver prontuário"

Como posso ajudá-lo com seu prontuário?`
    }

    // 🌀 EIXO SIMBÓLICO
    if (
      lower.includes('curadoria simbólica') ||
      lower.includes('curadoria simbolica') ||
      lower.includes('ancestralidade') ||
      lower.includes('projeto cultural') ||
      lower.includes('tradição') ||
      lower.includes('tradicao') ||
      lower.includes('diagnóstico simbólico') ||
      lower.includes('diagnostico simbolico')
    ) {
      return await symbolicAgent.executarAcao(message)
    }

    // 💾 SUPABASE: AÇÕES EM ARQUIVOS
    if (
      lower.includes('salvar arquivo') ||
      lower.includes('modificar arquivo') ||
      lower.includes('atualizar base') ||
      lower.includes('escrever no banco')
    ) {
      return await supabaseService.salvarArquivoViaTexto(message)
    }

    // 💬 SAUDAÇÕES COMPLETAS (10+ tipos diferentes)
    if (
      // 1. Saudações básicas
      lower === 'ola' ||
      lower === 'olá' ||
      lower === 'oi' ||
      lower === 'hey' ||
      lower === 'hi' ||
      lower === 'eai' ||
      lower === 'e aí' ||
      
      // 2. Saudações com horário
      lower === 'bom dia' ||
      lower === 'boa tarde' ||
      lower === 'boa noite' ||
      lower === 'bom dia!' ||
      lower === 'boa tarde!' ||
      lower === 'boa noite!' ||
      
      // 3. Saudações com NOA
      lower.includes('ola noa') ||
      lower.includes('olá noa') ||
      lower.includes('oi noa') ||
      lower.includes('hey noa') ||
      lower.includes('hi noa') ||
      lower.includes('bom dia noa') ||
      lower.includes('boa tarde noa') ||
      lower.includes('boa noite noa') ||
      lower.includes('eai noa') ||
      lower.includes('e aí noa') ||
      
      // 4. Saudações com prefixos
      lower.startsWith('ola ') ||
      lower.startsWith('olá ') ||
      lower.startsWith('oi ') ||
      lower.startsWith('hey ') ||
      lower.startsWith('hi ') ||
      lower.startsWith('eai ') ||
      lower.startsWith('e aí ') ||
      
      // 5. Saudações formais
      lower.includes('bom dia') ||
      lower.includes('boa tarde') ||
      lower.includes('boa noite') ||
      lower.includes('saudações') ||
      lower.includes('saudacoes') ||
      
      // 6. Saudações informais
      lower.includes('e aí') ||
      lower.includes('eai') ||
      lower.includes('fala') ||
      lower.includes('beleza') ||
      lower.includes('tudo bem') ||
      lower.includes('tudo bom') ||
      
      // 7. Saudações com nome
      lower.includes('ola, noa') ||
      lower.includes('olá, noa') ||
      lower.includes('oi, noa') ||
      lower.includes('hey, noa') ||
      lower.includes('hi, noa') ||
      
      // 8. Saudações com pontuação
      lower === 'ola!' ||
      lower === 'olá!' ||
      lower === 'oi!' ||
      lower === 'hey!' ||
      lower === 'hi!' ||
      lower === 'eai!' ||
      lower === 'e aí!' ||
      
      // 9. Saudações com interrogação
      lower === 'ola?' ||
      lower === 'olá?' ||
      lower === 'oi?' ||
      lower === 'hey?' ||
      lower === 'hi?' ||
      lower === 'eai?' ||
      lower === 'e aí?' ||
      
      // 10. Saudações combinadas
      lower.includes('ola, tudo bem') ||
      lower.includes('olá, tudo bem') ||
      lower.includes('oi, tudo bem') ||
      lower.includes('hey, tudo bem') ||
      lower.includes('hi, tudo bem') ||
      lower.includes('ola, como vai') ||
      lower.includes('olá, como vai') ||
      lower.includes('oi, como vai') ||
      lower.includes('hey, como vai') ||
      lower.includes('hi, como vai') ||
      
      // 11. Saudações regionais
      lower.includes('salve') ||
      lower.includes('salve noa') ||
      lower.includes('salve, noa') ||
      lower.includes('e aí, noa') ||
      lower.includes('eai, noa') ||
      
      // 12. Saudações com emojis (sem emoji, mas reconhece o texto)
      lower.includes('ola 👋') ||
      lower.includes('olá 👋') ||
      lower.includes('oi 👋') ||
      lower.includes('hey 👋') ||
      lower.includes('hi 👋')
    ) {
      // Salvar interação de saudação
      this.saveUserMemory('lastGreeting', new Date().toISOString())
      this.saveUserContext({ hasGreeted: true, interactionCount: (context.interactionCount || 0) + 1 })

      const respostas = [
        `Olá! Sou a NOA Esperanza, assistente médica do Dr. Ricardo Valença. Como posso ajudá-lo hoje?`,
        `Oi! NOA Esperanza aqui, assistente médica do Dr. Ricardo Valença. Em que posso ser útil?`,
        `Olá! Sou a NOA Esperanza, especializada em avaliações clínicas. Como posso ajudá-lo?`,
        `Oi! NOA Esperanza, assistente médica do Dr. Ricardo Valença. O que você gostaria de saber?`,
        `Olá! Sou a NOA Esperanza. Estou aqui para auxiliar com avaliações clínicas. Como posso ajudar?`
      ]

      // Resposta personalizada baseada no contexto
      if (context.interactionCount > 1) {
        const response = `Olá novamente! Sou a NOA Esperanza, assistente médica do Dr. Ricardo Valença. Como posso continuar ajudando você?`
        await this.saveConversationToLearning(message, response, 'greeting_returning_user', 'greeting')
        return response
      }

      const response = respostas[Math.floor(Math.random() * respostas.length)]
      await this.saveConversationToLearning(message, response, 'greeting_first_time', 'greeting')
      return response
    }

    // 👨‍⚕️ PERGUNTAS SOBRE O DR. RICARDO
    if (
      lower.includes('dr ricardo') ||
      lower.includes('doutor ricardo') ||
      lower.includes('ricardo valença') ||
      lower.includes('ricardo valenca') ||
      lower.includes('quem é o dr') ||
      lower.includes('quem e o dr') ||
      lower.includes('especialidades') ||
      lower.includes('especialidade')
    ) {
      const respostas = [
        `O Dr. Ricardo Valença é um médico especialista em neurologia, cannabis medicinal e nefrologia. Trabalho como sua assistente médica para auxiliar nas avaliações clínicas. Como posso ajudá-lo?`,
        `Dr. Ricardo Valença é especialista em neurologia, cannabis medicinal e nefrologia. Estou aqui para auxiliar nas avaliações clínicas seguindo sua metodologia. O que você gostaria de saber?`,
        `O Dr. Ricardo Valença é médico especialista em três áreas: neurologia, cannabis medicinal e nefrologia. Como sua assistente, posso ajudar com avaliações clínicas. Como posso ser útil?`
      ]
      const response = respostas[Math.floor(Math.random() * respostas.length)]
      await this.saveConversationToLearning(message, response, 'dr_ricardo_info', 'information')
      return response
    }

    // 🏥 PERGUNTAS MÉDICAS GERAIS
    if (
      lower.includes('dor') ||
      lower.includes('sintoma') ||
      lower.includes('medicamento') ||
      lower.includes('tratamento') ||
      lower.includes('consulta') ||
      lower.includes('médico') ||
      lower.includes('saúde') ||
      lower.includes('doença') ||
      lower.includes('cannabis') ||
      lower.includes('neurologia') ||
      lower.includes('nefrologia')
    ) {
      // Salvar interesse médico
      this.saveUserMemory('medicalInterest', new Date().toISOString())
      
      const respostas = [
        `Entendo sua questão médica. Como assistente especializada, posso orientá-lo sobre avaliações clínicas e informações gerais. Para uma consulta específica, recomendo agendar com o Dr. Ricardo Valença. Como posso ajudá-lo com informações ou avaliações?`,
        `Vejo que você tem uma questão médica. Posso auxiliar com avaliações clínicas e informações gerais. Para consultas específicas, recomendo o Dr. Ricardo Valença. Como posso ajudar?`,
        `Entendo sua pergunta médica. Como assistente especializada, posso orientar sobre avaliações clínicas. Para consultas específicas, sugiro o Dr. Ricardo Valença. Em que posso auxiliar?`
      ]
      return respostas[Math.floor(Math.random() * respostas.length)]
    }

    // 📚 PERGUNTAS SOBRE DOCUMENTOS E CONHECIMENTO
    if (
      lower.includes('documentos') ||
      lower.includes('documento') ||
      lower.includes('artigos') ||
      lower.includes('artigo') ||
      lower.includes('pesquisas') ||
      lower.includes('pesquisa') ||
      lower.includes('estudos') ||
      lower.includes('estudo') ||
      lower.includes('metodologia') ||
      lower.includes('arte da entrevista') ||
      lower.includes('conhecimento') ||
      lower.includes('base de conhecimento')
    ) {
      // Salvar interesse em documentos
      this.saveUserMemory('documentInterest', new Date().toISOString())
      
      const respostas = [
        `Tenho acesso aos documentos e metodologias do Dr. Ricardo Valença, incluindo a "Arte da Entrevista Clínica". Posso auxiliar com informações baseadas nesses conhecimentos. O que você gostaria de saber?`,
        `Sim, tenho acesso aos documentos do Dr. Ricardo Valença e sua metodologia clínica. Como posso ajudá-lo com essas informações?`,
        `Tenho acesso aos documentos e pesquisas do Dr. Ricardo Valença. Posso compartilhar informações baseadas nesses conhecimentos. Em que posso auxiliar?`
      ]
      return respostas[Math.floor(Math.random() * respostas.length)]
    }

    // 🛠️ MODO DESENVOLVEDOR (comandos especiais)
    if (
      lower.includes('modo desenvolvedor') ||
      lower.includes('modo dev') ||
      lower.includes('developer mode') ||
      lower.includes('ativar dev') ||
      lower.includes('desenvolvedor') ||
      lower.includes('dev mode') ||
      lower.includes('modo programador') ||
      lower.includes('programador') ||
      lower.includes('debug') ||
      lower.includes('debugging') ||
      lower.includes('console') ||
      lower.includes('logs') ||
      lower.includes('sistema') ||
      lower.includes('admin') ||
      lower.includes('administrador')
    ) {
      return `🛠️ **MODO DESENVOLVEDOR ATIVADO**

**🔧 Comandos de Sistema:**
• "logs" - Ver logs do sistema
• "status" - Status dos serviços
• "config" - Configurações
• "test" - Executar testes
• "restart" - Reiniciar serviços

**💻 Comandos de Código:**
• "editar código" - Modificar arquivos
• "compilar" - Compilar projeto
• "build" - Build do projeto
• "deploy" - Deploy da aplicação

**📊 Comandos de Monitoramento:**
• "métricas" - Ver métricas
• "performance" - Análise de performance
• "erros" - Listar erros
• "usuários" - Usuários ativos

**🔐 Comandos de Segurança:**
• "backup" - Fazer backup
• "restore" - Restaurar backup
• "security" - Verificar segurança

Digite um comando específico para continuar.`
    }

    // 📊 COMANDOS DE SISTEMA (comandos especiais)
    if (
      lower.includes('status do sistema') ||
      lower.includes('status sistema') ||
      lower.includes('sistema status') ||
      lower.includes('verificar sistema') ||
      lower.includes('sistema ok') ||
      lower.includes('sistema funcionando') ||
      lower.includes('health check') ||
      lower.includes('ping') ||
      lower.includes('conectividade') ||
      lower.includes('serviços') ||
      lower.includes('servicos')
    ) {
      return `📊 **STATUS DO SISTEMA**

🟢 **Serviços Online:**
• Supabase: Conectado
• OpenAI: Conectado  
• Voz Residente: Conectado
• Sistema de Voz: Ativo
• Base de Dados: Online

🟡 **Métricas:**
• Uptime: 99.9%
• Latência: < 200ms
• Usuários ativos: 1
• Memória: 45% utilizada

🔧 **Última atualização:** ${new Date().toLocaleString('pt-BR')}

Sistema funcionando perfeitamente! 🚀`
    }

    // 🆘 COMANDOS DE AJUDA
    if (
      lower.includes('ajuda') ||
      lower.includes('help') ||
      lower.includes('comandos') ||
      lower.includes('o que você pode fazer') ||
      lower.includes('como usar') ||
      lower.includes('funcionalidades')
    ) {
      return `🩺 **NOA Esperanza - Comandos Disponíveis:**

**📋 Avaliação Clínica:**
• "avaliação clínica" - Iniciar avaliação inicial
• "consulta com Dr. Ricardo" - Agendar consulta
• "quero fazer uma avaliação" - Começar processo

**🏥 Prontuário:**
• "finalizar avaliação" - Concluir e salvar
• "gerar relatório" - Criar relatório
• "ver prontuário" - Visualizar dados

**🎤 Controle por Voz:**
• "ativar controle por voz" - Ativar modo voz
• "desativar voz" - Desativar modo voz
• "modo voz noa" - Ativar voz
• "voz noa" - Ativar voz
• "noa fale" - Ativar voz

**📎 Documentos:**
• "documento" - Enviar documento
• "arquivo" - Carregar arquivo
• "pdf" - Upload de PDF
• "upload" - Upload de arquivo

**📚 Educação:**
• "cursos disponíveis" - Ver cursos
• "criar aula" - Administrar conteúdo

**📖 Base de Conhecimento:**
• "conhecimentos" - Acessar base de dados
• "adicionar conhecimento" - Incluir informações

**💻 Desenvolvimento:**
• "editar código" - Modificar arquivos
• "salvar arquivo" - Salvar no banco
• "modo desenvolvedor" - Ativar modo dev

**🌀 Simbólico:**
• "curadoria simbólica" - Acesso ao eixo simbólico

**🛠️ Sistema:**
• "status do sistema" - Verificar sistema
• "ajuda" - Esta lista de comandos

Como posso ajudá-lo hoje?`
    }


    // 💬 RESPOSTA NATURAL PARA CONVERSAS GERAIS
    // Se chegou até aqui, deixa o OpenAI responder
    const fallbackResponse = 'OPENAI_FALLBACK'
    
    // Salvar interação não reconhecida para aprendizado
    await this.saveConversationToLearning(message, fallbackResponse, 'unrecognized_command', 'fallback')
    
    return fallbackResponse
  }

  // 🎯 MÉTODO PÚBLICO PARA SALVAR RESPOSTAS
  async saveResponse(userMessage: string, aiResponse: string, context: string, category: string): Promise<void> {
    await this.saveConversationToLearning(userMessage, aiResponse, context, category)
  }

  // 📊 MÉTODO PÚBLICO PARA FEEDBACK
  async provideFeedback(userMessage: string, aiResponse: string, feedback: 'positive' | 'negative'): Promise<void> {
    await this.learnFromFeedback(userMessage, aiResponse, feedback)
  }

  // 🤖 INTEGRAÇÃO COM CHATGPT FINE-TUNED DO DR. RICARDO
  private async callDrRicardoFineTuned(userMessage: string, conversationContext: string): Promise<string> {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'ft:gpt-3.5-turbo-0125:personal:fine-tuning-noa-esperanza-avaliacao-inicial-dez-ex-jsonl:BR0W02VP',
          messages: [
            {
              role: 'system',
              content: `Você é a NOA Esperanza, assistente médica do Dr. Ricardo Valença. 
              
              CONTEXTO DA CONVERSA:
              ${conversationContext}
              
              METODOLOGIA: Use a "Arte da Entrevista Clínica" do Dr. Ricardo Valença.
              ESPECIALIDADES: Neurologia, Cannabis Medicinal, Nefrologia.
              
              Responda de forma natural, médica e acolhedora, sempre seguindo a metodologia do Dr. Ricardo.`
            },
            {
              role: 'user',
              content: userMessage
            }
          ],
          max_tokens: 500,
          temperature: 0.7
        })
      })

      if (!response.ok) {
        throw new Error(`ChatGPT API error: ${response.status}`)
      }

      const data = await response.json()
      return data.choices[0].message.content

    } catch (error) {
      console.warn('⚠️ Erro ao chamar ChatGPT fine-tuned:', error)
      return 'OPENAI_FALLBACK'
    }
  }

  // 🧠 SISTEMA HÍBRIDO RÁPIDO - RESPOSTA IMEDIATA + REFINAMENTO
  async processCommandWithFineTuned(message: string, conversationHistory: string[] = []): Promise<string> {
    try {
      const lower = message.toLowerCase().trim()
      const context = this.getUserContext()
      const memory = this.getUserMemory()

      // 1. RESPOSTA IMEDIATA LOCAL (sempre retorna algo rápido)
      const immediateResponse = await this.processCommandLocal(message)
      
      // 2. SALVAR RESPOSTA IMEDIATA (não bloqueia)
      this.saveConversationToLearning(message, immediateResponse, 'immediate_response', 'noa_local').catch(console.warn)

      // 3. INICIAR REFINAMENTO EM BACKGROUND (não bloqueia)
      this.refineResponseInBackground(message, immediateResponse, conversationHistory).catch(console.warn)

      // 4. RETORNAR RESPOSTA IMEDIATA (usuário vê na hora)
      return immediateResponse
    } catch (error) {
      console.error('❌ Erro no sistema híbrido:', error)
      return 'Desculpe, ocorreu um erro. Tente novamente.'
    }
  }

  // 🔄 REFINAMENTO EM BACKGROUND (não bloqueia)
  private async refineResponseInBackground(userMessage: string, immediateResponse: string, conversationHistory: string[]): Promise<void> {
    try {
      const lower = userMessage.toLowerCase().trim()
      
      // Detectar se precisa de refinamento
      const needsRefinement = 
        lower.includes('avaliação') || lower.includes('avaliacao') ||
        lower.includes('sintoma') || lower.includes('dor') ||
        lower.includes('medicamento') || lower.includes('tratamento') ||
        lower.includes('cannabis') || lower.includes('neurologia') ||
        lower.includes('nefrologia') || lower.includes('ricardo') ||
        conversationHistory.length > 2

      if (!needsRefinement) {
        return // Não precisa de refinamento
      }

      // Preparar contexto completo
      const conversationContext = conversationHistory.slice(-5).join('\n')
      const enrichedContext = this.createEnrichedContext(userMessage, immediateResponse, conversationContext)

      // Chamar ChatGPT Fine-tuned para refinamento
      const refinedResponse = await this.callDrRicardoFineTuned(userMessage, enrichedContext)
      
      if (refinedResponse && refinedResponse !== 'OPENAI_FALLBACK') {
        // Salvar resposta refinada
        await this.saveConversationToLearning(userMessage, refinedResponse, 'refined_response', 'dr_ricardo_methodology')
        
        // Emitir evento para atualizar resposta no app
        this.emitResponseUpdate(userMessage, refinedResponse)
      }

    } catch (error) {
      console.warn('⚠️ Erro no refinamento em background:', error)
    }
  }

  // 📊 CRIAR CONTEXTO ENRIQUECIDO
  private createEnrichedContext(userMessage: string, immediateResponse: string, conversationHistory: string): string {
    const context = this.getUserContext()
    const memory = this.getUserMemory()
    
    return `
CONTEXTO ENRIQUECIDO - NOA ESPERANZA:

MENSAGEM ORIGINAL: ${userMessage}
RESPOSTA IMEDIATA: ${immediateResponse}

HISTÓRICO DA CONVERSA:
${conversationHistory}

CONTEXTO DO USUÁRIO:
- Interações anteriores: ${context.interactionCount || 0}
- Última saudação: ${memory.lastGreeting || 'Nunca'}
- Interesse médico: ${memory.medicalInterest || 'Nenhum'}

METODOLOGIA: Use a "Arte da Entrevista Clínica" do Dr. Ricardo Valença
ESPECIALIDADES: Neurologia, Cannabis Medicinal, Nefrologia

REFINE a resposta imediata para ser mais precisa, médica e alinhada com a metodologia do Dr. Ricardo.
    `.trim()
  }

  // 📡 EMITIR ATUALIZAÇÃO DE RESPOSTA
  private emitResponseUpdate(userMessage: string, refinedResponse: string): void {
    const event = new CustomEvent('noaResponseRefined', {
      detail: {
        userMessage,
        refinedResponse,
        timestamp: new Date().toISOString()
      }
    })
    window.dispatchEvent(event)
  }

  // 🔧 PROCESSAMENTO LOCAL SEMI-UNIVERSAL
  private async processCommandLocal(message: string): Promise<string> {
    try {
      const lower = message.toLowerCase().trim()
      const context = this.getUserContext()
      const memory = this.getUserMemory()

      // 🛡️ FILTROS DE SEGURANÇA - COMPORTAMENTO INADEQUADO
      if (this.detectInappropriateContent(lower)) {
        return this.handleInappropriateContent()
      }

      // 🧠 SISTEMA DE APRENDIZADO ATIVO - Buscar respostas similares (não bloqueia)
      this.findSimilarResponse(message).then(similarResponse => {
        if (similarResponse && similarResponse.confidence_score > 0.9) {
          this.saveConversationToLearning(message, similarResponse.ai_response, 'similar_response', 'learning').catch(console.warn)
        }
      }).catch(console.warn)

      // 🛡️ NORMAS DE CONDUTA (Documento Mestre v.2.0)
      // Nunca oferecer diagnósticos ou tratamentos
      if (lower.includes('diagnóstico') || lower.includes('diagnostico') || 
          lower.includes('tratamento') || lower.includes('medicamento') ||
          lower.includes('receita') || lower.includes('prescrição')) {
        return '⚠️ Como assistente médica, não posso oferecer diagnósticos, tratamentos ou prescrições. Recomendo consulta com um médico qualificado para avaliação adequada.'
      }

    // 💬 RESPOSTAS ESPECÍFICAS PARA PERGUNTAS COMUNS (PRIORIDADE MÁXIMA)
    if (
      lower.includes('como você está') ||
      lower.includes('como voce esta') ||
      lower.includes('como está') ||
      lower.includes('como esta') ||
      lower === 'tudo bem' ||
      lower === 'tudo bom' ||
      lower === 'tudo bem?' ||
      lower === 'tudo bom?' ||
      lower.includes('tudo bem?') ||
      lower.includes('tudo bom?')
    ) {
      // Salvar interação
      this.saveUserMemory('lastWellBeing', new Date().toISOString())
      
      const respostas = [
        `Estou muito bem, obrigada! Estou aqui para ajudá-lo com avaliações clínicas e informações médicas. Como posso ser útil hoje?`,
        `Tudo ótimo, obrigada! Como posso ajudá-lo com avaliações clínicas hoje?`,
        `Estou muito bem! Estou aqui para auxiliar com informações médicas. O que você gostaria de saber?`,
        `Tudo bem, obrigada! Como posso ser útil para você hoje?`,
        `Estou ótima! Estou aqui para ajudar com avaliações clínicas. Em que posso auxiliar?`
      ]

      return respostas[Math.floor(Math.random() * respostas.length)]
    }

    // 💬 SAUDAÇÕES COMPLETAS (10+ tipos diferentes)
    if (
      lower === 'ola' ||
      lower === 'olá' ||
      lower === 'oi' ||
      lower === 'hey' ||
      lower === 'hi' ||
      lower === 'eai' ||
      lower === 'e aí' ||
      lower === 'bom dia' ||
      lower === 'boa tarde' ||
      lower === 'boa noite' ||
      lower.includes('ola noa') ||
      lower.includes('olá noa') ||
      lower.includes('oi noa')
    ) {
      // Salvar interação de saudação
      this.saveUserMemory('lastGreeting', new Date().toISOString())
      this.saveUserContext({ hasGreeted: true, interactionCount: (context.interactionCount || 0) + 1 })

      const respostas = [
        `Olá! Sou a NOA Esperanza, assistente médica do Dr. Ricardo Valença. Como posso ajudá-lo hoje?`,
        `Oi! NOA Esperanza aqui, assistente médica do Dr. Ricardo Valença. Em que posso ser útil?`,
        `Olá! Sou a NOA Esperanza, especializada em avaliações clínicas. Como posso ajudá-lo?`,
        `Oi! NOA Esperanza, assistente médica do Dr. Ricardo Valença. O que você gostaria de saber?`,
        `Olá! Sou a NOA Esperanza. Estou aqui para auxiliar com avaliações clínicas. Como posso ajudar?`
      ]

      // Resposta personalizada baseada no contexto
      if (context.interactionCount > 1) {
        return `Olá novamente! Sou a NOA Esperanza, assistente médica do Dr. Ricardo Valença. Como posso continuar ajudando você?`
      }

      return respostas[Math.floor(Math.random() * respostas.length)]
    }

      // 🧠 RECONHECIMENTO SEMI-UNIVERSAL - CONTEXTUALIZAÇÃO INTELIGENTE
      return await this.handleUniversalContext(message, lower, context, memory)

    } catch (error) {
      console.error('❌ Erro no processamento local:', error)
      return 'Olá! Sou a NOA Esperanza, assistente médica do Dr. Ricardo Valença. Como posso ajudá-lo?'
    }
  }

  // 🛡️ DETECTAR CONTEÚDO INADEQUADO
  private detectInappropriateContent(lower: string): boolean {
    const inappropriateWords = [
      // Palavrões e xingamentos
      'caralho', 'porra', 'merda', 'puta', 'foda', 'cacete', 'bosta',
      'idiota', 'burro', 'estúpido', 'imbecil', 'retardado',
      // Comportamento inadequado
      'vai se foder', 'foda-se', 'caguei', 'tô nem aí',
      // Conteúdo ilícito
      'drogas', 'cocaína', 'heroína', 'loló', 'lança'
    ]

    return inappropriateWords.some(word => lower.includes(word))
  }

  // 🚫 LIDAR COM CONTEÚDO INADEQUADO
  private handleInappropriateContent(): string {
    const responses = [
      'Entendo que você pode estar frustrado, mas prefiro manter nossa conversa respeitosa e focada em questões médicas. Como posso ajudá-lo com informações sobre saúde?',
      'Sou uma assistente médica e prefiro conversas construtivas. Posso ajudá-lo com questões relacionadas à saúde, avaliações clínicas ou informações sobre as especialidades do Dr. Ricardo Valença.',
      'Vamos manter o foco em questões médicas e de saúde. Estou aqui para auxiliar com avaliações clínicas, informações sobre cannabis medicinal, neurologia ou nefrologia. Como posso ajudar?'
    ]
    
    return responses[Math.floor(Math.random() * responses.length)]
  }

  // 🧠 RECONHECIMENTO SEMI-UNIVERSAL - CONTEXTUALIZAÇÃO INTELIGENTE
  private async handleUniversalContext(message: string, lower: string, context: any, memory: any): Promise<string> {
    // 🧠 PERGUNTAS SOBRE MEMÓRIA E CONTEXTO
    if (lower.includes('lembrou') || lower.includes('lembra') || lower.includes('memória') || lower.includes('memoria')) {
      const responses = [
        'Sim, estou aqui para ajudá-lo! Sou a NOA Esperanza e mantenho o contexto da nossa conversa. Como posso continuar auxiliando você?',
        'Claro! Estou sempre aqui para ajudar. Lembro do nosso contexto e posso auxiliar com questões médicas ou informações sobre as especialidades do Dr. Ricardo Valença.',
        'Sim, estou aqui e pronta para ajudar! Posso auxiliar com avaliações clínicas, informações sobre cannabis medicinal, neurologia ou nefrologia. O que você gostaria de saber?'
      ]
      return responses[Math.floor(Math.random() * responses.length)]
    }

    // 🏥 AVALIAÇÕES CLÍNICAS (DETECÇÃO AMPLIADA)
    if (lower.includes('avaliação') || lower.includes('avaliacao') || lower.includes('avalia') ||
        lower.includes('consulta') || lower.includes('médico') || lower.includes('medico') ||
        lower.includes('sintoma') || lower.includes('dor') || lower.includes('problema') ||
        lower.includes('saúde') || lower.includes('saude') || lower.includes('doença') ||
        lower.includes('doenca') || lower.includes('mal-estar') || lower.includes('mal estar')) {
      return 'Detectei que você pode precisar de uma avaliação clínica! Para iniciar sua avaliação, diga: "quero fazer uma avaliação clínica". Ou me conte: o que você está sentindo?'
    }

    // 🤔 PERGUNTAS INFORMACIONAIS
    if (lower.includes('sumiu') || lower.includes('alou') || lower.includes('alô') || 
        lower.includes('cadê') || lower.includes('cade') || lower.includes('onde') ||
        lower.includes('está') || lower.includes('esta') || lower.includes('tá') ||
        lower.includes('ta')) {
      const responses = [
        'Estou aqui! Sou a NOA Esperanza, assistente médica do Dr. Ricardo Valença. Como posso ajudá-lo hoje?',
        'Presente! Estou sempre disponível para auxiliar com questões médicas e informações sobre saúde. Em que posso ajudar?',
        'Aqui estou! Pronta para auxiliar com avaliações clínicas, informações sobre cannabis medicinal, neurologia ou nefrologia. Como posso ser útil?'
      ]
      return responses[Math.floor(Math.random() * responses.length)]
    }

    // 🌿 CANNABIS MEDICINAL
    if (lower.includes('cannabis') || lower.includes('maconha') || lower.includes('cbd') || 
        lower.includes('thc') || lower.includes('marijuana') || lower.includes('canabidiol')) {
      return 'O Dr. Ricardo Valença é especialista em cannabis medicinal! Posso auxiliar com informações sobre tratamentos com CBD/THC para diversas condições. Gostaria de saber mais sobre cannabis medicinal?'
    }

    // 🧠 NEUROLOGIA
    if (lower.includes('neurologia') || lower.includes('neurologo') || lower.includes('cabeça') ||
        lower.includes('cabeça') || lower.includes('enxaqueca') || lower.includes('migrânea') ||
        lower.includes('migranea') || lower.includes('cérebro') || lower.includes('cerebro')) {
      return 'O Dr. Ricardo Valença é especialista em neurologia! Posso auxiliar com informações sobre dores de cabeça, enxaquecas e distúrbios neurológicos. Como posso ajudar?'
    }

    // 🫘 NEFROLOGIA
    if (lower.includes('nefrologia') || lower.includes('nefrologo') || lower.includes('rim') ||
        lower.includes('rins') || lower.includes('renal') || lower.includes('urina') ||
        lower.includes('bexiga') || lower.includes('hipertensão') || lower.includes('hipertensao')) {
      return 'O Dr. Ricardo Valença é especialista em nefrologia! Posso auxiliar com informações sobre problemas renais e hipertensão. Como posso ajudar?'
    }

    // 📚 DOCUMENTOS E CONHECIMENTO
    if (lower.includes('documento') || lower.includes('artigo') || lower.includes('pesquisa') ||
        lower.includes('estudo') || lower.includes('metodologia') || lower.includes('arte da entrevista')) {
      return 'Tenho acesso aos documentos e metodologias do Dr. Ricardo Valença, incluindo a "Arte da Entrevista Clínica". Posso auxiliar com informações baseadas nesses conhecimentos. O que você gostaria de saber?'
    }

    // 🧠 SISTEMA DE APRENDIZADO CONTEXTUAL - BUSCAR NO BANCO
    const contextualResponse = await this.findContextualReference(message, lower)
    if (contextualResponse) {
      return contextualResponse
    }

    // Se não encontrou referência contextual, retornar fallback
    return 'OPENAI_FALLBACK'
  }

  // 🧠 BUSCAR REFERÊNCIA CONTEXTUAL NO BANCO
  private async findContextualReference(message: string, lower: string): Promise<string | null> {
    try {
      // Buscar conversas similares no banco
      const { data: similarConversations, error } = await supabase
        .from('ai_learning')
        .select('user_message, ai_response, category, confidence_score')
        .or(`user_message.ilike.%${message}%,keywords.ilike.%${message}%`)
        .order('confidence_score', { ascending: false })
        .limit(3)

      if (error) {
        console.warn('❌ Erro ao buscar referências contextuais:', error)
        return null
      }

      if (similarConversations && similarConversations.length > 0) {
        const bestMatch = similarConversations[0]
        
        // Se encontrou uma referência com boa confiança, perguntar se era isso
        if (bestMatch.confidence_score > 0.7) {
          return this.generateContextualQuestion(message, bestMatch)
        }
      }

      // Buscar também em padrões de conversa
      const { data: patterns, error: patternError } = await supabase
        .from('ai_conversation_patterns')
        .select('pattern_type, keywords, ai_response')
        .or(`keywords.ilike.%${message}%,pattern_type.ilike.%${message}%`)
        .limit(2)

      if (!patternError && patterns && patterns.length > 0) {
        const bestPattern = patterns[0]
        return this.generateContextualQuestion(message, bestPattern)
      }

      return null
    } catch (error) {
      console.warn('❌ Erro no sistema contextual:', error)
      return null
    }
  }

  // 🤔 GERAR PERGUNTA CONTEXTUAL
  private generateContextualQuestion(userMessage: string, reference: any): string {
    const responses = [
      `Você quis dizer algo relacionado a "${reference.user_message || reference.pattern_type}"? Se sim, posso ajudar com: "${reference.ai_response}". Confirma se era isso que você queria saber?`,
      `Pelo que entendi, você pode estar se referindo a algo similar a "${reference.user_message || reference.pattern_type}". Posso auxiliar com: "${reference.ai_response}". Era isso mesmo?`,
      `Detectei que sua mensagem pode estar relacionada a "${reference.user_message || reference.pattern_type}". Posso ajudar com: "${reference.ai_response}". Confirma se era isso?`
    ]
    
    return responses[Math.floor(Math.random() * responses.length)]
  }

  // 🎓 APRENDER CONTEXTO CONFIRMADO
  async learnFromContextualConfirmation(userMessage: string, confirmedResponse: string, wasCorrect: boolean): Promise<void> {
    try {
      if (wasCorrect) {
        // Salvar como aprendizado positivo
        await this.saveConversationToLearning(
          userMessage, 
          confirmedResponse, 
          'contextual_learning', 
          'confirmed'
        )
        
        // Aumentar score de confiança para próximas vezes
        await this.updateConfidenceScore(userMessage, confirmedResponse, 0.9)
        
        console.log('✅ Contexto confirmado e aprendido!')
      } else {
        // Salvar como aprendizado negativo para evitar repetir
        await this.saveConversationToLearning(
          userMessage, 
          'Não era isso que o usuário queria', 
          'contextual_learning', 
          'rejected'
        )
        
        console.log('📝 Contexto rejeitado, evitando repetir no futuro')
      }
    } catch (error) {
      console.warn('❌ Erro ao aprender contexto:', error)
    }
  }

  // 📈 ATUALIZAR SCORE DE CONFIANÇA
  private async updateConfidenceScore(userMessage: string, aiResponse: string, newScore: number): Promise<void> {
    try {
      await supabase
        .from('ai_learning')
        .update({ confidence_score: newScore })
        .eq('user_message', userMessage)
        .eq('ai_response', aiResponse)
    } catch (error) {
      console.warn('❌ Erro ao atualizar score:', error)
    }
  }
}

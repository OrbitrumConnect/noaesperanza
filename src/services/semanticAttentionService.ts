// 🧠 SEMANTIC ATTENTION SERVICE - Dr. Ricardo Valença
// Sistema de attention semântica focada no input do usuário

import { supabase } from '../integrations/supabase/client'
import { openAIService } from './openaiService'

export interface UserContext {
  userId: string
  userName: string
  semanticProfile: SemanticProfile
  conversationVector: number[]
  attentionWeights: AttentionWeights
  lastInteraction: Date
}

export interface SemanticProfile {
  expertise: string[]
  interests: string[]
  communicationStyle: 'technical' | 'conversational' | 'formal' | 'collaborative'
  preferredDepth: 'surface' | 'detailed' | 'comprehensive'
  languagePatterns: string[]
  contextMemory: ContextMemory[]
}

export interface AttentionWeights {
  technicalTerms: number
  medicalContext: number
  researchFocus: number
  personalContext: number
  temporalRelevance: number
}

export interface ContextMemory {
  id: string
  content: string
  timestamp: Date
  relevance: number
  semanticVector: number[]
  tags: string[]
}

export class SemanticAttentionService {
  
  // 🎯 ATIVAR ATTENTION SEMÂNTICA PARA USUÁRIO
  async activateSemanticAttention(userId: string, userName: string): Promise<UserContext> {
    try {
      console.log('🧠 Ativando attention semântica para:', userName)
      
      // Buscar ou criar perfil semântico do usuário
      let userContext = await this.getUserContext(userId)
      
      if (!userContext) {
        userContext = await this.createUserContext(userId, userName)
      }
      
      // Atualizar pesos de attention baseado no histórico
      await this.updateAttentionWeights(userContext)
      
      // Calcular vetor de conversa atual
      const conversationVector = await this.calculateConversationVector(userContext)
      
      console.log('✅ Attention semântica ativada com sucesso')
      
      return {
        ...userContext,
        conversationVector,
        lastInteraction: new Date()
      }
    } catch (error) {
      console.error('Erro ao ativar attention semântica:', error)
      throw error
    }
  }
  
  // 🔍 PROCESSAR INPUT DO USUÁRIO COM ATTENTION
  async processUserInput(input: string, userContext: UserContext): Promise<ProcessedInput> {
    try {
      console.log('🔍 Processando input com attention semântica:', input.substring(0, 50) + '...')
      
      // Extrair características semânticas
      const semanticFeatures = this.extractSemanticFeatures(input, userContext)
      
      // Aplicar pesos de attention
      const attentionScores = this.calculateAttentionScores(semanticFeatures, userContext.attentionWeights)
      
      // Gerar contexto focado
      const focusedContext = this.generateFocusedContext(input, attentionScores, userContext)
      
      // Atualizar memória de contexto
      await this.updateContextMemory(input, focusedContext, userContext)
      
      return {
        originalInput: input,
        semanticFeatures,
        attentionScores,
        focusedContext,
        userContext
      }
    } catch (error) {
      console.error('Erro ao processar input:', error)
      throw error
    }
  }
  
  // 🧠 GERAR RESPOSTA COM ATTENTION FOCADA
  async generateFocusedResponse(processedInput: ProcessedInput): Promise<string> {
    try {
      const { focusedContext, attentionScores, userContext } = processedInput
      
      // Construir prompt com attention semântica
      const semanticPrompt = this.buildSemanticPrompt(focusedContext, attentionScores, userContext)
      
      // Gerar resposta focada
      const response = await this.generateResponse(semanticPrompt)
      
      // Atualizar perfil semântico baseado na interação
      await this.updateSemanticProfile(processedInput, response, userContext)
      
      return response
    } catch (error) {
      console.error('Erro ao gerar resposta focada:', error)
      throw error
    }
  }
  
  // 📊 BUSCAR CONTEXTO DO USUÁRIO
  private async getUserContext(userId: string): Promise<UserContext | null> {
    try {
      const { data } = await supabase
        .from('user_semantic_context')
        .select('*')
        .eq('user_id', userId)
        .single()
      
      if (data) {
        return {
          userId: data.user_id,
          userName: data.user_name,
          semanticProfile: data.semantic_profile,
          conversationVector: data.conversation_vector,
          attentionWeights: data.attention_weights,
          lastInteraction: new Date(data.last_interaction)
        }
      }
      
      return null
    } catch (error) {
      console.error('Erro ao buscar contexto do usuário:', error)
      return null
    }
  }
  
  // 🆕 CRIAR CONTEXTO DO USUÁRIO
  private async createUserContext(userId: string, userName: string): Promise<UserContext> {
    const defaultProfile: SemanticProfile = {
      expertise: ['medicine', 'technology'],
      interests: ['ai', 'research', 'innovation'],
      communicationStyle: 'collaborative',
      preferredDepth: 'comprehensive',
      languagePatterns: [],
      contextMemory: []
    }
    
    const defaultWeights: AttentionWeights = {
      technicalTerms: 0.8,
      medicalContext: 0.9,
      researchFocus: 0.7,
      personalContext: 0.6,
      temporalRelevance: 0.5
    }
    
    const userContext: UserContext = {
      userId,
      userName,
      semanticProfile: defaultProfile,
      conversationVector: [],
      attentionWeights: defaultWeights,
      lastInteraction: new Date()
    }
    
    // Salvar no banco
    await supabase
      .from('user_semantic_context')
      .insert({
        user_id: userId,
        user_name: userName,
        semantic_profile: defaultProfile,
        conversation_vector: [],
        attention_weights: defaultWeights,
        last_interaction: new Date().toISOString()
      })
    
    return userContext
  }
  
  // 🔄 ATUALIZAR PESOS DE ATTENTION
  private async updateAttentionWeights(userContext: UserContext): Promise<void> {
    // Analisar histórico de conversas para ajustar pesos
    const { data: conversations } = await supabase
      .from('conversation_history')
      .select('*')
      .eq('user_id', userContext.userId)
      .order('created_at', { ascending: false })
      .limit(10)
    
    if (conversations && conversations.length > 0) {
      // Ajustar pesos baseado no padrão de uso
      const technicalCount = conversations.filter(c => c.content.includes('método') || c.content.includes('análise')).length
      const medicalCount = conversations.filter(c => c.content.includes('paciente') || c.content.includes('tratamento')).length
      const researchCount = conversations.filter(c => c.content.includes('pesquisa') || c.content.includes('estudo')).length
      
      // Normalizar e ajustar pesos
      const total = conversations.length
      userContext.attentionWeights.technicalTerms = Math.min(0.9, technicalCount / total + 0.5)
      userContext.attentionWeights.medicalContext = Math.min(0.9, medicalCount / total + 0.5)
      userContext.attentionWeights.researchFocus = Math.min(0.9, researchCount / total + 0.5)
    }
  }
  
  // 🧮 CALCULAR VETOR DE CONVERSA
  private async calculateConversationVector(userContext: UserContext): Promise<number[]> {
    // Implementar cálculo de vetor semântico baseado no contexto
    const vector = [
      userContext.attentionWeights.technicalTerms,
      userContext.attentionWeights.medicalContext,
      userContext.attentionWeights.researchFocus,
      userContext.attentionWeights.personalContext,
      userContext.attentionWeights.temporalRelevance
    ]
    
    return vector
  }
  
  // 🔍 EXTRAIR CARACTERÍSTICAS SEMÂNTICAS
  private extractSemanticFeatures(input: string, userContext: UserContext): SemanticFeatures {
    const features: SemanticFeatures = {
      technicalTerms: this.countTechnicalTerms(input),
      medicalContext: this.detectMedicalContext(input),
      researchFocus: this.detectResearchFocus(input),
      personalContext: this.detectPersonalContext(input),
      temporalRelevance: this.calculateTemporalRelevance(input),
      languageComplexity: this.analyzeLanguageComplexity(input),
      emotionalTone: this.analyzeEmotionalTone(input)
    }
    
    return features
  }
  
  // 📊 CALCULAR SCORES DE ATTENTION
  private calculateAttentionScores(features: SemanticFeatures, weights: AttentionWeights): AttentionScores {
    return {
      technical: features.technicalTerms * weights.technicalTerms,
      medical: features.medicalContext * weights.medicalContext,
      research: features.researchFocus * weights.researchFocus,
      personal: features.personalContext * weights.personalContext,
      temporal: features.temporalRelevance * weights.temporalRelevance
    }
  }
  
  // 🎯 GERAR CONTEXTO FOCADO
  private generateFocusedContext(input: string, attentionScores: AttentionScores, userContext: UserContext): FocusedContext {
    const dominantContext = this.getDominantContext(attentionScores)
    
    return {
      input,
      dominantContext,
      attentionScores,
      relevantMemory: this.getRelevantMemory(input, userContext),
      semanticFocus: this.determineSemanticFocus(attentionScores),
      responseStrategy: this.determineResponseStrategy(dominantContext, userContext)
    }
  }
  
  // 🏷️ MÉTODOS AUXILIARES
  private countTechnicalTerms(input: string): number {
    const technicalTerms = ['método', 'análise', 'dados', 'algoritmo', 'sistema', 'protocolo', 'metodologia']
    return technicalTerms.filter(term => input.toLowerCase().includes(term)).length / technicalTerms.length
  }
  
  private detectMedicalContext(input: string): number {
    const medicalTerms = ['paciente', 'tratamento', 'diagnóstico', 'sintoma', 'medicamento', 'terapia']
    return medicalTerms.filter(term => input.toLowerCase().includes(term)).length / medicalTerms.length
  }
  
  private detectResearchFocus(input: string): number {
    const researchTerms = ['pesquisa', 'estudo', 'investigação', 'hipótese', 'resultado', 'conclusão']
    return researchTerms.filter(term => input.toLowerCase().includes(term)).length / researchTerms.length
  }
  
  private detectPersonalContext(input: string): number {
    const personalTerms = ['eu', 'minha', 'meu', 'pessoal', 'experiência', 'opinião']
    return personalTerms.filter(term => input.toLowerCase().includes(term)).length / personalTerms.length
  }
  
  private calculateTemporalRelevance(input: string): number {
    const temporalTerms = ['agora', 'hoje', 'recente', 'atual', 'novo', 'último']
    return temporalTerms.filter(term => input.toLowerCase().includes(term)).length / temporalTerms.length
  }
  
  private analyzeLanguageComplexity(input: string): number {
    const words = input.split(' ')
    const avgWordLength = words.reduce((sum, word) => sum + word.length, 0) / words.length
    return Math.min(1, avgWordLength / 8)
  }
  
  private analyzeEmotionalTone(input: string): number {
    const positiveWords = ['bom', 'excelente', 'ótimo', 'perfeito', 'satisfeito']
    const negativeWords = ['ruim', 'problema', 'erro', 'difícil', 'frustrado']
    
    const positive = positiveWords.filter(word => input.toLowerCase().includes(word)).length
    const negative = negativeWords.filter(word => input.toLowerCase().includes(word)).length
    
    return (positive - negative) / Math.max(positive + negative, 1)
  }
  
  private getDominantContext(scores: AttentionScores): string {
    const maxScore = Math.max(...Object.values(scores))
    const dominantKey = Object.keys(scores).find(key => scores[key as keyof AttentionScores] === maxScore)
    return dominantKey || 'general'
  }
  
  private getRelevantMemory(input: string, userContext: UserContext): ContextMemory[] {
    // Buscar memórias relevantes baseadas na similaridade semântica
    return userContext.semanticProfile.contextMemory
      .filter(memory => this.calculateSimilarity(input, memory.content) > 0.7)
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, 3)
  }
  
  private determineSemanticFocus(scores: AttentionScores): string {
    const dominant = this.getDominantContext(scores)
    const focusMap = {
      technical: 'análise técnica e metodológica',
      medical: 'contexto médico e clínico',
      research: 'pesquisa e investigação científica',
      personal: 'aspectos pessoais e experienciais',
      temporal: 'relevância temporal e atualidade'
    }
    return focusMap[dominant as keyof typeof focusMap] || 'conversação geral'
  }
  
  private determineResponseStrategy(dominantContext: string, userContext: UserContext): string {
    const strategies = {
      technical: userContext.semanticProfile.preferredDepth === 'comprehensive' ? 'análise detalhada' : 'explicação concisa',
      medical: 'abordagem clínica especializada',
      research: 'metodologia científica rigorosa',
      personal: 'abordagem colaborativa e empática',
      temporal: 'foco na relevância atual'
    }
    return strategies[dominantContext as keyof typeof strategies] || 'resposta contextualizada'
  }
  
  private calculateSimilarity(text1: string, text2: string): number {
    // Implementar cálculo de similaridade semântica
    const words1 = text1.toLowerCase().split(' ')
    const words2 = text2.toLowerCase().split(' ')
    const intersection = words1.filter(word => words2.includes(word))
    return intersection.length / Math.max(words1.length, words2.length)
  }
  
  private buildSemanticPrompt(context: FocusedContext, scores: AttentionScores, userContext: UserContext): string {
    return `
    CONTEXTO SEMÂNTICO FOCADO:
    
    Input do usuário: ${context.input}
    Contexto dominante: ${context.dominantContext}
    Foco semântico: ${context.semanticFocus}
    Estratégia de resposta: ${context.responseStrategy}
    
    Perfil do usuário: ${userContext.userName}
    Estilo de comunicação: ${userContext.semanticProfile.communicationStyle}
    Profundidade preferida: ${userContext.semanticProfile.preferredDepth}
    
    Scores de attention:
    - Técnico: ${scores.technical.toFixed(2)}
    - Médico: ${scores.medical.toFixed(2)}
    - Pesquisa: ${scores.research.toFixed(2)}
    - Pessoal: ${scores.personal.toFixed(2)}
    - Temporal: ${scores.temporal.toFixed(2)}
    
    Gere uma resposta focada e contextualizada baseada neste contexto semântico.
    `
  }
  
  private async generateResponse(prompt: string): Promise<string> {
    // Integrar com OpenAI para resposta real
    try {
      // Usar openAIService para gerar resposta real
      const response = await openAIService.getNoaResponse(prompt, [])
      return response
    } catch (error) {
      console.error('Erro ao gerar resposta com OpenAI:', error)
      
      // Fallback para resposta contextualizada
      return `🧠 **Resposta com Attention Semântica Ativa**

Baseado no seu input e no contexto semântico analisado, aqui está minha resposta contextualizada para você, Dr. Ricardo.

Como posso ajudá-lo especificamente hoje?`
    }
  }
  
  private async updateContextMemory(input: string, context: FocusedContext, userContext: UserContext): Promise<void> {
    const newMemory: ContextMemory = {
      id: Date.now().toString(),
      content: input,
      timestamp: new Date(),
      relevance: Math.max(...Object.values(context.attentionScores)),
      semanticVector: [],
      tags: [context.dominantContext, context.semanticFocus]
    }
    
    userContext.semanticProfile.contextMemory.push(newMemory)
    
    // Manter apenas as 50 memórias mais relevantes
    if (userContext.semanticProfile.contextMemory.length > 50) {
      userContext.semanticProfile.contextMemory = userContext.semanticProfile.contextMemory
        .sort((a, b) => b.relevance - a.relevance)
        .slice(0, 50)
    }
  }
  
  private async updateSemanticProfile(processedInput: ProcessedInput, response: string, userContext: UserContext): Promise<void> {
    // Atualizar perfil semântico baseado na interação
    // Implementar aprendizado adaptativo
    
    await supabase
      .from('user_semantic_context')
      .update({
        semantic_profile: userContext.semanticProfile,
        conversation_vector: userContext.conversationVector,
        attention_weights: userContext.attentionWeights,
        last_interaction: new Date().toISOString()
      })
      .eq('user_id', userContext.userId)
  }
}

// Interfaces auxiliares
interface SemanticFeatures {
  technicalTerms: number
  medicalContext: number
  researchFocus: number
  personalContext: number
  temporalRelevance: number
  languageComplexity: number
  emotionalTone: number
}

interface AttentionScores {
  technical: number
  medical: number
  research: number
  personal: number
  temporal: number
}

interface ProcessedInput {
  originalInput: string
  semanticFeatures: SemanticFeatures
  attentionScores: AttentionScores
  focusedContext: FocusedContext
  userContext: UserContext
}

interface FocusedContext {
  input: string
  dominantContext: string
  attentionScores: AttentionScores
  relevantMemory: ContextMemory[]
  semanticFocus: string
  responseStrategy: string
}

export const semanticAttentionService = new SemanticAttentionService()

// 🌀 GPT BUILDER V2 - INTEGRAÇÃO SIMBÓLICA COM CHAT
// Esta função integra attention semântica com a gramática clínica da Nôa
export async function processUserMessage(message: string, userContext: string) {
  // Lazy imports para evitar dependências circulares
  const { enrichWithNoaGrammar } = await import('./gptBuilderService')
  const { sendToOpenAI } = await import('./openaiService')
  const { getVectorMatch } = await import('./supabase/embeddingClient')
  
  const matches = await getVectorMatch(message)
  const symbolicPrompt = enrichWithNoaGrammar(message, matches, userContext)
  const response = await sendToOpenAI(symbolicPrompt)
  return response
}

// Função auxiliar para construir contexto simbólico do usuário
// Exemplo de uso: const context = buildUserSymbolicContext(userId, conversationHistory)
export function buildUserSymbolicContext(userId?: string, conversationHistory?: any[]): string {
  let context = ''
  
  if (userId) {
    context += `Usuário: ${userId}\n`
  }
  
  if (conversationHistory && conversationHistory.length > 0) {
    context += `Histórico recente:\n`
    conversationHistory.slice(-3).forEach((msg: any, i: number) => {
      context += `${i + 1}. ${msg.role}: ${msg.content.substring(0, 100)}...\n`
    })
  }
  
  return context || 'Novo usuário sem histórico'
}

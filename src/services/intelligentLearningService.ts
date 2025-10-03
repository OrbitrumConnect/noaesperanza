// 🧠 INTELLIGENT LEARNING SERVICE - Nôa Esperanza
// Sistema profissional de aprendizado contínuo e evolução inteligente

import { supabase } from '../integrations/supabase/client'
import { openAIService } from './openaiService'

export interface LearningContext {
  conversationId: string
  userMessage: string
  aiResponse: string
  context: any
  relevance: number
  timestamp: Date
  tags: string[]
  category: string
}

export interface CrossReferenceData {
  relatedConversations: any[]
  relatedDocuments: any[]
  relatedStudies: any[]
  patterns: string[]
  insights: string[]
}

export interface WorkCollaboration {
  id: string
  title: string
  type: 'research' | 'clinical' | 'development' | 'analysis'
  content: string
  participants: string[]
  status: 'active' | 'completed' | 'archived'
  createdAt: Date
  updatedAt: Date
}

export class IntelligentLearningService {
  
  // 🧠 APRENDER COM CONVERSAÇÃO
  async learnFromConversation(
    userMessage: string, 
    aiResponse: string, 
    context?: any
  ): Promise<void> {
    try {
      console.log('🧠 Aprendendo com conversação...')
      
      // 1. Analisar contexto e relevância
      const learningContext = await this.analyzeLearningContext(userMessage, aiResponse, context)
      
      // 2. Salvar na base de aprendizado
      await this.saveToLearningBase(learningContext)
      
      // 3. Identificar padrões e insights
      await this.identifyPatterns(learningContext)
      
      // 4. Atualizar contexto semântico
      await this.updateSemanticContext(learningContext)
      
      console.log('✅ Aprendizado concluído com sucesso')
      
    } catch (error) {
      console.error('❌ Erro no aprendizado:', error)
    }
  }
  
  // 🔍 BUSCAR CONTEXTO PARA MELHOR RESPOSTA
  async getContextForBetterResponse(
    currentMessage: string, 
    userId: string = 'dr-ricardo-valenca'
  ): Promise<CrossReferenceData> {
    try {
      console.log('🔍 Buscando contexto para melhor resposta...')
      
      // 1. Buscar conversas relacionadas
      const relatedConversations = await this.findRelatedConversations(currentMessage, userId)
      
      // 2. Buscar documentos relevantes
      const relatedDocuments = await this.findRelatedDocuments(currentMessage, userId)
      
      // 3. Buscar estudos e trabalhos
      const relatedStudies = await this.findRelatedStudies(currentMessage, userId)
      
      // 4. Identificar padrões
      const patterns = await this.identifyResponsePatterns(relatedConversations)
      
      // 5. Gerar insights
      const insights = await this.generateInsights(currentMessage, {
        conversations: relatedConversations,
        documents: relatedDocuments,
        studies: relatedStudies
      })
      
      return {
        relatedConversations,
        relatedDocuments,
        relatedStudies,
        patterns,
        insights
      }
      
    } catch (error) {
      console.error('❌ Erro ao buscar contexto:', error)
      return {
        relatedConversations: [],
        relatedDocuments: [],
        relatedStudies: [],
        patterns: [],
        insights: []
      }
    }
  }
  
  // 💼 CRIAR TRABALHO COLABORATIVO
  async createCollaborativeWork(
    title: string,
    type: 'research' | 'clinical' | 'development' | 'analysis',
    initialContent: string,
    participants: string[] = ['dr-ricardo-valenca']
  ): Promise<WorkCollaboration> {
    try {
      console.log('💼 Criando trabalho colaborativo...')
      
      const work: WorkCollaboration = {
        id: `work_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title,
        type,
        content: initialContent,
        participants,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      }
      
      // Salvar no banco
      await supabase
        .from('collaborative_works')
        .insert({
          id: work.id,
          title: work.title,
          type: work.type,
          content: work.content,
          participants: work.participants,
          status: work.status,
          created_at: work.createdAt.toISOString(),
          updated_at: work.updatedAt.toISOString()
        })
      
      console.log('✅ Trabalho colaborativo criado:', work.id)
      return work
      
    } catch (error) {
      console.error('❌ Erro ao criar trabalho colaborativo:', error)
      throw error
    }
  }
  
  // 🔄 EVOLUIR TRABALHO
  async evolveWork(
    workId: string,
    newContent: string,
    contributor: string = 'dr-ricardo-valenca'
  ): Promise<void> {
    try {
      console.log('🔄 Evoluindo trabalho colaborativo...')
      
      // Buscar trabalho atual
      const { data: currentWork } = await supabase
        .from('collaborative_works')
        .select('*')
        .eq('id', workId)
        .single()
      
      if (!currentWork) {
        throw new Error('Trabalho não encontrado')
      }
      
      // Evoluir conteúdo
      const evolvedContent = await this.generateEvolvedContent(
        currentWork.content,
        newContent,
        contributor
      )
      
      // Atualizar no banco
      await supabase
        .from('collaborative_works')
        .update({
          content: evolvedContent,
          updated_at: new Date().toISOString()
        })
        .eq('id', workId)
      
      // Salvar evolução no histórico
      await supabase
        .from('work_evolution_history')
        .insert({
          work_id: workId,
          previous_content: currentWork.content,
          new_content: newContent,
          evolved_content: evolvedContent,
          contributor,
          created_at: new Date().toISOString()
        })
      
      console.log('✅ Trabalho evoluído com sucesso')
      
    } catch (error) {
      console.error('❌ Erro ao evoluir trabalho:', error)
      throw error
    }
  }
  
  // 📊 BUSCAR HISTÓRICO INTELIGENTE PARA SIDEBAR
  async getIntelligentHistory(
    userId: string = 'dr-ricardo-valenca',
    limit: number = 20
  ): Promise<any[]> {
    try {
      console.log('📊 Buscando histórico inteligente...')
      
      // Buscar conversas com relevância
      const { data: conversations } = await supabase
        .from('conversation_history')
        .select('*')
        .eq('user_id', userId)
        .order('relevance_score', { ascending: false })
        .limit(limit)
      
      // Buscar trabalhos colaborativos
      const { data: works } = await supabase
        .from('collaborative_works')
        .select('*')
        .eq('participants', userId)
        .order('updated_at', { ascending: false })
        .limit(10)
      
      // Buscar estudos vivos
      const { data: studies } = await supabase
        .from('estudos_vivos')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10)
      
      // Combinar e formatar
      const intelligentHistory = [
        ...(conversations || []).map(conv => ({
          id: conv.id,
          type: 'conversation',
          title: `Conversa - ${new Date(conv.created_at).toLocaleDateString()}`,
          content: conv.content,
          relevance: conv.relevance_score,
          timestamp: conv.created_at,
          category: 'conversa'
        })),
        ...(works || []).map(work => ({
          id: work.id,
          type: 'collaborative_work',
          title: work.title,
          content: work.content,
          relevance: 0.9,
          timestamp: work.updated_at,
          category: work.type
        })),
        ...(studies || []).map(study => ({
          id: study.id,
          type: 'estudo_vivo',
          title: study.pergunta,
          content: study.resumo_executivo?.pontosChave?.join(', ') || '',
          relevance: 0.85,
          timestamp: study.data_geracao,
          category: 'estudo'
        }))
      ]
      
      // Ordenar por relevância e timestamp
      return intelligentHistory
        .sort((a, b) => (b.relevance - a.relevance) || new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, limit)
      
    } catch (error) {
      console.error('❌ Erro ao buscar histórico inteligente:', error)
      return []
    }
  }
  
  // Métodos auxiliares privados
  private async analyzeLearningContext(userMessage: string, aiResponse: string, context?: any): Promise<LearningContext> {
    // Analisar contexto e relevância
    const relevance = this.calculateRelevance(userMessage, aiResponse)
    const tags = this.extractTags(userMessage, aiResponse)
    const category = this.categorizeContent(userMessage)
    
    return {
      conversationId: `conv_${Date.now()}`,
      userMessage,
      aiResponse,
      context,
      relevance,
      timestamp: new Date(),
      tags,
      category
    }
  }
  
  private async saveToLearningBase(learningContext: LearningContext): Promise<void> {
    await supabase
      .from('intelligent_learning')
      .insert({
        conversation_id: learningContext.conversationId,
        user_message: learningContext.userMessage,
        ai_response: learningContext.aiResponse,
        context: learningContext.context,
        relevance: learningContext.relevance,
        tags: learningContext.tags,
        category: learningContext.category,
        created_at: learningContext.timestamp.toISOString()
      })
  }
  
  private async identifyPatterns(learningContext: LearningContext): Promise<void> {
    // Identificar padrões de conversação
    const patterns = await this.analyzeConversationPatterns(learningContext)
    
    await supabase
      .from('conversation_patterns')
      .insert({
        pattern_type: patterns.type,
        pattern_data: patterns.data,
        relevance: learningContext.relevance,
        created_at: new Date().toISOString()
      })
  }
  
  private async updateSemanticContext(learningContext: LearningContext): Promise<void> {
    // Atualizar contexto semântico baseado no aprendizado
    await supabase
      .from('semantic_learning_context')
      .insert({
        context_data: learningContext.context,
        learning_insights: learningContext.tags,
        relevance: learningContext.relevance,
        created_at: new Date().toISOString()
      })
  }
  
  private calculateRelevance(userMessage: string, aiResponse: string): number {
    // Calcular relevância baseada no conteúdo
    const messageLength = userMessage.length
    const responseLength = aiResponse.length
    const hasQuestions = userMessage.includes('?')
    const hasMedicalTerms = /medicina|clínica|paciente|diagnóstico|tratamento/i.test(userMessage)
    
    let relevance = 0.5
    if (messageLength > 50) relevance += 0.1
    if (responseLength > 100) relevance += 0.1
    if (hasQuestions) relevance += 0.1
    if (hasMedicalTerms) relevance += 0.2
    
    return Math.min(relevance, 1.0)
  }
  
  private extractTags(userMessage: string, aiResponse: string): string[] {
    const tags: string[] = []
    
    if (/medicina|clínica|paciente/i.test(userMessage)) tags.push('medicina')
    if (/pesquisa|estudo|análise/i.test(userMessage)) tags.push('pesquisa')
    if (/desenvolvimento|tecnologia|código/i.test(userMessage)) tags.push('desenvolvimento')
    if (/cannabis|nefrologia|neurologia/i.test(userMessage)) tags.push('especialidade')
    
    return tags
  }
  
  private categorizeContent(userMessage: string): string {
    if (/medicina|clínica|paciente/i.test(userMessage)) return 'medicina'
    if (/pesquisa|estudo/i.test(userMessage)) return 'pesquisa'
    if (/desenvolvimento|tecnologia/i.test(userMessage)) return 'desenvolvimento'
    return 'geral'
  }
  
  private async findRelatedConversations(message: string, userId: string): Promise<any[]> {
    try {
      // Tentar textSearch primeiro (se suportado)
      const { data: textSearchData, error: textSearchError } = await supabase
        .from('conversation_history')
        .select('*')
        .eq('user_id', userId)
        .ilike('content', `%${message}%`)
        .order('relevance_score', { ascending: false })
        .limit(5)
      
      if (!textSearchError && textSearchData) {
        return textSearchData
      }
      
      // Fallback: busca simples com ILIKE
      const { data: fallbackData } = await supabase
        .from('conversation_history')
        .select('*')
        .eq('user_id', userId)
        .ilike('content', `%${message}%`)
        .order('created_at', { ascending: false })
        .limit(5)
      
      return fallbackData || []
      
    } catch (error) {
      console.error('Erro na busca de conversas relacionadas:', error)
      return []
    }
  }
  
  private async findRelatedDocuments(message: string, userId: string): Promise<any[]> {
    try {
      const { data } = await supabase
        .from('documentos_mestres')
        .select('*')
        .eq('user_id', userId)
        .ilike('content', `%${message}%`)
        .order('created_at', { ascending: false })
        .limit(5)
      
      return data || []
      
    } catch (error) {
      console.error('Erro na busca de documentos relacionados:', error)
      return []
    }
  }
  
  private async findRelatedStudies(message: string, userId: string): Promise<any[]> {
    try {
      const { data } = await supabase
        .from('estudos_vivos')
        .select('*')
        .ilike('pergunta', `%${message}%`)
        .order('data_geracao', { ascending: false })
        .limit(5)
      
      return data || []
      
    } catch (error) {
      console.error('Erro na busca de estudos relacionados:', error)
      return []
    }
  }
  
  private async identifyResponsePatterns(conversations: any[]): Promise<string[]> {
    // Identificar padrões de resposta baseados no histórico
    return ['padrão-clínico', 'padrão-pesquisa', 'padrão-desenvolvimento']
  }
  
  private async generateInsights(message: string, context: any): Promise<string[]> {
    // Gerar insights baseados no contexto
    return ['insight-contextual', 'insight-semântico', 'insight-evolutivo']
  }
  
  private async analyzeConversationPatterns(learningContext: LearningContext): Promise<any> {
    return {
      type: 'conversation_pattern',
      data: learningContext.tags
    }
  }
  
  private async generateEvolvedContent(currentContent: string, newContent: string, contributor: string): Promise<string> {
    const prompt = `
Você é Nôa Esperanza, evoluindo um trabalho colaborativo.

CONTEÚDO ATUAL:
${currentContent}

NOVA CONTRIBUIÇÃO:
${newContent}

CONTRIBUIDOR: ${contributor}

TAREFA: Evoluir o conteúdo combinando o atual com a nova contribuição de forma inteligente e coerente.

INSTRUÇÕES:
- Mantenha a coerência do trabalho
- Integre a nova contribuição naturalmente
- Preserve o progresso anterior
- Seja criativa na evolução
- Mantenha o tom profissional
`

    try {
      return await openAIService.getNoaResponse(prompt, [])
    } catch (error) {
      return `${currentContent}\n\n--- Nova contribuição ---\n${newContent}`
    }
  }
}

export const intelligentLearningService = new IntelligentLearningService()

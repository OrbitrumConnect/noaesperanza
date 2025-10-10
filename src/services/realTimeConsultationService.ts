/**
 * Serviço de Consulta em Tempo Real - Conecta Chat à Base de Conhecimento
 * Permite consultas dinâmicas aos documentos da plataforma Nôa Esperanza
 */

import { gptBuilderService, DocumentMaster } from './gptBuilderService'
import { openAIService } from './openaiService'
import { logger } from '../utils/logger'

export interface ConsultationResult {
  query: string
  documents: DocumentMaster[]
  answer: string
  sources: string[]
  timestamp: Date
  confidence: number
}

export interface ConsultationContext {
  userQuery: string
  userType?: 'admin' | 'clinico' | 'paciente' | 'aluno'
  conversationHistory?: Array<{ role: string; content: string }>
  specialization?: string
}

export class RealTimeConsultationService {
  private consultationHistory: ConsultationResult[] = []

  /**
   * Realizar consulta em tempo real à base de conhecimento
   */
  async consultKnowledgeBase(context: ConsultationContext): Promise<ConsultationResult> {
    try {
      logger.info('🔍 Iniciando consulta à base de conhecimento', { query: context.userQuery })

      // 1. Buscar documentos relevantes
      const relevantDocuments = await this.findRelevantDocuments(context.userQuery)

      // 2. Gerar resposta contextual
      const contextualAnswer = await this.generateContextualAnswer(context, relevantDocuments)

      // 3. Extrair fontes
      const sources = relevantDocuments.map(doc => doc.title)

      // 4. Calcular confiança
      const confidence = this.calculateConfidence(relevantDocuments, contextualAnswer)

      const result: ConsultationResult = {
        query: context.userQuery,
        documents: relevantDocuments,
        answer: contextualAnswer,
        sources,
        timestamp: new Date(),
        confidence,
      }

      // 5. Salvar no histórico
      this.consultationHistory.push(result)

      logger.info('✅ Consulta concluída', {
        documentsFound: relevantDocuments.length,
        confidence,
        sources: sources.length,
      })

      return result
    } catch (error) {
      logger.error('❌ Erro na consulta à base de conhecimento', error)

      return {
        query: context.userQuery,
        documents: [],
        answer:
          'Desculpe, não consegui consultar a base de conhecimento no momento. Por favor, tente novamente.',
        sources: [],
        timestamp: new Date(),
        confidence: 0,
      }
    }
  }

  /**
   * Encontrar documentos relevantes para a consulta
   */
  private async findRelevantDocuments(query: string): Promise<DocumentMaster[]> {
    try {
      // Buscar documentos diretamente relacionados
      const directResults = await gptBuilderService.searchDocuments(query)

      // Buscar por termos-chave específicos
      const keywords = this.extractKeywords(query)
      const keywordResults: DocumentMaster[] = []

      for (const keyword of keywords) {
        const results = await gptBuilderService.searchDocuments(keyword)
        keywordResults.push(
          ...results.filter(doc => !directResults.some(existing => existing.id === doc.id))
        )
      }

      // Buscar documentos por categoria médica
      const medicalCategories = this.getMedicalCategories(query)
      const categoryResults: DocumentMaster[] = []

      for (const category of medicalCategories) {
        const results = await gptBuilderService.searchDocuments(category)
        categoryResults.push(
          ...results.filter(
            doc =>
              !directResults.some(existing => existing.id === doc.id) &&
              !keywordResults.some(existing => existing.id === doc.id)
          )
        )
      }

      // Combinar e ordenar por relevância
      const allResults = [...directResults, ...keywordResults, ...categoryResults]

      // Remover duplicatas e ordenar por relevância
      const uniqueResults = this.removeDuplicates(allResults)
      const rankedResults = this.rankByRelevance(uniqueResults, query)

      return rankedResults.slice(0, 5) // Retornar top 5 documentos mais relevantes
    } catch (error) {
      logger.error('❌ Erro ao buscar documentos relevantes', error)
      return []
    }
  }

  /**
   * Gerar resposta contextual baseada nos documentos encontrados
   */
  private async generateContextualAnswer(
    context: ConsultationContext,
    documents: DocumentMaster[]
  ): Promise<string> {
    try {
      if (documents.length === 0) {
        return this.generateFallbackResponse(context.userQuery)
      }

      // Construir contexto dos documentos
      const documentsContext = documents
        .map(doc => `**${doc.title}** (${doc.category}):\n${doc.content.substring(0, 500)}...`)
        .join('\n\n')

      // Prompt para gerar resposta contextual
      const prompt = `
Você é Nôa Esperanza, assistente médica especializada da plataforma Nôa Esperanza.

CONTEXTO DA CONSULTA:
- Usuário: ${context.userType || 'usuário'}
- Consulta: "${context.userQuery}"

DOCUMENTOS DA BASE DE CONHECIMENTO:
${documentsContext}

INSTRUÇÕES:
1. Responda baseando-se EXCLUSIVAMENTE nos documentos fornecidos
2. Se a informação não estiver nos documentos, diga claramente que não tem acesso a essa informação específica
3. Cite as fontes quando possível
4. Mantenha tom médico profissional e empático
5. Se for uma consulta sobre base de conhecimento, explique o que foi encontrado

Responda de forma clara e útil:
      `

      const response = await openAIService.getNoaResponse(context.userQuery, [
        { role: 'system', content: prompt },
      ])

      return response || this.generateFallbackResponse(context.userQuery)
    } catch (error) {
      logger.error('❌ Erro ao gerar resposta contextual', error)
      return this.generateFallbackResponse(context.userQuery)
    }
  }

  /**
   * Extrair palavras-chave da consulta
   */
  private extractKeywords(query: string): string[] {
    const medicalKeywords = [
      'neurologia',
      'cannabis',
      'nefrologia',
      'avaliação',
      'clínica',
      'entrevista',
      'método',
      'valença',
      'nôa',
      'esperanza',
      'documento',
      'mestre',
      'base',
      'conhecimento',
      'instruções',
    ]

    const queryLower = query.toLowerCase()
    return medicalKeywords.filter(keyword => queryLower.includes(keyword))
  }

  /**
   * Obter categorias médicas relevantes
   */
  private getMedicalCategories(query: string): string[] {
    const categories: string[] = []
    const queryLower = query.toLowerCase()

    if (queryLower.includes('neurologia') || queryLower.includes('neurológico')) {
      categories.push('neurologia')
    }
    if (queryLower.includes('cannabis') || queryLower.includes('maconha')) {
      categories.push('cannabis medicinal')
    }
    if (queryLower.includes('nefrologia') || queryLower.includes('rim')) {
      categories.push('nefrologia')
    }
    if (queryLower.includes('avaliação') || queryLower.includes('clínica')) {
      categories.push('avaliação clínica')
    }

    return categories
  }

  /**
   * Remover documentos duplicados
   */
  private removeDuplicates(documents: DocumentMaster[]): DocumentMaster[] {
    const seen = new Set<string>()
    return documents.filter(doc => {
      if (seen.has(doc.id)) {
        return false
      }
      seen.add(doc.id)
      return true
    })
  }

  /**
   * Ordenar documentos por relevância
   */
  private rankByRelevance(documents: DocumentMaster[], query: string): DocumentMaster[] {
    const queryLower = query.toLowerCase()

    return documents.sort((a, b) => {
      // Pontuação baseada em correspondências no título e conteúdo
      const scoreA = this.calculateRelevanceScore(a, queryLower)
      const scoreB = this.calculateRelevanceScore(b, queryLower)

      return scoreB - scoreA
    })
  }

  /**
   * Calcular pontuação de relevância
   */
  private calculateRelevanceScore(document: DocumentMaster, query: string): number {
    let score = 0

    // Pontuação por correspondência no título
    if (document.title.toLowerCase().includes(query)) {
      score += 10
    }

    // Pontuação por correspondência no conteúdo
    const contentMatches = (document.content.toLowerCase().match(new RegExp(query, 'g')) || [])
      .length
    score += contentMatches * 2

    // Pontuação por tipo de documento
    if (document.type === 'knowledge') score += 5
    if (document.type === 'instructions') score += 3
    if (document.type === 'personality') score += 1

    // Pontuação por data de atualização (documentos mais recentes)
    const daysSinceUpdate =
      (Date.now() - new Date(document.updated_at).getTime()) / (1000 * 60 * 60 * 24)
    score += Math.max(0, 10 - daysSinceUpdate / 30) // Decai ao longo do tempo

    return score
  }

  /**
   * Calcular nível de confiança da resposta
   */
  private calculateConfidence(documents: DocumentMaster[], answer: string): number {
    if (documents.length === 0) return 0

    let confidence = 0.3 // Base mínima

    // Aumentar confiança baseado no número de documentos
    confidence += Math.min(0.4, documents.length * 0.1)

    // Aumentar confiança baseado no tamanho da resposta
    if (answer.length > 100) confidence += 0.2
    if (answer.length > 300) confidence += 0.1

    // Aumentar confiança se menciona fontes
    if (answer.includes('**') || answer.includes('documento')) confidence += 0.1

    return Math.min(1, confidence)
  }

  /**
   * Gerar resposta de fallback quando não há documentos
   */
  private generateFallbackResponse(query: string): string {
    const queryLower = query.toLowerCase()

    if (queryLower.includes('base') && queryLower.includes('conhecimento')) {
      return `Entendo que você quer consultar a base de conhecimento, Dr. Ricardo. No momento, não consegui encontrar documentos específicos sobre "${query}". 

Vou verificar se há documentos na base de conhecimento que possam ajudar. Você pode:
1. Verificar a aba "Base de Conhecimento" no GPT Builder
2. Adicionar novos documentos se necessário
3. Reformular sua pergunta com termos mais específicos

Como posso ajudá-lo de outra forma?`
    }

    return `Dr. Ricardo, não consegui encontrar informações específicas sobre "${query}" na base de conhecimento atual. 

Posso ajudá-lo de outras formas:
- Consultar documentos específicos na base de conhecimento
- Ajudar com avaliações clínicas
- Orientar sobre o uso da plataforma

O que você gostaria de fazer?`
  }

  /**
   * Obter histórico de consultas
   */
  getConsultationHistory(): ConsultationResult[] {
    return [...this.consultationHistory]
  }

  /**
   * Limpar histórico de consultas
   */
  clearHistory(): void {
    this.consultationHistory = []
  }

  /**
   * Obter estatísticas das consultas
   */
  getConsultationStats(): {
    totalConsultations: number
    averageConfidence: number
    mostQueriedTopics: string[]
  } {
    if (this.consultationHistory.length === 0) {
      return {
        totalConsultations: 0,
        averageConfidence: 0,
        mostQueriedTopics: [],
      }
    }

    const totalConsultations = this.consultationHistory.length
    const averageConfidence =
      this.consultationHistory.reduce((sum, consultation) => sum + consultation.confidence, 0) /
      totalConsultations

    const topics = this.consultationHistory.map(c => c.query)
    const topicCounts = topics.reduce(
      (acc, topic) => {
        acc[topic] = (acc[topic] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )

    const mostQueriedTopics = Object.entries(topicCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([topic]) => topic)

    return {
      totalConsultations,
      averageConfidence,
      mostQueriedTopics,
    }
  }
}

// Instância global do serviço
export const realTimeConsultationService = new RealTimeConsultationService()

// 🧠 SERVIÇO DE INTEGRAÇÃO DE CONHECIMENTO
// Integra automaticamente conhecimento extraído das conversas com a IA residente

import { gptBuilderService } from './gptBuilderService'
import { aiLearningService } from './aiLearningService'
import { supabase } from '../integrations/supabase/client'

export interface KnowledgeNode {
  id: string
  concept: string
  relatedConcepts: string[]
  confidence: number
  source: 'conversation' | 'document' | 'clinical' | 'protocol'
  metadata: {
    extractedFrom: string
    timestamp: Date
    keywords: string[]
    context: string
  }
}

export interface KnowledgeConnection {
  from: string
  to: string
  relationship: 'similar' | 'related' | 'contradicts' | 'supports' | 'depends_on'
  strength: number
  context: string
}

export class KnowledgeIntegrationService {
  
  // 🔗 CRIAR CONEXÕES ENTRE CONHECIMENTOS
  
  async createKnowledgeConnections(newKnowledge: any): Promise<void> {
    try {
      const existingKnowledge = await this.getAllKnowledgeNodes()
      
      for (const existing of existingKnowledge) {
        const connectionStrength = this.calculateConnectionStrength(newKnowledge, existing)
        
        if (connectionStrength > 0.6) {
          await this.saveKnowledgeConnection(newKnowledge, existing, connectionStrength)
        }
      }
    } catch (error) {
      console.error('Erro ao criar conexões de conhecimento:', error)
    }
  }

  private calculateConnectionStrength(newKnowledge: any, existing: any): number {
    const newKeywords = newKnowledge.extractedConcepts || []
    const existingKeywords = existing.keywords || []
    
    // Calcular sobreposição de palavras-chave
    const intersection = newKeywords.filter((keyword: string) => 
      existingKeywords.includes(keyword)
    ).length
    
    const union = new Set([...newKeywords, ...existingKeywords]).size
    
    return intersection / union
  }

  private async saveKnowledgeConnection(
    from: any, 
    to: any, 
    strength: number
  ): Promise<void> {
    try {
      await supabase.from('knowledge_connections').insert({
        from_concept: from.concept || from.title,
        to_concept: to.concept || to.title,
        relationship: strength > 0.8 ? 'similar' : 'related',
        strength,
        context: `Conectado automaticamente em ${new Date().toISOString()}`,
        created_at: new Date().toISOString()
      })
    } catch (error) {
      console.error('Erro ao salvar conexão de conhecimento:', error)
    }
  }

  // 🧠 INTEGRAR COM SISTEMA DE APRENDIZADOS
  
  async integrateWithAILearning(document: any): Promise<void> {
    try {
      const learningEntries = this.extractLearningEntries(document)
      
      for (const entry of learningEntries) {
        await aiLearningService.saveLearning({
          keyword: entry.keyword,
          context: entry.context,
          user_message: entry.userMessage,
          ai_response: entry.aiResponse,
          category: entry.category,
          confidence_score: entry.confidence
        })
      }
    } catch (error) {
      console.error('Erro ao integrar com AI Learning:', error)
    }
  }

  private extractLearningEntries(document: any): any[] {
    const content = document.content
    const keywords = this.extractKeywords(content)
    
    return keywords.map((keyword, index) => ({
      keyword: keyword.toLowerCase(),
      context: document.category || 'conversational-extraction',
      user_message: `Informação sobre ${keyword}`,
      ai_response: this.generateAIResponse(content, keyword),
      category: document.category || 'knowledge',
      confidence: 0.9
    }))
  }

  private extractKeywords(content: string): string[] {
    const medicalTerms = [
      'CBD', 'THC', 'cannabis', 'epilepsia', 'convulsão', 'dor neuropática',
      'protocolo', 'dosagem', 'tratamento', 'medicação', 'sintoma',
      'diagnóstico', 'avaliação', 'anamnese', 'neurologia', 'nefrologia'
    ]
    
    const foundTerms = medicalTerms.filter(term => 
      content.toLowerCase().includes(term.toLowerCase())
    )
    
    return foundTerms.length > 0 ? foundTerms : ['conhecimento médico']
  }

  private generateAIResponse(content: string, keyword: string): string {
    const relevantSection = content.split('\n').find(line => 
      line.toLowerCase().includes(keyword.toLowerCase())
    ) || content.substring(0, 200)
    
    return `Baseado na discussão com Dr. Ricardo Valença: ${relevantSection}`
  }

  // 📊 OBTER TODOS OS NÓS DE CONHECIMENTO
  
  private async getAllKnowledgeNodes(): Promise<KnowledgeNode[]> {
    try {
      const { data: documents } = await supabase
        .from('documentos_mestres')
        .select('*')
        .eq('is_active', true)
      
      return (documents || []).map(doc => ({
        id: doc.id,
        concept: doc.title,
        relatedConcepts: this.extractKeywords(doc.content),
        confidence: 0.9,
        source: 'document' as const,
        metadata: {
          extractedFrom: 'documentos_mestres',
          timestamp: new Date(doc.updated_at),
          keywords: this.extractKeywords(doc.content),
          context: doc.category || 'general'
        }
      }))
    } catch (error) {
      console.error('Erro ao obter nós de conhecimento:', error)
      return []
    }
  }

  // 🔍 BUSCAR CONHECIMENTO CONTEXTUAL
  
  async findContextualKnowledge(query: string): Promise<any[]> {
    try {
      const { data: connections } = await supabase
        .from('knowledge_connections')
        .select(`
          *,
          from_concept,
          to_concept,
          relationship,
          strength
        `)
        .or(`from_concept.ilike.%${query}%,to_concept.ilike.%${query}%`)
        .order('strength', { ascending: false })
        .limit(5)

      return connections || []
    } catch (error) {
      console.error('Erro ao buscar conhecimento contextual:', error)
      return []
    }
  }

  // 🎯 GERAR RESPOSTA CONTEXTUALIZADA
  
  async generateContextualResponse(userMessage: string): Promise<string> {
    try {
      const contextualKnowledge = await this.findContextualKnowledge(userMessage)
      const relevantDocs = await gptBuilderService.searchDocuments(userMessage)
      
      let context = ''
      
      if (contextualKnowledge.length > 0) {
        context += 'Conhecimento relacionado encontrado:\n'
        contextualKnowledge.forEach(conn => {
          context += `• ${conn.from_concept} → ${conn.to_concept} (${conn.relationship})\n`
        })
      }
      
      if (relevantDocs.length > 0) {
        context += '\nDocumentos relevantes:\n'
        relevantDocs.slice(0, 3).forEach(doc => {
          context += `• ${doc.title}: ${doc.content.substring(0, 100)}...\n`
        })
      }
      
      return context || 'Nenhum contexto específico encontrado na base de conhecimento.'
    } catch (error) {
      console.error('Erro ao gerar resposta contextualizada:', error)
      return 'Erro ao buscar contexto na base de conhecimento.'
    }
  }

  // 📈 ESTATÍSTICAS DE INTEGRAÇÃO
  
  async getIntegrationStats(): Promise<{
    totalDocuments: number
    totalConnections: number
    knowledgeNodes: number
    integrationHealth: number
  }> {
    try {
      const [documents, connections, learningEntries] = await Promise.all([
        gptBuilderService.getDocuments(),
        supabase.from('knowledge_connections').select('id'),
        supabase.from('ai_learning').select('id')
      ])

      const totalDocuments = documents.length
      const totalConnections = connections.data?.length || 0
      const knowledgeNodes = totalDocuments
      const integrationHealth = totalConnections > 0 ? 
        Math.min(100, (totalConnections / totalDocuments) * 100) : 0

      return {
        totalDocuments,
        totalConnections,
        knowledgeNodes,
        integrationHealth
      }
    } catch (error) {
      console.error('Erro ao obter estatísticas de integração:', error)
      return {
        totalDocuments: 0,
        totalConnections: 0,
        knowledgeNodes: 0,
        integrationHealth: 0
      }
    }
  }

  // 🔄 SINCRONIZAÇÃO COMPLETA
  
  async performFullIntegration(): Promise<void> {
    try {
      console.log('🔄 Iniciando integração completa de conhecimento...')
      
      const documents = await gptBuilderService.getDocuments()
      
      for (const document of documents) {
        // Integrar com AI Learning
        await this.integrateWithAILearning(document)
        
        // Criar conexões de conhecimento
        await this.createKnowledgeConnections(document)
      }
      
      console.log('✅ Integração completa finalizada!')
    } catch (error) {
      console.error('Erro na integração completa:', error)
      throw error
    }
  }
}

// Instância global do serviço
export const knowledgeIntegrationService = new KnowledgeIntegrationService()

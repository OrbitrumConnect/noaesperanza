// 🧠 ACTIVE CONTEXT SERVICE - Dr. Ricardo Valença
// Sistema de contexto ativo por documento/sessão

import { supabase } from '../integrations/supabase/client'

export interface ActiveContext {
  docId: string
  title: string
  content: string
  category: string
  tags: string[]
  gptModule?: string
  lastAccessed: Date
  sessionId: string
  learningData: {
    interactions: number
    keywords: string[]
    contextVector: number[]
  }
}

export interface GPTSession {
  id: string
  userId: string
  activeContexts: ActiveContext[]
  currentFocus: string
  sessionStart: Date
  totalInteractions: number
}

export class ActiveContextService {
  
  // 🎯 DEFINIR CONTEXTO ATIVO
  async setActiveContext(docId: string, content: string, title: string, category: string): Promise<ActiveContext> {
    const sessionId = this.getCurrentSessionId()
    
    const activeContext: ActiveContext = {
      docId,
      title,
      content,
      category,
      tags: this.extractTags(content),
      gptModule: this.detectGPTModule(content),
      lastAccessed: new Date(),
      sessionId,
      learningData: {
        interactions: 0,
        keywords: this.extractKeywords(content),
        contextVector: await this.generateContextVector(content)
      }
    }
    
    // Salvar no sessionStorage para acesso rápido
    sessionStorage.setItem("active_context", JSON.stringify(activeContext))
    
    // Salvar no banco para persistência
    await this.saveContextToDatabase(activeContext)
    
    console.log('🧠 Contexto ativo definido:', title)
    return activeContext
  }
  
  // 🔍 OBTER CONTEXTO ATIVO
  async getActiveContext(): Promise<ActiveContext | null> {
    try {
      // Buscar do sessionStorage primeiro
      const stored = sessionStorage.getItem("active_context")
      if (stored) {
        const context = JSON.parse(stored)
        // Verificar se ainda é relevante (últimos 30 minutos)
        const lastAccess = new Date(context.lastAccessed)
        const now = new Date()
        const diffMinutes = (now.getTime() - lastAccess.getTime()) / (1000 * 60)
        
        if (diffMinutes < 30) {
          return context
        }
      }
      
      // Buscar do banco se não encontrado no sessionStorage
      const { data } = await supabase
        .from('active_contexts')
        .select('*')
        .eq('session_id', this.getCurrentSessionId())
        .order('last_accessed', { ascending: false })
        .limit(1)
        .single()
      
      if (data) {
        const context: ActiveContext = {
          docId: data.doc_id,
          title: data.title,
          content: data.content,
          category: data.category,
          tags: data.tags || [],
          gptModule: data.gpt_module,
          lastAccessed: new Date(data.last_accessed),
          sessionId: data.session_id,
          learningData: data.learning_data || {
            interactions: 0,
            keywords: [],
            contextVector: []
          }
        }
        
        // Atualizar sessionStorage
        sessionStorage.setItem("active_context", JSON.stringify(context))
        return context
      }
      
      return null
    } catch (error) {
      console.error('Erro ao obter contexto ativo:', error)
      return null
    }
  }
  
  // 🔄 ATUALIZAR CONTEXTO COM INTERAÇÃO
  async updateContextWithInteraction(message: string, response: string): Promise<void> {
    const activeContext = await this.getActiveContext()
    if (!activeContext) return
    
    // Incrementar interações
    activeContext.learningData.interactions++
    
    // Extrair novas palavras-chave da interação
    const newKeywords = this.extractKeywords(message + ' ' + response)
    activeContext.learningData.keywords = [
      ...new Set([...activeContext.learningData.keywords, ...newKeywords])
    ].slice(0, 20) // Manter apenas as 20 mais relevantes
    
    // Atualizar timestamp
    activeContext.lastAccessed = new Date()
    
    // Salvar atualizações
    sessionStorage.setItem("active_context", JSON.stringify(activeContext))
    await this.saveContextToDatabase(activeContext)
    
    console.log('🔄 Contexto atualizado com interação:', activeContext.learningData.interactions)
  }
  
  // 🧩 DETECTAR MÓDULO GPT
  private detectGPTModule(content: string): string {
    const lowerContent = content.toLowerCase()
    
    if (lowerContent.includes('#gpt: clínico') || lowerContent.includes('triagem') || lowerContent.includes('avaliação')) {
      return 'clinico'
    }
    
    if (lowerContent.includes('#gpt: pedagógico') || lowerContent.includes('educação') || lowerContent.includes('curso')) {
      return 'pedagogico'
    }
    
    if (lowerContent.includes('#gpt: narrativo') || lowerContent.includes('história') || lowerContent.includes('relato')) {
      return 'narrativo'
    }
    
    if (lowerContent.includes('#gpt: técnico') || lowerContent.includes('análise') || lowerContent.includes('método')) {
      return 'tecnico'
    }
    
    return 'geral'
  }
  
  // 🏷️ EXTRAIR TAGS
  private extractTags(content: string): string[] {
    const tagMatches = content.match(/#\w+/g)
    return tagMatches ? tagMatches.map(tag => tag.substring(1)) : []
  }
  
  // 🔑 EXTRAIR PALAVRAS-CHAVE
  private extractKeywords(content: string): string[] {
    const medicalKeywords = [
      'paciente', 'tratamento', 'diagnóstico', 'sintoma', 'medicamento',
      'cannabis', 'nefrologia', 'neurologia', 'terapia', 'análise'
    ]
    
    const techKeywords = [
      'desenvolvimento', 'tecnologia', 'plataforma', 'sistema', 'ia',
      'inteligência', 'artificial', 'algoritmo', 'dados'
    ]
    
    const keywords = [...medicalKeywords, ...techKeywords]
    const lowerContent = content.toLowerCase()
    
    return keywords.filter(keyword => lowerContent.includes(keyword))
  }
  
  // 🧮 GERAR VETOR DE CONTEXTO
  private async generateContextVector(content: string): Promise<number[]> {
    // Implementação simplificada - em produção, usar embeddings reais
    const keywords = this.extractKeywords(content)
    const vector = new Array(10).fill(0)
    
    keywords.forEach((keyword, index) => {
      if (index < 10) {
        vector[index] = 1
      }
    })
    
    return vector
  }
  
  // 💾 SALVAR CONTEXTO NO BANCO
  private async saveContextToDatabase(context: ActiveContext): Promise<void> {
    try {
      await supabase
        .from('active_contexts')
        .upsert({
          doc_id: context.docId,
          title: context.title,
          content: context.content,
          category: context.category,
          tags: context.tags,
          gpt_module: context.gptModule,
          last_accessed: context.lastAccessed.toISOString(),
          session_id: context.sessionId,
          learning_data: context.learningData
        })
    } catch (error) {
      console.error('Erro ao salvar contexto no banco:', error)
    }
  }
  
  // 🆔 OBTER ID DA SESSÃO
  private getCurrentSessionId(): string {
    let sessionId = sessionStorage.getItem('session_id')
    if (!sessionId) {
      sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
      sessionStorage.setItem('session_id', sessionId)
    }
    return sessionId
  }
  
  // 📊 GERAR CONTEXTO PARA PROMPT
  async generateContextPrompt(): Promise<string> {
    const activeContext = await this.getActiveContext()
    if (!activeContext) return ''
    
    return `
🧠 **CONTEXTO ATIVO DA SESSÃO:**

📄 **Documento:** ${activeContext.title}
🏷️ **Categoria:** ${activeContext.category}
🧩 **Módulo GPT:** ${activeContext.gptModule || 'geral'}
🏷️ **Tags:** ${activeContext.tags.join(', ')}
📊 **Interações:** ${activeContext.learningData.interactions}
🔑 **Palavras-chave:** ${activeContext.learningData.keywords.join(', ')}

**Conteúdo relevante:**
${activeContext.content.substring(0, 500)}${activeContext.content.length > 500 ? '...' : ''}

**Use este contexto para personalizar suas respostas e manter continuidade na conversa.**
`
  }
}

export const activeContextService = new ActiveContextService()

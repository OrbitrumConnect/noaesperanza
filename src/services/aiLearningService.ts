// Serviço para sistema de aprendizado da IA
import { supabase } from '../integrations/supabase/client'

export interface AILearning {
  id: string
  keyword: string
  context: string
  user_message: string
  ai_response: string
  category: 'medical' | 'general' | 'evaluation' | 'cannabis' | 'neurology' | 'nephrology'
  confidence_score: number
  usage_count: number
  last_used: string
  created_at: string
  updated_at: string
}

export interface AIKeyword {
  id: string
  keyword: string
  category: string
  importance_score: number
  usage_count: number
  last_used: string
  created_at: string
  updated_at: string
}

export interface AIConversationPattern {
  id: string
  pattern_type: string
  user_input_pattern: string
  best_response: string
  success_rate: number
  usage_count: number
  last_used: string
  created_at: string
  updated_at: string
}

class AILearningService {
  // Salvar aprendizado da IA
  async saveLearning(learningData: Partial<AILearning>) {
    try {
      const { data, error } = await supabase
        .from('ai_learning')
        .insert(learningData)
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Erro ao salvar aprendizado da IA:', error)
      throw error
    }
  }

  // Obter aprendizado por palavra-chave
  async getLearningByKeyword(keyword: string) {
    try {
      const { data, error } = await supabase
        .from('ai_learning')
        .select('*')
        .ilike('keyword', `%${keyword}%`)
        .order('confidence_score', { ascending: false })
        .limit(5)
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Erro ao obter aprendizado por palavra-chave:', error)
      throw error
    }
  }

  // Obter aprendizado por categoria
  async getLearningByCategory(category: string) {
    try {
      const { data, error } = await supabase
        .from('ai_learning')
        .select('*')
        .eq('category', category)
        .order('usage_count', { ascending: false })
        .limit(10)
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Erro ao obter aprendizado por categoria:', error)
      throw error
    }
  }

  // Obter todas as palavras-chave
  async getKeywords() {
    try {
      const { data, error } = await supabase
        .from('ai_keywords')
        .select('*')
        .order('importance_score', { ascending: false })
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Erro ao obter palavras-chave:', error)
      throw error
    }
  }

  // Adicionar nova palavra-chave
  async addKeyword(keyword: string, category: string, importance: number = 0.5) {
    try {
      const { data, error } = await supabase
        .from('ai_keywords')
        .upsert({
          keyword: keyword.toLowerCase(),
          category,
          importance_score: importance
        })
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Erro ao adicionar palavra-chave:', error)
      throw error
    }
  }

  // Detectar palavras-chave automaticamente (sem intervenção manual)
  async detectKeywords(message: string) {
    try {
      // Palavras-chave médicas automáticas
      const medicalKeywords = [
        'dor', 'dor de cabeça', 'dor no peito', 'dor abdominal', 'cansaço', 'fadiga',
        'ansiedade', 'depressão', 'insônia', 'convulsão', 'tontura', 'náusea',
        'cannabis', 'cannabis medicinal', 'maconha', 'CBD', 'THC',
        'neurologia', 'cérebro', 'nervo', 'neurônio', 'epilepsia',
        'nefrologia', 'rim', 'renal', 'diálise', 'transplante',
        'avaliação', 'consulta', 'exame', 'sintoma', 'diagnóstico',
        'medicamento', 'remédio', 'tratamento', 'terapia'
      ]
      
      const detectedKeywords: string[] = []
      const lowerMessage = message.toLowerCase()
      
      // Detectar palavras-chave automaticamente
      for (const keyword of medicalKeywords) {
        if (lowerMessage.includes(keyword.toLowerCase())) {
          detectedKeywords.push(keyword)
        }
      }
      
      // Detectar palavras-chave existentes no banco
      const existingKeywords = await this.getKeywords()
      for (const keyword of existingKeywords) {
        if (lowerMessage.includes(keyword.keyword.toLowerCase())) {
          detectedKeywords.push(keyword.keyword)
        }
      }
      
      return detectedKeywords
    } catch (error) {
      console.error('Erro ao detectar palavras-chave:', error)
      return []
    }
  }

  // Obter contexto de aprendizado para ChatGPT
  async getLearningContext(message: string) {
    try {
      const keywords = await this.detectKeywords(message)
      let context = ''
      
      if (keywords.length > 0) {
        context += 'CONTEXTO DE APRENDIZADO:\n'
        for (const keyword of keywords) {
          const learning = await this.getLearningByKeyword(keyword.keyword)
          if (learning.length > 0) {
            context += `- ${keyword.keyword}: ${learning[0].ai_response}\n`
          }
        }
      }
      
      return context
    } catch (error) {
      console.error('Erro ao obter contexto de aprendizado:', error)
      return ''
    }
  }

  // Salvar interação completa (APRENDIZADO AUTOMÁTICO)
  async saveInteraction(userMessage: string, aiResponse: string, category: string = 'general') {
    try {
      const keywords = await this.detectKeywords(userMessage)
      
      // Determinar categoria automaticamente baseada no conteúdo
      const autoCategory = this.determineCategory(userMessage, keywords)
      
      // Salvar aprendizado principal
      const learningData = {
        keyword: keywords.length > 0 ? keywords[0] : 'geral',
        context: userMessage,
        user_message: userMessage,
        ai_response: aiResponse,
        category: autoCategory as any,
        confidence_score: this.calculateConfidence(userMessage, keywords)
      }
      
      await this.saveLearning(learningData)
      
      // Criar/atualizar palavras-chave automaticamente
      for (const keyword of keywords) {
        await this.autoCreateKeyword(keyword, autoCategory)
      }
      
      // Criar clusters de aprendizado automaticamente
      await this.createLearningClusters(userMessage, aiResponse, autoCategory)
      
      console.log('🧠 IA aprendeu automaticamente:', { 
        keywords: keywords.length, 
        category: autoCategory,
        confidence: learningData.confidence_score 
      })
    } catch (error) {
      console.error('Erro ao salvar interação:', error)
    }
  }

  // Determinar categoria automaticamente
  private determineCategory(message: string, keywords: string[]): string {
    const lowerMessage = message.toLowerCase()
    
    // Cannabis
    if (lowerMessage.includes('cannabis') || lowerMessage.includes('maconha') || 
        lowerMessage.includes('cbd') || lowerMessage.includes('thc')) {
      return 'cannabis'
    }
    
    // Neurologia
    if (lowerMessage.includes('cérebro') || lowerMessage.includes('nervo') || 
        lowerMessage.includes('convulsão') || lowerMessage.includes('epilepsia') ||
        lowerMessage.includes('neurologia')) {
      return 'neurology'
    }
    
    // Nefrologia
    if (lowerMessage.includes('rim') || lowerMessage.includes('renal') || 
        lowerMessage.includes('diálise') || lowerMessage.includes('transplante') ||
        lowerMessage.includes('nefrologia')) {
      return 'nephrology'
    }
    
    // Avaliação
    if (lowerMessage.includes('avaliação') || lowerMessage.includes('consulta') || 
        lowerMessage.includes('exame') || lowerMessage.includes('sintoma')) {
      return 'evaluation'
    }
    
    // Médico geral
    if (lowerMessage.includes('dor') || lowerMessage.includes('cansaço') || 
        lowerMessage.includes('ansiedade') || lowerMessage.includes('depressão') ||
        lowerMessage.includes('medicamento') || lowerMessage.includes('tratamento')) {
      return 'medical'
    }
    
    return 'general'
  }

  // Calcular confiança automaticamente
  private calculateConfidence(message: string, keywords: string[]): number {
    let confidence = 0.5 // Base
    
    // Mais palavras-chave = maior confiança
    confidence += keywords.length * 0.1
    
    // Mensagens mais longas = maior confiança
    if (message.length > 50) confidence += 0.1
    if (message.length > 100) confidence += 0.1
    
    // Palavras médicas específicas = maior confiança
    const medicalWords = ['sintoma', 'diagnóstico', 'tratamento', 'medicamento', 'consulta']
    const medicalCount = medicalWords.filter(word => message.toLowerCase().includes(word)).length
    confidence += medicalCount * 0.05
    
    return Math.min(confidence, 1.0) // Máximo 1.0
  }

  // Criar palavra-chave automaticamente
  private async autoCreateKeyword(keyword: string, category: string) {
    try {
      const { data, error } = await supabase
        .from('ai_keywords')
        .upsert({
          keyword: keyword.toLowerCase(),
          category,
          importance_score: this.calculateImportance(keyword, category),
          usage_count: 1,
          last_used: new Date().toISOString()
        }, {
          onConflict: 'keyword'
        })
        .select()
        .single()
      
      if (error && !error.message.includes('duplicate')) {
        console.error('Erro ao criar palavra-chave:', error)
      }
    } catch (error) {
      console.error('Erro ao criar palavra-chave automaticamente:', error)
    }
  }

  // Calcular importância da palavra-chave
  private calculateImportance(keyword: string, category: string): number {
    let importance = 0.5
    
    // Palavras-chave médicas importantes
    const importantWords = ['cannabis', 'convulsão', 'dor', 'ansiedade', 'depressão']
    if (importantWords.includes(keyword.toLowerCase())) {
      importance = 0.9
    }
    
    // Categorias importantes
    if (category === 'cannabis' || category === 'neurology') {
      importance = Math.max(importance, 0.8)
    }
    
    return importance
  }

  // Criar clusters de aprendizado automaticamente
  private async createLearningClusters(userMessage: string, aiResponse: string, category: string) {
    try {
      // Analisar padrões na conversa
      const patterns = this.analyzeConversationPatterns(userMessage, aiResponse)
      
      for (const pattern of patterns) {
        // Verificar se o padrão já existe
        const { data: existingPattern } = await supabase
          .from('ai_conversation_patterns')
          .select('id, usage_count')
          .eq('user_input_pattern', pattern.userPattern)
          .single()

        if (existingPattern) {
          // Atualizar contador de uso
          await supabase
            .from('ai_conversation_patterns')
            .update({
              usage_count: existingPattern.usage_count + 1,
              last_used: new Date().toISOString()
            })
            .eq('id', existingPattern.id)
        } else {
          // Criar novo padrão
          await supabase
            .from('ai_conversation_patterns')
            .insert({
              pattern_type: pattern.type,
              user_input_pattern: pattern.userPattern,
              best_response: pattern.bestResponse,
              success_rate: pattern.successRate,
              usage_count: 1,
              last_used: new Date().toISOString()
            })
        }
      }
    } catch (error) {
      console.error('Erro ao criar clusters de aprendizado:', error)
    }
  }

  // Analisar padrões de conversa
  private analyzeConversationPatterns(userMessage: string, aiResponse: string) {
    const patterns = []
    
    // Padrão de saudação
    if (userMessage.toLowerCase().includes('olá') || userMessage.toLowerCase().includes('oi')) {
      patterns.push({
        type: 'greeting',
        userPattern: 'saudação',
        bestResponse: aiResponse,
        successRate: 0.8
      })
    }
    
    // Padrão de pergunta médica
    if (userMessage.includes('?') && (userMessage.includes('dor') || userMessage.includes('sintoma'))) {
      patterns.push({
        type: 'medical_question',
        userPattern: 'pergunta médica',
        bestResponse: aiResponse,
        successRate: 0.9
      })
    }
    
    // Padrão de agradecimento
    if (userMessage.toLowerCase().includes('obrigado') || userMessage.toLowerCase().includes('valeu')) {
      patterns.push({
        type: 'thanks',
        userPattern: 'agradecimento',
        bestResponse: aiResponse,
        successRate: 0.7
      })
    }
    
    return patterns
  }

  // Obter estatísticas de aprendizado
  async getLearningStats() {
    try {
      const { data: learningStats, error: learningError } = await supabase
        .from('ai_learning')
        .select('category, confidence_score, usage_count')
      
      const { data: keywordStats, error: keywordError } = await supabase
        .from('ai_keywords')
        .select('category, importance_score, usage_count')
      
      if (learningError) throw learningError
      if (keywordError) throw keywordError
      
      return {
        totalInteractions: learningStats?.length || 0,
        totalKeywords: keywordStats?.length || 0,
        categories: {
          medical: learningStats?.filter(s => s.category === 'medical').length || 0,
          cannabis: learningStats?.filter(s => s.category === 'cannabis').length || 0,
          neurology: learningStats?.filter(s => s.category === 'neurology').length || 0,
          nephrology: learningStats?.filter(s => s.category === 'nephrology').length || 0,
          evaluation: learningStats?.filter(s => s.category === 'evaluation').length || 0,
          general: learningStats?.filter(s => s.category === 'general').length || 0
        },
        avgConfidence: learningStats?.reduce((acc, s) => acc + s.confidence_score, 0) / (learningStats?.length || 1),
        totalUsage: learningStats?.reduce((acc, s) => acc + s.usage_count, 0) || 0
      }
    } catch (error) {
      console.error('Erro ao obter estatísticas de aprendizado:', error)
      return null
    }
  }
}

export const aiLearningService = new AILearningService()

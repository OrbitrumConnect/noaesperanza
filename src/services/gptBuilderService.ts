// 🧠 GPT BUILDER SERVICE - SISTEMA HÍBRIDO
// Integração completa: AppB + NOA FINAL
// ==============================================================================

import { supabase } from '../integrations/supabase/client'
import mammoth from 'mammoth'
import { getDocument } from 'pdfjs-dist'

export interface DocumentMaster {
  id: string
  title: string
  content: string
  type: 'personality' | 'knowledge' | 'instructions' | 'examples'
  category: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface NoaConfig {
  personality: string
  greeting: string
  expertise: string
  tone: string
  recognition: {
    drRicardoValenca: boolean
    autoGreeting: boolean
    personalizedResponse: boolean
    contextualAnalysis: boolean
  }
  features: {
    noaVisionIA: boolean
    hybridAI: boolean
    semanticSearch: boolean
    gptBuilder: boolean
    collaboration: boolean
  }
}

export interface UserRecognition {
  id: string
  user_id?: string
  name: string
  role: string
  specialization?: string
  greeting_template?: string
  is_active: boolean
}

export interface WorkAnalysis {
  id: string
  original_work: string
  analysis_result: string
  improved_version: string
  accuracy_score: number
  cross_references: any[]
  related_documents: any[]
  total_references: number
  analysis_status: 'pending' | 'processing' | 'completed' | 'error'
}

export interface CollaborativeWork {
  id: string
  title: string
  type: 'research' | 'clinical' | 'development' | 'analysis'
  content: string
  participants: string[]
  status: 'active' | 'completed' | 'archived'
  created_at: string
  updated_at: string
}

export class GPTBuilderService {
  
  // ===========================================================================
  // 📚 GERENCIAMENTO DE DOCUMENTOS MESTRES
  // ===========================================================================
  
  /**
   * Buscar todos os documentos mestres
   */
  async getDocuments(): Promise<DocumentMaster[]> {
    try {
      console.log('📚 Buscando documentos mestres...')
      
      const { data, error } = await supabase
        .from('documentos_mestres')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ Erro ao buscar documentos:', error)
        throw error
      }
      
      console.log(`✅ ${data?.length || 0} documentos encontrados`)
      return data || []
    } catch (error) {
      console.error('❌ Erro ao buscar documentos:', error)
      return []
    }
  }

  /**
   * Buscar documentos por tipo
   */
  async getDocumentsByType(type: string): Promise<DocumentMaster[]> {
    try {
      console.log(`📚 Buscando documentos do tipo: ${type}`)
      
      const { data, error } = await supabase
        .from('documentos_mestres')
        .select('*')
        .eq('type', type)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (error) throw error
      
      console.log(`✅ ${data?.length || 0} documentos encontrados`)
      return data || []
    } catch (error) {
      console.error('❌ Erro ao buscar documentos por tipo:', error)
      return []
    }
  }

  /**
   * Buscar documentos por texto
   */
  async searchDocuments(query: string): Promise<DocumentMaster[]> {
    try {
      console.log(`🔍 Buscando documentos com: "${query}"`)
      
      // Usar função SQL de busca por similaridade
      const { data, error } = await supabase
        .rpc('search_documents_by_text', {
          search_query: query,
          limit_results: 10
        })

      if (error) {
        // Fallback para busca simples
        console.warn('⚠️ Busca avançada falhou, usando fallback...')
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('documentos_mestres')
          .select('*')
          .eq('is_active', true)
          .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
          .limit(10)
        
        if (fallbackError) throw fallbackError
        return fallbackData || []
      }
      
      console.log(`✅ ${data?.length || 0} documentos encontrados`)
      return data || []
    } catch (error) {
      console.error('❌ Erro ao buscar documentos:', error)
      return []
    }
  }

  /**
   * Criar novo documento mestre
   */
  async createDocument(
    document: Omit<DocumentMaster, 'id' | 'created_at' | 'updated_at'>
  ): Promise<DocumentMaster | null> {
    try {
      console.log(`📝 Criando documento: "${document.title}"`)
      
      const { data, error } = await supabase
        .from('documentos_mestres')
        .insert({
          title: document.title,
          content: document.content,
          type: document.type,
          category: document.category || 'general',
          is_active: true
        })
        .select()
        .single()

      if (error) {
        console.error('❌ Erro ao criar documento:', error)
        throw error
      }
      
      console.log('✅ Documento criado com sucesso!')
      
      // Registrar no histórico de treinamento
      await this.recordTrainingHistory(data.id, 'create')
      
      return data
    } catch (error) {
      console.error('❌ Erro ao criar documento:', error)
      return null
    }
  }

  /**
   * Atualizar documento
   */
  async updateDocument(id: string, updates: Partial<DocumentMaster>): Promise<DocumentMaster | null> {
    try {
      console.log(`📝 Atualizando documento: ${id}`)
      
      const { data, error } = await supabase
        .from('documentos_mestres')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      
      console.log('✅ Documento atualizado!')
      
      // Registrar no histórico
      await this.recordTrainingHistory(id, 'update', updates)
      
      return data
    } catch (error) {
      console.error('❌ Erro ao atualizar documento:', error)
      return null
    }
  }

  /**
   * Deletar documento (soft delete)
   */
  async deleteDocument(id: string): Promise<boolean> {
    try {
      console.log(`🗑️ Deletando documento: ${id}`)
      
      const { error } = await supabase
        .from('documentos_mestres')
        .update({ is_active: false })
        .eq('id', id)

      if (error) throw error
      
      console.log('✅ Documento deletado!')
      
      // Registrar no histórico
      await this.recordTrainingHistory(id, 'delete')
      
      return true
    } catch (error) {
      console.error('❌ Erro ao deletar documento:', error)
      return false
    }
  }

  // ===========================================================================
  // 📄 UPLOAD E EXTRAÇÃO DE DOCUMENTOS
  // ===========================================================================

  /**
   * Upload de arquivo DOCX/PDF e extração automática
   */
  async uploadAndExtractDocument(
    file: File,
    type: DocumentMaster['type'],
    category: string
  ): Promise<DocumentMaster | null> {
    try {
      console.log(`📤 Fazendo upload de: ${file.name}`)
      
      let extractedText = ''
      
      // Extrair texto baseado no tipo de arquivo
      if (file.name.endsWith('.docx')) {
        extractedText = await this.extractFromDocx(file)
      } else if (file.name.endsWith('.pdf')) {
        extractedText = await this.extractFromPdf(file)
      } else if (file.name.endsWith('.txt')) {
        extractedText = await file.text()
      } else {
        throw new Error('Formato de arquivo não suportado')
      }
      
      if (!extractedText || extractedText.trim().length === 0) {
        throw new Error('Não foi possível extrair texto do documento')
      }
      
      console.log(`✅ Texto extraído: ${extractedText.length} caracteres`)
      
      // Criar documento com texto extraído
      const document = await this.createDocument({
        title: file.name.replace(/\.(docx|pdf|txt)$/, ''),
        content: extractedText,
        type,
        category,
        is_active: true
      })
      
      return document
    } catch (error) {
      console.error('❌ Erro ao fazer upload:', error)
      return null
    }
  }

  /**
   * Extrair texto de arquivo DOCX
   */
  private async extractFromDocx(file: File): Promise<string> {
    try {
      const arrayBuffer = await file.arrayBuffer()
      const result = await mammoth.extractRawText({ arrayBuffer })
      return result.value
    } catch (error) {
      console.error('❌ Erro ao extrair DOCX:', error)
      throw error
    }
  }

  /**
   * Extrair texto de arquivo PDF
   */
  private async extractFromPdf(file: File): Promise<string> {
    try {
      const arrayBuffer = await file.arrayBuffer()
      const pdf = await getDocument({ data: arrayBuffer }).promise
      let fullText = ''
      
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i)
        const textContent = await page.getTextContent()
        const pageText = textContent.items.map((item: any) => item.str).join(' ')
        fullText += pageText + '\n'
      }
      
      return fullText
    } catch (error) {
      console.error('❌ Erro ao extrair PDF:', error)
      throw error
    }
  }

  // ===========================================================================
  // 🔧 CONFIGURAÇÃO DA NÔA
  // ===========================================================================

  /**
   * Buscar configuração atual
   */
  async getConfig(): Promise<NoaConfig | null> {
    try {
      const { data, error } = await supabase
        .from('noa_config')
        .select('config')
        .eq('id', 'main')
        .single()

      if (error) throw error
      return data?.config as NoaConfig
    } catch (error) {
      console.error('❌ Erro ao buscar config:', error)
      return null
    }
  }

  /**
   * Atualizar configuração
   */
  async updateConfig(config: Partial<NoaConfig>): Promise<boolean> {
    try {
      const currentConfig = await this.getConfig()
      const newConfig = { ...currentConfig, ...config }
      
      const { error } = await supabase
        .from('noa_config')
        .update({ config: newConfig })
        .eq('id', 'main')

      if (error) throw error
      
      console.log('✅ Configuração atualizada!')
      return true
    } catch (error) {
      console.error('❌ Erro ao atualizar config:', error)
      return false
    }
  }

  // ===========================================================================
  // 🤝 SISTEMA DE COLABORAÇÃO
  // ===========================================================================

  /**
   * Criar trabalho colaborativo
   */
  async createCollaborativeWork(work: Omit<CollaborativeWork, 'id' | 'created_at' | 'updated_at'>): Promise<CollaborativeWork | null> {
    try {
      const workId = `work_${Date.now()}`
      
      const { data, error } = await supabase
        .from('collaborative_works')
        .insert({
          id: workId,
          ...work
        })
        .select()
        .single()

      if (error) throw error
      
      console.log('✅ Trabalho colaborativo criado!')
      return data
    } catch (error) {
      console.error('❌ Erro ao criar trabalho:', error)
      return null
    }
  }

  /**
   * Buscar trabalhos colaborativos
   */
  async getCollaborativeWorks(status?: string): Promise<CollaborativeWork[]> {
    try {
      let query = supabase
        .from('collaborative_works')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (status) {
        query = query.eq('status', status)
      }
      
      const { data, error } = await query
      
      if (error) throw error
      return data || []
    } catch (error) {
      console.error('❌ Erro ao buscar trabalhos:', error)
      return []
    }
  }

  // ===========================================================================
  // 📊 HISTÓRICO E AUDITORIA
  // ===========================================================================

  /**
   * Registrar ação no histórico de treinamento
   */
  private async recordTrainingHistory(
    documentId: string,
    action: string,
    changes?: any
  ): Promise<void> {
    try {
      await supabase
        .from('training_history')
        .insert({
          document_id: documentId,
          action,
          changes: changes || null
        })
    } catch (error) {
      console.error('⚠️ Erro ao registrar histórico:', error)
    }
  }

  /**
   * Buscar histórico de treinamento
   */
  async getTrainingHistory(limit: number = 50): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('training_history')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('❌ Erro ao buscar histórico:', error)
      return []
    }
  }

  // ===========================================================================
  // 🔍 BUSCA CONTEXTUAL INTEGRADA
  // ===========================================================================

  /**
   * Busca integrada em todas as fontes de conhecimento
   */
  async getIntegratedContext(userMessage: string): Promise<any> {
    try {
      console.log(`🔍 Buscando contexto integrado para: "${userMessage}"`)
      
      const { data, error } = await supabase
        .rpc('get_integrated_context', {
          user_message: userMessage,
          limit_results: 5
        })

      if (error) {
        console.warn('⚠️ Busca integrada falhou, usando fallback...')
        // Fallback: buscar separadamente
        const docs = await this.searchDocuments(userMessage)
        return {
          documents: docs.slice(0, 5),
          learnings: [],
          prompts: [],
          total_results: docs.length
        }
      }
      
      console.log(`✅ Contexto encontrado: ${data?.total_results || 0} resultados`)
      return data
    } catch (error) {
      console.error('❌ Erro na busca integrada:', error)
      return {
        documents: [],
        learnings: [],
        prompts: [],
        total_results: 0
      }
    }
  }
}

// Exportar instância única
export const gptBuilderService = new GPTBuilderService()

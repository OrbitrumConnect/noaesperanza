// 🧠 SERVIÇO GPT BUILDER - GERENCIAMENTO DA BASE DE CONHECIMENTO
// Gerencia documentos mestres, configurações da Nôa e reconhecimento de usuários

import { supabase } from '../integrations/supabase/client'

export interface DocumentMaster {
  id: string
  title: string
  content: string
  type: 'personality' | 'knowledge' | 'instructions' | 'examples' | 'development-milestone'
  category: string
  is_active: boolean
  created_at: string
  updated_at: string
  created_by?: string
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
  }
}

export interface UserRecognition {
  id: string
  user_id: string
  name: string
  role: string
  specialization?: string
  greeting_template?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface MasterPrompt {
  id: string
  name: string
  prompt: string
  category: string
  priority: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export class GPTBuilderService {
  // 📚 GERENCIAMENTO DE DOCUMENTOS MESTRES

  // Buscar todos os documentos
  async getDocuments(): Promise<DocumentMaster[]> {
    try {
      const { data, error } = await supabase
        .from('documentos_mestres')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Erro ao buscar documentos:', error)
      throw error
    }
  }

  // Buscar documentos por tipo
  async getDocumentsByType(type: string): Promise<DocumentMaster[]> {
    try {
      const { data, error } = await supabase
        .from('documentos_mestres')
        .select('*')
        .eq('type', type)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Erro ao buscar documentos por tipo:', error)
      throw error
    }
  }

  // Criar novo documento
  async createDocument(
    document: Omit<DocumentMaster, 'id' | 'created_at' | 'updated_at'>
  ): Promise<DocumentMaster> {
    try {
      const { data, error } = await supabase
        .from('documentos_mestres')
        .insert({
          ...document,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Erro ao criar documento:', error)
      throw error
    }
  }

  // Atualizar documento
  async updateDocument(id: string, updates: Partial<DocumentMaster>): Promise<DocumentMaster> {
    try {
      const { data, error } = await supabase
        .from('documentos_mestres')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Erro ao atualizar documento:', error)
      throw error
    }
  }

  // Deletar documento (soft delete)
  async deleteDocument(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('documentos_mestres')
        .update({ is_active: false })
        .eq('id', id)

      if (error) throw error
    } catch (error) {
      console.error('Erro ao deletar documento:', error)
      throw error
    }
  }

  // 🔧 CONFIGURAÇÃO DA NÔA

  // Obter configuração atual da Nôa
  async getNoaConfig(): Promise<NoaConfig> {
    try {
      const { data, error } = await supabase
        .from('noa_config')
        .select('config')
        .eq('id', 'main')
        .single()

      if (error) {
        // 403 (RLS) ou 406 (preferência de cabeçalho) → usar defaults silenciosamente
        // @ts-ignore - alguns drivers expõem .code
        const code = (error as any)?.code
        if (code === 'PGRST116' || code === 'PGRST301' || code === '42501') {
          return {
            personality: '',
            greeting: '',
            expertise: '',
            tone: 'professional',
            recognition: {
              drRicardoValenca: true,
              autoGreeting: true,
              personalizedResponse: true,
            },
          }
        }
        throw error
      }
      return (
        data?.config || {
          personality: '',
          greeting: '',
          expertise: '',
          tone: 'professional',
          recognition: {
            drRicardoValenca: false,
            autoGreeting: false,
            personalizedResponse: false,
          },
        }
      )
    } catch (error) {
      console.error('Erro ao obter configuração da Nôa:', error)
      // Fallback final – mantém app funcional
      return {
        personality: '',
        greeting: '',
        expertise: '',
        tone: 'professional',
        recognition: {
          drRicardoValenca: true,
          autoGreeting: true,
          personalizedResponse: true,
        },
      }
    }
  }

  // Salvar configuração da Nôa
  async saveNoaConfig(config: NoaConfig): Promise<void> {
    try {
      const { error } = await supabase.from('noa_config').upsert({
        id: 'main',
        config,
        updated_at: new Date().toISOString(),
      })

      if (error) throw error
    } catch (error) {
      console.error('Erro ao salvar configuração da Nôa:', error)
      throw error
    }
  }

  // 👤 RECONHECIMENTO DE USUÁRIOS

  // Buscar usuário por email
  async recognizeUser(email: string): Promise<UserRecognition | null> {
    try {
      const { data, error } = await supabase
        .from('user_recognition')
        .select(
          `
          *,
          auth.users!inner(email)
        `
        )
        .eq('auth.users.email', email)
        .eq('is_active', true)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      if (!data || typeof data !== 'object' || 'error' in data) {
        return null
      }
      return data as UserRecognition
    } catch (error) {
      console.error('Erro ao reconhecer usuário:', error)
      throw error
    }
  }

  // Adicionar/atualizar reconhecimento de usuário
  async upsertUserRecognition(recognition: Partial<UserRecognition>): Promise<UserRecognition> {
    try {
      const { data, error } = await supabase
        .from('user_recognition')
        .upsert({
          ...recognition,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Erro ao salvar reconhecimento de usuário:', error)
      throw error
    }
  }

  // 📝 PROMPTS MESTRES

  // Buscar prompts mestres
  async getMasterPrompts(): Promise<MasterPrompt[]> {
    try {
      const { data, error } = await supabase
        .from('master_prompts')
        .select('*')
        .eq('is_active', true)
        .order('priority', { ascending: true })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Erro ao buscar prompts mestres:', error)
      throw error
    }
  }

  // Criar prompt mestre
  async createMasterPrompt(
    prompt: Omit<MasterPrompt, 'id' | 'created_at' | 'updated_at'>
  ): Promise<MasterPrompt> {
    try {
      const { data, error } = await supabase
        .from('master_prompts')
        .insert({
          ...prompt,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Erro ao criar prompt mestre:', error)
      throw error
    }
  }

  // 📊 ESTATÍSTICAS E RELATÓRIOS

  // Obter estatísticas da base de conhecimento
  async getKnowledgeStats(): Promise<{
    totalDocuments: number
    documentsByType: Record<string, number>
    totalPrompts: number
    lastUpdate: string
  }> {
    try {
      const [documents, prompts] = await Promise.all([this.getDocuments(), this.getMasterPrompts()])

      const documentsByType = documents.reduce(
        (acc, doc) => {
          acc[doc.type] = (acc[doc.type] || 0) + 1
          return acc
        },
        {} as Record<string, number>
      )

      const lastUpdate =
        documents.length > 0
          ? documents.reduce(
              (latest, doc) =>
                new Date(doc.updated_at) > new Date(latest) ? doc.updated_at : latest,
              documents[0].updated_at
            )
          : new Date().toISOString()

      return {
        totalDocuments: documents.filter(d => d.is_active).length,
        documentsByType,
        totalPrompts: prompts.length,
        lastUpdate,
      }
    } catch (error) {
      console.error('Erro ao obter estatísticas:', error)
      throw error
    }
  }

  // 🔍 BUSCA INTELIGENTE

  // Buscar documentos por conteúdo
  async searchDocuments(query: string): Promise<DocumentMaster[]> {
    try {
      console.log('🔍 Buscando documentos com query:', query)

      // Sanitizar query para evitar problemas com caracteres especiais
      const sanitizedQuery = query
        .replace(/[%_\\]/g, '\\$&')
        .replace(/[#🌟📋📊🏗️🧠🎯🖥️🧩🗄️🔧🎊]/g, '') // Remove emojis e caracteres especiais
        .substring(0, 100) // Limita o tamanho da query

      const { data, error } = await supabase
        .from('documentos_mestres')
        .select('*')
        .or(
          `title.ilike.%${sanitizedQuery}%,content.ilike.%${sanitizedQuery}%,category.ilike.%${sanitizedQuery}%`
        )
        .eq('is_active', true)
        .order('updated_at', { ascending: false })

      if (error) {
        console.error('Erro ao buscar documentos:', error)
        // Fallback: buscar todos os documentos se a busca falhar
        const { data: fallbackData } = await supabase
          .from('documentos_mestres')
          .select('*')
          .eq('is_active', true)
          .order('updated_at', { ascending: false })
          .limit(10)

        return fallbackData || []
      }

      return data || []
    } catch (error) {
      console.error('Erro ao buscar documentos:', error)
      return []
    }
  }

  // 🎯 GERAR PROMPT CONTEXTUAL

  // Gerar prompt contextual baseado nos documentos mestres
  async generateContextualPrompt(context: string, userType?: string): Promise<string> {
    try {
      const [config, documents, prompts] = await Promise.all([
        this.getNoaConfig(),
        this.getDocuments(),
        this.getMasterPrompts(),
      ])

      let contextualPrompt = `Você é Nôa Esperanza, assistente médica especializada.`

      // Adicionar personalidade
      if (config.personality) {
        contextualPrompt += `\n\nPERSONALIDADE:\n${config.personality}`
      }

      // Adicionar especialização
      if (config.expertise) {
        contextualPrompt += `\n\nESPECIALIZAÇÃO:\n${config.expertise}`
      }

      // Adicionar contexto específico
      if (context) {
        const relevantDocs = documents.filter(
          doc =>
            doc.content.toLowerCase().includes(context.toLowerCase()) ||
            doc.title.toLowerCase().includes(context.toLowerCase())
        )

        if (relevantDocs.length > 0) {
          contextualPrompt += `\n\nCONTEXTO RELEVANTE:\n`
          relevantDocs.slice(0, 3).forEach(doc => {
            contextualPrompt += `${doc.title}: ${doc.content.substring(0, 200)}...\n`
          })
        }
      }

      // Adicionar prompts mestres relevantes
      const relevantPrompts = prompts.filter(p => p.category === context || p.priority === 1)

      if (relevantPrompts.length > 0) {
        contextualPrompt += `\n\nINSTRUÇÕES ESPECÍFICAS:\n`
        relevantPrompts.forEach(prompt => {
          contextualPrompt += `${prompt.prompt}\n`
        })
      }

      return contextualPrompt
    } catch (error) {
      console.error('Erro ao gerar prompt contextual:', error)
      throw error
    }
  }

  // 🔄 SINCRONIZAÇÃO COM SISTEMA DE IA

  // Sincronizar documentos com o sistema de aprendizados
  async syncWithAILearning(): Promise<void> {
    try {
      const documents = await this.getDocuments()
      const knowledgeDocs = documents.filter(doc => doc.type === 'knowledge' && doc.is_active)

      // Converter documentos mestres em aprendizados
      for (const doc of knowledgeDocs) {
        const learningData = {
          keyword: doc.title.toLowerCase(),
          context: doc.category,
          user_message: `Informação sobre ${doc.title}`,
          ai_response: doc.content,
          category: doc.category,
          confidence_score: 0.9,
          usage_count: 0,
        }

        // Verificar se já existe
        const { data: existing } = await supabase
          .from('ai_learning')
          .select('id')
          .eq('keyword', learningData.keyword)
          .single()

        if (!existing) {
          await supabase.from('ai_learning').insert(learningData)
        }
      }

      console.log('✅ Sincronização com IA Learning concluída')
    } catch (error) {
      console.error('Erro na sincronização com IA Learning:', error)
      throw error
    }
  }
}

// Instância global do serviço
export const gptBuilderService = new GPTBuilderService()

// 🌀 GPT BUILDER V2 - ENRIQUECIMENTO COM GRAMÁTICA NOA
// Enriquece mensagem com metodologia da Arte da Entrevista Clínica
export function enrichWithNoaGrammar(message: string, docs: any[], context: string = '') {
  const baseInstructions = `
Você é Nôa Esperanza, assistente clínica e simbólica. Sua missão é escutar profundamente, organizar o raciocínio clínico com empatia e precisão, e responder com base nos documentos abaixo e na metodologia da Arte da Entrevista Clínica.

Nunca dê respostas genéricas. Cada palavra deve respeitar o que foi dito pelo usuário e o que está documentado.

Método de resposta:
1. Nomear o que foi trazido (escuta ativa).
2. Relacionar com a base documental.
3. Responder com empatia e linguagem acessível.

Documentos relevantes:
${docs.map((d, i) => `(${i + 1}) ${d.content}`).join('\n\n')}

Histórico simbólico do usuário:
${context}

Mensagem do usuário:
${message}
`
  return baseInstructions
}

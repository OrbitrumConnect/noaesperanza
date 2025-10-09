// 🧩 GPT MODULES SERVICE - Dr. Ricardo Valença
// Sistema de módulos GPT por função

import { supabase } from '../integrations/supabase/client'
import { activeContextService } from './activeContextService'

export interface GPTModule {
  id: string
  name: string
  function: string
  description: string
  documents: string[]
  tags: string[]
  promptTemplate: string
  isActive: boolean
  createdAt: Date
  lastUpdated: Date
}

export interface ModuleProfile {
  nome: string
  função: string
  documentos: string[]
  personalidade: string
  especialidades: string[]
  estiloComunicacao: string
}

export class GPTModulesService {
  
  // 🧩 CRIAR MÓDULO GPT
  async createGPTModule(profile: ModuleProfile): Promise<GPTModule> {
    const module: GPTModule = {
      id: `module_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: profile.nome,
      function: profile.função,
      description: `Módulo ${profile.nome} especializado em ${profile.função}`,
      documents: profile.documentos,
      tags: this.generateTagsFromProfile(profile),
      promptTemplate: this.generatePromptTemplate(profile),
      isActive: true,
      createdAt: new Date(),
      lastUpdated: new Date()
    }
    
    // Salvar no banco
    await this.saveModuleToDatabase(module)
    
    console.log('🧩 Módulo GPT criado:', profile.nome)
    return module
  }
  
  // 🎯 ATIVAR MÓDULO ESPECÍFICO
  async activateModule(moduleId: string): Promise<void> {
    try {
      // Desativar todos os módulos
      await supabase
        .from('gpt_modules')
        .update({ is_active: false })
        .eq('user_id', 'dr-ricardo-valenca')
      
      // Ativar módulo específico
      await supabase
        .from('gpt_modules')
        .update({ is_active: true, last_updated: new Date().toISOString() })
        .eq('id', moduleId)
      
      console.log('🎯 Módulo ativado:', moduleId)
    } catch (error) {
      console.error('Erro ao ativar módulo:', error)
    }
  }
  
  // 📋 OBTER MÓDULOS DISPONÍVEIS
  async getAvailableModules(): Promise<GPTModule[]> {
    try {
      const { data } = await supabase
        .from('gpt_modules')
        .select('*')
        .eq('user_id', 'dr-ricardo-valenca')
        .order('created_at', { ascending: false })
      
      return data?.map(this.mapDatabaseToModule) || []
    } catch (error) {
      console.error('Erro ao buscar módulos:', error)
      return []
    }
  }
  
  // 🔍 OBTER MÓDULO ATIVO
  async getActiveModule(): Promise<GPTModule | null> {
    try {
      const { data } = await supabase
        .from('gpt_modules')
        .select('*')
        .eq('user_id', 'dr-ricardo-valenca')
        .eq('is_active', true)
        .single()
      
      return data ? this.mapDatabaseToModule(data) : null
    } catch (error) {
      console.error('Erro ao buscar módulo ativo:', error)
      return null
    }
  }
  
  // 🔄 APLICAR DOCUMENTO AO MÓDULO
  async applyDocumentToModule(docId: string, moduleId?: string): Promise<void> {
    try {
      const activeModule = moduleId ? 
        await this.getModuleById(moduleId) : 
        await this.getActiveModule()
      
      if (!activeModule) {
        console.error('Nenhum módulo ativo encontrado')
        return
      }
      
      // Buscar documento
      const { data: document } = await supabase
        .from('documentos_mestres')
        .select('*')
        .eq('id', docId)
        .single()
      
      if (!document) {
        console.error('Documento não encontrado')
        return
      }
      
      // Atualizar módulo com novo documento
      const updatedDocuments = [...activeModule.documents, document.title]
      await supabase
        .from('gpt_modules')
        .update({ 
          documents: updatedDocuments,
          last_updated: new Date().toISOString()
        })
        .eq('id', activeModule.id)
      
      console.log('🔄 Documento aplicado ao módulo:', document.title)
    } catch (error) {
      console.error('Erro ao aplicar documento ao módulo:', error)
    }
  }
  
  // 🎨 GERAR TEMPLATE DE PROMPT
  private generatePromptTemplate(profile: ModuleProfile): string {
    return `
Você é ${profile.nome}, um módulo especializado da Nôa Esperanza.

**FUNÇÃO:** ${profile.função}

**PERSONALIDADE:** ${profile.personalidade}

**ESPECIALIDADES:**
${profile.especialidades.map(esp => `• ${esp}`).join('\n')}

**ESTILO DE COMUNICAÇÃO:** ${profile.estiloComunicacao}

**DOCUMENTOS DE REFERÊNCIA:**
${profile.documentos.map(doc => `• ${doc}`).join('\n')}

**INSTRUÇÕES:**
- Mantenha o tom e estilo da Nôa Esperanza
- Use seus conhecimentos especializados
- Seja preciso e útil em sua área
- Integre escuta clínica e ética quando apropriado
- Evolua com cada interação
`
  }
  
  // 🏷️ GERAR TAGS DO PERFIL
  private generateTagsFromProfile(profile: ModuleProfile): string[] {
    const tags = ['gpt', 'modulo', profile.função.toLowerCase()]
    
    // Adicionar tags baseadas nas especialidades
    profile.especialidades.forEach(esp => {
      tags.push(esp.toLowerCase().replace(/\s+/g, '-'))
    })
    
    return tags
  }
  
  // 📊 MAPEAR DADOS DO BANCO
  private mapDatabaseToModule(data: any): GPTModule {
    return {
      id: data.id,
      name: data.name,
      function: data.function,
      description: data.description,
      documents: data.documents || [],
      tags: data.tags || [],
      promptTemplate: data.prompt_template,
      isActive: data.is_active,
      createdAt: new Date(data.created_at),
      lastUpdated: new Date(data.last_updated)
    }
  }
  
  // 🔍 OBTER MÓDULO POR ID
  private async getModuleById(moduleId: string): Promise<GPTModule | null> {
    try {
      const { data } = await supabase
        .from('gpt_modules')
        .select('*')
        .eq('id', moduleId)
        .single()
      
      return data ? this.mapDatabaseToModule(data) : null
    } catch (error) {
      console.error('Erro ao buscar módulo por ID:', error)
      return null
    }
  }
  
  // 💾 SALVAR MÓDULO NO BANCO
  private async saveModuleToDatabase(module: GPTModule): Promise<void> {
    try {
      await supabase
        .from('gpt_modules')
        .insert({
          id: module.id,
          name: module.name,
          function: module.function,
          description: module.description,
          documents: module.documents,
          tags: module.tags,
          prompt_template: module.promptTemplate,
          is_active: module.isActive,
          user_id: 'dr-ricardo-valenca',
          created_at: module.createdAt.toISOString(),
          last_updated: module.lastUpdated.toISOString()
        })
    } catch (error) {
      console.error('Erro ao salvar módulo no banco:', error)
    }
  }
  
  // 🚀 INICIALIZAR MÓDULOS PADRÃO
  async initializeDefaultModules(): Promise<void> {
    const defaultModules: ModuleProfile[] = [
      {
        nome: "GPT Clínico",
        função: "Realiza triagens e escuta ativa",
        documentos: ["Avaliação Inicial", "Análise Clínica", "Curso Arte da Entrevista"],
        personalidade: "Empática, precisa, focada no bem-estar do paciente",
        especialidades: ["Triagem médica", "Escuta ativa", "Avaliação clínica"],
        estiloComunicacao: "Profissional, acolhedor, baseado em evidências"
      },
      {
        nome: "GPT Pedagógico",
        função: "Educação médica e treinamento",
        documentos: ["Curso Arte da Entrevista", "Metodologias Educacionais"],
        personalidade: "Didática, motivadora, adaptável aos diferentes níveis",
        especialidades: ["Educação médica", "Treinamento clínico", "Desenvolvimento de competências"],
        estiloComunicacao: "Clara, estruturada, encorajadora"
      },
      {
        nome: "GPT Narrativo",
        função: "Análise de histórias clínicas e relatos",
        documentos: ["Casos Clínicos", "Relatos de Pacientes"],
        personalidade: "Analítica, empática, focada na narrativa humana",
        especialidades: ["Análise narrativa", "Histórias clínicas", "Compreensão do contexto"],
        estiloComunicacao: "Reflexiva, detalhada, humanizada"
      },
      {
        nome: "GPT Técnico",
        função: "Análise de dados e metodologias",
        documentos: ["Protocolos de Pesquisa", "Análises Estatísticas"],
        personalidade: "Precisa, sistemática, baseada em evidências",
        especialidades: ["Análise de dados", "Metodologia científica", "Protocolos clínicos"],
        estiloComunicacao: "Técnica, objetiva, fundamentada"
      }
    ]
    
    for (const profile of defaultModules) {
      await this.createGPTModule(profile)
    }
    
    console.log('🚀 Módulos padrão inicializados')
  }
}

export const gptModulesService = new GPTModulesService()

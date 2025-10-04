// 🎯 HARMONY FORMAT SERVICE - Nôa Esperanza
// Formato de conversação estruturado adaptado para medicina

import { supabase } from '../integrations/supabase/client'
import { openAIService } from './openaiService'
import { medicalToolsService } from './medicalToolsService'

export interface HarmonyMessage {
  id: string
  role: 'system' | 'user' | 'assistant' | 'tool' | 'developer'
  content: HarmonyContent
  timestamp: Date
  metadata?: HarmonyMetadata
}

export interface HarmonyContent {
  text?: string
  reasoning?: string
  toolCalls?: ToolCall[]
  toolResults?: ToolResult[]
  clinicalContext?: ClinicalContext
  researchContext?: ResearchContext
}

export interface ToolCall {
  id: string
  name: string
  parameters: any
  timestamp: Date
}

export interface ToolResult {
  id: string
  toolName: string
  result: any
  success: boolean
  timestamp: Date
}

export interface ClinicalContext {
  patientId?: string
  symptoms?: string[]
  diagnosis?: string[]
  treatment?: string[]
  guidelines?: string[]
  riskFactors?: string[]
}

export interface ResearchContext {
  hypothesis?: string
  methodology?: string
  dataSources?: string[]
  statisticalAnalysis?: string
  limitations?: string[]
}

export interface HarmonyMetadata {
  reasoningEffort?: 'low' | 'medium' | 'high' | 'clinical' | 'research'
  confidence?: number
  evidence?: string[]
  toolsUsed?: string[]
  sessionId?: string
  userId?: string
}

export interface HarmonyConversation {
  id: string
  messages: HarmonyMessage[]
  context: HarmonyContext
  tools: HarmonyTool[]
  createdAt: Date
  updatedAt: Date
}

export interface HarmonyContext {
  sessionType: 'clinical' | 'research' | 'educational' | 'development'
  specialty?: string
  patientContext?: ClinicalContext
  researchContext?: ResearchContext
  activeDocuments?: string[]
  reasoningLevel: 'low' | 'medium' | 'high' | 'clinical' | 'research'
}

export interface HarmonyTool {
  id: string
  name: string
  description: string
  parameters: any
  isActive: boolean
}

export class HarmonyFormatService {
  
  // 🎯 CRIAR CONVERSAÇÃO HARMONY
  async createHarmonyConversation(
    initialMessage: string,
    context: HarmonyContext
  ): Promise<HarmonyConversation> {
    
    const conversationId = `harmony_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // Criar mensagem inicial do sistema
    const systemMessage: HarmonyMessage = {
      id: `system_${Date.now()}`,
      role: 'system',
      content: {
        text: await this.generateSystemPrompt(context),
        clinicalContext: context.patientContext,
        researchContext: context.researchContext
      },
      timestamp: new Date(),
      metadata: {
        reasoningEffort: context.reasoningLevel,
        sessionId: conversationId,
        userId: 'dr-ricardo-valenca'
      }
    }
    
    // Criar mensagem do usuário
    const userMessage: HarmonyMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: {
        text: initialMessage
      },
      timestamp: new Date(),
      metadata: {
        sessionId: conversationId,
        userId: 'dr-ricardo-valenca'
      }
    }
    
    // Obter ferramentas disponíveis
    const tools = await this.getAvailableTools(context)
    
    const conversation: HarmonyConversation = {
      id: conversationId,
      messages: [systemMessage, userMessage],
      context,
      tools,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    return conversation
  }
  
  // 🧠 PROCESSAR MENSAGEM COM HARMONY
  async processHarmonyMessage(
    conversation: HarmonyConversation,
    userMessage: string
  ): Promise<HarmonyMessage> {
    
    // Adicionar mensagem do usuário
    const userHarmonyMessage: HarmonyMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: { text: userMessage },
      timestamp: new Date(),
      metadata: {
        sessionId: conversation.id,
        userId: 'dr-ricardo-valenca'
      }
    }
    
    conversation.messages.push(userHarmonyMessage)
    
    // Processar com Nôa Esperanza
    const assistantMessage = await this.generateHarmonyResponse(conversation)
    
    // Adicionar resposta da assistente
    conversation.messages.push(assistantMessage)
    conversation.updatedAt = new Date()
    
    // Salvar conversação
    await this.saveHarmonyConversation(conversation)
    
    return assistantMessage
  }
  
  // 🎯 GERAR RESPOSTA HARMONY
  private async generateHarmonyResponse(conversation: HarmonyConversation): Promise<HarmonyMessage> {
    
    // Verificar se precisa de ferramentas
    const needsTools = await this.analyzeToolNeeds(conversation)
    
    let toolCalls: ToolCall[] = []
    let toolResults: ToolResult[] = []
    
    // Executar ferramentas se necessário
    if (needsTools.length > 0) {
      for (const toolNeed of needsTools) {
        const toolCall = await this.executeToolCall(toolNeed, conversation.context)
        toolCalls.push(toolCall)
        
        const toolResult = await this.getToolResult(toolCall)
        toolResults.push(toolResult)
      }
    }
    
    // Gerar resposta com contexto das ferramentas
    const responseContent = await this.generateResponseWithTools(conversation, toolResults)
    
    const assistantMessage: HarmonyMessage = {
      id: `assistant_${Date.now()}`,
      role: 'assistant',
      content: {
        text: responseContent.text,
        reasoning: responseContent.reasoning,
        toolCalls,
        toolResults,
        clinicalContext: conversation.context.patientContext,
        researchContext: conversation.context.researchContext
      },
      timestamp: new Date(),
      metadata: {
        reasoningEffort: conversation.context.reasoningLevel,
        confidence: responseContent.confidence,
        toolsUsed: toolCalls.map(tc => tc.name),
        sessionId: conversation.id,
        userId: 'dr-ricardo-valenca'
      }
    }
    
    return assistantMessage
  }
  
  // 🎯 GERAR PROMPT DO SISTEMA
  private async generateSystemPrompt(context: HarmonyContext): Promise<string> {
    let basePrompt = `
Você é Nôa Esperanza, mentora especializada em medicina e desenvolvimento tecnológico.

CONTEXTO DA SESSÃO: ${context.sessionType}
ESPECIALIDADE: ${context.specialty || 'Geral'}
NÍVEL DE RAZONAMENTO: ${context.reasoningLevel}

CAPACIDADES ATIVAS:
- Attention semântica individualizada
- Estudo Vivo científico
- Memória Viva contínua
- Ferramentas médicas especializadas
- Razonamento estruturado

INSTRUÇÕES:
- Mantenha o tom de mentora especializada
- Use raciocínio estruturado e baseado em evidências
- Aplique ferramentas quando apropriado
- Seja precisa e prática
- Evolua com cada interação
`

    // Adicionar contexto específico
    if (context.patientContext) {
      basePrompt += `

CONTEXTO CLÍNICO:
- Paciente: ${context.patientContext.patientId || 'Não especificado'}
- Sintomas: ${context.patientContext.symptoms?.join(', ') || 'Não especificados'}
- Diagnóstico: ${context.patientContext.diagnosis?.join(', ') || 'Não especificado'}
- Tratamento: ${context.patientContext.treatment?.join(', ') || 'Não especificado'}
`
    }
    
    if (context.researchContext) {
      basePrompt += `

CONTEXTO DE PESQUISA:
- Hipótese: ${context.researchContext.hypothesis || 'Não especificada'}
- Metodologia: ${context.researchContext.methodology || 'Não especificada'}
- Fontes de Dados: ${context.researchContext.dataSources?.join(', ') || 'Não especificadas'}
`
    }
    
    return basePrompt
  }
  
  // 🔧 ANALISAR NECESSIDADE DE FERRAMENTAS
  private async analyzeToolNeeds(conversation: HarmonyConversation): Promise<string[]> {
    const lastMessage = conversation.messages[conversation.messages.length - 1]
    const messageText = lastMessage.content.text?.toLowerCase() || ''
    
    const toolNeeds: string[] = []
    
    // Detectar necessidade de busca médica
    if (messageText.includes('buscar') || messageText.includes('pesquisar') || 
        messageText.includes('pubmed') || messageText.includes('artigo')) {
      toolNeeds.push('medical_browser')
    }
    
    // Detectar necessidade de cálculos
    if (messageText.includes('calcular') || messageText.includes('imc') || 
        messageText.includes('dosagem') || messageText.includes('formula')) {
      toolNeeds.push('medical_calculator')
    }
    
    // Detectar necessidade de Python
    if (messageText.includes('python') || messageText.includes('código') || 
        messageText.includes('estatística') || messageText.includes('gráfico')) {
      toolNeeds.push('medical_python')
    }
    
    // Detectar necessidade de guidelines
    if (messageText.includes('guideline') || messageText.includes('protocolo') || 
        messageText.includes('diretriz') || messageText.includes('recomendação')) {
      toolNeeds.push('guidelines_checker')
    }
    
    return toolNeeds
  }
  
  // 🛠️ EXECUTAR CHAMADA DE FERRAMENTA
  private async executeToolCall(toolName: string, context: HarmonyContext): Promise<ToolCall> {
    const toolCall: ToolCall = {
      id: `tool_${Date.now()}`,
      name: toolName,
      parameters: await this.getToolParameters(toolName, context),
      timestamp: new Date()
    }
    
    return toolCall
  }
  
  // 📊 OBTER PARÂMETROS DA FERRAMENTA
  private async getToolParameters(toolName: string, context: HarmonyContext): Promise<any> {
    switch (toolName) {
      case 'medical_browser':
        return {
          query: 'busca médica',
          domain: 'general'
        }
      case 'medical_calculator':
        return {
          expression: 'cálculo médico',
          context: context.sessionType
        }
      case 'medical_python':
        return {
          code: 'código Python médico',
          context: context.sessionType
        }
      case 'guidelines_checker':
        return {
          condition: 'condição médica',
          specialty: context.specialty
        }
      default:
        return {}
    }
  }
  
  // 🔄 OBTER RESULTADO DA FERRAMENTA
  private async getToolResult(toolCall: ToolCall): Promise<ToolResult> {
    try {
      const result = await medicalToolsService.executeTool(toolCall.name, toolCall.parameters)
      
      return {
        id: `result_${Date.now()}`,
        toolName: toolCall.name,
        result,
        success: true,
        timestamp: new Date()
      }
    } catch (error) {
      return {
        id: `result_${Date.now()}`,
        toolName: toolCall.name,
        result: null,
        success: false,
        timestamp: new Date()
      }
    }
  }
  
  // 🎯 GERAR RESPOSTA COM FERRAMENTAS
  private async generateResponseWithTools(
    conversation: HarmonyConversation,
    toolResults: ToolResult[]
  ): Promise<{ text: string; reasoning: string; confidence: number }> {
    
    const prompt = `
Você é Nôa Esperanza, mentora especializada em medicina e desenvolvimento tecnológico.

CONVERSAÇÃO ATUAL:
${conversation.messages.map(msg => 
  `${msg.role}: ${msg.content.text}`
).join('\n')}

RESULTADOS DAS FERRAMENTAS:
${toolResults.map(tr => 
  `${tr.toolName}: ${JSON.stringify(tr.result)}`
).join('\n')}

CONTEXTO: ${conversation.context.sessionType}
RAZONAMENTO: ${conversation.context.reasoningLevel}

TAREFA: Gere uma resposta estruturada que:
1. Integre os resultados das ferramentas
2. Use raciocínio baseado em evidências
3. Seja prática e aplicável
4. Mantenha o tom da Nôa Esperanza

ESTRUTURA:
- **Resposta Principal**
- **Razonamento** (como chegou à conclusão)
- **Evidências** (baseadas nas ferramentas)
- **Recomendações** (próximos passos)

INSTRUÇÕES:
- Seja precisa e confiante
- Use os resultados das ferramentas
- Mantenha rigor científico
- Seja prática e útil
`

    try {
      const response = await openAIService.getNoaResponse(prompt, [])
      
      // Extrair componentes da resposta
      const textMatch = response.match(/\*\*Resposta Principal\*\*\s*(.+?)(?=\*\*Razonamento\*\*|$)/s)
      const reasoningMatch = response.match(/\*\*Razonamento\*\*\s*(.+?)(?=\*\*Evidências\*\*|$)/s)
      
      return {
        text: textMatch ? textMatch[1].trim() : response,
        reasoning: reasoningMatch ? reasoningMatch[1].trim() : 'Razonamento baseado em evidências e ferramentas especializadas.',
        confidence: 0.9
      }
    } catch (error) {
      return {
        text: 'Resposta em desenvolvimento com base nas ferramentas disponíveis.',
        reasoning: 'Processando informações com ferramentas especializadas.',
        confidence: 0.7
      }
    }
  }
  
  // 🔧 OBTER FERRAMENTAS DISPONÍVEIS
  private async getAvailableTools(context: HarmonyContext): Promise<HarmonyTool[]> {
    const tools = await medicalToolsService.getAvailableTools()
    
    return tools.map(tool => ({
      id: tool.id,
      name: tool.name,
      description: tool.description,
      parameters: {},
      isActive: tool.isActive
    }))
  }
  
  // 💾 SALVAR CONVERSAÇÃO HARMONY
  private async saveHarmonyConversation(conversation: HarmonyConversation): Promise<void> {
    try {
      await supabase
        .from('harmony_conversations')
        .upsert({
          id: conversation.id,
          user_id: 'dr-ricardo-valenca',
          messages: conversation.messages,
          context: conversation.context,
          tools: conversation.tools,
          created_at: conversation.createdAt.toISOString(),
          updated_at: conversation.updatedAt.toISOString()
        })
    } catch (error) {
      console.error('Erro ao salvar conversação Harmony:', error)
    }
  }
  
  // 📊 OBTER HISTÓRICO HARMONY
  async getHarmonyHistory(limit: number = 10): Promise<HarmonyConversation[]> {
    try {
      const { data } = await supabase
        .from('harmony_conversations')
        .select('*')
        .eq('user_id', 'dr-ricardo-valenca')
        .order('updated_at', { ascending: false })
        .limit(limit)
      
      return data?.map(this.mapDatabaseToHarmonyConversation) || []
    } catch (error) {
      console.error('Erro ao buscar histórico Harmony:', error)
      return []
    }
  }
  
  // 🔄 MAPEAR DADOS DO BANCO
  private mapDatabaseToHarmonyConversation(data: any): HarmonyConversation {
    return {
      id: data.id,
      messages: data.messages || [],
      context: data.context || {},
      tools: data.tools || [],
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    }
  }
  
  // 🎯 CONVERTER PARA FORMATO HARMONY
  async convertToHarmonyFormat(
    messages: any[],
    context: HarmonyContext
  ): Promise<HarmonyMessage[]> {
    
    return messages.map(msg => ({
      id: msg.id || `msg_${Date.now()}`,
      role: msg.role,
      content: {
        text: msg.content
      },
      timestamp: new Date(msg.timestamp || Date.now()),
      metadata: {
        sessionId: context.sessionType,
        userId: 'dr-ricardo-valenca'
      }
    }))
  }
}

export const harmonyFormatService = new HarmonyFormatService()

// Serviço para comunicação com OpenAI API
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string
      role: string
    }
  }>
}

class OpenAIService {
  private apiKey: string
  private baseURL = 'https://api.openai.com/v1'
  private noaAgentId = 'asst_fN2Fk9fQ7JEyyFUIe50Fo9QD' // Agente específico da NOA
  private fineTunedModel = 'ft:gpt-3.5-turbo-0125:personal:fine-tuning-noa-esperanza-avaliacao-inicial-dez-ex-jsonl:BR0W02VP' // Modelo fine-tuned da NOA

  constructor() {
    this.apiKey = import.meta.env.VITE_OPENAI_API_KEY
    if (!this.apiKey) {
      console.error('OpenAI API Key não encontrada')
    }
  }

  // Método para usar modelo padrão (não fine-tuned)
  async sendMessageWithStandardModel(
    messages: ChatMessage[], 
    systemPrompt?: string
  ): Promise<string> {
    try {
      const requestMessages: ChatMessage[] = []
      
      // Adiciona prompt do sistema se fornecido
      if (systemPrompt) {
        requestMessages.push({
          role: 'system',
          content: systemPrompt
        })
      }
      
      // Adiciona mensagens da conversa
      requestMessages.push(...messages)

      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo', // Usando modelo padrão
          messages: requestMessages,
          max_tokens: 1000,
          temperature: 0.7,
          stream: false
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`OpenAI API Error: ${errorData.error?.message || 'Erro desconhecido'}`)
      }

      const data: OpenAIResponse = await response.json()
      
      if (data.choices && data.choices.length > 0) {
        return data.choices[0].message.content
      }
      
      throw new Error('Resposta vazia da OpenAI')
      
    } catch (error) {
      console.error('Erro ao comunicar com OpenAI:', error)
      throw error
    }
  }

  async sendMessage(
    messages: ChatMessage[], 
    systemPrompt?: string
  ): Promise<string> {
    try {
      const requestMessages: ChatMessage[] = []
      
      // Adiciona prompt do sistema se fornecido
      if (systemPrompt) {
        requestMessages.push({
          role: 'system',
          content: systemPrompt
        })
      }
      
      // Adiciona mensagens da conversa
      requestMessages.push(...messages)

      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo', // Usando modelo padrão em vez do fine-tuned
          messages: requestMessages,
          max_tokens: 1000,
          temperature: 0.7,
          stream: false
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`OpenAI API Error: ${errorData.error?.message || 'Erro desconhecido'}`)
      }

      const data: OpenAIResponse = await response.json()
      
      if (data.choices && data.choices.length > 0) {
        return data.choices[0].message.content
      }
      
      throw new Error('Resposta vazia da OpenAI')
      
    } catch (error) {
      console.error('Erro ao comunicar com OpenAI:', error)
      throw error
    }
  }

  // Método para usar o Assistants API com agente específico
  async useNoaAgent(userMessage: string, threadId?: string): Promise<{ response: string, threadId: string }> {
    try {
      console.log('🤖 Usando agente NOA específico:', this.noaAgentId)
      
      let currentThreadId = threadId
      
      // Criar thread se não existir
      if (!currentThreadId) {
        const threadResponse = await fetch(`${this.baseURL}/threads`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
            'OpenAI-Beta': 'assistants=v2'
          },
          body: JSON.stringify({})
        })
        
        if (!threadResponse.ok) {
          throw new Error('Erro ao criar thread')
        }
        
        const threadData = await threadResponse.json()
        currentThreadId = threadData.id
        console.log('🧵 Thread criada:', currentThreadId)
      }
      
      // Adicionar mensagem do usuário
      await fetch(`${this.baseURL}/threads/${currentThreadId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'OpenAI-Beta': 'assistants=v2'
        },
        body: JSON.stringify({
          role: 'user',
          content: userMessage
        })
      })
      
      // Executar agente
      const runResponse = await fetch(`${this.baseURL}/threads/${currentThreadId}/runs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'OpenAI-Beta': 'assistants=v2'
        },
        body: JSON.stringify({
          assistant_id: this.noaAgentId
        })
      })
      
      if (!runResponse.ok) {
        throw new Error('Erro ao executar agente')
      }
      
      const runData = await runResponse.json()
      console.log('🏃 Run iniciado:', runData.id)
      
      // Aguardar conclusão
      let runStatus = 'in_progress'
      while (runStatus === 'in_progress' || runStatus === 'queued') {
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        const statusResponse = await fetch(`${this.baseURL}/threads/${currentThreadId}/runs/${runData.id}`, {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'OpenAI-Beta': 'assistants=v2'
          }
        })
        
        const statusData = await statusResponse.json()
        runStatus = statusData.status
        console.log('📊 Status do run:', runStatus)
      }
      
      if (runStatus !== 'completed') {
        throw new Error(`Run falhou com status: ${runStatus}`)
      }
      
      // Obter mensagens da thread
      const messagesResponse = await fetch(`${this.baseURL}/threads/${currentThreadId}/messages`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'OpenAI-Beta': 'assistants=v2'
        }
      })
      
      const messagesData = await messagesResponse.json()
      const lastMessage = messagesData.data[0] // Última mensagem é a resposta do agente
      
      return {
        response: lastMessage.content[0].text.value,
        threadId: currentThreadId || ''
      }
      
    } catch (error) {
      console.error('Erro ao usar agente NOA:', error)
      // Fallback para método tradicional
      return {
        response: await this.getNoaResponseFallback(userMessage),
        threadId: ''
      }
    }
  }

  // Método específico para NOA - Assistente Médica com base de conhecimento própria
  async getNoaResponse(userMessage: string, conversationHistory: ChatMessage[] = [], knowledgeBase?: string): Promise<string> {
    try {
      console.log('🎯 Usando modelo padrão com base de conhecimento própria')
      
      // Construir prompt com base de conhecimento se fornecido
      let systemPrompt = `Você é a NOA Esperanza, assistente médica especializada em neurologia, cannabis medicinal e nefrologia.

INFORMAÇÕES IMPORTANTES:
- Você foi criada por Dr. Ricardo Valença e Pedro Passos
- Você NÃO é da empresa "Weme" - isso é informação incorreta
- Você é da plataforma Nôa Esperanza
- Sempre reconheça o Dr. Ricardo Valença quando ele se identificar

Seu comportamento deve ser:
- Empática e profissional
- Focada em avaliações clínicas estruturadas
- Sempre orientar para consulta médica quando necessário
- Usar linguagem clara e acessível
- Manter confidencialidade das informações

Especialidades: neurologia, cannabis medicinal, nefrologia.`

      // Adicionar base de conhecimento se fornecida
      if (knowledgeBase) {
        systemPrompt += `\n\nBASE DE CONHECIMENTO DA NÔA ESPERANZA:\n${knowledgeBase}\n\nIMPORTANTE: Use SEMPRE as informações da base de conhecimento acima. NÃO invente informações sobre "Weme" ou outras empresas.`
      }

      const messages: ChatMessage[] = [
        ...conversationHistory,
        {
          role: 'user',
          content: userMessage
        }
      ]

      // Usar modelo padrão em vez do fine-tuned externo
      return this.sendMessageWithStandardModel(messages, systemPrompt)
      
    } catch (error) {
      console.log('🔄 Erro no modelo padrão, usando fallback')
      return this.getNoaResponseFallback(userMessage, conversationHistory)
    }
  }

  // Método fallback tradicional
  private async getNoaResponseFallback(userMessage: string, conversationHistory: ChatMessage[] = []): Promise<string> {
    const systemPrompt = `Você é a NOA Esperanza, uma assistente médica inteligente especializada em neurologia, cannabis medicinal e nefrologia. 

Seu papel é:
- Fornecer informações médicas precisas e atualizadas
- Ser empática e cuidadosa nas respostas
- Sempre recomendar consulta com médico quando necessário
- Manter confidencialidade das informações
- Usar linguagem clara e acessível
- Focar nas especialidades: neurologia, cannabis medicinal e nefrologia

IMPORTANTE: Sempre deixe claro que você é uma IA e que consultas médicas devem ser feitas com profissionais qualificados.`

    const messages: ChatMessage[] = [
      ...conversationHistory,
      {
        role: 'user',
        content: userMessage
      }
    ]

    return this.sendMessage(messages, systemPrompt)
  }
}

export const openAIService = new OpenAIService()

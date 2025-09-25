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

  constructor() {
    this.apiKey = import.meta.env.VITE_OPENAI_API_KEY
    if (!this.apiKey) {
      console.error('OpenAI API Key não encontrada')
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
          model: 'gpt-4',
          messages: requestMessages,
          max_tokens: 500,
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

  // Método específico para NOA - Assistente Médica
  async getNoaResponse(userMessage: string, conversationHistory: ChatMessage[] = []): Promise<string> {
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

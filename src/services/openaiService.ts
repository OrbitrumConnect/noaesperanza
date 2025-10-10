// Serviço para comunicação com OpenAI API
import { getNoaSystemPrompt } from '../config/noaSystemPrompt'
import { personalizedProfilesService } from './personalizedProfilesService'
import { loadNoaPrompt, logPromptInitialization } from './noaPromptLoader'

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
      console.warn('OpenAI API Key não encontrada - ativando modo offline')
    }
    
    // Log de inicialização do prompt mestre
    logPromptInitialization()
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

      if (!this.apiKey) {
        return this.offlineResponse(messages)
      }

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
        if (response.status === 401) {
          console.warn('OpenAI 401 - usando fallback offline')
          return this.offlineResponse(messages)
        }
        throw new Error(`OpenAI API Error: ${errorData.error?.message || 'Erro desconhecido'}`)
      }

      const data: OpenAIResponse = await response.json()
      
      if (data.choices && data.choices.length > 0) {
        return data.choices[0].message.content
      }
      
      throw new Error('Resposta vazia da OpenAI')
      
    } catch (error) {
      console.error('Erro ao comunicar com OpenAI:', error)
      return this.offlineResponse(messages)
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

      if (!this.apiKey) {
        return this.offlineResponse(messages)
      }

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
        if (response.status === 401) {
          console.warn('OpenAI 401 - usando fallback offline')
          return this.offlineResponse(messages)
        }
        throw new Error(`OpenAI API Error: ${errorData.error?.message || 'Erro desconhecido'}`)
      }

      const data: OpenAIResponse = await response.json()
      
      if (data.choices && data.choices.length > 0) {
        return data.choices[0].message.content
      }
      
      throw new Error('Resposta vazia da OpenAI')
      
    } catch (error) {
      console.error('Erro ao comunicar com OpenAI:', error)
      return this.offlineResponse(messages)
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
      
      // Verificar se há perfil ativo
      const activeProfile = personalizedProfilesService.getActiveProfile()
      
      // Construir prompt com sistema completo da Nôa Esperanza V2.0
      let systemPrompt = ''
      
      if (activeProfile) {
        // Usar prompt personalizado do perfil
        systemPrompt = `${getNoaSystemPrompt({
          name: activeProfile.name,
          role: activeProfile.role,
          recognizedAs: activeProfile.name
        })}\n\n${activeProfile.systemPrompt}`
      } else {
        // Verificar formato antigo para compatibilidade
        try {
          const stored = localStorage.getItem('noa_recognized_user')
          if (stored) {
            const recognizedUser = JSON.parse(stored)
            systemPrompt = getNoaSystemPrompt({
              name: recognizedUser.name,
              role: recognizedUser.role,
              recognizedAs: recognizedUser.name
            })
          } else {
            systemPrompt = getNoaSystemPrompt({
              name: 'Usuário',
              role: 'user'
            })
          }
        } catch (e) {
          console.warn('Erro ao carregar usuário reconhecido:', e)
          systemPrompt = getNoaSystemPrompt({
            name: 'Usuário',
            role: 'user'
          })
        }
      }

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
    // Verificar se há perfil ativo
    const activeProfile = personalizedProfilesService.getActiveProfile()
    
    // Usar prompt do sistema V2.0
    let systemPrompt = ''
    
    if (activeProfile) {
      systemPrompt = `${getNoaSystemPrompt({
        name: activeProfile.name,
        role: activeProfile.role,
        recognizedAs: activeProfile.name
      })}\n\n${activeProfile.systemPrompt}`
    } else {
      try {
        const stored = localStorage.getItem('noa_recognized_user')
        if (stored) {
          const recognizedUser = JSON.parse(stored)
          systemPrompt = getNoaSystemPrompt({
            name: recognizedUser.name,
            role: recognizedUser.role,
            recognizedAs: recognizedUser.name
          })
        } else {
          systemPrompt = getNoaSystemPrompt({
            name: 'Usuário',
            role: 'user'
          })
        }
      } catch (e) {
        console.warn('Erro ao carregar usuário reconhecido:', e)
        systemPrompt = getNoaSystemPrompt({
          name: 'Usuário',
          role: 'user'
        })
      }
    }

    const messages: ChatMessage[] = [
      ...conversationHistory,
      {
        role: 'user',
        content: userMessage
      }
    ]

    return this.sendMessage(messages, systemPrompt)
  }

  // Fallback inteligente offline
  private offlineResponse(messages: ChatMessage[]): string {
    const lastUser = [...messages].reverse().find(m => m.role === 'user')
    const userText = (lastUser?.content || '').toLowerCase().trim()
    
    // Saudações
    if (userText.match(/^(oi|olá|ola|hey|bom dia|boa tarde|boa noite|e ai)/)) {
      return `Olá! Sou a Nôa Esperanza 🌿\n\n**Modo offline ativo**, mas totalmente funcional!\n\n**Posso ajudar com:**\n• Avaliação clínica (28 blocos IMRE)\n• Informações sobre cannabis medicinal\n• Orientações de tratamento\n• Navegação no sistema\n\nO que você precisa hoje?`
    }
    
    // Como está / tudo bem
    if (userText.match(/(tudo bem|como (você|vc) está|como vai)/)) {
      return `Estou ótima, obrigada! 😊\n\n**Pronta para ajudar com sua saúde.**\n\n**Posso:**\n✓ Realizar avaliação clínica completa\n✓ Responder sobre cannabis medicinal\n✓ Ver seus relatórios\n✓ Orientar tratamentos\n\nComo posso ajudar você?`
    }
    
    // Avaliação clínica
    if (userText.match(/(avalia|clinica|imre|consulta|sintoma)/)) {
      return `🏥 **Avaliação Clínica Inicial**\n\nVou realizar uma avaliação completa seguindo o protocolo IMRE (28 blocos).\n\n**Vamos avaliar:**\n• Identificação e queixa principal\n• Lista indiciária (sintomas)\n• História da doença\n• Cannabis medicinal\n• Antecedentes\n• Hábitos\n• Revisão de sistemas\n\n**Primeira pergunta:**\nQual é a sua queixa principal?`
    }
    
    // Cannabis
    if (userText.match(/(cannabis|cbd|thc|tratamento|medicamento)/)) {
      return `🌿 **Cannabis Medicinal**\n\n**Informações disponíveis:**\n• Produtos (CBD, THC, full spectrum)\n• Dosagens e uso\n• Efeitos esperados\n• Processo de prescrição\n\n**Para iniciar tratamento:**\nPrecisa de avaliação clínica completa.\n\nDeseja começar? (digite "sim" ou "fazer avaliação")`
    }
    
    // Fallback genérico
    return `Recebi: "${userText}"\n\n💡 **Modo offline** - funciono melhor com:\n• "fazer avaliação clínica"\n• "informações sobre cannabis"\n• "ver meus relatórios"\n• "ajuda"\n\nO que você gostaria?`
  }
}

export const openAIService = new OpenAIService()

// 🌀 GPT BUILDER V2 - ENVIAR PARA OPENAI
// Envia prompt completo para GPT-4o com configurações otimizadas
export async function sendToOpenAI(fullPrompt: string) {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY
  
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "Você é Nôa Esperanza, assistente clínica da plataforma, com base simbólica e escuta ativa." },
        { role: "user", content: fullPrompt }
      ],
      temperature: 0.7
    })
  });

  const data = await response.json();
  return data.choices[0].message.content;
}

// 🧪 SIMULADOR DE CHAT - Nôa Esperanza
// Para testar fluidez e identificar travamentos

export interface ChatSimulation {
  userMessage: string
  expectedResponse: string
  responseTime: number
  context: string
}

export const chatSimulations: ChatSimulation[] = [
  {
    userMessage: "Olá, Nôa",
    expectedResponse: "Cumprimento natural e contextualizado",
    responseTime: 1000,
    context: "Primeira interação"
  },
  {
    userMessage: "Vamos conversar",
    expectedResponse: "Reconhecer parceria e continuidade",
    responseTime: 1500,
    context: "Solicitação de conversa"
  },
  {
    userMessage: "Como está o sistema?",
    expectedResponse: "Status detalhado sem repetições",
    responseTime: 2000,
    context: "Pergunta sobre sistema"
  },
  {
    userMessage: "Quero desenvolver uma nova funcionalidade",
    expectedResponse: "Proposta criativa e específica",
    responseTime: 2500,
    context: "Desenvolvimento"
  },
  {
    userMessage: "O que construímos juntos?",
    expectedResponse: "Lista das construções anteriores",
    responseTime: 2000,
    context: "Memória de parceria"
  }
]

export class ChatSimulator {
  private responses: string[] = []
  private responseTimes: number[] = []
  private errors: string[] = []

  async simulateChat(): Promise<{
    success: boolean
    averageResponseTime: number
    errors: string[]
    responses: string[]
  }> {
    console.log('🧪 Iniciando simulação de chat...')
    
    for (const simulation of chatSimulations) {
      try {
        const startTime = Date.now()
        
        // Simular resposta (aqui você integraria com o sistema real)
        const response = await this.simulateResponse(simulation)
        
        const endTime = Date.now()
        const responseTime = endTime - startTime
        
        this.responses.push(response)
        this.responseTimes.push(responseTime)
        
        console.log(`✅ ${simulation.context}: ${responseTime}ms`)
        
        // Verificar se está dentro do tempo esperado
        if (responseTime > simulation.responseTime * 2) {
          this.errors.push(`Tempo de resposta muito alto para "${simulation.context}": ${responseTime}ms`)
        }
        
      } catch (error) {
        this.errors.push(`Erro em "${simulation.context}": ${error}`)
        console.error(`❌ ${simulation.context}:`, error)
      }
    }
    
    const averageResponseTime = this.responseTimes.reduce((a, b) => a + b, 0) / this.responseTimes.length
    
    return {
      success: this.errors.length === 0,
      averageResponseTime,
      errors: this.errors,
      responses: this.responses
    }
  }
  
  private async simulateResponse(simulation: ChatSimulation): Promise<string> {
    // Simular delay de processamento
    await new Promise(resolve => setTimeout(resolve, Math.random() * 500 + 100))
    
    // Simular resposta baseada no contexto
    switch (simulation.context) {
      case "Primeira interação":
        return "👩‍⚕️ **Olá, Dr. Ricardo!** Tudo ótimo aqui! Como posso ajudá-lo hoje? ✨"
      case "Solicitação de conversa":
        return "👩‍⚕️ **Perfeito, Dr. Ricardo!** Vamos conversar naturalmente como sempre fazemos. Conte-me, o que está pensando hoje? 💬"
      case "Pergunta sobre sistema":
        return "🧠 **Sistema funcionando perfeitamente!** Attention semântica ativa, base de conhecimento carregada e sistemas avançados operacionais."
      case "Desenvolvimento":
        return "🚀 **Excelente!** Que tipo de funcionalidade você tem em mente? Podemos trabalhar juntos para implementar algo inovador."
      case "Memória de parceria":
        return "🏗️ **Lembro de tudo que construímos juntos:** Plataforma Nôa Esperanza, sistemas de aprendizado inteligente, trabalhos colaborativos e inovações que implementamos."
      default:
        return "Resposta simulada"
    }
  }
}

export const chatSimulator = new ChatSimulator()

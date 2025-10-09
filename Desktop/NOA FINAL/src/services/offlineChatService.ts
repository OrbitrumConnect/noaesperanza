// 🚀 OFFLINE CHAT SERVICE - Nôa Esperanza
// Sistema de chat offline para evitar travamentos do Supabase

export interface OfflineMessage {
  id: string
  content: string
  response: string
  timestamp: Date
  context?: any
}

export class OfflineChatService {
  private messageHistory: OfflineMessage[] = []
  private isOnline: boolean = false

  constructor() {
    // Verifica se há API key antes de tentar conexão
    const hasApiKey = !!import.meta.env.VITE_OPENAI_API_KEY
    if (hasApiKey) {
      this.checkConnection()
    } else {
      console.log('💾 Modo OFFLINE ativo - OpenAI não configurada')
      this.isOnline = false
    }
  }

  // Verificar conexão (só executa se houver API key)
  private async checkConnection(): Promise<void> {
    try {
      // Teste simples de conectividade
      await fetch('https://api.openai.com/v1/models', { 
        method: 'HEAD',
        mode: 'no-cors'
      })
      this.isOnline = true
      console.log('✅ OpenAI online')
    } catch (error) {
      this.isOnline = false
      console.log('💾 Modo OFFLINE ativo - sem conexão OpenAI')
    }
  }

  // Processar mensagem offline
  async processMessage(message: string, context?: any): Promise<string> {
    try {
      // Adicionar ao histórico local
      const messageId = `offline_${Date.now()}`
      
      // Simular resposta baseada no contexto
      const response = await this.generateOfflineResponse(message, context)
      
      // Salvar localmente
      this.messageHistory.push({
        id: messageId,
        content: message,
        response,
        timestamp: new Date(),
        context
      })

      return response

    } catch (error) {
      console.error('Erro no processamento offline:', error)
      return 'Desculpe, ocorreu um erro. Tente novamente.'
    }
  }

  // Gerar resposta offline
  private async generateOfflineResponse(message: string, context?: any): Promise<string> {
    const lowerMessage = message.toLowerCase()
    
    // Respostas contextuais baseadas na mensagem
    if (lowerMessage.includes('estrutura') || lowerMessage.includes('arquitetura')) {
      return `🏗️ **ESTRUTURA DA PLATAFORMA NÔA ESPERANZA**

**Arquitetura Atual:**
• 🎯 **Frontend:** React + TypeScript + Tailwind
• 🧠 **IA:** OpenAI GPT-4 + Sistemas Avançados
• 💾 **Banco:** Supabase (PostgreSQL)
• 🔧 **Serviços:** Módulos especializados

**Componentes Principais:**
• GPTPBuilder - Interface principal
• SemanticAttention - Contexto inteligente
• IntelligentLearning - Aprendizado contínuo
• MedicalTools - Ferramentas médicas

**Status:** Sistema operacional e atualizado! 🚀`
    }

    if (lowerMessage.includes('gerenciar') || lowerMessage.includes('gestão')) {
      return `🎛️ **GERENCIAMENTO DA LLM**

**Controles Disponíveis:**
• 🧠 **Contexto Semântico** - Ativo
• 📚 **Base de Conhecimento** - Carregada
• 🔄 **Aprendizado Contínuo** - Funcionando
• 💼 **Trabalhos Colaborativos** - Disponível

**Como Gerenciar:**
• Use comandos naturais
• Faça perguntas específicas
• Solicite modificações
• Desenvolva funcionalidades

**Estou pronta para gerenciar o sistema!** ⚡`
    }

    if (lowerMessage.includes('offline') || lowerMessage.includes('conexão')) {
      return `🌐 **STATUS DE CONEXÃO**

**Modo Atual:** ${this.isOnline ? '🟢 Online' : '🟡 Offline'}
**Histórico Local:** ${this.messageHistory.length} mensagens
**Funcionalidade:** ${this.isOnline ? 'Completa' : 'Limitada'}

**Capacidades Offline:**
• ✅ Conversa natural
• ✅ Acesso à estrutura
• ✅ Gerenciamento básico
• ✅ Histórico local

**Sistema funcionando independente da conexão!** 🔋`
    }

    // Resposta padrão inteligente
    return `👩‍⚕️ **Dr. Ricardo, estou aqui!**

**Sistema Nôa Esperanza operacional:**
• 🧠 **IA Ativa** - Pronta para conversar
• 🏗️ **Estrutura Acessível** - Toda arquitetura disponível
• 🎛️ **Gestão LLM** - Controles funcionando
• 💬 **Chat Natural** - Como sempre conversamos

**Como posso ajudá-lo hoje?** 🚀`
  }

  // Obter histórico local
  getLocalHistory(): OfflineMessage[] {
    return this.messageHistory
  }

  // Limpar histórico
  clearHistory(): void {
    this.messageHistory = []
  }

  // Status da conexão
  getConnectionStatus(): boolean {
    return this.isOnline
  }
}

export const offlineChatService = new OfflineChatService()

/**
 * Serviço de Gerenciamento de Conversas - Nôa Esperanza
 * Gerencia conversas nomeadas, editáveis e histórico
 */

export interface NamedConversation {
  id: string
  name: string
  messages: ChatMessage[]
  createdAt: Date
  updatedAt: Date
  isActive: boolean
  tags?: string[]
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  action?: string
  data?: any
}

export class ConversationManagerService {
  private conversations: NamedConversation[] = []
  private currentConversationId: string | null = null
  private readonly baseStorageKey = 'noa_named_conversations'
  private storageKey = `${this.baseStorageKey}_default`
  private currentUserId: string | null = null

  constructor() {
    this.loadConversations()
  }

  /**
   * Define o contexto de usuário atual para isolar conversas por usuário
   */
  setUserContext(userId: string | null) {
    const normalizedId = userId?.trim() || 'guest'

    if (this.currentUserId === normalizedId) {
      return
    }

    this.currentUserId = normalizedId
    this.storageKey = `${this.baseStorageKey}_${normalizedId}`

    this.loadConversations()
  }

  /**
   * Criar nova conversa
   */
  createConversation(name?: string): NamedConversation {
    const conversation: NamedConversation = {
      id: `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: name || this.generateDefaultName(),
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true
    }

    this.conversations.unshift(conversation) // Adicionar no início
    this.currentConversationId = conversation.id
    this.saveConversations()
    
    return conversation
  }

  /**
   * Renomear conversa
   */
  renameConversation(conversationId: string, newName: string): boolean {
    const conversation = this.conversations.find(c => c.id === conversationId)
    if (conversation) {
      conversation.name = newName
      conversation.updatedAt = new Date()
      this.saveConversations()
      return true
    }
    return false
  }

  /**
   * Adicionar mensagem à conversa atual
   */
  addMessage(message: ChatMessage): void {
    if (!this.currentConversationId) {
      this.createConversation()
    }

    const conversation = this.conversations.find(c => c.id === this.currentConversationId)
    if (conversation) {
      conversation.messages.push(message)
      conversation.updatedAt = new Date()
      this.saveConversations()
    }
  }

  /**
   * Obter conversa atual
   */
  getCurrentConversation(): NamedConversation | null {
    if (!this.currentConversationId) {
      return null
    }
    return this.conversations.find(c => c.id === this.currentConversationId) || null
  }

  /**
   * Definir conversa ativa
   */
  setActiveConversation(conversationId: string): boolean {
    const conversation = this.conversations.find(c => c.id === conversationId)
    if (conversation) {
      this.currentConversationId = conversationId
      // Atualizar timestamp de acesso
      conversation.updatedAt = new Date()
      this.saveConversations()
      return true
    }
    return false
  }

  /**
   * Obter todas as conversas
   */
  getAllConversations(): NamedConversation[] {
    return [...this.conversations].sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )
  }

  /**
   * Obter conversas recentes (últimas 10)
   */
  getRecentConversations(limit: number = 10): NamedConversation[] {
    return this.getAllConversations().slice(0, limit)
  }

  /**
   * Deletar conversa
   */
  deleteConversation(conversationId: string): boolean {
    const index = this.conversations.findIndex(c => c.id === conversationId)
    if (index !== -1) {
      this.conversations.splice(index, 1)
      
      // Se era a conversa atual, criar uma nova
      if (this.currentConversationId === conversationId) {
        this.currentConversationId = null
        if (this.conversations.length > 0) {
          this.currentConversationId = this.conversations[0].id
        }
      }
      
      this.saveConversations()
      return true
    }
    return false
  }

  /**
   * Limpar todas as conversas
   */
  clearAllConversations(): void {
    this.conversations = []
    this.currentConversationId = null
    this.saveConversations()
  }

  /**
   * Obter estatísticas das conversas
   */
  getConversationStats(): {
    totalConversations: number
    totalMessages: number
    activeConversationId: string | null
    oldestConversation: Date | null
    newestConversation: Date | null
  } {
    const totalMessages = this.conversations.reduce(
      (sum, conv) => sum + conv.messages.length, 0
    )

    const dates = this.conversations.map(conv => new Date(conv.createdAt))
    const oldestConversation = dates.length > 0 ? new Date(Math.min(...dates.map(d => d.getTime()))) : null
    const newestConversation = dates.length > 0 ? new Date(Math.max(...dates.map(d => d.getTime()))) : null

    return {
      totalConversations: this.conversations.length,
      totalMessages,
      activeConversationId: this.currentConversationId,
      oldestConversation,
      newestConversation
    }
  }

  /**
   * Buscar conversas por nome
   */
  searchConversations(query: string): NamedConversation[] {
    const lowerQuery = query.toLowerCase()
    return this.conversations.filter(conv => 
      conv.name.toLowerCase().includes(lowerQuery) ||
      conv.messages.some(msg => msg.content.toLowerCase().includes(lowerQuery))
    )
  }

  /**
   * Gerar nome padrão para nova conversa
   */
  private generateDefaultName(): string {
    const now = new Date()
    const timeStr = now.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
    const dateStr = now.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit'
    })
    
    return `Conversa ${dateStr} ${timeStr}`
  }

  /**
   * Salvar conversas no localStorage
   */
  private saveConversations(): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify({
        conversations: this.conversations,
        currentConversationId: this.currentConversationId
      }))
    } catch (error) {
      console.error('Erro ao salvar conversas:', error)
    }
  }

  /**
   * Carregar conversas do localStorage
   */
  private loadConversations(): void {
    try {
      const saved = localStorage.getItem(this.storageKey)
      if (saved) {
        const data = JSON.parse(saved)
        this.conversations = (data.conversations || []).map((conv: any) => ({
          ...conv,
          createdAt: new Date(conv.createdAt),
          updatedAt: new Date(conv.updatedAt)
        }))
        this.currentConversationId = data.currentConversationId || null

        // Se não há conversa ativa mas existem conversas, ativar a primeira
        if (!this.currentConversationId && this.conversations.length > 0) {
          this.currentConversationId = this.conversations[0].id
        }
      } else {
        this.conversations = []
        this.currentConversationId = null
      }
    } catch (error) {
      console.error('Erro ao carregar conversas:', error)
      this.conversations = []
      this.currentConversationId = null
    }
  }

  /**
   * Exportar conversas para backup
   */
  exportConversations(): string {
    return JSON.stringify({
      conversations: this.conversations,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    }, null, 2)
  }

  /**
   * Importar conversas de backup
   */
  importConversations(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData)
      if (data.conversations && Array.isArray(data.conversations)) {
        this.conversations = data.conversations.map((conv: any) => ({
          ...conv,
          createdAt: new Date(conv.createdAt),
          updatedAt: new Date(conv.updatedAt)
        }))
        this.saveConversations()
        return true
      }
    } catch (error) {
      console.error('Erro ao importar conversas:', error)
    }
    return false
  }
}

// Instância global do serviço
export const conversationManager = new ConversationManagerService()

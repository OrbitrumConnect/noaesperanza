import React, { useState, useEffect } from 'react'
import { conversationManager, NamedConversation } from '../services/conversationManagerService'

interface ConversationHistoryProps {
  onConversationSelect: (conversation: NamedConversation) => void
  currentConversationId: string | null
  userId?: string | null
}

export const ConversationHistory: React.FC<ConversationHistoryProps> = ({
  onConversationSelect,
  currentConversationId,
  userId
}) => {
  const [conversations, setConversations] = useState<NamedConversation[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    conversationManager.setUserContext(userId || null)
    loadConversations()

    // Atualizar a cada mudança no conversationManager
    const interval = setInterval(loadConversations, 1000)
    return () => clearInterval(interval)
  }, [userId])

  const loadConversations = () => {
    const recentConversations = conversationManager.getRecentConversations(20)
    setConversations(recentConversations)
  }

  const handleNewConversation = () => {
    const newConversation = conversationManager.createConversation()
    onConversationSelect(newConversation)
  }

  const handleConversationSelect = (conversation: NamedConversation) => {
    conversationManager.setActiveConversation(conversation.id)
    onConversationSelect(conversation)
  }

  const handleStartEdit = (conversation: NamedConversation) => {
    setEditingId(conversation.id)
    setEditName(conversation.name)
  }

  const handleSaveEdit = () => {
    if (editingId && editName.trim()) {
      conversationManager.renameConversation(editingId, editName.trim())
      setEditingId(null)
      setEditName('')
      loadConversations()
    }
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditName('')
  }

  const handleDeleteConversation = (conversationId: string) => {
    if (confirm('Tem certeza que deseja deletar esta conversa?')) {
      conversationManager.deleteConversation(conversationId)
      loadConversations()
    }
  }

  const filteredConversations = searchQuery 
    ? conversationManager.searchConversations(searchQuery)
    : conversations

  return (
    <div className="w-80 bg-slate-800 border-l border-slate-700 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-white flex items-center">
            <i className="fas fa-history text-purple-400 mr-2"></i>
            Conversas
          </h2>
          <button
            onClick={handleNewConversation}
            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors"
          >
            <i className="fas fa-plus mr-1"></i>
            Nova
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar conversas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
          />
          <i className="fas fa-search absolute right-3 top-2.5 text-gray-400"></i>
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto p-2">
        {filteredConversations.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            <i className="fas fa-comments text-4xl mb-3 opacity-50"></i>
            <p className="text-sm">
              {searchQuery ? 'Nenhuma conversa encontrada' : 'Nenhuma conversa ainda'}
            </p>
            {!searchQuery && (
              <button
                onClick={handleNewConversation}
                className="mt-3 text-blue-400 hover:text-blue-300 text-sm"
              >
                Criar primeira conversa
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredConversations.map((conversation) => (
              <div
                key={conversation.id}
                className={`group relative p-3 rounded-lg cursor-pointer transition-all ${
                  currentConversationId === conversation.id
                    ? 'bg-blue-600 border border-blue-500'
                    : 'bg-slate-700 hover:bg-slate-600 border border-transparent'
                }`}
                onClick={() => handleConversationSelect(conversation)}
              >
                {/* Conversation Name */}
                {editingId === conversation.id ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="flex-1 bg-slate-600 border border-slate-500 rounded px-2 py-1 text-white text-sm focus:outline-none focus:border-blue-400"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveEdit()
                        if (e.key === 'Escape') handleCancelEdit()
                      }}
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleSaveEdit()
                      }}
                      className="text-green-400 hover:text-green-300"
                    >
                      <i className="fas fa-check text-xs"></i>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleCancelEdit()
                      }}
                      className="text-red-400 hover:text-red-300"
                    >
                      <i className="fas fa-times text-xs"></i>
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">
                        {conversation.name}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-400">
                          {new Date(conversation.updatedAt).toLocaleDateString('pt-BR')}
                        </span>
                        <span className="text-xs text-gray-500">
                          {conversation.messages.length} mensagens
                        </span>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleStartEdit(conversation)
                        }}
                        className="text-gray-400 hover:text-blue-400 p-1"
                        title="Renomear"
                      >
                        <i className="fas fa-edit text-xs"></i>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteConversation(conversation.id)
                        }}
                        className="text-gray-400 hover:text-red-400 p-1"
                        title="Deletar"
                      >
                        <i className="fas fa-trash text-xs"></i>
                      </button>
                    </div>
                  </div>
                )}

                {/* Message Preview */}
                {conversation.messages.length > 0 && editingId !== conversation.id && (
                  <p className="text-xs text-gray-400 mt-2 truncate">
                    {conversation.messages[conversation.messages.length - 1].content.substring(0, 50)}...
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-slate-700">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>{conversations.length} conversas</span>
          <button
            onClick={() => {
              if (confirm('Tem certeza que deseja limpar todo o histórico?')) {
                conversationManager.clearAllConversations()
                loadConversations()
              }
            }}
            className="text-red-400 hover:text-red-300"
          >
            <i className="fas fa-trash mr-1"></i>
            Limpar tudo
          </button>
        </div>
      </div>
    </div>
  )
}

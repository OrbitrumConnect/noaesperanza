// 📊 SIDEBAR DE HISTÓRICO DE CONVERSAS - Dr. Ricardo Valença
// Componente para melhorar aprendizado da plataforma

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../integrations/supabase/client'
import { intelligentLearningService } from '../services/intelligentLearningService'
import { semanticAttentionService, UserContext } from '../services/semanticAttentionService'

interface ConversationCard {
  id: string
  title: string
  summary: string
  area: string
  tipo: 'debate' | 'analise' | 'estudo' | 'desenvolvimento' | 'geral'
  data: string
  relevancia: number
  participantes: string[]
  tags: string[]
  pontosChave: string[]
}

interface ConversationHistorySidebarProps {
  isOpen: boolean
  onClose: () => void
  onSelectConversation: (conversation: ConversationCard) => void
  userContext?: UserContext | null
  currentMessage?: string
}

const ConversationHistorySidebar: React.FC<ConversationHistorySidebarProps> = ({
  isOpen,
  onClose,
  onSelectConversation,
  userContext,
  currentMessage
}) => {
  const [conversations, setConversations] = useState<ConversationCard[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedArea, setSelectedArea] = useState<string>('all')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [learningMode, setLearningMode] = useState(false)
  const [contextualSuggestions, setContextualSuggestions] = useState<string[]>([])

  // 🧠 APRENDIZADO CONTEXTUAL - Analisar contexto atual
  const analyzeContextualLearning = async () => {
    if (!currentMessage || !userContext) return
    
    try {
      console.log('🧠 Analisando contexto para aprendizado...')
      
      // Buscar conversas similares baseadas no contexto semântico
      const { data: similarConversations } = await supabase
        .from('conversation_history')
        .select('*')
        .eq('user_id', userContext.userId)
        .order('relevance_score', { ascending: false })
        .limit(5)
      
      if (similarConversations) {
        // Extrair sugestões contextuais
        const suggestions = similarConversations.map(conv => {
          const attentionScores = conv.attention_scores || {}
          const dominantContext = Object.keys(attentionScores).reduce((a, b) => 
            attentionScores[a] > attentionScores[b] ? a : b
          )
          
          return `💡 Contexto similar: ${dominantContext} - ${conv.content.substring(0, 50)}...`
        })
        
        setContextualSuggestions(suggestions)
        setLearningMode(true)
      }
    } catch (error) {
      console.error('Erro no aprendizado contextual:', error)
    }
  }

  // Carregar conversas do banco
  const loadConversations = async () => {
    try {
      setLoading(true)
      
      // Buscar da memória viva científica
      const { data: memoriaData } = await supabase
        .from('memoria_viva_cientifica')
        .select('*')
        .order('data_conversa', { ascending: false })
        .limit(50)

      // Buscar debates científicos
      const { data: debatesData } = await supabase
        .from('debates_cientificos')
        .select('*')
        .order('data_debate', { ascending: false })
        .limit(50)

      // Buscar estudos vivos
      const { data: estudosData } = await supabase
        .from('estudos_vivos')
        .select('*')
        .order('data_estudo', { ascending: false })
        .limit(50)

      // Combinar e formatar dados
      const allConversations: ConversationCard[] = []

      // Processar memória viva
      if (memoriaData) {
        memoriaData.forEach(item => {
          allConversations.push({
            id: item.id,
            title: item.topico,
            summary: item.conteudo_principal.substring(0, 150) + '...',
            area: item.area,
            tipo: item.tipo_conteudo === 'debate-cientifico' ? 'debate' : 
                  item.tipo_conteudo === 'analise-trabalho' ? 'analise' :
                  item.tipo_conteudo === 'proposta-pesquisa' ? 'estudo' : 'geral',
            data: item.data_conversa,
            relevancia: item.relevancia || 5,
            participantes: item.participantes || ['Dr. Ricardo', 'Nôa Esperanza'],
            tags: item.tags || [],
            pontosChave: item.pontos_chave || []
          })
        })
      }

      // Processar debates
      if (debatesData) {
        debatesData.forEach(item => {
          allConversations.push({
            id: item.id,
            title: item.titulo,
            summary: `Debate sobre ${item.area} com ${item.participantes?.length || 2} participantes`,
            area: item.area,
            tipo: 'debate',
            data: item.data_debate,
            relevancia: item.relevancia || 7,
            participantes: item.participantes || ['Dr. Ricardo', 'Nôa Esperanza'],
            tags: item.tags || [],
            pontosChave: []
          })
        })
      }

      // Processar estudos vivos
      if (estudosData) {
        estudosData.forEach(item => {
          allConversations.push({
            id: item.id,
            title: `Estudo Vivo: ${item.pergunta_original}`,
            summary: `Análise de ${item.documentos_analisados?.length || 0} documentos na área de ${item.area}`,
            area: item.area,
            tipo: 'estudo',
            data: item.data_estudo,
            relevancia: item.nivel_confianca || 8,
            participantes: ['Dr. Ricardo', 'Nôa Esperanza'],
            tags: item.tags || [],
            pontosChave: []
          })
        })
      }

      // Ordenar por data
      allConversations.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
      setConversations(allConversations)

    } catch (error) {
      console.error('Erro ao carregar conversas:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      loadConversations()
      analyzeContextualLearning()
    }
  }, [isOpen, currentMessage, userContext])

  // Filtrar conversas
  const filteredConversations = conversations.filter(conv => {
    const matchesArea = selectedArea === 'all' || conv.area === selectedArea
    const matchesType = selectedType === 'all' || conv.tipo === selectedType
    const matchesSearch = searchTerm === '' || 
      conv.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    
    return matchesArea && matchesType && matchesSearch
  })

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'debate': return '💬'
      case 'analise': return '📊'
      case 'estudo': return '🧠'
      case 'desenvolvimento': return '🔧'
      default: return '💭'
    }
  }

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'debate': return 'bg-orange-100 text-orange-800'
      case 'analise': return 'bg-blue-100 text-blue-800'
      case 'estudo': return 'bg-purple-100 text-purple-800'
      case 'desenvolvimento': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getRelevanciaColor = (relevancia: number) => {
    if (relevancia >= 8) return 'text-green-600'
    if (relevancia >= 6) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={onClose}
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-96 bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">📊 Histórico de Conversas</h2>
                  <p className="text-sm opacity-90">Aprendizado Contínuo da Nôa Esperanza</p>
                </div>
                <button
                  onClick={onClose}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>
            </div>

            {/* 🧠 MODO APRENDIZADO CONTEXTUAL */}
            {learningMode && (
              <div className="p-4 bg-purple-900/30 border-b border-purple-500/50">
                <div className="flex items-center gap-2 mb-2">
                  <i className="fas fa-brain text-purple-400"></i>
                  <span className="text-sm font-semibold text-purple-300">Aprendizado Ativo</span>
                  <button
                    onClick={() => setLearningMode(false)}
                    className="text-purple-400 hover:text-purple-300 ml-auto"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
                <div className="text-xs text-purple-200 mb-2">
                  Analisando contexto atual: "{currentMessage?.substring(0, 30)}..."
                </div>
                {contextualSuggestions.map((suggestion, index) => (
                  <div key={index} className="text-xs text-purple-200 bg-purple-800/30 p-2 rounded mb-1">
                    {suggestion}
                  </div>
                ))}
              </div>
            )}

            {/* Filtros */}
            <div className="p-4 border-b bg-gray-50">
              <div className="space-y-3">
                {/* Busca */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Buscar conversas..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <i className="fas fa-search absolute left-3 top-3 text-gray-400"></i>
                </div>

                {/* Filtros */}
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={selectedArea}
                    onChange={(e) => setSelectedArea(e.target.value)}
                    className="px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">Todas as Áreas</option>
                    <option value="nefrologia">Nefrologia</option>
                    <option value="neurologia">Neurologia</option>
                    <option value="cannabis">Cannabis</option>
                    <option value="interdisciplinar">Interdisciplinar</option>
                  </select>

                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">Todos os Tipos</option>
                    <option value="debate">Debate</option>
                    <option value="analise">Análise</option>
                    <option value="estudo">Estudo</option>
                    <option value="desenvolvimento">Desenvolvimento</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Lista de Conversas */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  <i className="fas fa-comments text-4xl mb-2"></i>
                  <p>Nenhuma conversa encontrada</p>
                </div>
              ) : (
                <div className="p-2 space-y-2">
                  {filteredConversations.map((conversation) => (
                    <motion.div
                      key={conversation.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white border rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => onSelectConversation(conversation)}
                    >
                      {/* Header do Card */}
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{getTipoIcon(conversation.tipo)}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTipoColor(conversation.tipo)}`}>
                            {conversation.tipo}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <i className="fas fa-star"></i>
                          <span className={getRelevanciaColor(conversation.relevancia)}>
                            {conversation.relevancia}/10
                          </span>
                        </div>
                      </div>

                      {/* Título */}
                      <h3 className="font-medium text-gray-900 mb-1 line-clamp-2">
                        {conversation.title}
                      </h3>

                      {/* Resumo */}
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {conversation.summary}
                      </p>

                      {/* Footer */}
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center gap-2">
                          <span className="bg-gray-100 px-2 py-1 rounded">
                            {conversation.area}
                          </span>
                          {conversation.participantes.length > 0 && (
                            <span>
                              {conversation.participantes.join(', ')}
                            </span>
                          )}
                        </div>
                        <span>
                          {new Date(conversation.data).toLocaleDateString('pt-BR')}
                        </span>
                      </div>

                      {/* Tags */}
                      {conversation.tags.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {conversation.tags.slice(0, 3).map((tag, index) => (
                            <span
                              key={index}
                              className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                            >
                              #{tag}
                            </span>
                          ))}
                          {conversation.tags.length > 3 && (
                            <span className="text-xs text-gray-500">
                              +{conversation.tags.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t bg-gray-50">
              <div className="text-center text-sm text-gray-600">
                <p>💡 <strong>{filteredConversations.length}</strong> conversas encontradas</p>
                <p>Cada conversa contribui para o aprendizado da Nôa Esperanza</p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default ConversationHistorySidebar

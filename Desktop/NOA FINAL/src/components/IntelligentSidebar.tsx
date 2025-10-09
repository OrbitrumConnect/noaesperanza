// 🧠 SIDEBAR INTELIGENTE - Nôa Esperanza
// Sistema profissional de histórico e aprendizado contínuo

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../integrations/supabase/client'
import {
  intelligentLearningService,
  WorkCollaboration,
} from '../services/intelligentLearningService'

interface IntelligentSidebarProps {
  isOpen: boolean
  onClose: () => void
  onSelectItem: (item: any) => void
  currentMessage?: string
}

interface HistoryItem {
  id: string
  type: 'conversation' | 'collaborative_work' | 'estudo_vivo'
  title: string
  content: string
  relevance: number
  category: string
  timestamp: string
}

const IntelligentSidebar: React.FC<IntelligentSidebarProps> = ({
  isOpen,
  onClose,
  onSelectItem,
  currentMessage,
}) => {
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([])
  const [collaborativeWorks, setCollaborativeWorks] = useState<WorkCollaboration[]>([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'history' | 'works' | 'insights'>('history')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  // Carregar histórico inteligente
  const loadIntelligentHistory = async () => {
    try {
      setLoading(true)
      console.log('🧠 Carregando histórico inteligente...')

      const intelligentHistory = await intelligentLearningService.getIntelligentHistory(
        'dr-ricardo-valenca',
        30
      )

      const formattedItems: HistoryItem[] = intelligentHistory.map(item => ({
        id: item.id,
        type: item.type as 'conversation' | 'collaborative_work' | 'estudo_vivo',
        title: item.title,
        content: item.content,
        relevance: item.relevance,
        category: item.category,
        timestamp: item.timestamp,
      }))

      setHistoryItems(formattedItems)
      console.log('✅ Histórico inteligente carregado:', formattedItems.length, 'itens')
    } catch (error) {
      console.error('❌ Erro ao carregar histórico inteligente:', error)
    } finally {
      setLoading(false)
    }
  }

  // Carregar trabalhos colaborativos
  const loadCollaborativeWorks = async () => {
    try {
      setLoading(true)
      console.log('💼 Carregando trabalhos colaborativos...')

      const { data, error } = await supabase
        .from('collaborative_works')
        .select('*')
        .eq('participants', 'dr-ricardo-valenca')
        .order('updated_at', { ascending: false })
        .limit(20)

      if (error) {
        throw error
      }

      if (data) {
        setCollaborativeWorks(data)
        console.log('✅ Trabalhos colaborativos carregados:', data.length)
      }
    } catch (error) {
      console.error('❌ Erro ao carregar trabalhos colaborativos:', error)
    } finally {
      setLoading(false)
    }
  }

  // Criar novo trabalho colaborativo
  const createNewWork = async () => {
    try {
      const title = prompt('Título do trabalho colaborativo:')
      if (!title) return

      const type = prompt('Tipo (research/clinical/development/analysis):') as
        | 'research'
        | 'clinical'
        | 'development'
        | 'analysis'
      if (!type) return

      const initialContent = prompt('Conteúdo inicial:') || ''

      const newWork = await intelligentLearningService.createCollaborativeWork(
        title,
        type,
        initialContent,
        ['dr-ricardo-valenca']
      )

      console.log('✅ Trabalho criado:', newWork.id)
      loadCollaborativeWorks()
    } catch (error) {
      console.error('❌ Erro ao criar trabalho:', error)
    }
  }

  // Filtrar itens
  const filteredItems = historyItems.filter(item => {
    const matchesSearch =
      searchTerm === '' ||
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.content.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  // Filtrar trabalhos
  const filteredWorks = collaborativeWorks.filter(work => {
    const matchesSearch =
      searchTerm === '' ||
      work.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      work.content.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = selectedCategory === 'all' || work.type === selectedCategory

    return matchesSearch && matchesCategory
  })

  useEffect(() => {
    if (isOpen) {
      loadIntelligentHistory()
      loadCollaborativeWorks()
    }
  }, [isOpen])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed right-0 top-0 h-full w-96 bg-white shadow-2xl z-50 flex flex-col"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold">🧠 Histórico Inteligente</h2>
              <button
                onClick={onClose}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>

            {/* Tabs */}
            <div className="flex mt-3 space-x-2">
              <button
                onClick={() => setActiveTab('history')}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  activeTab === 'history' ? 'bg-white text-purple-600' : 'bg-purple-500 text-white'
                }`}
              >
                📊 Histórico
              </button>
              <button
                onClick={() => setActiveTab('works')}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  activeTab === 'works' ? 'bg-white text-purple-600' : 'bg-purple-500 text-white'
                }`}
              >
                💼 Trabalhos
              </button>
              <button
                onClick={() => setActiveTab('insights')}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  activeTab === 'insights' ? 'bg-white text-purple-600' : 'bg-purple-500 text-white'
                }`}
              >
                💡 Insights
              </button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="p-4 bg-gray-50 border-b">
            <input
              type="text"
              placeholder="🔍 Buscar..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full p-2 border rounded-lg mb-2"
            />

            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="w-full p-2 border rounded-lg"
            >
              <option value="all">Todas as categorias</option>
              <option value="conversa">Conversas</option>
              <option value="medicina">Medicina</option>
              <option value="pesquisa">Pesquisa</option>
              <option value="desenvolvimento">Desenvolvimento</option>
              <option value="estudo">Estudos</option>
            </select>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              </div>
            ) : (
              <>
                {activeTab === 'history' && (
                  <div className="p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-semibold text-gray-700">📊 Histórico Inteligente</h3>
                      <span className="text-sm text-gray-500">{filteredItems.length} itens</span>
                    </div>

                    <div className="space-y-3">
                      {filteredItems.map(item => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-white border rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer"
                          onClick={() => onSelectItem(item)}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium text-sm text-gray-800">{item.title}</h4>
                            <span className="text-xs text-gray-500">
                              {item.relevance.toFixed(1)}
                            </span>
                          </div>

                          <p className="text-xs text-gray-600 mb-2">{item.content}</p>

                          <div className="flex justify-between items-center">
                            <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                              {item.category}
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(item.timestamp).toLocaleDateString()}
                            </span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'works' && (
                  <div className="p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-semibold text-gray-700">💼 Trabalhos Colaborativos</h3>
                      <button
                        onClick={createNewWork}
                        className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 transition-colors"
                      >
                        + Novo
                      </button>
                    </div>

                    <div className="space-y-3">
                      {filteredWorks.map(work => (
                        <motion.div
                          key={work.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-white border rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer"
                          onClick={() => onSelectItem(work)}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium text-sm text-gray-800">{work.title}</h4>
                            <span
                              className={`text-xs px-2 py-1 rounded ${
                                work.status === 'active'
                                  ? 'bg-green-100 text-green-700'
                                  : work.status === 'completed'
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'bg-gray-100 text-gray-700'
                              }`}
                            >
                              {work.status}
                            </span>
                          </div>

                          <p className="text-xs text-gray-600 mb-2">
                            {work.content.substring(0, 100)}...
                          </p>

                          <div className="flex justify-between items-center">
                            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                              {work.type}
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(work.updatedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'insights' && (
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-700 mb-4">💡 Insights Gerados</h3>

                    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4">
                      <h4 className="font-medium text-yellow-800 mb-2">
                        🧠 Aprendizado Contínuo Ativo
                      </h4>
                      <p className="text-sm text-yellow-700 mb-2">
                        O sistema está aprendendo com cada conversa e evoluindo automaticamente.
                      </p>
                      <div className="text-xs text-yellow-600">
                        <p>• Padrões identificados: {historyItems.length}</p>
                        <p>
                          • Trabalhos ativos:{' '}
                          {collaborativeWorks.filter(w => w.status === 'active').length}
                        </p>
                        <p>• Categorias: {new Set(historyItems.map(i => i.category)).size}</p>
                      </div>
                    </div>

                    <div className="mt-4 space-y-3">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <h5 className="font-medium text-blue-800 text-sm">
                          🎯 Contexto Inteligente
                        </h5>
                        <p className="text-xs text-blue-700 mt-1">
                          Sistema busca automaticamente contexto relevante para melhorar respostas.
                        </p>
                      </div>

                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <h5 className="font-medium text-green-800 text-sm">🔄 Evolução Contínua</h5>
                        <p className="text-xs text-green-700 mt-1">
                          Trabalhos colaborativos evoluem com cada contribuição.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 p-4 border-t">
            <div className="text-xs text-gray-500 text-center">
              🧠 Sistema de Aprendizado Inteligente Nôa Esperanza
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default IntelligentSidebar

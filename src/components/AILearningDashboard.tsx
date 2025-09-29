import React, { useState, useEffect } from 'react'
import { aiLearningService, AILearning, AIKeyword } from '../services/aiLearningService'

interface AILearningDashboardProps {
  onClose: () => void
}

const AILearningDashboard: React.FC<AILearningDashboardProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'keywords' | 'learning' | 'stats'>('overview')
  const [keywords, setKeywords] = useState<AIKeyword[]>([])
  const [learning, setLearning] = useState<AILearning[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [newKeyword, setNewKeyword] = useState('')
  const [newCategory, setNewCategory] = useState('general')
  const [newImportance, setNewImportance] = useState(0.5)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [keywordsData, learningData, statsData] = await Promise.all([
        aiLearningService.getKeywords(),
        aiLearningService.getLearningByCategory('medical'),
        aiLearningService.getLearningStats()
      ])
      
      setKeywords(keywordsData)
      setLearning(learningData)
      setStats(statsData)
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddKeyword = async () => {
    if (!newKeyword.trim()) return
    
    try {
      await aiLearningService.addKeyword(newKeyword, newCategory, newImportance)
      setNewKeyword('')
      setNewCategory('general')
      setNewImportance(0.5)
      loadData()
    } catch (error) {
      console.error('Erro ao adicionar palavra-chave:', error)
    }
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      medical: 'bg-blue-100 text-blue-800',
      cannabis: 'bg-green-100 text-green-800',
      neurology: 'bg-purple-100 text-purple-800',
      nephrology: 'bg-orange-100 text-orange-800',
      evaluation: 'bg-red-100 text-red-800',
      general: 'bg-gray-100 text-gray-800'
    }
    return colors[category as keyof typeof colors] || colors.general
  }

  const getImportanceColor = (score: number) => {
    if (score >= 0.8) return 'text-red-600 font-bold'
    if (score >= 0.6) return 'text-orange-600 font-semibold'
    return 'text-green-600'
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-center mt-4">Carregando dados de aprendizado...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="ai-learning-modal rounded-lg shadow-xl w-full max-w-6xl h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="modal-header text-white p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">🧠 Sistema de Aprendizado da IA</h2>
              <p className="text-blue-100">NOA Esperanza - Inteligência Artificial em Evolução</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 text-2xl transition-colors"
            >
              ×
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="modal-tabs">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: '📊 Visão Geral', icon: '📊' },
              { id: 'keywords', label: '🔑 Palavras-chave', icon: '🔑' },
              { id: 'learning', label: '🎓 Aprendizado', icon: '🎓' },
              { id: 'stats', label: '📈 Estatísticas', icon: '📈' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`tab-button py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id ? 'active' : ''
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="modal-content p-6 h-[calc(90vh-200px)] overflow-y-auto">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="card p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-primary">Total de Interações</h3>
                  <p className="text-3xl font-bold text-primary">{stats?.totalInteractions || 0}</p>
                </div>
                <div className="card p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-success">Palavras-chave</h3>
                  <p className="text-3xl font-bold text-success">{stats?.totalKeywords || 0}</p>
                </div>
                <div className="card p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-warning">Confiança Média</h3>
                  <p className="text-3xl font-bold text-warning">
                    {stats?.avgConfidence ? (stats.avgConfidence * 100).toFixed(1) + '%' : '0%'}
                  </p>
                </div>
              </div>

              <div className="card p-6">
                <h3 className="text-lg font-semibold mb-4 text-primary">📊 Distribuição por Categoria</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {stats?.categories && Object.entries(stats.categories).map(([category, count]) => (
                    <div key={category} className="flex justify-between items-center p-3 bg-gray-800 bg-opacity-50 rounded border border-gray-600">
                      <span className="capitalize text-gray-200">{category}</span>
                      <span className="font-bold text-primary">{count as number}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'keywords' && (
            <div className="space-y-6">
              {/* Adicionar nova palavra-chave */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">➕ Adicionar Nova Palavra-chave</h3>
                <div className="flex gap-4">
                  <input
                    type="text"
                    value={newKeyword}
                    onChange={(e) => setNewKeyword(e.target.value)}
                    placeholder="Digite a palavra-chave..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="general">Geral</option>
                    <option value="medical">Médico</option>
                    <option value="cannabis">Cannabis</option>
                    <option value="neurology">Neurologia</option>
                    <option value="nephrology">Nefrologia</option>
                    <option value="evaluation">Avaliação</option>
                  </select>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={newImportance}
                    onChange={(e) => setNewImportance(parseFloat(e.target.value))}
                    className="w-24"
                  />
                  <span className="text-sm text-gray-600">{newImportance.toFixed(1)}</span>
                  <button
                    onClick={handleAddKeyword}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    Adicionar
                  </button>
                </div>
              </div>

              {/* Lista de palavras-chave */}
              <div className="bg-white border rounded-lg">
                <div className="p-4 border-b">
                  <h3 className="text-lg font-semibold">🔑 Palavras-chave Aprendidas</h3>
                </div>
                <div className="divide-y">
                  {keywords.map((keyword) => (
                    <div key={keyword.id} className="p-4 flex justify-between items-center">
                      <div>
                        <span className="font-medium">{keyword.keyword}</span>
                        <span className={`ml-2 px-2 py-1 rounded-full text-xs ${getCategoryColor(keyword.category)}`}>
                          {keyword.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`text-sm ${getImportanceColor(keyword.importance_score)}`}>
                          {keyword.importance_score.toFixed(1)}
                        </span>
                        <span className="text-sm text-gray-500">
                          {keyword.usage_count} usos
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'learning' && (
            <div className="space-y-6">
              <div className="bg-white border rounded-lg">
                <div className="p-4 border-b">
                  <h3 className="text-lg font-semibold">🎓 Interações Aprendidas</h3>
                </div>
                <div className="divide-y">
                  {learning.map((item) => (
                    <div key={item.id} className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <span className={`px-2 py-1 rounded-full text-xs ${getCategoryColor(item.category)}`}>
                          {item.category}
                        </span>
                        <span className="text-sm text-gray-500">
                          {item.usage_count} usos
                        </span>
                      </div>
                      <div className="mb-2">
                        <strong>Usuário:</strong> {item.user_message}
                      </div>
                      <div className="text-gray-600">
                        <strong>NOA:</strong> {item.ai_response}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'stats' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">📈 Métricas de Performance</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Total de Uso:</span>
                      <span className="font-bold">{stats?.totalUsage || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Confiança Média:</span>
                      <span className="font-bold">
                        {stats?.avgConfidence ? (stats.avgConfidence * 100).toFixed(1) + '%' : '0%'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white border rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">🎯 Categorias Mais Usadas</h3>
                  <div className="space-y-2">
                    {stats?.categories && Object.entries(stats.categories)
                      .sort(([,a], [,b]) => (b as number) - (a as number))
                      .slice(0, 5)
                      .map(([category, count]) => (
                        <div key={category} className="flex justify-between">
                          <span className="capitalize">{category}</span>
                          <span className="font-bold">{count as number}</span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AILearningDashboard

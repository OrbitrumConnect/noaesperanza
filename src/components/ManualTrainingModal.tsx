import React, { useState, useEffect } from 'react'
import { aiLearningService, AILearning } from '../services/aiLearningService'

interface ManualTrainingModalProps {
  onClose: () => void
}

const ManualTrainingModal: React.FC<ManualTrainingModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'add' | 'edit' | 'validate'>('add')
  const [learningData, setLearningData] = useState<AILearning[]>([])
  const [loading, setLoading] = useState(false)
  
  // Form para adicionar nova resposta
  const [newTraining, setNewTraining] = useState({
    keyword: '',
    userMessage: '',
    aiResponse: '',
    category: 'general',
    confidence: 0.8
  })

  // Form para editar resposta existente
  const [editingItem, setEditingItem] = useState<AILearning | null>(null)
  const [editForm, setEditForm] = useState({
    keyword: '',
    userMessage: '',
    aiResponse: '',
    category: 'general',
    confidence: 0.8
  })

  useEffect(() => {
    loadLearningData()
  }, [])

  const loadLearningData = async () => {
    setLoading(true)
    try {
      const data = await aiLearningService.getLearningByCategory('medical')
      setLearningData(data)
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddTraining = async () => {
    if (!newTraining.keyword.trim() || !newTraining.userMessage.trim() || !newTraining.aiResponse.trim()) {
      alert('Preencha todos os campos obrigatórios')
      return
    }

    try {
      await aiLearningService.saveLearning({
        keyword: newTraining.keyword,
        context: newTraining.userMessage,
        user_message: newTraining.userMessage,
        ai_response: newTraining.aiResponse,
        category: newTraining.category as any,
        confidence_score: newTraining.confidence
      })

      // Adicionar palavra-chave
      await aiLearningService.addKeyword(newTraining.keyword, newTraining.category, newTraining.confidence)

      alert('Treinamento adicionado com sucesso!')
      setNewTraining({
        keyword: '',
        userMessage: '',
        aiResponse: '',
        category: 'general',
        confidence: 0.8
      })
      loadLearningData()
    } catch (error) {
      console.error('Erro ao adicionar treinamento:', error)
      alert('Erro ao adicionar treinamento')
    }
  }

  const handleEditTraining = async () => {
    if (!editingItem || !editForm.keyword.trim() || !editForm.userMessage.trim() || !editForm.aiResponse.trim()) {
      alert('Preencha todos os campos obrigatórios')
      return
    }

    try {
      // Atualizar aprendizado (implementar método de update no service)
      alert('Funcionalidade de edição será implementada em breve')
      setEditingItem(null)
      loadLearningData()
    } catch (error) {
      console.error('Erro ao editar treinamento:', error)
      alert('Erro ao editar treinamento')
    }
  }

  const handleDeleteTraining = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este treinamento?')) return

    try {
      // Implementar método de delete no service
      alert('Funcionalidade de exclusão será implementada em breve')
      loadLearningData()
    } catch (error) {
      console.error('Erro ao excluir treinamento:', error)
      alert('Erro ao excluir treinamento')
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-pink-600 text-white p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">🎓 Treinamento Manual da IA</h2>
              <p className="text-red-100">Adicionar, editar e validar respostas da NOA</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'add', label: '➕ Adicionar Resposta', icon: '➕' },
              { id: 'edit', label: '✏️ Editar Respostas', icon: '✏️' },
              { id: 'validate', label: '✅ Validar Qualidade', icon: '✅' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-2 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6 h-[calc(90vh-200px)] overflow-y-auto">
          
          {/* Tab: Adicionar Resposta */}
          {activeTab === 'add' && (
            <div className="space-y-6">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">➕ Nova Resposta da IA</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Palavra-chave
                    </label>
                    <input
                      type="text"
                      value={newTraining.keyword}
                      onChange={(e) => setNewTraining({...newTraining, keyword: e.target.value})}
                      placeholder="Ex: dor de cabeça"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Categoria
                    </label>
                    <select
                      value={newTraining.category}
                      onChange={(e) => setNewTraining({...newTraining, category: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      <option value="general">Geral</option>
                      <option value="medical">Médico</option>
                      <option value="cannabis">Cannabis</option>
                      <option value="neurology">Neurologia</option>
                      <option value="nephrology">Nefrologia</option>
                      <option value="evaluation">Avaliação</option>
                    </select>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mensagem do Usuário
                  </label>
                  <textarea
                    value={newTraining.userMessage}
                    onChange={(e) => setNewTraining({...newTraining, userMessage: e.target.value})}
                    placeholder="Ex: Estou com dor de cabeça há 3 dias..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Resposta da NOA
                  </label>
                  <textarea
                    value={newTraining.aiResponse}
                    onChange={(e) => setNewTraining({...newTraining, aiResponse: e.target.value})}
                    placeholder="Ex: Entendo sua preocupação com a dor de cabeça. Vamos investigar as possíveis causas..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confiança: {newTraining.confidence.toFixed(1)}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={newTraining.confidence}
                    onChange={(e) => setNewTraining({...newTraining, confidence: parseFloat(e.target.value)})}
                    className="w-full"
                  />
                </div>

                <div className="mt-6">
                  <button
                    onClick={handleAddTraining}
                    className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                  >
                    <i className="fas fa-plus mr-2"></i>
                    Adicionar Treinamento
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Tab: Editar Respostas */}
          {activeTab === 'edit' && (
            <div className="space-y-6">
              <div className="bg-white border rounded-lg">
                <div className="p-4 border-b">
                  <h3 className="text-lg font-semibold">✏️ Respostas Existentes</h3>
                </div>
                <div className="divide-y">
                  {loading ? (
                    <div className="p-8 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto"></div>
                      <p className="mt-2 text-gray-500">Carregando...</p>
                    </div>
                  ) : learningData.length > 0 ? (
                    learningData.map((item) => (
                      <div key={item.id} className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-medium text-gray-900">{item.keyword}</span>
                              <span className={`px-2 py-1 rounded-full text-xs ${getCategoryColor(item.category)}`}>
                                {item.category}
                              </span>
                              <span className="text-sm text-gray-500">
                                Confiança: {(item.confidence_score * 100).toFixed(0)}%
                              </span>
                            </div>
                            <div className="text-sm text-gray-600 mb-1">
                              <strong>Usuário:</strong> {item.user_message}
                            </div>
                            <div className="text-sm text-gray-700">
                              <strong>NOA:</strong> {item.ai_response}
                            </div>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <button
                              onClick={() => {
                                setEditingItem(item)
                                setEditForm({
                                  keyword: item.keyword,
                                  userMessage: item.user_message,
                                  aiResponse: item.ai_response,
                                  category: item.category,
                                  confidence: item.confidence_score
                                })
                              }}
                              className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => handleDeleteTraining(item.id)}
                              className="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                            >
                              Excluir
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-gray-500">
                      Nenhuma resposta encontrada
                    </div>
                  )}
                </div>
              </div>

              {/* Modal de Edição */}
              {editingItem && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
                  <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
                    <div className="bg-blue-600 text-white p-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold">Editar Resposta</h3>
                        <button
                          onClick={() => setEditingItem(null)}
                          className="text-white hover:text-gray-200 text-xl"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                    
                    <div className="p-6 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Palavra-chave
                          </label>
                          <input
                            type="text"
                            value={editForm.keyword}
                            onChange={(e) => setEditForm({...editForm, keyword: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Categoria
                          </label>
                          <select
                            value={editForm.category}
                            onChange={(e) => setEditForm({...editForm, category: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="general">Geral</option>
                            <option value="medical">Médico</option>
                            <option value="cannabis">Cannabis</option>
                            <option value="neurology">Neurologia</option>
                            <option value="nephrology">Nefrologia</option>
                            <option value="evaluation">Avaliação</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Mensagem do Usuário
                        </label>
                        <textarea
                          value={editForm.userMessage}
                          onChange={(e) => setEditForm({...editForm, userMessage: e.target.value})}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Resposta da NOA
                        </label>
                        <textarea
                          value={editForm.aiResponse}
                          onChange={(e) => setEditForm({...editForm, aiResponse: e.target.value})}
                          rows={4}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div className="flex justify-end space-x-3 pt-4">
                        <button
                          onClick={() => setEditingItem(null)}
                          className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={handleEditTraining}
                          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                        >
                          Salvar Alterações
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab: Validar Qualidade */}
          {activeTab === 'validate' && (
            <div className="space-y-6">
              <div className="bg-yellow-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-yellow-800 mb-4">✅ Validação de Qualidade</h3>
                <p className="text-yellow-700 mb-4">
                  Esta funcionalidade permitirá validar a qualidade das respostas da IA, 
                  identificar inconsistências e sugerir melhorias.
                </p>
                <div className="bg-yellow-100 p-4 rounded-lg">
                  <p className="text-yellow-800 text-sm">
                    <i className="fas fa-info-circle mr-2"></i>
                    Funcionalidade em desenvolvimento. Em breve você poderá:
                  </p>
                  <ul className="list-disc list-inside text-yellow-700 text-sm mt-2 space-y-1">
                    <li>Validar respostas automaticamente</li>
                    <li>Identificar respostas de baixa qualidade</li>
                    <li>Sugerir melhorias nas respostas</li>
                    <li>Gerar relatórios de qualidade</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ManualTrainingModal

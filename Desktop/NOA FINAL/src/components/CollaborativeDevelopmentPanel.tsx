/**
 * Painel de Desenvolvimento Colaborativo
 * Interface para criar funcionalidades junto com a Nôa
 */

import React, { useState, useEffect } from 'react'
import { collaborativeDevelopmentService, DevelopmentTask, CodeGeneration } from '../services/collaborativeDevelopmentService'

interface CollaborativeDevelopmentPanelProps {
  isVisible: boolean
  onClose: () => void
}

const CollaborativeDevelopmentPanel: React.FC<CollaborativeDevelopmentPanelProps> = ({
  isVisible,
  onClose
}) => {
  const [activeTasks, setActiveTasks] = useState<DevelopmentTask[]>([])
  const [codeHistory, setCodeHistory] = useState<CodeGeneration[]>([])
  const [newTaskInput, setNewTaskInput] = useState('')
  const [selectedTask, setSelectedTask] = useState<DevelopmentTask | null>(null)

  useEffect(() => {
    if (isVisible) {
      loadTasks()
      loadCodeHistory()
    }
  }, [isVisible])

  const loadTasks = () => {
    const tasks = collaborativeDevelopmentService.getActiveTasks()
    setActiveTasks(tasks)
  }

  const loadCodeHistory = () => {
    const history = collaborativeDevelopmentService.getCodeHistory()
    setCodeHistory(history)
  }

  const handleCreateTask = async () => {
    if (!newTaskInput.trim()) return

    try {
      const task = await collaborativeDevelopmentService.startDevelopmentTask(newTaskInput)
      const codeGenerations = await collaborativeDevelopmentService.generateCode(task, newTaskInput)
      
      setActiveTasks(prev => [...prev, task])
      setCodeHistory(prev => [...prev, ...codeGenerations])
      setNewTaskInput('')
      
      // Mostrar resultado na interface
      alert(`✅ Tarefa "${task.title}" criada com sucesso!\n\nArquivos gerados:\n${codeGenerations.map(gen => `• ${gen.fileName}`).join('\n')}`)
    } catch (error) {
      console.error('Erro ao criar tarefa:', error)
      alert('❌ Erro ao criar tarefa de desenvolvimento')
    }
  }

  const handleCompleteTask = (taskId: string) => {
    collaborativeDevelopmentService.completeTask(taskId)
    loadTasks()
  }

  const handleUpdateProgress = (taskId: string, progress: number) => {
    collaborativeDevelopmentService.updateTaskProgress(taskId, progress)
    loadTasks()
  }

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-slate-900 rounded-2xl border border-purple-500/30 shadow-2xl w-full max-w-6xl max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-purple-500/30 bg-gradient-to-r from-purple-900/30 to-blue-900/30">
          <div>
            <h2 className="text-xl font-bold text-white">🚀 Desenvolvimento Colaborativo</h2>
            <p className="text-gray-400 text-sm mt-1">Crie funcionalidades junto com a Nôa Esperanza</p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors"
            title="Fechar painel"
          >
            <i className="fas fa-times text-lg" />
          </button>
        </div>

        <div className="flex h-[calc(85vh-100px)]">
          {/* Sidebar - Tarefas Ativas */}
          <div className="w-1/3 border-r border-white/10 p-4 overflow-y-auto">
            <div className="space-y-6">
              {/* Criar Nova Tarefa */}
              <div className="bg-slate-800 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-3">📝 Nova Tarefa</h3>
                <textarea
                  value={newTaskInput}
                  onChange={(e) => setNewTaskInput(e.target.value)}
                  placeholder="Descreva o que você quer criar..."
                  className="w-full bg-slate-700 text-white rounded-lg p-3 resize-none h-24 focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <button
                  onClick={handleCreateTask}
                  disabled={!newTaskInput.trim()}
                  className="w-full mt-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  🚀 Criar Tarefa
                </button>
              </div>

              {/* Tarefas Ativas */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">🔄 Tarefas Ativas</h3>
                <div className="space-y-3">
                  {activeTasks.length === 0 ? (
                    <div className="text-gray-400 text-center py-8">
                      <i className="fas fa-code text-3xl mb-2 block" />
                      <p>Nenhuma tarefa ativa</p>
                      <p className="text-sm">Crie uma nova tarefa para começar!</p>
                    </div>
                  ) : (
                    activeTasks.map(task => (
                      <div
                        key={task.id}
                        className={`bg-slate-800 rounded-lg p-4 cursor-pointer transition-colors ${
                          selectedTask?.id === task.id ? 'ring-2 ring-blue-500' : 'hover:bg-slate-700'
                        }`}
                        onClick={() => setSelectedTask(task)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-white text-sm">{task.title}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            task.status === 'completed' ? 'bg-green-600' :
                            task.status === 'in_progress' ? 'bg-blue-600' :
                            'bg-gray-600'
                          }`}>
                            {task.status}
                          </span>
                        </div>
                        
                        <p className="text-gray-400 text-xs mb-3 line-clamp-2">{task.description}</p>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-400">Progresso</span>
                            <span className="text-white font-medium">{task.progress}%</span>
                          </div>
                          <div className="w-full bg-slate-700 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${task.progress}%` }}
                            />
                          </div>
                        </div>

                        <div className="flex gap-2 mt-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              const newProgress = Math.min(100, task.progress + 25)
                              handleUpdateProgress(task.id, newProgress)
                            }}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs transition-colors"
                          >
                            +25%
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleCompleteTask(task.id)
                            }}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-xs transition-colors"
                          >
                            ✓ Concluir
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content - Detalhes da Tarefa */}
          <div className="flex-1 p-4 overflow-y-auto">
            {selectedTask ? (
              <div className="space-y-6">
                {/* Detalhes da Tarefa */}
                <div className="bg-slate-800 rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-white">{selectedTask.title}</h3>
                      <p className="text-gray-400 mt-1">{selectedTask.description}</p>
                    </div>
                    <div className="text-right">
                      <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                        selectedTask.status === 'completed' ? 'bg-green-600' :
                        selectedTask.status === 'in_progress' ? 'bg-blue-600' :
                        'bg-gray-600'
                      }`}>
                        {selectedTask.status}
                      </div>
                      <p className="text-gray-400 text-sm mt-1">Progresso: {selectedTask.progress}%</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="text-gray-400 text-sm">Tipo</label>
                      <p className="text-white font-medium">{selectedTask.type}</p>
                    </div>
                    <div>
                      <label className="text-gray-400 text-sm">Prioridade</label>
                      <p className={`font-medium ${
                        selectedTask.priority === 'critical' ? 'text-red-400' :
                        selectedTask.priority === 'high' ? 'text-orange-400' :
                        selectedTask.priority === 'medium' ? 'text-yellow-400' :
                        'text-green-400'
                      }`}>
                        {selectedTask.priority}
                      </p>
                    </div>
                  </div>

                  {selectedTask.aiSuggestion && (
                    <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                      <h4 className="text-blue-400 font-semibold mb-2">💡 Sugestão da Nôa</h4>
                      <p className="text-blue-200">{selectedTask.aiSuggestion}</p>
                    </div>
                  )}
                </div>

                {/* Arquivos Gerados */}
                {selectedTask.files.length > 0 && (
                  <div className="bg-slate-800 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">📁 Arquivos Gerados</h3>
                    <div className="space-y-2">
                      {selectedTask.files.map(file => {
                        const codeGen = codeHistory.find(gen => gen.fileName === file)
                        return (
                          <div key={file} className="bg-slate-700 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium text-white">{file}</h4>
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                codeGen?.type === 'create' ? 'bg-green-600' :
                                codeGen?.type === 'modify' ? 'bg-yellow-600' :
                                'bg-red-600'
                              }`}>
                                {codeGen?.type}
                              </span>
                            </div>
                            <p className="text-gray-400 text-sm">{codeGen?.description}</p>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Histórico de Código */}
                {codeHistory.length > 0 && (
                  <div className="bg-slate-800 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">📜 Histórico de Código</h3>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {codeHistory.slice(-10).map((gen, index) => (
                        <div key={index} className="bg-slate-700 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-white">{gen.fileName}</h4>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              gen.type === 'create' ? 'bg-green-600' :
                              gen.type === 'modify' ? 'bg-yellow-600' :
                              'bg-red-600'
                            }`}>
                              {gen.type}
                            </span>
                          </div>
                          <p className="text-gray-400 text-sm">{gen.description}</p>
                          {gen.dependencies.length > 0 && (
                            <div className="mt-2">
                              <span className="text-gray-500 text-xs">Dependências: </span>
                              <span className="text-blue-400 text-xs">{gen.dependencies.join(', ')}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <i className="fas fa-code text-6xl text-gray-600 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-400 mb-2">Selecione uma Tarefa</h3>
                  <p className="text-gray-500">Escolha uma tarefa na barra lateral para ver os detalhes</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CollaborativeDevelopmentPanel

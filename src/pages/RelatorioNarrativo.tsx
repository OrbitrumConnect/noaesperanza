import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Specialty } from '../App'
import { supabase } from '../integrations/supabase/client'

interface RelatorioNarrativoProps {
  currentSpecialty: Specialty
  addNotification: (message: string, type?: 'info' | 'success' | 'warning' | 'error') => void
}

interface Avaliacao {
  id: string
  session_id: string
  apresentacao: string
  relatorio_narrativo: string
  status: string
  created_at: string
  completed_at: string
}

const RelatorioNarrativo = ({ currentSpecialty, addNotification }: RelatorioNarrativoProps) => {
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedAvaliacao, setSelectedAvaliacao] = useState<Avaliacao | null>(null)

  useEffect(() => {
    carregarAvaliacoes()
  }, [])

  const carregarAvaliacoes = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('avaliacoes_iniciais')
        .select('*')
        .eq('status', 'completed')
        .order('completed_at', { ascending: false })
        .limit(10)

      if (error) {
        console.error('Erro ao carregar avaliações:', error)
        addNotification('Erro ao carregar avaliações', 'error')
      } else {
        setAvaliacoes(data || [])
        if (data && data.length > 0) {
          setSelectedAvaliacao(data[0])
        }
      }
    } catch (error) {
      console.error('Erro:', error)
      addNotification('Erro ao carregar dados', 'error')
    } finally {
      setLoading(false)
    }
  }

  const downloadRelatorio = (avaliacao: Avaliacao) => {
    if (!avaliacao.relatorio_narrativo) {
      addNotification('Relatório não disponível', 'warning')
      return
    }

    const blob = new Blob([avaliacao.relatorio_narrativo], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `relatorio_avaliacao_${avaliacao.session_id}.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    
    addNotification('Relatório baixado com sucesso', 'success')
  }

  if (loading) {
    return (
      <div className="h-full overflow-hidden flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-gray-300">Carregando relatórios...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 py-4 h-full">
        <div className="flex items-center justify-between mb-4">
          <Link to="/" className="inline-block text-yellow-400 hover:text-yellow-300">
            <i className="fas fa-arrow-left text-xl"></i> Voltar
          </Link>
          <h1 className="text-2xl font-bold text-premium">Relatórios Narrativos</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-120px)]">
          
          {/* Lista de Avaliações */}
          <div className="premium-card p-4">
            <h2 className="text-lg font-semibold text-premium mb-4">Avaliações Concluídas</h2>
            <div className="space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto">
              {avaliacoes.length === 0 ? (
                <div className="text-center text-gray-400 py-8">
                  <i className="fas fa-file-alt text-4xl mb-4"></i>
                  <p>Nenhuma avaliação concluída</p>
                </div>
              ) : (
                avaliacoes.map((avaliacao) => (
                  <div
                    key={avaliacao.id}
                    onClick={() => setSelectedAvaliacao(avaliacao)}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedAvaliacao?.id === avaliacao.id
                        ? 'bg-yellow-500/20 border border-yellow-500/50'
                        : 'bg-gray-800/30 hover:bg-gray-700/30'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-medium text-sm">
                          {avaliacao.apresentacao || 'Avaliação Anônima'}
                        </p>
                        <p className="text-gray-400 text-xs">
                          {new Date(avaliacao.completed_at).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-green-400 text-xs">✓</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            downloadRelatorio(avaliacao)
                          }}
                          className="text-blue-400 hover:text-blue-300 text-xs"
                          title="Baixar relatório"
                        >
                          <i className="fas fa-download"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Visualização do Relatório */}
          <div className="lg:col-span-2 premium-card p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-premium">Relatório Narrativo</h2>
              {selectedAvaliacao && (
                <button
                  onClick={() => downloadRelatorio(selectedAvaliacao)}
                  className="premium-button text-sm"
                >
                  <i className="fas fa-download mr-2"></i>
                  Baixar PDF
                </button>
              )}
            </div>
            
            <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
              {selectedAvaliacao ? (
                <div className="prose prose-invert max-w-none">
                  <pre className="whitespace-pre-wrap text-gray-300 text-sm leading-relaxed font-mono">
                    {selectedAvaliacao.relatorio_narrativo || 'Relatório não disponível'}
                  </pre>
                </div>
              ) : (
                <div className="text-center text-gray-400 py-12">
                  <i className="fas fa-file-alt text-6xl mb-4"></i>
                  <p className="text-xl">Selecione uma avaliação</p>
                  <p className="text-sm">Escolha uma avaliação da lista para visualizar o relatório</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RelatorioNarrativo

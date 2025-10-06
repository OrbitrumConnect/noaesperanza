import { Link } from 'react-router-dom'
import { Specialty } from '../App'

interface RelatorioNarrativoProps {
  currentSpecialty: Specialty
  addNotification: (message: string, type?: 'info' | 'success' | 'warning' | 'error') => void
}

const RelatorioNarrativo = ({ currentSpecialty, addNotification }: RelatorioNarrativoProps) => {
  return (
    <div className="h-full overflow-hidden flex items-center justify-center">
      <div className="max-w-4xl mx-auto px-6 w-full">
        <div className="premium-card text-center">
          <Link to="/" className="inline-block text-yellow-400 hover:text-yellow-300 mb-6">
            <i className="fas fa-arrow-left text-xl"></i> Voltar
          </Link>
          
          <h1 className="text-3xl font-bold text-premium mb-4">Relatório Narrativo</h1>
          
          <div className="text-center py-12">
            <i className="fas fa-chart-line text-6xl text-purple-400 mb-6"></i>
            <p className="text-xl text-gray-300 mb-4">Relatório Narrativo em Desenvolvimento</p>
            <p className="text-gray-400">
              Funcionalidades para geração de relatórios narrativos detalhados sobre 
              pacientes e tratamentos serão implementadas em breve.
            </p>
            
            <button
              onClick={() => addNotification('Relatório narrativo em desenvolvimento', 'info')}
              className="premium-button mt-6"
            >
              Notificar quando estiver pronto
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RelatorioNarrativo

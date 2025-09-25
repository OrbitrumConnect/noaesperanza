import { Link } from 'react-router-dom'

interface ConfiguracoesProps {
  addNotification: (message: string, type?: 'info' | 'success' | 'warning' | 'error') => void
}

const Configuracoes = ({ addNotification }: ConfiguracoesProps) => {
  return (
    <div className="h-full overflow-hidden flex items-center justify-center">
      <div className="max-w-4xl mx-auto px-6 w-full">
        <div className="premium-card text-center">
          <Link to="/" className="inline-block text-yellow-400 hover:text-yellow-300 mb-6">
            <i className="fas fa-arrow-left text-xl"></i> Voltar
          </Link>
          
          <h1 className="text-3xl font-bold text-premium mb-4">Configurações</h1>
          
          <div className="text-center py-12">
            <i className="fas fa-cogs text-6xl text-blue-400 mb-6"></i>
            <p className="text-xl text-gray-300 mb-4">Configurações em Desenvolvimento</p>
            <p className="text-gray-400">
              Painel de configurações para personalização da interface, preferências do usuário 
              e configurações do sistema serão implementadas em breve.
            </p>
            
            <button
              onClick={() => addNotification('Configurações em desenvolvimento', 'info')}
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

export default Configuracoes

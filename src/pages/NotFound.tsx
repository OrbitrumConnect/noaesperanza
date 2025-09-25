import { Link } from 'react-router-dom'

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md mx-auto px-6">
        <div className="premium-card text-center">
          <div className="text-8xl text-yellow-400 mb-6">404</div>
          <h1 className="text-2xl font-bold text-premium mb-4">Página Não Encontrada</h1>
          <p className="text-gray-400 mb-8">
            A página que você está procurando não existe ou foi movida.
          </p>
          
          <Link to="/" className="premium-button inline-flex items-center gap-2">
            <i className="fas fa-home"></i>
            <span>Voltar para Home</span>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default NotFound

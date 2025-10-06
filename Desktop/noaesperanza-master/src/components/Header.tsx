import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Specialty } from '../App'
import { useAuth } from '../contexts/AuthContext'

interface HeaderProps {
  currentSpecialty: Specialty
  setCurrentSpecialty: (specialty: Specialty) => void
}

const Header = ({ currentSpecialty, setCurrentSpecialty }: HeaderProps) => {
  const auth = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  
  // Verificação de segurança para evitar erros durante a inicialização
  const { user, signOut } = auth || { user: null, signOut: () => {} }
  
  // Agora temos um laboratório unificado
  const labInfo = {
    name: 'NOA Esperanza',
    fullName: 'Neurologia • Cannabis • Rim',
    icon: 'fa-flask',
    description: 'Assistente IA Médica Inteligente'
  }

  const handleLogout = async () => {
    try {
      await signOut()
      navigate('/landing')
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
    }
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-[200] h-16 bg-gradient-to-r from-gray-900/95 via-purple-900/95 to-amber-600/95 backdrop-blur-md shadow-lg border-b border-white/20">
      <div className="flex items-center justify-between h-full px-3 md:px-6 max-w-7xl mx-auto">
        {/* Logo NOA Esperanza */}
        <Link to="/" className="flex items-center gap-2 md:gap-3">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-blue-500 via-green-500 to-yellow-500 rounded-lg flex items-center justify-center overflow-hidden">
            <img 
              src="/logo-noa-triangulo.gif" 
              alt="NOA Esperanza" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="hidden sm:block">
            <div className="text-sm md:text-lg font-bold text-white drop-shadow-md">{labInfo.name}</div>
            <div className="text-xs text-yellow-100 drop-shadow-sm">{labInfo.fullName}</div>
          </div>
        </Link>

        {/* Status do Laboratório */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30">
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            </div>
            <span className="text-sm font-medium text-white drop-shadow-md">Lab Online</span>
          </div>
        </div>

        {/* Menu de Navegação Principal */}
        <nav className="hidden lg:flex gap-3">
          <Link to="/paciente" className="nav-item text-sm">
            <i className="fas fa-user text-sm"></i>
            <span className="text-sm">Paciente</span>
          </Link>
          <Link to="/medico" className="nav-item text-sm">
            <i className="fas fa-user-md text-sm"></i>
            <span className="text-sm">Médico</span>
          </Link>
          <Link to="/checkout" className="nav-item text-sm">
            <i className="fas fa-credit-card text-sm"></i>
            <span className="text-sm">Pagar</span>
          </Link>
          <Link to="/admin" className="nav-item text-sm">
            <i className="fas fa-cog text-sm"></i>
            <span className="text-sm">Admin</span>
          </Link>
        </nav>

        {/* Seção do Usuário */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Menu adicional - oculto no mobile */}
          <div className="hidden md:flex items-center gap-3">
            <Link to="/paciente" className="text-white/80 hover:text-yellow-300 transition-colors">
              <i className="fas fa-user text-sm"></i>
            </Link>
            <Link to="/checkout" className="text-white/80 hover:text-yellow-300 transition-colors">
              <i className="fas fa-credit-card text-sm"></i>
            </Link>
            <Link to="/config" className="text-white/80 hover:text-yellow-300 transition-colors">
              <i className="fas fa-cog text-sm"></i>
            </Link>
          </div>

          {/* Avatar e Logout - não mostrar na landing page */}
          {location.pathname !== '/landing' && (
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-xs md:text-sm">
                  {user?.email?.charAt(0).toUpperCase() || 'A'}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="text-white/80 hover:text-red-400 transition-colors"
                title="Sair"
              >
                <i className="fas fa-sign-out-alt text-sm"></i>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header

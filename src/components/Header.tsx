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
      <div className="flex items-center justify-between h-full px-6 max-w-7xl mx-auto">
        {/* Logo NOA Esperanza */}
        {location.pathname === '/landing' ? (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 via-green-500 to-yellow-500 rounded-lg flex items-center justify-center overflow-hidden">
              <img 
                src="/logo-noa-triangulo.gif" 
                alt="NOA Esperanza" 
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="text-lg font-bold text-white drop-shadow-md">{labInfo.name}</div>
              <div className="text-xs text-yellow-100 drop-shadow-sm">{labInfo.fullName}</div>
            </div>
          </div>
        ) : (
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 via-green-500 to-yellow-500 rounded-lg flex items-center justify-center overflow-hidden">
              <img 
                src="/logo-noa-triangulo.gif" 
                alt="NOA Esperanza" 
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="text-lg font-bold text-white drop-shadow-md">{labInfo.name}</div>
              <div className="text-xs text-yellow-100 drop-shadow-sm">{labInfo.fullName}</div>
            </div>
          </Link>
        )}


        {/* Menu de Navegação Principal - não mostrar na landing page */}
        {location.pathname !== '/landing' && (
          <nav className="hidden lg:flex gap-1">
            <Link to="/avaliacao-clinica" className="nav-item text-xs px-2 py-1">
              <i className="fas fa-stethoscope text-xs"></i>
              <span className="text-xs">Avaliação</span>
            </Link>
            <Link to="/ensino" className="nav-item text-xs px-2 py-1">
              <i className="fas fa-graduation-cap text-xs"></i>
              <span className="text-xs">Ensino</span>
            </Link>
            <Link to="/pesquisa" className="nav-item text-xs px-2 py-1">
              <i className="fas fa-flask text-xs"></i>
              <span className="text-xs">Pesquisa</span>
            </Link>
            <Link to="/medcann-lab" className="nav-item text-xs px-2 py-1">
              <i className="fas fa-leaf text-xs"></i>
              <span className="text-xs">MedCann</span>
            </Link>
          </nav>
        )}

        {/* Seção do Usuário - não mostrar na landing page */}
        {location.pathname !== '/landing' && (
          <div className="flex items-center gap-4">
            {/* Menu adicional - ícones compactos */}
            <div className="flex items-center gap-2">
              <Link to="/paciente" className="text-white/80 hover:text-yellow-300 transition-colors" title="Paciente">
                <i className="fas fa-user text-lg"></i>
              </Link>
              <Link to="/medico" className="text-white/80 hover:text-yellow-300 transition-colors" title="Médico">
                <i className="fas fa-user-md text-lg"></i>
              </Link>
              <Link to="/checkout" className="text-white/80 hover:text-yellow-300 transition-colors" title="Pagamento">
                <i className="fas fa-credit-card text-lg"></i>
              </Link>
              <Link to="/admin" className="text-white/80 hover:text-yellow-300 transition-colors" title="Admin">
                <i className="fas fa-cog text-lg"></i>
              </Link>
            </div>

            {/* Avatar e Logout */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
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
          </div>
        )}
      </div>
    </header>
  )
}

export default Header

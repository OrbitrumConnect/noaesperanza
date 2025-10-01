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
    name: 'MedCanLab @ Power By Nôa Esperanza',
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
        {/* Logo MedCanLab */}
        {location.pathname === '/landing' ? (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 via-green-500 to-yellow-500 rounded-lg flex items-center justify-center overflow-hidden">
              <img 
                src="/logo-noa-triangulo.gif" 
                alt="MedCanLab" 
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="text-lg font-bold text-white drop-shadow-md">
                MedCanLab <span className="text-sm font-normal text-yellow-200">@ Power By Nôa Esperanza</span>
              </div>
              <div className="text-xs text-yellow-100 drop-shadow-sm">{labInfo.fullName}</div>
            </div>
          </div>
        ) : (
          <Link to="/app/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 via-green-500 to-yellow-500 rounded-lg flex items-center justify-center overflow-hidden">
              <img 
                src="/logo-noa-triangulo.gif" 
                alt="MedCanLab" 
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="text-lg font-bold text-white drop-shadow-md">
                MedCanLab <span className="text-sm font-normal text-yellow-200">@ Power By Nôa Esperanza</span>
              </div>
              <div className="text-xs text-yellow-100 drop-shadow-sm">{labInfo.fullName}</div>
            </div>
          </Link>
        )}


        {/* Menu de Tipos de Usuário - não mostrar na landing page */}
        {location.pathname !== '/landing' && (
          <nav className="hidden lg:flex gap-1">
            <Link to="/app/paciente" className="nav-item text-xs px-3 py-2">
              <i className="fas fa-user text-xs"></i>
              <span className="text-xs">Paciente</span>
            </Link>
            <Link to="/app/medico" className="nav-item text-xs px-3 py-2">
              <i className="fas fa-user-md text-xs"></i>
              <span className="text-xs">Médico</span>
            </Link>
            <Link to="/app/estudante" className="nav-item text-xs px-3 py-2">
              <i className="fas fa-graduation-cap text-xs"></i>
              <span className="text-xs">Estudante</span>
            </Link>
            <Link to="/app/checkout" className="nav-item text-xs px-3 py-2">
              <i className="fas fa-credit-card text-xs"></i>
              <span className="text-xs">Pagar</span>
            </Link>
            {/* Mostrar ADM/CONFIG apenas para administradores */}
            {user?.user_metadata?.role === 'admin' && (
              <Link to="/app/admin" className="nav-item text-xs px-3 py-2">
                <i className="fas fa-cog text-xs"></i>
                <span className="text-xs">ADM/CONFIG</span>
              </Link>
            )}
          </nav>
        )}

        {/* Seção do Usuário - não mostrar na landing page */}
        {location.pathname !== '/landing' && (
          <div className="flex items-center gap-4">
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

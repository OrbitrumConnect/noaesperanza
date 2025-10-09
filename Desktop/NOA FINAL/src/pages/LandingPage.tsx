import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { Specialty } from '../App'
import { useAuth } from '../contexts/AuthContext'

const LandingPage = () => {
  const [currentFeature, setCurrentFeature] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const [currentSpecialty, setCurrentSpecialty] = useState<Specialty>('rim')
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
  
  const { signIn, signUp, user, loading } = useAuth()
  const navigate = useNavigate()
  
  useEffect(() => {
    setIsVisible(true)
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % 3)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  // Redirecionar se já estiver logado
  useEffect(() => {
    if (user) {
      navigate('/app/')
    }
  }, [user, navigate])

  // Aguardar carregamento do AuthContext
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center" style={{
        background: 'linear-gradient(135deg, #000000 0%, #011d15 25%, #022f43 50%, #022f43 70%, #450a0a 85%, #78350f 100%)'
      }}>
        <div className="text-white text-xl">Carregando...</div>
      </div>
    )
  }

  const handleAuth = async (email: string, password: string, userData?: any) => {
    try {
      if (authMode === 'login') {
        await signIn(email, password)
      } else {
        await signUp(email, password, userData || {})
      }
      setShowAuthModal(false)
      navigate('/app/')
    } catch (error) {
      console.error('Erro na autenticação:', error)
    }
  }

  const features = [
    {
      title: "Chat Inteligente com Nôa",
      description: "Converse com Nôa Esperanza, IA especializada em medicina do MedCanLab",
      icon: "🤖",
      color: "from-blue-500 to-cyan-500"
    },
    {
      title: "Telemedicina Avançada",
      description: "Consultas online com especialistas",
      icon: "🏥",
      color: "from-green-500 to-emerald-500"
    },
    {
      title: "Gestão Completa",
      description: "Prontuários, exames e prescrições digitais",
      icon: "📋",
      color: "from-purple-500 to-pink-500"
    }
  ]

  const specialties = [
    {
      name: "Nefrologia",
      icon: "🫘",
      description: "Especialistas em doenças renais",
      color: "from-blue-600 to-blue-800"
    },
    {
      name: "Neurologia", 
      icon: "🧠",
      description: "Cuidados neurológicos especializados",
      color: "from-purple-600 to-purple-800"
    },
    {
      name: "Cannabis Medicinal",
      icon: "🌿",
      description: "Tratamento com cannabis medicinal",
      color: "from-green-600 to-green-800"
    }
  ]

  const plans = [
    {
      name: "Básico",
      price: "R$ 97",
      period: "/mês",
      features: ["Chat com NOA", "1 Consulta/mês", "Relatórios básicos"],
      color: "from-gray-600 to-gray-800",
      popular: false
    },
    {
      name: "Premium",
      price: "R$ 197", 
      period: "/mês",
      features: ["Consultas ilimitadas", "Suporte prioritário", "Telemedicina", "Relatórios avançados"],
      color: "from-green-600 to-green-800",
      popular: true
    },
    {
      name: "Enterprise",
      price: "R$ 397",
      period: "/mês", 
      features: ["Tudo do Premium", "Consultoria personalizada", "API Access", "Suporte 24/7"],
      color: "from-blue-600 to-blue-800",
      popular: false
    }
  ]

  return (
    <div className="h-full overflow-hidden">
      {/* Header */}
      <Header 
        currentSpecialty={currentSpecialty}
        setCurrentSpecialty={setCurrentSpecialty}
      />
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 pt-20">
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(135deg, #000000 0%, #011d15 25%, #022f43 50%, #022f43 70%, #450a0a 85%, #78350f 100%)'
        }}></div>
        <div className="relative z-10 max-w-6xl mx-auto mt-16 w-full">
          <div
            className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} text-center`}
          >
            {/* Logo NOA */}
            <div className="mb-8">
              <div className="w-[147px] h-[147px] mx-auto mb-6 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-green-500 to-yellow-500 rounded-full animate-pulse"></div>
                <img
                  src="/logo-noa-triangulo.gif"
                  alt="MedCanLab"
                  className="relative w-full h-full object-cover rounded-full border-4 border-white/20"
                />
              </div>
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold bg-gradient-to-r from-blue-400 via-green-400 to-yellow-400 bg-clip-text text-transparent mb-4">
                MEDCANLAB
              </h1>
              <p className="text-lg md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
                MedCanLab @ Power By Nôa Esperanza<br />
                A revolução da medicina digital com inteligência artificial especializada
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-16">
              <button
                onClick={() => {
                  setAuthMode('register')
                  setShowAuthModal(true)
                }}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white font-semibold rounded-lg hover:from-green-600 hover:to-blue-600 transition-all duration-300 text-center"
              >
                Começar Agora
              </button>
              <button
                onClick={() => {
                  setAuthMode('login')
                  setShowAuthModal(true)
                }}
                className="px-6 py-3 border-2 border-white/30 text-white font-semibold rounded-lg hover:bg-white/10 transition-all duration-300 text-center"
              >
                Já tenho conta
              </button>
            </div>
          </div>
        </div>

        {/* Floating Elements */}
      </section>

      {/* Features Section - Como Funciona */}
      <section className="py-16 px-4 bg-black">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-white mb-12">
            Como Funciona
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="premium-card p-8 text-center group hover:scale-105 transition-all duration-300">
                <div className={`w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r ${feature.color} flex items-center justify-center text-3xl group-hover:scale-110 transition-transform duration-300`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-4">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Specialties Section - Simplificada */}
      <section className="py-12 px-4 bg-black">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-white mb-8">
            Especialidades
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {specialties.map((specialty, index) => (
              <div key={index} className="premium-card p-6 text-center">
                <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r ${specialty.color} flex items-center justify-center text-2xl`}>
                  {specialty.icon}
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{specialty.name}</h3>
                <p className="text-gray-400 text-sm">{specialty.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Plans Section - Simplificada */}
      <section className="py-12 px-4 bg-gradient-to-b from-black to-gray-900">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-white mb-8">
            Planos e Preços
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan, index) => (
              <div 
                key={index} 
                className={`premium-card p-6 relative ${plan.popular ? 'ring-2 ring-green-500' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      Popular
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-6">
                  <h3 className="text-lg font-bold text-white mb-2">{plan.name}</h3>
                  <div className="flex items-baseline justify-center">
                    <span className="text-2xl font-bold text-white">{plan.price}</span>
                    <span className="text-gray-400 ml-1 text-sm">{plan.period}</span>
                  </div>
                </div>
                
                <ul className="space-y-2 mb-6 text-sm">
                  {plan.features.slice(0, 3).map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center text-gray-300">
                      <span className="text-green-400 mr-2">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
                
                <Link 
                  to="/checkout"
                  className={`w-full py-2 rounded-lg font-semibold text-center transition-all duration-300 text-sm ${
                    plan.popular 
                      ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white hover:from-green-600 hover:to-blue-600' 
                      : 'bg-gray-700 text-white hover:bg-gray-600'
                  }`}
                >
                  Escolher
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* Footer */}
      <Footer />

      {/* Modal de Autenticação */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="premium-card w-full max-w-md">
            {/* Header */}
            <div className="p-4 border-b border-white/20 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">
                {authMode === 'login' ? 'Entrar' : 'Cadastrar'}
              </h2>
              <button 
                onClick={() => setShowAuthModal(false)} 
                className="text-white hover:text-gray-300 text-2xl transition-colors"
              >
                ×
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <AuthForm 
                mode={authMode} 
                onSubmit={handleAuth}
                onSwitchMode={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
              />
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

// Componente de Formulário de Autenticação
const AuthForm: React.FC<{
  mode: 'login' | 'register'
  onSubmit: (email: string, password: string, userData?: any) => void
  onSwitchMode: () => void
}> = ({ mode, onSubmit, onSwitchMode }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [userType, setUserType] = useState<'paciente' | 'profissional'>('paciente')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const userData = mode === 'register' ? { 
        name,
        user_type: userType 
      } : undefined
      await onSubmit(email, password, userData)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {mode === 'register' && (
        <>
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-white mb-1">
              Nome Completo
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400"
              placeholder="Seu nome completo"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Tipo de Cadastro
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setUserType('paciente')}
                className={`px-4 py-3 rounded-lg border-2 transition-all duration-300 ${
                  userType === 'paciente'
                    ? 'border-green-500 bg-green-500/20 text-white'
                    : 'border-white/20 bg-white/5 text-gray-400 hover:border-white/40'
                }`}
              >
                <div className="text-2xl mb-1">🏥</div>
                <div className="text-sm font-semibold">Sou Paciente</div>
              </button>
              
              <button
                type="button"
                onClick={() => setUserType('profissional')}
                className={`px-4 py-3 rounded-lg border-2 transition-all duration-300 ${
                  userType === 'profissional'
                    ? 'border-blue-500 bg-blue-500/20 text-white'
                    : 'border-white/20 bg-white/5 text-gray-400 hover:border-white/40'
                }`}
              >
                <div className="text-2xl mb-1">👨‍⚕️</div>
                <div className="text-sm font-semibold">Sou Médico</div>
              </button>
            </div>
          </div>
        </>
      )}

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-white mb-1">
          Email
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400"
          placeholder="seu@email.com"
          required
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-white mb-1">
          Senha
        </label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400"
          placeholder="Sua senha"
          required
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all duration-300 ${
          loading 
            ? 'bg-gray-600 cursor-not-allowed' 
            : 'bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 hover:scale-105'
        }`}
      >
        {loading ? 'Processando...' : (mode === 'login' ? 'Entrar' : 'Cadastrar')}
      </button>

      <div className="text-center">
        <button
          type="button"
          onClick={onSwitchMode}
          className="text-sm text-gray-300 hover:text-white transition-colors"
        >
          {mode === 'login' 
            ? 'Não tem conta? Cadastre-se' 
            : 'Já tem conta? Faça login'
          }
        </button>
      </div>
    </form>
  )
}

export default LandingPage

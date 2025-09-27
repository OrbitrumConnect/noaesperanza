import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { Specialty } from '../App'

const LandingPage = () => {
  const [currentFeature, setCurrentFeature] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const [currentSpecialty, setCurrentSpecialty] = useState<Specialty>('rim')
  

  useEffect(() => {
    setIsVisible(true)
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % 3)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const features = [
    {
      title: "Chat Inteligente com NOA",
      description: "Converse com nossa IA especializada em medicina",
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
      <section className="relative min-h-screen flex items-center justify-center px-4 -mt-[7%]">
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(135deg, #000000 0%, #011d15 25%, #022f43 50%, #022f43 70%, #450a0a 85%, #78350f 100%)'
        }}></div>
        <div className="relative z-10 max-w-6xl mx-auto text-center">
          <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            {/* Logo NOA */}
            <div className="mb-8">
              <div className="w-[147px] h-[147px] mx-auto mb-6 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-green-500 to-yellow-500 rounded-full animate-pulse"></div>
                <img 
                  src="/logo-noa-triangulo.gif" 
                  alt="NOA Esperanza" 
                  className="relative w-full h-full object-cover rounded-full border-4 border-white/20"
                />
              </div>
              <h1 className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-blue-400 via-green-400 to-yellow-400 bg-clip-text text-transparent mb-4">
                NOA ESPERANZA
              </h1>
              <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
                A revolução da medicina digital com inteligência artificial especializada
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link 
                to="/login"
                className="px-8 py-4 bg-gradient-to-r from-green-500 to-blue-500 text-white font-semibold rounded-lg hover:from-green-600 hover:to-blue-600 transform hover:scale-105 transition-all duration-300 text-center"
              >
                Começar Agora
              </Link>
              <Link 
                to="/register"
                className="px-8 py-4 border-2 border-white/30 text-white font-semibold rounded-lg hover:bg-white/10 transition-all duration-300 text-center"
              >
                Cadastrar-se
              </Link>
            </div>
          </div>
        </div>

        {/* Floating Elements */}
      </section>

      {/* Features Section */}
      <section className="py-20 px-4" style={{
        background: 'linear-gradient(135deg, #000000 0%, #011d15 25%, #022f43 50%, #022f43 70%, #450a0a 85%, #78350f 100%)'
      }}>
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center text-white mb-16">
            Como Funciona
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {features.map((feature, index) => (
              <div 
                key={index}
                className={`premium-card p-8 text-center transition-all duration-500 ${
                  currentFeature === index ? 'scale-105 shadow-2xl' : 'opacity-70'
                }`}
              >
                <div className={`w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r ${feature.color} flex items-center justify-center text-3xl`}>
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>

          {/* NOA Demo */}
          <div className="premium-card p-8 max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-shrink-0">
                <div className="w-32 h-32 bg-gradient-to-r from-blue-500 via-green-500 to-yellow-500 rounded-full flex items-center justify-center">
                  <img 
                    src="/logo-noa-triangulo.gif" 
                    alt="NOA" 
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-white mb-4">Conheça a NOA</h3>
                <p className="text-gray-300 mb-4">
                  Nossa assistente virtual especializada em medicina, pronta para ajudar com diagnósticos, 
                  informações médicas e orientações personalizadas.
                </p>
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <p className="text-green-400 italic">"Olá! Sou a NOA, sua assistente médica virtual. Como posso ajudar você hoje?"</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Specialties Section */}
      <section className="py-20 px-4 bg-black">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center text-white mb-16">
            Especialidades
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {specialties.map((specialty, index) => (
              <div key={index} className="premium-card p-8 text-center group hover:scale-105 transition-all duration-300">
                <div className={`w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-r ${specialty.color} flex items-center justify-center text-4xl group-hover:scale-110 transition-transform duration-300`}>
                  {specialty.icon}
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">{specialty.name}</h3>
                <p className="text-gray-400">{specialty.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Plans Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-black to-gray-900">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center text-white mb-16">
            Planos e Preços
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <div 
                key={index} 
                className={`premium-card p-8 relative ${plan.popular ? 'ring-2 ring-green-500 scale-105' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
                      Mais Popular
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-white mb-4">{plan.name}</h3>
                  <div className="flex items-baseline justify-center">
                    <span className="text-4xl font-bold text-white">{plan.price}</span>
                    <span className="text-gray-400 ml-2">{plan.period}</span>
                  </div>
                </div>
                
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center text-gray-300">
                      <span className="text-green-400 mr-3">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
                
                <Link 
                  to="/checkout"
                  className={`w-full py-3 rounded-lg font-semibold text-center transition-all duration-300 ${
                    plan.popular 
                      ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white hover:from-green-600 hover:to-blue-600' 
                      : 'bg-gray-700 text-white hover:bg-gray-600'
                  }`}
                >
                  Escolher Plano
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-900 via-green-900 to-yellow-900">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">
            Pronto para Revolucionar sua Saúde?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Junte-se a milhares de pacientes e médicos que já confiam na NOA Esperanza
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/register"
              className="px-8 py-4 bg-white text-gray-900 font-semibold rounded-lg hover:bg-gray-100 transform hover:scale-105 transition-all duration-300 text-center"
            >
              Começar Gratuitamente
            </Link>
            <Link 
              to="/login"
              className="px-8 py-4 border-2 border-white text-white font-semibold rounded-lg hover:bg-white/10 transition-all duration-300 text-center"
            >
              Já tenho conta
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />

    </div>
  )
}

export default LandingPage

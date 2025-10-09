/**
 * Home Nova - Layout estilo ChatGPT
 * Baseado no GPT personalizado do Dr. Ricardo Valença
 */

import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { personalizedProfilesService } from '../services/personalizedProfilesService'
import { openAIService, ChatMessage as OpenAIMessage } from '../services/openaiService'
import { useAuth } from '../contexts/AuthContext'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
}

interface GPTPreset {
  id: string
  name: string
  icon: string
  description: string
  route?: string
}

const GPT_PRESETS: GPTPreset[] = [
  {
    id: 'explorer',
    name: 'Explorar',
    icon: '🧭',
    description: 'Explore todas as funcionalidades'
  },
  {
    id: 'entrevista',
    name: 'Arte da Entrevista Clínica',
    icon: '🎭',
    description: 'Metodologia clínica do Dr. Ricardo Valença'
  },
  {
    id: 'osteorrenal',
    name: 'Assistente Ósteorrenal',
    icon: '🦴',
    description: 'Especialista em nefrologia e metabolismo ósseo'
  },
  {
    id: 'comunitario',
    name: 'Nôa. Comunitário - EXT-001',
    icon: '🏘️',
    description: 'Saúde comunitária e extensão'
  },
  {
    id: 'juridico',
    name: 'Nôa. Jurídico - JUR-001',
    icon: '⚖️',
    description: 'Assessoria jurídica em saúde'
  },
  {
    id: 'desenvolvimento',
    name: 'Nôa. Desenvolvimento de Pr...',
    icon: '💻',
    description: 'Desenvolvimento de projetos'
  },
  {
    id: 'clinico',
    name: 'Nôa. Clínico - EDU-001',
    icon: '🩺',
    description: 'Assistência clínica educacional'
  },
  {
    id: 'drc',
    name: 'Nôa Esperanza - DRC',
    icon: '💚',
    description: 'Doença Renal Crônica'
  }
]

const STARTER_PROMPTS = [
  'Apresente a Nôa Esperanza para novos usuários',
  'Explique como funciona a integração de...',
  'Mostre como segurança e simbolismo se...',
  'Crie um checklist de boas práticas para a Nôa'
]

const HomeNew: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedGPT, setSelectedGPT] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [activeProfile, setActiveProfile] = useState(personalizedProfilesService.getActiveProfile())

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    // Verificar se há perfil ativo e atualizar
    const profile = personalizedProfilesService.getActiveProfile()
    setActiveProfile(profile)
  }, [])

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      // Verificar reconhecimento de perfil
      const detectedProfile = personalizedProfilesService.detectProfile(input)
      
      if (detectedProfile) {
        personalizedProfilesService.saveActiveProfile(detectedProfile)
        setActiveProfile(detectedProfile)
        
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: detectedProfile.greeting,
          timestamp: new Date()
        }
        
        setMessages(prev => [...prev, assistantMessage])
        setIsLoading(false)
        return
      }

      // Processar com OpenAI
      const conversationHistory: OpenAIMessage[] = messages.map(m => ({
        role: m.role,
        content: m.content
      }))

      const response = await openAIService.getNoaResponse(input, conversationHistory)

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error)
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente.',
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleStarterPrompt = (prompt: string) => {
    setInput(prompt)
  }

  const handleGPTClick = (gpt: GPTPreset) => {
    if (gpt.route) {
      navigate(gpt.route)
    } else {
      setSelectedGPT(gpt.id)
      setInput(`Ativar modo ${gpt.name}`)
    }
  }

  return (
    <div className="h-screen flex bg-[#212121] text-white">
      {/* Sidebar */}
      <div className="w-64 bg-[#171717] flex flex-col border-r border-gray-800">
        {/* Header */}
        <div className="p-4 border-b border-gray-800 space-y-2">
          <button
            onClick={() => navigate('/app/admin')}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors text-emerald-400"
          >
            <i className="fas fa-arrow-left text-emerald-400"></i>
            <span className="text-sm">Dashboard Admin</span>
          </button>
          <button
            onClick={() => navigate('/home')}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors text-purple-400"
          >
            <i className="fas fa-home text-purple-400"></i>
            <span className="text-sm">Home Antiga</span>
          </button>
          <button
            onClick={() => setMessages([])}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <i className="fas fa-edit text-gray-400"></i>
            <span className="text-sm">Novo chat</span>
          </button>
        </div>

        {/* Search */}
        <div className="px-4 py-3">
          <div className="relative">
            <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm"></i>
            <input
              type="text"
              placeholder="Buscar em chats"
              className="w-full pl-9 pr-3 py-2 bg-[#2f2f2f] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-600"
            />
          </div>
        </div>

        {/* GPTs List */}
        <div className="flex-1 overflow-y-auto px-2">
          <div className="mb-2 px-3 py-2 text-xs font-semibold text-gray-500 uppercase">
            GPTs
          </div>
          
          {GPT_PRESETS.map(gpt => (
            <button
              key={gpt.id}
              onClick={() => handleGPTClick(gpt)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors mb-1 ${
                selectedGPT === gpt.id ? 'bg-gray-800' : ''
              }`}
            >
              <span className="text-xl">{gpt.icon}</span>
              <div className="flex-1 text-left">
                <div className="text-sm font-medium truncate">{gpt.name}</div>
              </div>
            </button>
          ))}
        </div>

        {/* User Profile */}
        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center">
              <span className="text-sm font-semibold">
                {activeProfile ? activeProfile.name.charAt(0) : user?.email?.charAt(0).toUpperCase() || 'N'}
              </span>
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium">
                {activeProfile ? activeProfile.name : 'Nôa Esperanza'}
              </div>
              <div className="text-xs text-gray-400">Conta pessoal</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="h-16 border-b border-gray-800 flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full overflow-hidden">
              <img
                src="/logo-noa-triangulo.gif"
                alt="Nôa"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h1 className="text-lg font-semibold">
                {activeProfile ? activeProfile.name : 'Nôa Esperanza – Mentora'}
              </h1>
              <div className="text-xs text-gray-400 flex items-center gap-2">
                <span>Por Ricardo V R Valença</span>
                <i className="fas fa-check-circle text-gray-500"></i>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/ide')}
              className="px-3 py-2 text-sm rounded-lg hover:bg-gray-800 transition-colors"
            >
              <i className="fas fa-terminal mr-2"></i>
              IDE
            </button>
            <button
              onClick={() => navigate('/admin')}
              className="px-3 py-2 text-sm rounded-lg hover:bg-gray-800 transition-colors"
            >
              <i className="fas fa-cog mr-2"></i>
              ADM/CONFIG
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center px-4">
              <div className="w-16 h-16 rounded-full overflow-hidden mb-4">
                <img
                  src="/logo-noa-triangulo.gif"
                  alt="Nôa"
                  className="w-full h-full object-cover"
                />
              </div>
              
              <h2 className="text-2xl font-semibold mb-2">
                {activeProfile ? activeProfile.name : 'Nôa Esperanza – Mentora'}
              </h2>
              <p className="text-gray-400 text-center mb-6 max-w-md">
                {activeProfile 
                  ? activeProfile.function 
                  : 'Apresenta a plataforma Nôa Esperanza de forma técnica e simbólica'}
              </p>

              {/* Modelo usado */}
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-8">
                <i className="fas fa-check-circle"></i>
                <span>Usando o modelo recomendado pelo criador: GPT-4o</span>
              </div>

              {/* Starter Prompts */}
              <div className="grid grid-cols-2 gap-3 max-w-3xl w-full">
                {STARTER_PROMPTS.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleStarterPrompt(prompt)}
                    className="px-4 py-3 bg-[#2f2f2f] rounded-xl hover:bg-gray-700 transition-colors text-left text-sm"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto px-4 py-6">
              {messages.map(message => (
                <div key={message.id} className="mb-6">
                  <div className="flex gap-4">
                    {message.role === 'assistant' && (
                      <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                        <img
                          src="/logo-noa-triangulo.gif"
                          alt="Nôa"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    {message.role === 'user' && (
                      <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-semibold">
                          {activeProfile ? activeProfile.name.charAt(0) : user?.email?.charAt(0).toUpperCase() || 'U'}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex-1">
                      <div className="prose prose-invert max-w-none">
                        <div className="whitespace-pre-wrap text-gray-100">
                          {message.content}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex gap-4 mb-6">
                  <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                    <img
                      src="/logo-noa-triangulo.gif"
                      alt="Nôa"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-800 px-4 py-4">
          <div className="max-w-3xl mx-auto">
            <div className="relative flex items-center gap-2">
              <button className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
                <i className="fas fa-plus text-gray-400"></i>
              </button>
              
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                placeholder="Pergunte alguma coisa"
                className="flex-1 bg-[#2f2f2f] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gray-600"
                disabled={isLoading}
              />
              
              <button
                onClick={handleSendMessage}
                disabled={!input.trim() || isLoading}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <i className="fas fa-microphone text-gray-400"></i>
              </button>
              
              <button
                onClick={handleSendMessage}
                disabled={!input.trim() || isLoading}
                className="p-2 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <i className="fas fa-arrow-up"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomeNew

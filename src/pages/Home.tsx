import React, { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Specialty } from '../App'
import { openAIService, ChatMessage } from '../services/openaiService'

interface Message {
  id: string
  message: string
  sender: 'user' | 'noa'
  timestamp: Date
}

interface HomeProps {
  currentSpecialty: Specialty
  isVoiceListening: boolean
  setIsVoiceListening: (listening: boolean) => void
  addNotification: (message: string, type?: 'info' | 'success' | 'warning' | 'error') => void
}

const Home = ({ currentSpecialty, isVoiceListening, setIsVoiceListening, addNotification }: HomeProps) => {
  // Estados do chat
  const [messages, setMessages] = useState<Message[]>([
    {
      id: crypto.randomUUID(),
      message: 'Olá! Sou a Nôa Esperanza, sua assistente médica inteligente. Como posso ajudá-lo hoje?',
      sender: 'noa',
      timestamp: new Date()
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto scroll para a última mensagem
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Resposta real da NOA usando OpenAI
  const getNoaResponse = async (userMessage: string) => {
    setIsTyping(true)
    
    try {
      // Converte histórico para formato OpenAI
      const conversationHistory: ChatMessage[] = messages
        .filter(msg => msg.sender === 'user' || msg.sender === 'noa')
        .map(msg => ({
          role: msg.sender === 'user' ? 'user' as const : 'assistant' as const,
          content: msg.message
        }))
        .slice(-10) // Mantém apenas as últimas 10 mensagens para contexto

      // Chama OpenAI
      const response = await openAIService.getNoaResponse(userMessage, conversationHistory)
      
      const noaMessage: Message = {
        id: crypto.randomUUID(),
        message: response,
        sender: 'noa',
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, noaMessage])
      addNotification('Resposta da NOA Esperanza recebida', 'success')
      
    } catch (error) {
      console.error('Erro ao obter resposta da NOA:', error)
      
      // Fallback para resposta de erro
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        message: 'Desculpe, estou com dificuldades técnicas no momento. Por favor, tente novamente ou consulte diretamente um médico.',
        sender: 'noa',
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, errorMessage])
      addNotification('Erro ao conectar com NOA. Tentando novamente...', 'warning')
    } finally {
      setIsTyping(false)
    }
  }

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return

    // Adiciona mensagem do usuário
    const userMessage: Message = {
      id: crypto.randomUUID(),
      message: inputMessage,
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    const currentMessage = inputMessage
    setInputMessage('')

    // Obtém resposta real da NOA
    getNoaResponse(currentMessage)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  return (
    <div className="h-full overflow-hidden">
      {/* Layout Principal */}
      <div className="w-full h-full flex items-center justify-center">
        {/* Balão de Pensamento com NOA ao Lado */}
        <div className="flex items-center gap-8 justify-center w-full h-full -ml-[22%]">
          {/* Balão de Pensamento */}
          <div className="flex-1 relative max-w-md z-[100] -ml-4">
            {/* Balão principal */}
            <div className="bg-white rounded-2xl px-3 pb-3 shadow-lg border border-white/20 relative z-[100]">

              {/* Área de Mensagens */}
              <div className="space-y-2 max-h-32 overflow-hidden">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-xs ${
                      message.sender === 'user' 
                        ? 'bg-blue-500 text-white rounded-lg p-3' 
                        : 'bg-gray-100 text-gray-800 rounded-lg p-3'
                    }`}>
                      <p className="text-sm leading-relaxed">{message.message}</p>
                      <span className="text-xs opacity-70 mt-1 block">
                        {formatTime(message.timestamp)}
                </span>
                  </div>
                </div>
                ))}
                
                {/* Indicador de digitação */}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 text-gray-800 rounded-lg p-3 max-w-xs">
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                        <span className="text-xs">NOA está digitando...</span>
                  </div>
                </div>
              </div>
                )}
                
                <div ref={messagesEndRef} />
                </div>
                
              {/* Input de Mensagem */}
              <div className="flex gap-2 mt-3">
                <input 
                  type="text" 
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Digite sua mensagem..."
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black placeholder-gray-600"
                  aria-label="Campo de mensagem para conversar com NOA"
                />
                <button 
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim()}
                  className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors text-sm"
                  aria-label="Enviar mensagem para NOA"
                  title="Enviar mensagem"
                >
                  <i className="fas fa-paper-plane"></i>
                </button>
                </div>
              </div>
            </div>

          {/* Avatar da NOA */}
          <div className="flex-shrink-0 flex justify-center items-center">
            <div className="w-[561px] h-[561px] rounded-full overflow-hidden border-4 border-green-400 shadow-lg">
              <img 
                src="/avatar-default.jpg" 
                alt="NOA Esperanza" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTA0IiBoZWlnaHQ9IjEwNCIgdmlld0JveD0iMCAwIDEwNCAxMDQiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDQiIGhlaWdodD0iMTA0IiBmaWxsPSIjMTA5NjMxIi8+CjxjaXJjbGUgY3g9IjUyIiBjeT0iMzgiIHI9IjE4IiBmaWxsPSIjRkZGRkZGIi8+CjxwYXRoIGQ9Ik0yNiA4NkMyNiA3MS4xNjQyIDM4LjE2NDIgNTkgNTMgNTlINDFDMzguMTY0MiA1OSAyNiA3MS4xNjQyIDI2IDg2WiIgZmlsbD0iI0ZGRkZGRiIvPgo8L3N2Zz4K'
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
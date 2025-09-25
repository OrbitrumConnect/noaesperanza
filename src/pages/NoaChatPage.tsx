import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { openAIService, ChatMessage } from '../services/openaiService'

interface NoaChatPageProps {
  addNotification: (message: string, type?: 'info' | 'success' | 'warning' | 'error') => void
}

interface Message {
  id: string
  message: string
  sender: 'user' | 'noa'
  timestamp: Date
}

const NoaChatPage = ({ addNotification }: NoaChatPageProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      message: 'Olá! Sou a Nôa Esperanza, sua assistente médica inteligente. Como posso ajudá-lo hoje?',
      sender: 'noa',
      timestamp: new Date()
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isVoiceActive, setIsVoiceActive] = useState(false)
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
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.message
        }))
        .slice(-10) // Mantém apenas as últimas 10 mensagens para contexto

      // Chama OpenAI
      const response = await openAIService.getNoaResponse(userMessage, conversationHistory)
      
      const noaMessage: Message = {
        id: Date.now().toString(),
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
        id: Date.now().toString(),
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
      id: Date.now().toString(),
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleVoiceToggle = () => {
    setIsVoiceActive(!isVoiceActive)
    
    if (!isVoiceActive) {
      addNotification('🎤 Reconhecimento de voz ativado', 'info')
      
      // Simula reconhecimento de voz
      if ('webkitSpeechRecognition' in window) {
        const recognition = new (window as any).webkitSpeechRecognition()
        recognition.lang = 'pt-BR'
        recognition.continuous = false
        recognition.interimResults = false

        recognition.onresult = (event: any) => {
          const voiceMessage = event.results[0][0].transcript
          setInputMessage(voiceMessage)
          setIsVoiceActive(false)
          addNotification('Voz reconhecida com sucesso!', 'success')
        }

        recognition.onerror = () => {
          addNotification('Erro no reconhecimento de voz', 'error')
          setIsVoiceActive(false)
        }

        recognition.onend = () => {
          setIsVoiceActive(false)
        }

        recognition.start()
      } else {
        // Fallback
        setTimeout(() => {
          setInputMessage('Como está minha pressão arterial?')
          setIsVoiceActive(false)
          addNotification('Voz simulada: "Como está minha pressão arterial?"', 'success')
        }, 2000)
      }

      // Para automaticamente após 10 segundos
      setTimeout(() => {
        setIsVoiceActive(false)
      }, 10000)
    } else {
      addNotification('🎤 Reconhecimento de voz desativado', 'info')
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  return (
    <div className="min-h-screen pt-6">
      {/* Header do Chat */}
      <div className="max-w-4xl mx-auto px-6 mb-6">
        <div className="premium-card">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/" className="text-yellow-400 hover:text-yellow-300">
                <i className="fas fa-arrow-left text-xl"></i>
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
                  <i className="fas fa-robot text-white text-xl"></i>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-800">Chat Nôa Esperanza</h1>
                  <p className="text-sm text-gray-600">Assistente Médica Inteligente</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm text-green-400">Online</span>
            </div>
          </div>
        </div>
      </div>

      {/* Área de Mensagens */}
      <div className="max-w-4xl mx-auto px-6 mb-6">
        <div className="premium-card h-96 overflow-y-auto">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`chat-message ${message.sender} max-w-xs lg:max-w-md`}
                >
                  <div className="flex items-start gap-2">
                    {message.sender === 'noa' && (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center flex-shrink-0">
                        <i className="fas fa-robot text-white text-sm"></i>
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="text-sm leading-relaxed">{message.message}</p>
                      <span className="text-xs opacity-70 mt-2 block">
                        {formatTime(message.timestamp)}
                      </span>
                    </div>
                    {message.sender === 'user' && (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center flex-shrink-0">
                        <i className="fas fa-user text-white text-sm"></i>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {/* Indicador de digitação */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="chat-message noa max-w-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
                      <i className="fas fa-robot text-white text-sm"></i>
                    </div>
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* Input de Mensagem */}
      <div className="max-w-4xl mx-auto px-6">
        <div className="premium-card">
          <div className="flex gap-4">
            <div className="flex-1">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Digite sua mensagem ou clique no microfone para falar..."
                className="w-full bg-gray-800 bg-opacity-50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-300 resize-none focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                rows={2}
                disabled={isVoiceActive}
              />
            </div>
            
            <div className="flex flex-col gap-2">
              {/* Botão de Voz */}
              <button
                onClick={handleVoiceToggle}
                className={`p-3 rounded-lg transition-all ${
                  isVoiceActive 
                    ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                    : 'bg-green-500 hover:bg-green-600'
                } text-white`}
                title={isVoiceActive ? 'Parar gravação' : 'Gravar mensagem'}
              >
                <i className={`fas ${isVoiceActive ? 'fa-stop' : 'fa-microphone'}`}></i>
              </button>
              
              {/* Botão de Enviar */}
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isVoiceActive}
                className="p-3 rounded-lg bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white transition-colors"
                title="Enviar mensagem"
              >
                <i className="fas fa-paper-plane"></i>
              </button>
            </div>
          </div>
          
          {/* Indicador de Voz Ativa */}
          {isVoiceActive && (
            <div className="mt-4 flex items-center justify-center gap-2 text-red-400">
              <div className="voice-wave">
                <div className="wave-bar"></div>
                <div className="wave-bar"></div>
                <div className="wave-bar"></div>
                <div className="wave-bar"></div>
                <div className="wave-bar"></div>
              </div>
              <span className="text-sm font-medium">Escutando... Fale agora!</span>
            </div>
          )}
        </div>
      </div>

      {/* Sugestões Rápidas */}
      <div className="max-w-4xl mx-auto px-6 mt-6">
        <div className="premium-card">
          <h3 className="text-premium text-sm font-semibold mb-3">Perguntas Frequentes:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {[
              'Como está minha pressão?',
              'Preciso de exames de rotina?',
              'Efeitos do medicamento X?',
              'Quando agendar consulta?',
              'Sintomas que devo observar?',
              'Dicas de alimentação saudável?'
            ].map((suggestion, index) => (
              <button
                key={index}
                onClick={() => setInputMessage(suggestion)}
                className="text-left p-2 text-sm text-gray-300 bg-gray-800 bg-opacity-50 rounded-lg hover:bg-gray-700 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default NoaChatPage

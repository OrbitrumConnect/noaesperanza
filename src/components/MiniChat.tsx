import { useState, useEffect, useRef } from 'react'

interface Message {
  id: string
  text: string
  sender: 'patient' | 'doctor'
  timestamp: Date
  isRead: boolean
}

interface MiniChatProps {
  isOpen: boolean
  onClose: () => void
  userType: 'patient' | 'doctor'
  otherUser: {
    name: string
    specialty: string
    avatar?: string
  }
  addNotification: (message: string, type?: 'info' | 'success' | 'warning' | 'error') => void
}

const MiniChat = ({ isOpen, onClose, userType, otherUser, addNotification }: MiniChatProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Olá! Como posso ajudá-lo hoje?',
      sender: 'doctor',
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 min ago
      isRead: true
    },
    {
      id: '2',
      text: 'Boa tarde, doutor. Tenho uma dúvida sobre minha medicação.',
      sender: 'patient',
      timestamp: new Date(Date.now() - 1000 * 60 * 25), // 25 min ago
      isRead: true
    },
    {
      id: '3',
      text: 'Claro! Qual é sua dúvida específica?',
      sender: 'doctor',
      timestamp: new Date(Date.now() - 1000 * 60 * 20), // 20 min ago
      isRead: true
    }
  ])
  
  const [newMessage, setNewMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = () => {
    if (!newMessage.trim()) return

    const message: Message = {
      id: Date.now().toString(),
      text: newMessage.trim(),
      sender: userType,
      timestamp: new Date(),
      isRead: false
    }

    setMessages(prev => [...prev, message])
    setNewMessage('')
    
    // Simular resposta automática do médico após 2-3 segundos
    if (userType === 'patient') {
      setIsTyping(true)
      setTimeout(() => {
        const responses = [
          'Entendi sua dúvida. Vou verificar seu prontuário.',
          'Ótima pergunta! Vou te explicar melhor.',
          'Perfeito! Vou ajustar sua prescrição.',
          'Obrigado pela informação. Vou analisar o caso.',
          'Entendi. Vou agendar uma consulta para discutirmos melhor.'
        ]
        
        const autoResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: responses[Math.floor(Math.random() * responses.length)],
          sender: 'doctor',
          timestamp: new Date(),
          isRead: false
        }
        
        setMessages(prev => [...prev, autoResponse])
        setIsTyping(false)
        addNotification('Nova mensagem recebida', 'info')
      }, 2000 + Math.random() * 1000)
    } else {
      addNotification('Mensagem enviada', 'success')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  if (!isOpen) return null

  return (
    <div 
      className="fixed bottom-4 right-4 w-80 h-96 bg-gray-900 border border-gray-600 rounded-lg shadow-2xl z-[9999] flex flex-col"
      style={{ 
        position: 'fixed', 
        bottom: '16px', 
        right: '16px', 
        zIndex: 9999,
        backgroundColor: '#1f2937',
        border: '1px solid #4b5563',
        borderRadius: '8px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-600 bg-gray-800 rounded-t-lg">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center" data-testid="ai-avatar">
            <i className="fas fa-user text-white text-sm"></i>
          </div>
          <div>
            <div className="text-white text-sm font-medium">{otherUser.name}</div>
            <div className="text-gray-400 text-xs">{otherUser.specialty}</div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <i className="fas fa-times text-sm"></i>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === userType ? 'justify-end' : 'justify-start'}`}
            data-testid={message.sender === userType ? 'user-message' : 'ai-message'}
          >
            <div
              className={`max-w-[80%] p-2 rounded-lg text-sm ${
                message.sender === userType
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-700 text-gray-100'
              }`}
            >
              <div>{message.text}</div>
              <div className={`text-xs mt-1 ${
                message.sender === userType ? 'text-blue-100' : 'text-gray-400'
              }`}>
                {message.timestamp.toLocaleTimeString('pt-BR', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </div>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start" data-testid="typing-indicator">
            <div className="bg-gray-700 text-gray-100 p-2 rounded-lg text-sm">
              <div className="flex items-center gap-1">
                <span>Digitando</span>
                <div className="flex gap-1">
                  <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-gray-600">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Digite sua mensagem..."
            className="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-400 focus:outline-none focus:border-blue-500"
            data-testid="chat-input"
          />
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-3 py-2 rounded-lg text-sm transition-colors"
            data-testid="send-button"
          >
            <i className="fas fa-paper-plane text-xs"></i>
          </button>
        </div>
      </div>
    </div>
  )
}

export default MiniChat

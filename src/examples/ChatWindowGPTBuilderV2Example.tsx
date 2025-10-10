// 🌀 EXEMPLO DE INTEGRAÇÃO GPT BUILDER V2 - ChatWindow
// Este arquivo demonstra como integrar o sistema de atenção semântica
// com a gramática clínica da Nôa no componente ChatWindow

import React, { useState } from 'react'
import { processUserMessage, buildUserSymbolicContext } from '../services/semanticAttentionService'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export const ChatWindowExample = () => {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  /**
   * Handler para enviar mensagem com integração GPT Builder V2
   * Utiliza:
   * - processUserMessage: Processa com atenção semântica + gramática Nôa
   * - buildUserSymbolicContext: Constrói contexto simbólico do usuário
   */
  const handleSendMessage = async () => {
    if (!input.trim()) return

    const userMessage = input
    
    // 1. Adiciona mensagem do usuário ao histórico
    setMessages([...messages, { role: "user", content: userMessage }])
    setInput("")
    setIsLoading(true)

    try {
      // 2. Constrói contexto simbólico do usuário (histórico + metadata)
      const userContext = buildUserSymbolicContext('user-id-example', messages)
      
      // 3. Processa mensagem com:
      //    - Vector search (documentos relevantes)
      //    - Gramática Nôa (metodologia clínica)
      //    - GPT-4o (geração de resposta)
      const reply = await processUserMessage(userMessage, userContext)
      
      // 4. Adiciona resposta da Nôa ao histórico
      setMessages(prev => [...prev, { role: "assistant", content: reply }])
      
    } catch (error) {
      console.error('Erro ao processar mensagem:', error)
      
      // Fallback em caso de erro
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: "Desculpe, encontrei um erro ao processar sua mensagem. Por favor, tente novamente." 
      }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Área de mensagens */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[70%] p-3 rounded-lg ${
                msg.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-800'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-200 p-3 rounded-lg">
              <span className="animate-pulse">Nôa está pensando...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input de mensagem */}
      <div className="border-t p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Digite sua mensagem..."
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={isLoading || !input.trim()}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Enviar
          </button>
        </div>
      </div>
    </div>
  )
}

/**
 * COMO USAR ESTE EXEMPLO:
 * 
 * 1. Importe o componente em seu arquivo principal:
 *    import { ChatWindowExample } from './examples/ChatWindowGPTBuilderV2Example'
 * 
 * 2. Use no seu JSX:
 *    <ChatWindowExample />
 * 
 * 3. Personalize conforme necessário:
 *    - Adicione user ID real no buildUserSymbolicContext
 *    - Adicione tratamento de erros personalizado
 *    - Integre com sistema de autenticação existente
 *    - Adicione áudio com ElevenLabs se desejado
 */

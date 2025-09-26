// src/contexts/MessageContext.tsx
import React, { createContext, useContext, useState } from 'react'

interface Message {
  type: 'user' | 'noa'
  text: string
}

interface MessageContextProps {
  messages: Message[]
  addMessage: (message: Message) => void
}

const MessageContext = createContext<MessageContextProps | undefined>(undefined)

export const MessageProvider = ({ children }: { children: React.ReactNode }) => {
  const [messages, setMessages] = useState<Message[]>([])

  const addMessage = (message: Message) => {
    setMessages((prev) => [...prev, message])
  }

  return (
    <MessageContext.Provider value={{ messages, addMessage }}>
      {children}
    </MessageContext.Provider>
  )
}

export const useMessage = () => {
  const context = useContext(MessageContext)
  if (!context) throw new Error('useMessage deve ser usado dentro de MessageProvider')
  return context
}

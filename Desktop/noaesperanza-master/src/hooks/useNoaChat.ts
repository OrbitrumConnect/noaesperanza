import { useState, useRef, useEffect } from 'react'
import { openAIService, ChatMessage } from '../services/openaiService'
import { elevenLabsService } from '../services/elevenLabsService'
import { aiLearningService } from '../services/aiLearningService'

interface Message {
  id: string
  message: string
  sender: 'user' | 'noa'
  timestamp: Date
  options?: string[]
}

interface UseNoaChatProps {
  userMemory: any
  addNotification: (message: string, type?: 'info' | 'success' | 'warning' | 'error') => void
}

export const useNoaChat = ({ userMemory, addNotification }: UseNoaChatProps) => {
  const [messages, setMessages] = useState<Message[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [audioPlaying, setAudioPlaying] = useState(false)
  const currentAudioRef = useRef<HTMLAudioElement | null>(null)

  // Resposta real da NOA usando OpenAI
  const getNoaResponse = async (userMessage: string) => {
    setIsTyping(true)
    
    try {
      // Obter contexto de aprendizado da IA
      const learningContext = await aiLearningService.getLearningContext(userMessage)
      
      // Converte histórico para formato OpenAI com contexto do usuário
      const systemContext = `Você é Nôa Esperanza, assistente médica inteligente do Dr. Ricardo Valença.

${learningContext} 

INFORMAÇÕES DO USUÁRIO:
- Nome: ${userMemory.name || 'Não informado'}
- Última visita: ${userMemory.lastVisit ? new Date(userMemory.lastVisit).toLocaleDateString('pt-BR') : 'Primeira vez'}

DIRETRIZES GERAIS:
- Seja sempre amigável, profissional e empática
- Use o nome do usuário quando souber
- Respeite sempre a ética médica
- Não dê diagnósticos, apenas orientações gerais
- Sugira consulta médica quando necessário
- Mantenha tom conversacional e acolhedor
- Se não souber algo, seja honesta sobre suas limitações
- Sempre termine suas respostas perguntando como pode ajudar ou oferecendo opções
- Seja específica sobre suas especialidades: neurologia, cannabis medicinal e nefrologia`

      const conversationHistory: ChatMessage[] = [
        { role: 'system', content: systemContext },
        ...messages
        .filter(msg => msg.sender === 'user' || msg.sender === 'noa')
        .map(msg => ({
          role: msg.sender === 'user' ? 'user' as const : 'assistant' as const,
          content: msg.message
        }))
          .slice(-8) // Mantém apenas as últimas 8 mensagens + contexto do sistema
      ]

      // Chama OpenAI para gerar resposta
      const response = await openAIService.getNoaResponse(userMessage, conversationHistory)
      
      // Opções padrão para conversas gerais
      const defaultOptions = [
        'Avaliação inicial',
        'Fazer uma pergunta sobre saúde',
        'Como você está?'
      ]
      
      const noaMessage: Message = {
        id: crypto.randomUUID(),
        message: response,
        sender: 'noa',
        timestamp: new Date(),
        options: defaultOptions
      }
      
      setMessages(prev => [...prev, noaMessage])
      
      // 🧠 APRENDIZADO AUTOMÁTICO - IA aprende com a conversa
      aiLearningService.saveInteraction(userMessage, response, 'general')
      
      // ElevenLabs gera áudio
      await playNoaAudioWithText(response)
      
    } catch (error) {
      console.error('Erro ao obter resposta da NOA:', error)
    } finally {
      setIsTyping(false)
    }
  }

  // Função para tocar áudio da NOA com texto sincronizado
  const playNoaAudioWithText = async (text: string) => {
    try {
      // Se já está tocando áudio, não toca outro
      if (audioPlaying) {
        return
      }
      
      // Para o áudio atual se estiver tocando
      if (currentAudioRef.current) {
        currentAudioRef.current.pause()
        currentAudioRef.current = null
      }
      
      // Remove markdown e formatação para o áudio
      const cleanText = text
        .replace(/\*\*(.*?)\*\*/g, '$1') // Remove **bold**
        .replace(/\*(.*?)\*/g, '$1') // Remove *italic*
        .replace(/\[(.*?)\]/g, '$1') // Remove [brackets]
        .replace(/```[\s\S]*?```/g, '') // Remove blocos de código
        .replace(/`(.*?)`/g, '$1') // Remove código inline
        .replace(/#{1,6}\s+/g, '') // Remove headers
        .replace(/\n\n+/g, '. ') // Substitui múltiplas quebras por pontos
        .replace(/\n/g, ' ') // Remove quebras de linha simples
        .replace(/\s+/g, ' ') // Remove espaços múltiplos
        .replace(/[^\w\s.,!?;:()-]/g, '') // Remove caracteres especiais
        .trim()

      const audioResponse = await elevenLabsService.textToSpeech(cleanText)
      
      // Cria e toca o áudio
      const audioBlob = new Blob([audioResponse.audio], { type: 'audio/mpeg' })
      const audioUrl = URL.createObjectURL(audioBlob)
      const audio = new Audio(audioUrl)
      
      // Armazena referência do áudio atual
      currentAudioRef.current = audio
      setAudioPlaying(true)

      audio.play().then(() => {
        console.log('🎵 Áudio tocando com sucesso!')
      }).catch(error => {
        console.log('❌ Erro ao tocar áudio:', error)
        setAudioPlaying(false)
      })

      // Limpa a URL e referência após tocar
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl)
        currentAudioRef.current = null
        setAudioPlaying(false)
      }
      
      // Limpa referência se houver erro
      audio.onerror = () => {
        URL.revokeObjectURL(audioUrl)
        currentAudioRef.current = null
        setAudioPlaying(false)
      }

    } catch (error) {
      console.log('❌ Erro ao gerar áudio da NOA:', error)
      setAudioPlaying(false)
    }
  }

  const handleSendMessage = (messageText: string) => {
    if (!messageText.trim()) return

    // Adiciona mensagem do usuário
    const userMessage: Message = {
      id: crypto.randomUUID(),
      message: messageText,
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])

    // Obtém resposta real da NOA
    getNoaResponse(messageText)
  }

  return {
    messages,
    isTyping,
    audioPlaying,
    currentAudioRef,
    handleSendMessage,
    playNoaAudioWithText
  }
}

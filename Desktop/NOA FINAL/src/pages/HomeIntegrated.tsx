import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Specialty } from '../App'
import { openAIService, ChatMessage } from '../services/openaiService'
import { elevenLabsService } from '../services/elevenLabsService'
import { cleanTextForAudio } from '../utils/textUtils'
import { clinicalAssessmentService, ClinicalAssessmentData } from '../services/clinicalAssessmentService'
import ThoughtBubble from '../components/ThoughtBubble'
import MatrixBackground from '../components/MatrixBackground'

interface Message {
  id: string
  message: string
  sender: 'user' | 'noa'
  timestamp: Date
  options?: string[]
}

interface HomeProps {
  currentSpecialty: Specialty
  isVoiceListening: boolean
  setIsVoiceListening: (listening: boolean) => void
  addNotification: (message: string, type?: 'info' | 'success' | 'warning' | 'error') => void
}

const HomeIntegrated = ({ currentSpecialty, isVoiceListening, setIsVoiceListening, addNotification }: HomeProps) => {
  // Estados do chat
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Estados para Avaliação Clínica
  const [modoAvaliacao, setModoAvaliacao] = useState(false)
  const [assessment, setAssessment] = useState<ClinicalAssessmentData | null>(null)
  const [evaluationId, setEvaluationId] = useState<string | null>(null)
  
  // Controle de áudio
  const [audioPlaying, setAudioPlaying] = useState(false)
  const [userInteracted, setUserInteracted] = useState(false)
  const [thoughts, setThoughts] = useState<any[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const currentAudioRef = useRef<HTMLAudioElement | null>(null)
  const navigate = useNavigate()
  
  // Memória do usuário
  const [userMemory, setUserMemory] = useState(() => {
    const saved = localStorage.getItem('noa_user_memory')
    return saved ? JSON.parse(saved) : { name: '', preferences: {}, lastVisit: null }
  })

  // Auto scroll para a última mensagem
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // Salva memória do usuário
  const saveUserMemory = (newMemory: any) => {
    const updatedMemory = { ...userMemory, ...newMemory, lastVisit: new Date().toISOString() }
    setUserMemory(updatedMemory)
    localStorage.setItem('noa_user_memory', JSON.stringify(updatedMemory))
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Áudio liberado automaticamente
  useEffect(() => {
    setUserInteracted(true)
  }, [])

  // Resposta da NOA usando OpenAI (mesma lógica do /chat)
  const getNoaResponse = async (userMessage: string) => {
    setIsTyping(true)
    
    try {
      // Verifica se o usuário quer iniciar avaliação clínica
      const wantsEvaluation = userMessage.toLowerCase().includes('avaliação') ||
                             userMessage.toLowerCase().includes('avaliacao') ||
                             userMessage.toLowerCase().includes('consulta inicial') ||
                             userMessage.toLowerCase().includes('fazer avaliação')

      if (wantsEvaluation && !modoAvaliacao) {
        // Inicia avaliação clínica
        const newAssessment = clinicalAssessmentService.startAssessment(userMemory.name || 'Usuário')
        setAssessment(newAssessment)
        setModoAvaliacao(true)
        
        const firstQuestion = clinicalAssessmentService.getNextQuestion()
        const noaMessage: Message = {
          id: crypto.randomUUID(),
          message: `🏥 **Iniciando Avaliação Clínica Inicial**\n\n${firstQuestion}`,
          sender: 'noa',
          timestamp: new Date()
        }
        
        setMessages(prev => [...prev, noaMessage])
        await playNoaAudioWithText(firstQuestion)
        setIsTyping(false)
        return
      }

      // Se está em modo avaliação, processa a resposta
      if (modoAvaliacao && assessment) {
        await processarRespostaAvaliacao(userMessage)
        setIsTyping(false)
        return
      }

      // Detecta se o usuário está se apresentando
      if (!userMemory.name && (
        userMessage.toLowerCase().includes('meu nome é') ||
        userMessage.toLowerCase().includes('eu sou') ||
        userMessage.toLowerCase().includes('sou o') ||
        userMessage.toLowerCase().includes('sou a')
      )) {
        const nameMatch = userMessage.match(/(?:meu nome é|eu sou|sou o|sou a)\s+([a-zA-ZÀ-ÿ\s]+)/i)
        if (nameMatch) {
          const extractedName = nameMatch[1].trim()
          saveUserMemory({ name: extractedName })
        }
      }

      // Processar com OpenAI (mesma lógica do /chat)
      const conversationHistory: ChatMessage[] = messages.map(m => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.message
      }))

      const response = await openAIService.getNoaResponse(userMessage, conversationHistory)
      
      const noaMessage: Message = {
        id: crypto.randomUUID(),
        message: response,
        sender: 'noa',
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, noaMessage])
      
      // Gerar pensamentos flutuantes
      setTimeout(() => {
        const newThoughts = generateThoughtsFromResponse(response)
        setThoughts(newThoughts)
        setIsProcessing(false)
      }, 1500)
      
      // ElevenLabs gera áudio
      await playNoaAudioWithText(response)
      
    } catch (error) {
      console.error('Erro ao obter resposta da NOA:', error)
      
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        message: 'Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente.',
        sender: 'noa',
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsTyping(false)
    }
  }

  // Processa resposta da avaliação clínica
  const processarRespostaAvaliacao = async (resposta: string) => {
    if (!assessment) return

    // Determinar categoria baseada no estágio
    let category: any = 'identification'
    switch (assessment.stage) {
      case 'identification':
      case 'complaints_list':
      case 'main_complaint':
      case 'complaint_development':
        category = 'complaints'
        break
      case 'medical_history':
        category = 'history'
        break
      case 'family_history':
        category = 'family'
        break
      case 'lifestyle_habits':
        category = 'habits'
        break
      case 'medications_allergies':
        category = 'medications'
        break
    }

    // Registrar resposta
    clinicalAssessmentService.recordResponse('Resposta do usuário', resposta, category)
    
    // Obter próxima pergunta
    const nextQuestion = clinicalAssessmentService.getNextQuestion()
    
    // Se chegou ao relatório final
    if (nextQuestion.includes('RELATÓRIO DE AVALIAÇÃO CLÍNICA INICIAL')) {
      await finalizarAvaliacao()
    } else {
      // Próxima pergunta
      const noaMessage: Message = {
        id: crypto.randomUUID(),
        message: nextQuestion,
        sender: 'noa',
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, noaMessage])
      await playNoaAudioWithText(nextQuestion)
    }
  }

  // Finaliza avaliação
  const finalizarAvaliacao = async () => {
    try {
      const result = await clinicalAssessmentService.completeAssessment()
      
      setModoAvaliacao(false)
      
      const fechamentoConsensual: Message = {
        id: crypto.randomUUID(),
        message: `**🎉 AVALIAÇÃO CLÍNICA CONCLUÍDA!**\n\n✅ Seu relatório foi gerado e está disponível.\n\n**NFT Hash:** ${result.nftHash}\n\n**RECOMENDAÇÃO FINAL:**\n\nEssa é uma avaliação inicial de acordo com o método desenvolvido pelo Dr. Ricardo Valença. Recomendo a marcação de uma consulta com o Dr. Ricardo Valença.\n\n💡 **Próximos passos:**\n- Agende sua consulta\n- Leve este relatório\n- Prepare suas dúvidas`,
        sender: 'noa',
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, fechamentoConsensual])
      await playNoaAudioWithText(fechamentoConsensual.message)
    } catch (error) {
      console.error('Erro ao finalizar avaliação:', error)
    }
  }

  const handleSendMessage = (messageText?: string) => {
    const messageToSend = messageText || inputMessage
    if (!messageToSend.trim()) return

    // Adiciona mensagem do usuário
    const userMessage: Message = {
      id: crypto.randomUUID(),
      message: messageToSend,
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsProcessing(true)

    // Obtém resposta real da NOA
    getNoaResponse(messageToSend)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // Função para gerar pensamentos baseados na resposta
  const generateThoughtsFromResponse = (response: string) => {
    const availableThoughts = [
      {
        id: 'curso-1',
        type: 'curso',
        icon: '🎓',
        title: 'AEC em Nefrologia',
        description: 'Curso intermediário, 6h',
        route: '/ensino',
        action: 'Iniciar Curso'
      },
      {
        id: 'ebook-1',
        type: 'ebook',
        icon: '📕',
        title: 'Cannabis Medicinal',
        description: 'Protocolos em nefrologia',
        route: '/pesquisa',
        action: 'Baixar PDF'
      },
      {
        id: 'projeto-1',
        type: 'projeto',
        icon: '🏥',
        title: 'Cidade Amiga dos Rins',
        description: '1.2K pacientes, 3 cidades',
        route: '/pesquisa',
        action: 'Explorar Projeto'
      },
      {
        id: 'projeto-2',
        type: 'projeto',
        icon: '🔬',
        title: 'MedCann Lab',
        description: '187 pacientes, 5 estágios CKD',
        route: '/medcann-lab',
        action: 'Ver Pesquisa'
      }
    ]

    const shuffled = [...availableThoughts].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, 3)
  }

  // Função para lidar com clique nos pensamentos
  const handleThoughtClick = (thought: any) => {
    if (thought.route) {
      navigate(thought.route)
    }
    setThoughts(prev => prev.filter(t => t.id !== thought.id))
  }

  // Função para fechar pensamento
  const handleThoughtClose = (thoughtId: string) => {
    setThoughts(prev => prev.filter(t => t.id !== thoughtId))
  }

  // Função para iniciar reconhecimento de voz
  const startVoiceRecognition = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setIsVoiceListening(false)
      return
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    const recognition = new SpeechRecognition()

    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = 'pt-BR'
    recognition.maxAlternatives = 1

    recognition.onstart = () => {
      console.log('🎤 Reconhecimento de voz iniciado')
    }

    recognition.onresult = (event: any) => {
      recognition.stop()
      
      let finalTranscript = ''
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript
        }
      }

      if (finalTranscript && !audioPlaying) {
        console.log('🎤 Texto reconhecido:', finalTranscript)
        
        if (currentAudioRef.current) {
          currentAudioRef.current.pause()
          currentAudioRef.current = null
          setAudioPlaying(false)
        }
        
        setInputMessage(finalTranscript)
        handleSendMessage(finalTranscript)
        setIsVoiceListening(false)
      }
    }

    recognition.onerror = (event: any) => {
      console.error('Erro no reconhecimento de voz:', event.error)
      setIsVoiceListening(false)
    }

    recognition.onend = () => {
      setIsVoiceListening(false)
    }

    try {
      recognition.start()
    } catch (error) {
      console.error('Erro ao iniciar reconhecimento:', error)
      setIsVoiceListening(false)
    }
  }

  // Função para tocar áudio da NOA
  const playNoaAudioWithText = async (text: string) => {
    try {
      console.log('🎵 Gerando áudio...')
      
      if (audioPlaying) {
        console.log('🔊 Áudio já está tocando')
        return
      }
      
      if (currentAudioRef.current) {
        currentAudioRef.current.pause()
        currentAudioRef.current = null
      }
      
      const cleanText = cleanTextForAudio(text)
      const audioResponse = await elevenLabsService.textToSpeech(cleanText)
      
      const audioBlob = new Blob([audioResponse.audio], { type: 'audio/mpeg' })
      const audioUrl = URL.createObjectURL(audioBlob)
      const audio = new Audio(audioUrl)
      
      currentAudioRef.current = audio
      setAudioPlaying(true)
      
      if (isVoiceListening) {
        setIsVoiceListening(false)
      }

      audio.play()

      audio.onended = () => {
        URL.revokeObjectURL(audioUrl)
        currentAudioRef.current = null
        setAudioPlaying(false)
        
        // Ativa voz automaticamente após resposta
        setTimeout(() => {
          if (!isVoiceListening && userInteracted) {
            startVoiceRecognition()
          }
        }, 1000)
      }
      
      audio.onerror = () => {
        URL.revokeObjectURL(audioUrl)
        currentAudioRef.current = null
        setAudioPlaying(false)
      }

    } catch (error) {
      console.log('❌ Erro ao gerar áudio:', error)
      setAudioPlaying(false)
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  return (
    <div className="h-full overflow-hidden relative">
      {/* Background Matrix */}
      <MatrixBackground isActive={isProcessing} opacity={0.05} />
      
      {/* Layout Principal */}
      <div className="w-full h-full flex relative z-10">
        {/* Sidebar Esquerdo - Chat Noa */}
        <div className="w-80 flex-shrink-0 bg-white/10 backdrop-blur-sm border-r border-white/20 p-4">
          <div className="h-full flex flex-col">
            <div className="bg-white rounded-2xl px-3 pb-3 shadow-lg border border-white/20 flex-1 flex flex-col">
              {/* Área de Mensagens */}
              <div className="space-y-2 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-xs lg:max-w-xs ${
                      message.sender === 'user' 
                        ? 'bg-blue-500 text-white rounded-lg p-3' 
                        : 'bg-gray-100 text-gray-800 rounded-lg p-3'
                    }`}>
                      <p className="text-sm leading-relaxed whitespace-pre-line">{message.message}</p>
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
              <div className="flex gap-2 mt-3 flex-col sm:flex-row">
                <input 
                  type="text" 
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Digite sua mensagem..."
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black placeholder-gray-600 w-full sm:w-auto"
                />
                <div className="flex gap-2 w-full sm:w-auto">
                  {/* Botão de voz */}
                  <button
                    onClick={() => {
                      if (isVoiceListening) {
                        setIsVoiceListening(false)
                      } else {
                        setIsVoiceListening(true)
                        startVoiceRecognition()
                      }
                    }}
                    className={`flex-1 sm:flex-none px-4 py-2 rounded-lg transition-colors text-sm ${
                      isVoiceListening 
                        ? 'bg-red-500 hover:bg-red-600 text-white' 
                        : 'bg-green-500 hover:bg-green-600 text-white'
                    }`}
                  >
                    <i className={`fas ${isVoiceListening ? 'fa-stop' : 'fa-microphone'}`}></i>
                  </button>
                  <button 
                    onClick={() => handleSendMessage()}
                    disabled={!inputMessage.trim()}
                    className="flex-1 sm:flex-none bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors text-sm"
                  >
                    <i className="fas fa-paper-plane"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Área Central - Vídeo da NOA e Pensamentos */}
        <div className="flex-1 flex items-center justify-center relative">
          {/* Avatar da NOA - Vídeos Animados */}
          <div className="flex-shrink-0 flex justify-center items-center relative">
            <div className="w-[clamp(120px,20vw,135px)] h-[clamp(120px,20vw,135px)] md:w-[533px] md:h-[533px] rounded-full overflow-hidden border-2 md:border-4 border-green-400 shadow-lg relative aspect-square">
              {/* Vídeo estático piscando (padrão) */}
              <video 
                key="estatico"
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
                  audioPlaying ? 'opacity-0' : 'opacity-100'
                }`}
                autoPlay
                loop
                muted
                playsInline
              >
                <source src="./estatica piscando.mp4" type="video/mp4" />
                <img 
                  src="./avatar-default.jpg" 
                  alt="NOA Esperanza" 
                  className="w-full h-full object-cover"
                />
              </video>
              
              {/* Vídeo falando (quando áudio está tocando) */}
              <video 
                key="falando"
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
                  audioPlaying ? 'opacity-100' : 'opacity-0'
                }`}
                autoPlay
                loop
                muted
                playsInline
              >
                <source src="./Noafalando.mp4" type="video/mp4" />
              </video>
            </div>
            
            {/* Botão para parar áudio */}
            {audioPlaying && (
              <button
                onClick={() => {
                  if (currentAudioRef.current) {
                    currentAudioRef.current.pause()
                    currentAudioRef.current = null
                    setAudioPlaying(false)
                  }
                }}
                className="absolute top-2 right-2 lg:top-4 lg:right-4 p-2 lg:p-3 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-colors"
              >
                <i className="fas fa-stop text-sm lg:text-lg"></i>
              </button>
            )}
            
            {/* Indicador de escuta de voz */}
            {isVoiceListening && (
              <div className="absolute top-2 left-2 lg:top-4 lg:left-4 p-2 lg:p-3 bg-green-500 text-white rounded-full shadow-lg animate-pulse">
                <i className="fas fa-microphone text-sm lg:text-lg"></i>
              </div>
            )}
          </div>

          {/* Pensamentos Flutuantes */}
          <AnimatePresence>
            {thoughts.map((thought, index) => (
              <ThoughtBubble
                key={thought.id}
                thought={thought}
                index={index}
                onClick={() => handleThoughtClick(thought)}
                onClose={() => handleThoughtClose(thought.id)}
              />
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

export default HomeIntegrated


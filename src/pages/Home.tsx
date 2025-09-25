import React, { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Specialty } from '../App'
import { openAIService, ChatMessage } from '../services/openaiService'
import { elevenLabsService } from '../services/elevenLabsService'
import { dataService } from '../services/supabaseService'
import { aiLearningService } from '../services/aiLearningService'

interface Message {
  id: string
  message: string
  sender: 'user' | 'noa'
  timestamp: Date
  options?: string[] // Opções de resposta rápida
}

// Interface para Avaliação Clínica Triaxial
interface AvaliacaoClinicaData {
  sessionId: string
  status: 'in_progress' | 'completed'
  etapa_atual: string
  dados: {
    apresentacao?: string
    cannabis_medicinal?: string
    lista_indiciaria: string[]
    queixa_principal?: string
    desenvolvimento_indiciario?: {
      localizacao?: string
      inicio?: string
      qualidade?: string
      sintomas_associados?: string
      fatores_melhora?: string
      fatores_piora?: string
    }
    historia_patologica: string[]
    historia_familiar: {
      mae: string[]
      pai: string[]
    }
    habitos_vida: string[]
    medicacoes?: {
      continuas?: string
      eventuais?: string
    }
    alergias?: string
    relatorio_narrativo?: string
    concordancia_final?: boolean
  }
}

// Método triaxial removido - agora usa apenas ChatGPT

interface HomeProps {
  currentSpecialty: Specialty
  isVoiceListening: boolean
  setIsVoiceListening: (listening: boolean) => void
  addNotification: (message: string, type?: 'info' | 'success' | 'warning' | 'error') => void
}

const Home = ({ currentSpecialty, isVoiceListening, setIsVoiceListening, addNotification }: HomeProps) => {
  // Estados do chat
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Estados de avaliação removidos - agora usa apenas ChatGPT
  
  // Controle de áudio
  const [audioPlaying, setAudioPlaying] = useState(false)
  const [userInteracted, setUserInteracted] = useState(false)
  const currentAudioRef = useRef<HTMLAudioElement | null>(null)
  
  // Memória do usuário
  const [userMemory, setUserMemory] = useState(() => {
    const saved = localStorage.getItem('noa_user_memory')
    return saved ? JSON.parse(saved) : { name: '', preferences: {}, lastVisit: null }
  })
  const [showAILearningDashboard, setShowAILearningDashboard] = useState(false)

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

  // Salva conversa do ChatGPT no Supabase
  const saveChatConversation = async (userMessage: string, noaResponse: string) => {
    try {
      const conversationData = {
        user_id: userMemory.name || 'anonymous',
        user_message: userMessage,
        noa_response: noaResponse,
        session_id: `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        created_at: new Date().toISOString()
      }

      // Salva no Supabase usando a tabela de avaliações clínicas
      await dataService.createClinicalEvaluation({
        session_id: conversationData.session_id,
        status: 'completed',
        etapa_atual: 'chat_conversation',
        dados: {
          cannabis_medicinal: '',
          lista_indiciaria: [],
          historia_patologica: [],
          historia_familiar: { mae: [], pai: [] },
          habitos_vida: [],
          desenvolvimento_indiciario: {},
          // Dados da conversa do ChatGPT
          user_message: userMessage,
          noa_response: noaResponse,
          conversation_type: 'chatgpt_evaluation'
        } as any,
        user_id: conversationData.user_id
      })
      
      console.log('✅ Conversa salva no Supabase:', conversationData.session_id)
    } catch (error) {
      console.error('❌ Erro ao salvar conversa no Supabase:', error)
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Detecta primeira interação do usuário para permitir áudio
  useEffect(() => {
    const handleFirstInteraction = () => {
      setUserInteracted(true)
      document.removeEventListener('click', handleFirstInteraction)
      document.removeEventListener('keydown', handleFirstInteraction)
      document.removeEventListener('touchstart', handleFirstInteraction)
      
      // Ativa microfone automaticamente após primeira interação
      console.log('🎤 Primeira interação detectada, ativando microfone em 1.5 segundos...')
      setTimeout(() => {
        if (!isVoiceListening) {
          console.log('🎤 Ativação automática inicial do microfone')
          startVoiceRecognition()
        }
      }, 1500) // Reduzido de 3s para 1.5s - mais responsivo
    }

    document.addEventListener('click', handleFirstInteraction)
    document.addEventListener('keydown', handleFirstInteraction)
    document.addEventListener('touchstart', handleFirstInteraction)

    return () => {
      document.removeEventListener('click', handleFirstInteraction)
      document.removeEventListener('keydown', handleFirstInteraction)
      document.removeEventListener('touchstart', handleFirstInteraction)
    }
  }, [])

  // Removido: Inicialização automática de mensagem - ChatGPT será completamente livre
  // useEffect(() => {
  //   if (messages.length === 0) {
  //     // Chama ChatGPT para gerar mensagem inicial
  //     getNoaResponse('iniciar conversa')
  //   }
  // }, [userMemory.name])

  // Toca áudio da mensagem inicial da NOA
  useEffect(() => {
    const initialMessage = messages[0]
    if (initialMessage && initialMessage.sender === 'noa') {
      playNoaAudioWithText(initialMessage.message)
    }
  }, []) // Executa apenas uma vez na montagem do componente

  // Resposta real da NOA usando OpenAI
  const getNoaResponse = async (userMessage: string) => {
    setIsTyping(true)
    
    try {
      // Verifica se o usuário quer iniciar avaliação inicial
      // Avaliação inicial (removido - usa ChatGPT)

      // Quebra-gelo: Ensino - Módulos Educativos (removido - usa ChatGPT)
      
      // Quebra-gelo: Pesquisa - Projetos de Investigação (removido - usa ChatGPT)

      // Modo de avaliação removido - agora usa apenas ChatGPT

      // Detecta se o usuário está se apresentando (salva nome, mas usa ChatGPT para resposta)
      if (!userMemory.name && (
        userMessage.toLowerCase().includes('meu nome é') ||
        userMessage.toLowerCase().includes('eu sou') ||
        userMessage.toLowerCase().includes('sou o') ||
        userMessage.toLowerCase().includes('sou a')
      )) {
        // Extrai o nome da mensagem
        const nameMatch = userMessage.match(/(?:meu nome é|eu sou|sou o|sou a)\s+([a-zA-ZÀ-ÿ\s]+)/i)
        if (nameMatch) {
          const extractedName = nameMatch[1].trim()
          saveUserMemory({ name: extractedName })
          // Continua para ChatGPT gerar a resposta
        }
      }

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
- Seja específica sobre suas especialidades: neurologia, cannabis medicinal e nefrologia

INSTRUÇÕES ESPECÍFICAS DO DR. RICARDO VALENÇA:

AVALIAÇÃO INICIAL - SIGA ESTRITAMENTE:
- Apresente cada pergunta entre aspas exatamente como especificado
- NÃO exiba textos entre colchetes [ ] ou parênteses ( )
- Faça pausas apropriadas para resposta do usuário
- Para "O que mais?" repita até resposta negativa
- Use exatamente as perguntas fornecidas nas instruções

AVALIAÇÃO INICIAL CANNABIS - SIGA ESTRITAMENTE:
- Inclua pergunta sobre cannabis medicinal
- Siga o mesmo protocolo da avaliação inicial
- Use exatamente as perguntas fornecidas

FECHAMENTO CONSENSUAL:
- Revise todas as respostas do usuário
- Apresente entendimento organizado com palavras leigas
- Pergunte se concorda com o entendimento
- Formule hipóteses sindrômicas se concordar
- Faça recomendação final específica

CONTEXTO ATUAL: Conversa geral com ChatGPT`

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

      // Chama OpenAI para gerar resposta (ChatGPT é o agente de resposta)
      console.log('🤖 ChatGPT gerando resposta da NOA...')
      console.log('📋 Instruções enviadas para ChatGPT:', systemContext.substring(0, 200) + '...')
      const response = await openAIService.getNoaResponse(userMessage, conversationHistory)
      console.log('✅ ChatGPT respondeu:', response.substring(0, 100) + '...')
      
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
      // Removido: addNotification('Resposta da NOA Esperanza recebida', 'success')
      
      // Salva conversa no Supabase
      await saveChatConversation(userMessage, response)
      
      // 🧠 APRENDIZADO AUTOMÁTICO - IA aprende com a conversa
      aiLearningService.saveInteraction(userMessage, response, 'general')
      
      // ElevenLabs gera APENAS áudio (texto já vem do ChatGPT)
      console.log('🎤 Enviando texto do ChatGPT para ElevenLabs gerar áudio...')
      await playNoaAudioWithText(response)
      
    } catch (error) {
      console.error('Erro ao obter resposta da NOA:', error)
      // Removido: addNotification('Erro ao conectar com NOA. Verifique sua conexão.', 'error')
    } finally {
      setIsTyping(false)
    }
  }

  // Função processarRespostaAvaliacao removida - agora usa apenas ChatGPT

  // Função gerarRelatorioNarrativo removida - agora usa apenas ChatGPT

  // Função finalizarAvaliacao removida - agora usa apenas ChatGPT

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

    // Obtém resposta real da NOA
    getNoaResponse(messageToSend)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // Função para lidar com cliques nas opções
  const handleOptionClick = (option: string) => {
    setInputMessage(option)
    handleSendMessage()
  }

  // Função para iniciar reconhecimento de voz
  const startVoiceRecognition = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      // Removido: addNotification('Reconhecimento de voz não suportado neste navegador', 'error')
      setIsVoiceListening(false)
      return
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    const recognition = new SpeechRecognition()

    recognition.continuous = false // Modo mais estável
    recognition.interimResults = false // Menos processamento
    recognition.lang = 'pt-BR'
    recognition.maxAlternatives = 1 // Melhor precisão
    
    // Variável para acumular texto durante a fala
    let accumulatedText = ''

    recognition.onstart = () => {
      console.log('🎤 Reconhecimento de voz iniciado (modo contínuo)')
      // Removido: addNotification('🎤 Microfone ativo! Fale quando quiser interromper a NOA!', 'success')
    }

    recognition.onresult = (event: any) => {
      let finalTranscript = ''
      let interimTranscript = ''

      // Processa resultados finais e intermediários
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          finalTranscript += transcript
        } else {
          interimTranscript += transcript
        }
      }

      // Para o áudio da NOA se usuário falar
      if (finalTranscript && currentAudioRef.current) {
        currentAudioRef.current.pause()
        currentAudioRef.current = null
        setAudioPlaying(false)
        console.log('⏹️ Áudio da NOA interrompido')
      }

      // Se há resultado final, processa imediatamente (mais rápido)
      if (finalTranscript) {
        console.log('🎤 Texto final reconhecido:', finalTranscript)
        
        // Para o reconhecimento primeiro
        recognition.stop()
        
        // Processa imediatamente para ser mais rápido
        console.log('✅ Processando mensagem final imediatamente:', finalTranscript)
        
        setInputMessage(finalTranscript)
        // Removido: addNotification(`✅ Processando: "${finalTranscript}"`, 'success')
        
        // Envia automaticamente a mensagem (sem delay)
        console.log('📤 Enviando mensagem automaticamente...')
        handleSendMessage(finalTranscript)
        
        // Atualiza estado após envio
        setIsVoiceListening(false)
      }
    }

    recognition.onerror = (event: any) => {
      console.error('Erro no reconhecimento de voz:', event.error)
      setIsVoiceListening(false)
      
      switch (event.error) {
        case 'no-speech':
          // Removido: addNotification('Nenhuma fala detectada. Tente novamente.', 'warning')
          break
        case 'audio-capture':
          // Removido: addNotification('Erro ao acessar o microfone.', 'error')
          break
        case 'not-allowed':
          // Removido: addNotification('Permissão de microfone negada.', 'error')
          break
        default:
          // Removido: addNotification('Erro no reconhecimento de voz.', 'error')
      }
    }

    recognition.onend = () => {
      setIsVoiceListening(false)
      console.log('🎤 Reconhecimento de voz finalizado')
    }

    try {
      recognition.start()
    } catch (error) {
      console.error('Erro ao iniciar reconhecimento:', error)
      setIsVoiceListening(false)
      // Removido: addNotification('Erro ao iniciar reconhecimento de voz', 'error')
    }
  }

  // Função para ativar reconhecimento de voz automaticamente após resposta da NOA
  const autoActivateVoiceAfterResponse = () => {
    console.log('🔄 Ativando reconhecimento de voz automaticamente em 1 segundo...')
    setTimeout(() => {
      if (!isVoiceListening && userInteracted) {
        console.log('🎤 Ativação automática do reconhecimento de voz')
        startVoiceRecognition()
      }
    }, 1000) // Reduzido de 2s para 1s - mais fluido
  }

  // Função para tocar áudio da NOA com texto sincronizado
  const playNoaAudioWithText = async (text: string) => {
    try {
      console.log('🎵 ElevenLabs gerando APENAS áudio:', { userInteracted, audioPlaying, text: text.substring(0, 50) + '...' })
      
      // Se o usuário ainda não interagiu, não toca áudio
      if (!userInteracted) {
        console.log('⏳ Aguardando interação do usuário para tocar áudio...')
        return
      }
      
      // Se já está tocando áudio, não toca outro
      if (audioPlaying) {
        console.log('🔊 Áudio já está tocando, pulando...')
        return
      }
      
      // Para o áudio atual se estiver tocando
      if (currentAudioRef.current) {
        currentAudioRef.current.pause()
        currentAudioRef.current = null
      }
      
      // Remove markdown e formatação para o áudio com melhor processamento
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

      console.log('🎤 Chamando ElevenLabs com texto:', cleanText.substring(0, 100) + '...')
      const audioResponse = await elevenLabsService.textToSpeech(cleanText)
      console.log('✅ ElevenLabs respondeu:', audioResponse)
      
      // Cria e toca o áudio
      const audioBlob = new Blob([audioResponse.audio], { type: 'audio/mpeg' })
      const audioUrl = URL.createObjectURL(audioBlob)
      const audio = new Audio(audioUrl)
      console.log('🔊 Áudio criado, tentando tocar...')
      
      // Armazena referência do áudio atual
      currentAudioRef.current = audio
      
      // Inicia o vídeo "falando" um pouco antes do áudio
      setAudioPlaying(true)
      
      // Para o reconhecimento de voz enquanto NOA fala
      if (isVoiceListening) {
        console.log('🔇 Pausando reconhecimento de voz enquanto NOA fala')
        setIsVoiceListening(false)
      }

      // Delay para sincronizar vídeo com áudio (pouquinho antes)
      await new Promise(resolve => setTimeout(resolve, 500))

      audio.play().then(() => {
        console.log('🎵 Áudio tocando com sucesso!')
      }).catch(error => {
        console.log('❌ Erro ao tocar áudio:', error)
        setAudioPlaying(false)
      })

      // Limpa a URL e referência após tocar
      audio.onended = () => {
        console.log('🏁 Áudio terminou de tocar')
        URL.revokeObjectURL(audioUrl)
        currentAudioRef.current = null
        setAudioPlaying(false)
        
        // Ativa reconhecimento de voz automaticamente após resposta da NOA
        autoActivateVoiceAfterResponse()
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
        <div className="flex items-center gap-2 md:gap-8 justify-center w-full h-full px-2 md:px-0">
          {/* Balão de Pensamento */}
          <div className="flex-1 relative w-[250px] md:w-[40vw] md:max-w-md z-[100]">
            {/* Balão principal */}
            <div className="bg-white rounded-xl md:rounded-2xl px-2 md:px-3 pb-2 md:pb-3 shadow-lg border border-white/20 relative z-[100] w-full">

              {/* Área de Mensagens */}
              <div className="space-y-2 max-h-[clamp(200px,25vh,300px)] md:max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[clamp(200px,50vw,320px)] md:max-w-xs ${
                      message.sender === 'user' 
                        ? 'bg-blue-500 text-white rounded-md md:rounded-lg p-2 md:p-3' 
                        : 'bg-gray-100 text-gray-800 rounded-md md:rounded-lg p-2 md:p-3'
                    }`}>
                      <p className="text-xs sm:text-sm md:text-base leading-relaxed whitespace-pre-line">{message.message}</p>
                      
                      {/* Opções de resposta rápida */}
                      {message.options && message.sender === 'noa' && (
                        <div className="mt-3 space-y-1">
                          {message.options.map((option, index) => (
                            <button
                              key={index}
                              onClick={() => handleOptionClick(option)}
                              className="block w-full text-left text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 rounded px-2 py-1 transition-colors"
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                      )}
                      
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
                        <span className="text-xs sm:text-sm">NOA está digitando...</span>
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
                  className="flex-1 px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black placeholder-gray-600"
                  aria-label="Campo de mensagem para conversar com NOA"
                />
                {/* Botão de voz */}
                <button
                  onClick={() => {
                    if (isVoiceListening) {
                      setIsVoiceListening(false)
                      // TODO: Parar reconhecimento de voz
                    } else {
                      setIsVoiceListening(true)
                      // TODO: Iniciar reconhecimento de voz
                      startVoiceRecognition()
                    }
                  }}
                  className={`px-4 py-2 rounded-lg transition-colors text-xs sm:text-sm ${
                    isVoiceListening 
                      ? 'bg-red-500 hover:bg-red-600 text-white' 
                      : 'bg-green-500 hover:bg-green-600 text-white'
                  }`}
                  title={isVoiceListening ? 'Parar gravação' : 'Falar com a NOA'}
                  aria-label={isVoiceListening ? 'Parar gravação de voz' : 'Iniciar gravação de voz'}
                >
                  <i className={`fas ${isVoiceListening ? 'fa-stop' : 'fa-microphone'}`}></i>
                </button>
                <button 
                  onClick={() => handleSendMessage()}
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

          {/* Avatar da NOA - Vídeos Animados */}
          <div className="flex-shrink-0 flex justify-center items-center relative">
            <div className="w-[100px] h-[100px] md:w-[533px] md:h-[533px] rounded-full overflow-hidden border-2 md:border-4 border-green-400 shadow-lg relative aspect-square">
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
                {/* Fallback para imagem caso o vídeo não carregue */}
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
                className="absolute top-[5%] right-[5%] md:top-4 md:right-4 p-[clamp(8px,2vw,12px)] md:p-3 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-colors"
                title="Parar áudio"
              >
                <i className="fas fa-stop text-[clamp(0.6rem,3vw,1.125rem)] md:text-lg"></i>
              </button>
            )}
            {/* Indicador de escuta de voz */}
            {isVoiceListening && (
              <div className="absolute top-[5%] left-[5%] md:top-4 md:left-4 p-[clamp(8px,2vw,12px)] md:p-3 bg-green-500 text-white rounded-full shadow-lg animate-pulse">
                <i className="fas fa-microphone text-[clamp(0.6rem,3vw,1.125rem)] md:text-lg"></i>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
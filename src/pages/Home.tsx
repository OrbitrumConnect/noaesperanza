import React, { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Specialty } from '../App'
import { openAIService, ChatMessage } from '../services/openaiService'
import { elevenLabsService } from '../services/elevenLabsService'
import { dataService } from '../services/supabaseService'
import { aiLearningService } from '../services/aiLearningService'
import { cleanTextForAudio } from '../utils/textUtils'
import { NoaGPT } from '../gpt/noaGPT'
import { clinicalAgent } from '../gpt/clinicalAgent'
import ThoughtBubble from '../components/ThoughtBubble'
import MatrixBackground from '../components/MatrixBackground'

interface Message {
  id: string
  message: string
  sender: 'user' | 'noa'
  timestamp: Date
  options?: string[] // Opções de resposta rápida
  isTyping?: boolean // Indicador de digitação
}

// Interface para cards expandidos
interface ExpandedCard {
  id: string
  title: string
  description: string
  content: string
  type: 'consulta' | 'analise' | 'protocolo' | 'pesquisa'
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

// Etapas da Avaliação Clínica Triaxial
const ETAPAS_AVALIACAO = [
  { 
    id: 'abertura', 
    title: 'Abertura Exponencial', 
    pergunta: 'Olá! Eu sou Nôa Esperanza. Por favor, apresente-se também e vamos iniciar a sua avaliação inicial para consultas com Dr. Ricardo Valença.',
    opcoes: ['Olá, sou [seu nome], tenho [idade] anos', 'Meu nome é [nome], sou [profissão]', 'Sou [nome], venho de [cidade]']
  },
  { 
    id: 'cannabis_medicinal', 
    title: 'Cannabis Medicinal', 
    pergunta: 'Você já utilizou canabis medicinal?',
    opcoes: ['Sim, já utilizei', 'Não, nunca utilizei', 'Estou considerando usar', 'Não sei o que é', 'Prefiro não responder']
  },
  { 
    id: 'lista_indiciaria', 
    title: 'Lista Indiciária', 
    pergunta: 'O que trouxe você à nossa avaliação hoje?',
    opcoes: ['Dor de cabeça', 'Dor no peito', 'Falta de ar', 'Dor abdominal', 'Cansaço', 'Outro sintoma']
  },
  { 
    id: 'queixa_principal', 
    title: 'Queixa Principal', 
    pergunta: 'De todas essas questões, qual mais o(a) incomoda?',
    opcoes: ['A primeira que mencionei', 'A segunda que mencionei', 'A terceira que mencionei', 'Todas me incomodam igualmente']
  },
  { 
    id: 'desenvolvimento_localizacao', 
    title: 'Desenvolvimento Indiciário - Localização', 
    pergunta: 'Vamos explorar suas queixas mais detalhadamente. Onde você sente [queixa]?',
    opcoes: ['Cabeça', 'Peito', 'Abdômen', 'Costas', 'Pernas', 'Braços', 'Todo o corpo']
  },
  { 
    id: 'desenvolvimento_inicio', 
    title: 'Início', 
    pergunta: 'Quando essa [queixa] começou?',
    opcoes: ['Hoje', 'Ontem', 'Esta semana', 'Este mês', 'Há alguns meses', 'Há mais de um ano']
  },
  { 
    id: 'desenvolvimento_qualidade', 
    title: 'Qualidade', 
    pergunta: 'Como é a [queixa]?',
    opcoes: ['Dor aguda', 'Dor latejante', 'Dor em queimação', 'Dor em pontada', 'Desconforto', 'Pressão']
  },
  { 
    id: 'desenvolvimento_sintomas', 
    title: 'Sintomas Associados', 
    pergunta: 'O que mais você sente quando está com a [queixa]?',
    opcoes: ['Náusea', 'Tontura', 'Suor', 'Falta de ar', 'Cansaço', 'Nenhum sintoma adicional']
  },
  { 
    id: 'desenvolvimento_melhora', 
    title: 'Fatores de Melhora', 
    pergunta: 'O que melhora a [queixa]?',
    opcoes: ['Repouso', 'Medicação', 'Calor', 'Frio', 'Massagem', 'Nada melhora']
  },
  { 
    id: 'desenvolvimento_piora', 
    title: 'Fatores de Piora', 
    pergunta: 'O que piora a [queixa]?',
    opcoes: ['Movimento', 'Esforço', 'Estresse', 'Alimentação', 'Posição', 'Nada piora']
  },
  { 
    id: 'historia_patologica', 
    title: 'História Patológica Pregressa', 
    pergunta: 'E agora, sobre o restante sua vida até aqui, desde seu nascimento, quais as questões de saúde que você já viveu? Vamos ordenar do mais antigo para o mais recente, o que veio primeiro?',
    opcoes: ['Nenhuma', 'Hipertensão', 'Diabetes', 'Problemas cardíacos', 'Cirurgias', 'Outras doenças']
  },
  { 
    id: 'historia_familiar_mae', 
    title: 'História Familiar - Mãe', 
    pergunta: 'E na sua família? Começando pela parte de sua mãe, quais as questões de saúde dela e desse lado da família?',
    opcoes: ['Nenhuma', 'Hipertensão', 'Diabetes', 'Câncer', 'Problemas cardíacos', 'Outras doenças']
  },
  { 
    id: 'historia_familiar_pai', 
    title: 'História Familiar - Pai', 
    pergunta: 'E por parte do pai?',
    opcoes: ['Nenhuma', 'Hipertensão', 'Diabetes', 'Câncer', 'Problemas cardíacos', 'Outras doenças']
  },
  { 
    id: 'habitos_vida', 
    title: 'Hábitos de Vida', 
    pergunta: 'Além dos hábitos de vida que já verificamos em nossa conversa, que outros hábitos você acha importante mencionar?',
    opcoes: ['Fumo', 'Bebida alcoólica', 'Exercícios', 'Alimentação', 'Sono', 'Estresse no trabalho']
  },
  { 
    id: 'alergias', 
    title: 'Alergias', 
    pergunta: 'Você tem alguma alergia (mudança de tempo, medicação, poeira...)?',
    opcoes: ['Nenhuma', 'Poeira', 'Pólen', 'Medicamentos', 'Alimentos', 'Mudança de tempo']
  },
  { 
    id: 'medicacoes_continuas', 
    title: 'Medicações Contínuas', 
    pergunta: 'Quais medicações utiliza regularmente?',
    opcoes: ['Nenhuma', 'Anti-hipertensivo', 'Antidiabético', 'Analgésico', 'Vitaminas', 'Outras medicações']
  },
  { 
    id: 'medicacoes_eventuais', 
    title: 'Medicações Eventuais', 
    pergunta: 'Quais as medicações você utiliza esporadicamente (de vez em quando) e porque utiliza?',
    opcoes: ['Nenhuma', 'Analgésico para dor', 'Antitérmico para febre', 'Antiácido', 'Antialérgico', 'Outras medicações']
  },
  { 
    id: 'fechamento', 
    title: 'Fechamento Consensual', 
    pergunta: 'Vamos revisar a sua história rapidamente para garantir que não perdemos nenhum detalhe importante.',
    opcoes: ['Sim, vamos revisar', 'Está tudo correto', 'Quero adicionar algo', 'Há algo a corrigir']
  }
]

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
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  
  // Estados para expansão de cards
  const [expandedCard, setExpandedCard] = useState<ExpandedCard | null>(null)
  const [isCardExpanded, setIsCardExpanded] = useState(false)

  // Função para expandir card
  const expandCard = (card: ExpandedCard) => {
    setExpandedCard(card)
    setIsCardExpanded(true)
    
    // NOA inicia ministrando o conteúdo
    const noaMessage: Message = {
      id: crypto.randomUUID(),
      message: `Vou te ajudar com ${card.title.toLowerCase()}. ${card.content}`,
      sender: 'noa',
      timestamp: new Date()
    }
    setMessages(prev => [...prev, noaMessage])
  }

  // Função para fechar card expandido
  const closeExpandedCard = () => {
    setIsCardExpanded(false)
    setExpandedCard(null)
    
    // Gerar novos pensamentos quando fechar o card
    const newThoughts = generateThoughtsFromResponse('')
    setThoughts(newThoughts)
  }
  
  // Estado do NoaGPT
  const [noaGPT, setNoaGPT] = useState<NoaGPT | null>(null)

  // Estados para Avaliação Clínica Triaxial
  const [modoAvaliacao, setModoAvaliacao] = useState(false)
  const [etapaAtual, setEtapaAtual] = useState(0)
  const [perguntandoMais, setPerguntandoMais] = useState(false)
  
  // Estado para efeito matrix eterno
  const [matrixActive, setMatrixActive] = useState(true)
  const [dadosAvaliacao, setDadosAvaliacao] = useState<AvaliacaoClinicaData['dados']>({
    cannabis_medicinal: '',
    lista_indiciaria: [],
    historia_patologica: [],
    historia_familiar: { mae: [], pai: [] },
    habitos_vida: [],
    desenvolvimento_indiciario: {}
  })
  const [sessionId] = useState(() => `avaliacao_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`)
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
  const [showAILearningDashboard, setShowAILearningDashboard] = useState(false)

  // Auto scroll para a última mensagem
  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      // Usar scrollTop para melhor compatibilidade
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight
    }
  }

  // Salva memória do usuário
  const saveUserMemory = (newMemory: any) => {
    const updatedMemory = { ...userMemory, ...newMemory, lastVisit: new Date().toISOString() }
    setUserMemory(updatedMemory)
    localStorage.setItem('noa_user_memory', JSON.stringify(updatedMemory))
  }

  // Salva avaliação no Supabase
  const saveEvaluationToSupabase = async (isCompleted: boolean = false) => {
    try {
      const evaluationData = {
        session_id: sessionId,
        status: (isCompleted ? 'completed' : 'in_progress') as 'completed' | 'in_progress',
        etapa_atual: ETAPAS_AVALIACAO[etapaAtual]?.id || 'fechamento',
        dados: dadosAvaliacao,
        user_id: userMemory.name ? userMemory.name : null
      }

      if (evaluationId) {
        // Atualiza avaliação existente
        await dataService.updateClinicalEvaluation(evaluationId, evaluationData)
      } else {
        // Cria nova avaliação
        const result = await dataService.createClinicalEvaluation(evaluationData)
        setEvaluationId(result.id)
      }
    } catch (error) {
      console.error('Erro ao salvar avaliação no Supabase:', error)
      // Não mostra erro para o usuário, apenas loga
    }
  }

  useEffect(() => {
    // Usar setTimeout para garantir que o DOM foi atualizado
    const timer = setTimeout(() => {
      scrollToBottom()
    }, 100)

    return () => clearTimeout(timer)
  }, [messages])

  // Listener para respostas refinadas
  useEffect(() => {
    const handleResponseRefined = (event: CustomEvent) => {
      const { userMessage, refinedResponse } = event.detail
      console.log('🔄 Resposta refinada recebida:', refinedResponse.substring(0, 100) + '...')
      
      // Atualizar a última mensagem da NOA com a resposta refinada
      setMessages(prev => {
        const updatedMessages = [...prev]
        const lastNoaMessageIndex = updatedMessages.map((msg: Message, index: number) => ({ msg, index }))
          .filter(({ msg }) => msg.sender === 'noa')
          .pop()?.index ?? -1
        
        if (lastNoaMessageIndex !== -1) {
          updatedMessages[lastNoaMessageIndex] = {
            ...updatedMessages[lastNoaMessageIndex],
            message: refinedResponse,
            timestamp: new Date()
          }
        }
        
        return updatedMessages
      })
    }

    // Adicionar listener
    window.addEventListener('noaResponseRefined', handleResponseRefined as EventListener)

    // Cleanup
    return () => {
      window.removeEventListener('noaResponseRefined', handleResponseRefined as EventListener)
    }
  }, [])

  // Áudio liberado automaticamente - sem necessidade de primeira interação
  useEffect(() => {
    setUserInteracted(true) // Libera áudio imediatamente
  }, [])

  // Chat limpo - sem mensagem inicial automática
  // O usuário pode começar a conversa naturalmente

  // Toca áudio da mensagem inicial da NOA
  useEffect(() => {
    const initialMessage = messages[0]
    if (initialMessage && initialMessage.sender === 'noa') {
      playNoaAudioWithText(initialMessage.message)
    }
  }, []) // Executa apenas uma vez na montagem do componente

  // Efeito matrix eterno - sempre ativo

  // Resposta real da NOA usando OpenAI
  const getNoaResponse = async (userMessage: string) => {
    console.log('🚀 INICIANDO getNoaResponse com:', userMessage)
    setIsTyping(true)
    
    // Feedback imediato para o usuário
    const typingMessage: Message = {
      id: crypto.randomUUID(),
      message: 'NOA está pensando...',
      sender: 'noa',
      timestamp: new Date(),
      isTyping: true
    }
    setMessages(prev => [...prev, typingMessage])
    
    try {
      // 🩺 SISTEMA DE AVALIAÇÃO CLÍNICA TRIAXIAL INTEGRADO
      // Verifica se deve iniciar avaliação clínica usando o clinicalAgent
      console.log('🔍 Verificando se deve iniciar avaliação clínica...')
      try {
        const inicioAvaliacao = await clinicalAgent.detectarInicioAvaliacao(userMessage)
        console.log('🔍 Resultado detectarInicioAvaliacao:', inicioAvaliacao)
        if (inicioAvaliacao && inicioAvaliacao.iniciar) {
          console.log('✅ Iniciando avaliação clínica!')
          setModoAvaliacao(true)
          const noaMessage: Message = {
            id: crypto.randomUUID(),
            message: inicioAvaliacao.mensagem,
            sender: 'noa',
            timestamp: new Date()
          }
          setMessages(prev => [...prev, noaMessage])
          setIsTyping(false)
          console.log('✅ Avaliação iniciada, saindo da função')
          return
        } else if (inicioAvaliacao && !inicioAvaliacao.iniciar) {
          // Erro de conexão ou problema - mostrar mensagem de erro
          console.log('❌ Não foi possível iniciar avaliação:', inicioAvaliacao.mensagem)
          const noaMessage: Message = {
            id: crypto.randomUUID(),
            message: inicioAvaliacao.mensagem,
            sender: 'noa',
            timestamp: new Date()
          }
          setMessages(prev => [...prev, noaMessage])
          setIsTyping(false)
          return
        }
      } catch (error) {
        console.error('❌ Erro no clinicalAgent.detectarInicioAvaliacao:', error)
        // Continua para o fluxo normal se houver erro
      }

      // Se está em modo avaliação, processa a resposta usando clinicalAgent
      if (modoAvaliacao) {
        try {
          console.log('🩺 Modo avaliação ativo, processando com clinicalAgent...')
          console.log('📝 Mensagem do usuário:', userMessage)
          const respostaAvaliacao = await clinicalAgent.executarFluxo(userMessage)
          console.log('📝 Resposta do clinicalAgent:', respostaAvaliacao)
          const noaMessage: Message = {
            id: crypto.randomUUID(),
            message: typeof respostaAvaliacao === 'string' ? respostaAvaliacao : respostaAvaliacao.mensagem,
            sender: 'noa',
            timestamp: new Date()
          }
          setMessages(prev => [...prev, noaMessage])
          setIsTyping(false)
          return
        } catch (error) {
          console.error('Erro no clinicalAgent.executarFluxo:', error)
          // Continua para o fluxo normal se houver erro
        }
      }

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

      // 🤖 TENTAR NoaGPT PRIMEIRO (conforme Documento Mestre v.2.0)
      console.log('🤖 Chamando NoaGPT.processCommand...')
      
      // Inicializa o NoaGPT se ainda não foi criado
      let currentNoaGPT = noaGPT
      if (!currentNoaGPT) {
        currentNoaGPT = new NoaGPT()
        setNoaGPT(currentNoaGPT)
      }
      
      // 🤖 SISTEMA HÍBRIDO: NoaGPT + ChatGPT Fine-tuned
      console.log('🤖 Chamando sistema híbrido...')
      
      // Preparar histórico da conversa
      const chatHistory = messages
        .filter(msg => msg.sender === 'user' || msg.sender === 'noa')
        .slice(-10) // Últimas 10 mensagens
        .map(msg => `${msg.sender}: ${msg.message}`)
      
      // Usar sistema híbrido inteligente
      const noaResponse = await currentNoaGPT.processCommandWithFineTuned(userMessage, chatHistory)
      console.log('✅ Sistema híbrido respondeu:', noaResponse.substring(0, 100) + '...')
      
      // Se sistema híbrido reconheceu o comando, usar sua resposta
      if (noaResponse !== 'OPENAI_FALLBACK') {
        console.log('✅ Usando resposta imediata do sistema híbrido')
        
        // Remove a mensagem de "pensando" e adiciona a resposta real
        setMessages(prev => {
          const withoutTyping = prev.filter(msg => !msg.isTyping)
          const noaMessage: Message = {
            id: crypto.randomUUID(),
            message: noaResponse,
            sender: 'noa',
            timestamp: new Date()
          }
          return [...withoutTyping, noaMessage]
        })
        
        // Salvar interação no sistema de aprendizado
        aiLearningService.saveInteraction(userMessage, noaResponse, 'general')
        
        // Salvar conversa na tabela noa_conversations
        await currentNoaGPT.saveResponse(userMessage, noaResponse, 'chat_interaction', 'general')
        
        // Gerar áudio
        await playNoaAudioWithText(noaResponse)
        setIsTyping(false)
        return
      }
      
      console.log('🔄 NoaGPT não reconheceu, usando OpenAI fallback...')
      
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

CONTEXTO ATUAL: ${modoAvaliacao ? 'Usuário está em avaliação clínica triaxial' : 'Conversa geral'}`

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

      // Chama OpenAI para gerar resposta (fallback quando NoaGPT não reconhece)
      const openAIResponse = await openAIService.getNoaResponse(userMessage)
      console.log('✅ OpenAI respondeu:', openAIResponse.substring(0, 100) + '...')
      
      // Remove a mensagem de "pensando" e adiciona a resposta real
      setMessages(prev => {
        const withoutTyping = prev.filter(msg => !msg.isTyping)
        const noaMessage: Message = {
          id: crypto.randomUUID(),
          message: openAIResponse,
          sender: 'noa',
          timestamp: new Date()
        }
        return [...withoutTyping, noaMessage]
      })
      // Removido: addNotification('Resposta da NOA Esperanza recebida', 'success')
      
      // 🧠 APRENDIZADO AUTOMÁTICO - IA aprende com a conversa
      aiLearningService.saveInteraction(userMessage, openAIResponse, 'general')
      
      // Salvar conversa na tabela noa_conversations
      if (currentNoaGPT) {
        await currentNoaGPT.saveResponse(userMessage, openAIResponse, 'openai_fallback', 'general')
      }
      
      // 💭 GERAR PENSAMENTOS FLUTUANTES baseados na resposta
      setTimeout(() => {
        const newThoughts = generateThoughtsFromResponse(openAIResponse)
        console.log('💭 Gerando pensamentos:', newThoughts)
        console.log('💭 Número de pensamentos:', newThoughts.length)
        console.log('💭 IDs dos pensamentos:', newThoughts.map(t => t.id))
        setThoughts(newThoughts)
        setIsProcessing(false)
      }, 1500) // Delay de 1.5s para aparecer após a resposta
      
      // ElevenLabs gera APENAS áudio (texto já vem do ChatGPT)
      console.log('🎤 Enviando texto do ChatGPT para ElevenLabs gerar áudio...')
      await playNoaAudioWithText(openAIResponse)
      
    } catch (error) {
      console.error('❌ Erro ao obter resposta da NOA:', error)
      // Removido: addNotification('Erro ao conectar com NOA. Verifique sua conexão.', 'error')
    } finally {
      console.log('🏁 FINALIZANDO getNoaResponse - setIsTyping(false)')
      setIsTyping(false)
    }
  }

  // Processa resposta da avaliação clínica
  const processarRespostaAvaliacao = async (resposta: string) => {
    const etapa = ETAPAS_AVALIACAO[etapaAtual]
    
    // Verifica se é uma resposta "não" ou "nenhuma" para pular "O que mais?"
    const respostaNegativa = resposta.toLowerCase().includes('não') || 
                            resposta.toLowerCase().includes('nenhuma') || 
                            resposta.toLowerCase().includes('nada') ||
                            resposta.toLowerCase().includes('nunca')
    
    // Salva a resposta na etapa atual
    if (etapa.id === 'abertura') {
      setDadosAvaliacao(prev => ({ ...prev, apresentacao: resposta }))
    } else if (etapa.id === 'cannabis_medicinal') {
      setDadosAvaliacao(prev => ({ ...prev, cannabis_medicinal: resposta }))
    } else if (etapa.id === 'lista_indiciaria') {
      setDadosAvaliacao(prev => ({ 
        ...prev, 
        lista_indiciaria: [...prev.lista_indiciaria, resposta] 
      }))
      
      // Pergunta "O que mais?" removida - usa ChatGPT
    } else if (etapa.id === 'queixa_principal') {
      setDadosAvaliacao(prev => ({ ...prev, queixa_principal: resposta }))
    } else if (etapa.id === 'desenvolvimento_localizacao') {
      setDadosAvaliacao(prev => ({ 
        ...prev, 
        desenvolvimento_indiciario: { 
          ...prev.desenvolvimento_indiciario, 
          localizacao: resposta 
        } 
      }))
    } else if (etapa.id === 'desenvolvimento_inicio') {
      setDadosAvaliacao(prev => ({ 
        ...prev, 
        desenvolvimento_indiciario: { 
          ...prev.desenvolvimento_indiciario, 
          inicio: resposta 
        } 
      }))
    } else if (etapa.id === 'desenvolvimento_qualidade') {
      setDadosAvaliacao(prev => ({ 
        ...prev, 
        desenvolvimento_indiciario: { 
          ...prev.desenvolvimento_indiciario, 
          qualidade: resposta 
        } 
      }))
    } else if (etapa.id === 'desenvolvimento_sintomas') {
      setDadosAvaliacao(prev => ({ 
        ...prev, 
        desenvolvimento_indiciario: { 
          ...prev.desenvolvimento_indiciario, 
          sintomas_associados: resposta 
        } 
      }))
    } else if (etapa.id === 'desenvolvimento_melhora') {
      setDadosAvaliacao(prev => ({ 
        ...prev, 
        desenvolvimento_indiciario: { 
          ...prev.desenvolvimento_indiciario, 
          fatores_melhora: resposta 
        } 
      }))
    } else if (etapa.id === 'desenvolvimento_piora') {
      setDadosAvaliacao(prev => ({ 
        ...prev, 
        desenvolvimento_indiciario: { 
          ...prev.desenvolvimento_indiciario, 
          fatores_piora: resposta 
        } 
      }))
    } else if (etapa.id === 'historia_patologica') {
      setDadosAvaliacao(prev => ({ 
        ...prev, 
        historia_patologica: [...prev.historia_patologica, resposta] 
      }))
      
      // Pergunta "O que mais?" removida - usa ChatGPT
    } else if (etapa.id === 'historia_familiar_mae') {
      setDadosAvaliacao(prev => ({ 
        ...prev, 
        historia_familiar: { 
          ...prev.historia_familiar, 
          mae: [...prev.historia_familiar.mae, resposta] 
        } 
      }))
      
      // Pergunta "O que mais?" removida - usa ChatGPT
    } else if (etapa.id === 'historia_familiar_pai') {
      setDadosAvaliacao(prev => ({ 
        ...prev, 
        historia_familiar: { 
          ...prev.historia_familiar, 
          pai: [...prev.historia_familiar.pai, resposta] 
        } 
      }))
      
      // Pergunta "O que mais?" removida - usa ChatGPT
    } else if (etapa.id === 'habitos_vida') {
      setDadosAvaliacao(prev => ({ 
        ...prev, 
        habitos_vida: [...prev.habitos_vida, resposta] 
      }))
      
      // Pergunta "O que mais?" removida - usa ChatGPT
    } else if (etapa.id === 'alergias') {
      setDadosAvaliacao(prev => ({ ...prev, alergias: resposta }))
    } else if (etapa.id === 'medicacoes_continuas') {
      setDadosAvaliacao(prev => ({ 
        ...prev, 
        medicacoes: { 
          ...prev.medicacoes, 
          continuas: resposta 
        } 
      }))
    } else if (etapa.id === 'medicacoes_eventuais') {
      setDadosAvaliacao(prev => ({ 
        ...prev, 
        medicacoes: { 
          ...prev.medicacoes, 
          eventuais: resposta 
        } 
      }))
    } else if (etapa.id === 'fechamento') {
      // Gera relatório narrativo
      const relatorio = gerarRelatorioNarrativo()
      setDadosAvaliacao(prev => ({ ...prev, relatorio_narrativo: relatorio }))
    }

    // Se estava perguntando "O que mais?" e recebeu resposta negativa, avança
    if (perguntandoMais && respostaNegativa) {
      setPerguntandoMais(false)
    }

    // Salva progresso no Supabase
    await saveEvaluationToSupabase(false)

    // Avança para próxima etapa
    if (etapaAtual < ETAPAS_AVALIACAO.length - 1) {
      setEtapaAtual(prev => prev + 1)
      const proximaEtapa = ETAPAS_AVALIACAO[etapaAtual + 1]
      
      // Próxima pergunta removida - usa ChatGPT
    } else {
      // Finaliza avaliação
      await finalizarAvaliacao()
    }
  }

  // Gera relatório narrativo
  const gerarRelatorioNarrativo = () => {
    const dados = dadosAvaliacao
    return `
**RELATÓRIO DE AVALIAÇÃO CLÍNICA INICIAL**
*Método Triaxial - Dr. Ricardo Valença*

**APRESENTAÇÃO:** ${dados.apresentacao || 'Não informado'}

**CANNABIS MEDICINAL:** ${dados.cannabis_medicinal || 'Não informado'}

**QUEIXAS PRINCIPAIS:** ${dados.lista_indiciaria.join(', ')}

**QUEIXA PRINCIPAL:** ${dados.queixa_principal || 'Não especificada'}

**DESENVOLVIMENTO INDICIÁRIO:**
- Localização: ${dados.desenvolvimento_indiciario?.localizacao || 'Não informado'}
- Início: ${dados.desenvolvimento_indiciario?.inicio || 'Não informado'}
- Qualidade: ${dados.desenvolvimento_indiciario?.qualidade || 'Não informado'}
- Sintomas associados: ${dados.desenvolvimento_indiciario?.sintomas_associados || 'Não informado'}
- Fatores de melhora: ${dados.desenvolvimento_indiciario?.fatores_melhora || 'Não informado'}
- Fatores de piora: ${dados.desenvolvimento_indiciario?.fatores_piora || 'Não informado'}

**HISTÓRIA PATOLÓGICA:** ${dados.historia_patologica.join(', ') || 'Nenhuma'}

**HISTÓRIA FAMILIAR:**
- Mãe: ${dados.historia_familiar.mae.join(', ') || 'Nenhuma'}
- Pai: ${dados.historia_familiar.pai.join(', ') || 'Nenhuma'}

**HÁBITOS DE VIDA:** ${dados.habitos_vida.join(', ') || 'Não informado'}

**ALERGIAS:** ${dados.alergias || 'Nenhuma'}

**MEDICAÇÕES:**
- Contínuas: ${dados.medicacoes?.continuas || 'Nenhuma'}
- Eventuais: ${dados.medicacoes?.eventuais || 'Nenhuma'}

*Relatório gerado em: ${new Date().toLocaleString('pt-BR')}*
    `.trim()
  }

  // Finaliza avaliação
  const finalizarAvaliacao = async () => {
    setModoAvaliacao(false)
    
    const relatorio = gerarRelatorioNarrativo()
    setDadosAvaliacao(prev => ({ ...prev, relatorio_narrativo: relatorio }))
    
    // Fechamento consensual detalhado
    const fechamentoConsensual: Message = {
      id: crypto.randomUUID(),
      message: `**FECHAMENTO CONSENSUAL**\n\nVamos revisar sua história para garantir que não perdemos nenhum detalhe importante.\n\n**RESUMO DA SUA HISTÓRIA:**\n\n${relatorio}\n\n**O que posso melhorar no meu entendimento?**`,
      sender: 'noa',
      timestamp: new Date(),
      options: ['Está tudo correto', 'Gostaria de adicionar algo', 'Há algo que não entendi bem', 'Posso melhorar alguma resposta']
    }
    
    setMessages(prev => [...prev, fechamentoConsensual])
    playNoaAudioWithText(fechamentoConsensual.message)
    
    // Aguarda resposta do fechamento consensual
    setTimeout(() => {
      const concordancia: Message = {
        id: crypto.randomUUID(),
        message: `**Você concorda com o meu entendimento?**\n\nHá mais alguma coisa que gostaria de adicionar sobre a história que construímos?`,
        sender: 'noa',
        timestamp: new Date(),
        options: ['Sim, concordo', 'Quero adicionar algo', 'Há algo a corrigir', 'Está perfeito']
      }
      
      setMessages(prev => [...prev, concordancia])
      playNoaAudioWithText(concordancia.message)
      
      // Finalização com recomendação específica
      setTimeout(() => {
        const finalizacao: Message = {
          id: crypto.randomUUID(),
          message: `**🎉 AVALIAÇÃO CLÍNICA CONCLUÍDA!**\n\n✅ Seu relatório foi gerado e está disponível no seu dashboard.\n\n**RECOMENDAÇÃO FINAL:**\n\nEssa é uma avaliação inicial de acordo com o método desenvolvido pelo Dr. Ricardo Valença com o objetivo de aperfeiçoar o seu atendimento. Ao final, recomendo a marcação de uma consulta com o Dr. Ricardo Valença pelo site.\n\n💡 **Próximos passos:**\n- Agende sua consulta\n- Leve este relatório\n- Prepare suas dúvidas\n\n*Método Triaxial - Dr. Ricardo Valença*`,
          sender: 'noa',
          timestamp: new Date()
        }
        
        setMessages(prev => [...prev, finalizacao])
        // Removido: addNotification('Avaliação Clínica Concluída', 'success')
        playNoaAudioWithText(finalizacao.message)
        
        // Salva avaliação concluída no Supabase
        saveEvaluationToSupabase(true).then(() => {
          console.log('Avaliação salva no Supabase:', evaluationId)
        })
      }, 3000)
    }, 3000)
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
        id: 'pdf-1',
        type: 'pdf',
        icon: '📄',
        title: 'Protocolo CKD',
        description: 'Classificação por estágios renais',
        route: '/medcann-lab',
        action: 'Baixar PDF'
      },
      {
        id: 'curso-2',
        type: 'curso',
        icon: '🎓',
        title: 'Fundamentos AEC',
        description: 'Curso básico, 8h',
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
        id: 'ebook-2',
        type: 'ebook',
        icon: '📖',
        title: 'AEC Fundamentos',
        description: 'Guia completo da metodologia',
        route: '/ensino',
        action: 'Baixar eBook'
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
      },
      {
        id: 'protocolo-1',
        type: 'protocolo',
        icon: '📊',
        title: 'Protocolo CKD',
        description: 'Classificação por estágios renais',
        route: '/medcann-lab',
        action: 'Acessar Protocolo'
      },
      {
        id: 'protocolo-2',
        type: 'protocolo',
        icon: '🧠',
        title: 'Deep Learning Biomarcadores',
        description: 'IA para análise de função renal',
        route: '/medcann-lab',
        action: 'Ver Análise'
      }
    ]

    // CORRIGIDO: Pensamentos fixos, não aleatórios
    // Mostrar sempre os mesmos 4 pensamentos principais
    return availableThoughts.slice(0, 4)
  }

  // Função para lidar com clique nos pensamentos
  const handleThoughtClick = (thought: any) => {
    console.log('🎯 handleThoughtClick chamado:', thought.title, thought.route)
    
    // Se há um card expandido, fechar primeiro
    if (isCardExpanded) {
      closeExpandedCard()
      return
    }
    
    // Criar card expandido baseado no pensamento
    const cardContent = getCardContent(thought.type, thought.title)
    const expandedCard: ExpandedCard = {
      id: thought.id,
      title: thought.title,
      description: thought.description,
      content: cardContent,
      type: thought.type
    }
    
    // Expandir card ao invés de navegar
    expandCard(expandedCard)
    
    // Remove o pensamento clicado
    setThoughts(prev => prev.filter(t => t.id !== thought.id))
  }

  // Função para obter conteúdo do card baseado no tipo
  const getCardContent = (type: string, title: string): string => {
    switch (type) {
      case 'consulta':
        return `Vou te ajudar com sua consulta médica. Vamos começar coletando algumas informações sobre seus sintomas e histórico médico. Como você está se sentindo hoje?`
      case 'analise':
        return `Vou realizar uma análise clínica completa. Preciso entender melhor seu quadro para fornecer as melhores orientações. Pode me contar mais sobre seus sintomas?`
      case 'protocolo':
        return `Vou explicar este protocolo médico detalhadamente. É importante entender cada etapa para garantir o melhor tratamento. Tem alguma dúvida específica?`
      case 'pesquisa':
        return `Vou apresentar os resultados desta pesquisa médica. Os dados são muito interessantes e podem ajudar no seu tratamento. O que gostaria de saber primeiro?`
      case 'curso':
        return `Vou te guiar através deste curso médico. Vamos começar com os conceitos básicos e evoluir gradualmente. Está pronto para aprender?`
      case 'pdf':
        return `Tenho um documento importante para você. Este PDF contém informações valiosas sobre o tópico. Gostaria de baixar e revisar?`
      default:
        return `Vou te ajudar com ${title.toLowerCase()}. Como posso ser útil para você hoje?`
    }
  }

  // Função para obter ação específica do card
  const getCardAction = (type: string, title: string) => {
    switch (type) {
      case 'curso':
        return {
          label: 'Iniciar Curso',
          action: () => {
            const message = `Vamos começar o curso sobre ${title.toLowerCase()}. Primeiro, vou explicar os objetivos e estrutura do curso.`
            const noaMessage: Message = {
              id: crypto.randomUUID(),
              message: message,
              sender: 'noa',
              timestamp: new Date()
            }
            setMessages(prev => [...prev, noaMessage])
          },
          color: 'bg-blue-500 hover:bg-blue-600'
        }
      case 'pdf':
        return {
          label: 'Baixar PDF',
          action: () => {
            // Simular download do PDF
            const link = document.createElement('a')
            link.href = '#' // Aqui seria o link real do PDF
            link.download = `${title}.pdf`
            link.click()
            
            const message = `PDF "${title}" baixado com sucesso! Você pode revisar o documento e me fazer perguntas sobre o conteúdo.`
            const noaMessage: Message = {
              id: crypto.randomUUID(),
              message: message,
              sender: 'noa',
              timestamp: new Date()
            }
            setMessages(prev => [...prev, noaMessage])
          },
          color: 'bg-red-500 hover:bg-red-600'
        }
      default:
        return {
          label: `Explorar ${title}`,
          action: () => {
            const question = `Me explique mais sobre ${title.toLowerCase()}`
            setInputMessage(question)
          },
          color: 'bg-green-500 hover:bg-green-600'
        }
    }
  }

  // Função para fechar pensamento
  const handleThoughtClose = (thoughtId: string) => {
    console.log('❌ handleThoughtClose chamado para ID:', thoughtId)
    setThoughts(prev => prev.filter(t => t.id !== thoughtId))
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

    recognition.continuous = false // Para após capturar uma frase (evita eco)
    recognition.interimResults = false // Não mostra texto intermediário (evita eco)
    recognition.lang = 'pt-BR'
    recognition.maxAlternatives = 1 // Melhor precisão
    
    // Reconhecimento single-shot para evitar eco

    recognition.onstart = () => {
      console.log('🎤 Reconhecimento de voz iniciado (modo single-shot)')
      // Removido: addNotification('🎤 Microfone ativo! Fale uma frase!', 'success')
    }

    recognition.onresult = (event: any) => {
      // Para o reconhecimento imediatamente para evitar eco
      recognition.stop()
      
      let finalTranscript = ''
      
      // Processa apenas resultados finais
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript
        }
      }

      // Só processa se não estiver tocando áudio da NOA (evita eco)
      if (finalTranscript && !audioPlaying) {
        console.log('🎤 Texto reconhecido:', finalTranscript)
        
        // Para o áudio da NOA se estiver tocando
        if (currentAudioRef.current) {
          currentAudioRef.current.pause()
          currentAudioRef.current = null
          setAudioPlaying(false)
          console.log('⏹️ Áudio da NOA interrompido')
        }
        
        setInputMessage(finalTranscript)
        
        // Envia automaticamente a mensagem
        console.log('📤 Enviando mensagem de voz...')
        handleSendMessage(finalTranscript)
        
        setIsVoiceListening(false)
      } else if (audioPlaying) {
        console.log('🔇 NOA está falando, ignorando detecção de voz para evitar eco')
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
      
      // Áudio sempre disponível - sem necessidade de liberação
      
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
      const cleanText = cleanTextForAudio(text)

      console.log('🎤 Chamando ElevenLabs com texto:', cleanText.substring(0, 100) + '...')
      const audioResponse = await elevenLabsService.textToSpeech(cleanText)
      console.log('✅ ElevenLabs respondeu:', audioResponse)
      
      // Se é Web Speech API (fallback), não precisa criar áudio
      if (audioResponse.content_type === 'audio/web-speech') {
        console.log('🎤 Áudio reproduzido via Web Speech API (fallback)')
        setAudioPlaying(true)
        
        // Para o reconhecimento de voz enquanto NOA fala
        if (isVoiceListening) {
          console.log('🔇 Pausando reconhecimento de voz enquanto NOA fala')
          setIsVoiceListening(false)
        }
        
        // Simular duração do áudio baseada no texto
        const estimatedDuration = Math.max(cleanText.length * 50, 2000) // ~50ms por caractere, mínimo 2s
        setTimeout(() => {
          console.log('🏁 Áudio Web Speech terminou de tocar')
          setAudioPlaying(false)
          autoActivateVoiceAfterResponse()
        }, estimatedDuration)
        
        return
      }
      
      // Cria e toca o áudio (apenas para ElevenLabs)
      const audioBlob = new Blob([audioResponse.audio], { type: 'audio/mpeg' })
      const audioUrl = URL.createObjectURL(audioBlob)
      const audio = new Audio(audioUrl)
      console.log('🔊 Áudio criado, tentando tocar...')
      
      // Armazena referência do áudio atual
      currentAudioRef.current = audio
      setAudioPlaying(true)
      
      // Para o reconhecimento de voz enquanto NOA fala
      if (isVoiceListening) {
        console.log('🔇 Pausando reconhecimento de voz enquanto NOA fala')
        setIsVoiceListening(false)
      }

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
    <div className="h-full overflow-hidden relative">
      {/* Background Matrix */}
      <MatrixBackground isActive={matrixActive} opacity={0.05} />
      
      {/* Layout Principal */}
      <div className="w-full h-full flex relative z-0">
        {/* Sidebar Esquerdo - Chat */}
        <div className="sidebar-mobile w-80 flex-shrink-0 bg-white/10 border-r border-white/20 p-4 fixed left-0 top-[7vh] h-[79.5vh] overflow-y-auto z-10">
          {/* Balão de Pensamento */}
          <div className="h-full flex flex-col">
            <div className="bg-white rounded-2xl px-3 pb-3 shadow-lg border border-white/20 flex-1 flex flex-col">

              {/* Área de Mensagens */}
              <div ref={messagesContainerRef} className="messages-container space-y-2 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
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
                      
                      {/* Chat limpo - sem comandos clicáveis */}
                      
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
                  aria-label="Campo de mensagem para conversar com NOA"
                />
                {/* Botões de controle */}
                <div className="flex gap-2 w-full sm:w-auto">
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
                    className={`flex-1 sm:flex-none px-4 py-2 rounded-lg transition-colors text-sm ${
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
                    className="flex-1 sm:flex-none bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors text-sm"
                    aria-label="Enviar mensagem para NOA"
                    title="Enviar mensagem"
                  >
                    <i className="fas fa-paper-plane"></i>
                  </button>
                </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Área Central - NOA e Pensamentos */}
        <div 
          className="flex-1 flex items-center justify-center relative min-h-screen md:ml-80 ml-0 w-full" 
          style={{ transform: 'translate(-10%, -95%)', pointerEvents: 'auto' }}
          onClick={(e) => {
            console.log('🎯 CLIQUE NO CONTAINER PRINCIPAL!', e.target);
          }}
        >
          {/* Avatar da NOA - Vídeos Animados */}
          <div className={`flex-shrink-0 flex justify-center items-center relative transition-all duration-500 ${
            isCardExpanded ? 'scale-75 translate-x-24' : 'scale-100 translate-x-0'
          }`}>
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
                ref={(video) => {
                  if (video) {
                    video.playbackRate = 0.8;
                  }
                }}
              >
                <source src="./AGENTEFALANDO.mp4?v=2" type="video/mp4" />
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
                title="Parar áudio"
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

          {/* Pensamentos Flutuantes - Só aparecem quando card NÃO está expandido */}
          <AnimatePresence>
            {!isCardExpanded && thoughts.map((thought, index) => (
                <ThoughtBubble
                  key={thought.id}
                  thought={thought}
                  index={index}
                  onClick={() => {
                    console.log('🎯 onClick chamado para:', thought.title)
                    handleThoughtClick(thought)
                  }}
                  onClose={() => {
                    console.log('🎯 onClose chamado para:', thought.id)
                    handleThoughtClose(thought.id)
                  }}
                />
            ))}
          </AnimatePresence>

          {/* Card Expandido */}
          <AnimatePresence>
            {isCardExpanded && expandedCard && (
              <motion.div
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -100, opacity: 0 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="fixed left-64 top-1/3 transform -translate-y-1/2 z-50 w-96 max-h-[80vh] overflow-y-auto"
                style={{ pointerEvents: 'auto' }}
              >
                <div className="premium-card w-full">
                  {/* Header do Card */}
                  <div className="flex justify-between items-center p-4 border-b border-white/20">
                    <div>
                      <h2 className="text-lg font-bold text-white mb-1">{expandedCard.title}</h2>
                      <p className="text-gray-300 text-sm">{expandedCard.description}</p>
                    </div>
                    <button
                      onClick={closeExpandedCard}
                      className="text-white hover:text-gray-300 text-xl transition-colors"
                    >
                      ×
                    </button>
                  </div>

                  {/* Conteúdo do Card */}
                  <div className="p-4">
                    <div className="bg-white/10 rounded-lg p-3 mb-3">
                      <p className="text-white text-sm leading-relaxed">{expandedCard.content}</p>
                    </div>
                    
                    {/* Área de interação */}
                    <div className="space-y-3">
                      <p className="text-gray-300 text-xs">
                        💬 Faça perguntas no chat
                      </p>
                      <div className="flex flex-col gap-2">
                        {/* Ação específica do card */}
                        {(() => {
                          const cardAction = getCardAction(expandedCard.type, expandedCard.title)
                          return (
                            <button
                              onClick={cardAction.action}
                              className={`px-3 py-2 ${cardAction.color} text-white rounded-lg transition-colors text-xs`}
                            >
                              {cardAction.label}
                            </button>
                          )
                        })()}
                        
                        {/* Botão de pergunta geral */}
                        <button
                          onClick={() => {
                            const question = `Me explique mais sobre ${expandedCard.title.toLowerCase()}`
                            setInputMessage(question)
                          }}
                          className="px-3 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors text-xs"
                        >
                          Perguntar sobre {expandedCard.title}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Chat Mobile - Entre NOA e rodapé */}
        <div className="block md:hidden w-full border-t border-white/20 bg-white/10 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl px-3 pb-3 shadow-lg border border-white/20 max-h-64 flex flex-col">
            {/* Área de Mensagens Mobile */}
            <div className="space-y-2 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 max-h-32">
              {messages.slice(-3).map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  data-testid={message.sender === 'user' ? 'user-message' : 'ai-message'}
                >
                  <div
                    className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                      message.sender === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-800'
                    }`}
                  >
                    {message.message}
                  </div>
                </div>
              ))}
            </div>

            {/* Input Mobile */}
            <div className="flex gap-2 mt-3 flex-col">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Digite sua mensagem..."
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black placeholder-gray-600 w-full"
                data-testid="chat-input"
              />
              <div className="flex gap-2 w-full">
                <button
                  onClick={() => handleSendMessage()}
                  disabled={isProcessing || !inputMessage.trim()}
                  className={`flex-1 px-4 py-2 rounded-lg transition-colors text-sm ${
                    isProcessing || !inputMessage.trim()
                      ? 'bg-gray-400 cursor-not-allowed text-white'
                      : 'bg-green-500 hover:bg-green-600 text-white'
                  }`}
                  data-testid="send-button"
                >
                  {isProcessing ? 'Enviando...' : 'Enviar'}
                </button>
                <button
                  onClick={() => setIsVoiceListening(!isVoiceListening)}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors text-sm"
                >
                  {isVoiceListening ? 'Parar' : 'Falar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
  )
}

export default Home

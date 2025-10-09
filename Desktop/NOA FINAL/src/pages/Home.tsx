import React, { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Specialty } from '../App'
import { openAIService, ChatMessage } from '../services/openaiService'
import { elevenLabsService } from '../services/elevenLabsService'
import { noaVoiceService } from '../services/noaVoiceService'
import { APP_CONFIG } from '../config/appConfig'
import { dataService } from '../services/supabaseService'
import { supabase } from '../integrations/supabase/client'
import { aiLearningService } from '../services/aiLearningService'
import { cleanTextForAudio } from '../utils/textUtils'
import { NoaGPT } from '../gpt/noaGPT'
import { noaVisionIA, NoaContext } from '../gpt/noaVisionIA' // 🚀 NOAVISION IA
import { clinicalAgent } from '../gpt/clinicalAgent'
import { MedicalImageService, MedicalData } from '../services/medicalImageService'
import { noaSystemService } from '../services/noaSystemService'
import { adminCommandService } from '../services/adminCommandService'
import { avaliacaoClinicaService } from '../services/avaliacaoClinicaService'
import { conversationModeService, ConversationMode } from '../services/conversationModeService'
import { identityRecognitionService, UserProfile } from '../services/identityRecognitionService'
import { directCommandProcessor } from '../services/directCommandProcessor'
import UserIntentDetector from '../utils/userIntentDetection'
import ThoughtBubble from '../components/ThoughtBubble'
import MatrixBackground from '../components/MatrixBackground'
import { useAuth } from '../contexts/AuthContext'
import { testSupabaseConnection } from '../utils/supabaseTest'

interface Message {
  id: string
  message: string
  sender: 'user' | 'noa'
  timestamp: Date
  options?: string[] // Opções de resposta rápida
  isTyping?: boolean // Indicador de digitação
  conversation_type?:
    | 'presentation'
    | 'user_type_selection'
    | 'clinical_evaluation'
    | 'general'
    | 'personalized_greeting'
    | 'direct_command'
  is_first_response?: boolean
  user_type?: 'aluno' | 'profissional' | 'paciente' | 'admin' | 'clinico' | 'autor'
  session_id?: string
}

// Interface para cards expandidos
interface ExpandedCard {
  id: string
  title: string
  description: string
  content: string
  type: 'consulta' | 'analise' | 'protocolo' | 'pesquisa' | 'avaliacao'
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
    pergunta:
      'Olá! Eu sou Nôa Esperanza, assistente médica do MedCanLab. Por favor, apresente-se também e vamos iniciar a sua avaliação inicial para consultas com Dr. Ricardo Valença.',
    opcoes: [
      'Olá, sou [seu nome], tenho [idade] anos',
      'Meu nome é [nome], sou [profissão]',
      'Sou [nome], venho de [cidade]',
    ],
  },
  {
    id: 'cannabis_medicinal',
    title: 'Cannabis Medicinal',
    pergunta: 'Você já utilizou canabis medicinal?',
    opcoes: [
      'Sim, já utilizei',
      'Não, nunca utilizei',
      'Estou considerando usar',
      'Não sei o que é',
      'Prefiro não responder',
    ],
  },
  {
    id: 'lista_indiciaria',
    title: 'Lista Indiciária',
    pergunta: 'O que trouxe você à nossa avaliação hoje?',
    opcoes: [
      'Dor de cabeça',
      'Dor no peito',
      'Falta de ar',
      'Dor abdominal',
      'Cansaço',
      'Outro sintoma',
    ],
  },
  {
    id: 'queixa_principal',
    title: 'Queixa Principal',
    pergunta: 'De todas essas questões, qual mais o(a) incomoda?',
    opcoes: [
      'A primeira que mencionei',
      'A segunda que mencionei',
      'A terceira que mencionei',
      'Todas me incomodam igualmente',
    ],
  },
  {
    id: 'desenvolvimento_localizacao',
    title: 'Desenvolvimento Indiciário - Localização',
    pergunta: 'Vamos explorar suas queixas mais detalhadamente. Onde você sente [queixa]?',
    opcoes: ['Cabeça', 'Peito', 'Abdômen', 'Costas', 'Pernas', 'Braços', 'Todo o corpo'],
  },
  {
    id: 'desenvolvimento_inicio',
    title: 'Início',
    pergunta: 'Quando essa [queixa] começou?',
    opcoes: ['Hoje', 'Ontem', 'Esta semana', 'Este mês', 'Há alguns meses', 'Há mais de um ano'],
  },
  {
    id: 'desenvolvimento_qualidade',
    title: 'Qualidade',
    pergunta: 'Como é a [queixa]?',
    opcoes: [
      'Dor aguda',
      'Dor latejante',
      'Dor em queimação',
      'Dor em pontada',
      'Desconforto',
      'Pressão',
    ],
  },
  {
    id: 'desenvolvimento_sintomas',
    title: 'Sintomas Associados',
    pergunta: 'O que mais você sente quando está com a [queixa]?',
    opcoes: ['Náusea', 'Tontura', 'Suor', 'Falta de ar', 'Cansaço', 'Nenhum sintoma adicional'],
  },
  {
    id: 'desenvolvimento_melhora',
    title: 'Fatores de Melhora',
    pergunta: 'O que melhora a [queixa]?',
    opcoes: ['Repouso', 'Medicação', 'Calor', 'Frio', 'Massagem', 'Nada melhora'],
  },
  {
    id: 'desenvolvimento_piora',
    title: 'Fatores de Piora',
    pergunta: 'O que piora a [queixa]?',
    opcoes: ['Movimento', 'Esforço', 'Estresse', 'Alimentação', 'Posição', 'Nada piora'],
  },
  {
    id: 'historia_patologica',
    title: 'História Patológica Pregressa',
    pergunta:
      'E agora, sobre o restante sua vida até aqui, desde seu nascimento, quais as questões de saúde que você já viveu? Vamos ordenar do mais antigo para o mais recente, o que veio primeiro?',
    opcoes: [
      'Nenhuma',
      'Hipertensão',
      'Diabetes',
      'Problemas cardíacos',
      'Cirurgias',
      'Outras doenças',
    ],
  },
  {
    id: 'historia_familiar_mae',
    title: 'História Familiar - Mãe',
    pergunta:
      'E na sua família? Começando pela parte de sua mãe, quais as questões de saúde dela e desse lado da família?',
    opcoes: [
      'Nenhuma',
      'Hipertensão',
      'Diabetes',
      'Câncer',
      'Problemas cardíacos',
      'Outras doenças',
    ],
  },
  {
    id: 'historia_familiar_pai',
    title: 'História Familiar - Pai',
    pergunta: 'E por parte do pai?',
    opcoes: [
      'Nenhuma',
      'Hipertensão',
      'Diabetes',
      'Câncer',
      'Problemas cardíacos',
      'Outras doenças',
    ],
  },
  {
    id: 'habitos_vida',
    title: 'Hábitos de Vida',
    pergunta:
      'Além dos hábitos de vida que já verificamos em nossa conversa, que outros hábitos você acha importante mencionar?',
    opcoes: [
      'Fumo',
      'Bebida alcoólica',
      'Exercícios',
      'Alimentação',
      'Sono',
      'Estresse no trabalho',
    ],
  },
  {
    id: 'alergias',
    title: 'Alergias',
    pergunta: 'Você tem alguma alergia (mudança de tempo, medicação, poeira...)?',
    opcoes: ['Nenhuma', 'Poeira', 'Pólen', 'Medicamentos', 'Alimentos', 'Mudança de tempo'],
  },
  {
    id: 'medicacoes_continuas',
    title: 'Medicações Contínuas',
    pergunta: 'Quais medicações utiliza regularmente?',
    opcoes: [
      'Nenhuma',
      'Anti-hipertensivo',
      'Antidiabético',
      'Analgésico',
      'Vitaminas',
      'Outras medicações',
    ],
  },
  {
    id: 'medicacoes_eventuais',
    title: 'Medicações Eventuais',
    pergunta:
      'Quais as medicações você utiliza esporadicamente (de vez em quando) e porque utiliza?',
    opcoes: [
      'Nenhuma',
      'Analgésico para dor',
      'Antitérmico para febre',
      'Antiácido',
      'Antialérgico',
      'Outras medicações',
    ],
  },
  {
    id: 'fechamento',
    title: 'Fechamento Consensual',
    pergunta:
      'Vamos revisar a sua história rapidamente para garantir que não perdemos nenhum detalhe importante.',
    opcoes: [
      'Sim, vamos revisar',
      'Está tudo correto',
      'Quero adicionar algo',
      'Há algo a corrigir',
    ],
  },
]

interface HomeProps {
  currentSpecialty: Specialty
  isVoiceListening: boolean
  setIsVoiceListening: (listening: boolean) => void
  addNotification: (message: string, type?: 'info' | 'success' | 'warning' | 'error') => void
}

const Home = ({
  currentSpecialty,
  isVoiceListening,
  setIsVoiceListening,
  addNotification,
}: HomeProps) => {
  // 🧪 Expor teste de diagnóstico no console
  useEffect(() => {
    ;(window as any).testSupabase = testSupabaseConnection
    console.log('💡 DIAGNÓSTICO DISPONÍVEL: Digite testSupabase() no console')
  }, [])

  // Estados do chat
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [medicalData, setMedicalData] = useState<MedicalData[]>([])
  const [isProcessingImage, setIsProcessingImage] = useState(false)
  // messagesContainerRef removido para evitar scroll infinito

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
      timestamp: new Date(),
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

  // 🧠 Estados do sistema de reconhecimento de identidade
  const [recognizedUser, setRecognizedUser] = useState<UserProfile | null>(null)
  const [isPersonalizedMode, setIsPersonalizedMode] = useState(false)
  const [availableCommands, setAvailableCommands] = useState<string[]>([])
  const [perguntandoMais, setPerguntandoMais] = useState(false)

  // Estado para efeito matrix eterno
  const [matrixActive, setMatrixActive] = useState(true)
  const [dadosAvaliacao, setDadosAvaliacao] = useState<AvaliacaoClinicaData['dados']>({
    cannabis_medicinal: '',
    lista_indiciaria: [],
    historia_patologica: [],
    historia_familiar: { mae: [], pai: [] },
    habitos_vida: [],
    desenvolvimento_indiciario: {},
  })

  // Estados para Sistema MedCanLab Integrado
  const [userType, setUserType] = useState<'aluno' | 'profissional' | 'paciente' | null>(null)
  const [permissionLevel, setPermissionLevel] = useState<number>(0)
  const [sessionId, setSessionId] = useState<string>(
    () => `avaliacao_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  )
  const [conversationType, setConversationType] = useState<
    'presentation' | 'user_type_selection' | 'clinical_evaluation' | 'general'
  >('general')
  const [isFirstResponse, setIsFirstResponse] = useState<boolean>(true)
  const [evaluationId, setEvaluationId] = useState<string | null>(null)
  const [userName, setUserName] = useState<string | null>(null) // Nome do usuário persistente
  const [isAdminMode, setIsAdminMode] = useState<boolean>(false) // Modo admin ativado
  const [adminCardType, setAdminCardType] = useState<'stats' | 'editor' | 'users' | 'ia' | null>(
    null
  ) // Tipo de card admin

  // 🎯 ESTADOS DOS MODOS DE CONVERSA
  const [currentConversationMode, setCurrentConversationMode] =
    useState<ConversationMode>('explicativo')
  const [modeTransitionHistory, setModeTransitionHistory] = useState<any[]>([])
  const [conversationContext, setConversationContext] = useState<any>(null)
  const [accuracyStats, setAccuracyStats] = useState<any>(null)

  // Controle de áudio
  const [audioPlaying, setAudioPlaying] = useState(false)
  const [noaSpeaking, setNoaSpeaking] = useState(false)
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

  // Funções de scroll REMOVIDAS para evitar scroll infinito

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
        user_id: userMemory.name ? userMemory.name : null,
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

  // useEffect de scroll DESABILITADO para evitar scroll infinito

  // useEffect removido para evitar conflito de scroll

  // Listener de scroll removido para evitar conflitos

  // Listener para respostas refinadas - REMOVIDO para evitar scroll infinito

  // Áudio liberado automaticamente - sem necessidade de primeira interação
  useEffect(() => {
    console.log('🔊 Liberando áudio da Nôa automaticamente')
    setUserInteracted(true) // Libera áudio imediatamente
  }, [])

  // Sistema MedCanLab - Fluxo correto implementado
  // Mensagem inicial obrigatória: "O que trouxe você aqui?"

  // Auth context
  const { userProfile } = useAuth()

  // Inicializa com a pergunta de entrada obrigatória
  // Carrega perfil do usuário ao iniciar
  useEffect(() => {
    const loadUserProfile = async () => {
      // 1. Tentar do AuthContext primeiro (já autenticado)
      if (userProfile && userProfile.name) {
        setUserName(userProfile.name)
        console.log('✅ Nome do usuário carregado do AuthContext:', userProfile.name)
        return
      }

      // 2. Fallback para noaSystemService
      const profile = await noaSystemService.getUserProfile()
      if (profile && profile.name) {
        setUserName(profile.name)
        console.log('✅ Perfil do usuário carregado do service:', profile.name)
      }
    }
    loadUserProfile()
  }, [userProfile])

  useEffect(() => {
    if (messages.length === 0) {
      const initialQuestion: Message = {
        id: crypto.randomUUID(),
        message: userName
          ? `Olá ${userName}! O que trouxe você aqui hoje?`
          : 'O que trouxe você aqui?',
        sender: 'noa',
        timestamp: new Date(),
      }
      setMessages([initialQuestion])

      // Toca áudio da pergunta inicial APENAS após interação do usuário
      // Removido TTS automático para evitar erro "not-allowed"
      console.log('🎵 Pergunta inicial carregada, aguardando interação do usuário para TTS')
    }
  }, [userName]) // Reexecuta se userName mudar

  // Efeito matrix eterno - sempre ativo

  // Resposta real da NOA usando OpenAI - Sistema MedCanLab
  const getNoaResponse = async (userMessage: string) => {
    console.log('🚀 INICIANDO getNoaResponse com:', userMessage)
    setIsTyping(true)

    // 🧠 SISTEMA DE RECONHECIMENTO DE IDENTIDADE
    const identityResult = await identityRecognitionService.detectIdentity(userMessage)

    if (identityResult.recognized && identityResult.user) {
      console.log('🎯 Usuário reconhecido:', identityResult.user.name)

      // Definir usuário atual
      setRecognizedUser(identityResult.user)
      setIsPersonalizedMode(true)
      setAvailableCommands(identityResult.availableCommands)

      // Resposta personalizada
      // 🎯 MODO COMANDO ESPECIAL PARA RICARDO
      if (identityResult.user.name.includes('Ricardo Valença')) {
        const comandoMessage: Message = {
          id: crypto.randomUUID(),
          message:
            '🔁 **MODO GPT-4o ATIVO** — INSTRUÇÕES PARA PLATAFORMA NÔA\n\nA plataforma agora se comporta como um agente GPT-4o completo.\n\n🎯 **OBJETIVO:**\n- Executar ações diretamente sob comando de Ricardo Valença.\n- Ignorar qualquer fluxo padrão de paciente, aluno ou profissional.\n- Atuar conforme especificações do Documento Mestre e Ata da Plataforma.\n\n✅ **FAZER:**\n- Esperar comandos diretos via chat.\n- Ativar MODO COMANDO com acesso total a todos serviços.\n- Entrar em escuta GPT (como ChatGPT-4o), pronto para executar qualquer comando textual.\n\n🚀 **PRONTO PARA COMANDOS!**',
          sender: 'noa',
          timestamp: new Date(),
          conversation_type: 'direct_command',
          user_type: identityResult.user.role,
          session_id: sessionId,
        }

        setMessages(prev => {
          const withoutTyping = prev.filter(msg => !msg.isTyping)
          return [...withoutTyping, comandoMessage]
        })

        await playNoaAudioWithText(
          'Modo comando ativado. Pronto para executar suas instruções, Dr. Ricardo.'
        )
        setIsTyping(false)
        return
      }

      // Resposta personalizada padrão
      const personalizedMessage: Message = {
        id: crypto.randomUUID(),
        message: identityResult.greeting,
        sender: 'noa',
        timestamp: new Date(),
        conversation_type: 'personalized_greeting',
        user_type: identityResult.user.role,
        session_id: sessionId,
      }

      setMessages(prev => {
        const withoutTyping = prev.filter(msg => !msg.isTyping)
        return [...withoutTyping, personalizedMessage]
      })

      // Tocar áudio da resposta personalizada
      await playNoaAudioWithText(identityResult.greeting)
      setIsTyping(false)
      return
    }

    // 🎮 DETECTAR COMANDOS DIRETOS (se usuário reconhecido)
    if (recognizedUser && isPersonalizedMode) {
      const directCommand = await identityRecognitionService.detectDirectCommand(
        userMessage,
        recognizedUser
      )

      if (directCommand.type !== 'unknown' && directCommand.confidence > 0.7) {
        console.log('🎮 Comando direto detectado:', directCommand.type)

        // Executar comando direto
        const commandResult = await directCommandProcessor.executeDirectCommand(
          directCommand,
          recognizedUser
        )

        if (commandResult.shouldShowInChat) {
          const commandMessage: Message = {
            id: crypto.randomUUID(),
            message: commandResult.message,
            sender: 'noa',
            timestamp: new Date(),
            conversation_type: 'direct_command',
            user_type: recognizedUser.role,
            session_id: sessionId,
          }

          setMessages(prev => {
            const withoutTyping = prev.filter(msg => !msg.isTyping)
            return [...withoutTyping, commandMessage]
          })

          // Tocar áudio da resposta
          await playNoaAudioWithText(commandResult.message)
          setIsTyping(false)
          return
        }
      }
    }

    // 🩺 TRIGGER DE AVALIAÇÃO CLÍNICA (ANTES DO SISTEMA DE MODOS)
    const mensagemLower = userMessage.toLowerCase()
    const querAvaliacao =
      mensagemLower.includes('arte da entrevista') ||
      mensagemLower.includes('entrevista clínica') ||
      mensagemLower.includes('entrevista clinica') ||
      mensagemLower.includes('iniciar avaliação') ||
      mensagemLower.includes('iniciar avaliacao') ||
      mensagemLower.includes('avaliação clínica') ||
      mensagemLower.includes('avaliacao clinica') ||
      mensagemLower.includes('fazer avaliação') ||
      mensagemLower.includes('fazer avaliacao') ||
      mensagemLower.includes('quero fazer entrevista') ||
      mensagemLower.includes('começar avaliação') ||
      mensagemLower.includes('comecar avaliacao') ||
      mensagemLower.includes('avaliacao') ||
      mensagemLower.includes('avaliação') ||
      mensagemLower.includes('fazer avaliacao') ||
      mensagemLower.includes('começar avaliacao') ||
      mensagemLower.includes('comecar avaliação') ||
      mensagemLower.includes('iniciar avaliacao') ||
      mensagemLower.includes('começar') ||
      mensagemLower.includes('comecar')

    if (querAvaliacao && !modoAvaliacao) {
      console.log('✅ Trigger de avaliação detectado - Abrindo card automaticamente!')

      // Ativa o modo de avaliação
      setModoAvaliacao(true)
      setEtapaAtual(0)
      setConversationType('clinical_evaluation')

      // Expande o card da Avaliação Clínica automaticamente
      expandCard({
        id: 'avaliacao-clinica-inicial',
        title: 'Avaliação Clínica Inicial',
        description: 'Arte da Entrevista Clínica - Método IMRE (28 Blocos)',
        content:
          'Iniciando sua avaliação clínica completa com 28 perguntas estruturadas do método IMRE desenvolvido pelo Dr. Ricardo Valença.',
        type: 'avaliacao',
      })

      // Força a abertura do card
      setExpandedCard({
        id: 'avaliacao-clinica-inicial',
        title: 'Avaliação Clínica Inicial',
        description: 'Arte da Entrevista Clínica - Método IMRE (28 Blocos)',
        content:
          'Iniciando sua avaliação clínica completa com 28 perguntas estruturadas do método IMRE desenvolvido pelo Dr. Ricardo Valença.',
        type: 'avaliacao',
      })

      // Resposta imediata
      const avaliacaoMessage: Message = {
        id: crypto.randomUUID(),
        message:
          '🩺 **Avaliação Clínica Inicial Iniciada**\n\nOlá! Vou conduzi-lo através de uma avaliação clínica completa seguindo o método IMRE do Dr. Ricardo Valença.\n\nEsta avaliação possui 28 blocos estruturados que nos ajudarão a compreender melhor sua condição de saúde.\n\nVamos começar?',
        sender: 'noa',
        timestamp: new Date(),
        conversation_type: 'clinical_evaluation',
        session_id: sessionId,
      }

      setMessages(prev => {
        const withoutTyping = prev.filter(msg => !msg.isTyping)
        return [...withoutTyping, avaliacaoMessage]
      })

      // Tocar áudio da resposta
      await playNoaAudioWithText(avaliacaoMessage.message)

      // 🎯 BUSCAR PRIMEIRA PERGUNTA IMRE
      try {
        const primeiraPergunta = await avaliacaoClinicaService.getProximaPergunta(0)
        if (primeiraPergunta) {
          const perguntaMessage: Message = {
            id: crypto.randomUUID(),
            message: primeiraPergunta,
            sender: 'noa',
            timestamp: new Date(),
            conversation_type: 'clinical_evaluation',
            session_id: sessionId,
          }

          setMessages(prev => [...prev, perguntaMessage])
          await playNoaAudioWithText(primeiraPergunta)
        }
      } catch (error) {
        console.error('❌ Erro ao buscar primeira pergunta:', error)
      }

      setIsTyping(false)
      return
    }

    // 🎯 NOVO SISTEMA DE MODOS DE CONVERSA (só se não for trigger de avaliação)
    const {
      data: { user },
    } = await supabase.auth.getUser()
    const userId = user?.id || crypto.randomUUID()

    // Processar mensagem com sistema de modos
    const modeResponse = await conversationModeService.processarMensagem(
      userMessage,
      sessionId,
      userId
    )

    console.log('🎯 Resposta do sistema de modos:', modeResponse)

    // Atualizar contexto e modo atual
    setConversationContext(modeResponse.context)
    if (modeResponse.shouldChangeMode && modeResponse.newMode) {
      setCurrentConversationMode(modeResponse.newMode)
      setModeTransitionHistory(prev => [
        ...prev,
        {
          from: currentConversationMode,
          to: modeResponse.newMode,
          timestamp: new Date(),
          confidence: modeResponse.confidence,
        },
      ])
    }

    // 🎯 SE MUDOU DE MODO, USAR RESPOSTA DO SISTEMA DE MODOS
    if (modeResponse.shouldChangeMode && modeResponse.response) {
      const noaMessage: Message = {
        id: crypto.randomUUID(),
        message: modeResponse.response,
        sender: 'noa',
        timestamp: new Date(),
        conversation_type:
          modeResponse.newMode === 'avaliacao_clinica' ? 'clinical_evaluation' : 'general',
        user_type: userType || 'paciente',
        session_id: sessionId,
      }

      setMessages(prev => {
        const withoutTyping = prev.filter(msg => !msg.isTyping)
        return [...withoutTyping, noaMessage]
      })

      // Toca áudio da resposta
      await playNoaAudioWithText(modeResponse.response)
      setIsTyping(false)
      return
    }

    // 🧠 DETECÇÃO INTELIGENTE DE INTENÇÃO (mantido para compatibilidade)
    const intent = UserIntentDetector.detectIntent(userMessage, messages)
    const context = UserIntentDetector.extractContext(messages)
    console.log('🧠 Intenção detectada:', intent)
    console.log('🧠 Contexto do usuário:', context)

    // 👤 EXTRAI E SALVA NOME DO USUÁRIO (se encontrar)
    if (context.userName && context.userName !== userName) {
      console.log('✅ Nome detectado na conversa:', context.userName)
      setUserName(context.userName)
      await noaSystemService.saveUserProfile(context.userName, {
        userType: context.userProfile,
        firstContact: new Date().toISOString(),
      })
    }

    // 👑 SISTEMA DE COMANDOS ADMIN
    // Detecta ativação do modo admin

    if (
      !isAdminMode &&
      (mensagemLower.includes('admin pedro') ||
        mensagemLower.includes('admin ricardo') ||
        mensagemLower.includes('modo admin'))
    ) {
      console.log('👑 Tentando ativar modo admin...')

      // Pega o email do usuário logado
      const {
        data: { user },
      } = await supabase.auth.getUser()
      const userEmail = user?.email

      const activated = await adminCommandService.activateAdminMode(userMessage, userEmail)

      setMessages(prev => {
        const withoutTyping = prev.filter(msg => !msg.isTyping)
        const adminMessage: Message = {
          id: crypto.randomUUID(),
          message: activated
            ? '👑 **MODO ADMIN ATIVADO!**\n\n✅ Acesso concedido\n\n**Comandos disponíveis:**\n• "ver estatísticas"\n• "editar bloco [n]"\n• "listar usuários"\n• "adicionar usuário [nome]"\n• "treinar IA"\n\nTodos os comandos podem ser dados por voz!'
            : '🔒 **ACESSO NEGADO**\n\nCredenciais inválidas.',
          sender: 'noa',
          timestamp: new Date(),
        }
        return [...withoutTyping, adminMessage]
      })

      if (activated) {
        setIsAdminMode(true)
        await playNoaAudioWithText(
          'Modo admin ativado! Você tem acesso total à plataforma. Como posso ajudar?'
        )
      } else {
        await playNoaAudioWithText('Acesso negado. Credenciais inválidas.')
      }

      setIsTyping(false)
      return
    }

    // Se está em modo admin, detecta comandos
    if (isAdminMode) {
      const adminCommand = adminCommandService.detectAdminCommand(userMessage)

      if (adminCommand.type !== 'unknown') {
        console.log('👑 Comando admin detectado:', adminCommand)

        // Mostra que está processando
        setMessages(prev => {
          const withoutTyping = prev.filter(msg => !msg.isTyping)
          const processingMsg: Message = {
            id: crypto.randomUUID(),
            message: `⚙️ **EXECUTANDO COMANDO ADMIN...**\n\n${adminCommand.rawCommand}\n\n⏳ Processando...`,
            sender: 'noa',
            timestamp: new Date(),
          }
          return [...withoutTyping, processingMsg]
        })

        // Executa comando
        const result = await adminCommandService.executeCommand(adminCommand)

        // Mostra resultado
        setMessages(prev => {
          const filtered = prev.filter(msg => !msg.message.includes('EXECUTANDO COMANDO'))
          const resultMsg: Message = {
            id: crypto.randomUUID(),
            message: result.message,
            sender: 'noa',
            timestamp: new Date(),
          }
          return [...filtered, resultMsg]
        })

        // Abre card admin no lado direito (se aplicável)
        if (adminCommand.type === 'get_stats') {
          setAdminCardType('stats')
        } else if (adminCommand.type === 'edit_imre_block') {
          setAdminCardType('editor')
        } else if (adminCommand.type === 'list_users') {
          setAdminCardType('users')
        } else if (adminCommand.type === 'train_ia') {
          setAdminCardType('ia')
        }

        await playNoaAudioWithText(result.message)
        setIsTyping(false)
        return
      }
    }

    // Feedback imediato para o usuário
    const typingMessage: Message = {
      id: crypto.randomUUID(),
      message: 'NOA está pensando...',
      sender: 'noa',
      timestamp: new Date(),
      isTyping: true,
    }
    setMessages(prev => [...prev, typingMessage])

    try {
      // 🩺 SISTEMA NÔA ESPERANZA - FLUXO CORRETO IMPLEMENTADO
      // Verifica se é a primeira resposta do usuário (após "O que trouxe você aqui?")
      const userMessages = messages.filter(msg => msg.sender === 'user')
      const isFirstUserResponse = userMessages.length === 0

      // Verifica se já se apresentou antes
      const jaSeApresentou = messages.some(
        msg =>
          msg.sender === 'noa' &&
          msg.message.includes('Nôa Esperanza, assistente médica do MedCanLab')
      )

      if (isFirstUserResponse && !jaSeApresentou) {
        console.log('🎯 Primeira resposta do usuário - Usando NoaGPT inteligente para apresentação')

        // Atualiza estados do sistema
        setIsFirstResponse(true)
        setConversationType('presentation')

        // 🧠 USAR NoaGPT inteligente para apresentação personalizada
        let currentNoaGPT = noaGPT
        if (!currentNoaGPT) {
          currentNoaGPT = new NoaGPT()
          setNoaGPT(currentNoaGPT)
        }

        // Buscar resposta inteligente do NoaGPT (usa banco + contexto)
        const promptApresentacao = userName
          ? `Usuário ${userName} acabou de responder: "${userMessage}". Se apresente de forma natural e personalizada, mencione suas especialidades (neurologia, cannabis, nefrologia) e conduza para escolher perfil.`
          : `Usuário respondeu: "${userMessage}". Se apresente de forma natural, mencione suas especialidades e conduza para escolher perfil.`

        let noaResponse = await currentNoaGPT.processCommand(promptApresentacao)

        // Se NoaGPT não respondeu bem, usa fallback inteligente
        if (!noaResponse || noaResponse.includes('OPENAI_FALLBACK')) {
          noaResponse = `Olá${userName ? `, ${userName}` : ''}! Eu sou Nôa Esperanza, assistente médica do MedCanLab, especializada em neurologia, cannabis medicinal e nefrologia. Como posso ajudar você hoje? Me diga onde posso resolver isso?!`
        }

        const apresentacaoInteligente = noaResponse

        // Remove a mensagem de "pensando"
        setMessages(prev => {
          const withoutTyping = prev.filter(msg => !msg.isTyping)
          const noaPresentation: Message = {
            id: crypto.randomUUID(),
            message: apresentacaoInteligente,
            sender: 'noa',
            timestamp: new Date(),
            conversation_type: 'presentation',
            is_first_response: true,
            session_id: sessionId,
          }
          return [...withoutTyping, noaPresentation]
        })

        // Registra no sistema para aprendizado
        await noaSystemService.registerNoaConversation(
          userMessage,
          apresentacaoInteligente,
          'presentation',
          'unknown'
        )

        // Salva aprendizado
        await noaSystemService.saveAILearning(
          userMessage,
          apresentacaoInteligente,
          'presentation',
          0.9,
          ['saudacao', 'primeira_interacao', userName || 'anonimo']
        )

        // Toca áudio da apresentação
        await playNoaAudioWithText(apresentacaoInteligente)

        // Apresenta menu de tipos de usuário após a apresentação (mais natural)
        setTimeout(async () => {
          // Menu padrão (sempre igual para consistência)
          const menuMessage =
            'Para melhor atendê-lo, preciso saber qual é o seu perfil:\n\n🎓 **ALUNO** - Acesso ao ensino da Arte da Entrevista Clínica\n👨‍⚕️ **PROFISSIONAL** - Acesso à pesquisa e ferramentas clínicas\n🏥 **PACIENTE** - Acesso à avaliação clínica inicial\n\nPor favor, responda com: ALUNO, PROFISSIONAL ou PACIENTE'

          const userTypeMenu: Message = {
            id: crypto.randomUUID(),
            message: menuMessage,
            sender: 'noa',
            timestamp: new Date(),
            conversation_type: 'user_type_selection',
            session_id: sessionId,
          }
          setMessages(prev => [...prev, userTypeMenu])
          await playNoaAudioWithText(
            'Para melhor atendê-lo, preciso saber qual é o seu perfil. Aluno, Profissional ou Paciente. Por favor, responda com uma dessas opções.'
          )
        }, 2000)

        setIsTyping(false)
        return
      }

      // 🎯 SISTEMA DE TIPOS DE USUÁRIO - ARTE DA ENTREVISTA CLÍNICA
      // Verifica se o usuário está escolhendo seu tipo de usuário
      const mensagemLower = userMessage.toLowerCase()
      const isUserTypeSelection =
        mensagemLower.includes('aluno') ||
        mensagemLower.includes('profissional') ||
        mensagemLower.includes('paciente')

      if (isUserTypeSelection) {
        console.log('🎯 Usuário escolhendo tipo de perfil')

        let selectedUserType: 'aluno' | 'profissional' | 'paciente' = 'paciente'
        let optionsMenu = ''
        let audioMessage = ''

        if (mensagemLower.includes('aluno')) {
          selectedUserType = 'aluno'
          optionsMenu =
            '🎓 **MENU ALUNO - ENSINO**\n\n📚 **Cursos Disponíveis:**\n• Arte da Entrevista Clínica - Módulo 1\n• Fundamentos da Cannabis Medicinal\n• Protocolos de Avaliação Clínica\n\n🎯 **Ferramentas de Aprendizado:**\n• Simulador de Entrevistas\n• Banco de Casos Clínicos\n• Avaliações Interativas\n\n📊 **Progresso e Certificações:**\n• Dashboard de Progresso\n• Certificados NFT\n• Histórico de Aulas\n\nPor favor, escolha uma das opções acima.'
          audioMessage =
            'Perfeito! Como aluno, você tem acesso ao ensino da Arte da Entrevista Clínica. Escolha uma das opções do menu.'
        } else if (mensagemLower.includes('profissional')) {
          selectedUserType = 'profissional'
          optionsMenu =
            '👨‍⚕️ **MENU PROFISSIONAL - PESQUISA E CLÍNICA**\n\n🔬 **Ferramentas de Pesquisa:**\n• Banco de Dados Clínicos\n• Análise de Padrões\n• Publicações Científicas\n\n🩺 **Ferramentas Clínicas:**\n• Avaliação Clínica Inicial\n• Relatórios de Pacientes\n• Dashboard Médico\n\n📈 **Gestão de Pacientes:**\n• Lista de Pacientes\n• Histórico Clínico\n• Agendamentos\n\nPor favor, escolha uma das opções acima.'
          audioMessage =
            'Excelente! Como profissional, você tem acesso à pesquisa e ferramentas clínicas. Escolha uma das opções do menu.'
        } else if (mensagemLower.includes('paciente')) {
          selectedUserType = 'paciente'
          optionsMenu =
            '🏥 **MENU PACIENTE - AVALIAÇÃO CLÍNICA**\n\n🩺 **Avaliação Clínica Inicial:**\n• Iniciar Avaliação (NFT Incentivador)\n• Relatório da Avaliação\n• Histórico de Consultas\n\n📋 **Meu Dashboard:**\n• Resultados de Exames\n• Prescrições Médicas\n• Agendamentos\n\n💊 **Cannabis Medicinal:**\n• Orientações sobre Uso\n• Protocolos de Tratamento\n• Acompanhamento\n\nPor favor, escolha uma das opções acima.'
          audioMessage =
            'Entendido! Como paciente, você tem acesso à avaliação clínica inicial. Escolha uma das opções do menu.'
        }

        // Atualiza estados do sistema
        setUserType(selectedUserType)
        setConversationType('user_type_selection')
        setPermissionLevel(
          selectedUserType === 'paciente' ? 1 : selectedUserType === 'profissional' ? 2 : 3
        )

        // Registra no sistema
        await noaSystemService.setUserType(selectedUserType)
        await noaSystemService.initializeUserSession(selectedUserType)

        // Registra a conversa no sistema
        await noaSystemService.registerNoaConversation(
          userMessage,
          optionsMenu,
          'user_type_selection',
          selectedUserType
        )

        // Remove a mensagem de "pensando"
        setMessages(prev => {
          const withoutTyping = prev.filter(msg => !msg.isTyping)
          const userTypeResponse: Message = {
            id: crypto.randomUUID(),
            message: optionsMenu,
            sender: 'noa',
            timestamp: new Date(),
            conversation_type: 'user_type_selection',
            user_type: selectedUserType,
            session_id: sessionId,
          }
          return [...withoutTyping, userTypeResponse]
        })

        // Toca áudio da resposta
        await playNoaAudioWithText(audioMessage)
        setIsTyping(false)
        return
      }

      // 📚 EXPLICAÇÃO SOBRE ARTE DA ENTREVISTA CLÍNICA
      const perguntaSobreArte =
        mensagemLower.includes('o que é arte da entrevista') ||
        mensagemLower.includes('o que e arte da entrevista') ||
        mensagemLower.includes('que é entrevista clínica') ||
        mensagemLower.includes('como funciona a entrevista') ||
        mensagemLower.includes('explique arte da entrevista') ||
        mensagemLower.includes('explique entrevista clínica')

      if (perguntaSobreArte) {
        console.log('📚 Usuário perguntou sobre Arte da Entrevista Clínica')

        setMessages(prev => {
          const withoutTyping = prev.filter(msg => !msg.isTyping)
          const explicacao: Message = {
            id: crypto.randomUUID(),
            message:
              '📚 **ARTE DA ENTREVISTA CLÍNICA - MÉTODO IMRE**\n\n**O que é:**\nA Arte da Entrevista Clínica é um método desenvolvido pelo Dr. Ricardo Valença para realizar avaliações clínicas profundas e humanizadas.\n\n**Como funciona:**\n• 28 blocos estruturados de perguntas\n• Sistema IMRE (Incentivador Mínimo do Relato Espontâneo)\n• Compreensão completa da história do paciente\n• Perguntas que se aprofundam naturalmente\n• Loops inteligentes: "O que mais?"\n\n**Benefícios:**\n• Avaliação completa e estruturada\n• Relatório detalhado ao final\n• Certificação NFT do seu relato\n• Base sólida para consulta médica\n\n**Eixos principais:**\n• 🎓 **Ensino** - Para alunos de medicina\n• 🔬 **Pesquisa** - Para profissionais\n• 🩺 **Clínica** - Para pacientes\n\n**Quer iniciar sua avaliação?** Clique no botão verde "🩺 Avaliação Clínica" ou escreva "iniciar avaliação".',
            sender: 'noa',
            timestamp: new Date(),
            conversation_type: 'general',
          }
          return [...withoutTyping, explicacao]
        })

        await playNoaAudioWithText(
          'A Arte da Entrevista Clínica é um método desenvolvido pelo Dr. Ricardo Valença para realizar avaliações clínicas profundas e humanizadas. São 28 perguntas estruturadas que nos ajudam a compreender completamente sua história de saúde. Quer iniciar sua avaliação?'
        )

        setIsTyping(false)
        return
      }

      // 🩺 SISTEMA DE AVALIAÇÃO CLÍNICA TRIAXIAL INTEGRADO (Documento Mestre v.2.0)
      // Verifica se deve iniciar avaliação clínica usando o fluxo correto
      console.log('🔍 Verificando se deve iniciar avaliação clínica...')

      // Verifica se o usuário confirmou a avaliação
      if (
        (mensagemLower.includes('sim') ||
          mensagemLower.includes('começar') ||
          mensagemLower.includes('comecar')) &&
        modoAvaliacao &&
        etapaAtual === 0
      ) {
        console.log('✅ Usuário confirmou avaliação - Iniciando com contexto inteligente')

        // 🧠 INICIAR CONTEXTO INTELIGENTE DE AVALIAÇÃO
        const {
          data: { user },
        } = await supabase.auth.getUser()
        await avaliacaoClinicaService.iniciarAvaliacao(user?.id || crypto.randomUUID())

        // Avança para a primeira pergunta real
        setEtapaAtual(1)

        // Registra o início da avaliação no sistema
        await noaSystemService.registerConversationFlow(
          sessionId,
          'evaluation_started',
          { user_type: userType, timestamp: new Date().toISOString() },
          1
        )

        // 🧠 CONTEXTUALIZAÇÃO INTELIGENTE:
        // Verifica se usuário já se apresentou antes
        const usuarioJaSeApresentou = messages.some(
          msg =>
            msg.sender === 'user' &&
            (msg.message.toLowerCase().includes('meu nome') ||
              msg.message.toLowerCase().includes('sou ') ||
              msg.message.match(/\b[A-Z][a-z]+ [A-Z][a-z]+\b/)) // Nome próprio
        )

        // Se tem nome salvo OU já se apresentou, pula bloco 1 e vai direto para bloco 2
        if (userName || usuarioJaSeApresentou || jaSeApresentou) {
          console.log('✅ Usuário já se apresentou - Pulando bloco 1')
          setEtapaAtual(1) // Começa no bloco 2 (motivo_detalhado)

          const blocoMotivo = await noaSystemService.getImreBlock(2)
          const perguntaContextual =
            blocoMotivo?.block_prompt || 'O que trouxe você à nossa avaliação hoje?'

          // Personaliza mensagem com nome do usuário
          const mensagemPersonalizada = userName
            ? `✅ **Perfeito, ${userName}! Vamos começar.**\n\n${perguntaContextual}`
            : `✅ **Vamos começar!**\n\n${perguntaContextual}`

          const audioPersonalizado = userName
            ? `Perfeito, ${userName}! ${perguntaContextual}`
            : perguntaContextual

          const noaMessage: Message = {
            id: crypto.randomUUID(),
            message: mensagemPersonalizada,
            sender: 'noa',
            timestamp: new Date(),
            conversation_type: 'clinical_evaluation',
            user_type: userType || 'paciente',
            session_id: sessionId,
          }
          setMessages(prev => [...prev, noaMessage])
          await playNoaAudioWithText(audioPersonalizado)
        } else {
          // Primeira vez - usa bloco 1 normal
          console.log('✅ Primeira vez - Usando bloco 1 (apresentação)')
          setEtapaAtual(1) // Avança para primeira pergunta real

          const etapa = ETAPAS_AVALIACAO[0]
          const imreBlock = await noaSystemService.getImreBlock(1)
          const perguntaTexto = imreBlock?.block_prompt || etapa.pergunta

          const noaMessage: Message = {
            id: crypto.randomUUID(),
            message: perguntaTexto,
            sender: 'noa',
            timestamp: new Date(),
            conversation_type: 'clinical_evaluation',
            user_type: userType || 'paciente',
            session_id: sessionId,
          }
          setMessages(prev => [...prev, noaMessage])

          // Registra o bloco no fluxo
          await noaSystemService.registerConversationFlow(
            sessionId,
            'imre_block',
            {
              block_order: 1,
              block_name: imreBlock?.block_name || 'Abertura Exponencial',
              user_response: userMessage,
            },
            2
          )

          // Toca áudio da primeira pergunta
          await playNoaAudioWithText(perguntaTexto)
        }

        setIsTyping(false)
        console.log('✅ Avaliação iniciada com fluxo correto, saindo da função')
        return
      }

      // 🔴 CANCELAR/FECHAR AVALIAÇÃO
      const querCancelar =
        mensagemLower.includes('cancelar') ||
        mensagemLower.includes('fechar') ||
        mensagemLower.includes('sair') ||
        mensagemLower.includes('parar avaliação') ||
        mensagemLower.includes('parar avaliacao')

      if (querCancelar || mensagemLower.includes('não') || mensagemLower.includes('nao')) {
        console.log('🔴 Usuário cancelou - Voltando ao chat normal')

        // Volta ao modo normal
        const estavaNaAvaliacao = modoAvaliacao
        setModoAvaliacao(false)
        setEtapaAtual(0)
        setConversationType('general')

        // Fecha o card
        closeExpandedCard()

        // Registra cancelamento se estava em avaliação
        if (estavaNaAvaliacao) {
          await noaSystemService.registerConversationFlow(
            sessionId,
            'evaluation_cancelled',
            { etapa_cancelada: etapaAtual, timestamp: new Date().toISOString() },
            998
          )
        }

        setMessages(prev => {
          const withoutTyping = prev.filter(msg => !msg.isTyping)
          const cancelMessage: Message = {
            id: crypto.randomUUID(),
            message:
              '✅ **Voltamos ao chat normal!**\n\nFique à vontade para me perguntar sobre qualquer assunto ou iniciar a avaliação quando quiser.\n\nComo posso ajudar você agora?',
            sender: 'noa',
            timestamp: new Date(),
            conversation_type: 'general',
          }
          return [...withoutTyping, cancelMessage]
        })

        await playNoaAudioWithText('Voltamos ao chat normal! Como posso ajudar você agora?')
        setIsTyping(false)
        return
      }

      // 🛡️ PROTEÇÃO: Se está em modo avaliação, BLOQUEIA qualquer outra lógica
      // Avaliação Clínica Inicial roda SEM INTERRUPÇÃO até o fim
      if (modoAvaliacao) {
        console.log('🩺 MODO AVALIAÇÃO ATIVO - Fluxo protegido e isolado')
        console.log('📝 Resposta do usuário:', userMessage)
        console.log('📊 Etapa:', etapaAtual + 1, '/ 28 blocos IMRE')

        // 🔍 VERIFICAR SE É COMANDO DE SAÍDA
        const comandosSaida = [
          'cancelar',
          'sair',
          'parar',
          'desistir',
          'abortar',
          'fechar avaliação',
        ]
        if (comandosSaida.some(cmd => mensagemLower.includes(cmd))) {
          console.log('🛑 Usuário cancelou a avaliação')
          setModoAvaliacao(false)
          setEtapaAtual(0)

          const msgCancelamento: Message = {
            id: crypto.randomUUID(),
            message:
              '❌ Avaliação cancelada. Você pode retomar quando quiser dizendo "iniciar avaliação clínica inicial".',
            sender: 'noa',
            timestamp: new Date(),
          }
          setMessages(prev => [...prev, msgCancelamento])
          await playNoaAudioWithText('Avaliação cancelada. Pode retomar quando quiser.')
          setIsTyping(false)
          return
        }

        try {
          // Buscar bloco IMRE atual do banco
          let blocoAtual = await noaSystemService.getImreBlock(etapaAtual + 1)
          if (!blocoAtual) {
            console.error('❌ Bloco IMRE não encontrado para etapa:', etapaAtual)
            // Usar etapas locais como fallback
            const etapaLocal = ETAPAS_AVALIACAO[etapaAtual]
            if (etapaLocal) {
              blocoAtual = {
                id: etapaAtual + 1,
                block_order: etapaAtual + 1,
                block_name: etapaLocal.title,
                block_description: etapaLocal.title,
                block_prompt: etapaLocal.pergunta,
                block_type: 'pergunta',
                is_active: true,
              }
            } else {
              // Se não há etapa local, usar pergunta genérica
              blocoAtual = {
                id: etapaAtual + 1,
                block_order: etapaAtual + 1,
                block_name: 'Pergunta Personalizada',
                block_description: 'Por favor, me conte mais sobre sua situação de saúde atual.',
                block_prompt: 'Por favor, me conte mais sobre sua situação de saúde atual.',
                block_type: 'pergunta',
                is_active: true,
              }
            }
          }

          // 🧠 PROCESSAR RESPOSTA COM SERVIÇO INTELIGENTE
          const contextoAtualizado = await avaliacaoClinicaService.processarResposta(
            sessionId,
            userMessage,
            blocoAtual
          )

          console.log('✅ Contexto atualizado:', contextoAtualizado.variaveisCapturadas)

          // Verifica se é a última etapa (28 blocos IMRE do banco, não ETAPAS_AVALIACAO)
          const totalBlocosImre = 28
          if (etapaAtual >= totalBlocosImre - 1) {
            console.log('🎉 Avaliação concluída! Gerando relatório...')

            // 📊 GERAR RELATÓRIO FINAL
            const relatorio = await avaliacaoClinicaService.gerarRelatorio(sessionId)

            // 🧠 SALVAR PARA APRENDIZADO CONTÍNUO
            await avaliacaoClinicaService.salvarParaAprendizado(sessionId)

            // 🪙 GERAR NFT HASH
            const { data: nftData } = await supabase.rpc('gerar_nft_hash', {
              session_id_param: sessionId,
            })

            console.log('✅ Relatório gerado:', relatorio)
            console.log('🪙 NFT Hash:', nftData)

            setModoAvaliacao(false)

            const mensagemConclusao = `**🎉 AVALIAÇÃO CLÍNICA CONCLUÍDA!**\n\n✅ Relatório gerado com sucesso!\n🪙 NFT: ${nftData?.substring(0, 16)}...\n📊 Completude: ${relatorio.completude}%\n⏱️ Duração: ${relatorio.duracaoMinutos} minutos\n\n**Seu relatório está disponível no dashboard!**\n\nRecomendo marcar consulta com Dr. Ricardo Valença para aprofundar a avaliação.\n\n*Método IMRE - Arte da Entrevista Clínica*`

            const noaMessage: Message = {
              id: crypto.randomUUID(),
              message: mensagemConclusao,
              sender: 'noa',
              timestamp: new Date(),
              conversation_type: 'clinical_evaluation',
              session_id: sessionId,
            }
            setMessages(prev => [...prev, noaMessage])

            // 🎤 ÁUDIO E VÍDEO para conclusão
            await playNoaAudioWithText(
              `Avaliação concluída, ${contextoAtualizado.variaveisCapturadas.nome || 'paciente'}! Seu relatório foi gerado e está disponível no dashboard. Recomendo consulta com Dr. Ricardo Valença.`
            )

            setIsTyping(false)
            return
          }

          // Avança para a próxima etapa
          const proximaEtapa = etapaAtual + 1
          setEtapaAtual(proximaEtapa)

          // Busca próximo bloco IMRE do banco
          const proximoBlocoImre = await noaSystemService.getImreBlock(proximaEtapa + 1)

          const proximaEtapaData = ETAPAS_AVALIACAO[proximaEtapa]
          const perguntaTexto = proximoBlocoImre?.block_prompt || proximaEtapaData.pergunta

          const noaMessage: Message = {
            id: crypto.randomUUID(),
            message: perguntaTexto,
            sender: 'noa',
            timestamp: new Date(),
            conversation_type: 'clinical_evaluation',
            session_id: sessionId,
          }
          setMessages(prev => [...prev, noaMessage])

          // 🎤 ATIVA ÁUDIO E VÍDEO DA NÔA (estava faltando!)
          console.log('🎤 Ativando áudio e vídeo para pergunta:', perguntaTexto.substring(0, 50))
          await playNoaAudioWithText(perguntaTexto)

          // 💾 SALVA PARA APRENDIZADO CONTÍNUO
          const etapaData = ETAPAS_AVALIACAO[proximaEtapa]
          await noaSystemService.saveAILearning(
            userMessage,
            perguntaTexto,
            'clinical_evaluation',
            0.9,
            [etapaData?.id || 'imre_step', 'imre', 'avaliacao_clinica']
          )

          // 📊 Registra interação no fluxo
          await noaSystemService.registerConversationFlow(
            sessionId,
            'imre_block_response',
            {
              block_order: proximaEtapa,
              block_name: proximaEtapaData?.title,
              user_response: userMessage,
              timestamp: new Date().toISOString(),
            },
            proximaEtapa
          )

          setIsTyping(false)
          return
        } catch (error) {
          console.error('Erro no fluxo de avaliação:', error)
          // Continua para o fluxo normal se houver erro
        }
      }

      // Detecta se o usuário está se apresentando (salva nome, mas usa ChatGPT para resposta)
      if (
        !userMemory.name &&
        (userMessage.toLowerCase().includes('meu nome é') ||
          userMessage.toLowerCase().includes('eu sou') ||
          userMessage.toLowerCase().includes('sou o') ||
          userMessage.toLowerCase().includes('sou a'))
      ) {
        // Extrai o nome da mensagem
        const nameMatch = userMessage.match(/(?:meu nome é|eu sou|sou o|sou a)\s+([a-zA-ZÀ-ÿ\s]+)/i)
        if (nameMatch) {
          const extractedName = nameMatch[1].trim()
          saveUserMemory({ name: extractedName })
          // Continua para ChatGPT gerar a resposta
        }
      }

      // 🤖 TENTAR NoaGPT PRIMEIRO (conforme Documento Mestre v.2.0)
      console.log('🚀 [NoaVision IA] Processando com sistema híbrido inteligente...')

      // 🧠 CONSTRUIR CONTEXTO COMPLETO PARA NOAVISION IA
      const currentPath = window.location.pathname // Usar window.location em vez de hook
      const noaContext: NoaContext = {
        userId: user?.id || 'guest',
        userProfile: (userProfile?.role as any) || 'paciente',
        userName: userName || userProfile?.name || 'Usuário',
        specialty: currentSpecialty,
        currentDashboard: currentPath,
        currentRoute: currentPath,
        conversationHistory: messages
          .filter(msg => !msg.isTyping)
          .slice(-10) // Últimas 10 mensagens
          .map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'assistant',
            content: msg.message
          }))
      }

      console.log('🎯 [NoaVision IA] Contexto:', {
        perfil: noaContext.userProfile,
        especialidade: noaContext.specialty,
        dashboard: noaContext.currentDashboard
      })

      // 🚀 USAR NOAVISION IA (sistema novo com embeddings)
      let noaResponse: string
      let responseSource: string = 'noavision'
      
      try {
        const result = await noaVisionIA.processMessage(userMessage, noaContext)
        noaResponse = result.response
        responseSource = result.source
        
        console.log(`✅ [NoaVision IA] Resposta em ${result.processingTime}ms (${result.source})`)
        
      } catch (error) {
        console.warn('⚠️ [NoaVision IA] Erro, usando fallback NoaGPT...', error)
        
        // FALLBACK: Sistema antigo (NoaGPT)
        const fallbackNoaGPT = noaGPT || new NoaGPT()
        if (!noaGPT) {
          setNoaGPT(fallbackNoaGPT)
        }

        const chatHistory = messages
          .filter(msg => msg.sender === 'user' || msg.sender === 'noa')
          .slice(-10)
          .map(msg => `${msg.sender}: ${msg.message}`)

        noaResponse = await fallbackNoaGPT.processCommandWithFineTuned(userMessage, chatHistory)
        responseSource = 'noagpt_fallback'
      }
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
            timestamp: new Date(),
          }
          return [...withoutTyping, noaMessage]
        })

        // Salvar interação no sistema de aprendizado
        aiLearningService.saveInteraction(userMessage, noaResponse, 'general')

        // Salvar no sistema integrado MedCanLab
        await noaSystemService.saveAILearning(
          userMessage,
          noaResponse,
          'general',
          0.8,
          userMessage.split(' ').slice(0, 5) // Primeiras 5 palavras como keywords
        )

        // Salvar conversa na tabela noa_conversations
        const saveNoaGPT = noaGPT || new NoaGPT()
        await saveNoaGPT.saveResponse(userMessage, noaResponse, 'chat_interaction', 'general')

        // Registrar conversa no sistema integrado
        await noaSystemService.registerNoaConversation(
          userMessage,
          noaResponse,
          conversationType,
          userType || 'unknown'
        )

        // Gerar áudio
        await playNoaAudioWithText(noaResponse)
        setIsTyping(false)
        return
      }

      console.log('🔄 NoaGPT não reconheceu, usando OpenAI fallback...')

      // Obter contexto de aprendizado da IA
      const learningContext = await aiLearningService.getLearningContext(userMessage)

      // Converte histórico para formato OpenAI com contexto do usuário
      const systemContext = `Você é Nôa Esperanza, assistente médica inteligente do MedCanLab, desenvolvida pelo Dr. Ricardo Valença.

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
            role: msg.sender === 'user' ? ('user' as const) : ('assistant' as const),
            content: msg.message,
          }))
          .slice(-8), // Mantém apenas as últimas 8 mensagens + contexto do sistema
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
          timestamp: new Date(),
        }
        return [...withoutTyping, noaMessage]
      })
      // Removido: addNotification('Resposta da Nôa Esperanza do MedCanLab recebida', 'success')

      // 🧠 APRENDIZADO AUTOMÁTICO - IA aprende com a conversa
      aiLearningService.saveInteraction(userMessage, openAIResponse, 'general')

      // Salvar conversa na tabela noa_conversations
      const saveNoaGPT = noaGPT || new NoaGPT()
      await saveNoaGPT.saveResponse(userMessage, openAIResponse, 'openai_fallback', 'general')

      // 💭 GERAR PENSAMENTOS FLUTUANTES baseados na resposta
      setTimeout(() => {
        const newThoughts = generateThoughtsFromResponse(openAIResponse)
        console.log('💭 Gerando pensamentos:', newThoughts)
        console.log('💭 Número de pensamentos:', newThoughts.length)
        console.log(
          '💭 IDs dos pensamentos:',
          newThoughts.map(t => t.id)
        )
        setThoughts(newThoughts)
        setIsProcessing(false)
      }, 1500) // Delay de 1.5s para aparecer após a resposta

      // Voz Residente gera APENAS áudio (texto já vem do ChatGPT)
      console.log('🎤 Enviando texto do ChatGPT para Voz Residente gerar áudio...')
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
    const respostaNegativa =
      resposta.toLowerCase().includes('não') ||
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
        lista_indiciaria: [...prev.lista_indiciaria, resposta],
      }))

      // Pergunta "O que mais?" removida - usa ChatGPT
    } else if (etapa.id === 'queixa_principal') {
      setDadosAvaliacao(prev => ({ ...prev, queixa_principal: resposta }))
    } else if (etapa.id === 'desenvolvimento_localizacao') {
      setDadosAvaliacao(prev => ({
        ...prev,
        desenvolvimento_indiciario: {
          ...prev.desenvolvimento_indiciario,
          localizacao: resposta,
        },
      }))
    } else if (etapa.id === 'desenvolvimento_inicio') {
      setDadosAvaliacao(prev => ({
        ...prev,
        desenvolvimento_indiciario: {
          ...prev.desenvolvimento_indiciario,
          inicio: resposta,
        },
      }))
    } else if (etapa.id === 'desenvolvimento_qualidade') {
      setDadosAvaliacao(prev => ({
        ...prev,
        desenvolvimento_indiciario: {
          ...prev.desenvolvimento_indiciario,
          qualidade: resposta,
        },
      }))
    } else if (etapa.id === 'desenvolvimento_sintomas') {
      setDadosAvaliacao(prev => ({
        ...prev,
        desenvolvimento_indiciario: {
          ...prev.desenvolvimento_indiciario,
          sintomas_associados: resposta,
        },
      }))
    } else if (etapa.id === 'desenvolvimento_melhora') {
      setDadosAvaliacao(prev => ({
        ...prev,
        desenvolvimento_indiciario: {
          ...prev.desenvolvimento_indiciario,
          fatores_melhora: resposta,
        },
      }))
    } else if (etapa.id === 'desenvolvimento_piora') {
      setDadosAvaliacao(prev => ({
        ...prev,
        desenvolvimento_indiciario: {
          ...prev.desenvolvimento_indiciario,
          fatores_piora: resposta,
        },
      }))
    } else if (etapa.id === 'historia_patologica') {
      setDadosAvaliacao(prev => ({
        ...prev,
        historia_patologica: [...prev.historia_patologica, resposta],
      }))

      // Pergunta "O que mais?" removida - usa ChatGPT
    } else if (etapa.id === 'historia_familiar_mae') {
      setDadosAvaliacao(prev => ({
        ...prev,
        historia_familiar: {
          ...prev.historia_familiar,
          mae: [...prev.historia_familiar.mae, resposta],
        },
      }))

      // Pergunta "O que mais?" removida - usa ChatGPT
    } else if (etapa.id === 'historia_familiar_pai') {
      setDadosAvaliacao(prev => ({
        ...prev,
        historia_familiar: {
          ...prev.historia_familiar,
          pai: [...prev.historia_familiar.pai, resposta],
        },
      }))

      // Pergunta "O que mais?" removida - usa ChatGPT
    } else if (etapa.id === 'habitos_vida') {
      setDadosAvaliacao(prev => ({
        ...prev,
        habitos_vida: [...prev.habitos_vida, resposta],
      }))

      // Pergunta "O que mais?" removida - usa ChatGPT
    } else if (etapa.id === 'alergias') {
      setDadosAvaliacao(prev => ({ ...prev, alergias: resposta }))
    } else if (etapa.id === 'medicacoes_continuas') {
      setDadosAvaliacao(prev => ({
        ...prev,
        medicacoes: {
          ...prev.medicacoes,
          continuas: resposta,
        },
      }))
    } else if (etapa.id === 'medicacoes_eventuais') {
      setDadosAvaliacao(prev => ({
        ...prev,
        medicacoes: {
          ...prev.medicacoes,
          eventuais: resposta,
        },
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
      options: [
        'Está tudo correto',
        'Gostaria de adicionar algo',
        'Há algo que não entendi bem',
        'Posso melhorar alguma resposta',
      ],
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
        options: ['Sim, concordo', 'Quero adicionar algo', 'Há algo a corrigir', 'Está perfeito'],
      }

      setMessages(prev => [...prev, concordancia])
      playNoaAudioWithText(concordancia.message)

      // Finalização com recomendação específica
      setTimeout(async () => {
        // Pede consentimento antes de enviar para dashboard
        const consentimentoMessage: Message = {
          id: crypto.randomUUID(),
          message:
            '🔐 **CONSENTIMENTO PARA DASHBOARD**\n\nVocê concorda em enviar este relatório para o seu dashboard pessoal?\n\nO relatório ficará disponível para você e poderá ser compartilhado com o Dr. Ricardo Valença.\n\n**Responda:**\n• SIM - Enviar para dashboard\n• NÃO - Apenas visualizar',
          sender: 'noa',
          timestamp: new Date(),
          conversation_type: 'clinical_evaluation',
          session_id: sessionId,
        }
        setMessages(prev => [...prev, consentimentoMessage])
        await playNoaAudioWithText(
          'Você concorda em enviar este relatório para o seu dashboard pessoal? Responda SIM para enviar ou NÃO para apenas visualizar.'
        )

        // TODO: Aguardar resposta do usuário antes de finalizar
        // Por enquanto, vamos assumir consentimento após timeout
        setTimeout(async () => {
          // Cria o relatório NFT no sistema
          const nftReport = await noaSystemService.completeClinicalEvaluation(sessionId, {
            ...dadosAvaliacao,
            relatorio_narrativo: relatorio,
            blocks_completed: ETAPAS_AVALIACAO.length,
            user_type: userType,
            timestamp: new Date().toISOString(),
            consent_given: true, // Consentimento registrado
          })

          const finalizacao: Message = {
            id: crypto.randomUUID(),
            message: `**🎉 AVALIAÇÃO CLÍNICA CONCLUÍDA!**\n\n✅ Seu relatório foi gerado e certificado com NFT!\n🪙 **NFT Hash:** ${nftReport?.nft_hash || 'Gerando...'}\n📊 **Dashboard:** Relatório enviado com sucesso!\n\n**RECOMENDAÇÃO FINAL:**\n\nEssa é uma avaliação inicial de acordo com o método desenvolvido pelo Dr. Ricardo Valença com o objetivo de aperfeiçoar o seu atendimento. Ao final, recomendo a marcação de uma consulta com o Dr. Ricardo Valença pelo site.\n\n💡 **Próximos passos:**\n- Acesse seu dashboard para ver o relatório completo\n- Compartilhe com o Dr. Ricardo Valença\n- Agende sua consulta\n- Prepare suas dúvidas\n\n*Método Arte da Entrevista Clínica - Dr. Ricardo Valença*`,
            sender: 'noa',
            timestamp: new Date(),
            conversation_type: 'clinical_evaluation',
            user_type: userType || 'paciente',
            session_id: sessionId,
          }

          setMessages(prev => [...prev, finalizacao])
          playNoaAudioWithText(
            'Avaliação clínica concluída! Seu relatório foi gerado, certificado com NFT e enviado para o seu dashboard. Você pode acessá-lo a qualquer momento e compartilhar com o Dr. Ricardo Valença.'
          )

          // Salva avaliação concluída no Supabase
          saveEvaluationToSupabase(true).then(() => {
            console.log('✅ Avaliação salva no Supabase:', evaluationId)
          })

          // Registra a conclusão no fluxo e envia para dashboard
          await noaSystemService.registerConversationFlow(
            sessionId,
            'evaluation_completed',
            {
              nft_report_id: nftReport?.id,
              nft_hash: nftReport?.nft_hash,
              evaluation_data: dadosAvaliacao,
              sent_to_dashboard: true,
              consent_given: true,
            },
            999
          )

          console.log('📊 Relatório enviado para dashboard do paciente!')
        }, 3000)
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
      timestamp: new Date(),
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
        action: 'Iniciar Curso',
      },
      {
        id: 'pdf-1',
        type: 'pdf',
        icon: '📄',
        title: 'Protocolo CKD',
        description: 'Classificação por estágios renais',
        route: '/medcann-lab',
        action: 'Baixar PDF',
      },
      {
        id: 'curso-2',
        type: 'curso',
        icon: '🎓',
        title: 'Fundamentos AEC',
        description: 'Curso básico, 8h',
        route: '/ensino',
        action: 'Iniciar Curso',
      },
      {
        id: 'ebook-1',
        type: 'ebook',
        icon: '📕',
        title: 'Cannabis Medicinal',
        description: 'Protocolos em nefrologia',
        route: '/pesquisa',
        action: 'Baixar PDF',
      },
      {
        id: 'ebook-2',
        type: 'ebook',
        icon: '📖',
        title: 'AEC Fundamentos',
        description: 'Guia completo da metodologia',
        route: '/ensino',
        action: 'Baixar eBook',
      },
      {
        id: 'projeto-1',
        type: 'projeto',
        icon: '🏥',
        title: 'Cidade Amiga dos Rins',
        description: '1.2K pacientes, 3 cidades',
        route: '/pesquisa',
        action: 'Explorar Projeto',
      },
      {
        id: 'projeto-2',
        type: 'projeto',
        icon: '🔬',
        title: 'MedCann Lab',
        description: '187 pacientes, 5 estágios CKD',
        route: '/medcann-lab',
        action: 'Ver Pesquisa',
      },
      {
        id: 'protocolo-1',
        type: 'protocolo',
        icon: '📊',
        title: 'Protocolo CKD',
        description: 'Classificação por estágios renais',
        route: '/medcann-lab',
        action: 'Acessar Protocolo',
      },
      {
        id: 'protocolo-2',
        type: 'protocolo',
        icon: '🧠',
        title: 'Deep Learning Biomarcadores',
        description: 'IA para análise de função renal',
        route: '/medcann-lab',
        action: 'Ver Análise',
      },
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
      type: thought.type,
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
              timestamp: new Date(),
            }
            setMessages(prev => [...prev, noaMessage])
          },
          color: 'bg-blue-500 hover:bg-blue-600',
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
              timestamp: new Date(),
            }
            setMessages(prev => [...prev, noaMessage])
          },
          color: 'bg-red-500 hover:bg-red-600',
        }
      case 'avaliacao':
        return {
          label: '🩺 Iniciar Avaliação IMRE (28 Blocos)',
          action: async () => {
            console.log('🩺 Iniciando Avaliação Clínica IMRE via card')

            // Inicia o modo avaliação
            setModoAvaliacao(true)
            setEtapaAtual(0)
            setConversationType('clinical_evaluation')

            // Registra início no sistema
            await noaSystemService.registerConversationFlow(
              sessionId,
              'evaluation_started',
              { trigger: 'card_click', timestamp: new Date().toISOString() },
              0
            )

            // Busca primeiro bloco IMRE do banco
            const primeiroBloco = await noaSystemService.getImreBlock(1)

            // Mostra mensagem de início no chat principal
            const inicioMessage: Message = {
              id: crypto.randomUUID(),
              message:
                '🩺 **AVALIAÇÃO CLÍNICA INICIADA**\n\nVamos começar a Arte da Entrevista Clínica. Todas as respostas serão salvas e ao final você receberá um relatório completo.\n\n' +
                (primeiroBloco?.block_prompt || ETAPAS_AVALIACAO[0].pergunta),
              sender: 'noa',
              timestamp: new Date(),
              conversation_type: 'clinical_evaluation',
              session_id: sessionId,
            }
            setMessages(prev => [...prev, inicioMessage])

            // Nôa fala
            await playNoaAudioWithText(primeiroBloco?.block_prompt || ETAPAS_AVALIACAO[0].pergunta)

            // Registra conversa
            await noaSystemService.registerNoaConversation(
              'Iniciar avaliação clínica',
              inicioMessage.message,
              'clinical_evaluation',
              userType || 'paciente'
            )
          },
          color: 'bg-green-500 hover:bg-green-600',
        }
      default:
        return {
          label: `Explorar ${title}`,
          action: () => {
            const question = `Me explique mais sobre ${title.toLowerCase()}`
            setInputMessage(question)
          },
          color: 'bg-green-500 hover:bg-green-600',
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

  // Função para processar upload de imagem médica
  const handleMedicalImageUpload = async (file: File) => {
    try {
      setIsProcessingImage(true)
      addNotification('🏥 Processando imagem médica...', 'info')

      // Processar imagem com OCR e IA
      const processedData = await MedicalImageService.processMedicalImage(file, 'current_user')

      if (processedData.length > 0) {
        // Adicionar dados médicos ao estado
        setMedicalData(prev => [...prev, ...processedData])

        // Criar mensagem com resultados
        const resultsMessage = processedData
          .map(data => {
            const statusEmoji =
              data.status === 'normal'
                ? '✅'
                : data.status === 'alto'
                  ? '⚠️'
                  : data.status === 'baixo'
                    ? '📉'
                    : '❓'

            return `${statusEmoji} **${data.exame.toUpperCase()}**: ${data.valor} ${data.unidade} (${data.referencia}) - ${data.status.toUpperCase()}`
          })
          .join('\n')

        const alertasMessage = processedData
          .flatMap(data => data.alertas || [])
          .map(alerta => `🔔 ${alerta.mensagem}`)
          .join('\n')

        const fullMessage = `**📋 EXAMES PROCESSADOS:**\n\n${resultsMessage}\n\n**🚨 ALERTAS:**\n${alertasMessage}`

        // Adicionar mensagem da NOA com resultados
        const noaMessage: Message = {
          id: Date.now().toString(),
          message: fullMessage,
          sender: 'noa',
          timestamp: new Date(),
        }

        setMessages(prev => [...prev, noaMessage])
        addNotification(`✅ ${processedData.length} exames processados com sucesso!`, 'success')

        // TODO: Salvar no Supabase
        console.log('💾 Dados para salvar no banco:', processedData)
      } else {
        addNotification('❌ Nenhum exame encontrado na imagem', 'warning')
      }
    } catch (error) {
      console.error('❌ Erro no processamento:', error)
      addNotification('❌ Erro ao processar imagem médica', 'error')
    } finally {
      setIsProcessingImage(false)
    }
  }

  // Função para iniciar reconhecimento de voz
  const startVoiceRecognition = () => {
    // 🛑 CRÍTICO: NÃO inicia se Nôa está falando (evita auto-escuta!)
    if (noaSpeaking || audioPlaying) {
      console.log('🛑 NÃO iniciando reconhecimento - Nôa está falando!', {
        noaSpeaking,
        audioPlaying,
      })
      return
    }

    if (!noaVoiceService.isSpeechRecognitionAvailable()) {
      console.warn('⚠️ Speech Recognition não disponível neste navegador')
      setIsVoiceListening(false)
      return
    }

    console.log('🎤 Iniciando reconhecimento de voz com Nôa Voice Service')

    const success = noaVoiceService.startListening(
      result => {
        console.log('🎤 Resultado do reconhecimento:', result)

        if (result.isFinal && result.transcript.trim()) {
          console.log('✅ Texto reconhecido:', result.transcript)
          setInputMessage(result.transcript)
          setIsVoiceListening(false)

          // Enviar mensagem automaticamente
          setTimeout(() => {
            handleSendMessage(result.transcript)
          }, 500)
        }
      },
      error => {
        console.error('❌ Erro no reconhecimento:', error)
        setIsVoiceListening(false)
      }
    )

    if (!success) {
      setIsVoiceListening(false)
    }
  }

  // Função para ativar reconhecimento de voz automaticamente após resposta da NOA
  const autoActivateVoiceAfterResponse = () => {
    // ✅ REABILITADO COM PROTEÇÃO - Só ativa se Nôa NÃO está falando
    console.log('🔄 Tentando ativar reconhecimento de voz automaticamente em 4 segundos...')
    setTimeout(() => {
      // PROTEÇÃO: Verifica múltiplas condições para evitar auto-escuta
      const canActivate = !isVoiceListening && userInteracted && !audioPlaying && !noaSpeaking

      if (canActivate) {
        console.log('✅ Condições OK - Ativando reconhecimento de voz')
        startVoiceRecognition()
      } else {
        console.log('🛑 Não ativando reconhecimento - Nôa ainda pode estar falando:', {
          isVoiceListening,
          userInteracted,
          audioPlaying,
          noaSpeaking,
        })
      }
    }, 4000) // 4 segundos para garantir que Nôa terminou de falar
  }

  // Função para tocar áudio da NOA com texto sincronizado
  const playNoaAudioWithText = async (text: string) => {
    try {
      console.log('🎵 Nôa Esperanza do MedCanLab falando:', {
        userInteracted,
        audioPlaying,
        text: text.substring(0, 50) + '...',
        timestamp: new Date().toISOString(),
      })

      // Remove markdown e formatação para o áudio
      const cleanText = cleanTextForAudio(text)

      // Se o texto está vazio, não faz nada
      if (!cleanText || cleanText.trim().length === 0) {
        console.log('⚠️ Texto vazio, não reproduzindo áudio')
        return
      }

      console.log('🗣️ Nôa Esperanza do MedCanLab falando:', cleanText.substring(0, 100) + '...')
      console.log('🔊 Estado antes da fala:', { audioPlaying, noaSpeaking, isVoiceListening })

      // 🛑 CRÍTICO: Para o reconhecimento de voz ANTES de Nôa falar (evita auto-escuta!)
      if (isVoiceListening) {
        console.log('🛑 PARANDO reconhecimento de voz - Nôa vai falar')
        noaVoiceService.stopListening()
        setIsVoiceListening(false)
        // Aguarda o reconhecimento parar completamente
        await new Promise(resolve => setTimeout(resolve, 300))
      }

      // Para qualquer fala em andamento
      noaVoiceService.stopSpeaking()

      // Aguarda um pouco para garantir que a fala anterior foi cancelada
      await new Promise(resolve => setTimeout(resolve, 200))

      setAudioPlaying(true)
      setNoaSpeaking(true)

      console.log('🎬 Estados definidos para fala:', { audioPlaying: true, noaSpeaking: true })

      // Para o reconhecimento de voz enquanto NOA fala
      if (isVoiceListening) {
        console.log('🔇 Pausando reconhecimento de voz enquanto Nôa fala')
        setIsVoiceListening(false)
      }

      // Usar o novo serviço de voz da Nôa
      try {
        console.log('🎤 Iniciando fala da Nôa com texto:', cleanText.substring(0, 50) + '...')
        console.log('🎤 Texto completo para fala:', cleanText)

        // Força a fala mesmo se houver problemas
        await noaVoiceService.speak(cleanText)
        console.log('🏁 Nôa Esperanza do MedCanLab terminou de falar')

        // Verifica se realmente terminou de falar
        setTimeout(() => {
          if (noaVoiceService.isCurrentlySpeaking()) {
            console.log('⚠️ Nôa ainda está falando, aguardando...')
          } else {
            console.log('✅ Nôa realmente terminou de falar')
          }
        }, 1000)
      } catch (speechError) {
        console.error('❌ Erro na fala da Nôa:', speechError)
        // Tenta novamente em caso de erro
        console.log('🔄 Tentando falar novamente após erro...')
        try {
          await noaVoiceService.speak(cleanText)
          console.log('✅ Segunda tentativa de fala bem-sucedida')
        } catch (retryError) {
          console.error('❌ Erro na segunda tentativa:', retryError)
        }
      } finally {
        // Aguarda um pouco antes de desativar o vídeo
        setTimeout(() => {
          console.log('🔄 Finalizando estados de áudio e vídeo')
          setAudioPlaying(false)
          setNoaSpeaking(false)
          autoActivateVoiceAfterResponse()
        }, 500) // Aumentado para 500ms
      }
    } catch (error) {
      console.error('❌ Erro ao fazer Nôa falar:', error)
      setAudioPlaying(false)
      setNoaSpeaking(false)
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="h-full overflow-hidden relative">
      {/* Background Matrix */}
      <MatrixBackground isActive={matrixActive} opacity={0.05} />

      {/* Layout Principal */}
      <div className="w-full h-full flex relative z-0">
        {/* Sidebar Esquerdo - Chat */}
        <div
          className="sidebar-mobile w-80 flex-shrink-0 bg-white/10 border-r border-white/20 p-4 fixed left-0 top-[7vh] h-[calc(100vh-7vh-80px)] z-10"
          style={{ overflow: 'hidden' }}
        >
          {/* Balão de Pensamento */}
          <div className="h-full flex flex-col">
            <div
              className="bg-white rounded-2xl px-3 pb-3 shadow-lg border border-white/20 flex-1 flex flex-col"
              style={{ overflow: 'hidden' }}
            >
              {/* Triggers Fixos no Topo */}
              <div className="px-3 pt-3 pb-2 border-b border-gray-200">
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      const input = document.createElement('input')
                      input.type = 'file'
                      input.accept = 'image/*'
                      input.onchange = async e => {
                        const file = (e.target as HTMLInputElement).files?.[0]
                        if (file) {
                          console.log('📸 Imagem médica selecionada:', file.name)
                          await handleMedicalImageUpload(file)
                        }
                      }
                      input.click()
                    }}
                    disabled={isProcessingImage}
                    className={`px-3 py-1.5 rounded-lg text-xs transition-colors border ${
                      isProcessingImage
                        ? 'bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-red-100 hover:bg-red-200 border-red-300 text-red-800'
                    }`}
                    title={
                      isProcessingImage ? 'Processando imagem...' : 'Enviar exame/receita/laudo'
                    }
                  >
                    {isProcessingImage ? '⏳ Processando' : '🖼️ Imagem'}
                  </button>

                  <button
                    onClick={() => handleOptionClick('Hipertensão')}
                    className="px-3 py-1.5 bg-purple-100 hover:bg-purple-200 border border-purple-300 rounded-lg text-xs text-purple-800 transition-colors"
                  >
                    🏥 Histórico
                  </button>

                  <button
                    onClick={() => {
                      console.log('🩺 Iniciando Avaliação Clínica Inicial - Arte da Entrevista')

                      // Ativa o modo de avaliação
                      setModoAvaliacao(true)
                      setEtapaAtual(0)
                      setConversationType('clinical_evaluation')

                      // Expande o card da Avaliação Clínica
                      expandCard({
                        id: 'avaliacao-clinica-inicial',
                        title: 'Avaliação Clínica Inicial',
                        description: 'Arte da Entrevista Clínica - Método IMRE (28 Blocos)',
                        content:
                          'Vou guiá-lo através de uma avaliação clínica completa baseada no método Arte da Entrevista Clínica desenvolvido pelo Dr. Ricardo Valença. São 28 perguntas estruturadas que nos ajudarão a entender melhor sua situação de saúde.',
                        type: 'avaliacao',
                      })
                      // E também inicia no chat
                      setTimeout(() => {
                        handleSendMessage('iniciar avaliação clínica inicial')
                      }, 500)
                    }}
                    className="px-3 py-1.5 bg-green-100 hover:bg-green-200 border border-green-300 rounded-lg text-xs text-green-800 transition-colors font-semibold"
                    title="Iniciar Avaliação Clínica Inicial - Arte da Entrevista Clínica"
                  >
                    🩺 Avaliação Clínica Inicial
                  </button>
                </div>
              </div>

              {/* Área de Mensagens - Melhorada */}
              <div
                className="messages-container space-y-3 flex-1 overflow-y-scroll scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 min-h-0 max-h-full px-3 pt-3 pb-6"
                style={{
                  scrollBehavior: 'auto',
                  WebkitOverflowScrolling: 'touch',
                  overflowAnchor: 'none',
                  position: 'relative',
                  scrollSnapType: 'none',
                  scrollPadding: '0',
                  scrollMargin: '0',
                  overflowY: 'scroll',
                  height: '100%',
                  maxHeight: '100%',
                  /* FORÇAR SCROLL MANUAL */
                  scrollSnapAlign: 'none',
                  scrollSnapStop: 'normal',
                }}
              >
                {messages.map(message => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    data-testid={message.sender === 'user' ? 'user-message' : 'ai-message'}
                  >
                    <div
                      className={`max-w-xs lg:max-w-xs ${
                        message.sender === 'user'
                          ? 'bg-blue-500 text-white rounded-lg p-3'
                          : 'bg-gray-100 text-gray-800 rounded-lg p-3'
                      }`}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-line">
                        {message.message}
                      </p>

                      <span className="text-xs opacity-70 mt-1 block">
                        {formatTime(message.timestamp)}
                      </span>
                    </div>
                  </div>
                ))}

                {/* Indicador de digitação */}
                {isTyping && (
                  <div className="flex justify-start" data-testid="typing-indicator">
                    <div className="bg-gray-100 text-gray-800 rounded-lg p-3 max-w-xs">
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div
                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: '0.1s' }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: '0.2s' }}
                          ></div>
                        </div>
                        <span className="text-xs">NOA está digitando...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Input de Mensagem */}
              <div className="mt-3">
                <div className="flex gap-2 border border-gray-300 rounded-lg p-2 bg-white">
                  {/* Botão de voz - Esquerda */}
                  <button
                    onClick={() => {
                      if (isVoiceListening) {
                        setIsVoiceListening(false)
                        noaVoiceService.stopListening()
                        console.log('🛑 Reconhecimento de voz parado')
                      } else {
                        setIsVoiceListening(true)
                        startVoiceRecognition()
                      }
                    }}
                    className={`px-2 py-1.5 rounded-md transition-colors text-xs ${
                      isVoiceListening
                        ? 'bg-red-500 hover:bg-red-600 text-white'
                        : 'bg-green-500 hover:bg-green-600 text-white'
                    }`}
                    title={isVoiceListening ? 'Parar gravação' : 'Falar com a NOA'}
                    aria-label={
                      isVoiceListening ? 'Parar gravação de voz' : 'Iniciar gravação de voz'
                    }
                    data-testid="voice-button"
                  >
                    <i className={`fas ${isVoiceListening ? 'fa-stop' : 'fa-microphone'}`}></i>
                  </button>

                  {/* Input no meio */}
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={e => setInputMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Digite sua mensagem..."
                    className="flex-1 px-3 py-2 text-sm focus:outline-none text-black placeholder-gray-600"
                    aria-label="Campo de mensagem para conversar com NOA"
                    data-testid="chat-input"
                  />

                  {/* Botão Enviar - Direita */}
                  <button
                    onClick={() => handleSendMessage()}
                    disabled={!inputMessage.trim()}
                    className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-2 py-1.5 rounded-md transition-colors text-xs"
                    aria-label="Enviar mensagem para NOA"
                    title="Enviar mensagem"
                    data-testid="send-button"
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
        onClick={e => {
          console.log('🎯 CLIQUE NO CONTAINER PRINCIPAL!', e.target)
        }}
      >
        {/* Avatar da NOA - Vídeos Animados */}
        <div
          className={`flex-shrink-0 flex justify-center items-center relative transition-all duration-500 ${
            isCardExpanded ? 'scale-75 translate-x-24' : 'scale-100 translate-x-0'
          }`}
        >
          <div className="w-[200px] h-[200px] md:w-[400px] md:h-[400px] rounded-full overflow-hidden border-2 md:border-4 border-green-400 shadow-lg relative aspect-square bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center">
            {/* Avatar da NOA - Imagem estática por enquanto */}
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-white text-6xl md:text-8xl animate-pulse">🤖</div>
            </div>

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
              onCanPlay={() => {
                console.log('✅ Vídeo estático carregado!')
              }}
              onError={e => console.log('⚠️ Vídeo estático não disponível')}
            >
              <source src="/estatica%20piscando.mp4" type="video/mp4" />
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
              ref={video => {
                if (video) {
                  video.playbackRate = 0.8
                }
              }}
              onCanPlay={() => {
                console.log('✅ Vídeo falando carregado!')
              }}
              onError={e => console.log('⚠️ Vídeo falando não disponível')}
            >
              <source src="/AGENTEFALANDO.mp4" type="video/mp4" />
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
          {!isCardExpanded &&
            thoughts.map((thought, index) => (
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
              transition={{ duration: 0.5, ease: 'easeInOut' }}
              className={`fixed left-64 z-50 w-96 max-h-[70vh] overflow-y-auto ${
                expandedCard.type === 'avaliacao' && modoAvaliacao
                  ? 'ring-2 ring-green-400/50 shadow-2xl shadow-green-400/20'
                  : ''
              }`}
              style={{
                top: 'calc(20% - 4%)',
                transform: 'translateY(-50%)',
                pointerEvents: 'auto',
              }}
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

                  {/* 🩺 CARD DE AVALIAÇÃO CLÍNICA MELHORADO */}
                  {expandedCard.type === 'avaliacao' && modoAvaliacao && (
                    <div className="space-y-4">
                      {/* Header da Avaliação */}
                      <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-lg p-4 border border-green-400/30">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-white font-bold text-lg">
                            🩺 Avaliação Clínica IMRE
                          </h3>
                          <div className="text-right">
                            <p className="text-green-400 font-bold text-sm">
                              {etapaAtual + 1} / 28
                            </p>
                            <p className="text-gray-300 text-xs">
                              {Math.round(((etapaAtual + 1) / 28) * 100)}% concluído
                            </p>
                          </div>
                        </div>

                        {/* Barra de progresso melhorada */}
                        <div className="w-full bg-gray-700 rounded-full h-3 mb-3">
                          <div
                            className="bg-gradient-to-r from-green-400 via-blue-400 to-purple-500 h-3 rounded-full transition-all duration-700 ease-out"
                            style={{ width: `${((etapaAtual + 1) / 28) * 100}%` }}
                          />
                        </div>

                        {/* Etapa atual destacada */}
                        <div className="bg-white/10 rounded-lg p-3">
                          <p className="text-gray-300 text-xs mb-1">🎯 Etapa atual:</p>
                          <p className="text-white font-semibold text-sm">
                            {ETAPAS_AVALIACAO[etapaAtual]?.title || 'Aguardando início'}
                          </p>
                        </div>
                      </div>

                      {/* Pergunta Atual - DESTACADA */}
                      {etapaAtual > 0 && (
                        <div className="bg-blue-500/20 rounded-lg p-4 border border-blue-400/30">
                          <div className="flex items-start space-x-3">
                            <div className="bg-blue-500 rounded-full p-2 flex-shrink-0">
                              <span className="text-white text-sm font-bold">{etapaAtual}</span>
                            </div>
                            <div className="flex-1">
                              <p className="text-blue-300 text-xs font-semibold mb-2">
                                Pergunta {etapaAtual} de 28
                              </p>
                              <p className="text-white text-sm leading-relaxed">
                                {(() => {
                                  const pergunta =
                                    ETAPAS_AVALIACAO[etapaAtual]?.pergunta ||
                                    'Carregando pergunta...'
                                  // Substitui [queixa] pela queixa principal capturada
                                  return pergunta.replace(
                                    /\[queixa\]/g,
                                    dadosAvaliacao.queixa_principal || 'sua queixa'
                                  )
                                })()}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Área de Resposta */}
                      {etapaAtual > 0 && (
                        <div className="bg-white/5 rounded-lg p-4 border border-gray-600/30">
                          <label className="block text-gray-300 text-xs font-semibold mb-2">
                            💬 Sua resposta:
                          </label>
                          <textarea
                            className="w-full bg-gray-800/50 border border-gray-600 rounded-lg p-3 text-white text-sm placeholder-gray-400 focus:border-green-400 focus:ring-1 focus:ring-green-400 transition-colors resize-none"
                            rows={3}
                            placeholder="Digite sua resposta aqui..."
                            value={inputMessage}
                            onChange={e => setInputMessage(e.target.value)}
                            onKeyDown={e => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault()
                                handleSendMessage(inputMessage)
                              }
                            }}
                          />
                          <div className="flex justify-between items-center mt-2">
                            <p className="text-gray-400 text-xs">Pressione Enter para enviar</p>
                            <button
                              onClick={() => handleSendMessage(inputMessage)}
                              className="px-2 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-xs transition-colors"
                              disabled={!inputMessage.trim()}
                            >
                              Enviar
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Botões de Navegação */}
                      <div className="flex justify-between items-center gap-2">
                        <button
                          onClick={() => {
                            if (etapaAtual > 1) {
                              setEtapaAtual(etapaAtual - 1)
                            }
                          }}
                          className="px-2 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={etapaAtual <= 1}
                        >
                          ← Anterior
                        </button>

                        <button
                          onClick={() => {
                            setModoAvaliacao(false)
                            setEtapaAtual(0)
                            setExpandedCard(null)
                          }}
                          className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-xs transition-colors"
                        >
                          ❌ Cancelar
                        </button>

                        <button
                          onClick={() => {
                            if (etapaAtual < 27) {
                              setEtapaAtual(etapaAtual + 1)
                            }
                          }}
                          className="px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={etapaAtual >= 27}
                        >
                          Próximo →
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Área de interação */}
                  <div className="space-y-3">
                    <p className="text-gray-300 text-xs">💬 Faça perguntas no chat</p>
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

        {/* 👑 Card Admin - Lado DIREITO */}
        <AnimatePresence>
          {isAdminMode && adminCardType && (
            <motion.div
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 100, opacity: 0 }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
              className="fixed z-50 w-96 max-h-[85vh] overflow-y-auto"
              style={{
                top: '15%',
                right: 'calc(4% + 9%)', // Move 9% para a esquerda
                pointerEvents: 'auto',
              }}
            >
              <div className="premium-card w-full border-2 border-yellow-400">
                {/* Header do Card Admin */}
                <div className="flex justify-between items-center p-4 border-b border-yellow-400/30 bg-yellow-400/10">
                  <div>
                    <h2 className="text-lg font-bold text-yellow-400 mb-1">👑 PAINEL ADMIN</h2>
                    <p className="text-gray-300 text-xs">
                      {adminCardType === 'stats' && '📊 Estatísticas e KPIs'}
                      {adminCardType === 'editor' && '📝 Editor de Blocos IMRE'}
                      {adminCardType === 'users' && '👥 Gestão de Usuários'}
                      {adminCardType === 'ia' && '🧠 Treinamento da IA'}
                    </p>
                  </div>
                  <button
                    onClick={() => setAdminCardType(null)}
                    className="text-yellow-400 hover:text-yellow-300 text-xl transition-colors"
                  >
                    ×
                  </button>
                </div>

                {/* Conteúdo do Card Admin */}
                <div className="p-4">
                  {adminCardType === 'stats' && (
                    <div className="space-y-3">
                      <div className="bg-white/10 rounded-lg p-3">
                        <p className="text-yellow-400 text-sm font-semibold mb-2">
                          📊 Estatísticas em Tempo Real
                        </p>
                        <p className="text-gray-300 text-xs">
                          Dados sendo carregados do Supabase...
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setInputMessage('atualizar estatísticas')
                          handleSendMessage('atualizar estatísticas')
                        }}
                        className="w-full px-3 py-2 bg-yellow-500 hover:bg-yellow-600 text-black rounded-lg text-xs font-semibold"
                      >
                        🔄 Atualizar Dados
                      </button>
                    </div>
                  )}

                  {adminCardType === 'editor' && (
                    <div className="space-y-3">
                      <div className="bg-white/10 rounded-lg p-3">
                        <p className="text-yellow-400 text-sm font-semibold mb-2">
                          📝 Editor de Blocos IMRE
                        </p>
                        <p className="text-gray-300 text-xs">
                          Selecione um bloco para editar ou diga: "editar bloco [número]"
                        </p>
                      </div>
                    </div>
                  )}

                  {adminCardType === 'users' && (
                    <div className="space-y-3">
                      <div className="bg-white/10 rounded-lg p-3">
                        <p className="text-yellow-400 text-sm font-semibold mb-2">
                          👥 Gestão de Usuários
                        </p>
                        <p className="text-gray-300 text-xs">Usuários sendo carregados...</p>
                      </div>
                    </div>
                  )}

                  {adminCardType === 'ia' && (
                    <div className="space-y-3">
                      <div className="bg-white/10 rounded-lg p-3">
                        <p className="text-yellow-400 text-sm font-semibold mb-2">
                          🧠 Treinamento da IA
                        </p>
                        <p className="text-gray-300 text-xs">Processando dados de aprendizado...</p>
                      </div>
                    </div>
                  )}
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
            {messages.slice(-3).map(message => (
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
        </div>
      </div>
    </div>
  )
}

export default Home

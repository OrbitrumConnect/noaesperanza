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

  // Estados para Avaliação Clínica Triaxial
  const [modoAvaliacao, setModoAvaliacao] = useState(false)
  const [etapaAtual, setEtapaAtual] = useState(0)
  const [perguntandoMais, setPerguntandoMais] = useState(false)
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

      // Se está em modo avaliação, processa a resposta
      if (modoAvaliacao) {
        await processarRespostaAvaliacao(userMessage)
        setIsTyping(false)
        return
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

    recognition.continuous = true // Permite interrupção
    recognition.interimResults = true // Detecta fala em tempo real
    recognition.lang = 'pt-BR'
    recognition.maxAlternatives = 1 // Melhor precisão
    recognition.serviceURI = 'wss://www.google.com/speech-api/full-duplex/v1/up' // Melhor performance
    
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

      // Se há fala detectada (interim ou final), interrompe áudio da NOA
      if (interimTranscript || finalTranscript) {
        // Só interrompe se não estiver tocando áudio da NOA
        if (!audioPlaying) {
          console.log('🗣️ Usuário falando detectado, interrompendo áudio da NOA...')
          
          // Para o áudio atual da NOA
          if (currentAudioRef.current) {
            currentAudioRef.current.pause()
            currentAudioRef.current = null
            setAudioPlaying(false)
            console.log('⏹️ Áudio da NOA interrompido')
          }
        } else {
          console.log('🔇 NOA está falando, ignorando detecção de voz')
        }
      }

      // Mostra texto intermediário em tempo real (sem processar ainda)
      if (interimTranscript) {
        console.log('🎤 Texto em tempo real:', interimTranscript)
        setInputMessage(interimTranscript)
        // Removido: addNotification(`🎤 Escutando: "${interimTranscript}"`, 'info')
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
    <div className="h-full overflow-hidden">
      {/* Layout Principal */}
      <div className="w-full h-full flex items-center justify-center">
        {/* Balão de Pensamento com NOA ao Lado */}
        <div className="flex items-center gap-8 justify-center w-full h-full -ml-[10%]">
          {/* Balão de Pensamento */}
          <div className="flex-1 relative max-w-md z-[100] -ml-4">
            {/* Balão principal */}
            <div className="bg-white rounded-2xl px-3 pb-3 shadow-lg border border-white/20 relative z-[100]">

              {/* Área de Mensagens */}
              <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
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
                      <p className="text-sm leading-relaxed whitespace-pre-line">{message.message}</p>
                      
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
                  className={`px-4 py-2 rounded-lg transition-colors text-sm ${
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

          {/* Avatar da NOA */}
          <div className="flex-shrink-0 flex justify-center items-center relative">
            <div className="w-[533px] h-[533px] rounded-full overflow-hidden border-4 border-green-400 shadow-lg">
              <img 
                src="./avatar-default.jpg" 
                alt="NOA Esperanza" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTA0IiBoZWlnaHQ9IjEwNCIgdmlld0JveD0iMCAwIDEwNCAxMDQiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDQiIGhlaWdodD0iMTA0IiBmaWxsPSIjMTA5NjMxIi8+CjxjaXJjbGUgY3g9IjUyIiBjeT0iMzgiIHI9IjE4IiBmaWxsPSIjRkZGRkZGIi8+CjxwYXRoIGQ9Ik0yNiA4NkMyNiA3MS4xNjQyIDM4LjE2NDIgNTkgNTMgNTlINDFDMzguMTY0MiA1OSAyNiA3MS4xNjQyIDI2IDg2WiIgZmlsbD0iI0ZGRkZGRiIvPgo8L3N2Zz4K'
                }}
              />
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
                className="absolute top-4 right-4 p-3 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-colors"
                title="Parar áudio"
              >
                <i className="fas fa-stop text-lg"></i>
              </button>
            )}
            {/* Indicador de escuta de voz */}
            {isVoiceListening && (
              <div className="absolute top-4 left-4 p-3 bg-green-500 text-white rounded-full shadow-lg animate-pulse">
                <i className="fas fa-microphone text-lg"></i>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
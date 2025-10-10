import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  MessageBubble,
  TypingIndicator,
  ProgressBar,
  EtapaQueixa,
  EtapaIndiciaria,
  TriageMessage,
  TriageStage,
} from '../components/triagem'

const TRIAGE_STAGES: TriageStage[] = [
  {
    id: 'acolhimento',
    label: 'Acolhimento',
    prompt:
      'Olá! Eu sou Nôa Esperanza e vou conduzir a sua triagem clínica inicial. Antes de começarmos, pode me contar como prefere ser chamada?',
    description:
      'Apresentação inicial, construção de vínculo e identificação de prioridades imediatas.',
    followUps: [
      'Existe algo urgente ou que precise de atenção imediata neste momento?',
      'Há algum limite ou necessidade especial que devo considerar durante nossa conversa?',
    ],
    exitMessage:
      'Perfeito, obrigado por compartilhar essas informações iniciais. Vamos avançar para compreender as queixas que mais lhe chamam atenção.',
  },
  {
    id: 'queixas',
    label: 'Queixas Principais',
    prompt:
      'Conte-me quais questões, sintomas ou desconfortos estão presentes e merecem nossa atenção neste momento.',
    description:
      'Mapeamento das queixas principais e secundárias, identificando intensidade, frequência e impacto.',
    followUps: [
      'Há mais alguma queixa ou sintoma que gostaria de registrar?',
      'Percebe algo que agrave ou alivie essas queixas?',
    ],
    exitMessage:
      'Anotei as queixas mencionadas. Agora vamos explorar a história dessas questões para compreender como surgiram.',
    suggestions: [
      'Dor abdominal',
      'Cefaleia persistente',
      'Insônia',
      'Ansiedade',
      'Fadiga crônica',
      'Alterações digestivas',
      'Desconforto torácico',
      'Oscilações de humor',
    ],
  },
  {
    id: 'historia-indiciaria',
    label: 'História Indiciária',
    prompt: 'Vamos aprofundar um pouco: quando essas questões começaram e como evoluíram até aqui?',
    description:
      'Exploração da linha do tempo, gatilhos, hábitos e interações com outros elementos da vida.',
    followUps: [
      'Que situações costumam desencadear ou intensificar os sintomas?',
      'Há sinais associados que vale comentar (como alterações de sono, alimentação ou humor)?',
    ],
    exitMessage:
      'Obrigado pelos detalhes. Já tenho uma boa visão da sua história e podemos partir para a síntese inicial.',
    focusTopics: [
      'Início dos sintomas',
      'Episódios marcantes',
      'Fatores de alívio',
      'Fatores de piora',
      'Medicações ou terapias em curso',
      'Impacto no cotidiano',
      'Sono e recuperação',
      'Aspectos emocionais associados',
    ],
  },
  {
    id: 'sintese-encaminhamento',
    label: 'Síntese e Encaminhamento',
    prompt:
      'Com base no que você compartilhou, vou preparar uma síntese clínica inicial para orientar os próximos passos.',
    description: 'Síntese preliminar e alinhamento das ações subsequentes da jornada clínica.',
    followUps: ['Há algo mais que deseje acrescentar antes de concluirmos esta triagem?'],
    exitMessage:
      'Triagem concluída. Registrarei a síntese no seu prontuário digital e encaminharei as orientações necessárias.',
  },
]

const messageFactory = (
  author: TriageMessage['author'],
  content: string,
  stageId: string
): TriageMessage => ({
  id: `${author}-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`,
  author,
  content,
  stageId,
  timestamp: new Date().toISOString(),
})

const TriagemClinica: React.FC = () => {
  const [messages, setMessages] = useState<TriageMessage[]>([])
  const [inputValue, setInputValue] = useState('')
  const [currentStageIndex, setCurrentStageIndex] = useState(0)
  const [stageStep, setStageStep] = useState(0)
  const [isTyping, setIsTyping] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sessionCompleted, setSessionCompleted] = useState(false)
  const [sessionStart] = useState(() => Date.now())

  const currentStage = TRIAGE_STAGES[currentStageIndex]

  const messagesEndRef = useRef<HTMLDivElement | null>(null)
  const visitedStagesRef = useRef(new Set<string>())
  const stageIndexRef = useRef(currentStageIndex)
  const stageStepRef = useRef(stageStep)

  useEffect(() => {
    stageIndexRef.current = currentStageIndex
  }, [currentStageIndex])

  useEffect(() => {
    stageStepRef.current = stageStep
  }, [stageStep])

  const pushMessage = useCallback(
    (author: TriageMessage['author'], content: string, stageId: string) => {
      setMessages(prev => [...prev, messageFactory(author, content, stageId)])
    },
    []
  )

  useEffect(() => {
    if (!currentStage) {
      return
    }

    if (!visitedStagesRef.current.has(currentStage.id)) {
      visitedStagesRef.current.add(currentStage.id)
      pushMessage('noa', currentStage.prompt, currentStage.id)
    }
  }, [currentStage, pushMessage])

  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  const progressValue = useMemo(() => {
    if (sessionCompleted) {
      return 100
    }

    const totalStages = TRIAGE_STAGES.length
    const stageWeight = 100 / totalStages
    const followUpsCount = currentStage.followUps?.length ?? 0
    const intraStageProgress = followUpsCount ? Math.min(stageStep / (followUpsCount + 1), 1) : 0.5

    const baseProgress = currentStageIndex * stageWeight
    return Math.min(100, baseProgress + intraStageProgress * stageWeight)
  }, [currentStage, currentStageIndex, sessionCompleted, stageStep])

  const handleAutomatedAdvance = useCallback(() => {
    setStageStep(() => {
      stageStepRef.current = 0
      return 0
    })

    setCurrentStageIndex(prev => {
      if (prev >= TRIAGE_STAGES.length - 1) {
        setSessionCompleted(true)
        stageIndexRef.current = prev
        return prev
      }

      const next = prev + 1
      stageIndexRef.current = next
      return next
    })
  }, [])

  const respondFromNoa = useCallback(
    (patientMessage: string) => {
      const trimmed = patientMessage.trim()
      const typingDelay = Math.min(1400, Math.max(500, trimmed.length * 22))

      window.setTimeout(() => {
        const latestStage = TRIAGE_STAGES[stageIndexRef.current]
        const latestFollowUps = latestStage.followUps ?? []
        const latestStep = stageStepRef.current
        const shouldAskFollowUp = latestStep < latestFollowUps.length
        const reply = shouldAskFollowUp
          ? latestFollowUps[latestStep]
          : (latestStage.exitMessage ?? '')

        if (reply) {
          pushMessage('noa', reply, latestStage.id)
        }

        setIsTyping(false)

        if (shouldAskFollowUp) {
          setStageStep(prev => {
            const next = prev + 1
            stageStepRef.current = next
            return next
          })
        } else {
          handleAutomatedAdvance()
        }
      }, typingDelay)
    },
    [handleAutomatedAdvance, pushMessage]
  )

  const sendMessage = useCallback(
    (rawContent: string) => {
      const trimmed = rawContent.trim()
      if (!trimmed) {
        setError('Digite uma mensagem antes de enviar.')
        return
      }

      setError(null)

      const stageId = TRIAGE_STAGES[stageIndexRef.current]?.id ?? 'acolhimento'
      setMessages(prev => [...prev, messageFactory('paciente', trimmed, stageId)])
      setInputValue('')
      setIsTyping(true)

      respondFromNoa(trimmed)
    },
    [respondFromNoa]
  )

  const handleFormSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      sendMessage(inputValue)
    },
    [inputValue, sendMessage]
  )

  const handleTextareaKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault()
        sendMessage(inputValue)
      }
    },
    [inputValue, sendMessage]
  )

  const handleSuggestion = useCallback(
    (suggestion: string) => {
      sendMessage(suggestion)
    },
    [sendMessage]
  )

  const sessionDuration = useMemo(() => {
    const endTimestamp =
      sessionCompleted && messages.length
        ? new Date(messages[messages.length - 1].timestamp).getTime()
        : Date.now()
    const diffMs = endTimestamp - sessionStart
    const minutes = Math.floor(diffMs / 60000)
    const seconds = Math.floor((diffMs % 60000) / 1000)
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }, [messages, sessionCompleted, sessionStart])

  return (
    <div className="min-h-screen bg-slate-950/95 py-10">
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 md:px-8">
        <header className="flex flex-col gap-3 rounded-3xl border border-emerald-900/70 bg-emerald-950/40 p-6 text-emerald-50 shadow-xl">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-emerald-300">
                Triagem clínica Nôa Esperanza
              </p>
              <h1 className="text-2xl font-semibold md:text-3xl">
                Escuta clínica inicial orientada
              </h1>
            </div>
            <div className="flex items-center gap-3 text-sm text-emerald-200">
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-800/60 bg-emerald-900/60 px-3 py-1">
                <span
                  className="inline-block h-2 w-2 animate-pulse rounded-full bg-emerald-400"
                  aria-hidden="true"
                />
                Sessão ativa · {sessionDuration}
              </span>
            </div>
          </div>
          <p className="max-w-3xl text-sm text-emerald-100/80">
            Esta triagem acolhe sua história clínica mantendo o método simbólico desenvolvido pelo
            Dr. Ricardo Valença. Você pode digitar livremente, selecionar sugestões ou utilizar
            tópicos de apoio para guiar o relato.
          </p>
          <ProgressBar value={progressValue} label={`Etapa atual: ${currentStage.label}`} />
        </header>

        <section className="flex flex-1 flex-col gap-4 overflow-hidden rounded-3xl border border-slate-800/70 bg-slate-900/60 p-6 shadow-inner">
          <div className="flex items-center justify-between text-xs text-emerald-100/70">
            <span>{currentStage.label}</span>
            <span>{currentStage.description}</span>
          </div>
          <div
            className="flex h-[420px] flex-col gap-4 overflow-y-auto pr-2"
            role="log"
            aria-live="polite"
            aria-label="Mensagens da triagem clínica"
          >
            {messages.map((message, index) => {
              const nextMessage = messages[index + 1]
              const isLastFromAuthor = !nextMessage || nextMessage.author !== message.author
              return (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isLastFromAuthor={isLastFromAuthor}
                />
              )
            })}
            {isTyping && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>
        </section>

        <div className="grid gap-4 md:grid-cols-2">
          <EtapaQueixa
            suggestions={currentStage.suggestions ?? []}
            onSelectSuggestion={handleSuggestion}
            disabled={isTyping}
          />
          <EtapaIndiciaria
            topics={currentStage.focusTopics ?? []}
            onSelectTopic={handleSuggestion}
            disabled={isTyping}
          />
        </div>

        <form
          onSubmit={handleFormSubmit}
          className="rounded-3xl border border-slate-800/70 bg-slate-900/60 p-6 shadow-xl"
          aria-label="Área de envio de mensagens"
        >
          <label htmlFor="triage-input" className="mb-2 block text-sm font-medium text-emerald-100">
            Compartilhe a sua mensagem
          </label>
          <div className="flex flex-col gap-3 md:flex-row md:items-end">
            <textarea
              id="triage-input"
              value={inputValue}
              onChange={event => setInputValue(event.target.value)}
              onKeyDown={handleTextareaKeyDown}
              className="min-h-[110px] flex-1 resize-none rounded-2xl border border-slate-700 bg-slate-950/40 p-4 text-sm text-slate-100 shadow-inner focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/60"
              placeholder="Escreva aqui sua percepção ou utilize Shift + Enter para quebrar linhas"
              aria-invalid={Boolean(error)}
              aria-describedby={error ? 'triage-input-error' : undefined}
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-3 text-sm font-semibold text-emerald-950 shadow-lg transition disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isTyping}
            >
              <span className="hidden md:inline">Enviar relato</span>
              <span className="md:hidden">Enviar</span>
              <span aria-hidden="true" className="text-lg">
                ↵
              </span>
            </button>
          </div>
          {error && (
            <p id="triage-input-error" className="mt-2 text-sm text-red-300">
              {error}
            </p>
          )}
        </form>

        {sessionCompleted && (
          <aside className="rounded-3xl border border-emerald-900/70 bg-emerald-950/40 p-6 text-emerald-100">
            <h2 className="text-lg font-semibold text-emerald-200">Triagem concluída</h2>
            <p className="mt-2 text-sm text-emerald-100/80">
              Sua narrativa foi registrada integralmente, mantendo o cuidado com os símbolos da sua
              história clínica. O Dr. Ricardo receberá a síntese e poderá aprofundar cada ponto na
              consulta.
            </p>
          </aside>
        )}
      </main>
    </div>
  )
}

export default TriagemClinica

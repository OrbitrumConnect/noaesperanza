// 🧪 TESTE DE COMPONENTES - HOME NÔA ESPERANZA
// Testa componentes React com Testing Library

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach, beforeAll } from 'vitest'
import Home from '../Home'
import { noaVoiceService } from '../../services/noaVoiceService'

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  }
})

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    userProfile: { name: 'Paciente Teste' },
  }),
}))

// Mock dos serviços
vi.mock('../../services/noaSystemService', () => ({
  noaSystemService: {
    registerNoaConversation: vi.fn().mockResolvedValue(true),
    setUserType: vi.fn().mockResolvedValue(true),
    initializeUserSession: vi.fn().mockResolvedValue(true),
    saveAILearning: vi.fn().mockResolvedValue(true),
    getImreBlock: vi.fn().mockResolvedValue({
      id: 1,
      block_order: 1,
      block_name: 'Abertura Exponencial',
      block_prompt: 'Olá! Eu sou Nôa Esperanza. Por favor, apresente-se também.',
      block_type: 'presentation',
      is_active: true,
    }),
    completeClinicalEvaluation: vi.fn().mockResolvedValue({
      id: 'test-nft-id',
      nft_hash: 'abc123def456',
      status: 'generated',
    }),
  },
}))

vi.mock('../../services/noaVoiceService', () => ({
  noaVoiceService: {
    speak: vi.fn(),
    startListening: vi.fn().mockReturnValue(true),
    stopListening: vi.fn(),
    stopSpeaking: vi.fn(),
    isSpeechRecognitionAvailable: vi.fn().mockReturnValue(true),
    isCurrentlySpeaking: vi.fn().mockReturnValue(false),
    isSupported: vi.fn().mockReturnValue(true),
  },
}))

vi.mock('../../services/aiLearningService', () => ({
  aiLearningService: {
    saveInteraction: vi.fn(),
    getLearningContext: vi.fn().mockResolvedValue(null),
  },
}))

vi.mock('../../services/adminCommandService', () => ({
  adminCommandService: {
    activateAdminMode: vi.fn().mockResolvedValue(false),
    detectAdminCommand: vi.fn().mockReturnValue(null),
    executeCommand: vi.fn().mockResolvedValue({ success: false }),
  },
}))

vi.mock('../../services/identityRecognitionService', () => ({
  identityRecognitionService: {
    detectIdentity: vi.fn().mockResolvedValue({ identified: false }),
    detectDirectCommand: vi.fn().mockResolvedValue(null),
  },
}))

vi.mock('../../services/directCommandProcessor', () => ({
  directCommandProcessor: {
    executeDirectCommand: vi.fn().mockResolvedValue({ success: false }),
  },
}))

vi.mock('../../services/avaliacaoClinicaService', () => ({
  avaliacaoClinicaService: {
    iniciarAvaliacao: vi.fn().mockResolvedValue({
      sessionId: 'test-session',
      status: 'in_progress',
      etapa_atual: 'abertura',
      dados: {
        lista_indiciaria: [],
        historia_patologica: [],
        historia_familiar: { mae: [], pai: [] },
        habitos_vida: [],
      },
    }),
    registrarApresentacao: vi.fn(),
    registrarRespostas: vi.fn(),
    confirmarAvaliacao: vi.fn(),
    registrarPergunta: vi.fn(),
    gerarNFTIncentivo: vi.fn().mockResolvedValue({ id: 'nft-test' }),
  },
}))

vi.mock('../../services/aiSmartLearningService', () => ({
  aiSmartLearningService: {
    buscarAprendizadosSimilares: vi.fn().mockResolvedValue([]),
    gerarRespostaContextualizada: vi.fn().mockResolvedValue(''),
    buscarHistoricoUsuario: vi.fn().mockResolvedValue([]),
    buscarPadroes: vi.fn().mockResolvedValue([]),
  },
}))

vi.mock('../../services/conversationModeService', () => ({
  conversationModeService: {
    processarMensagem: vi.fn(async () => ({
      response: 'Mensagem simulada',
      shouldChangeMode: false,
      context: {
        sessionId: 'test-session',
        userId: 'test-uuid-123',
        currentMode: 'explicativo',
        modeStartTime: new Date(),
        contextData: {},
        conversationHistory: [],
        isFirstInteraction: false,
      },
      confidence: 1,
    })),
    inicializarContexto: vi.fn(),
  },
  ConversationMode: {} as any,
}))

vi.mock('../../gpt/noaGPT', () => ({
  NoaGPT: vi.fn().mockImplementation(() => ({
    processCommand: vi.fn(async () => 'Olá! Eu sou Nôa Esperanza, assistente médica do MedCanLab.'),
    processCommandWithFineTuned: vi.fn(async () => 'Resposta processada'),
    saveResponse: vi.fn(),
    findSimilarResponse: vi.fn().mockResolvedValue(null),
  })),
}))

vi.mock('../../gpt/clinicalAgent', () => ({
  clinicalAgent: {
    processClinicalConversation: vi.fn().mockResolvedValue({
      response: 'Processo clínico simulado',
      etapa: 'abertura',
    }),
  },
}))

vi.mock('../../services/openaiService', () => ({
  openAIService: {
    sendMessage: vi.fn().mockResolvedValue('Resposta OpenAI simulada'),
    streamChatCompletion: vi.fn().mockResolvedValue({ content: 'Resposta OpenAI simulada' }),
  },
}))

vi.mock('../../utils/userIntentDetection', () => ({
  default: {
    detectIntent: vi.fn().mockReturnValue({ type: 'general' }),
    extractContext: vi.fn().mockReturnValue({}),
  },
}))

vi.mock('../../utils/supabaseTest', () => ({
  testSupabaseConnection: vi.fn(),
}))

vi.mock('../../integrations/supabase/client', () => {
  const createResponse = (data: any = null) => Promise.resolve({ data, error: null, status: 200 })
  const builder: any = {
    insert: () => builder,
    upsert: () => builder,
    update: () => builder,
    select: () => builder,
    eq: () => builder,
    ilike: () => builder,
    order: () => builder,
    limit: () => builder,
    maybeSingle: () => createResponse(),
    single: () => createResponse(),
    returns: () => builder,
    in: () => builder,
    range: () => builder,
  }

  return {
    supabase: {
      from: () => builder,
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: {
            user: {
              id: 'test-uuid-123',
              email: 'paciente@test.com',
              user_metadata: { full_name: 'Paciente Teste' },
            },
          },
          error: null,
        }),
        getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
        signOut: vi.fn().mockResolvedValue({ error: null }),
        signInWithPassword: vi
          .fn()
          .mockResolvedValue({ data: { user: { id: 'test-uuid-123' } }, error: null }),
        signUp: vi.fn().mockResolvedValue({ data: { user: { id: 'test-uuid-123' } }, error: null }),
        onAuthStateChange: vi
          .fn()
          .mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
      },
    },
  }
})

vi.mock('../../services/supabaseService', () => ({
  dataService: {
    createClinicalEvaluation: vi.fn().mockResolvedValue({ id: 'test-id' }),
    updateClinicalEvaluation: vi.fn().mockResolvedValue({ id: 'test-id' }),
  },
}))

// Mock do localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

// Mock do crypto.randomUUID
let uuidCounter = 0
const randomUuidMock = vi.fn(() => `test-uuid-${++uuidCounter}`)

Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: randomUuidMock,
  },
})

// Mock do SpeechSynthesis
Object.defineProperty(window, 'speechSynthesis', {
  value: {
    speak: vi.fn(),
    cancel: vi.fn(),
    getVoices: vi.fn(() => []),
  },
})

// Mock do SpeechRecognition
Object.defineProperty(window, 'SpeechRecognition', {
  value: vi.fn(),
})

Object.defineProperty(window, 'webkitSpeechRecognition', {
  value: vi.fn(),
})

beforeAll(() => {
  Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
    value: vi.fn(),
  })
})

describe('Home Component', () => {
  const mockProps = {
    currentSpecialty: 'neurologia' as any,
    isVoiceListening: false,
    setIsVoiceListening: vi.fn(),
    addNotification: vi.fn(),
  }

  const waitForConfig = { timeout: 7000 }

  beforeEach(() => {
    vi.clearAllMocks()
    uuidCounter = 0
    randomUuidMock.mockImplementation(() => `test-uuid-${++uuidCounter}`)
    localStorageMock.getItem.mockReturnValue(null)
  })

  it('renderiza a mensagem inicial da NOA', async () => {
    render(<Home {...mockProps} />)

    const aiMessages = await screen.findAllByTestId('ai-message', {}, waitForConfig)
    expect(aiMessages.length).toBeGreaterThan(0)
  })

  it('permite enviar mensagem do usuário e limpa o campo', async () => {
    render(<Home {...mockProps} />)

    const input = screen.getByTestId('chat-input') as HTMLInputElement
    const sendButton = screen.getByTestId('send-button')

    fireEvent.change(input, { target: { value: 'Olá, sou paciente' } })
    fireEvent.click(sendButton)

    await waitFor(() => {
      const userMessages = screen.getAllByTestId('user-message')
      expect(userMessages.some(node => node.textContent?.includes('Olá, sou paciente'))).toBe(true)
    }, waitForConfig)

    await waitFor(() => {
      expect(input.value).toBe('')
    }, waitForConfig)
  })

  it('inicia reconhecimento de voz ao clicar no botão dedicado', () => {
    render(<Home {...mockProps} />)

    const voiceButton = screen.getByTestId('voice-button')
    fireEvent.click(voiceButton)

    expect(noaVoiceService.startListening).toHaveBeenCalled()
  })

  it('exibe indicador de digitação enquanto aguarda resposta da NOA', async () => {
    render(<Home {...mockProps} />)

    const input = screen.getByTestId('chat-input')
    const sendButton = screen.getByTestId('send-button')

    fireEvent.change(input, { target: { value: 'Teste de digitação' } })
    fireEvent.click(sendButton)

    await waitFor(() => {
      expect(screen.getByTestId('typing-indicator')).toBeInTheDocument()
    }, waitForConfig)
  })
})

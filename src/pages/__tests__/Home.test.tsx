// 🧪 TESTE DE COMPONENTES - HOME NÔA ESPERANZA
// Testa componentes React com Testing Library

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import Home from '../Home'

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
      is_active: true
    }),
    completeClinicalEvaluation: vi.fn().mockResolvedValue({
      id: 'test-nft-id',
      nft_hash: 'abc123def456',
      status: 'generated'
    })
  }
}))

vi.mock('../../services/noaVoiceService', () => ({
  noaVoiceService: {
    speak: vi.fn(),
    startListening: vi.fn(),
    stopListening: vi.fn(),
    isSupported: vi.fn().mockReturnValue(true)
  }
}))

vi.mock('../../services/supabaseService', () => ({
  dataService: {
    createClinicalEvaluation: vi.fn().mockResolvedValue({ id: 'test-id' }),
    updateClinicalEvaluation: vi.fn().mockResolvedValue({ id: 'test-id' })
  }
}))

// Mock do localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

// Mock do crypto.randomUUID
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: vi.fn(() => 'test-uuid-123')
  }
})

// Mock do SpeechSynthesis
Object.defineProperty(window, 'speechSynthesis', {
  value: {
    speak: vi.fn(),
    cancel: vi.fn(),
    getVoices: vi.fn(() => [])
  }
})

// Mock do SpeechRecognition
Object.defineProperty(window, 'SpeechRecognition', {
  value: vi.fn()
})

Object.defineProperty(window, 'webkitSpeechRecognition', {
  value: vi.fn()
})

describe('Home Component', () => {
  const mockProps = {
    currentSpecialty: 'neurologia' as any,
    isVoiceListening: false,
    setIsVoiceListening: vi.fn(),
    addNotification: vi.fn()
  }

  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)
  })

  it('Deve renderizar componente inicial', () => {
    render(<Home {...mockProps} />)
    
    // Verifica se elementos principais estão presentes
    expect(screen.getByText('O que trouxe você aqui?')).toBeInTheDocument()
  })

  it('Deve permitir envio de mensagem', async () => {
    render(<Home {...mockProps} />)
    
    const input = screen.getByTestId('chat-input')
    const sendButton = screen.getByTestId('send-button')
    
    // Digita mensagem
    fireEvent.change(input, { target: { value: 'Olá, sou paciente' } })
    
    // Envia mensagem
    fireEvent.click(sendButton)
    
    // Verifica se mensagem foi enviada
    await waitFor(() => {
      expect(screen.getByText('Olá, sou paciente')).toBeInTheDocument()
    })
  })

  it('Deve mostrar apresentação da Nôa após primeira resposta', async () => {
    render(<Home {...mockProps} />)
    
    const input = screen.getByTestId('chat-input')
    const sendButton = screen.getByTestId('send-button')
    
    // Envia primeira mensagem
    fireEvent.change(input, { target: { value: 'Olá, sou paciente' } })
    fireEvent.click(sendButton)
    
    // Aguarda apresentação da Nôa
    await waitFor(() => {
      expect(screen.getByText(/Nôa Esperanza/)).toBeInTheDocument()
    })
  })

  it('Deve mostrar menu de tipos de usuário', async () => {
    render(<Home {...mockProps} />)
    
    const input = screen.getByTestId('chat-input')
    const sendButton = screen.getByTestId('send-button')
    
    // Envia primeira mensagem
    fireEvent.change(input, { target: { value: 'Olá, sou paciente' } })
    fireEvent.click(sendButton)
    
    // Aguarda menu de tipos
    await waitFor(() => {
      expect(screen.getByText(/ALUNO, PROFISSIONAL ou PACIENTE/)).toBeInTheDocument()
    })
  })

  it('Deve processar seleção de tipo de usuário', async () => {
    render(<Home {...mockProps} />)
    
    const input = screen.getByTestId('chat-input')
    const sendButton = screen.getByTestId('send-button')
    
    // Envia primeira mensagem
    fireEvent.change(input, { target: { value: 'Olá, sou paciente' } })
    fireEvent.click(sendButton)
    
    // Aguarda menu
    await waitFor(() => {
      expect(screen.getByText(/ALUNO, PROFISSIONAL ou PACIENTE/)).toBeInTheDocument()
    })
    
    // Seleciona tipo de usuário
    fireEvent.change(input, { target: { value: 'paciente' } })
    fireEvent.click(sendButton)
    
    // Aguarda menu específico
    await waitFor(() => {
      expect(screen.getByText(/MENU PACIENTE/)).toBeInTheDocument()
    })
  })

  it('Deve iniciar avaliação clínica', async () => {
    render(<Home {...mockProps} />)
    
    const input = screen.getByTestId('chat-input')
    const sendButton = screen.getByTestId('send-button')
    
    // Navega até avaliação
    fireEvent.change(input, { target: { value: 'Olá, sou paciente' } })
    fireEvent.click(sendButton)
    
    await waitFor(() => {
      expect(screen.getByText(/ALUNO, PROFISSIONAL ou PACIENTE/)).toBeInTheDocument()
    })
    
    fireEvent.change(input, { target: { value: 'paciente' } })
    fireEvent.click(sendButton)
    
    await waitFor(() => {
      expect(screen.getByText(/MENU PACIENTE/)).toBeInTheDocument()
    })
    
    // Inicia avaliação
    fireEvent.change(input, { target: { value: 'fazer avaliação clínica inicial' } })
    fireEvent.click(sendButton)
    
    // Aguarda explicação do NFT
    await waitFor(() => {
      expect(screen.getByText(/NFT INCENTIVADOR/)).toBeInTheDocument()
    })
  })

  it('Deve processar confirmação de avaliação', async () => {
    render(<Home {...mockProps} />)
    
    const input = screen.getByTestId('chat-input')
    const sendButton = screen.getByTestId('send-button')
    
    // Navega até confirmação
    fireEvent.change(input, { target: { value: 'Olá, sou paciente' } })
    fireEvent.click(sendButton)
    
    await waitFor(() => {
      expect(screen.getByText(/ALUNO, PROFISSIONAL ou PACIENTE/)).toBeInTheDocument()
    })
    
    fireEvent.change(input, { target: { value: 'paciente' } })
    fireEvent.click(sendButton)
    
    await waitFor(() => {
      expect(screen.getByText(/MENU PACIENTE/)).toBeInTheDocument()
    })
    
    fireEvent.change(input, { target: { value: 'fazer avaliação clínica inicial' } })
    fireEvent.click(sendButton)
    
    await waitFor(() => {
      expect(screen.getByText(/NFT INCENTIVADOR/)).toBeInTheDocument()
    })
    
    // Confirma avaliação
    fireEvent.change(input, { target: { value: 'sim' } })
    fireEvent.click(sendButton)
    
    // Aguarda primeira pergunta da avaliação
    await waitFor(() => {
      expect(screen.getByText(/apresente-se/)).toBeInTheDocument()
    })
  })

  it('Deve processar respostas da avaliação IMRE', async () => {
    render(<Home {...mockProps} />)
    
    const input = screen.getByTestId('chat-input')
    const sendButton = screen.getByTestId('send-button')
    
    // Navega até avaliação
    fireEvent.change(input, { target: { value: 'Olá, sou paciente' } })
    fireEvent.click(sendButton)
    
    await waitFor(() => {
      expect(screen.getByText(/ALUNO, PROFISSIONAL ou PACIENTE/)).toBeInTheDocument()
    })
    
    fireEvent.change(input, { target: { value: 'paciente' } })
    fireEvent.click(sendButton)
    
    await waitFor(() => {
      expect(screen.getByText(/MENU PACIENTE/)).toBeInTheDocument()
    })
    
    fireEvent.change(input, { target: { value: 'fazer avaliação clínica inicial' } })
    fireEvent.click(sendButton)
    
    await waitFor(() => {
      expect(screen.getByText(/NFT INCENTIVADOR/)).toBeInTheDocument()
    })
    
    fireEvent.change(input, { target: { value: 'sim' } })
    fireEvent.click(sendButton)
    
    await waitFor(() => {
      expect(screen.getByText(/apresente-se/)).toBeInTheDocument()
    })
    
    // Responde primeira pergunta
    fireEvent.change(input, { target: { value: 'Meu nome é João, tenho 35 anos' } })
    fireEvent.click(sendButton)
    
    // Aguarda próxima pergunta
    await waitFor(() => {
      expect(screen.getByText(/canabis medicinal/)).toBeInTheDocument()
    })
  })

  it('Deve mostrar botão de voz', () => {
    render(<Home {...mockProps} />)
    
    const voiceButton = screen.getByTestId('voice-button')
    expect(voiceButton).toBeInTheDocument()
  })

  it('Deve processar clique no botão de voz', () => {
    render(<Home {...mockProps} />)
    
    const voiceButton = screen.getByTestId('voice-button')
    fireEvent.click(voiceButton)
    
    // Verifica se função de voz foi chamada
    expect(require('../../services/noaVoiceService').noaVoiceService.startListening).toHaveBeenCalled()
  })

  it('Deve mostrar indicador de digitação', async () => {
    render(<Home {...mockProps} />)
    
    const input = screen.getByTestId('chat-input')
    const sendButton = screen.getByTestId('send-button')
    
    // Envia mensagem
    fireEvent.change(input, { target: { value: 'teste' } })
    fireEvent.click(sendButton)
    
    // Verifica se indicador de digitação aparece
    await waitFor(() => {
      expect(screen.getByText(/NOA está pensando/)).toBeInTheDocument()
    })
  })

  it('Deve limpar input após envio', async () => {
    render(<Home {...mockProps} />)
    
    const input = screen.getByTestId('chat-input')
    const sendButton = screen.getByTestId('send-button')
    
    // Envia mensagem
    fireEvent.change(input, { target: { value: 'teste' } })
    fireEvent.click(sendButton)
    
    // Verifica se input foi limpo
    await waitFor(() => {
      expect(input).toHaveValue('')
    })
  })

  it('Deve mostrar mensagens de erro', async () => {
    // Mock de erro
    vi.spyOn(console, 'error').mockImplementation(() => {})
    
    render(<Home {...mockProps} />)
    
    const input = screen.getByTestId('chat-input')
    const sendButton = screen.getByTestId('send-button')
    
    // Simula erro
    fireEvent.change(input, { target: { value: 'erro' } })
    fireEvent.click(sendButton)
    
    // Verifica se sistema continua funcionando
    await waitFor(() => {
      expect(screen.getByText('erro')).toBeInTheDocument()
    })
  })
})

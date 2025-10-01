// 🧪 TESTE DE SERVIÇOS - NOA SYSTEM SERVICE
// Testa o serviço de integração com Supabase

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { noaSystemService } from '../noaSystemService'

// Mock do Supabase
const mockSupabase = {
  rpc: vi.fn(),
  from: vi.fn()
}

vi.mock('../../integrations/supabase/client', () => ({
  supabase: mockSupabase
}))

describe('NoaSystemService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getNoaConfig', () => {
    it('Deve buscar configuração do sistema', async () => {
      const mockConfig = 'default_voice'
      mockSupabase.rpc.mockResolvedValue({ data: mockConfig, error: null })

      const result = await noaSystemService.getNoaConfig('default_voice')

      expect(mockSupabase.rpc).toHaveBeenCalledWith('get_noa_config', {
        config_key: 'default_voice'
      })
      expect(result).toBe(mockConfig)
    })

    it('Deve retornar null em caso de erro', async () => {
      mockSupabase.rpc.mockResolvedValue({ data: null, error: new Error('Test error') })

      const result = await noaSystemService.getNoaConfig('invalid_key')

      expect(result).toBeNull()
    })
  })

  describe('getImreBlock', () => {
    it('Deve buscar bloco IMRE por ordem', async () => {
      const mockBlock = {
        id: 1,
        block_order: 1,
        block_name: 'Abertura Exponencial',
        block_prompt: 'Olá! Eu sou Nôa Esperanza.',
        block_type: 'presentation',
        is_active: true
      }
      mockSupabase.rpc.mockResolvedValue({ data: mockBlock, error: null })

      const result = await noaSystemService.getImreBlock(1)

      expect(mockSupabase.rpc).toHaveBeenCalledWith('get_imre_block', {
        block_order: 1
      })
      expect(result).toEqual(mockBlock)
    })
  })

  describe('getPrompt', () => {
    it('Deve buscar prompt por ID', async () => {
      const mockPrompt = {
        id: 'neurology_greeting',
        prompt_text: 'Olá! Como posso ajudar com neurologia?',
        category: 'greeting',
        specialty: 'neurology',
        usage_count: 10,
        is_active: true
      }
      mockSupabase.rpc.mockResolvedValue({ data: mockPrompt, error: null })

      const result = await noaSystemService.getPrompt('neurology_greeting')

      expect(mockSupabase.rpc).toHaveBeenCalledWith('get_prompt', {
        prompt_id: 'neurology_greeting'
      })
      expect(result).toEqual(mockPrompt)
    })
  })

  describe('getPromptsByCategory', () => {
    it('Deve buscar prompts por categoria', async () => {
      const mockPrompts = [
        {
          id: 'greeting_1',
          prompt_text: 'Olá!',
          category: 'greeting',
          specialty: 'general',
          usage_count: 5,
          is_active: true
        },
        {
          id: 'greeting_2',
          prompt_text: 'Bem-vindo!',
          category: 'greeting',
          specialty: 'general',
          usage_count: 3,
          is_active: true
        }
      ]
      mockSupabase.rpc.mockResolvedValue({ data: mockPrompts, error: null })

      const result = await noaSystemService.getPromptsByCategory('greeting')

      expect(mockSupabase.rpc).toHaveBeenCalledWith('get_prompts_by_category', {
        category_param: 'greeting'
      })
      expect(result).toEqual(mockPrompts)
    })

    it('Deve retornar array vazio em caso de erro', async () => {
      mockSupabase.rpc.mockResolvedValue({ data: null, error: new Error('Test error') })

      const result = await noaSystemService.getPromptsByCategory('invalid_category')

      expect(result).toEqual([])
    })
  })

  describe('setUserType', () => {
    it('Deve definir tipo de usuário', async () => {
      mockSupabase.rpc.mockResolvedValue({ data: true, error: null })

      const result = await noaSystemService.setUserType('paciente')

      expect(mockSupabase.rpc).toHaveBeenCalledWith('set_user_type', {
        user_type: 'paciente'
      })
      expect(result).toBe(true)
    })

    it('Deve retornar false em caso de erro', async () => {
      mockSupabase.rpc.mockResolvedValue({ data: false, error: new Error('Test error') })

      const result = await noaSystemService.setUserType('invalid_type')

      expect(result).toBe(false)
    })
  })

  describe('getUserType', () => {
    it('Deve obter tipo de usuário atual', async () => {
      const mockUserType = {
        user_type: 'paciente',
        permission_level: 1
      }
      mockSupabase.rpc.mockResolvedValue({ data: mockUserType, error: null })

      const result = await noaSystemService.getUserType()

      expect(mockSupabase.rpc).toHaveBeenCalledWith('get_user_type')
      expect(result).toEqual(mockUserType)
    })
  })

  describe('saveAILearning', () => {
    it('Deve salvar dados de aprendizado da IA', async () => {
      mockSupabase.rpc.mockResolvedValue({ data: true, error: null })

      const result = await noaSystemService.saveAILearning(
        'Olá, sou paciente',
        'Olá! Como posso ajudar?',
        'greeting',
        0.9,
        ['olá', 'paciente']
      )

      expect(mockSupabase.rpc).toHaveBeenCalledWith('save_ai_learning', {
        user_message_param: 'Olá, sou paciente',
        ai_response_param: 'Olá! Como posso ajudar?',
        category_param: 'greeting',
        confidence_score_param: 0.9,
        keywords_param: ['olá', 'paciente']
      })
      expect(result).toBe(true)
    })
  })

  describe('registerNoaConversation', () => {
    it('Deve registrar conversa', async () => {
      mockSupabase.rpc.mockResolvedValue({ data: true, error: null })

      const result = await noaSystemService.registerNoaConversation(
        'Olá, sou paciente',
        'Olá! Como posso ajudar?',
        'presentation',
        'paciente'
      )

      expect(mockSupabase.rpc).toHaveBeenCalledWith('register_noa_conversation', {
        user_message_param: 'Olá, sou paciente',
        ai_response_param: 'Olá! Como posso ajudar?',
        conversation_type_param: 'presentation',
        user_type_param: 'paciente'
      })
      expect(result).toBe(true)
    })
  })

  describe('registerConversationFlow', () => {
    it('Deve registrar fluxo da conversa', async () => {
      mockSupabase.rpc.mockResolvedValue({ data: true, error: null })

      const result = await noaSystemService.registerConversationFlow(
        'session-123',
        'user_type_selection',
        { user_type: 'paciente' },
        1
      )

      expect(mockSupabase.rpc).toHaveBeenCalledWith('register_conversation_flow', {
        session_id_param: 'session-123',
        step_type_param: 'user_type_selection',
        step_data_param: { user_type: 'paciente' },
        step_order_param: 1
      })
      expect(result).toBe(true)
    })
  })

  describe('createNftReport', () => {
    it('Deve criar relatório NFT', async () => {
      const mockNftReport = {
        id: 'nft-123',
        user_id: 'user-123',
        session_id: 'session-123',
        report_title: 'Avaliação Clínica Inicial',
        report_content: 'Relatório completo...',
        nft_hash: 'abc123def456',
        nft_metadata: { type: 'clinical_evaluation' },
        status: 'generated',
        created_at: '2025-09-30T21:00:00Z'
      }
      mockSupabase.rpc.mockResolvedValue({ data: mockNftReport, error: null })

      const result = await noaSystemService.createNftReport(
        'session-123',
        'Avaliação Clínica Inicial',
        'Relatório completo...',
        { type: 'clinical_evaluation' }
      )

      expect(mockSupabase.rpc).toHaveBeenCalledWith('create_nft_report', {
        session_id_param: 'session-123',
        report_title_param: 'Avaliação Clínica Inicial',
        report_content_param: 'Relatório completo...',
        nft_metadata_param: { type: 'clinical_evaluation' }
      })
      expect(result).toEqual(mockNftReport)
    })
  })

  describe('updateNftStatus', () => {
    it('Deve atualizar status do NFT', async () => {
      mockSupabase.rpc.mockResolvedValue({ data: true, error: null })

      const result = await noaSystemService.updateNftStatus(
        'nft-123',
        'minted',
        'abc123def456'
      )

      expect(mockSupabase.rpc).toHaveBeenCalledWith('update_nft_status', {
        report_id_param: 'nft-123',
        status_param: 'minted',
        nft_hash_param: 'abc123def456'
      })
      expect(result).toBe(true)
    })
  })

  describe('initializeUserSession', () => {
    it('Deve inicializar sessão do usuário', async () => {
      mockSupabase.rpc
        .mockResolvedValueOnce({ data: true, error: null }) // setUserType
        .mockResolvedValueOnce({ data: true, error: null }) // registerConversationFlow

      const result = await noaSystemService.initializeUserSession('paciente')

      expect(mockSupabase.rpc).toHaveBeenCalledWith('set_user_type', {
        user_type: 'paciente'
      })
      expect(mockSupabase.rpc).toHaveBeenCalledWith('register_conversation_flow', {
        session_id_param: expect.any(String),
        step_type_param: 'session_start',
        step_data_param: expect.objectContaining({
          user_type: 'paciente',
          timestamp: expect.any(String)
        }),
        step_order_param: 0
      })
      expect(result).toBe(true)
    })
  })

  describe('completeClinicalEvaluation', () => {
    it('Deve completar avaliação clínica e gerar NFT', async () => {
      const mockNftReport = {
        id: 'nft-123',
        nft_hash: 'abc123def456',
        status: 'generated'
      }
      
      mockSupabase.rpc
        .mockResolvedValueOnce({ data: mockNftReport, error: null }) // createNftReport
        .mockResolvedValueOnce({ data: true, error: null }) // updateNftStatus
        .mockResolvedValueOnce({ data: true, error: null }) // registerConversationFlow

      const evaluationData = {
        blocks_completed: 28,
        user_type: 'paciente',
        timestamp: '2025-09-30T21:00:00Z'
      }

      const result = await noaSystemService.completeClinicalEvaluation(
        'session-123',
        evaluationData
      )

      expect(mockSupabase.rpc).toHaveBeenCalledWith('create_nft_report', {
        session_id_param: 'session-123',
        report_title_param: 'Avaliação Clínica Inicial - IMRE',
        report_content_param: JSON.stringify(evaluationData),
        nft_metadata_param: expect.objectContaining({
          type: 'clinical_evaluation',
          method: 'IMRE',
          blocks_completed: 28
        })
      })
      expect(result).toEqual(mockNftReport)
    })
  })

  describe('getConversationStats', () => {
    it('Deve buscar estatísticas de conversas', async () => {
      const mockStats = {
        total_conversations: 100,
        presentations: 50,
        clinical_evaluations: 30,
        user_type_selections: 20
      }
      
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: mockStats, error: null })
        })
      })

      const result = await noaSystemService.getConversationStats()

      expect(mockSupabase.from).toHaveBeenCalledWith('noa_conversation_stats')
      expect(result).toEqual(mockStats)
    })
  })

  describe('getUserProfile', () => {
    it('Deve buscar perfil do usuário', async () => {
      const mockProfile = {
        user_id: 'user-123',
        user_type: 'paciente',
        total_conversations: 5,
        nft_reports_count: 2
      }
      
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: mockProfile, error: null })
        })
      })

      const result = await noaSystemService.getUserProfile()

      expect(mockSupabase.from).toHaveBeenCalledWith('noa_user_profiles')
      expect(result).toEqual(mockProfile)
    })
  })

  describe('getNftSummary', () => {
    it('Deve buscar resumo de NFTs', async () => {
      const mockSummary = {
        total_nfts: 50,
        generated_nfts: 45,
        minted_nfts: 40,
        pending_nfts: 5
      }
      
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: mockSummary, error: null })
        })
      })

      const result = await noaSystemService.getNftSummary()

      expect(mockSupabase.from).toHaveBeenCalledWith('noa_nft_summary')
      expect(result).toEqual(mockSummary)
    })
  })
})

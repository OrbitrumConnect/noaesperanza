import { describe, it, expect, beforeEach, vi } from 'vitest'
import { noaSystemService } from '../noaSystemService'

const mockSupabase = vi.hoisted(() => ({
  rpc: vi.fn(),
  auth: {
    getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'test-user' } }, error: null }),
  },
}))

vi.mock('../../integrations/supabase/client', () => ({
  supabase: mockSupabase,
}))

describe('noaSystemService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSupabase.rpc.mockReset()
    mockSupabase.auth.getUser.mockReset()
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'test-user' } },
      error: null,
    })
  })

  it('getNoaConfig retorna valor quando RPC tem sucesso', async () => {
    mockSupabase.rpc.mockResolvedValue({ data: 'config-value', error: null })

    const result = await noaSystemService.getNoaConfig('default_voice')

    expect(mockSupabase.rpc).toHaveBeenCalledWith('get_noa_config', { config_key: 'default_voice' })
    expect(result).toBe('config-value')
  })

  it('getNoaConfig retorna null quando RPC falha', async () => {
    mockSupabase.rpc.mockResolvedValue({ data: null, error: new Error('fail') })

    const result = await noaSystemService.getNoaConfig('default_voice')

    expect(result).toBeNull()
  })

  it('setUserType utiliza RPC e retorna true em caso de sucesso', async () => {
    mockSupabase.rpc.mockResolvedValue({ data: true, error: null })

    const result = await noaSystemService.setUserType('paciente')

    expect(mockSupabase.rpc).toHaveBeenCalledWith('set_user_type', { user_type: 'paciente' })
    expect(result).toBe(true)
  })

  it('registerNoaConversation envia parâmetros corretos', async () => {
    mockSupabase.rpc.mockResolvedValue({ data: true, error: null })

    const result = await noaSystemService.registerNoaConversation(
      'Olá',
      'Bem-vindo',
      'presentation',
      'paciente'
    )

    expect(mockSupabase.rpc).toHaveBeenCalledWith('register_noa_conversation', {
      user_message_param: 'Olá',
      ai_response_param: 'Bem-vindo',
      conversation_type_param: 'presentation',
      user_type_param: 'paciente',
    })
    expect(result).toBe(true)
  })
})

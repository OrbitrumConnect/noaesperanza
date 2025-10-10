// 🧪 TESTE UNITÁRIO - GPT BUILDER V2 INTEGRATION
// Testes para validar a integração do sistema de atenção semântica

import { describe, it, expect, vi } from 'vitest'

// Mock das dependências
vi.mock('../supabase/embeddingClient', () => ({
  getVectorMatch: vi.fn(async (query: string) => {
    return [
      { content: 'Documento de teste sobre neurologia', relevance: 0.9 },
      { content: 'Documento sobre cannabis medicinal', relevance: 0.8 },
    ]
  }),
}))

vi.mock('../openaiService', () => ({
  sendToOpenAI: vi.fn(async (prompt: string) => {
    return 'Resposta mockada da Nôa Esperanza baseada no prompt: ' + prompt.substring(0, 50)
  }),
}))

describe('GPT Builder V2 - Integration Tests', () => {
  describe('buildUserSymbolicContext', () => {
    it('deve construir contexto com userId e histórico', async () => {
      const { buildUserSymbolicContext } = await import('../semanticAttentionService')

      const context = buildUserSymbolicContext('user-123', [
        { role: 'user', content: 'Olá' },
        { role: 'assistant', content: 'Olá! Como posso ajudar?' },
      ])

      expect(context).toContain('Usuário: user-123')
      expect(context).toContain('Histórico recente:')
      expect(context).toContain('user: Olá')
    })

    it('deve retornar mensagem padrão quando não há contexto', async () => {
      const { buildUserSymbolicContext } = await import('../semanticAttentionService')

      const context = buildUserSymbolicContext()

      expect(context).toBe('Novo usuário sem histórico')
    })
  })

  describe('enrichWithNoaGrammar', () => {
    it('deve enriquecer mensagem com gramática da Nôa', async () => {
      const { enrichWithNoaGrammar } = await import('../gptBuilderService')

      const message = 'Tenho dor de cabeça'
      const docs = [
        { content: 'Informação sobre neurologia' },
        { content: 'Informação sobre tratamentos' },
      ]
      const context = 'Usuário: user-123'

      const enrichedPrompt = enrichWithNoaGrammar(message, docs, context)

      expect(enrichedPrompt).toContain('Nôa Esperanza')
      expect(enrichedPrompt).toContain('Arte da Entrevista Clínica')
      expect(enrichedPrompt).toContain(message)
      expect(enrichedPrompt).toContain('Informação sobre neurologia')
      expect(enrichedPrompt).toContain(context)
    })

    it('deve funcionar sem contexto', async () => {
      const { enrichWithNoaGrammar } = await import('../gptBuilderService')

      const message = 'Olá'
      const docs: Array<{ content: string }> = []

      const enrichedPrompt = enrichWithNoaGrammar(message, docs)

      expect(enrichedPrompt).toContain('Nôa Esperanza')
      expect(enrichedPrompt).toContain(message)
    })
  })

  describe('processUserMessage', () => {
    it('deve processar mensagem completa com vector search e GPT', async () => {
      const { processUserMessage } = await import('../semanticAttentionService')

      const message = 'Tenho dor de cabeça'
      const userContext = 'Usuário: user-123'

      const response = await processUserMessage(message, userContext)

      expect(response).toBeDefined()
      expect(typeof response).toBe('string')
      expect(response).toContain('Resposta mockada da Nôa Esperanza')
    })
  })

  describe('Integration Flow', () => {
    it('deve executar o fluxo completo: contexto -> vector search -> enriquecimento -> GPT', async () => {
      const { processUserMessage, buildUserSymbolicContext } = await import(
        '../semanticAttentionService'
      )

      // 1. Construir contexto
      const userContext = buildUserSymbolicContext('user-123', [{ role: 'user', content: 'Olá' }])

      expect(userContext).toBeDefined()

      // 2. Processar mensagem
      const message = 'Tenho dor de cabeça'
      const response = await processUserMessage(message, userContext)

      // 3. Validar resposta
      expect(response).toBeDefined()
      expect(typeof response).toBe('string')
    })
  })
})

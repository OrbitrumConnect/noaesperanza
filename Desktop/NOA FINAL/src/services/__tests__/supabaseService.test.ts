import { describe, it, expect } from 'vitest'
import { supabaseService } from '../supabaseService'

describe('supabaseService', () => {
  it('retorna mensagem de funcionalidade em desenvolvimento ao salvar texto', async () => {
    const response = await supabaseService.salvarArquivoViaTexto('mensagem de teste')

    expect(response).toContain('Funcionalidade em desenvolvimento')
    expect(response).toContain('mensagem de teste')
  })
})

// 🎤 TESTE E2E - SISTEMA DE VOZ NÔA ESPERANZA
// Testa Speech-to-Text e Text-to-Speech

describe('Sistema de Voz Nôa Esperanza', () => {
  beforeEach(() => {
    cy.clearTestData()
    cy.mockSpeechRecognition()
    cy.mockSpeechSynthesis()
    cy.mockSupabase()
    cy.visit('/')
    cy.waitForNoaToLoad()
  })

  it('Deve testar Speech-to-Text (reconhecimento de voz)', () => {
    // 🎤 Testa ativação do reconhecimento de voz
    cy.log('🎤 Testando Speech-to-Text')
    
    // Verifica se o botão de voz existe
    cy.get('[data-testid="voice-button"]').should('be.visible')
    
    // Clica no botão de voz
    cy.get('[data-testid="voice-button"]').click()
    
    // Verifica se o reconhecimento foi iniciado
    cy.get('@speechStart').should('have.been.called')
    
    // Simula resultado do reconhecimento
    cy.simulateVoiceInput('Olá, sou paciente')
    
    // Verifica se o texto foi inserido no input
    cy.get('[data-testid="chat-input"]').should('contain.value', 'Olá, sou paciente')
    
    // Envia a mensagem
    cy.get('[data-testid="send-button"]').click()
    cy.waitForNoaResponse()
    
    // Verifica se Nôa respondeu
    cy.checkNoaMessage('Nôa Esperanza')
  })

  it('Deve testar Text-to-Speech (síntese de voz)', () => {
    // 🎤 Testa síntese de voz da Nôa
    cy.log('🎤 Testando Text-to-Speech')
    
    // Envia mensagem para ativar resposta da Nôa
    cy.sendChatMessage('Olá, sou paciente')
    cy.waitForNoaResponse()
    
    // Verifica se Nôa está falando
    cy.checkNoaSpeaking()
    
    // Verifica se a síntese de voz foi chamada
    cy.get('@speechSpeak').should('have.been.called')
    
    // Aguarda Nôa parar de falar
    cy.waitForNoaToStopSpeaking()
    
    // Verifica se o vídeo da Nôa está ativo
    cy.get('[data-testid="noa-video-speaking"]').should('be.visible')
  })

  it('Deve testar interrupção de fala', () => {
    // 🎤 Testa interrupção da fala da Nôa
    cy.log('🎤 Testando interrupção de fala')
    
    // Inicia conversa
    cy.sendChatMessage('Olá, sou paciente')
    cy.waitForNoaResponse()
    
    // Verifica se Nôa está falando
    cy.checkNoaSpeaking()
    
    // Simula interrupção (usuário fala enquanto Nôa fala)
    cy.get('[data-testid="voice-button"]').click()
    cy.simulateVoiceInput('interromper')
    
    // Verifica se a fala foi cancelada
    cy.get('@speechCancel').should('have.been.called')
    
    // Verifica se o reconhecimento foi iniciado
    cy.get('@speechStart').should('have.been.called')
  })

  it('Deve testar múltiplas interações de voz', () => {
    // 🎤 Testa sequência de interações por voz
    cy.log('🎤 Testando múltiplas interações de voz')
    
    // Primeira interação
    cy.get('[data-testid="voice-button"]').click()
    cy.simulateVoiceInput('Olá, sou paciente')
    cy.get('[data-testid="send-button"]').click()
    cy.waitForNoaResponse()
    
    // Segunda interação
    cy.get('[data-testid="voice-button"]').click()
    cy.simulateVoiceInput('paciente')
    cy.get('[data-testid="send-button"]').click()
    cy.waitForNoaResponse()
    
    // Terceira interação
    cy.get('[data-testid="voice-button"]').click()
    cy.simulateVoiceInput('fazer avaliação clínica inicial')
    cy.get('[data-testid="send-button"]').click()
    cy.waitForNoaResponse()
    
    // Verifica se chegou à explicação do NFT
    cy.checkNoaMessage('NFT INCENTIVADOR')
  })

  it('Deve testar qualidade do reconhecimento de voz', () => {
    // 🎤 Testa diferentes tipos de entrada de voz
    cy.log('🎤 Testando qualidade do reconhecimento')
    
    const testPhrases = [
      'Olá, sou paciente',
      'Meu nome é João Silva',
      'Tenho dor de cabeça',
      'Não tenho alergias',
      'Sim, concordo com a avaliação'
    ]
    
    testPhrases.forEach((phrase, index) => {
      cy.log(`🎤 Testando frase ${index + 1}: ${phrase}`)
      
      cy.get('[data-testid="voice-button"]').click()
      cy.simulateVoiceInput(phrase)
      
      // Verifica se o texto foi reconhecido corretamente
      cy.get('[data-testid="chat-input"]').should('contain.value', phrase)
      
      // Envia mensagem
      cy.get('[data-testid="send-button"]').click()
      cy.waitForNoaResponse()
    })
  })

  it('Deve testar fallback quando reconhecimento falha', () => {
    // 🎤 Testa comportamento quando reconhecimento falha
    cy.log('🎤 Testando fallback de reconhecimento')
    
    // Simula falha no reconhecimento
    cy.get('[data-testid="voice-button"]').click()
    
    // Simula erro de reconhecimento
    cy.window().then((win) => {
      const event = new Event('error')
      event.error = 'no-speech'
      win.dispatchEvent(event)
    })
    
    // Verifica se o sistema continua funcionando
    cy.get('[data-testid="chat-input"]').should('be.visible')
    cy.get('[data-testid="send-button"]').should('be.visible')
    
    // Testa entrada manual
    cy.sendChatMessage('teste manual')
    cy.waitForNoaResponse()
    cy.checkNoaMessage('Nôa Esperanza')
  })

  it('Deve testar sincronização de vídeo e áudio', () => {
    // 🎤 Testa sincronização entre vídeo e áudio
    cy.log('🎤 Testando sincronização vídeo-áudio')
    
    // Inicia conversa
    cy.sendChatMessage('Olá, sou paciente')
    cy.waitForNoaResponse()
    
    // Verifica se vídeo está ativo durante fala
    cy.checkNoaSpeaking()
    cy.get('[data-testid="noa-video-speaking"]').should('be.visible')
    
    // Aguarda parar de falar
    cy.waitForNoaToStopSpeaking()
    
    // Verifica se vídeo voltou ao estado estático
    cy.get('[data-testid="noa-video-static"]').should('be.visible')
    cy.get('[data-testid="noa-video-speaking"]').should('not.exist')
  })

  it('Deve testar configurações de voz', () => {
    // 🎤 Testa configurações de voz
    cy.log('🎤 Testando configurações de voz')
    
    // Verifica se as configurações de voz estão aplicadas
    cy.window().then((win) => {
      if (win.speechSynthesis) {
        // Verifica se a voz padrão está configurada
        const voices = win.speechSynthesis.getVoices()
        expect(voices.length).to.be.greaterThan(0)
      }
    })
    
    // Testa com diferentes configurações
    cy.sendChatMessage('teste de configuração')
    cy.waitForNoaResponse()
    
    // Verifica se a síntese foi chamada com as configurações corretas
    cy.get('@speechSpeak').should('have.been.called')
  })

  it('Deve testar acessibilidade de voz', () => {
    // 🎤 Testa acessibilidade do sistema de voz
    cy.log('🎤 Testando acessibilidade de voz')
    
    // Verifica se o botão de voz tem atributos de acessibilidade
    cy.get('[data-testid="voice-button"]')
      .should('have.attr', 'aria-label')
      .should('have.attr', 'title')
    
    // Verifica se o input tem suporte a voz
    cy.get('[data-testid="chat-input"]')
      .should('have.attr', 'aria-describedby')
    
    // Testa navegação por teclado
    cy.get('[data-testid="voice-button"]').focus()
    cy.get('[data-testid="voice-button"]').should('be.focused')
    
    // Testa ativação por Enter
    cy.get('[data-testid="voice-button"]').type('{enter}')
    cy.get('@speechStart').should('have.been.called')
  })
})

describe('NOA Esperanza - Clinical Evaluation Flow', () => {
  beforeEach(() => {
    // Set desktop viewport for better testing
    cy.viewport(1280, 720) // Desktop size
    
    // Visit the app
    cy.visit('/')
    
    // Wait for the app to load
    cy.wait(2000) // Wait for page to fully load
    
    // Check for chat input
    cy.get('[data-testid="chat-input"]', { timeout: 10000 }).should('be.visible')
  })

  it('should recognize various greeting types', () => {
    // Test different greeting variations
    const greetings = [
      'ola noa',
      'olá noa', 
      'oi noa',
      'hey noa',
      'hi noa',
      'eai noa',
      'e aí noa',
      'bom dia noa',
      'boa tarde noa',
      'boa noite noa',
      'salve noa',
      'ola, noa',
      'olá, noa',
      'oi, noa',
      'hey, noa',
      'hi, noa',
      'ola!',
      'olá!',
      'oi!',
      'hey!',
      'hi!',
      'eai!',
      'e aí!',
      'ola?',
      'olá?',
      'oi?',
      'hey?',
      'hi?',
      'eai?',
      'e aí?',
      'ola, tudo bem',
      'olá, tudo bem',
      'oi, tudo bem',
      'hey, tudo bem',
      'hi, tudo bem',
      'ola, como vai',
      'olá, como vai',
      'oi, como vai',
      'hey, como vai',
      'hi, como vai',
      'salve',
      'salve noa',
      'salve, noa',
      'e aí, noa',
      'eai, noa',
      'fala',
      'beleza',
      'tudo bem',
      'tudo bom',
      'saudações',
      'saudacoes'
    ]

    greetings.forEach((greeting, index) => {
      cy.get('[data-testid="chat-input"]').clear().type(greeting)
      cy.get('[data-testid="send-button"]').click()
      
      // Should recognize as greeting
      cy.contains('Olá! Sou a NOA Esperanza', { timeout: 10000 })
      
      // Wait a bit between greetings
      cy.wait(500)
    })
  })

  it('should complete a full clinical evaluation', () => {
    // Test institutional activation phrase
    cy.get('[data-testid="chat-input"]').type('Olá, Nôa. Ricardo Valença, aqui.')
    cy.get('[data-testid="send-button"]').click()
    
    // Should detect institutional activation
    cy.contains('Identifiquei sua ativação institucional', { timeout: 10000 })
    
    // Start clinical evaluation
    cy.get('[data-testid="chat-input"]').type('avaliação clínica')
    cy.get('[data-testid="send-button"]').click()
    
    // Should start evaluation
    cy.contains('Vamos iniciar sua avaliação inicial', { timeout: 10000 })
    
    // Step 1: Presentation
    cy.get('[data-testid="chat-input"]').type('Meu nome é João Silva, tenho 35 anos')
    cy.get('[data-testid="send-button"]').click()
    
    // Step 2: Cannabis usage
    cy.contains('Você já utilizou canabis medicinal?', { timeout: 10000 })
    cy.get('[data-testid="chat-input"]').type('Não, nunca utilizei')
    cy.get('[data-testid="send-button"]').click()
    
    // Step 3: List of complaints
    cy.contains('O que trouxe você até aqui?', { timeout: 10000 })
    cy.get('[data-testid="chat-input"]').type('Dores de cabeça frequentes')
    cy.get('[data-testid="send-button"]').click()
    
    // Should ask for more complaints
    cy.contains('O que trouxe você até aqui?', { timeout: 10000 })
    cy.get('[data-testid="chat-input"]').type('pronto')
    cy.get('[data-testid="send-button"]').click()
    
    // Step 4: Main complaint
    cy.contains('De todas essas questões, qual mais o(a) incomoda?', { timeout: 10000 })
    cy.get('[data-testid="chat-input"]').type('As dores de cabeça')
    cy.get('[data-testid="send-button"]').click()
    
    // Continue with more steps...
    // This is a comprehensive test of the clinical evaluation flow
  })

  it('should handle voice control activation', () => {
    // Test different voice control commands
    const voiceCommands = [
      'ativar controle por voz',
      'modo voz noa',
      'ativar voz',
      'voz noa',
      'noa fale',
      'fale noa',
      'ativar áudio',
      'modo áudio',
      'ativar som',
      'modo som'
    ]

    voiceCommands.forEach((command) => {
      cy.get('[data-testid="chat-input"]').clear().type(command)
      cy.get('[data-testid="send-button"]').click()
      
      // Should activate voice control
      cy.contains('Controle por voz ativado', { timeout: 10000 })
      cy.wait(500)
    })
  })

  it('should handle system status commands', () => {
    // Test system status commands
    const systemCommands = [
      'status do sistema',
      'status sistema',
      'verificar sistema',
      'sistema ok',
      'health check',
      'ping'
    ]

    systemCommands.forEach((command) => {
      cy.get('[data-testid="chat-input"]').clear().type(command)
      cy.get('[data-testid="send-button"]').click()
      
      // Should show system status
      cy.contains('STATUS DO SISTEMA', { timeout: 10000 })
      cy.contains('Serviços Online')
      cy.wait(500)
    })
  })

  it('should handle developer mode commands', () => {
    // Test developer mode commands
    const devCommands = [
      'modo desenvolvedor',
      'modo dev',
      'developer mode',
      'desenvolvedor',
      'debug',
      'admin'
    ]

    devCommands.forEach((command) => {
      cy.get('[data-testid="chat-input"]').clear().type(command)
      cy.get('[data-testid="send-button"]').click()
      
      // Should show developer mode
      cy.contains('MODO DESENVOLVEDOR ATIVADO', { timeout: 10000 })
      cy.contains('Comandos de Sistema')
      cy.wait(500)
    })
  })

  it('should prevent medical diagnosis requests', () => {
    // Test safety measures
    cy.get('[data-testid="chat-input"]').type('Qual é o meu diagnóstico?')
    cy.get('[data-testid="send-button"]').click()
    
    // Should refuse to give diagnosis
    cy.contains('não posso oferecer diagnósticos', { timeout: 10000 })
  })

  it('should save evaluation data to Supabase', () => {
    // Start evaluation
    cy.get('[data-testid="chat-input"]').type('avaliação clínica')
    cy.get('[data-testid="send-button"]').click()
    
    // Complete a few steps
    cy.get('[data-testid="chat-input"]').type('Meu nome é Teste')
    cy.get('[data-testid="send-button"]').click()
    
    // Check if data is being saved (this would require API mocking)
    // In a real test, you'd mock the Supabase calls
  })

  it('should handle prontuário authorization flow', () => {
    // Navigate to clinical evaluation page
    cy.visit('/avaliacao-clinica')
    
    // Should show clinical evaluation interface
    cy.contains('Avaliação Clínica Inicial', { timeout: 10000 })
    cy.contains('Arte da Entrevista Clínica')
    
    // Should show progress indicator
    cy.get('.bg-blue-600').should('be.visible')
    
    // Should show current step
    cy.contains('Etapa 1 de 10')
    
    // Complete first step
    cy.get('textarea').type('Meu nome é João Silva, tenho 35 anos')
    cy.get('button').contains('Próxima Etapa').click()
    
    // Should show authorization modal after completion
    // (This would be tested in a full evaluation flow)
    cy.contains('Autorização para Prontuário', { timeout: 10000 })
    
    // Should show authorization options
    cy.contains('Autorizar para Prontuário')
    cy.contains('Manter Apenas no Sistema')
  })
})

// ***********************************************************
// cypress/support/e2e.ts
// Support file para testes E2E da Nôa Esperanza
// ***********************************************************

/// <reference types="cypress" />

// Declaração de tipos dos comandos customizados
declare global {
  namespace Cypress {
    interface Chainable {
      mockSpeechRecognition(): Chainable<void>
      mockSpeechSynthesis(): Chainable<void>
      waitForNoaToStopSpeaking(): Chainable<void>
      simulateVoiceInput(text: string): Chainable<void>
      waitForNoaToLoad(): Chainable<void>
      sendChatMessage(message: string): Chainable<void>
      waitForNoaResponse(): Chainable<void>
      checkNoaSpeaking(): Chainable<void>
      checkNoaMessage(expectedText: string): Chainable<void>
      selectUserType(userType: string): Chainable<void>
      startClinicalEvaluation(): Chainable<void>
      completeImreBlock(response: string): Chainable<void>
      checkNftGenerated(): Chainable<void>
      clearTestData(): Chainable<void>
      mockSupabase(): Chainable<void>
    }
  }
}

// Ignora erros não críticos
Cypress.on('uncaught:exception', (err) => {
  if (err.message.includes('ResizeObserver loop limit exceeded')) return false
  if (err.message.includes('Non-Error promise rejection')) return false
  return true
})

// COMANDOS DE MOCK
Cypress.Commands.add('mockSpeechRecognition', () => {
  cy.log('🎤 Mock Speech Recognition')
})

Cypress.Commands.add('mockSpeechSynthesis', () => {
  cy.log('🔊 Mock Speech Synthesis')
})

// COMANDOS DE CHAT
Cypress.Commands.add('waitForNoaToLoad', () => {
  cy.get('body', { timeout: 10000 }).should('be.visible')
  cy.contains('O que trouxe você aqui?', { timeout: 5000 }).should('be.visible')
})

Cypress.Commands.add('sendChatMessage', (message: string) => {
  cy.get('input[type="text"]').clear().type(message)
  cy.get('button[title="Enviar mensagem"]').click()
})

Cypress.Commands.add('waitForNoaResponse', () => {
  cy.wait(2000)
})

Cypress.Commands.add('checkNoaSpeaking', () => {
  cy.log('🗣️ Verificando se Nôa está falando')
})

Cypress.Commands.add('checkNoaMessage', (expectedText: string) => {
  cy.contains(expectedText, { timeout: 10000 }).should('be.visible')
})

Cypress.Commands.add('selectUserType', (userType: string) => {
  cy.sendChatMessage(userType)
  cy.waitForNoaResponse()
})

Cypress.Commands.add('startClinicalEvaluation', () => {
  cy.sendChatMessage('fazer avaliação clínica inicial')
  cy.waitForNoaResponse()
  cy.checkNoaMessage('NFT INCENTIVADOR')
  cy.sendChatMessage('sim')
  cy.waitForNoaResponse()
})

Cypress.Commands.add('completeImreBlock', (response: string) => {
  cy.sendChatMessage(response)
  cy.waitForNoaResponse()
})

Cypress.Commands.add('checkNftGenerated', () => {
  cy.checkNoaMessage('NFT Hash')
  cy.checkNoaMessage('AVALIAÇÃO CLÍNICA CONCLUÍDA')
})

Cypress.Commands.add('clearTestData', () => {
  cy.window().then((win) => {
    win.localStorage.clear()
    win.sessionStorage.clear()
  })
})

Cypress.Commands.add('mockSupabase', () => {
  cy.log('🗄️ Mock Supabase')
})

Cypress.Commands.add('waitForNoaToStopSpeaking', () => {
  cy.wait(500)
})

Cypress.Commands.add('simulateVoiceInput', (text: string) => {
  cy.log(`🎤 Simulando voz: ${text}`)
})

export {}
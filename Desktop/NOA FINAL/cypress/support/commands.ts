// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// Custom commands for NOA Esperanza

Cypress.Commands.add('loginAsInstitutional', () => {
  cy.get('[data-testid="chat-input"]').type('Olá, Nôa. Ricardo Valença, aqui.')
  cy.get('[data-testid="send-button"]').click()
  cy.contains('Identifiquei sua ativação institucional', { timeout: 10000 })
})

Cypress.Commands.add('loginAsRegular', () => {
  cy.get('[data-testid="chat-input"]').type('Olá, sou um novo usuário')
  cy.get('[data-testid="send-button"]').click()
  cy.contains('Bem-vindo', { timeout: 10000 })
})

Cypress.Commands.add('startClinicalEvaluation', () => {
  cy.get('[data-testid="chat-input"]').type('avaliação clínica')
  cy.get('[data-testid="send-button"]').click()
  cy.contains('Vamos iniciar sua avaliação inicial', { timeout: 10000 })
})

Cypress.Commands.add('waitForAIResponse', () => {
  // Wait for AI response to complete
  cy.get('[data-testid="ai-message"]', { timeout: 15000 }).should('be.visible')
  cy.get('[data-testid="typing-indicator"]').should('not.exist')
})

Cypress.Commands.add('shouldBeFromAI', () => {
  cy.get('[data-testid="ai-message"]').should('be.visible')
  cy.get('[data-testid="ai-avatar"]').should('be.visible')
})

// Override default commands
Cypress.Commands.overwrite('visit', (originalFn, url, options) => {
  // Add custom logic before visiting
  return originalFn(url, {
    ...options,
    onBeforeLoad: (win) => {
      // Mock environment variables if needed
      win.localStorage.setItem('test-mode', 'true')
    }
  })
})

// Custom command to clear chat history
Cypress.Commands.add('clearChatHistory', () => {
  cy.window().then((win) => {
    win.localStorage.removeItem('chat-history')
    win.sessionStorage.clear()
  })
})

// Custom command to mock Supabase responses
Cypress.Commands.add('mockSupabaseResponse', (table, response) => {
  cy.intercept('POST', `**/rest/v1/${table}`, {
    statusCode: 200,
    body: response
  }).as(`mock${table}`)
})

// Custom command to check accessibility
Cypress.Commands.add('checkA11y', () => {
  cy.injectAxe()
  cy.checkA11y()
})

// Custom command to take screenshot with timestamp
Cypress.Commands.add('takeTimestampedScreenshot', (name) => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  cy.screenshot(`${name}-${timestamp}`)
})

// Extend Cypress types
declare global {
  namespace Cypress {
    interface Chainable {
      clearChatHistory(): Chainable<void>
      mockSupabaseResponse(table: string, response: any): Chainable<void>
      checkA11y(): Chainable<void>
      takeTimestampedScreenshot(name: string): Chainable<void>
    }
  }
}

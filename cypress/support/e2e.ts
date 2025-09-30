// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Global configuration
Cypress.on('uncaught:exception', (err, runnable) => {
  // Prevent Cypress from failing on uncaught exceptions
  // that are not related to the application being tested
  if (err.message.includes('ResizeObserver loop limit exceeded')) {
    return false
  }
  if (err.message.includes('Non-Error promise rejection')) {
    return false
  }
  return true
})

// Custom commands for NOA Esperanza
declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to login as institutional user
       * @example cy.loginAsInstitutional()
       */
      loginAsInstitutional(): Chainable<void>
      
      /**
       * Custom command to login as regular user
       * @example cy.loginAsRegular()
       */
      loginAsRegular(): Chainable<void>
      
      /**
       * Custom command to start clinical evaluation
       * @example cy.startClinicalEvaluation()
       */
      startClinicalEvaluation(): Chainable<void>
      
      /**
       * Custom command to wait for AI response
       * @example cy.waitForAIResponse()
       */
      waitForAIResponse(): Chainable<void>
      
      /**
       * Custom command to check if message is from AI
       * @example cy.shouldBeFromAI()
       */
      shouldBeFromAI(): Chainable<void>
    }
  }
}

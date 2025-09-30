/// <reference types="cypress" />

declare namespace Cypress {
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

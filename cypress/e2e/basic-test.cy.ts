// 🎯 TESTE BÁSICO - VERIFICAR SE O APP ESTÁ FUNCIONANDO
describe('Teste Básico - NOA Esperanza', () => {
  beforeEach(() => {
    // Visita a página inicial
    cy.visit('/')
    
    // Aguarda a página carregar
    cy.wait(3000)
  })

  it('Deve carregar a página inicial', () => {
    // Verifica se a página carregou
    cy.get('body').should('be.visible')
    
    // Verifica se tem o título da NOA
    cy.contains('NOA Esperanza', { timeout: 10000 }).should('be.visible')
    
    // Verifica se tem o chat
    cy.get('textarea, input[type="text"]').should('be.visible')
  })

  it('Deve permitir digitar no chat', () => {
    // Procura por qualquer campo de input
    cy.get('textarea, input[type="text"]').first().type('Olá NOA')
    
    // Verifica se o texto foi digitado
    cy.get('textarea, input[type="text"]').first().should('have.value', 'Olá NOA')
  })

  it('Deve ter botão de enviar', () => {
    // Procura por botão de enviar
    cy.get('button').contains('Enviar').should('be.visible')
  })

  it('Deve mostrar cards de funcionalidades', () => {
    // Verifica se tem cards de funcionalidades
    cy.get('[class*="card"], [class*="bubble"]').should('have.length.greaterThan', 0)
  })
})

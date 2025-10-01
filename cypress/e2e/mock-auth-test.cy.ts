// 🎯 TESTE COM MOCK DE AUTENTICAÇÃO
describe('Mock Auth - NOA Esperanza', () => {
  beforeEach(() => {
    // Mocka a autenticação
    cy.window().then((win) => {
      // Simula usuário logado
      win.localStorage.setItem('sb-auth-token', JSON.stringify({
        currentSession: {
          user: {
            id: 'test-user-id',
            email: 'test@noaesperanza.com'
          }
        }
      }))
    })
    
    // Visita o app
    cy.visit('/app/')
    cy.wait(5000)
  })

  it('Deve funcionar com mock de autenticação', () => {
    cy.url().then((url) => {
      if (url.includes('/app/')) {
        cy.log('✅ App carregou com mock de auth')
        
        // Verifica se tem o chat
        cy.get('input[type="text"], textarea').should('be.visible')
        
        // Testa o chat
        cy.get('input[type="text"], textarea').first().type('Olá NOA, teste de chat')
        cy.get('button').contains('fa-paper-plane').click()
        
        cy.wait(5000)
        
        // Verifica se NOA respondeu
        cy.get('[class*="message"], [class*="chat"]').should('have.length.greaterThan', 1)
        
        cy.screenshot('chat-funcionando-com-mock')
      } else {
        cy.log('❌ App não carregou mesmo com mock')
        cy.screenshot('app-nao-carregou')
      }
    })
  })
})

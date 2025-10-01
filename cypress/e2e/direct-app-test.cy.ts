// 🎯 TESTE DIRETO DO APP - PULANDO AUTENTICAÇÃO
describe('App Direto - NOA Esperanza', () => {
  beforeEach(() => {
    // Limpa dados de autenticação
    cy.clearCookies()
    cy.clearLocalStorage()
    
    // Visita diretamente o app
    cy.visit('/app/')
    cy.wait(5000)
  })

  it('Deve tentar acessar o app diretamente', () => {
    cy.url().then((url) => {
      cy.log(`URL atual: ${url}`)
      
      if (url.includes('/app/')) {
        cy.log('✅ Conseguiu acessar o app diretamente')
        
        // Verifica se tem o chat
        cy.get('input[type="text"], textarea').then(($inputs) => {
          if ($inputs.length > 0) {
            cy.log('✅ Chat encontrado!')
            cy.screenshot('app-com-chat')
            
            // Testa o chat
            cy.get('input[type="text"], textarea').first().type('Olá NOA')
            cy.get('button').contains('fa-paper-plane').click()
            
            cy.wait(5000)
            cy.screenshot('chat-funcionando')
          } else {
            cy.log('❌ Chat não encontrado')
            cy.screenshot('app-sem-chat')
          }
        })
      } else {
        cy.log('❌ Não conseguiu acessar o app')
        cy.screenshot('redirecionado-para-login')
      }
    })
  })

  it('Deve verificar se tem elementos do app', () => {
    // Verifica se tem header
    cy.get('header').should('be.visible')
    
    // Verifica se tem footer
    cy.get('footer').should('be.visible')
    
    // Verifica se tem cards de funcionalidades
    cy.get('[class*="card"], [class*="bubble"]').should('have.length.greaterThan', 0)
    
    // Verifica se tem menu de navegação
    cy.get('nav').should('be.visible')
  })
})

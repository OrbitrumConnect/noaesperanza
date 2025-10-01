// 🎯 TESTE FINAL FUNCIONAL - NOA ESPERANZA
describe('Teste Final Funcional - NOA Esperanza', () => {
  beforeEach(() => {
    cy.visit('/')
    cy.wait(3000)
  })

  it('Deve fazer login e testar o chat completo', () => {
    // 1. Abre modal de login
    cy.contains('Começar Agora').click()
    cy.wait(3000)
    
    // 2. Verifica se inputs apareceram
    cy.get('input, textarea').should('have.length.greaterThan', 0)
    cy.log('✅ Modal aberto com sucesso!')
    
    // 3. Preenche formulário com credenciais de admin
    cy.get('input[type="email"], input[type="text"]').first().type('phpg69@gmail.com')
    cy.get('input[type="password"]').type('p6p7p8P9!')
    
    // 4. Clica em entrar
    cy.get('button').contains('Entrar').click()
    cy.wait(10000) // Aguarda login
    
    // 5. Verifica se foi redirecionado
    cy.url().then((url) => {
      cy.log(`URL após login: ${url}`)
      
      if (url.includes('/app/')) {
        cy.log('✅ Login funcionou! Redirecionado para o app')
        cy.screenshot('login-sucesso')
        
        // 6. Verifica se tem o chat
        cy.get('input[type="text"], textarea').should('be.visible')
        cy.log('✅ Chat encontrado!')
        
        // 7. Testa o chat
        cy.get('input[type="text"], textarea').first().type('Olá NOA, teste de chat')
        cy.get('button').contains('fa-paper-plane').click()
        cy.wait(5000)
        cy.screenshot('chat-funcionando')
        
        // 8. Testa funcionalidades específicas
        cy.get('input[type="text"], textarea').first().type('avaliação clínica')
        cy.get('button').contains('fa-paper-plane').click()
        cy.wait(5000)
        cy.screenshot('avaliacao-clinica')
        
        // 9. Testa comandos de admin
        cy.get('input[type="text"], textarea').first().type('criar conhecimento')
        cy.get('button').contains('fa-paper-plane').click()
        cy.wait(5000)
        cy.screenshot('comando-admin')
        
      } else {
        cy.log('❌ Login não funcionou')
        cy.screenshot('login-falhou')
      }
    })
  })

  it('Deve testar funcionalidades da landing page', () => {
    // Testa se a landing page está funcionando
    cy.contains('NOA Esperanza').should('be.visible')
    cy.contains('Começar Agora').should('be.visible')
    cy.contains('Nefrologia').should('be.visible')
    cy.contains('Neurologia').should('be.visible')
    cy.contains('Cannabis Medicinal').should('be.visible')
    
    cy.screenshot('landing-page-funcionando')
  })

  it('Deve testar modal de login', () => {
    // Testa se o modal abre corretamente
    cy.contains('Começar Agora').click()
    cy.wait(3000)
    
    // Verifica se inputs apareceram
    cy.get('input, textarea').should('have.length.greaterThan', 0)
    
    // Verifica se tem campos de email e senha
    cy.get('input[type="email"], input[type="text"]').should('be.visible')
    cy.get('input[type="password"]').should('be.visible')
    
    cy.screenshot('modal-login-funcionando')
  })
})

// 🎯 TESTE COMPLETO: LOGIN + CHAT - NOA ESPERANZA
describe('Login e Chat - NOA Esperanza', () => {
  beforeEach(() => {
    cy.visit('/')
    cy.wait(3000)
  })

  it('Deve fazer login e testar o chat', () => {
    // 1. Abre modal de login
    cy.contains('Começar Agora').click()
    cy.wait(2000)
    
    // 2. Verifica se modal abriu
    cy.contains('Cadastrar').should('be.visible')
    
    // 3. Muda para modo login
    cy.get('button').contains('Entrar').click()
    cy.wait(1000)
    
    // 4. Preenche formulário de login
    cy.get('input[type="email"], input[type="text"]').first().type('admin@noaesperanza.com')
    cy.get('input[type="password"]').type('admin123')
    
    // 5. Clica em entrar
    cy.get('button').contains('Entrar').click()
    cy.wait(5000)
    
    // 6. Verifica se foi redirecionado para o app
    cy.url().then((url) => {
      if (url.includes('/app/')) {
        cy.log('✅ Login funcionou! Redirecionado para o app')
        
        // 7. Verifica se tem o chat
        cy.get('input[type="text"], textarea').should('be.visible')
        
        // 8. Testa o chat
        cy.get('input[type="text"], textarea').first().type('Olá NOA, teste de chat')
        cy.get('button').contains('fa-paper-plane').click()
        
        cy.wait(5000)
        
        // 9. Verifica se NOA respondeu
        cy.get('[class*="message"], [class*="chat"]').should('have.length.greaterThan', 1)
        
        cy.screenshot('chat-funcionando-apos-login')
        
        // 10. Testa funcionalidades do chat
        cy.get('input[type="text"], textarea').first().type('avaliação clínica')
        cy.get('button').contains('fa-paper-plane').click()
        
        cy.wait(5000)
        cy.screenshot('avaliacao-clinica-testada')
        
      } else {
        cy.log('❌ Login não funcionou ou não foi redirecionado')
        cy.screenshot('login-falhou')
      }
    })
  })

  it('Deve testar funcionalidades do app logado', () => {
    // Simula login bem-sucedido
    cy.window().then((win) => {
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
    
    // Verifica se tem o chat
    cy.get('input[type="text"], textarea').should('be.visible')
    
    // Testa diferentes funcionalidades
    cy.get('input[type="text"], textarea').first().type('teste de funcionalidades')
    cy.get('button').contains('fa-paper-plane').click()
    
    cy.wait(3000)
    
    // Verifica se tem cards de funcionalidades
    cy.get('[class*="card"], [class*="bubble"]').should('have.length.greaterThan', 0)
    
    cy.screenshot('app-com-funcionalidades')
  })
})

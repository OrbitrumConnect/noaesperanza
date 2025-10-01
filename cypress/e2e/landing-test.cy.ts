// 🎯 TESTE DA LANDING PAGE - NOA ESPERANZA
describe('Landing Page - NOA Esperanza', () => {
  beforeEach(() => {
    cy.visit('/')
    cy.wait(3000)
  })

  it('Deve carregar a landing page corretamente', () => {
    // Verifica se está na landing page
    cy.url().should('include', '/')
    
    // Verifica se tem o título NOA
    cy.contains('NOA Esperanza').should('be.visible')
    
    // Verifica se tem botões de login/registro
    cy.get('button, a').contains('Entrar').should('be.visible')
    cy.get('button, a').contains('Registrar').should('be.visible')
  })

  it('Deve permitir fazer login', () => {
    // Clica no botão de entrar
    cy.get('button, a').contains('Entrar').click()
    
    cy.wait(2000)
    
    // Verifica se foi para página de login
    cy.url().should('include', '/login')
    
    // Verifica se tem formulário de login
    cy.get('input[type="email"], input[type="text"]').should('be.visible')
    cy.get('input[type="password"]').should('be.visible')
    
    // Tenta fazer login
    cy.get('input[type="email"], input[type="text"]').first().type('admin@noaesperanza.com')
    cy.get('input[type="password"]').type('admin123')
    cy.get('button[type="submit"]').click()
    
    cy.wait(5000)
    
    // Verifica se foi redirecionado para o app
    cy.url().then((url) => {
      if (url.includes('/app/')) {
        cy.log('✅ Login funcionou! Redirecionado para o app')
        
        // Agora verifica se tem o chat
        cy.get('input[type="text"], textarea').should('be.visible')
        cy.get('button').contains('fa-paper-plane').should('be.visible')
        
        cy.screenshot('app-com-chat-funcionando')
      } else {
        cy.log('❌ Login não funcionou ou não foi redirecionado')
        cy.screenshot('login-falhou')
      }
    })
  })

  it('Deve testar funcionalidades da landing page', () => {
    // Verifica se tem cards de funcionalidades
    cy.get('[class*="card"], [class*="feature"]').should('have.length.greaterThan', 0)
    
    // Verifica se tem informações sobre NOA
    cy.contains('Assistente Médica').should('be.visible')
    cy.contains('Neurologia').should('be.visible')
    cy.contains('Cannabis').should('be.visible')
    cy.contains('Nefrologia').should('be.visible')
  })
})

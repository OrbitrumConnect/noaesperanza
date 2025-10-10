// 🎯 TESTE DE AUTENTICAÇÃO - VERIFICAR SE PRECISA FAZER LOGIN
describe('Autenticação - NOA Esperanza', () => {
  it('Deve verificar se precisa fazer login', () => {
    cy.visit('/')
    cy.wait(5000)
    
    // Verifica se está na página de login
    cy.url().then((url) => {
      cy.log(`URL atual: ${url}`)
      
      if (url.includes('/login') || url.includes('/landing')) {
        cy.log('Usuário foi redirecionado para login/landing')
        
        // Verifica se tem formulário de login
        cy.get('input[type="email"], input[type="text"]').then(($inputs) => {
          if ($inputs.length > 0) {
            cy.log('Formulário de login encontrado')
            
            // Tenta fazer login com credenciais de teste
            cy.get('input[type="email"], input[type="text"]').first().type('admin@noaesperanza.com')
            cy.get('input[type="password"]').type('admin123')
            cy.get('button[type="submit"], button').contains('Entrar').click()
            
            cy.wait(5000)
            
            // Verifica se foi redirecionado para o app
            cy.url().then((newUrl) => {
              cy.log(`URL após login: ${newUrl}`)
            })
          } else {
            cy.log('Nenhum formulário de login encontrado')
          }
        })
      } else {
        cy.log('Usuário não foi redirecionado para login')
      }
    })
  })
  
  it('Deve tentar acessar diretamente o app', () => {
    // Tenta acessar diretamente a página do app
    cy.visit('/app/')
    cy.wait(5000)
    
    cy.url().then((url) => {
      cy.log(`URL do app: ${url}`)
      
      if (url.includes('/app/')) {
        cy.log('Conseguiu acessar o app')
        
        // Verifica se tem o chat
        cy.get('input[type="text"], textarea').then(($inputs) => {
          if ($inputs.length > 0) {
            cy.log('Chat encontrado no app!')
            cy.screenshot('app-com-chat')
          } else {
            cy.log('Chat não encontrado no app')
            cy.screenshot('app-sem-chat')
          }
        })
      } else {
        cy.log('Não conseguiu acessar o app')
        cy.screenshot('redirecionado-para-login')
      }
    })
  })
})

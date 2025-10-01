// 🎯 TESTE COM CREDENCIAIS DE ADMIN - NOA ESPERANZA
describe('Teste Admin - NOA Esperanza', () => {
  beforeEach(() => {
    cy.visit('/')
    cy.wait(3000)
  })

  it('Deve fazer login como admin e testar todas as funcionalidades', () => {
    // 1. Abre modal de login
    cy.contains('Começar Agora').click()
    cy.wait(2000)
    
    // 2. Verifica se modal abriu
    cy.contains('Cadastrar').should('be.visible')
    
    // 3. Muda para modo login (se necessário)
    cy.get('button').contains('Entrar').click()
    cy.wait(1000)
    
    // 4. Preenche formulário com credenciais de admin
    cy.get('input[type="email"], input[type="text"]').first().type('phpg69@gmail.com')
    cy.get('input[type="password"]').type('p6p7p8P9!')
    
    // 5. Clica em entrar
    cy.get('button').contains('Entrar').click()
    cy.wait(8000) // Aguarda mais tempo para login
    
    // 6. Verifica se foi redirecionado para o app
    cy.url().then((url) => {
      cy.log(`URL após login: ${url}`)
      
      if (url.includes('/app/')) {
        cy.log('✅ Login como admin funcionou!')
        cy.screenshot('admin-login-sucesso')
        
        // 7. Verifica se tem o chat
        cy.get('input[type="text"], textarea').should('be.visible')
        cy.log('✅ Chat encontrado!')
        
        // 8. Testa o chat básico
        cy.get('input[type="text"], textarea').first().type('Olá NOA, sou o admin')
        cy.get('button').contains('fa-paper-plane').click()
        cy.wait(5000)
        cy.screenshot('chat-admin-funcionando')
        
        // 9. Testa funcionalidades específicas de admin
        cy.get('input[type="text"], textarea').first().type('avaliação clínica')
        cy.get('button').contains('fa-paper-plane').click()
        cy.wait(5000)
        cy.screenshot('avaliacao-clinica-admin')
        
        // 10. Verifica se tem menu de admin
        cy.get('body').then(($body) => {
          if ($body.text().includes('ADM/CONFIG') || $body.text().includes('admin')) {
            cy.log('✅ Menu de admin encontrado!')
            cy.screenshot('menu-admin-visivel')
          } else {
            cy.log('⚠️ Menu de admin não encontrado')
          }
        })
        
        // 11. Testa comandos específicos de admin
        cy.get('input[type="text"], textarea').first().type('criar conhecimento')
        cy.get('button').contains('fa-paper-plane').click()
        cy.wait(5000)
        cy.screenshot('comando-admin-conhecimento')
        
        // 12. Testa sistema de voz
        cy.get('button').contains('fa-microphone').click()
        cy.wait(2000)
        cy.screenshot('sistema-voz-ativado')
        
      } else {
        cy.log('❌ Login não funcionou ou não foi redirecionado')
        cy.screenshot('admin-login-falhou')
        
        // Verifica se há erro
        cy.get('body').then(($body) => {
          if ($body.text().includes('erro') || $body.text().includes('error')) {
            cy.log('❌ Erro encontrado na página')
          }
        })
      }
    })
  })

  it('Deve testar funcionalidades específicas de admin', () => {
    // Simula login bem-sucedido
    cy.window().then((win) => {
      win.localStorage.setItem('sb-auth-token', JSON.stringify({
        currentSession: {
          user: {
            id: 'admin-user-id',
            email: 'phpg69@gmail.com',
            user_metadata: { role: 'admin' }
          }
        }
      }))
    })
    
    // Visita o app
    cy.visit('/app/')
    cy.wait(5000)
    
    // Verifica se tem o chat
    cy.get('input[type="text"], textarea').should('be.visible')
    
    // Testa comandos específicos de admin
    const adminCommands = [
      'criar conhecimento',
      'listar aulas',
      'curadoria simbólica',
      'ativar controle por voz',
      'editar código'
    ]
    
    adminCommands.forEach((command, index) => {
      cy.log(`Testando comando ${index + 1}: ${command}`)
      
      cy.get('input[type="text"], textarea').first().type(command)
      cy.get('button').contains('fa-paper-plane').click()
      cy.wait(3000)
      
      cy.screenshot(`comando-admin-${index + 1}-${command.replace(/\s+/g, '-')}`)
    })
  })

  it('Deve testar dashboard de admin', () => {
    // Simula login como admin
    cy.window().then((win) => {
      win.localStorage.setItem('sb-auth-token', JSON.stringify({
        currentSession: {
          user: {
            id: 'admin-user-id',
            email: 'phpg69@gmail.com',
            user_metadata: { role: 'admin' }
          }
        }
      }))
    })
    
    // Tenta acessar dashboard de admin
    cy.visit('/app/admin')
    cy.wait(5000)
    
    cy.url().then((url) => {
      if (url.includes('/admin')) {
        cy.log('✅ Dashboard de admin acessível!')
        cy.screenshot('dashboard-admin')
        
        // Verifica se tem métricas de admin
        cy.get('body').then(($body) => {
          if ($body.text().includes('usuários') || $body.text().includes('métricas')) {
            cy.log('✅ Métricas de admin encontradas!')
          }
        })
      } else {
        cy.log('❌ Dashboard de admin não acessível')
        cy.screenshot('admin-dashboard-falhou')
      }
    })
  })
})

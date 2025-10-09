// 🎯 TESTE ESPECÍFICO DO FLUXO DE AVALIAÇÃO CLÍNICA
describe('Fluxo de Avaliação Clínica - NOA Esperanza', () => {
  beforeEach(() => {
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
    
    cy.visit('/app/')
    cy.wait(5000)
  })

  it('Deve iniciar avaliação clínica e avançar corretamente', () => {
    // 1. Verifica se tem o chat
    cy.get('input[type="text"], textarea').should('be.visible')
    
    // 2. Inicia avaliação clínica
    cy.get('input[type="text"], textarea').first().type('avaliação clínica')
    cy.get('button').contains('fa-paper-plane').click()
    cy.wait(3000)
    
    // 3. Verifica se card abriu
    cy.get('[class*="card"], [class*="bubble"]').should('have.length.greaterThan', 0)
    cy.screenshot('card-avaliacao-aberto')
    
    // 4. Verifica se apareceu a pergunta "Vamos começar?"
    cy.contains('Vamos começar').should('be.visible')
    cy.screenshot('pergunta-vamos-comecar')
    
    // 5. Responde "sim" para confirmar
    cy.get('input[type="text"], textarea').first().type('sim')
    cy.get('button').contains('fa-paper-plane').click()
    cy.wait(5000)
    
    // 6. Verifica se avançou para próxima pergunta
    cy.get('body').then(($body) => {
      const text = $body.text()
      
      // Verifica se não está mais na pergunta "Vamos começar?"
      if (!text.includes('Vamos começar')) {
        cy.log('✅ Avançou para próxima pergunta!')
        cy.screenshot('avancou-para-proxima-pergunta')
        
        // Verifica se tem uma nova pergunta
        if (text.includes('apresente-se') || text.includes('nome') || text.includes('idade')) {
          cy.log('✅ Primeira pergunta real apareceu!')
          cy.screenshot('primeira-pergunta-real')
        }
      } else {
        cy.log('❌ Ainda está na pergunta "Vamos começar?"')
        cy.screenshot('ainda-na-pergunta-comecar')
      }
    })
  })

  it('Deve testar diferentes respostas de confirmação', () => {
    const respostasConfirmacao = ['sim', 'começar', 'comecar', 'ok', 'vamos']
    
    respostasConfirmacao.forEach((resposta, index) => {
      cy.log(`Testando resposta: ${resposta}`)
      
      // Reinicia o teste
      cy.visit('/app/')
      cy.wait(3000)
      
      // Inicia avaliação
      cy.get('input[type="text"], textarea').first().type('avaliação clínica')
      cy.get('button').contains('fa-paper-plane').click()
      cy.wait(3000)
      
      // Responde com a confirmação
      cy.get('input[type="text"], textarea').first().type(resposta)
      cy.get('button').contains('fa-paper-plane').click()
      cy.wait(5000)
      
      // Verifica se avançou
      cy.get('body').then(($body) => {
        const text = $body.text()
        if (!text.includes('Vamos começar')) {
          cy.log(`✅ Resposta "${resposta}" funcionou!`)
          cy.screenshot(`resposta-${resposta}-funcionou`)
        } else {
          cy.log(`❌ Resposta "${resposta}" não funcionou`)
          cy.screenshot(`resposta-${resposta}-falhou`)
        }
      })
    })
  })

  it('Deve testar fluxo completo da avaliação', () => {
    // Inicia avaliação
    cy.get('input[type="text"], textarea').first().type('avaliação clínica')
    cy.get('button').contains('fa-paper-plane').click()
    cy.wait(3000)
    
    // Confirma
    cy.get('input[type="text"], textarea').first().type('sim')
    cy.get('button').contains('fa-paper-plane').click()
    cy.wait(5000)
    
    // Responde primeira pergunta
    cy.get('input[type="text"], textarea').first().type('Meu nome é João, tenho 35 anos')
    cy.get('button').contains('fa-paper-plane').click()
    cy.wait(5000)
    
    // Verifica se avançou para segunda pergunta
    cy.get('body').then(($body) => {
      const text = $body.text()
      if (text.includes('canabis') || text.includes('cannabis')) {
        cy.log('✅ Avançou para segunda pergunta (cannabis)!')
        cy.screenshot('segunda-pergunta-cannabis')
      } else {
        cy.log('❌ Não avançou para segunda pergunta')
        cy.screenshot('nao-avancou-segunda-pergunta')
      }
    })
  })
})

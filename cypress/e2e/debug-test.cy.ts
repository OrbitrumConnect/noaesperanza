// 🎯 TESTE DE DEBUG - VERIFICAR ELEMENTOS ESPECÍFICOS
describe('Debug - NOA Esperanza', () => {
  beforeEach(() => {
    cy.visit('/')
    cy.wait(5000) // Aguarda mais tempo para carregar
  })

  it('Deve verificar se a página carregou completamente', () => {
    // Verifica se o body está visível
    cy.get('body').should('be.visible')
    
    // Verifica se tem o título NOA
    cy.contains('NOA Esperanza').should('be.visible')
    
    // Debug: mostra todos os inputs na página
    cy.get('input, textarea').then(($inputs) => {
      cy.log(`Encontrados ${$inputs.length} inputs/textarea`)
      $inputs.each((index, element) => {
        cy.log(`Input ${index}: ${element.tagName} - ${element.className}`)
      })
    })
    
    // Debug: mostra todos os botões na página
    cy.get('button').then(($buttons) => {
      cy.log(`Encontrados ${$buttons.length} botões`)
      $buttons.each((index, element) => {
        cy.log(`Botão ${index}: ${element.textContent} - ${element.className}`)
      })
    })
  })

  it('Deve verificar se o chat está visível', () => {
    // Procura por qualquer input de texto
    cy.get('input[type="text"]').should('be.visible')
    
    // Verifica se tem placeholder
    cy.get('input[type="text"]').should('have.attr', 'placeholder')
    
    // Verifica se pode digitar
    cy.get('input[type="text"]').type('Teste')
    cy.get('input[type="text"]').should('have.value', 'Teste')
  })

  it('Deve verificar botão de enviar', () => {
    // Procura por botão com ícone de avião
    cy.get('button').contains('fa-paper-plane').should('be.visible')
    
    // Ou procura por botão que tem onClick
    cy.get('button[onclick], button').should('have.length.greaterThan', 0)
  })
})

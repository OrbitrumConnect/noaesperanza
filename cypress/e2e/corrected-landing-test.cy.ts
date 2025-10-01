// 🎯 TESTE CORRIGIDO DA LANDING PAGE - NOA ESPERANZA
describe('Landing Page Corrigida - NOA Esperanza', () => {
  beforeEach(() => {
    cy.visit('/')
    cy.wait(3000)
  })

  it('Deve carregar a landing page corretamente', () => {
    // Verifica se está na landing page
    cy.url().should('include', '/')
    
    // Verifica se tem o título NOA
    cy.contains('NOA Esperanza').should('be.visible')
    
    // Verifica se tem o botão "Começar Agora"
    cy.contains('Começar Agora').should('be.visible')
    
    // Verifica se tem as especialidades
    cy.contains('Nefrologia').should('be.visible')
    cy.contains('Neurologia').should('be.visible')
    cy.contains('Cannabis Medicinal').should('be.visible')
  })

  it('Deve permitir abrir modal de login', () => {
    // Clica no botão "Começar Agora"
    cy.contains('Começar Agora').click()
    
    cy.wait(2000)
    
    // Verifica se o modal abriu
    cy.contains('Cadastrar').should('be.visible')
    
    // Verifica se tem campos de formulário
    cy.get('input[type="email"], input[type="text"]').should('be.visible')
    cy.get('input[type="password"]').should('be.visible')
    
    cy.screenshot('modal-login-aberto')
  })

  it('Deve testar funcionalidades da landing page', () => {
    // Verifica se tem cards de funcionalidades
    cy.contains('Chat Inteligente com NOA').should('be.visible')
    cy.contains('Telemedicina Avançada').should('be.visible')
    cy.contains('Gestão Completa').should('be.visible')
    
    // Verifica se tem informações sobre especialidades
    cy.contains('Especialistas em doenças renais').should('be.visible')
    cy.contains('Cuidados neurológicos especializados').should('be.visible')
    cy.contains('Tratamento com cannabis medicinal').should('be.visible')
  })

  it('Deve testar navegação entre especialidades', () => {
    // Verifica se tem botões de especialidade
    cy.get('button').contains('Nefrologia').should('be.visible')
    cy.get('button').contains('Neurologia').should('be.visible')
    cy.get('button').contains('Cannabis').should('be.visible')
    
    // Testa clicar em uma especialidade
    cy.get('button').contains('Neurologia').click()
    cy.wait(1000)
    
    // Verifica se mudou o conteúdo
    cy.contains('Cuidados neurológicos especializados').should('be.visible')
  })
})

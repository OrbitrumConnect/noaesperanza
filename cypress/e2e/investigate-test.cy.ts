// 🎯 TESTE DE INVESTIGAÇÃO - VER O QUE REALMENTE ESTÁ NA PÁGINA
describe('Investigar - NOA Esperanza', () => {
  it('Deve investigar o que está na página', () => {
    cy.visit('/')
    cy.wait(10000) // Aguarda 10 segundos
    
    // Captura screenshot para ver o que está na tela
    cy.screenshot('investigacao-pagina-inicial')
    
    // Verifica o título da página
    cy.title().then((title) => {
      cy.log(`Título da página: ${title}`)
    })
    
    // Verifica a URL atual
    cy.url().then((url) => {
      cy.log(`URL atual: ${url}`)
    })
    
    // Verifica se tem algum texto na página
    cy.get('body').then(($body) => {
      cy.log(`Conteúdo do body: ${$body.text().substring(0, 200)}...`)
    })
    
    // Verifica se tem elementos React
    cy.get('[data-reactroot], #root').should('exist')
    
    // Verifica se tem loading
    cy.get('body').then(($body) => {
      if ($body.text().includes('Carregando')) {
        cy.log('Página está em loading')
      } else {
        cy.log('Página não está em loading')
      }
    })
    
    // Verifica se tem erro
    cy.get('body').then(($body) => {
      if ($body.text().includes('erro') || $body.text().includes('error')) {
        cy.log('Página tem erro')
      } else {
        cy.log('Página não tem erro visível')
      }
    })
    
    // Verifica se tem login
    cy.get('body').then(($body) => {
      if ($body.text().includes('login') || $body.text().includes('entrar')) {
        cy.log('Página tem formulário de login')
      } else {
        cy.log('Página não tem formulário de login')
      }
    })
  })
})

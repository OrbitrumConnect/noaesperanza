// 🎯 TESTE DE DEBUG DO MODAL - NOA ESPERANZA
describe('Debug Modal - NOA Esperanza', () => {
  beforeEach(() => {
    cy.visit('/')
    cy.wait(3000)
  })

  it('Deve investigar o modal de login', () => {
    // Verifica se a página carregou
    cy.get('body').should('be.visible')
    
    // Verifica se tem o botão "Começar Agora"
    cy.contains('Começar Agora').should('be.visible')
    
    // Clica no botão
    cy.contains('Começar Agora').click()
    cy.wait(3000)
    
    // Verifica se o modal abriu
    cy.get('body').then(($body) => {
      cy.log('Conteúdo da página após clicar:')
      cy.log($body.text().substring(0, 500))
    })
    
    // Procura por qualquer modal ou formulário
    cy.get('[class*="modal"], [class*="dialog"], [class*="popup"]').then(($modals) => {
      cy.log(`Encontrados ${$modals.length} modais`)
    })
    
    // Procura por inputs
    cy.get('input, textarea').then(($inputs) => {
      cy.log(`Encontrados ${$inputs.length} inputs`)
      $inputs.each((index, element) => {
        cy.log(`Input ${index}: ${element.tagName} - ${element.className} - ${element.type}`)
      })
    })
    
    // Procura por botões
    cy.get('button').then(($buttons) => {
      cy.log(`Encontrados ${$buttons.length} botões`)
      $buttons.each((index, element) => {
        cy.log(`Botão ${index}: ${element.textContent} - ${element.className}`)
      })
    })
    
    // Captura screenshot
    cy.screenshot('debug-modal-investigacao')
  })

  it('Deve tentar diferentes formas de abrir o modal', () => {
    // Tenta clicar em diferentes elementos que podem abrir o modal
    cy.get('button, a').then(($elements) => {
      $elements.each((index, element) => {
        const text = element.textContent?.toLowerCase() || ''
        if (text.includes('começar') || text.includes('entrar') || text.includes('login')) {
          cy.log(`Tentando clicar em: ${element.textContent}`)
          cy.wrap(element).click()
          cy.wait(2000)
          
          // Verifica se apareceu algum input
          cy.get('input, textarea').then(($inputs) => {
            if ($inputs.length > 0) {
              cy.log('✅ Inputs encontrados após clicar!')
              cy.screenshot('modal-aberto-com-inputs')
            }
          })
        }
      })
    })
  })

  it('Deve verificar se há erro no console', () => {
    // Monitora erros do console
    cy.window().then((win) => {
      const originalError = win.console.error
      win.console.error = (...args) => {
        cy.log('❌ Erro no console:', args)
        originalError.apply(win.console, args)
      }
    })
    
    // Tenta abrir o modal
    cy.contains('Começar Agora').click()
    cy.wait(3000)
    
    // Verifica se há erros
    cy.get('body').then(($body) => {
      if ($body.text().includes('erro') || $body.text().includes('error')) {
        cy.log('❌ Erro encontrado na página')
      }
    })
  })
})

// 🪙 TESTE E2E - SISTEMA NFT NÔA ESPERANZA
// Testa especificamente o sistema de geração e certificação NFT

describe('Sistema NFT Nôa Esperanza', () => {
  beforeEach(() => {
    cy.clearTestData()
    cy.mockSpeechRecognition()
    cy.mockSpeechSynthesis()
    cy.mockSupabase()
    cy.visit('/')
    cy.waitForNoaToLoad()
  })

  it('Deve gerar NFT após avaliação completa', () => {
    // 🎯 Navega até a avaliação clínica
    cy.sendChatMessage('Olá, sou paciente')
    cy.waitForNoaResponse()
    cy.selectUserType('paciente')
    cy.startClinicalEvaluation()
    
    // 🎯 Verifica explicação do NFT
    cy.log('🪙 Verificando explicação do NFT')
    cy.checkNoaMessage('NFT INCENTIVADOR MÍNIMO DO RELATO ESPONTÂNEO')
    cy.checkNoaMessage('Token Não Fungível')
    cy.checkNoaMessage('certificação do seu relato espontâneo')
    cy.checkNoaMessage('certificado digital da avaliação')
    cy.checkNoaMessage('dashboard')
    
    // 🎯 Usuário confirma
    cy.sendChatMessage('sim')
    cy.waitForNoaResponse()
    
    // 🎯 Simula avaliação rápida para chegar ao NFT
    cy.log('🪙 Simulando avaliação para gerar NFT')
    cy.completeImreBlock('Meu nome é Maria, tenho 28 anos')
    cy.waitForNoaResponse()
    
    cy.completeImreBlock('não')
    cy.waitForNoaResponse()
    
    cy.completeImreBlock('dor de cabeça')
    cy.waitForNoaResponse()
    
    // 🎯 Acelera o processo com respostas padrão
    for (let i = 0; i < 10; i++) {
      cy.completeImreBlock('nenhuma')
      cy.waitForNoaResponse()
    }
    
    // 🎯 Chega ao fechamento
    cy.checkNoaMessage('FECHAMENTO CONSENSUAL')
    cy.sendChatMessage('sim, concordo')
    cy.waitForNoaResponse()
    
    // 🎯 Verifica geração do NFT
    cy.log('🪙 Verificando geração do NFT')
    cy.checkNoaMessage('NFT Hash:')
    cy.checkNoaMessage('AVALIAÇÃO CLÍNICA CONCLUÍDA')
    cy.checkNoaMessage('certificado com NFT')
    
    // 🎯 Verifica se o hash do NFT foi gerado
    cy.get('[data-testid="nft-hash"]').should('be.visible')
    cy.get('[data-testid="nft-hash"]').should('not.be.empty')
  })

  it('Deve cancelar geração de NFT quando usuário recusa', () => {
    // 🎯 Navega até a explicação do NFT
    cy.sendChatMessage('Olá, sou paciente')
    cy.waitForNoaResponse()
    cy.selectUserType('paciente')
    cy.startClinicalEvaluation()
    
    // 🎯 Verifica explicação
    cy.checkNoaMessage('NFT INCENTIVADOR')
    cy.checkNoaMessage('Você concorda em prosseguir')
    
    // 🎯 Usuário recusa
    cy.sendChatMessage('não')
    cy.waitForNoaResponse()
    
    // 🎯 Verifica que não gerou NFT
    cy.checkNoaMessage('entendido')
    cy.get('[data-testid="nft-hash"]').should('not.exist')
  })

  it('Deve mostrar metadados do NFT', () => {
    // 🎯 Completa avaliação para gerar NFT
    cy.sendChatMessage('Olá, sou paciente')
    cy.waitForNoaResponse()
    cy.selectUserType('paciente')
    cy.startClinicalEvaluation()
    cy.sendChatMessage('sim')
    cy.waitForNoaResponse()
    
    // 🎯 Simula avaliação rápida
    cy.completeImreBlock('João, 40 anos')
    cy.waitForNoaResponse()
    cy.completeImreBlock('não')
    cy.waitForNoaResponse()
    cy.completeImreBlock('dor')
    cy.waitForNoaResponse()
    
    // 🎯 Acelera processo
    for (let i = 0; i < 8; i++) {
      cy.completeImreBlock('nenhuma')
      cy.waitForNoaResponse()
    }
    
    // 🎯 Finaliza
    cy.checkNoaMessage('FECHAMENTO CONSENSUAL')
    cy.sendChatMessage('sim')
    cy.waitForNoaResponse()
    
    // 🎯 Verifica metadados do NFT
    cy.log('🪙 Verificando metadados do NFT')
    cy.get('[data-testid="nft-metadata"]').should('be.visible')
    cy.get('[data-testid="nft-metadata"]').should('contain.text', 'clinical_evaluation')
    cy.get('[data-testid="nft-metadata"]').should('contain.text', 'IMRE')
    cy.get('[data-testid="nft-metadata"]').should('contain.text', 'blocks_completed')
  })

  it('Deve permitir download do relatório NFT', () => {
    // 🎯 Gera NFT
    cy.sendChatMessage('Olá, sou paciente')
    cy.waitForNoaResponse()
    cy.selectUserType('paciente')
    cy.startClinicalEvaluation()
    cy.sendChatMessage('sim')
    cy.waitForNoaResponse()
    
    // 🎯 Simula avaliação
    cy.completeImreBlock('Ana, 30 anos')
    cy.waitForNoaResponse()
    cy.completeImreBlock('não')
    cy.waitForNoaResponse()
    cy.completeImreBlock('cansaço')
    cy.waitForNoaResponse()
    
    // 🎯 Acelera
    for (let i = 0; i < 6; i++) {
      cy.completeImreBlock('nenhuma')
      cy.waitForNoaResponse()
    }
    
    // 🎯 Finaliza
    cy.checkNoaMessage('FECHAMENTO CONSENSUAL')
    cy.sendChatMessage('sim')
    cy.waitForNoaResponse()
    
    // 🎯 Verifica botão de download
    cy.log('🪙 Verificando download do relatório')
    cy.get('[data-testid="download-report"]').should('be.visible')
    cy.get('[data-testid="download-report"]').click()
    
    // 🎯 Verifica se o download foi iniciado
    cy.window().then((win) => {
      // Verifica se foi criado um link de download
      cy.get('a[download]').should('exist')
    })
  })

  it('Deve mostrar status do NFT no dashboard', () => {
    // 🎯 Gera NFT
    cy.sendChatMessage('Olá, sou paciente')
    cy.waitForNoaResponse()
    cy.selectUserType('paciente')
    cy.startClinicalEvaluation()
    cy.sendChatMessage('sim')
    cy.waitForNoaResponse()
    
    // 🎯 Simula avaliação
    cy.completeImreBlock('Carlos, 45 anos')
    cy.waitForNoaResponse()
    cy.completeImreBlock('não')
    cy.waitForNoaResponse()
    cy.completeImreBlock('dor abdominal')
    cy.waitForNoaResponse()
    
    // 🎯 Acelera
    for (let i = 0; i < 4; i++) {
      cy.completeImreBlock('nenhuma')
      cy.waitForNoaResponse()
    }
    
    // 🎯 Finaliza
    cy.checkNoaMessage('FECHAMENTO CONSENSUAL')
    cy.sendChatMessage('sim')
    cy.waitForNoaResponse()
    
    // 🎯 Verifica dashboard
    cy.log('🪙 Verificando dashboard do NFT')
    cy.get('[data-testid="nft-dashboard"]').should('be.visible')
    cy.get('[data-testid="nft-status"]').should('contain.text', 'generated')
    cy.get('[data-testid="nft-timestamp"]').should('be.visible')
    cy.get('[data-testid="nft-report-title"]').should('contain.text', 'Avaliação Clínica Inicial')
  })
})

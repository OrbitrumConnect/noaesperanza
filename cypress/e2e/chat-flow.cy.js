// 🎯 TESTE E2E - FLUXO COMPLETO DO CHAT NÔA ESPERANZA
// Testa todo o fluxo: pergunta inicial → apresentação → tipo usuário → avaliação → NFT

describe('Fluxo Completo Nôa Esperanza', () => {
  beforeEach(() => {
    // Limpa dados de teste antes de cada teste
    cy.clearTestData()
    
    // Mock das APIs de voz
    cy.mockSpeechRecognition()
    cy.mockSpeechSynthesis()
    
    // Mock do Supabase
    cy.mockSupabase()
    
    // Visita a página inicial
    cy.visit('/')
    
    // Aguarda Nôa carregar
    cy.waitForNoaToLoad()
  })

  it('Deve completar fluxo completo: pergunta inicial → apresentação → tipo usuário → avaliação → NFT', () => {
    // 🎯 ETAPA 1: Pergunta inicial
    cy.log('🎯 Testando pergunta inicial')
    cy.checkNoaMessage('O que trouxe você aqui?')
    
    // 🎯 ETAPA 2: Usuário responde
    cy.log('🎯 Testando resposta do usuário')
    cy.sendChatMessage('Olá, sou paciente e quero fazer uma avaliação')
    cy.waitForNoaResponse()
    
    // 🎯 ETAPA 3: Nôa se apresenta
    cy.log('🎯 Testando apresentação da Nôa')
    cy.checkNoaMessage('Nôa Esperanza')
    cy.checkNoaMessage('neurologia, cannabis medicinal e nefrologia')
    
    // 🎯 ETAPA 4: Menu de tipos de usuário
    cy.log('🎯 Testando menu de tipos de usuário')
    cy.checkNoaMessage('ALUNO, PROFISSIONAL ou PACIENTE')
    
    // 🎯 ETAPA 5: Usuário seleciona tipo
    cy.log('🎯 Testando seleção de tipo de usuário')
    cy.selectUserType('paciente')
    cy.checkNoaMessage('MENU PACIENTE')
    cy.checkNoaMessage('Avaliação Clínica Inicial')
    
    // 🎯 ETAPA 6: Inicia avaliação clínica
    cy.log('🎯 Testando início da avaliação clínica')
    cy.startClinicalEvaluation()
    
    // 🎯 ETAPA 7: Verifica explicação do NFT
    cy.log('🎯 Testando explicação do NFT')
    cy.checkNoaMessage('NFT INCENTIVADOR MÍNIMO DO RELATO ESPONTÂNEO')
    cy.checkNoaMessage('Você concorda em prosseguir')
    
    // 🎯 ETAPA 8: Usuário confirma
    cy.log('🎯 Testando confirmação do usuário')
    cy.sendChatMessage('sim')
    cy.waitForNoaResponse()
    
    // 🎯 ETAPA 9: Primeira pergunta da avaliação
    cy.log('🎯 Testando primeira pergunta da avaliação')
    cy.checkNoaMessage('apresente-se')
    
    // 🎯 ETAPA 10: Usuário responde primeira pergunta
    cy.log('🎯 Testando resposta da primeira pergunta')
    cy.completeImreBlock('Meu nome é João, tenho 35 anos')
    cy.waitForNoaResponse()
    
    // 🎯 ETAPA 11: Segunda pergunta (Cannabis)
    cy.log('🎯 Testando pergunta sobre cannabis')
    cy.checkNoaMessage('canabis medicinal')
    cy.completeImreBlock('não')
    cy.waitForNoaResponse()
    
    // 🎯 ETAPA 12: Terceira pergunta (Lista indiciária)
    cy.log('🎯 Testando lista indiciária')
    cy.checkNoaMessage('trouxe você à nossa avaliação')
    cy.completeImreBlock('dor de cabeça')
    cy.waitForNoaResponse()
    
    // 🎯 ETAPA 13: Continua com mais algumas perguntas
    cy.log('🎯 Testando continuidade da avaliação')
    cy.completeImreBlock('a primeira que mencionei')
    cy.waitForNoaResponse()
    
    // 🎯 ETAPA 14: Simula algumas respostas para acelerar o teste
    cy.log('🎯 Simulando respostas para acelerar teste')
    for (let i = 0; i < 5; i++) {
      cy.completeImreBlock('nenhuma')
      cy.waitForNoaResponse()
    }
    
    // 🎯 ETAPA 15: Verifica se chegou ao fechamento
    cy.log('🎯 Testando fechamento da avaliação')
    cy.checkNoaMessage('FECHAMENTO CONSENSUAL')
    
    // 🎯 ETAPA 16: Usuário concorda com o relatório
    cy.log('🎯 Testando concordância final')
    cy.sendChatMessage('sim, concordo')
    cy.waitForNoaResponse()
    
    // 🎯 ETAPA 17: Verifica geração do NFT
    cy.log('🎯 Testando geração do NFT')
    cy.checkNftGenerated()
    
    // 🎯 ETAPA 18: Verifica mensagem final
    cy.log('🎯 Testando mensagem final')
    cy.checkNoaMessage('AVALIAÇÃO CLÍNICA CONCLUÍDA')
    cy.checkNoaMessage('Dr. Ricardo Valença')
  })

  it('Deve testar fluxo de cancelamento da avaliação', () => {
    // Testa o fluxo até a explicação do NFT
    cy.sendChatMessage('Olá, sou paciente')
    cy.waitForNoaResponse()
    cy.selectUserType('paciente')
    cy.startClinicalEvaluation()
    
    // Usuário cancela
    cy.sendChatMessage('não')
    cy.waitForNoaResponse()
    cy.checkNoaMessage('entendido')
  })

  it('Deve testar diferentes tipos de usuário', () => {
    const userTypes = ['aluno', 'profissional', 'paciente']
    
    userTypes.forEach(userType => {
      cy.log(`🎯 Testando tipo de usuário: ${userType}`)
      
      // Reinicia o fluxo para cada tipo
      cy.visit('/')
      cy.waitForNoaToLoad()
      
      cy.sendChatMessage(`Olá, sou ${userType}`)
      cy.waitForNoaResponse()
      cy.selectUserType(userType)
      
      // Verifica se o menu correto foi exibido
      if (userType === 'aluno') {
        cy.checkNoaMessage('MENU ALUNO')
        cy.checkNoaMessage('ENSINO')
      } else if (userType === 'profissional') {
        cy.checkNoaMessage('MENU PROFISSIONAL')
        cy.checkNoaMessage('PESQUISA E CLÍNICA')
      } else if (userType === 'paciente') {
        cy.checkNoaMessage('MENU PACIENTE')
        cy.checkNoaMessage('AVALIAÇÃO CLÍNICA')
      }
    })
  })

  it('Deve testar sistema de voz (mocks)', () => {
    // Testa se as APIs de voz são chamadas corretamente
    cy.sendChatMessage('teste de voz')
    cy.waitForNoaResponse()
    
    // Verifica se os mocks foram chamados
    cy.get('@speechSpeak').should('have.been.called')
  })
})

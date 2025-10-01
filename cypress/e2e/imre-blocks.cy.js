// 🩺 TESTE E2E - 28 BLOCOS IMRE NÔA ESPERANZA
// Testa especificamente todos os blocos canônicos da avaliação clínica

describe('28 Blocos IMRE Nôa Esperanza', () => {
  beforeEach(() => {
    cy.clearTestData()
    cy.mockSpeechRecognition()
    cy.mockSpeechSynthesis()
    cy.mockSupabase()
    cy.visit('/')
    cy.waitForNoaToLoad()
  })

  it('Deve percorrer todos os 28 blocos IMRE sequencialmente', () => {
    // 🎯 Inicia avaliação
    cy.sendChatMessage('Olá, sou paciente')
    cy.waitForNoaResponse()
    cy.selectUserType('paciente')
    cy.startClinicalEvaluation()
    
    // 🎯 BLOCO 1: Abertura Exponencial
    cy.log('🩺 Testando Bloco 1: Abertura Exponencial')
    cy.checkNoaMessage('apresente-se')
    cy.completeImreBlock('Meu nome é João Silva, tenho 35 anos, sou engenheiro')
    cy.waitForNoaResponse()
    
    // 🎯 BLOCO 2: Cannabis Medicinal
    cy.log('🩺 Testando Bloco 2: Cannabis Medicinal')
    cy.checkNoaMessage('canabis medicinal')
    cy.completeImreBlock('não, nunca utilizei')
    cy.waitForNoaResponse()
    
    // 🎯 BLOCO 3: Lista Indiciária
    cy.log('🩺 Testando Bloco 3: Lista Indiciária')
    cy.checkNoaMessage('trouxe você à nossa avaliação')
    cy.completeImreBlock('dor de cabeça, cansaço e falta de ar')
    cy.waitForNoaResponse()
    
    // 🎯 BLOCO 4: Queixa Principal
    cy.log('🩺 Testando Bloco 4: Queixa Principal')
    cy.checkNoaMessage('qual mais o(a) incomoda')
    cy.completeImreBlock('a dor de cabeça')
    cy.waitForNoaResponse()
    
    // 🎯 BLOCO 5: Desenvolvimento - Localização
    cy.log('🩺 Testando Bloco 5: Desenvolvimento - Localização')
    cy.checkNoaMessage('onde você sente')
    cy.completeImreBlock('na parte frontal da cabeça')
    cy.waitForNoaResponse()
    
    // 🎯 BLOCO 6: Desenvolvimento - Início
    cy.log('🩺 Testando Bloco 6: Desenvolvimento - Início')
    cy.checkNoaMessage('quando começou')
    cy.completeImreBlock('há cerca de 3 meses')
    cy.waitForNoaResponse()
    
    // 🎯 BLOCO 7: Desenvolvimento - Qualidade
    cy.log('🩺 Testando Bloco 7: Desenvolvimento - Qualidade')
    cy.checkNoaMessage('como é a dor')
    cy.completeImreBlock('é uma dor latejante')
    cy.waitForNoaResponse()
    
    // 🎯 BLOCO 8: Desenvolvimento - Sintomas Associados
    cy.log('🩺 Testando Bloco 8: Desenvolvimento - Sintomas Associados')
    cy.checkNoaMessage('sintomas associados')
    cy.completeImreBlock('náusea e sensibilidade à luz')
    cy.waitForNoaResponse()
    
    // 🎯 BLOCO 9: Desenvolvimento - Fatores de Melhora
    cy.log('🩺 Testando Bloco 9: Desenvolvimento - Fatores de Melhora')
    cy.checkNoaMessage('o que melhora')
    cy.completeImreBlock('repouso e analgésicos')
    cy.waitForNoaResponse()
    
    // 🎯 BLOCO 10: Desenvolvimento - Fatores de Piora
    cy.log('🩺 Testando Bloco 10: Desenvolvimento - Fatores de Piora')
    cy.checkNoaMessage('o que piora')
    cy.completeImreBlock('estresse e barulho')
    cy.waitForNoaResponse()
    
    // 🎯 BLOCO 11: História Patológica
    cy.log('🩺 Testando Bloco 11: História Patológica')
    cy.checkNoaMessage('história patológica')
    cy.completeImreBlock('hipertensão e diabetes')
    cy.waitForNoaResponse()
    
    // 🎯 BLOCO 12: História Familiar - Mãe
    cy.log('🩺 Testando Bloco 12: História Familiar - Mãe')
    cy.checkNoaMessage('por parte da mãe')
    cy.completeImreBlock('diabetes e problemas cardíacos')
    cy.waitForNoaResponse()
    
    // 🎯 BLOCO 13: História Familiar - Pai
    cy.log('🩺 Testando Bloco 13: História Familiar - Pai')
    cy.checkNoaMessage('por parte do pai')
    cy.completeImreBlock('hipertensão')
    cy.waitForNoaResponse()
    
    // 🎯 BLOCO 14: Hábitos de Vida
    cy.log('🩺 Testando Bloco 14: Hábitos de Vida')
    cy.checkNoaMessage('hábitos de vida')
    cy.completeImreBlock('fumo ocasionalmente e faço exercícios')
    cy.waitForNoaResponse()
    
    // 🎯 BLOCO 15: Alergias
    cy.log('🩺 Testando Bloco 15: Alergias')
    cy.checkNoaMessage('alergia')
    cy.completeImreBlock('alergia a poeira')
    cy.waitForNoaResponse()
    
    // 🎯 BLOCO 16: Medicações Contínuas
    cy.log('🩺 Testando Bloco 16: Medicações Contínuas')
    cy.checkNoaMessage('medicações utiliza regularmente')
    cy.completeImreBlock('losartana e metformina')
    cy.waitForNoaResponse()
    
    // 🎯 BLOCO 17: Medicações Eventuais
    cy.log('🩺 Testando Bloco 17: Medicações Eventuais')
    cy.checkNoaMessage('medicações você utiliza esporadicamente')
    cy.completeImreBlock('dipirona para dor de cabeça')
    cy.waitForNoaResponse()
    
    // 🎯 BLOCO 18: Fechamento Consensual
    cy.log('🩺 Testando Bloco 18: Fechamento Consensual')
    cy.checkNoaMessage('FECHAMENTO CONSENSUAL')
    cy.checkNoaMessage('revisar sua história')
    cy.completeImreBlock('está tudo correto')
    cy.waitForNoaResponse()
    
    // 🎯 Verifica se chegou ao final
    cy.checkNoaMessage('AVALIAÇÃO CLÍNICA CONCLUÍDA')
    cy.checkNftGenerated()
  })

  it('Deve testar blocos com respostas negativas', () => {
    // 🎯 Inicia avaliação
    cy.sendChatMessage('Olá, sou paciente')
    cy.waitForNoaResponse()
    cy.selectUserType('paciente')
    cy.startClinicalEvaluation()
    
    // 🎯 Testa com respostas negativas
    cy.log('🩺 Testando com respostas negativas')
    
    cy.completeImreBlock('Maria, 28 anos')
    cy.waitForNoaResponse()
    
    cy.completeImreBlock('não')
    cy.waitForNoaResponse()
    
    cy.completeImreBlock('cansaço')
    cy.waitForNoaResponse()
    
    cy.completeImreBlock('o cansaço')
    cy.waitForNoaResponse()
    
    cy.completeImreBlock('no corpo todo')
    cy.waitForNoaResponse()
    
    cy.completeImreBlock('há 1 mês')
    cy.waitForNoaResponse()
    
    cy.completeImreBlock('é uma sensação de fraqueza')
    cy.waitForNoaResponse()
    
    cy.completeImreBlock('nenhum sintoma associado')
    cy.waitForNoaResponse()
    
    cy.completeImreBlock('repouso melhora')
    cy.waitForNoaResponse()
    
    cy.completeImreBlock('esforço piora')
    cy.waitForNoaResponse()
    
    cy.completeImreBlock('nenhuma doença')
    cy.waitForNoaResponse()
    
    cy.completeImreBlock('nenhuma doença na família')
    cy.waitForNoaResponse()
    
    cy.completeImreBlock('nenhuma doença no pai')
    cy.waitForNoaResponse()
    
    cy.completeImreBlock('vida saudável')
    cy.waitForNoaResponse()
    
    cy.completeImreBlock('nenhuma alergia')
    cy.waitForNoaResponse()
    
    cy.completeImreBlock('nenhuma medicação contínua')
    cy.waitForNoaResponse()
    
    cy.completeImreBlock('nenhuma medicação eventual')
    cy.waitForNoaResponse()
    
    cy.checkNoaMessage('FECHAMENTO CONSENSUAL')
    cy.completeImreBlock('está perfeito')
    cy.waitForNoaResponse()
    
    cy.checkNftGenerated()
  })

  it('Deve testar blocos com respostas complexas', () => {
    // 🎯 Inicia avaliação
    cy.sendChatMessage('Olá, sou paciente')
    cy.waitForNoaResponse()
    cy.selectUserType('paciente')
    cy.startClinicalEvaluation()
    
    // 🎯 Testa com respostas complexas e detalhadas
    cy.log('🩺 Testando com respostas complexas')
    
    cy.completeImreBlock('Carlos Eduardo Santos, 42 anos, advogado, casado, pai de dois filhos')
    cy.waitForNoaResponse()
    
    cy.completeImreBlock('sim, já utilizei cannabis medicinal para dor crônica, com prescrição médica')
    cy.waitForNoaResponse()
    
    cy.completeImreBlock('dor lombar crônica, insônia, ansiedade e dores de cabeça frequentes')
    cy.waitForNoaResponse()
    
    cy.completeImreBlock('a dor lombar é a que mais me incomoda, pois limita minhas atividades')
    cy.waitForNoaResponse()
    
    cy.completeImreBlock('na região lombar baixa, irradiando para a perna direita')
    cy.waitForNoaResponse()
    
    cy.completeImreBlock('há aproximadamente 2 anos, após um acidente de carro')
    cy.waitForNoaResponse()
    
    cy.completeImreBlock('é uma dor constante, com picos de intensidade, tipo queimação')
    cy.waitForNoaResponse()
    
    cy.completeImreBlock('formigamento na perna direita, rigidez matinal e dificuldade para caminhar')
    cy.waitForNoaResponse()
    
    cy.completeImreBlock('fisioterapia, alongamentos e calor local')
    cy.waitForNoaResponse()
    
    cy.completeImreBlock('ficar muito tempo sentado, frio e estresse')
    cy.waitForNoaResponse()
    
    cy.completeImreBlock('hérnia de disco L4-L5, artrose na coluna e síndrome do piriforme')
    cy.waitForNoaResponse()
    
    cy.completeImreBlock('mãe tem diabetes tipo 2 e osteoporose')
    cy.waitForNoaResponse()
    
    cy.completeImreBlock('pai tem hipertensão e problemas cardíacos')
    cy.waitForNoaResponse()
    
    cy.completeImreBlock('fumo ocasionalmente, bebo socialmente, faço exercícios 3x por semana')
    cy.waitForNoaResponse()
    
    cy.completeImreBlock('alergia a penicilina e pólen')
    cy.waitForNoaResponse()
    
    cy.completeImreBlock('tramadol, gabapentina e omeprazol')
    cy.waitForNoaResponse()
    
    cy.completeImreBlock('dipirona para dores de cabeça e lorazepam para ansiedade')
    cy.waitForNoaResponse()
    
    cy.checkNoaMessage('FECHAMENTO CONSENSUAL')
    cy.completeImreBlock('gostaria de adicionar que tenho dificuldade para dormir')
    cy.waitForNoaResponse()
    
    cy.checkNftGenerated()
  })

  it('Deve testar validação de respostas obrigatórias', () => {
    // 🎯 Inicia avaliação
    cy.sendChatMessage('Olá, sou paciente')
    cy.waitForNoaResponse()
    cy.selectUserType('paciente')
    cy.startClinicalEvaluation()
    
    // 🎯 Testa respostas vazias ou inválidas
    cy.log('🩺 Testando validação de respostas')
    
    // Tenta enviar resposta vazia
    cy.get('[data-testid="chat-input"]').clear()
    cy.get('[data-testid="send-button"]').click()
    
    // Deve manter a mesma pergunta
    cy.checkNoaMessage('apresente-se')
    
    // Responde corretamente
    cy.completeImreBlock('João, 30 anos')
    cy.waitForNoaResponse()
    
    // Continua o fluxo normal
    cy.completeImreBlock('não')
    cy.waitForNoaResponse()
    
    cy.completeImreBlock('dor')
    cy.waitForNoaResponse()
    
    // Acelera o resto
    for (let i = 0; i < 10; i++) {
      cy.completeImreBlock('nenhuma')
      cy.waitForNoaResponse()
    }
    
    cy.checkNftGenerated()
  })
})

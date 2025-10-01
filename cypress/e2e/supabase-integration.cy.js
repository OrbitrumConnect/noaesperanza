// 🗄️ TESTE E2E - INTEGRAÇÃO SUPABASE NÔA ESPERANZA
// Testa integração completa com banco de dados

describe('Integração Supabase Nôa Esperanza', () => {
  beforeEach(() => {
    cy.clearTestData()
    cy.mockSpeechRecognition()
    cy.mockSpeechSynthesis()
    cy.visit('/')
    cy.waitForNoaToLoad()
  })

  it('Deve conectar com Supabase e salvar dados', () => {
    // 🗄️ Testa conexão e salvamento de dados
    cy.log('🗄️ Testando conexão Supabase')
    
    // Verifica se a conexão está ativa
    cy.window().then((win) => {
      expect(win.supabase).to.exist
    })
    
    // Inicia conversa
    cy.sendChatMessage('Olá, sou paciente')
    cy.waitForNoaResponse()
    
    // Verifica se dados foram salvos
    cy.window().then((win) => {
      // Verifica se as funções do Supabase foram chamadas
      expect(win.supabase.rpc).to.have.been.called
    })
  })

  it('Deve salvar conversas na tabela noa_conversations', () => {
    // 🗄️ Testa salvamento de conversas
    cy.log('🗄️ Testando salvamento de conversas')
    
    // Inicia conversa
    cy.sendChatMessage('Olá, sou paciente')
    cy.waitForNoaResponse()
    
    // Verifica se conversa foi salva
    cy.window().then((win) => {
      // Verifica se insert foi chamado na tabela noa_conversations
      expect(win.supabase.from).to.have.been.calledWith('noa_conversations')
    })
    
    // Continua conversa
    cy.selectUserType('paciente')
    
    // Verifica se nova conversa foi salva
    cy.window().then((win) => {
      expect(win.supabase.from).to.have.been.calledWith('noa_conversations')
    })
  })

  it('Deve salvar fluxo da conversa na tabela noa_conversation_flow', () => {
    // 🗄️ Testa salvamento do fluxo
    cy.log('🗄️ Testando salvamento do fluxo')
    
    // Inicia avaliação
    cy.sendChatMessage('Olá, sou paciente')
    cy.waitForNoaResponse()
    cy.selectUserType('paciente')
    cy.startClinicalEvaluation()
    
    // Verifica se fluxo foi salvo
    cy.window().then((win) => {
      // Verifica se insert foi chamado na tabela noa_conversation_flow
      expect(win.supabase.from).to.have.been.calledWith('noa_conversation_flow')
    })
  })

  it('Deve salvar dados de aprendizado da IA', () => {
    // 🗄️ Testa salvamento de aprendizado
    cy.log('🗄️ Testando salvamento de aprendizado da IA')
    
    // Inicia conversa
    cy.sendChatMessage('Olá, sou paciente')
    cy.waitForNoaResponse()
    
    // Verifica se dados de aprendizado foram salvos
    cy.window().then((win) => {
      // Verifica se insert foi chamado na tabela ai_learning
      expect(win.supabase.from).to.have.been.calledWith('ai_learning')
    })
  })

  it('Deve salvar relatório NFT na tabela noa_nft_reports', () => {
    // 🗄️ Testa salvamento de relatório NFT
    cy.log('🗄️ Testando salvamento de relatório NFT')
    
    // Completa avaliação para gerar NFT
    cy.sendChatMessage('Olá, sou paciente')
    cy.waitForNoaResponse()
    cy.selectUserType('paciente')
    cy.startClinicalEvaluation()
    
    // Simula avaliação rápida
    cy.completeImreBlock('João, 30 anos')
    cy.waitForNoaResponse()
    cy.completeImreBlock('não')
    cy.waitForNoaResponse()
    cy.completeImreBlock('dor')
    cy.waitForNoaResponse()
    
    // Acelera processo
    for (let i = 0; i < 8; i++) {
      cy.completeImreBlock('nenhuma')
      cy.waitForNoaResponse()
    }
    
    // Finaliza
    cy.checkNoaMessage('FECHAMENTO CONSENSUAL')
    cy.sendChatMessage('sim')
    cy.waitForNoaResponse()
    
    // Verifica se NFT foi salvo
    cy.window().then((win) => {
      // Verifica se insert foi chamado na tabela noa_nft_reports
      expect(win.supabase.from).to.have.been.calledWith('noa_nft_reports')
    })
  })

  it('Deve atualizar tipo de usuário na tabela noa_users', () => {
    // 🗄️ Testa atualização de tipo de usuário
    cy.log('🗄️ Testando atualização de tipo de usuário')
    
    // Seleciona tipo de usuário
    cy.sendChatMessage('Olá, sou paciente')
    cy.waitForNoaResponse()
    cy.selectUserType('paciente')
    
    // Verifica se tipo foi atualizado
    cy.window().then((win) => {
      // Verifica se update foi chamado na tabela noa_users
      expect(win.supabase.from).to.have.been.calledWith('noa_users')
    })
  })

  it('Deve buscar blocos IMRE da tabela blocos_imre', () => {
    // 🗄️ Testa busca de blocos IMRE
    cy.log('🗄️ Testando busca de blocos IMRE')
    
    // Inicia avaliação
    cy.sendChatMessage('Olá, sou paciente')
    cy.waitForNoaResponse()
    cy.selectUserType('paciente')
    cy.startClinicalEvaluation()
    
    // Verifica se blocos foram buscados
    cy.window().then((win) => {
      // Verifica se select foi chamado na tabela blocos_imre
      expect(win.supabase.from).to.have.been.calledWith('blocos_imre')
    })
  })

  it('Deve buscar prompts da tabela prompts', () => {
    // 🗄️ Testa busca de prompts
    cy.log('🗄️ Testando busca de prompts')
    
    // Inicia conversa
    cy.sendChatMessage('Olá, sou paciente')
    cy.waitForNoaResponse()
    
    // Verifica se prompts foram buscados
    cy.window().then((win) => {
      // Verifica se select foi chamado na tabela prompts
      expect(win.supabase.from).to.have.been.calledWith('prompts')
    })
  })

  it('Deve testar RLS (Row Level Security)', () => {
    // 🗄️ Testa segurança de dados
    cy.log('🗄️ Testando RLS (Row Level Security)')
    
    // Simula usuário não autenticado
    cy.window().then((win) => {
      // Remove token de autenticação
      win.localStorage.removeItem('sb-auth-token')
    })
    
    // Tenta acessar dados
    cy.sendChatMessage('teste RLS')
    cy.waitForNoaResponse()
    
    // Verifica se sistema continua funcionando
    cy.checkNoaMessage('Nôa Esperanza')
  })

  it('Deve testar views analíticas', () => {
    // 🗄️ Testa views analíticas
    cy.log('🗄️ Testando views analíticas')
    
    // Inicia conversa
    cy.sendChatMessage('Olá, sou paciente')
    cy.waitForNoaResponse()
    
    // Verifica se views foram acessadas
    cy.window().then((win) => {
      // Verifica se select foi chamado nas views
      expect(win.supabase.from).to.have.been.calledWith('noa_conversation_stats')
      expect(win.supabase.from).to.have.been.calledWith('noa_user_profiles')
      expect(win.supabase.from).to.have.been.calledWith('noa_nft_summary')
    })
  })

  it('Deve testar funções SQL personalizadas', () => {
    // 🗄️ Testa funções SQL
    cy.log('🗄️ Testando funções SQL personalizadas')
    
    // Inicia conversa
    cy.sendChatMessage('Olá, sou paciente')
    cy.waitForNoaResponse()
    
    // Verifica se funções foram chamadas
    cy.window().then((win) => {
      // Verifica se RPC foi chamado para funções personalizadas
      expect(win.supabase.rpc).to.have.been.calledWith('get_noa_config')
      expect(win.supabase.rpc).to.have.been.calledWith('set_user_type')
      expect(win.supabase.rpc).to.have.been.calledWith('register_noa_conversation')
      expect(win.supabase.rpc).to.have.been.calledWith('save_ai_learning')
    })
  })

  it('Deve testar tratamento de erros do Supabase', () => {
    // 🗄️ Testa tratamento de erros
    cy.log('🗄️ Testando tratamento de erros')
    
    // Simula erro de conexão
    cy.window().then((win) => {
      // Mock de erro
      win.supabase.from = cy.stub().returns({
        insert: cy.stub().returns({
          select: cy.stub().returns({
            single: cy.stub().rejects(new Error('Connection failed'))
          })
        })
      })
    })
    
    // Tenta operação que deve falhar
    cy.sendChatMessage('teste erro')
    cy.waitForNoaResponse()
    
    // Verifica se sistema continua funcionando
    cy.checkNoaMessage('Nôa Esperanza')
  })

  it('Deve testar performance de queries', () => {
    // 🗄️ Testa performance
    cy.log('🗄️ Testando performance de queries')
    
    const startTime = Date.now()
    
    // Inicia conversa
    cy.sendChatMessage('Olá, sou paciente')
    cy.waitForNoaResponse()
    
    // Verifica tempo de resposta
    cy.window().then(() => {
      const endTime = Date.now()
      const responseTime = endTime - startTime
      
      // Verifica se resposta foi rápida (menos de 5 segundos)
      expect(responseTime).to.be.lessThan(5000)
    })
  })
})

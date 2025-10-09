describe('NOA Esperanza - AI Learning System', () => {
  beforeEach(() => {
    // Set desktop viewport for better testing
    cy.viewport(1280, 720) // Desktop size
    
    cy.visit('/');
    cy.wait(2000) // Wait for page to fully load
    
    // Check for chat input
    cy.get('[data-testid="chat-input"]', { timeout: 10000 }).should('be.visible');
  });

  it('should learn from user interactions', () => {
    // Start a conversation
    cy.get('[data-testid="chat-input"]').type('Olá, Nôa');
    cy.get('[data-testid="send-button"]').click();
    
    // Provide feedback
    cy.get('[data-testid="feedback-positive"]').click();
    
    // Should acknowledge learning
    cy.contains('Obrigada pelo feedback', { timeout: 10000 });
  });

  it('should improve responses over time', () => {
    // Multiple interactions to test learning
    const interactions = [
      'Como você está?',
      'Qual é o seu nome?',
      'O que você pode fazer?'
    ];
    
    interactions.forEach((message) => {
      cy.get('[data-testid="chat-input"]').type(message);
      cy.get('[data-testid="send-button"]').click();
      cy.wait(2000); // Wait for response
    });
    
    // Should show improved responses
    cy.contains('Melhorei minha resposta', { timeout: 10000 });
  });

  it('should handle manual training data upload', () => {
    // Test manual training
    cy.get('[data-testid="chat-input"]').type('Upload de dados de treinamento');
    cy.get('[data-testid="send-button"]').click();
    
    // Should show upload interface
    cy.get('[data-testid="training-upload"]').should('be.visible');
    
    // Test file upload
    cy.get('[data-testid="file-input"]').selectFile('cypress/fixtures/training-data.json');
    
    // Should process training data
    cy.contains('Dados processados com sucesso', { timeout: 10000 });
  });

  it('should track learning metrics', () => {
    // Access learning dashboard
    cy.get('[data-testid="chat-input"]').type('Mostrar métricas de aprendizado');
    cy.get('[data-testid="send-button"]').click();
    
    // Should show learning metrics
    cy.get('[data-testid="learning-metrics"]').should('be.visible');
    cy.contains('Taxa de Aprendizado');
    cy.contains('Precisão das Respostas');
    cy.contains('Interações Totais');
  });

  it('should handle learning errors gracefully', () => {
    // Test error handling
    cy.get('[data-testid="chat-input"]').type('Dados de treinamento inválidos');
    cy.get('[data-testid="send-button"]').click();
    
    // Should handle error gracefully
    cy.contains('Erro no processamento', { timeout: 10000 });
    cy.contains('Tente novamente');
  });
});

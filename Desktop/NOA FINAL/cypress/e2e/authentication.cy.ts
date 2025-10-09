describe('NOA Esperanza - Authentication Flow', () => {
  beforeEach(() => {
    // Set desktop viewport for better testing
    cy.viewport(1280, 720) // Desktop size
    
    cy.visit('/');
    cy.wait(2000) // Wait for page to fully load
    
    // Check for chat input
    cy.get('[data-testid="chat-input"]', { timeout: 10000 }).should('be.visible');
  });

  it('should handle institutional user authentication', () => {
    // Test institutional activation
    cy.get('[data-testid="chat-input"]').type('Olá, Nôa. Ricardo Valença, aqui.');
    cy.get('[data-testid="send-button"]').click();
    
    // Should detect institutional activation
    cy.contains('Identifiquei sua ativação institucional', { timeout: 10000 });
    
    // Should show institutional features
    cy.contains('Painel de Administração', { timeout: 5000 });
  });

  it('should handle regular user authentication', () => {
    // Test regular user
    cy.get('[data-testid="chat-input"]').type('Olá, sou um novo usuário');
    cy.get('[data-testid="send-button"]').click();
    
    // Should show welcome message
    cy.contains('Bem-vindo', { timeout: 10000 });
    
    // Should not show admin features
    cy.get('[data-testid="admin-panel"]').should('not.exist');
  });

  it('should handle premium user features', () => {
    // Test premium user activation
    cy.get('[data-testid="chat-input"]').type('Ativar modo premium');
    cy.get('[data-testid="send-button"]').click();
    
    // Should show premium features
    cy.contains('Modo Premium ativado', { timeout: 10000 });
    cy.get('[data-testid="premium-features"]').should('be.visible');
  });

  it('should handle session timeout', () => {
    // Simulate session timeout
    cy.window().then((win) => {
      win.localStorage.clear();
      win.sessionStorage.clear();
    });
    
    cy.reload();
    
    // Should show login prompt
    cy.contains('Faça login', { timeout: 10000 });
  });

  it('should validate user permissions', () => {
    // Test unauthorized access
    cy.get('[data-testid="chat-input"]').type('Acessar dados de outros usuários');
    cy.get('[data-testid="send-button"]').click();
    
    // Should deny access
    cy.contains('Acesso negado', { timeout: 10000 });
  });
});
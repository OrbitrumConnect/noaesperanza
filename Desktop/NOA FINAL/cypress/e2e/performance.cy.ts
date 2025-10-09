describe('NOA Esperanza - Performance Tests', () => {
  beforeEach(() => {
    // Set desktop viewport for better testing
    cy.viewport(1280, 720) // Desktop size
    
    cy.visit('/');
    cy.wait(2000) // Wait for page to fully load
  });

  it('should load the application within acceptable time', () => {
    const startTime = Date.now();
    
    cy.get('[data-testid="chat-input"]', { timeout: 10000 }).should('be.visible');
    
    const loadTime = Date.now() - startTime;
    expect(loadTime).to.be.lessThan(5000); // Should load within 5 seconds
  });

  it('should handle large conversations efficiently', () => {
    // Generate large conversation
    const messages = Array.from({ length: 50 }, (_, i) => `Mensagem ${i + 1}`);
    
    messages.forEach((message) => {
      cy.get('[data-testid="chat-input"]').type(message);
      cy.get('[data-testid="send-button"]').click();
      cy.wait(100); // Small delay between messages
    });
    
    // Should maintain performance
    cy.get('[data-testid="chat-messages"]').should('be.visible');
    cy.get('[data-testid="chat-input"]').should('be.visible');
  });

  it('should handle voice input efficiently', () => {
    // Test voice input performance
    cy.get('[data-testid="voice-button"]').click();
    
    // Should activate voice input quickly
    cy.get('[data-testid="voice-recording"]', { timeout: 3000 }).should('be.visible');
    
    // Should process voice input efficiently
    cy.get('[data-testid="voice-processing"]').should('be.visible');
  });

  it('should handle file uploads efficiently', () => {
    // Test file upload performance
    cy.get('[data-testid="file-upload"]').click();
    
    // Upload a test file
    cy.get('[data-testid="file-input"]').selectFile('cypress/fixtures/test-document.pdf');
    
    // Should process file quickly
    cy.contains('Arquivo processado', { timeout: 10000 });
  });

  it('should maintain responsive design', () => {
    // Test different viewport sizes
    const viewports = [
      { width: 320, height: 568 }, // Mobile
      { width: 768, height: 1024 }, // Tablet
      { width: 1920, height: 1080 }, // Desktop
    ];
    
    viewports.forEach((viewport) => {
      cy.viewport(viewport.width, viewport.height);
      cy.get('[data-testid="chat-input"]').should('be.visible');
      cy.get('[data-testid="chat-messages"]').should('be.visible');
    });
  });

  it('should handle memory usage efficiently', () => {
    // Test memory usage over time
    cy.window().then((win) => {
      const initialMemory = win.performance.memory?.usedJSHeapSize || 0;
      
      // Perform multiple operations
      for (let i = 0; i < 20; i++) {
        cy.get('[data-testid="chat-input"]').type(`Test ${i}`);
        cy.get('[data-testid="send-button"]').click();
        cy.wait(100);
      }
      
      // Check memory usage
      cy.window().then((win) => {
        const finalMemory = win.performance.memory?.usedJSHeapSize || 0;
        const memoryIncrease = finalMemory - initialMemory;
        
        // Memory increase should be reasonable
        expect(memoryIncrease).to.be.lessThan(50 * 1024 * 1024); // 50MB
      });
    });
  });
});

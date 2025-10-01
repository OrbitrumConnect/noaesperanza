const { defineConfig } = require('cypress')

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    supportFile: 'cypress/support/e2e.ts',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: true,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    setupNodeEvents(on, config) {
      // Configurações específicas para Nôa Esperanza
      on('task', {
        log(message) {
          console.log(message)
          return null
        }
      })
    },
  },
  component: {
    devServer: {
      framework: 'react',
      bundler: 'vite',
    },
  },
  env: {
    // Variáveis de ambiente para testes
    SUPABASE_URL: 'https://lhclqebtkyfftkevumix.supabase.co',
    TEST_USER_EMAIL: 'test@noaesperanza.com',
    TEST_USER_PASSWORD: 'test123456'
  }
})

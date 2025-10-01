# 🧪 **TESTES E2E - NÔA ESPERANZA**

## 📋 **VISÃO GERAL**

Este diretório contém todos os testes End-to-End (E2E) para a plataforma Nôa Esperanza, utilizando Cypress para testar fluxos completos de usuário.

## 🎯 **ESTRUTURA DE TESTES**

### **📁 Arquivos de Teste:**

1. **`chat-flow.cy.js`** - Fluxo completo do chat
2. **`nft-system.cy.js`** - Sistema NFT e certificação
3. **`imre-blocks.cy.js`** - 28 blocos canônicos IMRE
4. **`voice-system.cy.js`** - Speech-to-Text e Text-to-Speech
5. **`supabase-integration.cy.js`** - Integração com banco de dados

### **📁 Arquivos de Configuração:**

- **`cypress.config.js`** - Configuração principal do Cypress
- **`support/e2e.js`** - Configurações globais e comandos customizados
- **`support/commands.js`** - Comandos reutilizáveis
- **`fixtures/test-data.json`** - Dados de teste

## 🚀 **COMO EXECUTAR**

### **1. Executar todos os testes:**
```bash
npm run test:cypress
```

### **2. Abrir interface do Cypress:**
```bash
npm run test:cypress:open
```

### **3. Executar apenas testes E2E:**
```bash
npm run test:cypress:e2e
```

### **4. Executar teste específico:**
```bash
npx cypress run --spec "cypress/e2e/chat-flow.cy.js"
```

## 🎯 **CENÁRIOS DE TESTE**

### **1. 💬 Chat Flow (`chat-flow.cy.js`)**
- ✅ Pergunta inicial obrigatória
- ✅ Apresentação da Nôa Esperanza
- ✅ Menu de tipos de usuário
- ✅ Menus específicos por tipo
- ✅ Fluxo completo até NFT

### **2. 🪙 Sistema NFT (`nft-system.cy.js`)**
- ✅ Explicação do NFT Incentivador
- ✅ Geração de relatório NFT
- ✅ Metadados do NFT
- ✅ Download do relatório
- ✅ Dashboard do NFT

### **3. 🩺 Blocos IMRE (`imre-blocks.cy.js`)**
- ✅ Todos os 28 blocos canônicos
- ✅ Respostas negativas
- ✅ Respostas complexas
- ✅ Validação de respostas

### **4. 🎤 Sistema de Voz (`voice-system.cy.js`)**
- ✅ Speech-to-Text
- ✅ Text-to-Speech
- ✅ Interrupção de fala
- ✅ Múltiplas interações
- ✅ Fallback de erro

### **5. 🗄️ Integração Supabase (`supabase-integration.cy.js`)**
- ✅ Conexão com banco
- ✅ Salvamento de conversas
- ✅ Fluxo de conversa
- ✅ Dados de aprendizado
- ✅ Relatórios NFT
- ✅ Funções SQL

## 🛠️ **COMANDOS CUSTOMIZADOS**

### **Comandos de Chat:**
```javascript
cy.waitForNoaToLoad()           // Aguarda Nôa carregar
cy.sendChatMessage('texto')     // Envia mensagem
cy.waitForNoaResponse()         // Aguarda resposta
cy.checkNoaMessage('texto')     // Verifica mensagem
cy.selectUserType('paciente')   // Seleciona tipo
cy.startClinicalEvaluation()    // Inicia avaliação
cy.completeImreBlock('resposta') // Completa bloco
cy.checkNftGenerated()          // Verifica NFT
```

### **Comandos de Voz:**
```javascript
cy.mockSpeechRecognition()      // Mock reconhecimento
cy.mockSpeechSynthesis()        // Mock síntese
cy.simulateVoiceInput('texto')  // Simula entrada
cy.waitForNoaToStopSpeaking()   // Aguarda parar
```

### **Comandos de Sistema:**
```javascript
cy.clearTestData()              // Limpa dados
cy.mockSupabase()               // Mock Supabase
```

## 📊 **DADOS DE TESTE**

### **Tipos de Usuário:**
- **Paciente**: Respostas médicas completas
- **Profissional**: Acesso a ferramentas clínicas
- **Aluno**: Acesso ao ensino

### **Cenários de Resposta:**
- **Rápidas**: "nenhuma", "não", "sim"
- **Detalhadas**: Respostas complexas e completas
- **Negativas**: Todas as respostas negativas

## 🔧 **CONFIGURAÇÃO**

### **Variáveis de Ambiente:**
```javascript
// cypress.config.js
env: {
  SUPABASE_URL: 'https://lhclqebtkyfftkevumix.supabase.co',
  TEST_USER_EMAIL: 'test@noaesperanza.com',
  TEST_USER_PASSWORD: 'test123456'
}
```

### **Timeouts:**
- **Comando padrão**: 10 segundos
- **Request**: 10 segundos
- **Response**: 10 segundos

## 📈 **RELATÓRIOS**

### **Vídeos:**
- ✅ Gravados automaticamente
- ✅ Salvos em `cypress/videos/`

### **Screenshots:**
- ✅ Capturados em falhas
- ✅ Salvos em `cypress/screenshots/`

### **Coverage:**
```bash
npm run test:coverage
```

## 🐛 **DEBUGGING**

### **1. Modo Debug:**
```javascript
cy.debug() // Pausa execução
cy.pause() // Pausa para inspeção
```

### **2. Logs:**
```javascript
cy.log('Mensagem de debug')
cy.task('log', 'Mensagem no console')
```

### **3. Screenshots Manuais:**
```javascript
cy.screenshot('nome-do-screenshot')
```

## 🚨 **TROUBLESHOOTING**

### **Problemas Comuns:**

1. **Timeout de conexão:**
   - Verificar se app está rodando em `localhost:3000`
   - Aumentar timeout se necessário

2. **Elementos não encontrados:**
   - Verificar `data-testid` nos componentes
   - Aguardar carregamento com `cy.wait()`

3. **Mocks não funcionando:**
   - Verificar se mocks estão configurados
   - Limpar mocks entre testes

4. **Supabase errors:**
   - Verificar configuração do mock
   - Verificar RLS policies

## 📝 **BEST PRACTICES**

### **1. Testes Isolados:**
- Cada teste deve ser independente
- Limpar dados entre testes
- Usar `beforeEach()` para setup

### **2. Seletores:**
- Usar `data-testid` sempre que possível
- Evitar seletores CSS frágeis
- Preferir texto visível quando apropriado

### **3. Aguardar Elementos:**
- Sempre aguardar elementos aparecerem
- Usar `cy.waitFor()` para operações assíncronas
- Não usar `cy.wait()` com tempo fixo

### **4. Dados de Teste:**
- Usar fixtures para dados consistentes
- Mockar APIs externas
- Limpar estado entre testes

## 🎯 **PRÓXIMOS PASSOS**

1. **Adicionar testes de performance**
2. **Implementar testes de acessibilidade**
3. **Adicionar testes visuais**
4. **Implementar CI/CD com testes**

---

**Para mais informações, consulte a [documentação oficial do Cypress](https://docs.cypress.io/)**

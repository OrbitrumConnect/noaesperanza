# 🛠️ Setup Quality Tools - NOA Esperanza

## 📦 Instalação das Dependências

```bash
# Instalar Cypress
npm install --save-dev cypress @cypress/react @cypress/vite

# Instalar SonarQube Scanner
npm install --save-dev sonar-scanner

# Instalar ESLint e TypeScript
npm install --save-dev eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin

# Instalar Coverage
npm install --save-dev @vitest/coverage-v8
```

## 🔧 Configuração do SonarQube

### 1. Criar projeto no SonarCloud
- Acesse: https://sonarcloud.io
- Crie um novo projeto
- Copie o token de autenticação

### 2. Configurar variáveis de ambiente
```bash
# Adicionar ao .env
SONAR_TOKEN=seu_token_aqui
SONAR_HOST_URL=https://sonarcloud.io
```

### 3. Executar análise
```bash
npm run sonar
```

## 🧪 Configuração do Cypress

### 1. Abrir Cypress
```bash
npm run test:open
```

### 2. Executar testes
```bash
# Todos os testes
npm run test

# Apenas E2E
npm run test:e2e

# Apenas Component
npm run test:component
```

## 📊 Comandos de Qualidade

```bash
# Verificação completa de qualidade
npm run quality

# Apenas linting
npm run lint

# Apenas type checking
npm run type-check

# Coverage
npm run coverage
```

## 🎯 Benefícios

### ✅ Cursor + SonarQube + Cypress:
- **Código limpo** e sem bugs
- **Testes automatizados** completos
- **Qualidade** garantida
- **Deploy** seguro
- **Manutenção** facilitada

### 📈 Métricas de Qualidade:
- **Code Coverage**: >80%
- **Duplicated Lines**: <3%
- **Maintainability Rating**: A
- **Reliability Rating**: A
- **Security Rating**: A

## 🚀 Próximos Passos

1. **Instalar** as dependências
2. **Configurar** SonarQube
3. **Executar** testes
4. **Integrar** com CI/CD
5. **Monitorar** qualidade

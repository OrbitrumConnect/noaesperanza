# 🎯 NOA Esperanza - Quality Stack

Este documento descreve a stack de qualidade implementada no projeto NOA Esperanza, incluindo todas as ferramentas, configurações e processos de qualidade de código.

## 📋 Visão Geral

A stack de qualidade do NOA Esperanza inclui:

- **Análise Estática**: ESLint, Prettier, TypeScript
- **Testes**: Vitest (unitários), Cypress (E2E)
- **Cobertura**: V8 Coverage
- **Análise de Código**: SonarQube
- **CI/CD**: GitHub Actions
- **Monitoramento**: Dashboard de Qualidade
- **Git Hooks**: Husky + lint-staged

## 🛠️ Ferramentas Instaladas

### Dependências de Desenvolvimento

```json
{
  "cypress": "^13.6.0",
  "eslint": "^8.57.0",
  "@typescript-eslint/eslint-plugin": "^6.21.0",
  "@typescript-eslint/parser": "^6.21.0",
  "eslint-plugin-react": "^7.34.1",
  "eslint-plugin-react-hooks": "^4.6.0",
  "eslint-plugin-jsx-a11y": "^6.8.0",
  "prettier": "^3.2.5",
  "eslint-config-prettier": "^9.1.0",
  "eslint-plugin-prettier": "^5.1.3",
  "husky": "^9.0.11",
  "lint-staged": "^15.2.2",
  "sonar-scanner": "^3.1.0",
  "@vitest/coverage-v8": "^1.2.0",
  "vitest": "^1.2.0",
  "jsdom": "^24.0.0",
  "@testing-library/react": "^14.2.1",
  "@testing-library/jest-dom": "^6.4.2",
  "@testing-library/user-event": "^14.5.2"
}
```

## 🚀 Scripts Disponíveis

### Qualidade Geral
```bash
npm run quality        # Executa todas as verificações de qualidade
npm run quality:quick  # Executa verificações rápidas de qualidade
```

### Testes
```bash
npm run test           # Executa testes unitários
npm run test:ui        # Abre interface do Vitest
npm run test:coverage  # Executa testes com cobertura
npm run test:watch     # Executa testes em modo watch
npm run test:cypress   # Executa testes Cypress
npm run test:cypress:open # Abre Cypress Test Runner
```

### Linting e Formatação
```bash
npm run lint           # Executa ESLint
npm run lint:fix       # Corrige problemas do ESLint
npm run format         # Formata código com Prettier
npm run format:check   # Verifica formatação
npm run type-check     # Verifica tipos TypeScript
```

### Análise de Código
```bash
npm run sonar          # Executa análise SonarQube
```

## 📁 Estrutura de Arquivos

```
├── .eslintrc.js              # Configuração ESLint
├── .prettierrc               # Configuração Prettier
├── .prettierignore           # Arquivos ignorados pelo Prettier
├── .lintstagedrc.js          # Configuração lint-staged
├── vitest.config.ts          # Configuração Vitest
├── lighthouse.config.js      # Configuração Lighthouse
├── sonar-project.properties  # Configuração SonarQube
├── .husky/                   # Git hooks
│   ├── pre-commit
│   └── pre-push
├── .github/workflows/        # GitHub Actions
│   └── quality.yml
├── cypress/                  # Testes E2E
│   ├── e2e/
│   │   ├── authentication.cy.ts
│   │   ├── clinical-evaluation.cy.ts
│   │   ├── ai-learning.cy.ts
│   │   └── performance.cy.ts
│   └── fixtures/
├── src/
│   ├── test/                 # Configuração de testes
│   │   ├── setup.ts
│   │   └── vitest-setup.ts
│   ├── components/__tests__/ # Testes unitários
│   ├── services/__tests__/
│   └── utils/__tests__/
└── scripts/
    ├── setup-quality.sh      # Script de setup (Linux/Mac)
    └── setup-quality.ps1     # Script de setup (Windows)
```

## 🔧 Configurações

### ESLint
- Configurado para React + TypeScript
- Regras de acessibilidade (jsx-a11y)
- Integração com Prettier
- Máximo de 0 warnings permitidos

### Prettier
- Formatação consistente
- Single quotes
- Semicolons obrigatórios
- 80 caracteres por linha

### Vitest
- Ambiente jsdom para testes React
- Cobertura com V8
- Thresholds de cobertura: 70%
- Setup automático de mocks

### Cypress
- Testes E2E completos
- Configuração para múltiplos ambientes
- Suporte a fixtures
- Integração com CI/CD

### SonarQube
- Análise de qualidade de código
- Detecção de bugs e vulnerabilidades
- Métricas de duplicação
- Quality gates configurados

## 🎯 Métricas de Qualidade

### Thresholds Configurados
- **Cobertura de Código**: 70%
- **Taxa de Sucesso dos Testes**: 95%
- **Erros de Lint**: 0
- **Problemas de Segurança**: 0
- **Performance Score**: 90
- **Acessibilidade Score**: 95

### Quality Gates
- Cobertura de código >= 70%
- Duplicação <= 3%
- Manutenibilidade >= A
- Confiabilidade >= A
- Segurança >= A

## 🚀 CI/CD Pipeline

### GitHub Actions
O pipeline inclui:

1. **Quality Checks**
   - ESLint
   - Prettier
   - TypeScript
   - Testes unitários
   - Cobertura de código

2. **Security**
   - npm audit
   - Snyk security scan

3. **Performance**
   - Lighthouse CI
   - Métricas de performance

4. **E2E Tests**
   - Cypress tests
   - Múltiplos browsers

### Triggers
- Push para `main` e `develop`
- Pull requests para `main` e `develop`

## 📊 Dashboard de Qualidade

O componente `QualityDashboard` fornece:

- Métricas em tempo real
- Alertas de problemas
- Links para relatórios
- Ações rápidas
- Histórico de qualidade

## 🔒 Git Hooks

### Pre-commit
- Lint-staged (ESLint + Prettier)
- Verificação de tipos TypeScript

### Pre-push
- Verificações rápidas de qualidade
- Testes unitários

## 🛡️ Segurança

### Ferramentas de Segurança
- **npm audit**: Verificação de vulnerabilidades
- **Snyk**: Análise de dependências
- **SonarQube**: Detecção de hotspots de segurança

### Configurações
- Análise de todos os arquivos
- Relatórios de segurança
- Alertas automáticos

## 📈 Monitoramento

### Métricas Rastreadas
- Cobertura de código
- Taxa de sucesso dos testes
- Erros de lint
- Problemas de segurança
- Performance
- Acessibilidade

### Relatórios
- SonarQube Dashboard
- Coverage reports
- Lighthouse reports
- Security reports

## 🚀 Como Usar

### Setup Inicial
```bash
# Windows
.\scripts\setup-quality.ps1

# Linux/Mac
./scripts/setup-quality.sh
```

### Desenvolvimento Diário
```bash
# Antes de fazer commit
npm run pre-commit

# Antes de fazer push
npm run pre-push

# Verificação completa
npm run quality
```

### Adicionando Novos Testes
1. Crie arquivos `.test.ts` ou `.test.tsx` em `src/`
2. Use `describe` e `it` para estruturar testes
3. Execute `npm run test` para verificar

### Adicionando Testes E2E
1. Crie arquivos `.cy.ts` em `cypress/e2e/`
2. Use comandos Cypress para interagir com a UI
3. Execute `npm run test:cypress:open` para desenvolver

## 🔧 Troubleshooting

### Problemas Comuns

1. **ESLint errors**
   ```bash
   npm run lint:fix
   ```

2. **Prettier formatting issues**
   ```bash
   npm run format
   ```

3. **TypeScript errors**
   ```bash
   npm run type-check
   ```

4. **Test failures**
   ```bash
   npm run test -- --reporter=verbose
   ```

5. **Cypress issues**
   ```bash
   npm run test:cypress:open
   ```

### Logs e Debugging
- Testes: `npm run test -- --reporter=verbose`
- Cypress: `npm run test:cypress:open`
- SonarQube: Verificar logs no dashboard

## 📚 Recursos Adicionais

- [ESLint Documentation](https://eslint.org/docs/)
- [Prettier Documentation](https://prettier.io/docs/)
- [Vitest Documentation](https://vitest.dev/)
- [Cypress Documentation](https://docs.cypress.io/)
- [SonarQube Documentation](https://docs.sonarqube.org/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

## 🤝 Contribuição

Para contribuir com melhorias na stack de qualidade:

1. Crie uma issue descrevendo a melhoria
2. Implemente a mudança
3. Execute `npm run quality` para verificar
4. Crie um pull request

## 📝 Changelog

### v3.0.0
- Implementação completa da stack de qualidade
- Integração com SonarQube
- Dashboard de qualidade
- CI/CD pipeline
- Testes E2E com Cypress
- Testes unitários com Vitest
- Git hooks com Husky
- Análise de segurança
- Monitoramento de performance

---

**Desenvolvido com ❤️ para o projeto NOA Esperanza**

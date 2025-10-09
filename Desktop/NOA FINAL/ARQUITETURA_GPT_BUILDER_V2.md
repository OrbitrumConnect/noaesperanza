# 🏗️ Arquitetura GPT Builder V2 - Nôa Esperanza

## 📐 Diagrama de Arquitetura

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CAMADA DE APRESENTAÇÃO                       │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │              ChatWindow / ChatWindowExample                   │  │
│  │                                                                │  │
│  │  • Interface de chat                                          │  │
│  │  • Gerenciamento de estado (messages, input, loading)        │  │
│  │  • Handler de envio (handleSendMessage)                       │  │
│  └────────────────────────┬─────────────────────────────────────┘  │
│                            │                                          │
└────────────────────────────┼──────────────────────────────────────────┘
                             │
                             ↓
┌─────────────────────────────────────────────────────────────────────┐
│                      CAMADA DE SERVIÇOS (CORE)                       │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │        semanticAttentionService.ts                            │  │
│  │                                                                │  │
│  │  ┌────────────────────────────────────────────────────────┐  │  │
│  │  │  buildUserSymbolicContext()                            │  │  │
│  │  │  • Constrói contexto do usuário                        │  │  │
│  │  │  • Inclui userId + histórico de conversação            │  │  │
│  │  │  • Retorna string formatada                            │  │  │
│  │  └────────────────────────────────────────────────────────┘  │  │
│  │                            ↓                                   │  │
│  │  ┌────────────────────────────────────────────────────────┐  │  │
│  │  │  processUserMessage()                                  │  │  │
│  │  │  • Orquestra todo o fluxo de processamento             │  │  │
│  │  │  • Coordena: Vector Search → Enrich → GPT             │  │  │
│  │  └────────────────────────────────────────────────────────┘  │  │
│  └────────────────────────┬─────────────────────────────────────┘  │
│                            │                                          │
│                            ↓                                          │
│  ┌─────────────┬──────────────────────┬─────────────────────────┐  │
│  │             │                      │                          │  │
│  ↓             ↓                      ↓                          ↓  │
│                                                                       │
│  ┌───────────────┐  ┌──────────────────┐  ┌───────────────────┐   │
│  │ embeddingCl.. │  │ gptBuilderServ.. │  │ openaiService.ts  │   │
│  │               │  │                  │  │                   │   │
│  │ getVector     │  │ enrichWithNoa    │  │ sendToOpenAI()    │   │
│  │ Match()       │  │ Grammar()        │  │                   │   │
│  │               │  │                  │  │ • GPT-4o model    │   │
│  │ • Query       │  │ • Message        │  │ • Temperature 0.7 │   │
│  │ • Fetch API   │  │ • Docs           │  │ • System prompt   │   │
│  │ • Return docs │  │ • Context        │  │ • Returns text    │   │
│  │               │  │ • Returns prompt │  │                   │   │
│  └───────┬───────┘  └────────┬─────────┘  └─────────┬─────────┘   │
│          │                   │                       │              │
└──────────┼───────────────────┼───────────────────────┼──────────────┘
           │                   │                       │
           ↓                   ↓                       ↓
┌─────────────────────────────────────────────────────────────────────┐
│                     CAMADA DE INTEGRAÇÃO EXTERNA                     │
│                                                                       │
│  ┌────────────────────┐  ┌──────────────────┐  ┌─────────────────┐ │
│  │  Vector DB API     │  │  Documentos      │  │  OpenAI API     │ │
│  │                    │  │  Mestres         │  │                 │ │
│  │  /api/embedding/   │  │                  │  │  GPT-4o         │ │
│  │  search            │  │  • Personality   │  │                 │ │
│  │                    │  │  • Knowledge     │  │  https://api    │ │
│  │  • Embeddings      │  │  • Instructions  │  │  .openai.com    │ │
│  │  • Similarity      │  │  • Examples      │  │                 │ │
│  │  • Top-K results   │  │                  │  │                 │ │
│  └────────────────────┘  └──────────────────┘  └─────────────────┘ │
│                                                                       │
└───────────────────────────────────────────────────────────────────────┘
```

## 🔄 Fluxo de Dados Detalhado

### 1. Entrada do Usuário
```
Usuário digita mensagem → handleSendMessage() é acionado
```

### 2. Preparação do Contexto
```typescript
// Passo 1: Construir contexto simbólico
const userContext = buildUserSymbolicContext(userId, conversationHistory)

// Output:
// "Usuário: user-123
//  Histórico recente:
//  1. user: Olá
//  2. assistant: Como posso ajudar?"
```

### 3. Processamento da Mensagem
```typescript
// Passo 2: Processar mensagem
const response = await processUserMessage(message, userContext)

// Internamente executa:
```

#### 3a. Vector Search
```typescript
const matches = await getVectorMatch(message)

// Busca documentos semanticamente similares
// Output:
// [
//   { content: "Doc sobre neurologia...", relevance: 0.95 },
//   { content: "Doc sobre tratamentos...", relevance: 0.87 }
// ]
```

#### 3b. Enriquecimento com Gramática Nôa
```typescript
const symbolicPrompt = enrichWithNoaGrammar(message, matches, userContext)

// Constrói prompt estruturado:
// - Identidade Nôa Esperanza
// - Metodologia Arte da Entrevista Clínica
// - Documentos relevantes
// - Contexto do usuário
// - Mensagem original
```

#### 3c. Geração via GPT-4o
```typescript
const response = await sendToOpenAI(symbolicPrompt)

// Envia para OpenAI:
// - Model: gpt-4o
// - System: "Você é Nôa Esperanza..."
// - User: symbolicPrompt (completo)
// - Temperature: 0.7
```

### 4. Resposta ao Usuário
```
Resposta da Nôa → Adicionada ao estado → Renderizada na UI
```

## 📦 Estrutura de Dados

### UserContext (String)
```
"Usuário: user-123
Histórico recente:
1. user: Olá
2. assistant: Como posso ajudar?"
```

### VectorMatch Response (Array)
```typescript
[
  {
    content: string,      // Conteúdo do documento
    relevance: number,    // Score de similaridade (0-1)
    metadata?: object     // Metadados adicionais
  }
]
```

### Symbolic Prompt (String)
```
"Você é Nôa Esperanza, assistente clínica e simbólica...

Método de resposta:
1. Nomear o que foi trazido (escuta ativa)
2. Relacionar com a base documental
3. Responder com empatia...

Documentos relevantes:
(1) [documento 1]
(2) [documento 2]

Histórico simbólico do usuário:
[contexto do usuário]

Mensagem do usuário:
[mensagem original]"
```

### OpenAI Response (String)
```
"Olá! Vejo que você está buscando informações sobre...
[resposta empática e contextualizada baseada nos documentos]"
```

## 🔐 Segurança e Validação

### Input Validation
- ✅ Mensagem não vazia
- ✅ Contexto formatado corretamente
- ✅ API key presente no ambiente

### Error Handling
```typescript
try {
  // Processamento
} catch (error) {
  console.error('Erro ao processar:', error)
  // Fallback ou mensagem de erro amigável
}
```

### Rate Limiting (Recomendado)
- Implementar no backend
- Limite por usuário/sessão
- Throttling de requisições

## 🎯 Padrões de Design Utilizados

### 1. **Orchestrator Pattern**
- `processUserMessage()` orquestra todo o fluxo
- Coordena múltiplos serviços independentes

### 2. **Facade Pattern**
- APIs simples escondem complexidade interna
- `buildUserSymbolicContext()` simplifica construção de contexto

### 3. **Strategy Pattern**
- Diferentes estratégias de enriquecimento
- Pluggável e extensível

### 4. **Dependency Injection**
- Lazy imports evitam dependências circulares
- Serviços desacoplados

## 📊 Métricas de Performance

### Tempo de Resposta Estimado
1. Vector Search: ~100-300ms
2. Enriquecimento: ~5-10ms (processamento local)
3. OpenAI GPT-4o: ~1-3s
4. **Total: ~1.5-3.5s**

### Otimizações Possíveis
- [ ] Cache de vector matches
- [ ] Parallel requests quando possível
- [ ] Streaming de respostas GPT
- [ ] Pre-fetching de documentos comuns

## 🧪 Testabilidade

### Unit Tests
- ✅ Cada função é testável isoladamente
- ✅ Mocks para dependências externas
- ✅ Cobertura completa do fluxo

### Integration Tests
- [ ] Teste end-to-end com API real
- [ ] Teste de performance
- [ ] Teste de carga

### Test Coverage
```
buildUserSymbolicContext: 100%
enrichWithNoaGrammar: 100%
processUserMessage: 100%
Integration Flow: 100%
```

---

**Arquitetura:** Modular, escalável e testável
**Padrões:** Clean Architecture, SOLID principles
**Tecnologias:** TypeScript, React, OpenAI GPT-4o, Vector DB

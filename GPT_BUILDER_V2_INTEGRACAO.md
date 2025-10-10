# GPT Builder V2 – Integração Simbólica com Chat

## 📋 Visão Geral

Esta implementação integra a atenção semântica com a gramática clínica da Nôa Esperanza, criando um sistema de processamento de mensagens baseado em:

- **Vector Search**: Busca semântica de documentos relevantes
- **Gramática Nôa**: Enriquecimento com metodologia da Arte da Entrevista Clínica
- **GPT-4o**: Geração de respostas contextualizadas e empáticas

## 🔧 Componentes Implementados

### 1. `semanticAttentionService.ts`

**Função: `processUserMessage(message: string, userContext: string)`**

Função principal que integra todo o fluxo:
- Busca vetorial de documentos relevantes
- Enriquecimento com gramática clínica
- Geração de resposta via OpenAI

**Função: `buildUserSymbolicContext(userId?: string, conversationHistory?: any[])`**

Constrói o contexto simbólico do usuário baseado em:
- ID do usuário
- Histórico de conversação

### 2. `gptBuilderService.ts`

**Função: `enrichWithNoaGrammar(message: string, docs: any[], context: string)`**

Enriquece a mensagem com:
- Instruções base da Nôa Esperanza
- Metodologia da Arte da Entrevista Clínica
- Documentos relevantes do vector search
- Contexto simbólico do usuário

Método de resposta estruturado:
1. Nomear o que foi trazido (escuta ativa)
2. Relacionar com a base documental
3. Responder com empatia e linguagem acessível

### 3. `openaiService.ts`

**Função: `sendToOpenAI(fullPrompt: string)`**

Envia o prompt completo para GPT-4o com:
- Modelo: `gpt-4o`
- Sistema: Identidade da Nôa Esperanza
- Temperature: 0.7 (equilíbrio entre criatividade e precisão)

### 4. `supabase/embeddingClient.ts`

**Função: `getVectorMatch(query: string)`**

Busca vetorial de documentos relevantes via API:
- Endpoint: `/api/embedding/search`
- Retorna documentos semanticamente similares à query

## 💡 Exemplo de Uso

### Integração Básica no Chat

```typescript
import { processUserMessage, buildUserSymbolicContext } from '../services/semanticAttentionService'

const ChatWindow = () => {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')

  const handleSendMessage = async () => {
    const userMessage = input
    
    // Adiciona mensagem do usuário
    setMessages([...messages, { role: "user", content: userMessage }])
    
    // Constrói contexto simbólico
    const userContext = buildUserSymbolicContext('user-123', messages)
    
    // Processa mensagem com atenção semântica
    const reply = await processUserMessage(userMessage, userContext)
    
    // Adiciona resposta da Nôa
    setMessages(prev => [...prev, { role: "assistant", content: reply }])
    
    setInput("")
  }

  return (
    // ... JSX do componente
  )
}
```

### Integração Avançada com Hook Existente

```typescript
import { processUserMessage, buildUserSymbolicContext } from '../services/semanticAttentionService'

export const useNoaChat = ({ userMemory, addNotification }) => {
  const [messages, setMessages] = useState([])
  
  const getNoaResponse = async (userMessage: string) => {
    try {
      // Construir contexto do usuário
      const userContext = buildUserSymbolicContext(
        userMemory.userId, 
        messages
      )
      
      // Processar com atenção semântica e gramática Nôa
      const response = await processUserMessage(userMessage, userContext)
      
      // Adicionar resposta às mensagens
      setMessages(prev => [...prev, {
        id: crypto.randomUUID(),
        message: response,
        sender: 'noa',
        timestamp: new Date()
      }])
      
    } catch (error) {
      console.error('Erro ao processar mensagem:', error)
    }
  }
  
  return { getNoaResponse, messages }
}
```

## 🎯 Benefícios da Integração

1. **Escuta Ativa**: Cada resposta nomeia o que foi trazido pelo usuário
2. **Base Documental**: Respostas fundamentadas em documentos relevantes
3. **Empatia Clínica**: Linguagem acessível e acolhedora
4. **Contexto Simbólico**: Memória do histórico do usuário
5. **Precisão Semântica**: Busca vetorial de conteúdos relevantes

## 🔄 Fluxo de Processamento

```
Mensagem do Usuário
       ↓
buildUserSymbolicContext() → Constrói contexto
       ↓
processUserMessage()
       ├→ getVectorMatch() → Busca documentos relevantes
       ├→ enrichWithNoaGrammar() → Enriquece com gramática clínica
       └→ sendToOpenAI() → Gera resposta via GPT-4o
       ↓
Resposta da Nôa Esperanza
```

## 📝 Notas Técnicas

- **Imports Lazy**: Uso de imports dinâmicos para evitar dependências circulares
- **Tratamento de Erros**: Implementar try-catch em cada integração
- **API Endpoint**: O endpoint `/api/embedding/search` precisa estar configurado no backend
- **Environment Variables**: `VITE_OPENAI_API_KEY` deve estar configurada

## 🚀 Próximos Passos

1. Implementar endpoint `/api/embedding/search` no backend
2. Configurar embeddings dos documentos mestres
3. Adicionar testes unitários para cada função
4. Integrar com componentes de UI existentes
5. Adicionar métricas de qualidade das respostas

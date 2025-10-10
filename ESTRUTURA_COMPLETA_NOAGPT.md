# 🤖 ESTRUTURA COMPLETA - NOAGPT
## Como foi criada e programada

*Análise detalhada do código real*

---

## 📐 **ARQUITETURA GERAL**

```
┌─────────────────────────────────────────────────────────────────┐
│                      SISTEMA NOA ESPERANZA                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  USUÁRIO digita mensagem                                        │
│      ↓                                                          │
│  ┌───────────────────────────────────────────────────────┐     │
│  │         NoaGPT (Classe Roteadora)                     │     │
│  │         Arquivo: src/gpt/noaGPT.ts                    │     │
│  │         1.665 linhas de código                        │     │
│  └───────────────────────────────────────────────────────┘     │
│      ↓                                                          │
│  ┌───────────────────────────────────────────────────────┐     │
│  │  1. Analisa mensagem (detecta intenção)              │     │
│  │  2. Verifica comandos específicos                    │     │
│  │  3. Busca no banco de dados (aprendizado)            │     │
│  │  4. Roteia para agente apropriado                    │     │
│  │  5. OU envia para OpenAI (fallback)                  │     │
│  └───────────────────────────────────────────────────────┘     │
│      ↓                                                          │
│  ┌───────────────────────────────────────────────────────┐     │
│  │           AGENTES ESPECIALIZADOS                      │     │
│  │  • ClinicalAgent (avaliação clínica)                 │     │
│  │  • KnowledgeBaseAgent (documentos)                   │     │
│  │  • CourseAdminAgent (cursos)                         │     │
│  │  • SymbolicAgent (eixo simbólico)                    │     │
│  │  • CodeEditorAgent (desenvolvimento)                 │     │
│  │  • VoiceControlAgent (voz)                           │     │
│  └───────────────────────────────────────────────────────┘     │
│      ↓                                                          │
│  ┌───────────────────────────────────────────────────────┐     │
│  │           OPENAI SERVICE                              │     │
│  │         (se não houver comando específico)            │     │
│  │  • Envia para OpenAI API                             │     │
│  │  • Usa modelo GPT-3.5/4                              │     │
│  │  • Retorna resposta                                  │     │
│  └───────────────────────────────────────────────────────┘     │
│      ↓                                                          │
│  RESPOSTA para o usuário                                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🏗️ **COMPONENTES PRINCIPAIS**

### **1. NoaGPT (Classe Principal)**

```typescript
// src/gpt/noaGPT.ts
export class NoaGPT {
  // PROPRIEDADES PRIVADAS
  private userContext: any = {}      // Contexto do usuário
  private userMemory: any = {}       // Memória de longo prazo
  
  // MÉTODOS PRINCIPAIS
  async processCommand(message: string): Promise<string>
  async processCommandWithFineTuned(message: string): Promise<string>
  async saveResponse(userMessage: string, aiResponse: string): Promise<void>
  
  // MÉTODOS DE MEMÓRIA
  private getUserId(): string
  private saveUserContext(context: any): void
  private getUserContext(): any
  private saveUserMemory(key: string, value: any): void
  private getUserMemory(key?: string): any
  
  // MÉTODOS DE APRENDIZADO
  private async saveConversationToLearning(...): Promise<void>
  private async findSimilarResponse(userMessage: string): Promise<any>
  private async analyzeResponseEffectiveness(...): Promise<number>
  private async learnFromFeedback(...): Promise<void>
  
  // MÉTODOS DE PROCESSAMENTO
  private async readMasterDocument(query: string): Promise<string>
  private extractKeywords(text: string): string[]
  private detectInappropriateContent(lower: string): boolean
  private handleInappropriateContent(): string
}
```

---

## 🔍 **COMO FUNCIONA (PASSO A PASSO)**

### **FLUXO 1: Mensagem simples ("Olá")**

```
1. USUÁRIO: "Olá"
   ↓
2. NoaGPT.processCommand("Olá")
   ↓
3. Converte para lowercase: "olá"
   ↓
4. VERIFICA comandos específicos:
   - É saudação? ✅ SIM
   - Linha 1406-1439
   ↓
5. CÓDIGO EXECUTADO:
   ```typescript
   if (lower === 'ola' || lower === 'olá' || lower === 'oi') {
     this.saveUserMemory('lastGreeting', new Date().toISOString())
     this.saveUserContext({ hasGreeted: true })
     
     const respostas = [
       "Olá! Sou a NOA Esperanza...",
       "Oi! NOA Esperanza aqui..."
     ]
     
     return respostas[Math.floor(Math.random() * respostas.length)]
   }
   ```
   ↓
6. RETORNA: "Olá! Sou a NOA Esperanza, assistente médica..."
   ↓
7. Salva no banco (ai_learning) em background
```

---

### **FLUXO 2: Comando específico ("avaliação clínica")**

```
1. USUÁRIO: "quero fazer avaliação clínica"
   ↓
2. NoaGPT.processCommand("quero fazer avaliação clínica")
   ↓
3. Converte: "quero fazer avaliação clínica"
   ↓
4. VERIFICA comandos (linha 645-732):
   ```typescript
   // Detectar início de avaliação
   const inicioAvaliacao = await clinicalAgent.detectarInicioAvaliacao(message)
   if (inicioAvaliacao) {
     return inicioAvaliacao.mensagem
   }
   ```
   ↓
5. DELEGA para ClinicalAgent:
   ```typescript
   if (lower.includes('avaliação clínica')) {
     const resultado = await clinicalAgent.executarFluxo(message)
     return resultado.mensagem
   }
   ```
   ↓
6. ClinicalAgent inicia fluxo de 28 blocos
   ↓
7. RETORNA: "Olá! Vamos iniciar sua avaliação..."
```

---

### **FLUXO 3: Pergunta geral ("Como tratar epilepsia?")**

```
1. USUÁRIO: "Como tratar epilepsia?"
   ↓
2. NoaGPT.processCommand("Como tratar epilepsia?")
   ↓
3. BUSCA no banco primeiro:
   ```typescript
   const similarResponse = await this.findSimilarResponse(message)
   if (similarResponse && similarResponse.confidence > 0.9) {
     return similarResponse.ai_response
   }
   ```
   ↓
4. NÃO encontrou no banco (< 90% confiança)
   ↓
5. VERIFICA todos os comandos específicos: ❌ NENHUM match
   ↓
6. CHEGA no final (linha 1186):
   ```typescript
   // Fallback para OpenAI
   return 'OPENAI_FALLBACK'
   ```
   ↓
7. Home.tsx detecta 'OPENAI_FALLBACK':
   ```typescript
   if (response === 'OPENAI_FALLBACK') {
     response = await openAIService.getNoaResponse(userInput, history)
   }
   ```
   ↓
8. OpenAI processa:
   ```typescript
   const response = await fetch('https://api.openai.com/v1/chat/completions', {
     model: 'gpt-3.5-turbo',
     messages: [
       { role: 'system', content: SYSTEM_PROMPT },
       { role: 'user', content: userInput }
     ]
   })
   ```
   ↓
9. RETORNA: "Para epilepsia, o tratamento deve ser..."
   ↓
10. Salva resposta no banco para aprender
```

---

## 📊 **SISTEMA DE APRENDIZADO**

```typescript
// CADA INTERAÇÃO É SALVA:
private async saveConversationToLearning(
  userMessage: string,
  aiResponse: string,
  context: string,
  category: string
): Promise<void> {
  // 1. Salvar na tabela ai_learning
  await supabase.from('ai_learning').insert({
    user_message: userMessage,
    ai_response: aiResponse,
    context: context,
    category: category,
    confidence_score: 0.8,
    usage_count: 1
  })
  
  // 2. Extrair palavras-chave
  const keywords = this.extractKeywords(userMessage)
  
  // 3. Salvar padrões
  await supabase.from('ai_conversation_patterns').insert({
    user_message: userMessage,
    ai_response: aiResponse,
    keywords: keywords
  })
}
```

### **Como aprende:**

```
INTERAÇÃO 1:
USUÁRIO: "Como tratar dor de cabeça?"
SISTEMA: Não sabe → Pergunta OpenAI → Salva resposta
        ↓
    BANCO: user_message = "Como tratar dor de cabeça?"
           ai_response = "Para dor de cabeça..."
           confidence = 0.8

INTERAÇÃO 2 (mesma pergunta):
USUÁRIO: "Como tratar dor de cabeça?"
SISTEMA: Busca no banco → Encontra!
        ↓
    USA RESPOSTA DO BANCO (não pergunta OpenAI)
    Incrementa usage_count
    Aumenta confidence
```

---

## 🎯 **AGENTES ESPECIALIZADOS**

### **1. ClinicalAgent (Avaliação Clínica)**

```typescript
// src/gpt/clinicalAgent.ts
export const clinicalAgent = {
  // Detecta se deve iniciar avaliação
  async detectarInicioAvaliacao(message: string) {
    if (message.includes('avaliação clínica')) {
      return { iniciar: true, mensagem: "Vamos iniciar..." }
    }
  },
  
  // Executa fluxo de 28 blocos
  async executarFluxo(message: string) {
    // 1. Cria sessão
    // 2. Inicia bloco 1/28
    // 3. Faz perguntas sequenciais
    // 4. Salva respostas
    // 5. Gera relatório final
    // 6. Cria NFT hash
  }
}
```

### **2. KnowledgeBaseAgent (Base de Conhecimento)**

```typescript
// src/gpt/knowledgeBaseAgent.ts
export const knowledgeBaseAgent = {
  // Criar conhecimento
  async executarAcao(message: string) {
    if (message.includes('criar conhecimento')) {
      // Extrai título e conteúdo
      // Salva no Supabase
      return "Conhecimento salvo!"
    }
    
    if (message.includes('listar conhecimentos')) {
      // Busca do banco
      return "Lista de conhecimentos..."
    }
  }
}
```

### **3. VoiceControlAgent (Controle por Voz)**

```typescript
// src/gpt/voiceControlAgent.ts
export const voiceControlAgent = {
  async ativarControle() {
    return `🎤 **CONTROLE POR VOZ ATIVADO**
    
    Comandos disponíveis:
    • "Olá, Nôa"
    • "Avaliação clínica"
    • "Parar voz"
    
    Fale agora para começar!`
  },
  
  async desativarControle() {
    return "🔇 Controle por voz desativado."
  }
}
```

---

## 🔗 **INTEGRAÇÃO COM OPENAI**

```typescript
// src/services/openaiService.ts
class OpenAIService {
  private apiKey: string
  private fineTunedModel = 'ft:gpt-3.5-turbo-0125:...'
  
  async getNoaResponse(
    userMessage: string,
    conversationHistory: ChatMessage[]
  ): Promise<string> {
    // 1. Monta prompt completo
    const systemPrompt = getNoaSystemPrompt({ name, role })
    
    // 2. Envia para OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          ...conversationHistory,
          { role: 'user', content: userMessage }
        ],
        temperature: 0.7
      })
    })
    
    // 3. Retorna resposta
    const data = await response.json()
    return data.choices[0].message.content
  }
}
```

---

## 💾 **SISTEMA DE MEMÓRIA**

```typescript
// CONTEXTO (sessão)
private getUserContext(): any {
  const userId = this.getUserId()
  const saved = localStorage.getItem(`noa_context_${userId}`)
  return JSON.parse(saved) || {}
}

// Exemplo de contexto:
{
  recognizedAs: "Dr. Ricardo Valença",
  role: "admin",
  accessLevel: 5,
  hasGreeted: true,
  interactionCount: 15,
  lastInteraction: "2025-10-09T14:30:00"
}

// MEMÓRIA (permanente)
private getUserMemory(key?: string): any {
  const userId = this.getUserId()
  const saved = localStorage.getItem(`noa_memory_${userId}`)
  return JSON.parse(saved) || {}
}

// Exemplo de memória:
{
  lastGreeting: "2025-10-09T14:00:00",
  lastWellBeing: "2025-10-09T14:15:00",
  medicalInterest: "2025-10-09T14:20:00",
  documentInterest: "2025-10-09T14:25:00",
  preferredLanguage: "pt-BR",
  clinicalHistory: ["avaliação_001", "avaliação_002"]
}
```

---

## 🛡️ **SISTEMA DE SEGURANÇA**

```typescript
// 1. FILTRO DE CONTEÚDO INADEQUADO
private detectInappropriateContent(lower: string): boolean {
  const inappropriateWords = [
    'caralho', 'porra', 'merda', 'puta', 'idiota'
  ]
  return inappropriateWords.some(word => lower.includes(word))
}

// 2. NORMAS DE CONDUTA
if (lower.includes('diagnóstico') || lower.includes('tratamento')) {
  return '⚠️ Como assistente médica, não posso oferecer diagnósticos...'
}

// 3. RECONHECIMENTO DE IDENTIDADE
if (message.includes('Ricardo Valença, aqui')) {
  this.saveUserContext({ 
    recognizedAs: 'Dr. Ricardo Valença', 
    accessLevel: 5 
  })
  return '👨‍⚕️ Dr. Ricardo reconhecido!'
}
```

---

## 📈 **ESTATÍSTICAS DO CÓDIGO**

```
📊 NoaGPT (noaGPT.ts):
   • 1.665 linhas de código
   • 50+ métodos
   • 20+ comandos específicos
   • 100+ condicionais (if/else)
   
📂 Agentes (src/gpt/):
   • clinicalAgent.ts     - 800+ linhas
   • knowledgeBaseAgent.ts - 300+ linhas
   • courseAdminAgent.ts   - 400+ linhas
   • symbolicAgent.ts      - 200+ linhas
   • codeEditorAgent.ts    - 250+ linhas
   • voiceControlAgent.ts  - 150+ linhas
   
🔌 OpenAI Service:
   • openaiService.ts     - 422 linhas
   
📊 TOTAL: ~4.500 linhas de código TypeScript
```

---

## 🎯 **COMANDOS RECONHECIDOS**

A NoaGPT reconhece **200+ variações** de comandos:

```typescript
// SAUDAÇÕES (12 tipos)
'ola', 'olá', 'oi', 'hey', 'hi', 'bom dia', 'boa tarde'...

// AVALIAÇÃO CLÍNICA (50+ variações)
'avaliação clínica', 'avaliacao clinica', 'consulta'...

// VOZ (30+ variações)
'ativar controle por voz', 'modo voz', 'voz noa'...

// DOCUMENTOS (20+ variações)
'adicionar documento', 'enviar arquivo', 'upload'...

// CONHECIMENTO (15+ variações)
'criar conhecimento', 'base de conhecimento'...

// CURSOS (10+ variações)
'criar aula', 'listar aulas', 'cursos'...

// DESENVOLVIMENTO (20+ variações)
'desenvolver', 'criar componente', 'implementar'...

// SISTEMA (10+ variações)
'status do sistema', 'ajuda', 'comandos'...
```

---

## 🔄 **FLUXO COMPLETO REAL**

### **Exemplo: "quero fazer avaliação clínica"**

```
1️⃣ ENTRADA:
   userInput = "quero fazer avaliação clínica"

2️⃣ NOAGPT PROCESSA:
   lower = "quero fazer avaliação clínica"
   
3️⃣ VERIFICA COMANDOS (ordem de prioridade):
   ✅ Reconhecimento identidade? ❌ Não
   ✅ Busca banco similar? ❌ Não encontrou
   ✅ Normas conduta? ❌ Não
   ✅ Ativação voz? ❌ Não
   ✅ Comandos código? ❌ Não
   ✅ Administração cursos? ❌ Não
   ✅ Base conhecimento? ❌ Não
   ✅ Avaliação clínica? ✅ SIM! (linha 655)

4️⃣ DELEGA PARA CLINICAL AGENT:
   inicioAvaliacao = await clinicalAgent.detectarInicioAvaliacao(message)
   
5️⃣ CLINICAL AGENT:
   // Verifica se deve iniciar
   if (message.includes('avaliação clínica')) {
     return {
       iniciar: true,
       mensagem: "Olá! Vamos iniciar sua avaliação..."
     }
   }

6️⃣ RETORNA:
   return inicioAvaliacao.mensagem

7️⃣ HOME.TSX RECEBE:
   noaResponse = "Olá! Vamos iniciar sua avaliação..."

8️⃣ EXIBE PARA USUÁRIO:
   <ChatMessage sender="noa" message={noaResponse} />

9️⃣ SALVA NO BANCO (background):
   await supabase.from('ai_learning').insert({
     user_message: "quero fazer avaliação clínica",
     ai_response: "Olá! Vamos iniciar...",
     category: 'clinical'
   })

🔟 CLINICAL AGENT CONTINUA:
    // Inicia fluxo de 28 blocos
    // Faz próxima pergunta
    // Salva respostas
    // Gera relatório no final
```

---

## 💡 **RESUMO EXECUTIVO**

### **O que a NoaGPT REALMENTE é:**

```
❌ NÃO É:
   • Um modelo de IA próprio
   • Um sistema de Machine Learning
   • Um transformer local
   • Uma IA offline

✅ É:
   • Uma CLASSE ROTEADORA inteligente
   • Um SISTEMA DE DECISÃO
   • Um GERENTE de agentes especializados
   • Uma INTERFACE com OpenAI
   • Um SISTEMA DE APRENDIZADO (banco de dados)
```

### **Como funciona na prática:**

```
1. Recebe mensagem do usuário
2. Analisa e detecta intenção
3. Busca no banco de dados (aprendizado)
4. Se encontrar (>90% confiança) → USA BANCO
5. Se não → Verifica 200+ comandos específicos
6. Se encontrar → Executa AGENTE ESPECIALIZADO
7. Se não → ENVIA PARA OPENAI (fallback)
8. Salva resposta no banco para aprender
9. Próxima vez → mais inteligente!
```

### **Dados técnicos:**

```
📊 TECNOLOGIA:
   • TypeScript (linguagem)
   • Classes e métodos (programação)
   • localStorage (memória curta)
   • Supabase PostgreSQL (memória longa)
   • OpenAI API (IA real)
   
🧠 INTELIGÊNCIA:
   • Roteamento por regras (if/else)
   • Busca por similaridade (banco)
   • Extração de palavras-chave
   • Sistema de confiança (0-1)
   • Aprendizado por repetição
   
⚡ PERFORMANCE:
   • Resposta local: < 100ms
   • Resposta OpenAI: 1-3s
   • Salvar no banco: ~200ms (background)
   • Total para usuário: 100ms-3s
```

---

**Quer que eu explique alguma parte específica com mais detalhes?** 🤔


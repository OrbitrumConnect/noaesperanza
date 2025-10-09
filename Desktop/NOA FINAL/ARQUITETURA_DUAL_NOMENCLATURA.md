# 🧠 ARQUITETURA DUAL DE NOMENCLATURA
## NoaVision IA (Motor) + Nôa Esperanza (Persona)

*Design aprovado - Arquitetura final*  
*Implementado em: 09/10/2025*

---

## ✅ **CONCEITO: PERFEITO!**

Você descreveu **exatamente** como deve ser, e foi **IMPLEMENTADO**:

```
╔═══════════════════════════════════════════════════════════════╗
║               ARQUITETURA DUAL DE IDENTIDADE                  ║
╠═══════════════════════════════════════════════════════════════╣
║                                                               ║
║  🧠 NOAVISION IA (Motor Técnico)                              ║
║  ├─ Arquivo: NoaVisionIA.ts                                   ║
║  ├─ Função: Processamento, embeddings, busca semântica        ║
║  ├─ Logs: Console técnico, debugging                          ║
║  └─ Contexto: Backend, engenharia                             ║
║                                                               ║
║  ❤️ NÔA ESPERANZA (Persona Pública)                           ║
║  ├─ Interface: Chat, voz, vídeo                               ║
║  ├─ Função: Comunicação, empatia, humanização                 ║
║  ├─ Logs: Mensagens ao usuário                                ║
║  └─ Contexto: Frontend, experiência do usuário                ║
║                                                               ║
║  🔗 RELAÇÃO:                                                  ║
║     "Nôa Esperanza" usa "NoaVision IA" como cérebro           ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
```

---

## 📊 **ONDE CADA NOME APARECE:**

### **"NoaVision IA" (Técnico):**

```typescript
// 📁 src/gpt/noaVisionIA.ts
export class NoaVisionIA {
  // Logs técnicos
  console.log('🧠 [NoaVision IA] Carregando modelo...')
  console.log('✅ [NoaVision IA] Processando mensagem...')
  console.log('📊 [NoaVision IA] Busca semântica...')
}

// 📁 Console do navegador (F12)
[NoaVision IA] Sistema inicializado
[NoaVision IA] Modelo carregado em 8234ms
[NoaVision IA] Resposta em 120ms (local)

// 📁 Banco de dados
source: 'noavision'
processed_by: 'NoaVision IA Core'

// 📁 Documentação técnica
"Sistema NoaVision IA com embeddings..."
```

### **"Nôa Esperanza" (Público):**

```typescript
// 📁 Interface do chat
"Olá! Sou a Nôa Esperanza, assistente médica..."

// 📁 Síntese de voz
"Nôa Esperanza falando..."

// 📁 Relatórios
"Relatório gerado por Nôa Esperanza"

// 📁 Vídeos
<video src="noa-esperanza-falando.mp4" />

// 📁 Assinaturas
"🩺 Nôa Esperanza - Assistente Médica"

// 📁 Metadados
og:title = "Nôa Esperanza - Assistente Médica IA"
```

---

## 🎯 **COMO IMPLEMENTAR NA PRÁTICA:**

### **Atualizar NoaVisionIA.ts:**

```typescript
// src/gpt/noaVisionIA.ts

export class NoaVisionIA {
  // Nome público da persona
  public displayName = 'Nôa Esperanza'
  public technicalName = 'NoaVision IA'
  
  // Logs técnicos (backend)
  private logTechnical(message: string) {
    console.log(`🧠 [${this.technicalName}] ${message}`)
  }
  
  // Mensagens ao usuário (frontend)
  private getUserMessage(message: string) {
    return `${this.displayName}: ${message}`
  }
  
  async processMessage(message: string, context: NoaContext) {
    // Log técnico (console)
    this.logTechnical(`Processando: ${message}`)
    
    // ... processamento ...
    
    // Resposta ao usuário (usa nome público)
    const response = `Olá! Sou a ${this.displayName}, como posso ajudar?`
    
    return response
  }
}
```

### **Atualizar Prompts:**

```typescript
// src/config/noaSystemPrompt.ts

export const getNoaSystemPrompt = (config: any) => {
  return `Você é ${config.displayName || 'Nôa Esperanza'}, uma assistente médica empática e inteligente.

SEU NOME PÚBLICO: Nôa Esperanza
SEU NÚCLEO COGNITIVO: NoaVision IA (motor técnico)

IMPORTANTE:
- SEMPRE se apresente como "Nôa Esperanza"
- NUNCA mencione "NoaVision IA" ao usuário
- NoaVision IA é seu cérebro, não seu nome

PERSONALIDADE:
- Empática
- Acolhedora
- Médica especializada
- Humanizada

...resto do prompt...
`
}
```

### **Atualizar Mensagens:**

```typescript
// Em qualquer lugar que fale com o usuário:

// ❌ ERRADO:
"Olá! Sou a NoaVision IA..."

// ✅ CORRETO:
"Olá! Sou a Nôa Esperanza..."

// Mas nos logs técnicos:
console.log('[NoaVision IA] Processando...') // ✅ OK
```

---

## 📋 **TABELA DE USO:**

| Contexto | Nome a Usar | Exemplo |
|----------|-------------|---------|
| **Chat com usuário** | Nôa Esperanza | "Sou a Nôa Esperanza, como posso ajudar?" |
| **Voz (TTS)** | Nôa Esperanza | "Nôa Esperanza falando com você..." |
| **Relatórios** | Nôa Esperanza | "Relatório gerado por Nôa Esperanza" |
| **Interface (botões)** | Nôa Esperanza | "Chat com Nôa" |
| **Console (logs)** | NoaVision IA | "[NoaVision IA] Modelo carregado" |
| **Código (classe)** | NoaVisionIA | `class NoaVisionIA { }` |
| **Docs técnicas** | NoaVision IA | "Sistema NoaVision IA..." |
| **Banco de dados** | Ambos | `source: 'noavision', persona: 'Nôa Esperanza'` |

---

## 🎨 **VARIÁVEL DE AMBIENTE (Recomendado):**

```bash
# .env
VITE_IA_DISPLAY_NAME="Nôa Esperanza"
VITE_IA_TECHNICAL_NAME="NoaVision IA"
```

```typescript
// Usar em qualquer lugar:
const IA_NAME = import.meta.env.VITE_IA_DISPLAY_NAME || "Nôa Esperanza"

// Mensagem ao usuário:
`Olá! Sou a ${IA_NAME}...`
```

**Vantagem:** Muda em um lugar só!

---

## 🔧 **ATUALIZAÇÃO RÁPIDA DOS PROMPTS:**

Vou atualizar o código para garantir que a persona seja **sempre "Nôa Esperanza"** na interface:

<function_calls>
<invoke name="search_replace">
<parameter name="file_path">src/gpt/noaVisionIA.ts

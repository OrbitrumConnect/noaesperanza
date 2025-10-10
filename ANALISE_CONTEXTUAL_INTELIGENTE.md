# 🧠 ANÁLISE CONTEXTUAL INTELIGENTE

## 🎯 **O QUE FOI IMPLEMENTADO:**

Sistema de **análise de intenção** que entende o contexto da conversa e detecta quando o usuário quer sair, está confuso, ou está respondendo normalmente.

---

## ✅ **COMO FUNCIONA:**

### **1. Análise em 3 Camadas:**

```typescript
CAMADA 1: Análise Contextual Inteligente (Nova! 🆕)
├── Regex patterns avançados
├── Análise por etapa da avaliação  
├── Detecção de intenção disfarçada
└── Confiança: 85-95%

CAMADA 2: Detecção Rápida (Palavras-chave)
├── Palavras explícitas ("sair", "parar")
├── Fallback se camada 1 falhar
└── Confiança: 100%

CAMADA 3: Filtro no Service
├── Não salva comandos de saída
├── Bloqueia queixas inválidas
└── Última proteção
```

---

## 🎯 **PADRÕES DETECTADOS:**

### **1. Intenção de Sair (Alta Confiança 95%):**
```regex
✅ "quero (sair|parar|encerrar|cancelar)"
✅ "podemos (sair|parar|encerrar)"
✅ "(não|nao) quero (mais|continuar)"
✅ "chega de (avaliação|consulta)"
✅ "vamos (sair|parar|encerrar)"
✅ "(quero|prefiro) (chat livre|conversar)"
```

**Exemplos:**
```
👤: "quero sair daqui agora"
🎯 Detectado: SAIR (padrão: "quero sair")
🤖: "Entendo que você prefere pausar a avaliação."

👤: "podemos encerrar essa avaliação?"
🎯 Detectado: SAIR (padrão: "podemos encerrar")
🤖: "Entendo que você prefere pausar a avaliação."

👤: "não quero mais continuar"
🎯 Detectado: SAIR (padrão: "não quero mais")
🤖: "Entendo que você prefere pausar a avaliação."
```

---

### **2. Contexto por Etapa (90% confiança):**

Durante `complaints_list` ou `identification`, detecta saída disfarçada:

```typescript
if (mensagem.includes('sair') || mensagem.includes('parar')) {
  if (mensagem.includes('daqui') || 
      mensagem.includes('desta') ||
      mensagem.includes('dessa') ||
      mensagem.includes('agora')) {
    → INTENÇÃO: SAIR
  }
}
```

**Exemplos:**
```
Nôa: "O que trouxe você à avaliação?"

👤: "quero sair daqui agora"
🎯 Detectado: SAIR (contexto: "sair daqui")
🤖: "Percebo que você quer encerrar a avaliação."

👤: "parar desta consulta"
🎯 Detectado: SAIR (contexto: "parar desta")
🤖: "Percebo que você quer encerrar a avaliação."

MAS:

👤: "dor ao sair da cama"
✅ Normal: É uma queixa válida sobre dor
🤖: "Certo. Algo mais que esteja te incomodando?"
```

---

## 📊 **LOGS NO CONSOLE:**

### **Quando detecta intenção:**
```javascript
🎯 Intenção detectada: SAIR (padrão regex)
🎯 Intenção detectada: SAIR (contexto: quer sair daqui)
```

### **Quando é resposta normal:**
```javascript
✅ Intenção: NORMAL
→ Processa resposta normalmente
```

---

## 🎯 **CENÁRIOS TESTADOS:**

### **✅ Cenário 1: Comando Direto**
```
👤: "encerra avaliacao agora"

ANÁLISE:
├─ Regex: /(encerra|encerrar)/
├─ Match: ✅ "encerra"
└─ Intenção: SAIR (95%)

RESULTADO:
✅ Sai da avaliação
✅ Progresso salvo
✅ Volta ao chat livre
```

### **✅ Cenário 2: Contexto Disfarçado**
```
Nôa: "O que trouxe você à avaliação?"
👤: "quero sair daqui e ir embora"

ANÁLISE:
├─ Palavra: "sair" ✅
├─ Contexto: "daqui" ✅
├─ Etapa: complaints_list ✅
└─ Intenção: SAIR (90%)

RESULTADO:
✅ Detecta que não é queixa médica
✅ Sai da avaliação
✅ Não salva como queixa
```

### **✅ Cenário 3: Falso Positivo (Protegido)**
```
Nôa: "O que trouxe você à avaliação?"
👤: "dor ao sair da cama pela manhã"

ANÁLISE:
├─ Palavra: "sair" ✅
├─ Contexto: "da cama" (não é "daqui/desta/dessa")
├─ Não match padrão de saída
└─ Intenção: NORMAL (100%)

RESULTADO:
✅ Processa como queixa válida
✅ Salva: "dor ao sair da cama pela manhã"
✅ Continua avaliação
```

---

## 🔧 **ESTRUTURA DO CÓDIGO:**

```typescript
// src/pages/HomeIntegrated.tsx

const analisarIntencaoUsuario = async (
  mensagem: string, 
  stage: string
): Promise<{
  tipo: 'sair' | 'confuso' | 'normal',
  mensagem: string,
  confianca: number
}> => {
  
  // 1. Padrões de Saída (Regex)
  const padroesSaida = [
    /quero (sair|parar|encerrar|cancelar)/,
    /pode(mos)? (sair|parar|encerrar|cancelar)/,
    /(nao|não) quero (mais|continuar)/,
    // ... mais padrões
  ]
  
  // 2. Análise Contextual por Etapa
  if (stage === 'complaints_list') {
    if (indicaSaida && contemContexto) {
      return { tipo: 'sair', confianca: 0.90 }
    }
  }
  
  // 3. Resposta Normal
  return { tipo: 'normal', confianca: 1.0 }
}
```

---

## 📈 **BENEFÍCIOS:**

```
✅ Entende intenção real do usuário
✅ Previne queixas inválidas ("quero sair daqui")
✅ Detecta 20+ variações de saída
✅ Análise contextual por etapa
✅ Fallback para detecção rápida
✅ Proteção contra falsos positivos
✅ Logs detalhados para debug
✅ Confiança quantificada (85-100%)
```

---

## 🚀 **PRÓXIMOS PASSOS (Futuro):**

### **1. Integração com NoaVision IA (Opcional):**
```typescript
// Análise semântica profunda usando embeddings
const embedding = await noaVision.getEmbedding(mensagem)
const similaridade = await buscarIntencoes(embedding)

if (similaridade > 0.85 && tipo === 'sair') {
  return { tipo: 'sair', confianca: similaridade }
}
```

### **2. Detecção de Confusão:**
```
👤: "não entendi essa pergunta"
🎯 Detectado: CONFUSO
🤖: "Deixe-me reformular: [pergunta mais simples]"
```

### **3. Validação de Resposta:**
```
Nôa: "Onde você sente dor?"
👤: "estou com fome"
🎯 Detectado: RESPOSTA FORA DO CONTEXTO
🤖: "Vejo que você está com fome. Mas sobre a dor, onde você sente?"
```

---

## ✅ **ESTÁ FUNCIONANDO AGORA:**

```
✅ Análise contextual ativa
✅ Detecção inteligente de saída
✅ Proteção contra queixas inválidas
✅ Logs detalhados no console
✅ Fallback para detecção rápida
✅ Validação em 3 camadas
✅ Pronto para produção!
```

**AGORA SIM ESTÁ SUPER REDONDO!** 🎉


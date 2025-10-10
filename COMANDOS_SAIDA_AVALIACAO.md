# 🚪 COMANDOS PARA SAIR DA AVALIAÇÃO CLÍNICA

## ✅ COMANDOS QUE FUNCIONAM:

Durante a avaliação clínica, você pode usar **QUALQUER UM** desses comandos para pausar/sair:

### **Comandos Simples:**
- `sair`
- `parar`
- `cancelar`
- `desistir`
- `encerrar`
- `encerra`
- `voltar`
- `desisto`
- `chega` (sozinho)

### **Comandos com Contexto:**
- `sair da avaliação`
- `parar avaliação`
- `cancelar avaliação`
- `encerrar avaliação`
- `não quero mais`
- `nao quero continuar`
- `quero sair`
- `quero parar`
- `chat livre`
- `só conversar`
- `quero conversar`
- `voltar ao chat`
- `podemos parar?`
- `pode encerrar?`

---

## ✅ O QUE ACONTECE QUANDO VOCÊ SAI:

```
1. ✅ Seu progresso é SALVO automaticamente
2. ✅ Você volta para conversa livre com Nôa
3. ✅ Pode retomar quando quiser
```

---

## 🔄 COMO RETOMAR A AVALIAÇÃO:

Use qualquer um desses comandos:
- `continuar avaliação`
- `retomar avaliação`
- `voltar para avaliação`

---

## 🛡️ PROTEÇÕES IMPLEMENTADAS:

### **1. Detecção em Duas Camadas:**
```typescript
✅ HomeIntegrated.tsx 
   → Detecta comandos ANTES de processar

✅ clinicalAssessmentService.ts
   → Detecta comandos E não salva como queixa
```

### **2. Filtros de Queixas Inválidas:**
```typescript
❌ Bloqueados:
- "si", "soso", "sim", "ok", "certo"
- Textos muito curtos (< 5 caracteres)
- Palavras de finalização isoladas
```

### **3. Validação de Comprimento:**
```typescript
✅ Comandos < 100 caracteres
   → Considerados comandos de saída

✅ Respostas > 100 caracteres
   → Consideradas respostas válidas
```

---

## 📊 LOGS NO CONSOLE:

### **Quando comando é detectado:**
```
🚪 Comando de saída detectado. NÃO salvando como resposta: "sair"
```

### **Quando queixa inválida é filtrada:**
```
⚠️ Queixa inválida detectada: "si". Retornando vazio.
```

### **Quando sai com sucesso:**
```
✅ Modo avaliação desativado
✅ Progresso salvo
```

---

## ✅ TESTADO E APROVADO:

```
👤: "encerra avaliacao agora"
✅ SAI → Progresso salvo

👤: "podemos encerrar a avaliacao? nao quero mais"  
✅ SAI → Progresso salvo

👤: "parar"
✅ SAI → Progresso salvo

👤: "sair"
✅ SAI → Progresso salvo

👤: "nao quero mais"
✅ SAI → Progresso salvo

👤: "chat livre"
✅ SAI → Progresso salvo
```

---

## 🚨 SE NÃO FUNCIONAR:

1. **Verifique no console do navegador:**
   - Deve mostrar: `🚪 Comando de saída detectado`
   
2. **Se não aparecer:**
   - Limpe o cache do navegador (Ctrl+Shift+R)
   - Reinicie o servidor (`npm run dev -- --port 8000`)
   
3. **Se continuar:**
   - Verifique se está em modo avaliação (`modoAvaliacao: true`)
   - Veja os logs: `F12` → Console

---

## 🎯 RESUMO:

```
✅ 20+ comandos de saída diferentes
✅ Detecção em 2 camadas (frontend + service)
✅ Progresso sempre salvo
✅ Pode retomar quando quiser
✅ Filtros contra queixas inválidas
✅ Proteção contra "si soso" e similares
```

**AGORA ESTÁ REDONDO!** 🎉


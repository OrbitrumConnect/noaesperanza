# 📊 GUIA COMPLETO - DADOS LOCAIS DA NÔA

## 🗄️ ONDE ESTÃO OS DADOS?

Os dados são salvos no **localStorage** do navegador com as seguintes chaves:

| Chave | Conteúdo |
|-------|----------|
| `noa_local_conversations` | Conversas não sincronizadas com Supabase |
| `noa_context_<userId>` | Contexto do usuário |
| `noa_memory_<userId>` | Memória persistente |
| `userId` | ID do usuário atual |
| `sb-auth-token` | Token de autenticação Supabase |

---

## 🖥️ COMO VER OS DADOS (Console do Navegador)

### **1. Abra o Console:**
- **Chrome/Edge:** `F12` ou `Ctrl+Shift+J`
- **Firefox:** `F12` ou `Ctrl+Shift+K`
- **Safari:** `Cmd+Option+C`

### **2. Use os Comandos:**

```javascript
// Ver todos os dados
noaLocalStorage.ver()

// Ver estatísticas
noaLocalStorage.stats()

// Análise detalhada
noaLocalStorage.analisar()
```

---

## 📊 VISUALIZAR DADOS MANUALMENTE

### **Opção 1: Application Tab (Chrome DevTools)**

1. Abra DevTools (`F12`)
2. Vá para aba **Application**
3. No menu lateral: **Storage > Local Storage**
4. Selecione seu domínio
5. Veja todas as chaves armazenadas

### **Opção 2: Console**

```javascript
// Listar todas as chaves
Object.keys(localStorage)

// Ver conversas específicas
JSON.parse(localStorage.getItem('noa_local_conversations'))

// Ver tamanho total
let total = 0
for (let key in localStorage) {
  total += localStorage[key].length
}
console.log('Tamanho total:', (total/1024).toFixed(2), 'KB')
```

---

## 🔄 MIGRAR DADOS PARA SUPABASE

### **Método 1: Comando Rápido (Console)**

```javascript
// Migrar tudo automaticamente
await noaLocalStorage.migrar()

// Resultado:
// ✅ Migração concluída!
//    • Migradas: 15
//    • Falhas: 0
```

### **Método 2: Script Manual**

```javascript
// 1. Pegar dados locais
const conversas = JSON.parse(localStorage.getItem('noa_local_conversations') || '[]')

// 2. Migrar para Supabase
for (const conv of conversas) {
  const { error } = await supabase
    .from('conversation_history')
    .insert({
      user_id: 'dr-ricardo-valenca',
      content: conv.userMessage,
      response: conv.aiResponse,
      created_at: new Date(conv.timestamp).toISOString()
    })
    
  if (!error) {
    console.log('✅ Conversa migrada:', conv.id)
  }
}
```

### **Método 3: Via Interface (Futuro)**

Vou criar uma interface visual para migração (próxima tarefa)

---

## 💾 BACKUP DOS DADOS

### **Opção 1: Download Automático**

```javascript
// Download JSON com todos os dados
noaLocalStorage.baixar()

// Salva arquivo: noa_backup_2025-10-03.json
```

### **Opção 2: Copiar Manualmente**

```javascript
// 1. Exportar para JSON
const backup = noaLocalStorage.ver()

// 2. Copiar saída do console
// 3. Salvar em arquivo .json
```

### **Opção 3: Backup Automático**

```javascript
// Criar backup antes de limpar
localStorage.setItem(
  `noa_backup_${Date.now()}`, 
  JSON.stringify(noaLocalStorage.ver())
)
```

---

## 🔍 ANALISAR DADOS

### **Estatísticas Gerais:**

```javascript
noaLocalStorage.stats()

// Retorna:
// {
//   totalConversations: 25,
//   syncedConversations: 10,
//   unsyncedConversations: 15,
//   totalKeys: 8,
//   storageSize: "45.23 KB",
//   allKeys: [...]
// }
```

### **Análise Detalhada:**

```javascript
noaLocalStorage.analisar()

// Retorna:
// {
//   totalConversations: 25,
//   dateDistribution: { "03/10/2025": 15, ... },
//   topWords: [
//     { word: "cannabis", count: 12 },
//     { word: "neurologia", count: 8 }
//   ],
//   oldestConversation: Date,
//   newestConversation: Date
// }
```

### **Buscar por Palavra-chave:**

```javascript
// Buscar conversas sobre "cannabis"
const conversas = JSON.parse(localStorage.getItem('noa_local_conversations'))
const resultados = conversas.filter(c => 
  c.userMessage.includes('cannabis') || 
  c.aiResponse.includes('cannabis')
)
console.log('Encontradas:', resultados.length)
```

---

## 🧹 LIMPAR DADOS

### **⚠️ IMPORTANTE: Sempre faça backup antes!**

### **Opção 1: Com Backup Automático**

```javascript
// Cria backup e limpa
noaLocalStorage.limpar()
```

### **Opção 2: Limpar Tudo Manualmente**

```javascript
// Limpar apenas dados da Nôa
Object.keys(localStorage).forEach(key => {
  if (key.startsWith('noa_')) {
    localStorage.removeItem(key)
  }
})
```

### **Opção 3: Limpar TUDO (Cuidado!)**

```javascript
// ⚠️ PERDA PERMANENTE DE DADOS!
localStorage.clear()
```

---

## 📤 EXPORTAR PARA OUTRAS FERRAMENTAS

### **Para Excel/CSV:**

```javascript
// 1. Pegar conversas
const conversas = JSON.parse(localStorage.getItem('noa_local_conversations'))

// 2. Converter para CSV
let csv = 'Data,Usuário,Resposta\n'
conversas.forEach(c => {
  csv += `${c.timestamp},"${c.userMessage}","${c.aiResponse}"\n`
})

// 3. Download
const blob = new Blob([csv], { type: 'text/csv' })
const url = URL.createObjectURL(blob)
const a = document.createElement('a')
a.href = url
a.download = 'conversas_noa.csv'
a.click()
```

### **Para JSON:**

```javascript
// Download automático
noaLocalStorage.baixar()
```

---

## 🔐 SEGURANÇA E PRIVACIDADE

### **Dados Armazenados:**
- ✅ Conversas (texto)
- ✅ Timestamps
- ✅ IDs de sessão
- ❌ **NÃO** armazena: senhas, dados bancários, informações sensíveis

### **Limpeza Automática:**
O localStorage **persiste** até você limpar. Para ambiente profissional:

```javascript
// Limpar dados com mais de 30 dias
const conversas = JSON.parse(localStorage.getItem('noa_local_conversations') || '[]')
const filtered = conversas.filter(c => {
  const age = Date.now() - new Date(c.timestamp).getTime()
  return age < (30 * 24 * 60 * 60 * 1000) // 30 dias
})
localStorage.setItem('noa_local_conversations', JSON.stringify(filtered))
```

---

## 🚀 FLUXO PROFISSIONAL RECOMENDADO

```
FLUXO IDEAL:
1. ✅ Usar app normalmente (salva local + Supabase)
2. 📊 Verificar estatísticas semanalmente
   → noaLocalStorage.stats()
3. 🔄 Migrar dados não sincronizados
   → noaLocalStorage.migrar()
4. 💾 Fazer backup mensal
   → noaLocalStorage.baixar()
5. 🧹 Limpar dados antigos (opcional)
   → após backup
```

---

## 🛠️ TROUBLESHOOTING

### **Problema: "localStorage is full"**
```javascript
// Solução: Limpar dados antigos
noaLocalStorage.limpar()
```

### **Problema: "Dados não aparecem"**
```javascript
// Verificar se há dados
noaLocalStorage.stats()

// Se vazio, verificar domínio correto
console.log('Domínio:', window.location.origin)
```

### **Problema: "Migração falhou"**
```javascript
// Ver erros detalhados
const result = await noaLocalStorage.migrar()
console.log('Erros:', result.errors)

// Verificar permissões Supabase
// Execute: fix_conversation_history_permissions.sql
```

---

## 📞 SUPORTE

**Se precisar de ajuda:**

1. Abra console (F12)
2. Execute: `noaLocalStorage.stats()`
3. Tire screenshot
4. Entre em contato com suporte

---

## ✅ CHECKLIST PRÉ-PRODUÇÃO

- [ ] Migrar todos os dados locais para Supabase
- [ ] Fazer backup completo (download JSON)
- [ ] Verificar que erro 403 foi corrigido
- [ ] Testar salvamento no Supabase
- [ ] Limpar dados de teste locais
- [ ] Configurar limpeza automática (30 dias)
- [ ] Documentar processo para equipe

---

**Pronto para uso profissional!** 🎉


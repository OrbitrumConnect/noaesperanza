# 🔧 CRIAR ARQUIVO .env - PASSO A PASSO

## ✅ **PASSOS EXATOS:**

### 1️⃣ **Criar arquivo .env na raiz do projeto**

No VS Code ou qualquer editor:
1. Vá na **raiz do projeto** (mesma pasta que `package.json`)
2. Crie novo arquivo chamado **`.env`** (com ponto no início!)
3. Cole este conteúdo:

```env
# Supabase
VITE_SUPABASE_URL=https://lhclqebtkyfftkevumix.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=SUA_ANON_KEY_AQUI

# OpenAI
VITE_OPENAI_API_KEY=SUA_OPENAI_KEY_AQUI

# App
VITE_APP_ENVIRONMENT=development
VITE_APP_VERSION=3.0.0
```

---

### 2️⃣ **Pegar SUPABASE ANON KEY**

**Acesse:** https://supabase.com/dashboard/project/lhclqebtkyfftkevumix/settings/api

**Copie esta chave:**
```
Project API keys
  ↓
anon / public
  ↓
[longa string começando com eyJhbGciOi...]
```

**Cole no .env substituindo `SUA_ANON_KEY_AQUI`**

---

### 3️⃣ **Pegar OPENAI API KEY**

**Acesse:** https://platform.openai.com/api-keys

**Crie nova key** (ou use existente)

**Cole no .env substituindo `SUA_OPENAI_KEY_AQUI`**

---

### 4️⃣ **IMPORTANTE: Nome da variável**

⚠️ O código usa: `VITE_SUPABASE_PUBLISHABLE_KEY`

❌ NÃO use: `VITE_SUPABASE_ANON_KEY`

✅ Use exatamente: `VITE_SUPABASE_PUBLISHABLE_KEY`

---

### 5️⃣ **Reiniciar servidor**

No terminal:
```bash
# Parar (Ctrl+C)
# Depois executar:
npm run dev
```

---

## 🧪 **Testar se funcionou:**

1. Abra o app: http://localhost:3000
2. Abra DevTools (F12) → Console
3. Digite: `testSupabase()`
4. Se aparecer **✅ TODOS OS TESTES PASSARAM!** → Funcionou!

---

## 📋 **Exemplo de .env correto:**

```env
VITE_SUPABASE_URL=https://lhclqebtkyfftkevumix.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxoY2xxZWJ0a3lmZnRrZXZ1bWl4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE1MTc5MjEsImV4cCI6MjA0NzA5MzkyMX0.exemplo_da_chave_completa
VITE_OPENAI_API_KEY=sk-proj-exemplo123456789
VITE_APP_ENVIRONMENT=development
VITE_APP_VERSION=3.0.0
```

---

## ❌ **Erros Comuns:**

### "URL: https://your-project.supabase.co"
- **Problema:** .env não foi criado ou não está na raiz
- **Solução:** Confirme que .env está na mesma pasta que package.json

### "Key: Não configurada"
- **Problema:** Nome da variável errado ou chave não colada
- **Solução:** Use exatamente `VITE_SUPABASE_PUBLISHABLE_KEY`

### "Timeout profile"
- **Problema:** Chave inválida ou tabelas não criadas
- **Solução:** 
  1. Verifique se a chave está correta
  2. Execute `teste_rapido_supabase.sql` no Supabase

---

## 🎯 **Checklist Final:**

- [ ] Arquivo `.env` criado na raiz
- [ ] `VITE_SUPABASE_URL` preenchido
- [ ] `VITE_SUPABASE_PUBLISHABLE_KEY` preenchido (chave completa)
- [ ] `VITE_OPENAI_API_KEY` preenchido
- [ ] Servidor reiniciado (`npm run dev`)
- [ ] Teste `testSupabase()` passou

---

**Após isso, o perfil será carregado corretamente! 🚀**


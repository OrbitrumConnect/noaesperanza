# ⚙️ CONFIGURAR .ENV AGORA - PASSO A PASSO

## 🎯 OBJETIVO:
Conectar o app ao Supabase para usar os 86+304 registros que acabamos de popular!

---

## 📝 PASSO 1: CRIAR ARQUIVO .env

Na raiz do projeto (mesma pasta do package.json), crie o arquivo:

```
.env
```

---

## 📝 PASSO 2: COPIAR ESTE CONTEÚDO:

```env
# ==============================================================================
# CONFIGURACAO AMBIENTE - NOA ESPERANZA V3.0
# ==============================================================================

# ------------------------------------------------------------------------------
# SUPABASE (OBRIGATORIO)
# ------------------------------------------------------------------------------
VITE_SUPABASE_URL=https://lhclqebtkyfftkevumix.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=COLE_AQUI_SUA_ANON_KEY

# ------------------------------------------------------------------------------
# OPENAI (OPCIONAL - apenas 5% fallback)
# ------------------------------------------------------------------------------
VITE_OPENAI_API_KEY=

# ------------------------------------------------------------------------------
# ELEVENLABS (OPCIONAL - voz premium)
# ------------------------------------------------------------------------------
# VITE_ELEVEN_API_KEY=

# ------------------------------------------------------------------------------
# MERCADO PAGO (OPCIONAL - pagamentos)
# ------------------------------------------------------------------------------
# VITE_MERCADO_PAGO_KEY=
```

---

## 🔑 PASSO 3: PEGAR SUA ANON KEY DO SUPABASE

### **OPÇÃO A: Direto do Dashboard**

1. Vá em: https://supabase.com/dashboard/project/lhclqebtkyfftkevumix
2. Menu lateral esquerdo: **Settings** (ícone engrenagem)
3. Clique em: **API**
4. Procure a seção: **Project API keys**
5. Copie a chave: **anon public**
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
6. Cole no .env substituindo `COLE_AQUI_SUA_ANON_KEY`

### **OPÇÃO B: Se já está logado no Supabase**

Execute no terminal SQL do Supabase:
```sql
SELECT current_setting('app.settings.jwt_secret');
```

---

## 🔑 PASSO 4: OPENAI (OPCIONAL)

Se quiser usar OpenAI para casos complexos (5%):

1. Vá em: https://platform.openai.com/api-keys
2. Create new secret key
3. Copie (sk-proj-...)
4. Cole no .env na linha `VITE_OPENAI_API_KEY=`

**OU deixe vazio para 100% offline!**

---

## 🚀 PASSO 5: REINICIAR SERVIDOR

Após salvar o .env:

1. Parar o servidor atual (Ctrl+C no terminal)
2. Rodar novamente:
   ```bash
   npm run dev -- --port 8000
   ```

---

## ✅ PASSO 6: TESTAR

Após reiniciar, teste no chat:

```
1. "ola" → Deve responder INSTANTÂNEO do banco
2. "o que e CBD" → Resposta de documentos_mestres
3. "quem é você" → Identidade completa

Console deve mostrar:
✅ [NoaVision IA] Busca no banco bem-sucedida
✅ Similaridade: 95%+
✅ Resposta do banco em 100-150ms
```

---

## 🎯 RESULTADO ESPERADO:

### **ANTES (sem .env - atual):**
```
❌ Erro 401 Supabase
❌ Erro 401 OpenAI
✅ Funciona em modo offline (fallback)
⚠️ Não usa os 86+304 registros do banco
```

### **DEPOIS (com .env configurado):**
```
✅ Conecta no Supabase
✅ Usa os 86 registros de ai_learning
✅ Usa os 304 documentos_mestres
✅ 95% respostas do banco (100-300ms, grátis)
✅ 5% fallback OpenAI (se configurar)
```

---

## 📁 ESTRUTURA FINAL:

```
C:\Users\phpg6\Desktop\NOA FINAL\
├── .env                    ← CRIAR ESTE ARQUIVO
├── .env.example            (já existe)
├── package.json
├── src/
└── ...
```

---

## 🔒 IMPORTANTE:

- ✅ .env já está no .gitignore (seguro)
- ✅ Não será commitado
- ✅ Suas chaves ficam privadas

---

## 💡 DICA:

Se não quiser configurar agora, **sistema funciona offline!**

MAS... você não vai aproveitar os **86+304 registros** que acabou de popular! 😅

**Recomendo MUITO configurar para ver a diferença!** 🚀

---

## 📞 PRECISA DE AJUDA?

Se não souber onde pegar a ANON KEY, me avisa que te guio passo a passo! 😊

---

**Status:** ⏳ Aguardando você criar .env e configurar VITE_SUPABASE_PUBLISHABLE_KEY


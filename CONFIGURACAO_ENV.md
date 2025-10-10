# 🔐 CONFIGURAÇÃO DE VARIÁVEIS DE AMBIENTE

## 📋 **CRIAR ARQUIVO .ENV NA RAIZ DO PROJETO:**

```bash
# Copie e cole no arquivo .env (criar manualmente)
```

```env
# ========================================
# SUPABASE (OBRIGATÓRIO)
# ========================================
VITE_SUPABASE_URL=https://lhclqebtkyfftkevumix.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima-aqui
VITE_SUPABASE_PUBLISHABLE_KEY=sua-chave-publica-aqui

# ========================================
# OPENAI (OPCIONAL)
# ========================================
VITE_OPENAI_API_KEY=sua-chave-openai-aqui

# ========================================
# ELEVENLABS (OPCIONAL)
# ========================================
VITE_ELEVENLABS_API_KEY=sua-chave-elevenlabs-aqui
```

---

## 🔑 **ONDE OBTER AS CHAVES:**

### **1. Supabase (Obrigatório para banco de dados):**
1. Acesse: https://app.supabase.com/project/lhclqebtkyfftkevumix/settings/api
2. Copie:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** → `VITE_SUPABASE_ANON_KEY`
3. Cole no arquivo `.env`

### **2. OpenAI (Opcional - só para GPT-4):**
1. Acesse: https://platform.openai.com/api-keys
2. Crie uma nova chave
3. Cole em `VITE_OPENAI_API_KEY`

### **3. ElevenLabs (Opcional - voz premium):**
1. Acesse: https://elevenlabs.io/app/settings/api-keys
2. Copie sua chave
3. Cole em `VITE_ELEVENLABS_API_KEY`

---

## ⚡ **COMANDOS:**

```bash
# 1. Criar arquivo .env na raiz
touch .env

# 2. Editar e colar as variáveis
nano .env

# 3. Reiniciar servidor
npm run dev
```

---

## 💡 **MODO OFFLINE (SEM CHAVES):**

✅ **NoaVision IA funciona 100% sem chaves!**
- Embeddings locais (CPU do usuário)
- Respostas inteligentes offline
- localStorage como banco
- ZERO custo de API

⚠️ **Mas com Supabase você tem:**
- Sincronização entre dispositivos
- Backup em nuvem
- Compartilhamento com médicos
- Relatórios persistentes


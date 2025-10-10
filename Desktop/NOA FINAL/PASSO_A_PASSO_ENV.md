# 🔑 PASSO A PASSO - CONFIGURAR .ENV

## 📝 **ARQUIVO `.env` CRIADO E PRONTO!**

Localização: `C:\Users\phpg6\Desktop\NOA FINAL\.env`

---

## 🎯 **AGORA FAÇA ISSO:**

### **PASSO 1: Pegar chaves do Supabase**

```
1. Abra: https://supabase.com/dashboard
2. Clique no seu projeto (NOA Esperanza)
3. Clique em: Settings (⚙️ engrenagem)
4. Clique em: API
5. Você verá:

   📍 Project URL:
   https://XXXXXXXXX.supabase.co
   
   📍 API Keys > anon public:
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.XXXXXXXXX...

6. COPIE ESSES 2 VALORES!
```

---

### **PASSO 2: Pegar chave do OpenAI (opcional)**

```
1. Abra: https://platform.openai.com/api-keys
2. Clique: Create new secret key
3. Dê um nome: "Noa Esperanza"
4. Clique: Create secret key
5. COPIE A CHAVE: sk-proj-XXXXXXXXX...
   ⚠️ Só mostra 1 vez! Copie agora!
```

---

### **PASSO 3: Editar .env**

```
1. Abra: C:\Users\phpg6\Desktop\NOA FINAL\.env
   (com Notepad, VSCode ou Cursor)

2. Encontre estas 3 linhas:

   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key_here
   VITE_OPENAI_API_KEY=your_openai_api_key_here

3. SUBSTITUA por suas chaves reais:

   VITE_SUPABASE_URL=https://XXXXXXXXX.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJI...
   VITE_OPENAI_API_KEY=sk-proj-XXXXXXXXX

4. Salve: Ctrl+S
5. Feche o editor
```

---

### **PASSO 4: Reiniciar servidor**

```bash
Terminal onde está rodando npm run dev:

1. Pressione: Ctrl+C
   (para o servidor)

2. Digite: npm run dev
   (roda de novo)

3. Aguarde aparecer:
   ✅ Supabase configurado: https://XXXXX.supabase.co
   ✅ [NoaVision IA] Modelo carregado
   ✅ Nôa Esperanza pronta!

4. Se aparecer "Modo LOCAL":
   ❌ .env está errado
   ✅ Verifique as chaves novamente
```

---

## ✅ **COMO SABER QUE DEU CERTO:**

### **No console do navegador (F12):**

**ANTES:**
```
❌ Modo LOCAL ativo
❌ localhost:54321
❌ ERR_CONNECTION_REFUSED
```

**DEPOIS:**
```
✅ Supabase configurado: https://seu-projeto.supabase.co
✅ [NoaVision IA] Modelo carregado
✅ Nôa Esperanza pronta!
```

### **No chat:**

**ANTES:**
```
Você: "oi noa"
Nôa: "Sou a Nôa Esperanza em modo offline..." (sempre igual)
```

**DEPOIS:**
```
Você: "oi noa"
Nôa: "Olá! Sou a Nôa Esperanza, sua assistente..." (inteligente!)

Você: "buscar sobre CBD"
Nôa: [Busca em documentos_mestres e responde!]

Você: "fazer avaliação clínica"
Nôa: [Inicia 28 perguntas IMRE!]
```

---

## 📋 **CHECKLIST:**

```
□ Abrir https://supabase.com/dashboard
□ Copiar Project URL
□ Copiar anon public key
□ Abrir https://platform.openai.com/api-keys (opcional)
□ Copiar OpenAI key
□ Editar .env
□ Substituir "your-project" por URL real
□ Substituir "your_supabase" por chave real
□ Substituir "your_openai" por chave real
□ Salvar .env (Ctrl+S)
□ Ctrl+C no terminal
□ npm run dev
□ Ver "Supabase configurado" no console
□ Testar: "oi noa"
```

---

## ⏱️ **TEMPO:**

```
Pegar chaves Supabase: 1 minuto
Pegar chave OpenAI: 30 segundos
Editar .env: 30 segundos
Reiniciar: 30 segundos
TOTAL: 2 minutos e meio
```

---

## 🎯 **DEPOIS DISSO:**

```
✅ Nôa conecta ao Supabase REAL
✅ Acessa documentos_mestres
✅ Acessa knowledge_base
✅ Acessa ai_learning
✅ Acessa noa_kpis
✅ Busca semântica funciona
✅ Aprendizado ativo
✅ Respostas inteligentes
✅ Avaliação clínica completa
✅ Relatório no dashboard
✅ TUDO FUNCIONA! 🎉
```

---

**EDITE O .ENV COM SUAS CHAVES AGORA!** 🔑

**Arquivo:** `C:\Users\phpg6\Desktop\NOA FINAL\.env`


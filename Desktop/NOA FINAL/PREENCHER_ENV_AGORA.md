# 🔧 PREENCHER .env AGORA!

## ✅ **ARQUIVO .env CRIADO!**

Localização: `C:\Users\phpg6\Desktop\NOA FINAL\.env`

---

## 📝 **PREENCHA AS 3 CHAVES PRINCIPAIS:**

### **1. VITE_SUPABASE_URL**
```
Onde: https://supabase.com/dashboard
Caminho: Seu Projeto > Settings > API > Project URL

Exemplo:
VITE_SUPABASE_URL=https://abcdefgh.supabase.co

⚠️ Troque "your-project" pela URL REAL!
```

### **2. VITE_SUPABASE_PUBLISHABLE_KEY**
```
Onde: https://supabase.com/dashboard
Caminho: Seu Projeto > Settings > API > Project API keys > anon public

Exemplo:
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJI...

⚠️ Troque "your_supabase_anon_key_here" pela chave REAL!
```

### **3. VITE_OPENAI_API_KEY (opcional mas recomendado)**
```
Onde: https://platform.openai.com/api-keys
Clique: Create new secret key

Exemplo:
VITE_OPENAI_API_KEY=sk-proj-abc123...

⚠️ Se não tiver, deixe como está (modo offline funciona)
```

---

## ✅ **DEPOIS DE PREENCHER:**

```bash
1. Salvar .env (Ctrl+S)
2. Fechar editor
3. Terminal:
   Ctrl+C (parar servidor)
   npm run dev (rodar de novo)
4. Ver no console:
   ✅ Supabase configurado: https://...
   ✅ [NoaVision IA] Modelo carregado
```

---

## 🎯 **RESULTADO:**

### **ANTES (sem .env):**
```
❌ localhost:54321
❌ ERR_CONNECTION_REFUSED
❌ Sem dados
❌ Nôa burra
```

### **DEPOIS (com .env):**
```
✅ https://seu-projeto.supabase.co
✅ Conectado!
✅ Documentos carregados
✅ Nôa inteligente
✅ Busca funcionando
✅ Aprendizado ativo
```

---

## 📋 **VERIFICAR SE DEU CERTO:**

Após reiniciar, no console do navegador (F12):

```javascript
✅ Supabase configurado: https://... (deve aparecer sua URL)
✅ [NoaVision IA] Modelo carregado em XXXXms
✅ 🎯 [NoaVision IA] Nôa Esperanza pronta para conversar!

❌ Se aparecer "Modo LOCAL ativo" = .env errado
```

---

## ⚠️ **DICAS:**

1. **.env NÃO pode ter .txt no final!**
   ```
   ✅ .env (correto)
   ❌ .env.txt (errado)
   ```

2. **Não pode ter espaços nas chaves:**
   ```
   ✅ VITE_SUPABASE_URL=https://...
   ❌ VITE_SUPABASE_URL = https://... (espaços errados)
   ```

3. **Não pode ter aspas:**
   ```
   ✅ VITE_SUPABASE_URL=https://...
   ❌ VITE_SUPABASE_URL="https://..." (aspas erradas)
   ```

---

## 🚀 **ABRA O .env E EDITE AGORA:**

```
Arquivo: C:\Users\phpg6\Desktop\NOA FINAL\.env
Editor: Notepad, VSCode, ou Cursor
Editar: Substituir "your_" pelas chaves reais
Salvar: Ctrl+S
Reiniciar: npm run dev
```

---

**É SÓ ISSO! Depois disso TUDO funciona! 🎉**


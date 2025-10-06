# 🚂 DEPLOY RAILWAY AGORA - 0.5% FINAL

## ⚡ **PASSO A PASSO RÁPIDO:**

### **1. ACESSE O RAILWAY:**
- URL: [railway.app](https://railway.app)
- Faça login com sua conta

### **2. CRIE NOVO PROJETO:**
1. Clique em **"New Project"**
2. Escolha **"Deploy from GitHub repo"**
3. Selecione: `OrbitrumConnect/chatodemais`
4. Clique em **"Deploy"**

### **3. CONFIGURE O PROJETO:**
1. **Root Directory:** `server`
2. **Build Command:** `npm install`
3. **Start Command:** `npm start`

### **4. ADICIONE VARIÁVEIS DE AMBIENTE:**
```env
PORT=3000
SUPABASE_URL=https://bcocwbitkoyxwmsufzuf.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjb2N3Yml0a295eHdtc3VmemZ1ZiIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzM1MjI5NzE5LCJleHAiOjIwNTA4MDU3MTl9.0f5df0c..f4c3ad2
NODE_ENV=production
SECRET_KEY=orbitrum_secret_2025
```

### **5. AGUARDE O DEPLOY:**
- Deve aparecer "✅ Deployed"
- Copie a URL gerada (ex: `https://orbitrum-backend-xxxx.up.railway.app`)

### **6. CONFIGURE O VERCEL:**
1. Acesse: [vercel.com/dashboard](https://vercel.com/dashboard)
2. Projeto: `orbitrum-novo`
3. **Settings** → **Environment Variables**
4. Adicione:
   ```env
   VITE_API_URL=https://sua-url-railway.up.railway.app
   ```

### **7. TESTE:**
- Acesse: `https://orbitrum-novo.vercel.app`
- Login: `passosmir4@gmail.com` / `m6m7m8M9!horus`
- Teste: +Tokens e zona admin

## ⏰ **TEMPO ESTIMADO: 5 minutos**
## 🎯 **RESULTADO: Sistema 100% funcional**

---

**Se não conseguir, me avise que eu ajudo!** 🚀 
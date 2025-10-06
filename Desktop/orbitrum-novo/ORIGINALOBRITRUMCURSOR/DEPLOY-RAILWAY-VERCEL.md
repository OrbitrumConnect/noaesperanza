# 🚀 DEPLOY RAILWAY + VERCEL - ORBITRUM CONNECT

## 📁 ESTRUTURA FINAL
```
/orbitrum-novo
├── /client          # Frontend (Vercel)
│   ├── package.json
│   ├── vite.config.ts
│   └── src/
├── /server          # Backend (Railway)
│   ├── package.json
│   ├── index-simple.js
│   └── railway.json
├── vercel.json      # Config Vercel
└── railway.json     # Config Railway
```

## 🔧 CONFIGURAÇÕES NECESSÁRIAS

### 1. VARIÁVEIS DE AMBIENTE

**No Railway (Backend):**
```env
PORT=3000
DATABASE_URL=sua_url_do_supabase
SECRET_KEY=orbitrum_secret_2025
NODE_ENV=production
```

**No Vercel (Frontend):**
```env
VITE_API_URL=https://seu-backend.railway.app
```

### 2. DEPLOY NO RAILWAY

1. Acesse: `railway.app`
2. Clique em **"New Project"**
3. Escolha **"Deploy from GitHub repo"**
4. Selecione seu repositório
5. Configure:
   - **Root Directory:** `server`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`

### 3. DEPLOY NO VERCEL

1. Acesse: `vercel.com`
2. Clique em **"New Project"**
3. Importe do GitHub
4. Configure:
   - **Root Directory:** `client`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

### 4. TESTE OS ENDPOINTS

**Backend (Railway):**
- `https://seu-backend.railway.app/api/health`
- `https://seu-backend.railway.app/api/test`

**Frontend (Vercel):**
- `https://seu-frontend.vercel.app`

## ✅ CHECKLIST FINAL

- [ ] Backend rodando no Railway
- [ ] Frontend rodando no Vercel
- [ ] API endpoints funcionando
- [ ] Variáveis de ambiente configuradas
- [ ] CORS configurado
- [ ] URLs atualizadas no frontend

## 🎯 PRÓXIMOS PASSOS

1. **Teste o login/register**
2. **Conecte com Supabase**
3. **Adicione mais endpoints**
4. **Configure domínio customizado**

## 📞 SUPORTE

Se algo não funcionar:
1. Verifique os logs no Railway
2. Verifique os logs no Vercel
3. Teste os endpoints individualmente
4. Confirme as variáveis de ambiente 
# 🚀 ORBITRUM CONNECT - DEPLOY PRODUÇÃO 2025

**Versão:** 2.0.0  
**Status:** ✅ PRONTO PARA PRODUÇÃO  
**Data:** 30/07/2025

---

## 📋 CHECKLIST PRÉ-DEPLOY

- [x] ✅ Configuração API corrigida
- [x] ✅ Scripts de produção atualizados
- [x] ✅ Vercel.json configurado
- [x] ✅ Railway.json configurado
- [x] ✅ Variáveis de ambiente documentadas
- [x] ✅ Backup local salvo (OrbitrumOriginal2025)

---

## 🌐 DEPLOY NO VERCEL (FRONTEND)

### 1️⃣ CONFIGURAÇÃO INICIAL
```bash
# Instalar Vercel CLI
npm i -g vercel

# Login no Vercel
vercel login
```

### 2️⃣ DEPLOY AUTOMÁTICO
```bash
# Na pasta do projeto
cd C:\Users\phpg6\Desktop\orbitrum-novo

# Deploy
vercel --prod
```

### 3️⃣ CONFIGURAR VARIÁVEIS DE AMBIENTE
No Dashboard do Vercel, adicionar:

```env
NODE_ENV=production
VITE_API_URL=https://captivating-nature-orbitrum20.up.railway.app
SESSION_SECRET=orbitrum-production-secret-key-2025
COMPANY_PIX_KEY=03669282106
WEBHOOK_URL=https://captivating-nature-orbitrum20.up.railway.app
FRONTEND_URL=https://seu-dominio.vercel.app
```

---

## 🚂 DEPLOY NO RAILWAY (BACKEND)

### 1️⃣ CONFIGURAÇÃO INICIAL
- Acessar: https://railway.app
- Conectar repositório GitHub
- Selecionar pasta `orbitrum-novo`

### 2️⃣ CONFIGURAR VARIÁVEIS DE AMBIENTE
No Railway Dashboard:

```env
NODE_ENV=production
PORT=5000
SESSION_SECRET=orbitrum-production-secret-key-2025
COMPANY_PIX_KEY=03669282106
WEBHOOK_URL=https://captivating-nature-orbitrum20.up.railway.app
FRONTEND_URL=https://seu-dominio.vercel.app
```

### 3️⃣ CONFIGURAR SUPABASE (OPCIONAL)
```env
VITE_SUPABASE_URL=https://sua-url.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima
DATABASE_URL=postgresql://postgres:[password]@[host]:5432/postgres
```

### 4️⃣ CONFIGURAR MERCADO PAGO (OPCIONAL)
```env
MERCADO_PAGO_ACCESS_TOKEN=seu-token-mercado-pago
MERCADO_PAGO_PUBLIC_KEY=sua-chave-publica-mercado-pago
```

---

## 🔧 CONFIGURAÇÕES ESPECÍFICAS

### 📁 ARQUIVOS CONFIGURADOS
- ✅ `vercel.json` - Configuração Vercel
- ✅ `railway.json` - Configuração Railway
- ✅ `package.json` - Scripts atualizados
- ✅ `client/src/lib/api-config.ts` - API configurada

### 🌍 URLs DE PRODUÇÃO
- **Frontend (Vercel):** https://seu-dominio.vercel.app
- **Backend (Railway):** https://captivating-nature-orbitrum20.up.railway.app
- **API Health:** https://captivating-nature-orbitrum20.up.railway.app/api/health

---

## 🧪 TESTE DE PRODUÇÃO

### 1️⃣ VERIFICAR HEALTH CHECK
```bash
curl https://captivating-nature-orbitrum20.up.railway.app/api/health
```

### 2️⃣ TESTAR LOGIN ADMIN
```bash
curl -X POST https://captivating-nature-orbitrum20.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"passosmir4@gmail.com","password":"m6m7m8M9!horus"}'
```

### 3️⃣ VERIFICAR FRONTEND
- Acessar: https://seu-dominio.vercel.app
- Login: passosmir4@gmail.com / m6m7m8M9!horus

---

## 🛠️ COMANDOS ÚTEIS

### 🔄 REBUILD E DEPLOY
```bash
# Vercel
vercel --prod

# Railway (automático via GitHub)
git add .
git commit -m "Deploy produção"
git push origin main
```

### 📊 LOGS E MONITORAMENTO
```bash
# Vercel logs
vercel logs

# Railway logs (via dashboard)
# https://railway.app/project/[ID]/deployments
```

---

## 🚨 SOLUÇÃO DE PROBLEMAS

### ❌ ERRO: CORS
**Solução:** Verificar se `VITE_API_URL` está configurado corretamente

### ❌ ERRO: Build falhou
**Solução:** Verificar se todas as dependências estão instaladas

### ❌ ERRO: Variáveis de ambiente
**Solução:** Verificar se todas as variáveis estão configuradas no Vercel/Railway

### ❌ ERRO: Porta em uso
**Solução:** Railway usa porta automática, não precisa configurar

---

## 📞 SUPORTE

**Status atual:**
- ✅ Localhost: Funcionando perfeitamente
- ✅ Backup: Salvo em OrbitrumOriginal2025
- ✅ Configuração: Pronta para produção
- ✅ Documentação: Completa

**Próximos passos:**
1. Deploy no Vercel
2. Deploy no Railway
3. Configurar variáveis de ambiente
4. Testar em produção

---

*Deploy configurado em: 30/07/2025*  
*Orbitrum Connect v2.0.0 - Produção* 
# 🚀 Orbitrum Connect - Deploy Vercel

## ⚡ Deploy Rápido

### 1. Preparar Projeto
```bash
# Windows
deploy-vercel.bat

# Linux/Mac
chmod +x deploy-vercel.sh
./deploy-vercel.sh
```

### 2. Configurar Vercel
1. Acesse [vercel.com/dashboard](https://vercel.com/dashboard)
2. Clique em "New Project"
3. Importe seu repositório do GitHub
4. Configure:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build:vercel`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### 3. Variáveis de Ambiente (OBRIGATÓRIAS)
No Vercel Dashboard → Settings → Environment Variables:

```
VITE_SUPABASE_URL=https://sua-url.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima
DATABASE_URL=postgresql://postgres:[password]@[host]:5432/postgres
SESSION_SECRET=sua-chave-secreta-muito-segura
NODE_ENV=production
```

### 4. Deploy
- Clique em "Deploy"
- Aguarde 2-3 minutos
- Acesse a URL gerada

## 🔐 Login Admin
- **Email**: `passosmir4@gmail.com`
- **Senha**: (a mesma do Replit)

## 📋 Checklist Pós-Deploy
- [ ] Site carrega sem erros
- [ ] Login admin funciona
- [ ] Supabase conecta
- [ ] APIs respondem
- [ ] Interface igual ao Replit

## 🆘 Problemas Comuns

### Build Falha
- Verificar dependências no `package.json`
- Verificar variáveis de ambiente
- Verificar logs no Vercel

### Supabase Não Conecta
- **USE O MESMO SUPABASE DO REPLIT**
- Verificar `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`
- Verificar permissões no Supabase

### Admin Não Loga
- Verificar `SESSION_SECRET`
- Verificar `DATABASE_URL`
- Verificar se o usuário existe no Supabase

## 📖 Documentação Completa
Consulte `DEPLOY-VERCEL-COMPLETO.md` para instruções detalhadas.

## 🎯 Resultado
✅ Site 100% igual ao Replit  
✅ Mesmo Supabase (dados preservados)  
✅ Login admin funcionando  
✅ Todas as funcionalidades ativas  
✅ Deploy automático configurado  

---

**🎉 SUCESSO! Seu Orbitrum Connect está rodando no Vercel!** 
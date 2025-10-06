# 🚀 DEPLOY VERCEL - ORBITRUM CONNECT

## 📋 PRÉ-REQUISITOS

### 1. Conta Vercel
- Criar conta em [vercel.com](https://vercel.com)
- Conectar com GitHub

### 2. Supabase (MESMO DO REPLIT)
- **NÃO CRIE NOVO SUPABASE** - use o mesmo do Replit
- Anotar URL e chave anônima

### 3. GitHub
- Repositório no GitHub com o código

## 🔧 CONFIGURAÇÃO

### Passo 1: Preparar o Código
```bash
# 1. Fazer commit das alterações
git add .
git commit -m "Configuração Vercel"
git push origin main
```

### Passo 2: Deploy no Vercel
1. **Acessar Vercel Dashboard**
2. **Clicar em "New Project"**
3. **Importar repositório do GitHub**
4. **Configurar projeto:**

```
Framework Preset: Vite
Root Directory: ./
Build Command: npm run build:vercel
Output Directory: dist
Install Command: npm install
```

### Passo 3: Variáveis de Ambiente
No Vercel Dashboard → Settings → Environment Variables:

#### 🔐 SUPABASE (OBRIGATÓRIO)
```
VITE_SUPABASE_URL=https://sua-url.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima
DATABASE_URL=postgresql://postgres:[password]@[host]:5432/postgres
```

#### 🔑 AUTENTICAÇÃO
```
SESSION_SECRET=sua-chave-secreta-muito-segura
NODE_ENV=production
```

#### 💳 MERCADO PAGO (OPCIONAL)
```
MERCADO_PAGO_ACCESS_TOKEN=seu-token
MERCADO_PAGO_PUBLIC_KEY=sua-chave
COMPANY_PIX_KEY=03669282106
```

#### 🔗 WEBHOOKS
```
WEBHOOK_URL=https://seu-dominio.vercel.app
FRONTEND_URL=https://seu-dominio.vercel.app
```

## 🚀 DEPLOY

### Deploy Automático
1. **Clicar em "Deploy"**
2. **Aguardar build (2-3 minutos)**
3. **Verificar logs de build**

### Verificar Deploy
1. **Acessar URL gerada**
2. **Testar login admin: passosmir4@gmail.com**
3. **Verificar funcionalidades**

## 🔍 VERIFICAÇÃO

### ✅ Checklist Pós-Deploy
- [ ] Site carrega sem erros
- [ ] Login admin funciona
- [ ] Supabase conecta
- [ ] APIs respondem
- [ ] Interface igual ao Replit

### 🐛 Troubleshooting

#### Erro de Build
```bash
# Verificar logs no Vercel
# Verificar dependências no package.json
# Verificar variáveis de ambiente
```

#### Erro de Supabase
```bash
# Verificar VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY
# Usar mesmas credenciais do Replit
# Verificar permissões no Supabase
```

#### Erro de API
```bash
# Verificar DATABASE_URL
# Verificar SESSION_SECRET
# Verificar NODE_ENV=production
```

## 🔄 ATUALIZAÇÕES

### Deploy Automático
- Push para `main` = deploy automático
- Vercel detecta mudanças automaticamente

### Deploy Manual
```bash
# No Vercel Dashboard
# Settings → Git → Redeploy
```

## 📱 DOMÍNIO PERSONALIZADO

### Configurar Domínio
1. **Vercel Dashboard → Settings → Domains**
2. **Adicionar domínio personalizado**
3. **Configurar DNS**

### SSL Automático
- Vercel fornece SSL automático
- HTTPS ativo por padrão

## 🔐 SEGURANÇA

### Variáveis Sensíveis
- **NUNCA** commitar `.env` no GitHub
- Usar Environment Variables do Vercel
- Rotacionar chaves periodicamente

### Admin Access
- Login: `passosmir4@gmail.com`
- Manter senha segura
- Usar 2FA se possível

## 📊 MONITORAMENTO

### Vercel Analytics
- Performance automática
- Erros em tempo real
- Métricas de uso

### Logs
- Vercel Dashboard → Functions
- Logs de API em tempo real
- Debug de problemas

## 🎯 RESULTADO FINAL

✅ **Site 100% igual ao Replit**
✅ **Mesmo Supabase (dados preservados)**
✅ **Login admin funcionando**
✅ **Todas as funcionalidades ativas**
✅ **Deploy automático configurado**

## 🆘 SUPORTE

### Problemas Comuns
1. **Build falha**: Verificar dependências
2. **Supabase não conecta**: Verificar credenciais
3. **Admin não loga**: Verificar SESSION_SECRET
4. **APIs não funcionam**: Verificar DATABASE_URL

### Contato
- Vercel Support: [vercel.com/support](https://vercel.com/support)
- Supabase Support: [supabase.com/support](https://supabase.com/support)

---

**🎉 SUCESSO! Seu Orbitrum Connect está rodando no Vercel!** 
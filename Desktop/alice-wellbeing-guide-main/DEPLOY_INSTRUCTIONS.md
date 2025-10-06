# 🚀 Guia de Deploy - Alice Wellbeing Guide no Vercel

## ✅ Status Atual do Projeto

- ✅ Build funcionando localmente
- ✅ Dependências instaladas
- ✅ Configuração Vite otimizada
- ✅ vercel.json configurado
- ✅ README.md atualizado

## 🌐 Passo a Passo para Deploy no Vercel

### 1. Preparar o Repositório GitHub

```bash
# Se ainda não fez commit das mudanças
git add .
git commit -m "Configuração para deploy no Vercel"
git push origin main
```

### 2. Acessar o Vercel

1. Vá para [vercel.com](https://vercel.com)
2. Faça login com sua conta GitHub
3. Clique em "New Project"

### 3. Importar o Repositório

1. Selecione o repositório `alice-wellbeing-guide`
2. O Vercel detectará automaticamente que é um projeto Vite
3. Clique em "Import"

### 4. Configurar Environment Variables

No dashboard do projeto, vá em **Settings → Environment Variables** e adicione:

```env
# Supabase Configuration
VITE_SUPABASE_PROJECT_ID=jpgmzygxmsiscrmpskgf
VITE_SUPABASE_URL=https://jpgmzygxmsiscrmpskgf.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpwZ216eWd4bXNpc2NybXBza2dmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1MjIzNzUsImV4cCI6MjA3MTA5ODM3NX0.WBOy5nzfL-n-8ZitgaTkxGgJfitjRt3nCnMndY36qQg

# Stripe Configuration (Frontend - Publishable Key)
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_51Rsp2KC46MRhe1fByhH11Tx2PTvUNgnKSY7Al0R87XArm9C0zulZICONmaefbST0OiAanxmwL1GPlTVncpsiRFSj00L5Ysc42a

# OpenAI Configuration
VITE_OPENAI_API_KEY=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
```

### 5. Configurar Build Settings

O Vercel deve detectar automaticamente:
- **Framework**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 6. Deploy

1. Clique em "Deploy"
2. Aguarde o processo de build (2-3 minutos)
3. O Vercel fornecerá uma URL temporária

### 7. Verificar o Deploy

Após o deploy, verifique:

- ✅ App carrega sem erros
- ✅ Login/cadastro funciona
- ✅ Dashboard renderiza
- ✅ Responsive design
- ✅ Conexão com Supabase

## 🔧 Configuração do Supabase

### 1. Deploy das Edge Functions

```bash
# No terminal local
npx supabase login
npx supabase link --project-ref jpgmzygxmsiscrmpskgf
npx supabase functions deploy
```

### 2. Configurar Secrets

```bash
npx supabase secrets set STRIPE_SECRET_KEY=sk_live_...
npx supabase secrets set OPENAI_API_KEY=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
```

## 🌍 Configurar Domínio Personalizado (Opcional)

### 1. No Dashboard do Vercel

1. Vá em **Settings → Domains**
2. Clique em "Add Domain"
3. Digite seu domínio (ex: `alicewellbeing.com`)
4. Siga as instruções de configuração DNS

### 2. Configurar DNS

Configure os registros DNS conforme instruções do Vercel:
- **Type**: CNAME
- **Name**: @
- **Value**: cname.vercel-dns.com

## 📊 Monitoramento e Analytics

### 1. Vercel Analytics

- Ative o Vercel Analytics no dashboard
- Monitore performance e erros

### 2. Supabase Dashboard

- Monitore queries e performance
- Verifique logs das edge functions

## 🐛 Troubleshooting Comum

### Erro de Build no Vercel

```bash
# Verificar logs no dashboard do Vercel
# Possíveis soluções:
1. Verificar environment variables
2. Confirmar que todas as dependências estão no package.json
3. Verificar se não há imports de arquivos inexistentes
```

### Erro de Conexão com Supabase

```bash
# Verificar:
1. Environment variables corretas
2. RLS policies configuradas
3. Edge functions deployadas
4. CORS configurado no Supabase
```

### Erro de Stripe

```bash
# Verificar:
1. Chave pública correta no frontend
2. Chave secreta configurada nas edge functions
3. Webhook endpoints configurados
```

## ✅ Checklist Final

- [ ] Build local funcionando
- [ ] Repositório no GitHub
- [ ] Projeto criado no Vercel
- [ ] Environment variables configuradas
- [ ] Deploy bem-sucedido
- [ ] App funcionando na URL do Vercel
- [ ] Login/cadastro testado
- [ ] Dashboard acessível
- [ ] Edge functions deployadas
- [ ] Stripe configurado
- [ ] Domínio personalizado (opcional)

## 🎯 Resultado Final

Após seguir todos os passos, você terá:

✅ **Sistema independente** rodando em Vercel  
✅ **Database próprio** no Supabase  
✅ **SSL automático** e CDN global  
✅ **Edge functions** para pagamentos  
✅ **Interface completa** responsiva  
✅ **Admin dashboard** operacional  
✅ **Analytics** funcionando  

## 📞 Suporte

Se encontrar problemas:

1. Verifique os logs no dashboard do Vercel
2. Consulte a documentação do Supabase
3. Verifique as configurações de environment variables
4. Teste localmente antes de fazer deploy

---

**Alice Wellbeing Guide** - Deployado com sucesso! 🚀

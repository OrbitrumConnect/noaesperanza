# 🚀 Guia de Deploy - NOA Esperanza

## ✅ GitHub + Vercel - Configuração

### 📁 Arquivos já configurados:
- ✅ `.gitignore` - `.env` não será commitado (seguro!)
- ✅ `vercel.json` - Rotas configuradas
- ✅ `env.example` - Template para referência

---

## 🔧 Cenários de Deploy

### **Cenário 1: Deploy RÁPIDO (Modo Local)**
**O que fazer:** Apenas fazer push para GitHub e conectar ao Vercel

**Resultado:**
- ✅ App funciona 100%
- ✅ Dados salvos no localStorage
- ✅ Chat offline ativo
- ✅ Voz Microsoft Maria
- ⚠️ Sem banco de dados online
- ⚠️ Sem IA real (respostas offline)

**Status:** PRONTO para usar! 🎉

---

### **Cenário 2: Deploy COMPLETO (Produção)**
**O que fazer:** Configurar variáveis de ambiente no Vercel

#### Passo a passo:

1. **No Vercel Dashboard:**
   - Vá em **Settings** → **Environment Variables**

2. **Adicione as variáveis:**

```bash
# OpenAI (para IA real)
VITE_OPENAI_API_KEY=sk-proj-seu-token-aqui

# Supabase (para banco online)
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOi...

# App Config
VITE_APP_ENVIRONMENT=production
VITE_APP_VERSION=3.0.0
```

3. **Redeploy:**
   - Clique em "Redeploy" após adicionar as variáveis

**Resultado:**
- ✅ IA real (OpenAI)
- ✅ Banco de dados online (Supabase)
- ✅ Todos os recursos ativos

---

## 📋 Checklist de Deploy

### Antes do Push:
- [x] `.env` está no `.gitignore`
- [x] `env.example` está commitado (sem chaves reais)
- [x] Build local funciona: `npm run build`
- [x] Preview funciona: `npm run preview`

### Após Deploy:
1. [ ] App carrega sem erros
2. [ ] Chat funciona (modo local ou online)
3. [ ] Voz TTS funciona
4. [ ] Navegação entre páginas OK
5. [ ] Footer e Header aparecem

---

## 🔒 Segurança

### ✅ O que NUNCA vai para o GitHub:
- `.env` (ignorado)
- Chaves de API reais
- Tokens de acesso

### ✅ O que VAI para o GitHub:
- `env.example` (template)
- Todo o código fonte
- Configurações públicas

---

## 🌐 URLs após Deploy

### Produção:
```
https://noa-esperanza.vercel.app/
```

### Preview (cada PR):
```
https://noa-esperanza-[hash].vercel.app/
```

---

## 🆘 Troubleshooting

### Erro: "Blank page" após deploy
**Solução:** Verifique se o `base` no `vite.config.ts` está correto para produção

### Erro: "404 em rotas"
**Solução:** Já configurado no `vercel.json` - rewrites ativos ✅

### Erro: "OpenAI não funciona"
**Solução:** Adicione `VITE_OPENAI_API_KEY` nas Environment Variables do Vercel

### Erro: "Supabase não conecta"
**Solução:** Adicione `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY` no Vercel

---

## 📞 Suporte

- **Modo Local:** Funciona sem configuração adicional
- **Modo Produção:** Configure variáveis no Vercel
- **Dúvidas:** Verifique logs no Vercel Dashboard

---

## ✨ Resumo

```
GitHub Push → Vercel Build → Deploy Automático
                    ↓
          Sem variáveis = Modo Local (funciona!)
          Com variáveis = Modo Produção (IA real)
```

**Ambos funcionam perfeitamente!** 🚀


# 🔧 Vercel Troubleshooting Guide

## ❌ Problema: "Build Failed - Command npm run build:vercel exited with 1"

### 🔍 Diagnóstico Rápido:

1. **Teste local primeiro:**
   ```bash
   npm run test-build
   ```

2. **Se falhar localmente:**
   - Verifique se todas as dependências estão instaladas
   - Verifique se o `vite.config.ts` está correto
   - Verifique se não há erros de sintaxe

### 🛠️ Soluções:

#### Solução 1: Build Simplificado
Se o problema persistir, use um build mais simples:

```json
// package.json
{
  "scripts": {
    "build": "vite build",
    "build:vercel": "vite build && cp -r api dist/ && cp -r shared dist/"
  }
}
```

#### Solução 2: Verificar Dependências
Certifique-se de que todas as dependências estão no `package.json`:

```bash
npm install
npm run build
```

#### Solução 3: Configuração Vercel Manual
No Vercel Dashboard:
1. Vá em Project Settings
2. Build & Development Settings
3. Configure:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

#### Solução 4: Variáveis de Ambiente
Certifique-se de que as variáveis estão configuradas:

```
VITE_SUPABASE_URL=https://sua-url.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima
NODE_ENV=production
```

### 🚀 Deploy Alternativo:

Se ainda não funcionar, use esta configuração mínima:

1. **Remova o `vercel-build.config.js`**
2. **Use apenas:**
   ```json
   {
     "scripts": {
       "build": "vite build"
     }
   }
   ```
3. **Configure no Vercel:**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Functions: `api/index.js`

### 📞 Logs de Debug:

Para ver logs detalhados:
1. Vercel Dashboard → Deployments
2. Clique no deploy que falhou
3. Veja os logs completos

### ✅ Checklist Final:

- [ ] `npm run test-build` funciona localmente
- [ ] Todas as dependências instaladas
- [ ] Variáveis de ambiente configuradas
- [ ] `vite.config.ts` sem erros
- [ ] `api/index.js` existe e está correto

---

**Se ainda não funcionar, me envie os logs completos do Vercel!** 
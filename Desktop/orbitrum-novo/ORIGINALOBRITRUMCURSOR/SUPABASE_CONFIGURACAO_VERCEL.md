# 🔧 CONFIGURAÇÃO SUPABASE PARA VERCEL

## **❌ PROBLEMA ATUAL:**
- Replit: `replit.app` ✅ Autorizado no Supabase
- Vercel: `vercel.app` ❌ Não autorizado no Supabase

## **✅ SOLUÇÃO RÁPIDA:**

### **1. Acessar Supabase Dashboard:**
- URL: https://supabase.com/dashboard
- Projeto: `orbitrum-connect`

### **2. Configurar CORS Origins:**
- Settings → API → CORS Origins
- **ADICIONAR:**
  ```
  https://orbitrum-novo-blgax7yy8-passos-projects-92954505.vercel.app
  https://*.vercel.app
  ```

### **3. Configurar Redirect URLs:**
- Authentication → URL Configuration
- **SITE URL:**
  ```
  https://orbitrum-novo-blgax7yy8-passos-projects-92954505.vercel.app
  ```
- **REDIRECT URLs:**
  ```
  https://orbitrum-novo-blgax7yy8-passos-projects-92954505.vercel.app/**
  https://orbitrum-novo-blgax7yy8-passos-projects-92954505.vercel.app/auth/callback
  ```

### **4. Configurar Vercel Environment Variables:**
- Vercel Dashboard → Project Settings → Environment Variables
- **ADICIONAR:**
  ```
  VITE_SUPABASE_URL=https://seu-projeto.supabase.co
  VITE_SUPABASE_ANON_KEY=sua-chave-anonima
  ```

## **🎯 RESULTADO:**
- ✅ Frontend Vercel conecta ao Supabase
- ✅ Auth real funcionando
- ✅ Dados sincronizados
- ✅ 100% igual ao Replit

## **⏱️ TEMPO ESTIMADO:**
- **Configuração**: 5 minutos
- **Deploy**: 2 minutos
- **Teste**: 1 minuto
- **Total**: 8 minutos para 100% funcional 
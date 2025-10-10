# 🔧 CONFIGURAÇÃO DO SUPABASE - NOAGPT IMRE

## ❌ PROBLEMA ATUAL:
```
❌ Erro ao conectar com Supabase: Error: Timeout na verificação de auth
```

## ✅ SOLUÇÃO:

### 1. **CRIAR ARQUIVO .env**
Crie um arquivo `.env` na raiz do projeto com:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sua_chave_anon_aqui

# OpenAI Configuration
VITE_OPENAI_API_KEY=sua_chave_openai_aqui

# ElevenLabs Configuration  
VITE_ELEVEN_API_KEY=sua_chave_elevenlabs_aqui

# App Configuration
VITE_APP_ENVIRONMENT=development
VITE_APP_VERSION=3.0.0
```

### 2. **OBTER CREDENCIAIS DO SUPABASE**

1. Acesse: https://supabase.com
2. Faça login na sua conta
3. Selecione seu projeto
4. Vá em **Settings** → **API**
5. Copie:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** → `VITE_SUPABASE_PUBLISHABLE_KEY`

### 3. **EXECUTAR O SQL**
1. No Supabase, vá em **SQL Editor**
2. Cole o conteúdo de `noagpt_imre_final_complete.sql`
3. Execute o script

### 4. **REINICIAR O APP**
```bash
npm run dev
```

## 🚀 **MODO RESILIENTE (ATUAL)**

O app já está configurado para funcionar **SEM** Supabase:

- ✅ **Chat funciona** normalmente
- ✅ **Avaliação IMRE** funciona localmente
- ✅ **Aprendizado** salva no localStorage
- ⚠️ **Dados não persistem** entre sessões

## 🎯 **TESTE RÁPIDO:**

1. **Sem Supabase**: App funciona normalmente
2. **Com Supabase**: Dados persistem + funcionalidades avançadas

## 📞 **PRECISA DE AJUDA?**

Se não conseguir configurar o Supabase, o app **já funciona** em modo local!

**O importante é que o NoaGPT IMRE está funcionando!** 🚀

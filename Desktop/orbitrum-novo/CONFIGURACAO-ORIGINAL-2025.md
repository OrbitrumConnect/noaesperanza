# 🚀 ORBITRUM CONNECT - CONFIGURAÇÃO ORIGINAL 2025

**Data do Backup:** 30/07/2025  
**Versão:** 2.0.0  
**Status:** ✅ FUNCIONANDO PERFEITAMENTE

---

## 🔐 CREDENCIAIS DE ACESSO

### 👑 ADMIN PRINCIPAL
- **Email:** passosmir4@gmail.com
- **Senha:** m6m7m8M9!horus
- **ID:** 9
- **Tipo:** Admin
- **Tokens:** 0

### 👥 USUÁRIOS ESSENCIAIS
- **João Vidal:** joao.vidal@remederi.com (ID: 5, Professional, 23040 tokens)
- **Maria Helena:** mariahelenaearp@gmail.com (ID: 6, Client, 4320 tokens)
- **Pedro:** phpg69@gmail.com (ID: 8, Client, 2160 tokens)

---

## 🌐 CONFIGURAÇÃO DE DESENVOLVIMENTO

### 📍 LOCALHOST
- **URL:** http://localhost:5000
- **API:** http://localhost:5000/api
- **Health Check:** http://localhost:5000/api/health

### ⚙️ COMANDOS PARA INICIAR
```powershell
# Navegar para o projeto
cd C:\Users\phpg6\Desktop\orbitrum-novo

# Instalar dependências
npm install

# Iniciar servidor (Windows PowerShell)
$env:NODE_ENV="development"; npx tsx server/index.ts
```

---

## 🔧 CONFIGURAÇÕES IMPORTANTES

### 📁 ARQUIVOS CRÍTICOS
- **API Config:** `client/src/lib/api-config.ts` ✅ CORRIGIDO
- **Storage:** `server/storage.ts` ✅ FUNCIONANDO
- **Auth Routes:** `server/auth-routes.ts` ✅ FUNCIONANDO

### 🌍 CONFIGURAÇÃO DA API
```typescript
// client/src/lib/api-config.ts
export const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.DEV ? 'http://localhost:5000' : 'https://captivating-nature-orbitrum20.up.railway.app');
```

---

## 📊 STATUS DO SISTEMA

### ✅ FUNCIONALIDADES ATIVAS
- 🔐 Sistema de autenticação local
- 👥 Gerenciamento de usuários
- 💬 Chat e comunicação
- 📊 Analytics e relatórios
- 💳 Sistema de pagamentos (Mercado Pago)
- 🤖 Integração Telegram (desabilitada temporariamente)
- 📱 Interface responsiva

### ⚠️ CONFIGURAÇÕES TEMPORÁRIAS
- Supabase Auth desabilitado (usando autenticação local)
- Telegram Bot desabilitado para estabilidade
- Sincronização automática desabilitada

---

## 🛠️ SOLUÇÃO DE PROBLEMAS

### ❌ ERRO: CORS com Railway
**Problema:** Frontend tentando acessar Railway em vez de localhost  
**Solução:** ✅ Corrigido em `api-config.ts`

### ❌ ERRO: Senha incorreta
**Problema:** Senha do admin não funcionando  
**Solução:** ✅ Senha correta: `m6m7m8M9!horus`

### ❌ ERRO: NODE_ENV no Windows
**Problema:** Comando não reconhecido no PowerShell  
**Solução:** ✅ Usar `$env:NODE_ENV="development"`

---

## 📋 CHECKLIST DE FUNCIONAMENTO

- [x] Servidor rodando na porta 5000
- [x] Health check respondendo
- [x] Login admin funcionando
- [x] Frontend servido corretamente
- [x] API configurada para localhost
- [x] Usuários essenciais carregados
- [x] Sistema de tokens funcionando
- [x] CORS configurado corretamente

---

## 🔄 RESTAURAR BACKUP

Para restaurar esta configuração:

1. **Copiar pasta:** `OrbitrumOriginal2025` → `orbitrum-novo`
2. **Instalar dependências:** `npm install`
3. **Iniciar servidor:** `$env:NODE_ENV="development"; npx tsx server/index.ts`
4. **Acessar:** http://localhost:5000
5. **Login admin:** passosmir4@gmail.com / m6m7m8M9!horus

---

## 📞 SUPORTE

**Problemas conhecidos resolvidos:**
- ✅ CORS com Railway
- ✅ Senha admin incorreta
- ✅ NODE_ENV no Windows
- ✅ Configuração API localhost

**Sistema 100% funcional para desenvolvimento local!**

---

*Backup criado em: 30/07/2025 às 13:46*  
*Orbitrum Connect v2.0.0 - Configuração Original* 
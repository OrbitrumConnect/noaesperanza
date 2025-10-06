# 🔧 RESET SENHA SUPABASE - ORBITRUM CONNECT

## ✅ USUÁRIO CONFIRMADO
- **ID:** `34bcbd10-6a7e-4df5-afeb-ada17069cc71`
- **Email:** `passosmir4@gmail.com`
- **Status:** Email confirmado, usuário ativo

## 🚨 PROBLEMA: Senha não funciona no Vercel

### 🔧 SOLUÇÃO: Resetar Senha

#### Execute este SQL no Supabase SQL Editor:

```sql
-- Resetar senha para: m6m7m8M9!horus
UPDATE auth.users 
SET encrypted_password = crypt('m6m7m8M9!horus', gen_salt('bf')),
    updated_at = now()
WHERE email = 'passosmir4@gmail.com';
```

#### Verificar se funcionou:

```sql
-- Verificar se a senha foi atualizada
SELECT 
  id,
  email,
  email_confirmed_at,
  last_sign_in_at,
  updated_at
FROM auth.users 
WHERE email = 'passosmir4@gmail.com';
```

### 🚀 TESTE IMEDIATO

#### 1. Execute o UPDATE SQL
#### 2. Teste o login:
- **URL:** [chatodemais.vercel.app](https://chatodemais.vercel.app)
- **Email:** `passosmir4@gmail.com`
- **Senha:** `m6m7m8M9!horus`

### ⚡ RESULTADO ESPERADO

✅ **Senha resetada no Supabase**  
✅ **Login funcionando no Vercel**  
✅ **Admin acessando dashboard**  
✅ **Dados preservados do Replit**

### 🎯 PRÓXIMO PASSO

**Execute o UPDATE SQL e teste o login imediatamente!** 
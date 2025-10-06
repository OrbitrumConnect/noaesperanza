# 🧪 TESTE DIRETO SUPABASE - ORBITRUM CONNECT

## 🚨 PROBLEMA: Login não funciona mesmo com tudo configurado

### 🎯 TESTE DIRETO NO SUPABASE

#### 1. Acessar SQL Editor no Supabase
- **URL:** [supabase.com/dashboard](https://supabase.com/dashboard)
- **Projeto:** `gnvxnsgewhjucdhwrrdi`
- **Menu:** SQL Editor

#### 2. Executar Consulta para Verificar Usuário
```sql
SELECT 
  id,
  email,
  email_confirmed_at,
  last_sign_in_at,
  created_at,
  raw_user_meta_data
FROM auth.users 
WHERE email = 'passosmir4@gmail.com';
```

#### 3. Se Usuário Existe mas não Loga - Resetar Senha
```sql
-- Resetar senha para: m6m7m8M9!horus
UPDATE auth.users 
SET encrypted_password = crypt('m6m7m8M9!horus', gen_salt('bf')),
    email_confirmed_at = now(),
    updated_at = now()
WHERE email = 'passosmir4@gmail.com';
```

#### 4. Se Usuário NÃO Existe - Criar Manualmente
```sql
-- Inserir usuário admin
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_user_meta_data,
  is_super_admin
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'passosmir4@gmail.com',
  crypt('m6m7m8M9!horus', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"name": "Admin Master", "admin": true}',
  false
);
```

### 🚀 TESTE RÁPIDO

#### A) Executar SQL no Supabase
1. **Copie e cole** o SQL da consulta
2. **Execute** e me diga o resultado
3. **Se não existir** → Execute o INSERT
4. **Se existir** → Execute o UPDATE

#### B) Testar Login Imediatamente
- **URL:** [chatodemais.vercel.app](https://chatodemais.vercel.app)
- **Email:** `passosmir4@gmail.com`
- **Senha:** `m6m7m8M9!horus`

### ⚡ RESULTADO ESPERADO

✅ **Usuário encontrado/criado no Supabase**  
✅ **Senha resetada/criada**  
✅ **Email confirmado**  
✅ **Login funcionando no Vercel**

### 🎯 PRÓXIMO PASSO

**Execute o SQL no Supabase e me diga o resultado!** 
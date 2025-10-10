# 🔧 CONFIGURAR SUPABASE - NÔA ESPERANZA

## 🚨 PROBLEMA ATUAL
```
❌ Perfil não encontrado, usando modo local: Error: Timeout profile
```

**Causa**: Supabase não está conectado corretamente ou tabela `noa_users` não existe.

---

## ✅ SOLUÇÃO PASSO A PASSO

### 1️⃣ **Verificar Variáveis de Ambiente**

#### Criar arquivo `.env` na raiz do projeto:

```bash
# Copie o exemplo
cp .env.example .env
```

#### Edite `.env` e adicione:

```env
VITE_SUPABASE_URL=https://lhclqebtkyfftkevumix.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sua_anon_key_aqui
```

#### 📍 Onde encontrar a ANON KEY:

1. Acesse: https://supabase.com/dashboard
2. Selecione o projeto: `lhclqebtkyfftkevumix`
3. Vá em: **Settings** → **API**
4. Copie: **Project API keys** → **anon** → **public**

---

### 2️⃣ **Verificar Tabelas no Supabase**

#### Acesse o SQL Editor:
https://supabase.com/dashboard/project/lhclqebtkyfftkevumix/sql

#### Execute este SQL para verificar:

```sql
-- 1. Verificar se tabela existe
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_name = 'noa_users'
);

-- 2. Ver estrutura da tabela
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'noa_users';

-- 3. Contar registros
SELECT COUNT(*) FROM noa_users;

-- 4. Ver registros
SELECT * FROM noa_users LIMIT 5;
```

---

### 3️⃣ **Criar Tabela (se não existir)**

Se a tabela não existe, execute o SQL completo:

```bash
# No Supabase SQL Editor, execute:
noa_esperanza_system_supabase.sql
```

Ou copie e cole o conteúdo do arquivo no editor SQL.

---

### 4️⃣ **Testar Conexão no App**

#### A. Reinicie o servidor de desenvolvimento:

```bash
# Ctrl+C para parar
npm run dev
```

#### B. Abra o console do navegador (F12)

#### C. Execute o teste de diagnóstico:

```javascript
testSupabase()
```

#### D. Leia os resultados:

```
✅ TODOS OS TESTES PASSARAM!
```

Ou:

```
❌ CONFIGURAÇÃO INVÁLIDA!
   📋 SOLUÇÃO: ...
```

---

### 5️⃣ **Verificar RLS (Row Level Security)**

#### No Supabase, verifique se RLS está ativo:

1. Acesse: **Database** → **Tables** → `noa_users`
2. Clique em **RLS disabled** (se estiver)
3. Adicione políticas de acesso

#### Ou execute no SQL Editor:

```sql
-- Verificar RLS
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'noa_users';

-- Desabilitar temporariamente (APENAS PARA TESTE)
ALTER TABLE noa_users DISABLE ROW LEVEL SECURITY;
```

⚠️ **ATENÇÃO**: Apenas para teste local! Reative RLS em produção.

---

### 6️⃣ **Inserir Usuário de Teste**

```sql
-- Inserir usuário de teste manualmente
INSERT INTO noa_users (user_id, user_type, name, profile_data)
VALUES (
  gen_random_uuid(), 
  'paciente', 
  'Pedro Passos',
  '{"email": "phpg69@gmail.com", "created_at": "2025-01-01"}'
);

-- Verificar
SELECT * FROM noa_users WHERE name = 'Pedro Passos';
```

---

### 7️⃣ **Verificar Authentication no Supabase**

#### Se você já tem conta no Lovable:

1. Acesse: **Authentication** → **Users**
2. Veja se seu email está lá
3. Copie o `User ID` (UUID)

#### Linkar com noa_users:

```sql
-- Substitua SEU_USER_ID_AQUI pelo ID copiado
UPDATE noa_users 
SET user_id = 'SEU_USER_ID_AQUI'
WHERE name = 'Pedro Passos';
```

---

## 🧪 CHECKLIST COMPLETO

- [ ] Arquivo `.env` criado com chaves corretas
- [ ] Servidor reiniciado (`npm run dev`)
- [ ] Tabela `noa_users` existe no Supabase
- [ ] RLS configurado ou desabilitado para teste
- [ ] Teste `testSupabase()` passou com sucesso
- [ ] Usuário cadastrado manualmente ou via Landing Page
- [ ] Perfil carregando sem timeout

---

## 📞 COMANDOS ÚTEIS

### No terminal:
```bash
# Ver variáveis de ambiente
npm run dev

# Reiniciar limpo
rm -rf node_modules/.vite
npm run dev
```

### No console do navegador:
```javascript
// Teste de diagnóstico
testSupabase()

// Ver configuração atual
console.log(import.meta.env.VITE_SUPABASE_URL)
console.log(import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.substring(0, 20))
```

---

## 🆘 PROBLEMAS COMUNS

### ❌ "Timeout profile"
**Causa**: Supabase não responde ou tabela não existe  
**Solução**: Execute `testSupabase()` e siga as instruções

### ❌ "RLS blocking access"
**Causa**: Políticas de segurança bloqueando leitura  
**Solução**: Desabilite RLS temporariamente para teste

### ❌ "No rows found"
**Causa**: Tabela vazia, nenhum usuário cadastrado  
**Solução**: Cadastre-se pela Landing Page ou insira manualmente

### ❌ "Invalid API key"
**Causa**: ANON_KEY incorreta ou expirada  
**Solução**: Copie novamente do dashboard do Supabase

---

## 🎯 PRÓXIMOS PASSOS

Após tudo funcionar:

1. ✅ Cadastre-se pela Landing Page
2. ✅ Selecione "Sou Paciente"
3. ✅ Entre no chat
4. ✅ Nôa deve reconhecer seu nome!

---

**Precisa de ajuda? Execute `testSupabase()` no console! 💪**


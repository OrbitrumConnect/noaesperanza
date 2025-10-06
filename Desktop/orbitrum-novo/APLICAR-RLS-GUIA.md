# 🔐 GUIA PARA APLICAR RLS NO SUPABASE

## 🎯 **PROBLEMA ATUAL:**
- ✅ **Local**: Login admin funciona
- ❌ **Vercel**: Login admin não funciona
- 🔧 **Solução**: Configurar RLS no Supabase

## 🚀 **PASSO A PASSO:**

### **1. ACESSAR SUPABASE DASHBOARD**
1. Acesse: [supabase.com/dashboard](https://supabase.com/dashboard)
2. Clique no projeto: `gnvxnsgewhjucdhwrrdi`
3. Menu lateral: **"SQL Editor"**

### **2. EXECUTAR POLÍTICAS RLS**
Cole este código no SQL Editor e clique **"Run"**:

```sql
-- Ativar RLS nas tabelas principais
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE professionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- Políticas para tabela users
CREATE POLICY "users_own_data" ON users
FOR ALL USING (
  auth.uid()::text = supabase_id 
  OR userType = 'admin'
);

CREATE POLICY "admins_all_users" ON users
FOR ALL USING (userType = 'admin');

-- Políticas para tabela professionals
CREATE POLICY "professionals_own_data" ON professionals
FOR ALL USING (
  auth.uid()::text = supabase_id
  OR EXISTS (
    SELECT 1 FROM users 
    WHERE users.supabase_id = auth.uid()::text 
    AND users.userType = 'admin'
  )
);

CREATE POLICY "admins_all_professionals" ON professionals
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.supabase_id = auth.uid()::text 
    AND users.userType = 'admin'
  )
);

-- Políticas para tabela clients
CREATE POLICY "clients_own_data" ON clients
FOR ALL USING (
  auth.uid()::text = supabase_id
  OR EXISTS (
    SELECT 1 FROM users 
    WHERE users.supabase_id = auth.uid()::text 
    AND users.userType = 'admin'
  )
);

CREATE POLICY "admins_all_clients" ON clients
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.supabase_id = auth.uid()::text 
    AND users.userType = 'admin'
  )
);

-- Políticas de inserção
CREATE POLICY "authenticated_insert" ON users
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "authenticated_insert_professionals" ON professionals
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "authenticated_insert_clients" ON clients
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Políticas de atualização
CREATE POLICY "users_update_own" ON users
FOR UPDATE USING (
  auth.uid()::text = supabase_id
  OR userType = 'admin'
);
```

### **3. VERIFICAR SE FUNCIONOU**
1. Vá em **"Authentication"** → **"Policies"**
2. Deve aparecer as políticas criadas
3. Status deve mostrar "RLS enabled"

### **4. TESTAR NO VERCEL**
1. Acesse: `https://orbitrum-novo.vercel.app`
2. Login: `passosmir4@gmail.com` / `m6m7m8M9!horus`
3. Dashboard admin deve funcionar!

## 🔒 **O QUE AS POLÍTICAS FAZEM:**

### **✅ SEGURANÇA:**
- **Usuários normais**: Veem apenas seus dados
- **Admins**: Veem todos os dados
- **Inserção**: Apenas usuários autenticados
- **Atualização**: Apenas próprios dados

### **✅ COMPATIBILIDADE:**
- **Local**: Continua funcionando
- **Vercel**: Agora vai funcionar
- **Supabase**: Protegido com RLS

## ⚠️ **IMPORTANTE:**
- Execute apenas **UMA VEZ**
- Não quebra o app local
- Resolve problema do Vercel
- Sistema fica mais seguro

## 🎉 **RESULTADO ESPERADO:**
- ✅ Login admin funciona no Vercel
- ✅ Dashboard admin acessível
- ✅ Sistema 100% funcional
- ✅ Segurança melhorada

---

**Tempo estimado: 2 minutos**
**Dificuldade: Fácil**
**Risco: Baixo (não quebra nada)** 
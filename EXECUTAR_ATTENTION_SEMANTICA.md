# 🧠 EXECUTAR ATTENTION SEMÂNTICA - Dr. Ricardo Valença

## 📋 **SQL PARA EXECUTAR:**

### **1. 🚀 SQL PRINCIPAL (semantic_attention_database.sql):**
```sql
-- Execute este arquivo no Supabase Dashboard
-- semantic_attention_database.sql
```

### **2. 🔧 EXECUÇÃO NO SUPABASE:**

#### **Método 1: Dashboard Supabase**
1. Acesse: `https://supabase.com/dashboard`
2. Vá em **SQL Editor**
3. Cole o conteúdo do arquivo `semantic_attention_database.sql`
4. Execute (Ctrl+Enter)

#### **Método 2: Via Terminal (se tiver psql)**
```bash
psql -h db.xxxxxxxxxxxxx.supabase.co -U postgres -d postgres -f semantic_attention_database.sql
```

### **3. 📊 VERIFICAÇÃO:**
```sql
-- Verificar se as tabelas foram criadas
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('user_semantic_context', 'conversation_history', 'vector_memory');

-- Verificar dados do Dr. Ricardo
SELECT * FROM user_semantic_context WHERE user_id = 'dr-ricardo-valenca';
```

## **🎯 FUNCIONALIDADES CRIADAS:**

✅ **user_semantic_context** - Contexto individualizado por usuário
✅ **conversation_history** - Histórico com análise semântica  
✅ **vector_memory** - Memória vetorial individualizada
✅ **activate_semantic_attention()** - Ativar attention para usuário
✅ **process_input_with_attention()** - Processar input com attention
✅ **update_vector_memory()** - Atualizar memória vetorial

## **🚀 PRÓXIMO PASSO:**
Após executar o SQL, o sistema de attention semântica estará 100% funcional!

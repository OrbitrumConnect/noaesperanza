# 🚀 EXECUTAR ESTES 2 SQLS (ORDEM CORRETA)

## ✅ **ARQUIVOS CORRETOS:**

```
1️⃣ setup_noavision_ia_SIMPLES.sql ✅ CORRIGIDO
2️⃣ setup_integration_SIMPLES.sql ✅ LIMPO
```

---

## ❌ **NÃO EXECUTE ESTES (ESTÃO ERRADOS):**

```
❌ setup_noavision_ia_complete.sql (tem REUNI)
❌ setup_noavision_ia_complete_FIXED.sql (tem erro de parâmetros)
❌ setup_integration_consentimento.sql (tem prescriptions)
❌ setup_integration_consentimento_FIXED.sql (tem REUNI)
```

---

## 📋 **PASSO A PASSO:**

### **1️⃣ PRIMEIRO SQL:**

```
Arquivo: setup_noavision_ia_SIMPLES.sql

No Supabase:
1. SQL Editor > New Query
2. Cole TODO o conteúdo do arquivo
3. Run (Ctrl+Enter)
4. Aguarde: ✅ NOAVISION IA INSTALADO COM SUCESSO!

Tempo: 1-2 minutos
```

### **2️⃣ SEGUNDO SQL:**

```
Arquivo: setup_integration_SIMPLES.sql

No Supabase:
1. SQL Editor > New Query (nova aba)
2. Cole TODO o conteúdo do arquivo
3. Run (Ctrl+Enter)
4. Aguarde: ✅ INTEGRAÇÃO INSTALADA COM SUCESSO!

Tempo: 1 minuto
```

---

## ✅ **O QUE SERÁ CRIADO:**

### **SQL 1 (setup_noavision_ia_SIMPLES.sql):**
```
✅ Extensão pgvector
✅ Coluna embedding na ai_learning
✅ Tabela embedding_cache
✅ Índices de performance
✅ Função search_similar_embeddings (CORRIGIDA)
✅ Views de monitoramento
```

### **SQL 2 (setup_integration_SIMPLES.sql):**
```
✅ Tabela user_consents
✅ Tabela shared_reports
✅ Tabela notifications
✅ Tabela exam_requests
✅ Tabela appointments
✅ Tabela medical_records
✅ RLS policies
✅ Triggers
```

---

## ❌ **O QUE NÃO SERÁ CRIADO (CORRETO):**

```
❌ Tabela reuni_products (não existe)
❌ Tabela prescriptions (não existe)
❌ Função validate_rdc_compliance (não existe)
❌ Trigger de prescrições (não existe)
```

---

## 🎯 **RESULTADO ESPERADO:**

Depois de executar os 2 SQLs, você verá:

```
✅ NOAVISION IA INSTALADO COM SUCESSO!
✅ INTEGRAÇÃO INSTALADA COM SUCESSO!

🔍 Verificações:
- SELECT * FROM v_embeddings_by_profile;
- SELECT * FROM v_embedding_cache_stats;
- SELECT * FROM user_consents;
- SELECT * FROM shared_reports;
```

---

## ⚠️ **SE DER ERRO:**

### **Erro: "parameter name used more than once"**
```
❌ Você executou o arquivo ERRADO
✅ Execute: setup_noavision_ia_SIMPLES.sql
```

### **Erro: "relation reuni_products does not exist"**
```
❌ Você executou o arquivo ERRADO
✅ Execute: setup_integration_SIMPLES.sql
```

---

## 🚀 **EXECUTE AGORA:**

```
Supabase Dashboard > SQL Editor

1️⃣ setup_noavision_ia_SIMPLES.sql → Run
2️⃣ setup_integration_SIMPLES.sql → Run

PRONTO! 🎉
```


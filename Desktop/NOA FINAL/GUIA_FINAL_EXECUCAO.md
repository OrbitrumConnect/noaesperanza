# 🚀 GUIA FINAL DE EXECUÇÃO - SQLs NoaVision IA

## ⚠️ **IMPORTANTE - LEIA PRIMEIRO:**

Se você já tentou executar outros SQLs antes e deu erro, **LIMPE AS TABELAS PRIMEIRO:**

```sql
-- EXECUTE ESTE SQL PRIMEIRO (só se já tentou antes):
DROP TABLE IF EXISTS embedding_cache CASCADE;
DROP TABLE IF EXISTS appointments CASCADE;
DROP FUNCTION IF EXISTS search_similar_embeddings;
```

---

## ✅ **ARQUIVOS CORRETOS (VERSÃO FINAL):**

```
1️⃣ setup_noavision_ia_SIMPLES.sql (CORRIGIDO ✅)
2️⃣ setup_integration_SIMPLES.sql (CORRIGIDO ✅)
```

---

## 🎯 **PASSO A PASSO COMPLETO:**

### **ETAPA 1: Limpar (se necessário)**

```sql
-- Só execute se já tentou antes e deu erro
-- Supabase > SQL Editor > New Query

DROP TABLE IF EXISTS embedding_cache CASCADE;
DROP TABLE IF EXISTS appointments CASCADE;
DROP TABLE IF EXISTS user_consents CASCADE;
DROP TABLE IF EXISTS shared_reports CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS exam_requests CASCADE;
DROP TABLE IF EXISTS medical_records CASCADE;
DROP FUNCTION IF EXISTS search_similar_embeddings;

-- Execute (Run)
```

### **ETAPA 2: SQL 1 (Embeddings)**

```
Arquivo: setup_noavision_ia_SIMPLES.sql

Supabase > SQL Editor > New Query

1. Cole TODO o conteúdo
2. Execute (Run ou Ctrl+Enter)
3. Aguarde 1-2 minutos
4. Veja: ✅ NOAVISION IA INSTALADO COM SUCESSO!
```

### **ETAPA 3: SQL 2 (Integração)**

```
Arquivo: setup_integration_SIMPLES.sql

Supabase > SQL Editor > New Query (nova aba)

1. Cole TODO o conteúdo
2. Execute (Run ou Ctrl+Enter)
3. Aguarde 1 minuto
4. Veja: ✅ INTEGRAÇÃO INSTALADA COM SUCESSO!
```

---

## ✅ **VERIFICAR SE DEU CERTO:**

Execute estes comandos no SQL Editor:

```sql
-- 1. Ver embeddings criados
SELECT * FROM v_embeddings_by_profile;

-- 2. Ver cache de embeddings
SELECT * FROM v_embedding_cache_stats;

-- 3. Ver consentimentos
SELECT COUNT(*) FROM user_consents;

-- 4. Ver compartilhamentos
SELECT COUNT(*) FROM shared_reports;

-- 5. Ver appointments
SELECT COUNT(*) FROM appointments;
```

---

## ❌ **ERROS COMUNS E SOLUÇÕES:**

### **Erro: "parameter name used more than once"**
```
✅ SOLUÇÃO: Use setup_noavision_ia_SIMPLES.sql (versão corrigida)
❌ NÃO USE: setup_noavision_ia_complete_FIXED.sql
```

### **Erro: "relation reuni_products does not exist"**
```
✅ SOLUÇÃO: Use setup_integration_SIMPLES.sql
❌ NÃO USE: setup_integration_consentimento_FIXED.sql
```

### **Erro: "column scheduled_at does not exist"**
```
✅ SOLUÇÃO: Execute a limpeza (ETAPA 1) e tente novamente
Isso significa que a tabela appointments já existia com estrutura antiga
```

### **Erro: "extension vector already exists"**
```
✅ NORMAL! Significa que pgvector já está instalado
Continue normalmente
```

---

## 📊 **O QUE VAI SER CRIADO:**

### **SQL 1:**
```
✅ Extensão pgvector
✅ Coluna embedding (384 dimensões)
✅ Tabela embedding_cache
✅ Função search_similar_embeddings (SEM conflito de nomes)
✅ Índices de performance (IVFFlat)
✅ Views de monitoramento
```

### **SQL 2:**
```
✅ Tabela user_consents (LGPD)
✅ Tabela shared_reports (compartilhamento)
✅ Tabela notifications
✅ Tabela exam_requests
✅ Tabela appointments (com colunas garantidas)
✅ Tabela medical_records
✅ RLS policies (segurança)
✅ Triggers (timestamps)
```

---

## ❌ **O QUE NÃO VAI SER CRIADO (CORRETO):**

```
❌ Tabela reuni_products
❌ Tabela prescriptions (com compliance)
❌ Função validate_rdc_compliance
❌ Produtos REUNI
❌ Validação RDC 660/327
```

---

## 🎉 **DEPOIS DE EXECUTAR:**

```
1. Reinicie o servidor: http://localhost:8000
2. Faça login
3. Teste: "oi noa"
4. Teste: "fazer avaliação clínica"
5. Responda as 28 perguntas
6. Veja o relatório gerado!
```

---

## 📞 **SUPORTE:**

Se ainda der erro, me envie:
1. Qual SQL você executou
2. A mensagem de erro completa
3. Printscreen do erro

---

**EXECUTAR AGORA:** setup_noavision_ia_SIMPLES.sql → setup_integration_SIMPLES.sql

**Tempo total:** 3-4 minutos ⏱️


# ✅ SQLS CORRETOS PARA EXECUTAR

## ⚠️ **IMPORTANTE:**

**Vocês NÃO têm:**
- ❌ Produtos REUNI
- ❌ Venda de remédios
- ❌ Validação RDC 660/327
- ❌ Prescrições automáticas

**Então use os SQLs SIMPLIFICADOS abaixo:**

---

## 🚀 **ORDEM DE EXECUÇÃO:**

### **1️⃣ PRIMEIRO SQL:**

```
📁 setup_noavision_ia_SIMPLES.sql

O QUE FAZ:
✅ Instala pgvector
✅ Adiciona coluna embedding na tabela ai_learning
✅ Cria tabela embedding_cache
✅ Cria índices de performance
✅ Cria função search_similar_embeddings
✅ Cria views de monitoramento

❌ NÃO INCLUI:
- Tabela reuni_products (removida)
- Validação RDC (removida)
- Trigger de prescrições (removido)

⏱️ TEMPO: 1-2 minutos
```

### **2️⃣ SEGUNDO SQL:**

```
📁 setup_integration_SIMPLES.sql

O QUE FAZ:
✅ Cria tabela user_consents (LGPD)
✅ Cria tabela shared_reports (compartilhamento)
✅ Cria tabela notifications (notificações)
✅ Cria tabela exam_requests (exames)
✅ Cria tabela appointments (agendamentos)
✅ Cria tabela medical_records (prontuários)
✅ Configura RLS policies
✅ Cria triggers de timestamp

❌ NÃO INCLUI:
- Tabela prescriptions (removida)
- Validação RDC (removida)
- Compliance REUNI (removido)

⏱️ TEMPO: 1 minuto
```

---

## 📋 **COMO EXECUTAR:**

```
1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto
3. SQL Editor > New Query

4. PRIMEIRO: Cole setup_noavision_ia_SIMPLES.sql
   Execute (Run)
   Aguarde: ✅ NOAVISION IA INSTALADO COM SUCESSO!

5. SEGUNDO: Cole setup_integration_SIMPLES.sql
   Execute (Run)
   Aguarde: ✅ INTEGRAÇÃO INSTALADA COM SUCESSO!

6. PRONTO! 🎉
```

---

## ✅ **FUNCIONALIDADES ATIVAS:**

```
✅ Embeddings locais (MiniLM-L6-v2)
✅ Busca semântica
✅ Cache de embeddings
✅ Consentimentos LGPD
✅ Compartilhamento paciente → médico
✅ Notificações
✅ Solicitação de exames
✅ Agendamentos
✅ Prontuários
```

## ❌ **FUNCIONALIDADES REMOVIDAS:**

```
❌ Produtos REUNI
❌ Prescrições automáticas
❌ Validação RDC 660/327
❌ Controle ANVISA
❌ Receitas especiais
```

---

## 🎯 **RESULTADO FINAL:**

```
Sistema NoaVision IA funcionando com:
- 80% processamento local
- Compartilhamento funcionando
- Consentimentos salvos
- Sem features de farmácia/prescrição
```

---

**Execute esses 2 SQLs e está pronto! 🚀**


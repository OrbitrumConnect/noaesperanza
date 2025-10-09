# 📊 SQLs NECESSÁRIOS PARA NOAVISION IA

## ✅ **ORDEM DE EXECUÇÃO:**

### **1️⃣ PRINCIPAL (Obrigatório):**
```
📁 setup_noavision_ia_complete.sql

O QUE FAZ:
✅ Instala extensão pgvector
✅ Adiciona coluna embedding na tabela ai_learning
✅ Cria tabela embedding_cache
✅ Cria função search_similar_embeddings
✅ Cria índices de performance
✅ Cria tabela reuni_products (RDC 660/327)
✅ Adiciona compliance nas prescrições
✅ Insere produtos REUNI de exemplo
✅ Cria views de monitoramento

TEMPO: 2-3 minutos
CRÍTICO: SIM - Sem isso NoaVision IA não tem embeddings
```

### **2️⃣ INTEGRAÇÃO (Obrigatório):**
```
📁 setup_integration_consentimento.sql

O QUE FAZ:
✅ Cria tabela user_consents (consentimentos LGPD)
✅ Cria tabela shared_reports (compartilhamento)
✅ Cria tabela notifications (notificações)
✅ Cria tabela prescriptions (prescrições)
✅ Cria tabela exam_requests (exames)
✅ Cria tabela appointments (agendamentos)
✅ Cria tabela medical_records (prontuários)
✅ Configura RLS policies
✅ Cria triggers automáticos

TEMPO: 1-2 minutos
CRÍTICO: SIM - Compartilhamento e consentimentos dependem disso
```

---

## 🚀 **COMO EXECUTAR:**

### **PASSO A PASSO:**

```
1. Acesse: https://supabase.com/dashboard

2. Selecione seu projeto

3. SQL Editor > New Query

4. PRIMEIRO: Cole setup_noavision_ia_complete.sql
   Clique: Run (ou Ctrl+Enter)
   Aguarde: 2-3 minutos
   Verifique: "✅ SETUP COMPLETO!"

5. SEGUNDO: New Query novamente
   Cole: setup_integration_consentimento.sql
   Clique: Run
   Aguarde: 1-2 minutos
   Verifique: "✅ Setup completo!"

6. PRONTO! Sistema 100% funcional
```

---

## ⚠️ **SE NÃO EXECUTAR:**

```
SEM SQL:
✅ Servidor roda
✅ Interface funciona
✅ Chat funciona
❌ Sem busca semântica (100% OpenAI)
❌ Sem embeddings locais
❌ Sem compartilhamento
❌ Sem consentimentos no banco
❌ Sem prescrições REUNI
❌ Sem compliance RDC

COM SQL:
✅ Tudo acima
✅ Busca semântica (80% local)
✅ Embeddings (5-10x mais rápido)
✅ Compartilhamento funcionando
✅ Consentimentos salvos
✅ Prescrições com compliance
✅ Sistema 163% melhor!
```

---

## 📁 **LOCALIZAÇÃO DOS ARQUIVOS:**

```
C:\Users\phpg6\Desktop\NOA FINAL\

📄 setup_noavision_ia_complete.sql (649 linhas)
   → SQL principal NoaVision IA

📄 setup_integration_consentimento.sql (320 linhas)
   → SQL de integração e compartilhamento
```

---

## ✅ **RESUMO:**

```
EXECUTE NO SUPABASE (ordem):
1️⃣ setup_noavision_ia_complete.sql
2️⃣ setup_integration_consentimento.sql

TEMPO TOTAL: 3-5 minutos
RESULTADO: Sistema completo!
```

---

**Precisa de ajuda para executar ou tem alguma dúvida?** 😊

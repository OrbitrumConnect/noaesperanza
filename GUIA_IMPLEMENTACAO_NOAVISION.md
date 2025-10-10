# 🚀 GUIA DE IMPLEMENTAÇÃO - NOAVISION IA
## Passo a passo para ativar o sistema

*Data: 09/10/2025*

---

## ✅ **O QUE FOI IMPLEMENTADO**

```
✅ SQL completo (setup_noavision_ia_complete.sql)
✅ @xenova/transformers adicionado ao package.json
✅ NoaVisionIA.ts (motor inteligente)
✅ DashboardAgent.ts (navegação)
✅ PrescriptionAgent.ts (prescrições REUNI)
✅ ConsentService.ts (consentimentos LGPD)
✅ SharingService.ts (compartilhamento)
✅ Home.tsx atualizado (usa NoaVisionIA)
✅ DashboardPaciente.tsx (botão compartilhar)
✅ DashboardMedico.tsx (lista pacientes reais)
✅ RegisterPage.tsx (consentimentos no cadastro)
```

---

## 🚀 **PASSOS PARA ATIVAR**

### **PASSO 1: Banco de Dados (Supabase)**

```bash
1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto
3. SQL Editor > New Query
4. Cole o conteúdo de: setup_noavision_ia_complete.sql
5. Execute (Run)
6. Aguarde conclusão (2-3 min)
7. Verifique no final: deve mostrar "✅ SETUP COMPLETO!"
```

### **PASSO 2: Instalar Dependências**

```bash
# No terminal, na pasta do projeto:
npm install

# Isso vai instalar @xenova/transformers automaticamente
```

### **PASSO 3: Rodar o Servidor Local**

```bash
npm run dev
```

### **PASSO 4: Acessar a Aplicação**

```
Abra o navegador em: http://localhost:5173
```

---

## 🎯 **COMO TESTAR**

### **Teste 1: NoaVision IA funcionando**

```
1. Faça login
2. Vá para /home (chat)
3. Digite: "Como ver meus exames?"
4. Aguarde resposta
5. Console deve mostrar:
   🧠 [NoaVision IA] Carregando MiniLM-L6-v2...
   ✅ [NoaVision IA] Modelo carregado em XXXms
   📨 [NoaVision IA] Processando...
   ✅ [NoaVision IA] Resposta em XXXms (local/agent/openai)
```

### **Teste 2: Consentimentos no Cadastro**

```
1. Logout
2. Acesse /register
3. Preencha formulário
4. Role até o fim
5. Você deve ver:
   ☑ Política de Privacidade LGPD *
   ☑ Termos de Uso *
   ☐ Compartilhar dados com médicos
   ☐ Pesquisa científica
   ☐ Notificações email
6. Marque obrigatórios e cadastre
```

### **Teste 3: Compartilhamento Paciente → Médico**

```
1. Login como PACIENTE
2. Faça avaliação clínica
3. Vá para Dashboard Paciente
4. Aba "Relatórios"
5. Clique "Compartilhar com Médico"
6. Selecione médico da lista
7. Confirme
8. Deve ver: "Relatório compartilhado com sucesso!"
```

### **Teste 4: Médico Vê Pacientes**

```
1. Login como MÉDICO
2. Vá para Dashboard Médico
3. Deve ver lista de pacientes que compartilharam
4. Se não houver, verá: "Nenhum paciente compartilhou ainda"
```

---

## 📊 **MONITORAMENTO**

### **Verificar se NoaVision IA está funcionando:**

```sql
-- No Supabase SQL Editor:

-- 1. Ver estatísticas
SELECT * FROM noavision_stats;

-- 2. Ver monitoramento diário
SELECT * FROM noavision_monitoring;

-- 3. Analisar performance
SELECT * FROM analyze_noavision_performance(7);

-- 4. Ver embeddings gerados
SELECT COUNT(*) as with_embeddings
FROM ai_learning
WHERE embedding IS NOT NULL;
```

### **Console do navegador (F12):**

```
Procure por logs:
✅ [NoaVision IA] Sistema inicializado
✅ [NoaVision IA] Modelo carregado
📨 [NoaVision IA] Processando...
✅ [NoaVision IA] Resposta em XXXms (local)
```

---

## ⚠️ **RESOLUÇÃO DE PROBLEMAS**

### **Problema 1: Modelo não carrega**

```
Erro: "Failed to load model"

Solução:
1. Verifique conexão com internet (primeiro download ~25MB)
2. Limpe cache do navegador (Ctrl+Shift+Del)
3. Recarregue página (F5)
4. Modelo fica em cache depois do primeiro load
```

### **Problema 2: Busca semântica não funciona**

```
Erro: "function search_similar_embeddings does not exist"

Solução:
1. Execute novamente setup_noavision_ia_complete.sql
2. Verifique se extensão vector está instalada:
   SELECT * FROM pg_extension WHERE extname = 'vector';
3. Se não estiver, execute:
   CREATE EXTENSION vector;
```

### **Problema 3: Consentimentos não salvam**

```
Erro: "table user_consents does not exist"

Solução:
1. A tabela é criada no setup_integration_consentimento.sql
2. Execute também esse arquivo no Supabase
3. Ou execute apenas:
   CREATE TABLE user_consents (...);
```

### **Problema 4: Compartilhamento não funciona**

```
Erro: "table shared_reports does not exist"

Solução:
1. Execute setup_integration_consentimento.sql
2. Ou setup_noavision_ia_complete.sql (já inclui)
```

---

## 📈 **EVOLUÇÃO ESPERADA**

### **Primeira hora:**
```
• Modelo carrega: ~10s (primeiro load)
• Carregamentos seguintes: instantâneo (cache)
• Respostas: 100% OpenAI (sem embeddings ainda)
```

### **Primeiro dia:**
```
• 10-20 interações
• Sistema gera embeddings
• 20-30% respostas locais
• Tempo médio: 1.5s
```

### **Primeira semana:**
```
• 100-200 interações
• 40-50% respostas locais
• Tempo médio: 1.0s
• Economia: 50% custo API
```

### **Primeiro mês:**
```
• 1000+ interações
• 70-80% respostas locais
• Tempo médio: 0.5s
• Economia: 80% custo API
```

---

## 🎯 **PRÓXIMOS PASSOS (APÓS ATIVAR)**

### **Curto prazo (1 semana):**
```
1. Monitorar performance no console
2. Verificar logs de erro
3. Coletar feedback dos usuários
4. Ajustar threshold se necessário (0.85 → 0.90)
```

### **Médio prazo (1 mês):**
```
1. Gerar embeddings para todos os 366 registros antigos
2. Adicionar mais produtos REUNI ao banco
3. Implementar mais rotas no DashboardAgent
4. Criar componente de notificações (sino)
```

### **Longo prazo (3 meses):**
```
1. Implementar prescrições completas
2. Sistema de agendamento
3. Prontuário eletrônico completo
4. App mobile (React Native)
```

---

## 📝 **CHECKLIST DE ATIVAÇÃO**

```
BANCO DE DADOS:
[ ] Executar setup_noavision_ia_complete.sql
[ ] Executar setup_integration_consentimento.sql
[ ] Verificar extensão vector instalada
[ ] Testar função search_similar_embeddings
[ ] Adicionar produtos REUNI de exemplo

CÓDIGO:
[ ] npm install (instalar dependências)
[ ] Verificar se @xenova/transformers está instalado
[ ] Verificar se todos os arquivos foram criados
[ ] Nenhum erro de TypeScript (npm run type-check)

SERVIDOR:
[ ] npm run dev
[ ] Acessar http://localhost:5173
[ ] Fazer login
[ ] Testar chat
[ ] Verificar console (F12)

TESTES:
[ ] Cadastro com consentimentos
[ ] Chat com NoaVision IA
[ ] Compartilhamento de relatórios
[ ] Dashboard médico com pacientes reais
[ ] Navegação inteligente
```

---

## ✅ **SUCESSO!**

Se tudo funcionou, você verá:

```
CONSOLE DO NAVEGADOR:
✅ [NoaVision IA] Sistema inicializado
✅ [NoaVision IA] Modelo carregado em 8234ms
🎯 [NoaVision IA] Pronto para processar mensagens!

BANCO DE DADOS:
Total: 366 registros
Com embeddings: 0 → irá crescer
Respostas locais: 0% → irá crescer

CHAT:
Respostas rápidas e personalizadas!
Navegação inteligente funcionando!
Compliance RDC 660/327 ativo!
```

---

**Sistema NoaVision IA está PRONTO! 🎉**


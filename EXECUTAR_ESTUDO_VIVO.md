# 🚀 EXECUTAR SISTEMA "ESTUDO VIVO" - GPT BUILDER

## 📋 **INSTRUÇÕES DE EXECUÇÃO COMPLETA**

### **1. 🗄️ EXECUTAR SQL NO SUPABASE**

**Passo 1:** Acesse o Supabase SQL Editor
- Vá para: https://supabase.com/dashboard
- Selecione seu projeto
- Clique em "SQL Editor"

**Passo 2:** Execute o script principal
```sql
-- Copie e cole TODO o conteúdo do arquivo estudo_vivo_database.sql
-- Execute tudo de uma vez
```

**Passo 3:** Verificar execução
- Deve aparecer: `[{"status":"sucesso","message":"Sistema Estudo Vivo implementado com sucesso!"}]`

### **2. 🔧 INSTALAR DEPENDÊNCIAS**

**No terminal do projeto:**
```bash
npm install mammoth pdf-parse
```

### **3. 🚀 INICIAR SERVIDOR**

```bash
npm run dev
```

### **4. 🎯 TESTAR FUNCIONALIDADES**

#### **A. Teste Básico - Upload de Documento**
1. Acesse: http://localhost:3000/admin
2. Clique em "GPT Builder"
3. Vá para aba "Chat Multimodal"
4. Envie um documento (PDF, DOCX, TXT)
5. Verifique se foi salvo na base de conhecimento

#### **B. Teste Estudo Vivo**
1. No chat, digite: "gerar estudo vivo sobre nefrologia"
2. Ou clique no botão "🧠 Estudo Vivo"
3. Verifique se gera análise estruturada

#### **C. Teste Debate Científico**
1. Após enviar um documento, digite: "debate científico"
2. Ou clique no botão "💬 Debate"
3. Verifique se inicia debate estruturado

#### **D. Teste Análise de Qualidade**
1. Após enviar um documento, digite: "analisar qualidade"
2. Ou clique no botão "📊 Qualidade"
3. Verifique se gera análise metodológica

### **5. 🧠 COMANDOS DISPONÍVEIS NO CHAT**

#### **Comandos de Estudo Vivo:**
- `"gerar estudo vivo sobre [área]"` - Gera síntese científica
- `"estudo vivo nefrologia"` - Estudo específico de área
- `"estudo vivo neurologia"` - Estudo específico de área
- `"estudo vivo cannabis"` - Estudo específico de área

#### **Comandos de Debate:**
- `"debate científico"` - Inicia debate sobre último documento
- `"debater trabalho"` - Inicia debate sobre último documento
- `"debates anteriores"` - Lista debates anteriores
- `"histórico de debates"` - Lista debates anteriores

#### **Comandos de Análise:**
- `"analisar qualidade"` - Análise metodológica do último documento
- `"análise metodológica"` - Análise metodológica do último documento

### **6. 🎯 EXEMPLOS DE USO**

#### **Exemplo 1: Análise de Trabalho Científico**
```
1. Envie um artigo científico (PDF/DOCX)
2. Digite: "debate científico"
3. Nôa irá:
   - Analisar metodologia
   - Identificar pontos fortes e limitações
   - Propor melhorias
   - Sugerir pesquisas futuras
```

#### **Exemplo 2: Revisão de Literatura**
```
1. Digite: "gerar estudo vivo sobre cannabis medicinal"
2. Nôa irá:
   - Buscar documentos relevantes
   - Comparar metodologias
   - Identificar gaps
   - Gerar síntese estruturada
```

#### **Exemplo 3: Análise de Qualidade**
```
1. Envie um protocolo clínico
2. Digite: "analisar qualidade"
3. Nôa irá:
   - Avaliar rigor metodológico
   - Identificar vieses
   - Sugerir melhorias
   - Classificar nível de evidência
```

### **7. 🔍 VERIFICAÇÕES DE FUNCIONAMENTO**

#### **Verificar Tabelas Criadas:**
```sql
-- No Supabase SQL Editor
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('debates_cientificos', 'analises_qualidade', 'estudos_vivos', 'memoria_viva_cientifica');
```

#### **Verificar Funções Criadas:**
```sql
-- No Supabase SQL Editor
SELECT routine_name FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('buscar_documentos_cientificos', 'gerar_estudo_vivo', 'salvar_debate_cientifico');
```

#### **Verificar Documentos na Base:**
```sql
-- No Supabase SQL Editor
SELECT title, area, tipo_documento, nivel_evidencia 
FROM documentos_mestres 
WHERE is_active = true;
```

### **8. 🚨 SOLUÇÃO DE PROBLEMAS**

#### **Erro: "Função não encontrada"**
```sql
-- Re-executar o script estudo_vivo_database.sql
-- Verificar se todas as funções foram criadas
```

#### **Erro: "Tabela não encontrada"**
```sql
-- Verificar se as tabelas foram criadas
-- Re-executar o script se necessário
```

#### **Erro: "RLS Policy"**
```sql
-- Verificar se as políticas RLS foram criadas
-- Re-executar a seção de políticas do script
```

#### **Erro no Frontend: "Service não encontrado"**
```bash
# Verificar se o arquivo src/services/estudoVivoService.ts foi criado
# Verificar imports no GPTPBuilder.tsx
```

### **9. 🎊 FUNCIONALIDADES IMPLEMENTADAS**

#### **✅ Sistema de Metadados Científicos:**
- Área (nefrologia, neurologia, cannabis, geral, interdisciplinar)
- Tipo de documento (artigo, guideline, estudo, revisão, caso-clínico)
- Nível de evidência (A, B, C, D, expert-opinion)
- Tags e keywords
- Scores de qualidade (1-10)

#### **✅ Estudo Vivo:**
- Busca inteligente de documentos
- Análise de qualidade metodológica
- Comparação entre estudos
- Identificação de gaps
- Síntese estruturada

#### **✅ Debate Científico:**
- Análise crítica de trabalhos
- Argumentos e contra-argumentos
- Sugestões de melhoria
- Proposta de pesquisas futuras

#### **✅ Análise de Qualidade:**
- Avaliação metodológica
- Identificação de vieses
- Recomendações
- Classificação de evidência

#### **✅ Memória Viva:**
- Salvamento de debates como dados
- Cruzamento de conversas com literatura
- Aprendizado contínuo

### **10. 🚀 PRÓXIMOS PASSOS**

Após implementação bem-sucedida:

1. **Testar com documentos reais**
2. **Refinar algoritmos de análise**
3. **Expandir base de conhecimento**
4. **Implementar mais funcionalidades**
5. **Integrar com outros sistemas**

---

## 🎯 **RESULTADO ESPERADO**

**Dr. Ricardo terá um sistema que:**
- 📊 **Analisa trabalhos** cientificamente
- 💬 **Debate** metodologias e resultados  
- 🧠 **Questiona** e sugere melhorias
- 📋 **Gera** mini-revisões sistemáticas
- 🔄 **Aprende** de cada debate
- 🚀 **Propõe** novas pesquisas

**O chat do admin agora é um verdadeiro "Estudo Vivo" científico!** 🎊

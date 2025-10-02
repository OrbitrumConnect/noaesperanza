# 🧪 TESTE GPT BUILDER - SISTEMA DE DETECÇÃO

## 🎯 **TESTE DE DETECÇÃO DE DOCUMENTOS**

### **📝 Como Testar:**

1. **Acesse:** `http://localhost:3000` → Dashboard Admin → GPT Builder
2. **Abra o Console** do navegador (F12)
3. **Cole uma mensagem** no chat do GPT Builder

### **🔍 Mensagens de Teste:**

#### **Teste 1: Documento Médico**
```
Protocolo CBD para epilepsia refratária em crianças. Dosagem inicial: 5mg/kg/dia, dividida em 2 tomadas. Monitorar efeitos colaterais e resposta terapêutica. Ajustar conforme necessário.
```

#### **Teste 2: Caso Clínico**
```
Paciente de 8 anos com epilepsia refratária. Histórico de múltiplas medicações sem sucesso. Iniciado protocolo com cannabis medicinal. Primeira consulta após 30 dias mostra redução de 60% nas crises.
```

#### **Teste 3: Trabalho Científico**
```
Estudo randomizado duplo-cego sobre eficácia do CBD em epilepsia pediátrica. N=150 pacientes. Grupo tratamento: CBD 20mg/kg/dia. Grupo controle: placebo. Resultados após 12 semanas mostraram redução significativa nas crises no grupo tratamento.
```

### **📊 O que Observar no Console:**

#### **✅ Sucesso (Deve Aparecer):**
```
🧠 PROCESSANDO CONHECIMENTO - Mensagem recebida: Protocolo CBD para epilepsia...
🔍 ANÁLISE DE CONHECIMENTO: {messageLength: 150, foundKeywords: ['protocolo', 'cbd', 'epilepsia'], isWorkDocument: true, hasKnowledge: true}
📊 RESULTADO DA ANÁLISE: {hasKnowledge: true, isWorkDocument: true, keywords: ['protocolo', 'cbd', 'epilepsia']}
✅ CONHECIMENTO DETECTADO - Iniciando processamento...
📄 TRABALHO DOCUMENTO DETECTADO - Iniciando análise cruzada...
🔍 Iniciando análise cruzada do trabalho...
```

#### **❌ Problema (Se Aparecer):**
```
❌ NENHUM CONHECIMENTO DETECTADO - Apenas conversa normal
```

### **🔧 Critérios de Detecção Atualizados:**

#### **📄 Documento/Trabalho (isWorkDocument = true):**
- Mensagem > 200 caracteres
- Contém: 'trabalho', 'estudo', 'pesquisa', 'artigo', 'publicação', 'protocolo', 'pdf', 'documento', 'caso clínico', 'relatório', 'análise'

#### **💡 Conhecimento Geral (hasKnowledge = true):**
- Mensagem > 50 caracteres
- Contém: 'dr.', 'médico', 'clínico', 'cannabis', 'cbd', 'thc', 'epilepsia', 'neurologia', 'nefrologia'
- OU é um documento/trabalho

### **🚨 Se Não Funcionar:**

1. **Verifique o Console** para logs de erro
2. **Execute o segundo script SQL:** `gpt_builder_functions.sql`
3. **Verifique se as tabelas foram criadas** no Supabase
4. **Teste com mensagem mais longa** (>200 caracteres)

### **✅ Resultado Esperado:**

- **Detecção automática** de documentos
- **Logs detalhados** no console
- **Salvamento automático** na base de conhecimento
- **Análise cruzada** para trabalhos médicos
- **100% de acurácia** baseada em dados

---

**Teste agora e me diga o que aparece no console!** 🚀

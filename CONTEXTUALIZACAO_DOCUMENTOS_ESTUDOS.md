# 📚 CONTEXTUALIZAÇÃO COM DOCUMENTOS E ESTUDOS

## ✅ **SIM! SISTEMA USA BANCO DE CONHECIMENTO**

---

## 🎯 **3 NÍVEIS DE CONTEXTUALIZAÇÃO:**

### **1️⃣ APRENDIZADO DE CONVERSAS (ai_learning)**
```
✅ JÁ IMPLEMENTADO

- Salva cada conversa com embedding
- Busca semântica: "oi noa" ≈ "olá noa"
- Reutiliza respostas similares
- Aprende com o tempo

Tabela: ai_learning
Função: search_similar_embeddings()
```

### **2️⃣ DOCUMENTOS GPT BUILDER (gpt_documents)**
```
⚠️ PARCIALMENTE IMPLEMENTADO

Você tem:
✅ Tabela gpt_documents (documentos salvos)
✅ Tabela knowledge_items (conhecimento estruturado)
✅ knowledgeBaseAgent (agente de conhecimento)

Falta:
❌ Buscar documentos por embedding
❌ Incluir no contexto automaticamente
```

### **3️⃣ ESTUDOS CIENTÍFICOS (knowledge_base)**
```
⚠️ PRECISA ATIVAR

Você tem a estrutura, mas precisa:
❌ Vetorizar documentos
❌ Criar índice de busca
❌ Integrar com NoaVision IA
```

---

## 🔧 **COMO ATIVAR CONTEXTUALIZAÇÃO COMPLETA:**

### **SQL para vetorizar documentos:**

```sql
-- Adicionar embedding aos documentos
ALTER TABLE gpt_documents 
ADD COLUMN IF NOT EXISTS embedding VECTOR(384);

-- Criar índice para busca
CREATE INDEX IF NOT EXISTS idx_gpt_documents_embedding 
ON gpt_documents 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 50);

-- Função de busca em documentos
CREATE OR REPLACE FUNCTION search_documents_by_embedding(
  query_embedding VECTOR(384),
  match_count INT DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  filename TEXT,
  content TEXT,
  similarity FLOAT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    d.id,
    d.filename,
    d.content,
    1 - (d.embedding <=> query_embedding) AS similarity
  FROM gpt_documents d
  WHERE d.embedding IS NOT NULL
  ORDER BY d.embedding <=> query_embedding
  LIMIT match_count;
END;
$$ LANGUAGE plpgsql;

-- Adicionar embedding ao knowledge_items
ALTER TABLE knowledge_items 
ADD COLUMN IF NOT EXISTS embedding VECTOR(384);

-- Índice para knowledge
CREATE INDEX IF NOT EXISTS idx_knowledge_items_embedding 
ON knowledge_items 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 50);

-- Função de busca em conhecimento
CREATE OR REPLACE FUNCTION search_knowledge_by_embedding(
  query_embedding VECTOR(384),
  match_count INT DEFAULT 3
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  content TEXT,
  category TEXT,
  similarity FLOAT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    k.id,
    k.title,
    k.content,
    k.category,
    1 - (k.embedding <=> query_embedding) AS similarity
  FROM knowledge_items k
  WHERE k.embedding IS NOT NULL
  ORDER BY k.embedding <=> query_embedding
  LIMIT match_count;
END;
$$ LANGUAGE plpgsql;
```

---

## 💻 **CÓDIGO: Integrar documentos no contexto**

```typescript
// Em noaVisionIA.ts

/**
 * Busca documentos relevantes por embedding
 */
private async searchDocuments(embedding: number[]): Promise<any[]> {
  try {
    const { data, error } = await supabase.rpc('search_documents_by_embedding', {
      query_embedding: embedding,
      match_count: 3
    })
    
    if (error) {
      console.warn('⚠️ [NoaVision IA] Erro ao buscar documentos:', error)
      return []
    }
    
    return data || []
  } catch (error) {
    console.warn('⚠️ [NoaVision IA] Erro ao buscar documentos:', error)
    return []
  }
}

/**
 * Busca conhecimento relevante por embedding
 */
private async searchKnowledge(embedding: number[]): Promise<any[]> {
  try {
    const { data, error } = await supabase.rpc('search_knowledge_by_embedding', {
      query_embedding: embedding,
      match_count: 3
    })
    
    if (error) {
      console.warn('⚠️ [NoaVision IA] Erro ao buscar conhecimento:', error)
      return []
    }
    
    return data || []
  } catch (error) {
    console.warn('⚠️ [NoaVision IA] Erro ao buscar conhecimento:', error)
    return []
  }
}

/**
 * Enriquece contexto com documentos e conhecimento
 */
private async enrichContext(
  message: string,
  embedding: number[] | null,
  context: NoaContext
): Promise<string> {
  if (!embedding) return ''
  
  const contextParts: string[] = []
  
  // 1️⃣ Buscar documentos relevantes
  const docs = await this.searchDocuments(embedding)
  if (docs.length > 0) {
    contextParts.push('📄 **Documentos relevantes:**')
    docs.forEach((doc, i) => {
      contextParts.push(`${i + 1}. ${doc.filename} (${(doc.similarity * 100).toFixed(1)}% relevante)`)
      contextParts.push(`   ${doc.content.substring(0, 200)}...`)
    })
  }
  
  // 2️⃣ Buscar conhecimento relevante
  const knowledge = await this.searchKnowledge(embedding)
  if (knowledge.length > 0) {
    contextParts.push('\n🧠 **Base de conhecimento:**')
    knowledge.forEach((k, i) => {
      contextParts.push(`${i + 1}. ${k.title} [${k.category}]`)
      contextParts.push(`   ${k.content.substring(0, 200)}...`)
    })
  }
  
  return contextParts.length > 0 ? contextParts.join('\n') : ''
}
```

---

## 🚀 **MODIFICAR processMessage para usar contexto:**

```typescript
async processMessage(message: string, context: NoaContext) {
  // ... código existente ...
  
  // 4️⃣ VETORIZAR MENSAGEM
  const embedding = await this.getEmbedding(normalized)
  
  // 4.5️⃣ ENRIQUECER CONTEXTO COM DOCUMENTOS
  let enrichedContext = ''
  if (embedding) {
    enrichedContext = await this.enrichContext(message, embedding, context)
  }
  
  // 5️⃣ BUSCA SEMÂNTICA NO BANCO
  if (embedding) {
    const similarResponse = await this.semanticSearch(embedding, context)
    
    if (similarResponse && similarResponse.similarity >= 0.85) {
      // Adicionar contexto à resposta
      let response = similarResponse.ai_response
      
      if (enrichedContext) {
        response += '\n\n---\n' + enrichedContext
      }
      
      return {
        response,
        source: 'local',
        confidence: similarResponse.similarity,
        processingTime: Date.now() - startTime
      }
    }
  }
  
  // 6️⃣ FALLBACK OPENAI (COM CONTEXTO)
  if (enrichedContext) {
    // Adicionar contexto enriquecido ao prompt
    const contextualMessage = `${message}\n\n**Contexto disponível:**\n${enrichedContext}`
    const openaiResponse = await this.openAIFallback(contextualMessage, context)
    // ...
  }
}
```

---

## 📊 **COMO VAI FUNCIONAR:**

### **Exemplo 1: Pergunta sobre tratamento**
```
Usuário: "Qual dosagem de CBD para ansiedade?"

Sistema:
1. Gera embedding da pergunta
2. Busca em ai_learning (conversas passadas)
3. Busca em gpt_documents (estudos sobre CBD)
4. Busca em knowledge_items (protocolos de dosagem)
5. Monta contexto:
   📄 Estudo: "CBD para transtornos de ansiedade.pdf"
   🧠 Protocolo: "Dosagens iniciais: 20-40mg/dia"
6. Envia para OpenAI COM contexto
7. Resposta fundamentada em estudos!
```

### **Exemplo 2: Avaliação clínica**
```
Usuário: "fazer avaliação clínica"

Sistema:
1. Detecta intent "avaliação"
2. Busca documentos relevantes:
   - "Protocolo IMRE completo.pdf"
   - "Roteiro clínico cannabis.docx"
3. Usa informações dos documentos
4. Personaliza perguntas
5. Relatório final com referências!
```

---

## ⚡ **VETORIZAR DOCUMENTOS EXISTENTES:**

```typescript
// Script para vetorizar documentos (executar uma vez)

async function vectorizeExistingDocuments() {
  const { data: docs } = await supabase
    .from('gpt_documents')
    .select('*')
    .is('embedding', null)
  
  for (const doc of docs) {
    // Gerar embedding
    const embedding = await noaVisionIA.getEmbedding(doc.content)
    
    // Salvar
    await supabase
      .from('gpt_documents')
      .update({ embedding })
      .eq('id', doc.id)
    
    console.log(`✅ Vetorizado: ${doc.filename}`)
  }
  
  console.log(`🎉 ${docs.length} documentos vetorizados!`)
}

// Executar
vectorizeExistingDocuments()
```

---

## ✅ **RESULTADO FINAL:**

```
Sem contextualização:
Usuário: "CBD para insônia?"
Nôa: "CBD pode ajudar..." (genérico)

Com contextualização:
Usuário: "CBD para insônia?"
Nôa: "Segundo o estudo 'Canabinoides e sono' 
(2023) do seu banco de conhecimento, doses 
de 40-160mg de CBD mostraram melhorar qualidade 
do sono em 70% dos pacientes.

O protocolo recomendado é:
- Semana 1: 20mg antes de dormir
- Semana 2-3: 40mg
- Ajustar conforme resposta

Referência: [Documento XYZ.pdf]"
```

---

## 🎯 **PRIORIDADE:**

```
1️⃣ ALTA: Vetorizar documentos existentes
2️⃣ ALTA: Integrar busca no processMessage
3️⃣ MÉDIA: Melhorar ranking de relevância
4️⃣ BAIXA: UI para gerenciar documentos
```

---

**Quer que eu implemente a vetorização de documentos agora?** 🚀


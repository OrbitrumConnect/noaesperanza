# 🗺️ MAPA COMPLETO - AVALIAÇÃO CLÍNICA INICIAL NO CÓDIGO

## 📍 **ONDE ESTÁ A AVALIAÇÃO CLÍNICA:**

```
┌─────────────────────────────────────────────────────────────┐
│                    ESTRUTURA COMPLETA                        │
└─────────────────────────────────────────────────────────────┘

📁 src/pages/Home.tsx (LINHA 58-283)
   └─ 🎯 ETAPAS_AVALIACAO [17 etapas]
      ├─ abertura
      ├─ cannabis_medicinal
      ├─ lista_indiciaria
      ├─ queixa_principal
      ├─ desenvolvimento_localizacao
      ├─ desenvolvimento_inicio
      ├─ desenvolvimento_qualidade
      ├─ desenvolvimento_sintomas
      ├─ desenvolvimento_melhora
      ├─ desenvolvimento_piora
      ├─ historia_patologica
      ├─ historia_familiar_mae
      ├─ historia_familiar_pai
      ├─ habitos_vida
      ├─ alergias
      ├─ medicacoes_continuas
      ├─ medicacoes_eventuais
      └─ fechamento

📁 src/services/clinicalAssessmentService.ts
   └─ 🏭 ClinicalAssessmentService (CLASSE PRINCIPAL)
      ├─ startAssessment() → Inicia avaliação
      ├─ getNextQuestion() → Próxima pergunta
      ├─ recordResponse() → Salva resposta
      ├─ advanceStage() → Avança etapa
      ├─ generateFinalReport() → Gera relatório
      └─ completeAssessment() → Finaliza + NFT

📁 src/services/noaSystemService.ts
   └─ 🔌 Integração com banco de dados
      ├─ getImreBlock() → Busca bloco IMRE no Supabase
      └─ registerConversationFlow() → Salva fluxo

📊 BANCO DE DADOS (Supabase)
   ├─ imre_blocks (28 blocos IMRE)
   ├─ avaliacoes_iniciais (registros)
   ├─ conversa_imre (histórico)
   └─ sessoes_em_andamento (retomada)
```

---

## 🎯 **1. DEFINIÇÃO DAS ETAPAS (Home.tsx)**

**Arquivo:** `src/pages/Home.tsx`
**Linhas:** 92-283

```typescript
// 📋 ETAPAS DA AVALIAÇÃO CLÍNICA TRIAXIAL
const ETAPAS_AVALIACAO = [
  {
    id: 'abertura',
    title: 'Abertura Exponencial',
    pergunta: 'Olá! Eu sou Nôa Esperanza, assistente médica do MedCanLab. Por favor, apresente-se também...',
    opcoes: [
      'Olá, sou [seu nome], tenho [idade] anos',
      'Meu nome é [nome], sou [profissão]',
      'Sou [nome], venho de [cidade]',
    ],
  },
  {
    id: 'cannabis_medicinal',
    title: 'Cannabis Medicinal',
    pergunta: 'Você já utilizou canabis medicinal?',
    opcoes: [
      'Sim, já utilizei',
      'Não, nunca utilizei',
      'Estou considerando usar',
      'Não sei o que é',
      'Prefiro não responder',
    ],
  },
  {
    id: 'lista_indiciaria',
    title: 'Lista Indiciária',
    pergunta: 'O que trouxe você à nossa avaliação hoje?',
    opcoes: [
      'Dor de cabeça',
      'Dor no peito',
      'Falta de ar',
      'Dor abdominal',
      'Cansaço',
      'Outro sintoma',
    ],
  },
  // ... mais 14 etapas
]
```

**Total:** 17 etapas fixas no código

---

## 🏭 **2. SERVIÇO PRINCIPAL (clinicalAssessmentService.ts)**

**Arquivo:** `src/services/clinicalAssessmentService.ts`
**Linhas:** 1-396

### **Classe Principal:**

```typescript
export class ClinicalAssessmentService {
  private currentAssessment: ClinicalAssessmentData | null = null
  private assessmentResponses: AssessmentResponse[] = []

  // ✅ INICIA AVALIAÇÃO
  startAssessment(userId: string): ClinicalAssessmentData {
    this.currentAssessment = {
      id: `assessment_${Date.now()}`,
      userId,
      timestamp: new Date(),
      stage: 'identification',
      responses: [],
      status: 'in_progress'
    }
    return this.currentAssessment
  }

  // ✅ PRÓXIMA PERGUNTA
  getNextQuestion(): string {
    const stage = this.currentAssessment.stage
    
    switch (stage) {
      case 'identification':
        return "Olá! Eu sou Nôa Esperanza..."
      
      case 'complaints_list':
        return "O que trouxe você à nossa avaliação hoje?"
      
      case 'main_complaint':
        return "De todas essas questões, qual mais o(a) incomoda?"
      
      // ... outras etapas
    }
  }

  // ✅ SALVA RESPOSTA
  recordResponse(question: string, answer: string, category: string): void {
    this.assessmentResponses.push({
      question,
      answer,
      timestamp: new Date(),
      category
    })
  }

  // ✅ GERA RELATÓRIO FINAL
  private generateFinalReport(): string {
    const narrative = [
      `Relatório de ${patientName}`,
      `Queixa principal: ${mainComplaint}`,
      `História: ${history.join('; ')}`,
      // ... monta relatório completo
    ].join('\n\n')
    
    return narrative
  }

  // ✅ FINALIZA + GERA NFT
  async completeAssessment(): Promise<{ report: ClinicalReport; nftHash: string }> {
    const nftHash = `nft_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // Salva no Supabase
    await supabase.from('avaliacoes_iniciais').upsert({
      id: this.currentAssessment.id,
      user_id: this.currentAssessment.userId,
      status: 'completed',
      dados: JSON.stringify(this.currentAssessment.finalReport),
      nft_hash: nftHash
    })
    
    return { report: this.currentAssessment.finalReport, nftHash }
  }
}

// 🌍 INSTÂNCIA GLOBAL
export const clinicalAssessmentService = new ClinicalAssessmentService()
```

---

## 🔌 **3. INTEGRAÇÃO COM BANCO (noaSystemService.ts)**

**Arquivo:** `src/services/noaSystemService.ts`

```typescript
export class NoaSystemService {
  // ✅ BUSCA BLOCO IMRE NO SUPABASE
  async getImreBlock(blockNumber: number) {
    const { data, error } = await supabase
      .rpc('get_imre_block', { block_number: blockNumber })
    
    if (error || !data || data.length === 0) {
      return null
    }
    
    return {
      id: data[0].id,
      block_order: data[0].block_order,
      block_name: data[0].block_name,
      block_description: data[0].block_description,
      block_prompt: data[0].block_prompt,
      block_type: data[0].block_type,
      is_active: data[0].is_active
    }
  }

  // ✅ REGISTRA CONVERSA
  async registerConversationFlow(
    sessionId: string,
    eventType: string,
    eventData: any,
    currentBlock?: number
  ) {
    await supabase.from('conversa_imre').insert({
      session_id: sessionId,
      event_type: eventType,
      event_data: eventData,
      current_block: currentBlock,
      timestamp: new Date().toISOString()
    })
  }
}
```

---

## 🎬 **4. FLUXO COMPLETO (Home.tsx)**

**Arquivo:** `src/pages/Home.tsx`
**Linhas:** 1670-1850

```typescript
// ✅ PROCESSA RESPOSTA DA AVALIAÇÃO
const processarRespostaAvaliacao = async (resposta: string) => {
  const etapa = ETAPAS_AVALIACAO[etapaAtual]
  
  // 1️⃣ Detecta respostas negativas
  const respostaNegativa = resposta.toLowerCase().includes('não') || 
                          resposta.toLowerCase().includes('nada')
  
  // 2️⃣ Salva resposta na etapa atual
  if (etapa.id === 'lista_indiciaria') {
    setDadosAvaliacao(prev => ({ 
      ...prev, 
      lista_indiciaria: [...prev.lista_indiciaria, resposta] 
    }))
  }
  
  // 3️⃣ Detecta se usuário terminou
  const usuarioTerminou = respostaNegativa || 
                         contadorOqMais >= 2 || 
                         resposta.includes('pronto') ||
                         resposta.includes('terminei')
  
  // 4️⃣ Avança para próxima etapa
  if (etapaAtual < ETAPAS_AVALIACAO.length - 1) {
    setEtapaAtual(prev => prev + 1)
    setContadorOqMais(0) // Reset
  } else {
    // 5️⃣ Finaliza avaliação
    await finalizarAvaliacao()
  }
}

// ✅ FINALIZA AVALIAÇÃO
const finalizarAvaliacao = async () => {
  // Gera relatório
  const relatorio = gerarRelatorioNarrativo()
  
  // Salva no banco
  await saveEvaluationToSupabase(true)
  
  // Mostra resultado
  const msgFinal: Message = {
    id: crypto.randomUUID(),
    message: `✅ **AVALIAÇÃO CONCLUÍDA!**\n\n${relatorio}`,
    sender: 'noa',
    timestamp: new Date(),
  }
  
  setMessages(prev => [...prev, msgFinal])
  setModoAvaliacao(false)
}
```

---

## 📊 **5. BANCO DE DADOS (Supabase)**

### **Tabelas Principais:**

```sql
-- ✅ BLOCOS IMRE (28 blocos configuráveis)
CREATE TABLE imre_blocks (
  id UUID PRIMARY KEY,
  block_order INTEGER UNIQUE,
  block_name TEXT,
  block_description TEXT,
  block_prompt TEXT,
  block_type TEXT DEFAULT 'pergunta',
  is_active BOOLEAN DEFAULT true
);

-- ✅ AVALIAÇÕES INICIAIS (registros)
CREATE TABLE avaliacoes_iniciais (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  session_id TEXT UNIQUE,
  status TEXT, -- 'in_progress' | 'completed'
  etapa_atual TEXT,
  dados JSONB,
  nft_hash TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);

-- ✅ CONVERSA IMRE (histórico detalhado)
CREATE TABLE conversa_imre (
  id UUID PRIMARY KEY,
  session_id TEXT,
  event_type TEXT,
  event_data JSONB,
  current_block INTEGER,
  timestamp TIMESTAMPTZ
);

-- ✅ SESSÕES EM ANDAMENTO (retomada)
CREATE TABLE sessoes_em_andamento (
  id UUID PRIMARY KEY,
  session_id TEXT UNIQUE,
  user_id UUID,
  etapa_atual INTEGER DEFAULT 0,
  total_blocos INTEGER DEFAULT 28,
  respostas JSONB,
  status TEXT, -- 'em_andamento' | 'concluida'
  atualizado_em TIMESTAMPTZ
);
```

---

## 🚀 **6. COMO FUNCIONA (FLUXO COMPLETO)**

```
┌──────────────────────────────────────────────────────┐
│  USUÁRIO clica "🩺 Avaliação Clínica Inicial"       │
└─────────────────┬────────────────────────────────────┘
                  │
                  ▼
┌──────────────────────────────────────────────────────┐
│  Home.tsx detecta trigger:                           │
│  - "avaliação"                                       │
│  - "avaliacao"                                       │
│  - "consulta inicial"                                │
│  - "fazer avaliação"                                 │
└─────────────────┬────────────────────────────────────┘
                  │
                  ▼
┌──────────────────────────────────────────────────────┐
│  setModoAvaliacao(true)                              │
│  setEtapaAtual(0)                                    │
│  setConversationType('clinical_evaluation')          │
└─────────────────┬────────────────────────────────────┘
                  │
                  ▼
┌──────────────────────────────────────────────────────┐
│  Busca primeira pergunta:                            │
│  const blocoAtual = await noaSystemService           │
│    .getImreBlock(etapaAtual + 1)                     │
│                                                      │
│  SE não encontrar no Supabase:                       │
│    Usa ETAPAS_AVALIACAO[etapaAtual] (fallback)      │
└─────────────────┬────────────────────────────────────┘
                  │
                  ▼
┌──────────────────────────────────────────────────────┐
│  Nôa pergunta:                                       │
│  "Olá! Eu sou Nôa Esperanza. Por favor,             │
│   apresente-se também..."                            │
└─────────────────┬────────────────────────────────────┘
                  │
                  ▼
┌──────────────────────────────────────────────────────┐
│  USUÁRIO responde: "João, 35 anos"                  │
└─────────────────┬────────────────────────────────────┘
                  │
                  ▼
┌──────────────────────────────────────────────────────┐
│  processarRespostaAvaliacao('João, 35 anos')        │
│                                                      │
│  1. Salva resposta:                                  │
│     setDadosAvaliacao({ apresentacao: 'João...' })  │
│                                                      │
│  2. Salva no Supabase:                               │
│     await saveEvaluationToSupabase(false)            │
│                                                      │
│  3. Avança etapa:                                    │
│     setEtapaAtual(1)                                 │
└─────────────────┬────────────────────────────────────┘
                  │
                  ▼
┌──────────────────────────────────────────────────────┐
│  Repete para 17 etapas (ou 28 blocos IMRE)          │
│                                                      │
│  Etapas principais:                                  │
│  1. Abertura                                         │
│  2. Cannabis Medicinal                               │
│  3. Lista Indiciária → "O que mais?" (máx 2x)       │
│  4. Queixa Principal                                 │
│  5-10. Desenvolvimento da Queixa                     │
│  11. História Patológica → "O que mais?" (máx 2x)   │
│  12-13. História Familiar                            │
│  14. Hábitos de Vida → "O que mais?" (máx 2x)       │
│  15. Alergias                                        │
│  16. Medicações Contínuas                            │
│  17. Medicações Eventuais                            │
│  18. Fechamento                                      │
└─────────────────┬────────────────────────────────────┘
                  │
                  ▼
┌──────────────────────────────────────────────────────┐
│  Última etapa alcançada:                             │
│  finalizarAvaliacao()                                │
│                                                      │
│  1. Gera relatório narrativo:                        │
│     const relatorio = gerarRelatorioNarrativo()      │
│                                                      │
│  2. Salva final no Supabase:                         │
│     await saveEvaluationToSupabase(true)             │
│     UPDATE status = 'completed'                      │
│                                                      │
│  3. Gera NFT (hash blockchain):                      │
│     nft_hash = `nft_${Date.now()}_...`               │
│                                                      │
│  4. Mostra relatório ao usuário                      │
│                                                      │
│  5. Atualiza dashboard do paciente                   │
└──────────────────────────────────────────────────────┘
```

---

## 🎯 **RESUMO VISUAL:**

```
📂 ARQUIVOS PRINCIPAIS:

src/pages/Home.tsx
├─ ETAPAS_AVALIACAO (linhas 92-283)
├─ processarRespostaAvaliacao (linhas 1670-1850)
├─ finalizarAvaliacao (linhas 1920-2050)
└─ Controle de fluxo (modoAvaliacao, etapaAtual)

src/services/clinicalAssessmentService.ts
├─ ClinicalAssessmentService (classe completa)
├─ startAssessment()
├─ getNextQuestion()
├─ recordResponse()
├─ generateFinalReport()
└─ completeAssessment()

src/services/noaSystemService.ts
├─ getImreBlock() → Busca no Supabase
└─ registerConversationFlow() → Salva histórico

📊 BANCO DE DADOS (Supabase):
├─ imre_blocks
├─ avaliacoes_iniciais
├─ conversa_imre
└─ sessoes_em_andamento
```

---

**TODA A AVALIAÇÃO CLÍNICA ESTÁ AQUI! 🎉**

**Quer que eu mostre alguma parte específica em detalhe?** 📖


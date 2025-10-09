# 🚀 TRANSFORMAÇÃO: NoaGPT → NoaVision IA
## Sistema Inteligente Modular com Embeddings Locais

*Plano Mestre Completo de Implementação*

---

## 🎯 **RESPOSTA DIRETA: É POSSÍVEL? SIM! 100% VIÁVEL!**

```
✅ BENEFÍCIOS DA TRANSFORMAÇÃO:

1. APRENDIZADO CONTÍNUO no banco atual (poucas modificações SQL)
2. EMBEDDINGS LOCAIS (MiniLM-L6-v2) para busca semântica
3. ENTENDE todo o app (dashboards, abas, perfis, especialidades)
4. PERSONALIZAÇÃO por perfil (Paciente, Médico, Profissional, Admin)
5. INTEGRA avaliação clínica inicial naturalmente
6. REDUZ dependência de OpenAI (custo menor)
7. PRIVACIDADE dos dados (processa localmente)
8. MAIS RÁPIDO (80% das respostas locais)
```

---

## 📊 **MAPA COMPLETO DO APP (Como está hoje)**

### **ESTRUTURA DE ROTAS:**

```
┌──────────────────────────────────────────────────────┐
│              ROTAS DO APP (26 ROTAS)                 │
├──────────────────────────────────────────────────────┤
│                                                      │
│ 🌐 PÚBLICAS (3):                                     │
│   • / ........................ LandingPage          │
│   • /login ................... LoginPage            │
│   • /register ................ RegisterPage         │
│                                                      │
│ 🏠 HOME (3):                                         │
│   • /home .................... Chat Principal       │
│   • /home-old ................ Chat Backup          │
│   • /chat .................... Layout ChatGPT       │
│                                                      │
│ 🎛️ DASHBOARDS (4):                                  │
│   • /app/paciente ............ Dashboard Paciente   │
│   • /app/medico .............. Dashboard Médico     │
│   • /app/profissional ........ Dashboard Profissional│
│   • /app/admin ............... Dashboard Admin      │
│                                                      │
│ 📋 PACIENTE (6):                                     │
│   • /app/exames .............. Meus Exames          │
│   • /app/prescricoes ......... Prescrições          │
│   • /app/prontuario .......... Prontuário           │
│   • /app/pagamentos-paciente . Pagamentos           │
│   • /app/avaliacao-inicial ... Avaliação Clínica    │
│   • /app/triagem ............. Triagem Clínica      │
│                                                      │
│ 🎓 EDUCAÇÃO/PESQUISA (3):                            │
│   • /app/ensino .............. Ensino               │
│   • /app/pesquisa ............ Pesquisa             │
│   • /app/medcann-lab ......... MedCann Lab          │
│                                                      │
│ ⚙️ SISTEMA (7):                                      │
│   • /app/relatorio ........... Relatório Narrativo  │
│   • /app/config .............. Configurações        │
│   • /app/perfil .............. Perfil do Usuário    │
│   • /app/payment ............. Pagamento            │
│   • /app/checkout ............ Checkout             │
│   • /app/ide ................. IDE Integrado        │
│   • /app/* ................... NotFound             │
│                                                      │
└──────────────────────────────────────────────────────┘
```

### **ESPECIALIDADES (3):**

```
1. 🫘 NEFROLOGIA (rim)
   • Cuidado Renal
   • Hipertensão
   • Insuficiência Renal

2. 🧠 NEUROLOGIA (neuro)
   • Dor Neuropática
   • Epilepsia
   • Esclerose Múltipla

3. 🌿 CANNABIS MEDICINAL (cannabis)
   • CBD/THC Terapêutico
   • Titulação de Dose
   • Cannabis + Nefrologia
```

### **PERFIS DE USUÁRIO (5):**

```
👤 PACIENTE:
   • Chat com Nôa
   • Avaliação Clínica
   • Ver Relatórios
   • Acompanhamento
   • Exames e Prescrições

👨‍⚕️ MÉDICO (Prescritor):
   • Gerenciar Pacientes
   • Criar Prescrições
   • Solicitar Exames
   • Ver Prontuários
   • Agenda de Consultas

👨‍💼 PROFISSIONAL:
   • Cursos e Educação
   • Material Didático
   • Pesquisas Científicas
   • Certificações

🔧 ADMIN:
   • GPT Builder
   • Base de Conhecimento
   • Desenvolvimento Colaborativo
   • Métricas do Sistema
   • Gerenciar Usuários

👨‍🔬 PESQUISADOR:
   • MedCann Lab
   • Estudos Científicos
   • Análise de Dados
   • Publicações
```

---

## 🧠 **NOAVISION IA - ARQUITETURA COMPLETA**

```
┌─────────────────────────────────────────────────────────────────┐
│                    NOAVISION IA CORE                            │
│                 (Substitui NoaGPT atual)                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  USUÁRIO envia mensagem                                         │
│      ↓                                                          │
│  ┌───────────────────────────────────────────────────────┐     │
│  │  1️⃣ CONTEXTO ANALYZER                                 │     │
│  │  • Detecta perfil do usuário                          │     │
│  │  • Identifica dashboard atual                         │     │
│  │  • Extrai especialidade ativa                         │     │
│  │  • Carrega histórico e memória                        │     │
│  └───────────────────────────────────────────────────────┘     │
│      ↓                                                          │
│  ┌───────────────────────────────────────────────────────┐     │
│  │  2️⃣ MESSAGE NORMALIZER                               │     │
│  │  • Lowercase                                          │     │
│  │  • Remove acentos (NFD)                               │     │
│  │  • Tokenização                                        │     │
│  │  • Extrai keywords                                    │     │
│  └───────────────────────────────────────────────────────┘     │
│      ↓                                                          │
│  ┌───────────────────────────────────────────────────────┐     │
│  │  3️⃣ EMBEDDINGS LOCAL (MiniLM-L6-v2)                  │     │
│  │  • Vetoriza mensagem (384 dimensões)                 │     │
│  │  • Cache de embeddings                                │     │
│  │  • Processamento em 50-100ms                          │     │
│  └───────────────────────────────────────────────────────┘     │
│      ↓                                                          │
│  ┌───────────────────────────────────────────────────────┐     │
│  │  4️⃣ SEMANTIC SEARCH (Busca no Banco)                 │     │
│  │  • Busca por similaridade de cosseno                 │     │
│  │  • Threshold: 85% (configurável)                     │     │
│  │  • Filtra por perfil + especialidade                 │     │
│  │  • Retorna top 3 matches                             │     │
│  └───────────────────────────────────────────────────────┘     │
│      ↓                                                          │
│  ┌───────────────────────────────────────────────────────┐     │
│  │  5️⃣ INTELLIGENT ROUTER                               │     │
│  │                                                       │     │
│  │  SE encontrou no banco (≥85%):                        │     │
│  │    → Retorna resposta local ⚡                        │     │
│  │                                                       │     │
│  │  SE comando específico detectado:                     │     │
│  │    → Roteia para agente apropriado 🤖                │     │
│  │                                                       │     │
│  │  SE nenhum dos acima:                                 │     │
│  │    → Envia para OpenAI (fallback) ☁️                 │     │
│  └───────────────────────────────────────────────────────┘     │
│      ↓                                                          │
│  ┌───────────────────────────────────────────────────────┐     │
│  │  6️⃣ AGENTES ESPECIALIZADOS                           │     │
│  │  • ClinicalAgent (avaliação, triagem)                │     │
│  │  • DashboardAgent (navegação, info)                  │     │
│  │  • KnowledgeAgent (documentos, base)                 │     │
│  │  • PrescriptionAgent (prescrever - médicos)          │     │
│  │  • EducationAgent (cursos, material)                 │     │
│  │  • VoiceAgent (controle por voz)                     │     │
│  │  • SymbolicAgent (eixo simbólico)                    │     │
│  │  • CodeAgent (desenvolvimento - admin)               │     │
│  └───────────────────────────────────────────────────────┘     │
│      ↓                                                          │
│  ┌───────────────────────────────────────────────────────┐     │
│  │  7️⃣ RESPONSE GENERATOR                               │     │
│  │  • Formata resposta para perfil                      │     │
│  │  • Adiciona contexto relevante                       │     │
│  │  • Sugere próximos passos                            │     │
│  │  • Links para dashboards/abas                        │     │
│  └───────────────────────────────────────────────────────┘     │
│      ↓                                                          │
│  ┌───────────────────────────────────────────────────────┐     │
│  │  8️⃣ LEARNING SYSTEM                                  │     │
│  │  • Salva embedding no banco                          │     │
│  │  • Atualiza score de confiança                       │     │
│  │  • Incrementa usage_count                            │     │
│  │  • Extrai novos padrões                              │     │
│  └───────────────────────────────────────────────────────┘     │
│      ↓                                                          │
│  RESPOSTA PERSONALIZADA para o usuário                         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 💾 **MODIFICAÇÕES NO BANCO DE DADOS**

### **Tabelas Atuais (mantém):**

```sql
✅ JÁ TEMOS (manter como estão):
   • ai_learning             (366+ registros)
   • ai_keywords             (16 registros)
   • ai_conversation_patterns
   • avaliacoes_iniciais
   • clinical_sessions
   • users, profiles, auth.users
```

### **Modificações Necessárias (pequenas):**

```sql
-- 1️⃣ ADICIONAR COLUNA DE EMBEDDINGS
ALTER TABLE ai_learning 
ADD COLUMN embedding VECTOR(384); -- Supabase pgvector

-- 2️⃣ CRIAR ÍNDICE PARA BUSCA RÁPIDA
CREATE INDEX ai_learning_embedding_idx 
ON ai_learning 
USING ivfflat (embedding vector_cosine_ops);

-- 3️⃣ ADICIONAR COLUNAS DE CONTEXTO
ALTER TABLE ai_learning 
ADD COLUMN user_profile VARCHAR(50), -- paciente, medico, profissional, admin
ADD COLUMN specialty VARCHAR(50),    -- rim, neuro, cannabis
ADD COLUMN dashboard VARCHAR(100),   -- /app/paciente, /app/medico, etc
ADD COLUMN source VARCHAR(50);       -- local, openai, agent

-- 4️⃣ CRIAR TABELA DE CACHE DE EMBEDDINGS
CREATE TABLE embedding_cache (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  text_hash VARCHAR(64) UNIQUE NOT NULL, -- SHA-256 do texto
  embedding VECTOR(384) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  hits INTEGER DEFAULT 0
);

-- 5️⃣ CRIAR FUNÇÃO DE BUSCA SEMÂNTICA
CREATE OR REPLACE FUNCTION search_similar_embeddings(
  query_embedding VECTOR(384),
  user_profile VARCHAR(50),
  specialty VARCHAR(50),
  similarity_threshold FLOAT DEFAULT 0.85,
  match_count INT DEFAULT 3
)
RETURNS TABLE (
  id UUID,
  user_message TEXT,
  ai_response TEXT,
  similarity FLOAT,
  usage_count INTEGER,
  confidence_score FLOAT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    al.id,
    al.user_message,
    al.ai_response,
    1 - (al.embedding <=> query_embedding) AS similarity,
    al.usage_count,
    al.confidence_score
  FROM ai_learning al
  WHERE 
    al.embedding IS NOT NULL
    AND (al.user_profile = user_profile OR al.user_profile IS NULL)
    AND (al.specialty = specialty OR al.specialty IS NULL)
    AND (1 - (al.embedding <=> query_embedding)) >= similarity_threshold
  ORDER BY al.embedding <=> query_embedding
  LIMIT match_count;
END;
$$ LANGUAGE plpgsql;
```

**RESUMO DAS MODIFICAÇÕES:**
```
✅ 1 coluna nova (embedding)
✅ 3 colunas de contexto
✅ 1 tabela nova (cache)
✅ 1 função SQL (busca)
✅ 1 índice (performance)

TOTAL: ~30 minutos para implementar no Supabase
```

---

## 📄 **DOCUMENTO MESTRE PARA NOAVISION IA**

```yaml
---
DOCUMENTO MESTRE: NOA VISION IA
Versão: 1.0
Data: 09/10/2025
---

# SISTEMA NOA VISION IA

## IDENTIDADE
Nome: Nôa Esperanza
Função: Assistente Médica Inteligente Modular
Médico Responsável: Dr. Ricardo Valença
Especialidades: Neurologia, Cannabis Medicinal, Nefrologia

## ARQUITETURA
Tipo: Sistema Híbrido Local + Cloud
Processamento: 80% local, 20% OpenAI (fallback)
Embeddings: MiniLM-L6-v2 (384 dimensões)
Banco de Dados: Supabase PostgreSQL + pgvector

## ESTRUTURA DO APP

### ROTAS (26 total)
1. Públicas (3): /, /login, /register
2. Home (3): /home, /home-old, /chat
3. Dashboards (4): /app/paciente, /app/medico, /app/profissional, /app/admin
4. Paciente (6): /app/exames, /app/prescricoes, /app/prontuario, etc
5. Educação (3): /app/ensino, /app/pesquisa, /app/medcann-lab
6. Sistema (7): /app/relatorio, /app/config, /app/perfil, etc

### ESPECIALIDADES (3)
1. Nefrologia (rim)
   - Cuidado Renal
   - Hipertensão
   - Insuficiência Renal

2. Neurologia (neuro)
   - Dor Neuropática
   - Epilepsia
   - Cannabis + Neurologia

3. Cannabis Medicinal (cannabis)
   - CBD/THC Terapêutico
   - Titulação de Dose
   - Compliance RDC 660/327

### PERFIS DE USUÁRIO (5)
1. PACIENTE
   - Chat com Nôa
   - Avaliação Clínica Inicial (28 blocos IMRE)
   - Ver Relatórios e NFT
   - Exames e Prescrições
   - Acompanhamento

2. MÉDICO (Prescritor)
   - Gerenciar Pacientes
   - Criar Prescrições REUNI
   - Solicitar Exames
   - Ver Prontuários Compartilhados
   - Agenda de Consultas
   - Compliance RDC 660/327

3. PROFISSIONAL
   - Cursos e Material Didático
   - Pesquisas Científicas
   - Certificações
   - Base de Conhecimento

4. ADMIN
   - GPT Builder
   - Desenvolvimento Colaborativo
   - Métricas do Sistema
   - Gerenciar Usuários e Permissões
   - IDE Integrado

5. PESQUISADOR
   - MedCann Lab
   - Estudos Científicos
   - Análise de Dados
   - Publicações

## DASHBOARDS E ABAS

### Dashboard Paciente (/app/paciente)
ABAS:
1. Perfil: Informações do paciente, programa de cuidado
2. Chat: Conversa com Nôa, avaliação clínica
3. Relatórios: Visualizar relatórios, NFT hash, download

SIDEBAR:
- Chat com Nôa
- Dúvidas Médicas
- Avaliação Clínica
- Acompanhamento
- Ver Relatórios
- Meu Perfil

SERVIÇOS DISPONÍVEIS:
- Fazer avaliação clínica inicial
- Ver histórico de consultas
- Baixar relatórios
- Compartilhar dados com médico
- Agendar consulta
- Ver prescrições ativas
- Upload de exames

### Dashboard Médico (/app/medico)
SIDEBAR:
- Prescrições
- Exames
- Prontuários
- Relatórios
- Agenda
- Pacientes

ÁREA PRINCIPAL:
- Métricas por especialidade
- Lista de pacientes recentes
- Ações rápidas
- Estatísticas

SERVIÇOS DISPONÍVEIS:
- Ver pacientes compartilhados
- Criar prescrições REUNI
- Solicitar exames
- Fazer anotações em prontuário
- Agendar consultas
- Ver relatórios compartilhados
- Validar compliance RDC 660/327

### Dashboard Profissional (/app/profissional)
SERVIÇOS:
- Acessar cursos
- Material educacional
- Pesquisas científicas
- Certificações

### Dashboard Admin (/app/admin)
SERVIÇOS:
- GPT Builder
- Base de Conhecimento
- Desenvolvimento Colaborativo
- Métricas do Sistema
- Gerenciar Usuários

## AVALIAÇÃO CLÍNICA INICIAL

### Método: IMRE (28 Blocos)
1. Abertura Exponencial
2. Apresentação
3. Lista Indiciária
4. Queixa Principal
5. Desenvolvimento Indiciário
6-28. Blocos específicos por especialidade

### Fluxo:
1. Paciente solicita avaliação
2. NoaVision IA detecta intenção
3. Roteia para ClinicalAgent
4. Inicia fluxo de 28 blocos
5. Salva respostas no banco
6. Gera relatório narrativo
7. Cria NFT hash (blockchain)
8. Disponibiliza no dashboard
9. Opção de compartilhar com médico

### Integração:
- Pode ser iniciado de qualquer dashboard
- Resposta é adaptada ao perfil do usuário
- Paciente: "Vamos iniciar sua avaliação..."
- Médico: "Posso guiá-lo pela avaliação do paciente..."
- Admin: "Demonstração do fluxo de avaliação..."

## PERSONALIZAÇÃO POR PERFIL

### PACIENTE recebe:
- Tom acolhedor e empático
- Linguagem simples e clara
- Foco em cuidado e acompanhamento
- Links para: Chat, Relatórios, Exames

### MÉDICO recebe:
- Tom profissional e técnico
- Terminologia médica apropriada
- Foco em gestão de pacientes
- Links para: Pacientes, Prescrições, Prontuários

### PROFISSIONAL recebe:
- Tom colaborativo e educacional
- Conteúdo didático
- Foco em aprendizado
- Links para: Cursos, Pesquisas, Material

### ADMIN recebe:
- Tom estratégico e técnico
- Informações de sistema
- Foco em orquestração
- Links para: GPT Builder, Métricas, IDE

## COMPLIANCE LEGAL

### RDC 660/2022 (Anvisa)
- Produtos de cannabis para uso medicinal
- Critérios para importação e comercialização
- Prescrição médica obrigatória
- Controle de concentração THC/CBD

### RDC 327/2019 (Anvisa)
- Registro de produtos REUNI
- Documentação obrigatória
- Rastreabilidade da cadeia

### Validação NoaVision IA:
- Verifica se prescritor tem autorização
- Valida concentração de THC/CBD
- Registra em tabela prescriptions
- Gera rastro de auditoria

## AGENTES ESPECIALIZADOS

1. ClinicalAgent: Avaliação clínica IMRE
2. DashboardAgent: Navegação e informações de dashboard
3. KnowledgeAgent: Base de conhecimento e documentos
4. PrescriptionAgent: Prescrições REUNI (médicos)
5. EducationAgent: Cursos e material educacional
6. VoiceAgent: Controle por voz
7. SymbolicAgent: Eixo simbólico cultural
8. CodeAgent: Desenvolvimento colaborativo (admin)

## BUSCA SEMÂNTICA

### Como funciona:
1. Mensagem do usuário é vetorizada (MiniLM-L6-v2)
2. Busca por similaridade de cosseno no banco
3. Filtra por perfil + especialidade + dashboard
4. Retorna top 3 matches (≥85% similaridade)
5. Se encontrar: usa resposta local
6. Se não: fallback para OpenAI

### Threshold de confiança:
- ≥90%: Alta confiança (usa sem dúvida)
- 85-89%: Média confiança (usa com validação)
- <85%: Baixa confiança (OpenAI fallback)

## APRENDIZADO CONTÍNUO

### Cada interação:
1. Vetoriza e salva embedding
2. Registra contexto (perfil, especialidade, dashboard)
3. Atualiza score de confiança
4. Incrementa usage_count
5. Extrai novos padrões
6. Melhora para próxima vez

### Evolução esperada:
- 1 semana: 500 interações → 60% respostas locais
- 1 mês: 2000 interações → 80% respostas locais
- 3 meses: 10000 interações → 90% respostas locais

## REGRAS DE ÉTICA

1. NUNCA diagnosticar ou prescrever (apenas médicos)
2. SEMPRE referenciar fontes
3. RESPEITAR LGPD e privacidade
4. OBTER consentimento explícito
5. SER transparente sobre limitações
6. MANTER tom empático e acolhedor

## SEGURANÇA

1. RLS (Row Level Security) no Supabase
2. JWT tokens para autenticação
3. Dados criptografados em repouso
4. Compliance LGPD
5. Auditoria de todas as ações
6. Consentimento por categoria

---
FIM DO DOCUMENTO MESTRE
---
```

---

## 💻 **CÓDIGO DA NOAVISION IA**

```typescript
// src/gpt/noaVisionIA.ts

import { pipeline } from '@xenova/transformers'
import { supabase } from '../integrations/supabase/client'
import { openAIService } from '../services/openaiService'

// Importar agentes existentes
import { clinicalAgent } from './clinicalAgent'
import { knowledgeBaseAgent } from './knowledgeBaseAgent'
import { courseAdminAgent } from './courseAdminAgent'
import { symbolicAgent } from './symbolicAgent'
import { voiceControlAgent } from './voiceControlAgent'
import { codeEditorAgent } from './codeEditorAgent'

// Novos agentes
import { dashboardAgent } from './dashboardAgent' // NOVO
import { prescriptionAgent } from './prescriptionAgent' // NOVO

export interface NoaContext {
  userId: string
  userProfile: 'paciente' | 'medico' | 'profissional' | 'admin' | 'pesquisador'
  specialty: 'rim' | 'neuro' | 'cannabis'
  currentDashboard: string // ex: /app/paciente
  conversationHistory: string[]
}

export class NoaVisionIA {
  private embeddingsModel: any
  private agents: Record<string, any>
  private embeddingCache: Map<string, number[]> = new Map()
  
  constructor() {
    this.initializeEmbeddings()
    this.initializeAgents()
  }
  
  // 🚀 INICIALIZAR EMBEDDINGS LOCAL
  private async initializeEmbeddings() {
    try {
      console.log('🧠 Carregando MiniLM-L6-v2...')
      this.embeddingsModel = await pipeline(
        'feature-extraction',
        'Xenova/all-MiniLM-L6-v2'
      )
      console.log('✅ Embeddings carregado!')
    } catch (error) {
      console.error('❌ Erro ao carregar embeddings:', error)
      // Fallback: usar sem embeddings (só OpenAI)
    }
  }
  
  // 🤖 INICIALIZAR AGENTES
  private initializeAgents() {
    this.agents = {
      clinical: clinicalAgent,
      knowledge: knowledgeBaseAgent,
      courses: courseAdminAgent,
      symbolic: symbolicAgent,
      voice: voiceControlAgent,
      code: codeEditorAgent,
      dashboard: dashboardAgent,      // NOVO
      prescription: prescriptionAgent  // NOVO
    }
  }
  
  // 🎯 PROCESSAR MENSAGEM (Método principal)
  async processMessage(
    message: string,
    context: NoaContext
  ): Promise<string> {
    try {
      console.log('📨 NoaVision IA processando:', { message, context })
      
      // 1️⃣ NORMALIZAR MENSAGEM
      const normalized = this.normalizeMessage(message)
      
      // 2️⃣ VERIFICAR AGENTES ESPECÍFICOS (prioridade)
      const agentResponse = await this.checkAgents(normalized, context)
      if (agentResponse) {
        await this.saveToLearning(message, agentResponse, context, 'agent')
        return agentResponse
      }
      
      // 3️⃣ VETORIZAR MENSAGEM
      const embedding = await this.getEmbedding(normalized)
      if (!embedding) {
        // Sem embeddings, vai direto para OpenAI
        return await this.openAIFallback(message, context)
      }
      
      // 4️⃣ BUSCA SEMÂNTICA NO BANCO
      const similarResponse = await this.semanticSearch(
        embedding,
        context
      )
      
      if (similarResponse && similarResponse.confidence >= 0.85) {
        console.log(`✅ Usando resposta do banco (${(similarResponse.confidence * 100).toFixed(1)}%)`)
        
        // Incrementar uso
        await this.incrementUsage(similarResponse.id)
        
        return similarResponse.ai_response
      }
      
      // 5️⃣ FALLBACK OPENAI
      console.log('🔄 Usando OpenAI (fallback)')
      const openaiResponse = await this.openAIFallback(message, context)
      
      // Salvar para aprender
      await this.saveToLearning(message, openaiResponse, context, 'openai', embedding)
      
      return openaiResponse
      
    } catch (error) {
      console.error('❌ Erro no NoaVision IA:', error)
      return 'Desculpe, ocorreu um erro. Por favor, tente novamente.'
    }
  }
  
  // 📝 NORMALIZAR MENSAGEM
  private normalizeMessage(message: string): string {
    return message
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .trim()
  }
  
  // 🤖 VERIFICAR AGENTES ESPECÍFICOS
  private async checkAgents(
    normalized: string,
    context: NoaContext
  ): Promise<string | null> {
    // Verificar cada agente em ordem de prioridade
    
    // 1. ClinicalAgent (avaliação clínica)
    if (
      normalized.includes('avaliacao clinica') ||
      normalized.includes('avaliacao inicial') ||
      normalized.includes('quero fazer avaliacao')
    ) {
      const inicioAvaliacao = await clinicalAgent.detectarInicioAvaliacao(normalized)
      if (inicioAvaliacao) {
        return inicioAvaliacao.mensagem
      }
    }
    
    // 2. DashboardAgent (navegação)
    if (
      normalized.includes('como acesso') ||
      normalized.includes('onde fica') ||
      normalized.includes('ir para') ||
      normalized.includes('abrir')
    ) {
      return await dashboardAgent.navigate(normalized, context)
    }
    
    // 3. PrescriptionAgent (prescrições - só médicos)
    if (context.userProfile === 'medico') {
      if (
        normalized.includes('prescrever') ||
        normalized.includes('criar prescricao') ||
        normalized.includes('receita')
      ) {
        return await prescriptionAgent.create(normalized, context)
      }
    }
    
    // 4. KnowledgeAgent (documentos)
    if (
      normalized.includes('documento') ||
      normalized.includes('base de conhecimento') ||
      normalized.includes('consultar')
    ) {
      return await knowledgeBaseAgent.executarAcao(normalized)
    }
    
    // 5. VoiceAgent (voz)
    if (normalized.includes('ativar voz') || normalized.includes('modo voz')) {
      return await voiceControlAgent.ativarControle()
    }
    
    // Nenhum agente específico
    return null
  }
  
  // 🧠 OBTER EMBEDDING (com cache)
  private async getEmbedding(text: string): Promise<number[] | null> {
    if (!this.embeddingsModel) return null
    
    // Verificar cache
    const cacheKey = this.hashText(text)
    if (this.embeddingCache.has(cacheKey)) {
      console.log('📦 Usando embedding do cache')
      return this.embeddingCache.get(cacheKey)!
    }
    
    try {
      const output = await this.embeddingsModel(text, {
        pooling: 'mean',
        normalize: true
      })
      
      const embedding = Array.from(output.data)
      
      // Salvar no cache
      this.embeddingCache.set(cacheKey, embedding)
      
      // Limitar cache (máximo 100 embeddings)
      if (this.embeddingCache.size > 100) {
        const firstKey = this.embeddingCache.keys().next().value
        this.embeddingCache.delete(firstKey)
      }
      
      return embedding
    } catch (error) {
      console.error('❌ Erro ao gerar embedding:', error)
      return null
    }
  }
  
  // 🔍 BUSCA SEMÂNTICA
  private async semanticSearch(
    embedding: number[],
    context: NoaContext
  ): Promise<{
    id: string
    ai_response: string
    confidence: number
  } | null> {
    try {
      const { data, error } = await supabase.rpc('search_similar_embeddings', {
        query_embedding: embedding,
        user_profile: context.userProfile,
        specialty: context.specialty,
        similarity_threshold: 0.85,
        match_count: 3
      })
      
      if (error) throw error
      if (!data || data.length === 0) return null
      
      // Retornar o melhor match
      return {
        id: data[0].id,
        ai_response: data[0].ai_response,
        confidence: data[0].similarity
      }
      
    } catch (error) {
      console.error('❌ Erro na busca semântica:', error)
      return null
    }
  }
  
  // ☁️ FALLBACK OPENAI
  private async openAIFallback(
    message: string,
    context: NoaContext
  ): Promise<string> {
    // Construir prompt personalizado por perfil
    const systemPrompt = this.buildSystemPrompt(context)
    
    const response = await openAIService.sendMessage(
      [{ role: 'user', content: message }],
      systemPrompt
    )
    
    return response
  }
  
  // 📝 CONSTRUIR PROMPT DO SISTEMA
  private buildSystemPrompt(context: NoaContext): string {
    const basePrompt = `Você é Nôa Esperanza, assistente médica do Dr. Ricardo Valença.
Especialidades: Neurologia, Cannabis Medicinal, Nefrologia.

CONTEXTO DO USUÁRIO:
- Perfil: ${context.userProfile}
- Especialidade ativa: ${context.specialty}
- Dashboard atual: ${context.currentDashboard}
`
    
    // Personalizar por perfil
    if (context.userProfile === 'paciente') {
      return basePrompt + `
Tom: Acolhedor e empático
Linguagem: Simples e clara
Foco: Cuidado e acompanhamento
Links sugeridos: Chat, Relatórios, Exames`
    }
    
    if (context.userProfile === 'medico') {
      return basePrompt + `
Tom: Profissional e técnico
Linguagem: Terminologia médica
Foco: Gestão de pacientes e prescrições
Links sugeridos: Pacientes, Prescrições, Prontuários`
    }
    
    if (context.userProfile === 'profissional') {
      return basePrompt + `
Tom: Colaborativo e educacional
Linguagem: Didática
Foco: Aprendizado e desenvolvimento
Links sugeridos: Cursos, Pesquisas, Material`
    }
    
    if (context.userProfile === 'admin') {
      return basePrompt + `
Tom: Estratégico e técnico
Linguagem: Técnica
Foco: Orquestração da plataforma
Links sugeridos: GPT Builder, Métricas, IDE`
    }
    
    return basePrompt
  }
  
  // 💾 SALVAR NO BANCO (com embedding)
  private async saveToLearning(
    message: string,
    response: string,
    context: NoaContext,
    source: 'agent' | 'openai' | 'local',
    embedding?: number[]
  ): Promise<void> {
    try {
      await supabase.from('ai_learning').insert({
        user_message: message,
        ai_response: response,
        user_profile: context.userProfile,
        specialty: context.specialty,
        dashboard: context.currentDashboard,
        source: source,
        embedding: embedding || null,
        confidence_score: source === 'openai' ? 0.7 : 0.9,
        usage_count: 1,
        user_id: context.userId
      })
      
      console.log('💾 Salvo no banco para aprendizado')
    } catch (error) {
      console.warn('⚠️ Erro ao salvar aprendizado:', error)
    }
  }
  
  // 📈 INCREMENTAR USO
  private async incrementUsage(id: string): Promise<void> {
    try {
      await supabase
        .from('ai_learning')
        .update({
          usage_count: supabase.rpc('increment', { row_id: id }),
          last_used_at: new Date().toISOString()
        })
        .eq('id', id)
    } catch (error) {
      console.warn('⚠️ Erro ao incrementar uso:', error)
    }
  }
  
  // 🔑 HASH DE TEXTO (para cache)
  private hashText(text: string): string {
    let hash = 0
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32bit integer
    }
    return hash.toString(36)
  }
}

// Exportar instância singleton
export const noaVisionIA = new NoaVisionIA()
```

---

## 🆕 **NOVOS AGENTES**

### **DashboardAgent (Navegação)**

```typescript
// src/gpt/dashboardAgent.ts

export const dashboardAgent = {
  async navigate(message: string, context: NoaContext): Promise<string> {
    const lower = message.toLowerCase()
    
    // Detectar destino
    if (lower.includes('exames') || lower.includes('meus exames')) {
      return `📋 **Seus Exames**

Para acessar seus exames, clique no menu lateral em "Exames" ou visite:
👉 [Ver Meus Exames](/app/exames)

Lá você pode:
• Ver resultados de exames
• Upload de novos exames
• Histórico completo
• Compartilhar com médico

Posso ajudar com mais alguma coisa?`
    }
    
    if (lower.includes('prescricoes') || lower.includes('receitas')) {
      return `💊 **Suas Prescrições**

Para ver suas prescrições ativas:
👉 [Ver Prescrições](/app/prescricoes)

Você pode:
• Ver prescrições ativas
• Histórico de medicamentos
• Dosagens e instruções
• Renovar prescrição

Precisa de ajuda com alguma prescrição específica?`
    }
    
    // Adicionar mais rotas...
    
    return `🗺️ Não entendi para onde você quer ir. 

Você pode acessar:
• Chat com Nôa
• Avaliação Clínica
• Meus Exames
• Prescrições
• Relatórios
• Perfil

Para onde gostaria de ir?`
  }
}
```

### **PrescriptionAgent (Prescrições - só médicos)**

```typescript
// src/gpt/prescriptionAgent.ts

export const prescriptionAgent = {
  async create(message: string, context: NoaContext): Promise<string> {
    // Verificar se é médico
    if (context.userProfile !== 'medico') {
      return '⚠️ Apenas médicos podem criar prescrições.'
    }
    
    return `💊 **Criar Nova Prescrição**

Para criar uma prescrição, acesse:
👉 [Nova Prescrição](/app/prescricoes/nova)

**Sistema de Prescrição REUNI:**
✅ Compliance RDC 660/327
✅ Validação automática de concentração THC/CBD
✅ Rastreabilidade completa
✅ Auditoria integrada

**Campos obrigatórios:**
• Paciente
• Medicamento (produtos REUNI)
• Dosagem e frequência
• Duração do tratamento
• Indicação clínica

Posso guiá-lo no preenchimento?`
  }
}
```

---

*Continua na próxima parte...*


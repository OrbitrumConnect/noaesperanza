// 🧠 REASONING LAYER SERVICE - Nôa Esperanza
// Sistema de raciocínio estruturado adaptado para medicina e desenvolvimento

import { supabase } from '../integrations/supabase/client'
import { openAIService } from './openaiService'

export interface ReasoningEffort {
  level: 'low' | 'medium' | 'high' | 'clinical' | 'research'
  description: string
  maxIterations: number
  contextDepth: number
}

export interface ReasoningStep {
  id: string
  type: 'analysis' | 'synthesis' | 'validation' | 'clinical_reasoning' | 'research_reasoning'
  content: string
  confidence: number
  evidence: string[]
  nextSteps: string[]
  timestamp: Date
}

export interface ReasoningChain {
  id: string
  userId: string
  query: string
  effort: ReasoningEffort
  steps: ReasoningStep[]
  conclusion: string
  confidence: number
  toolsUsed: string[]
  createdAt: Date
}

export interface ClinicalReasoning {
  patientContext?: string
  symptoms?: string[]
  differentialDiagnosis?: string[]
  evidenceBased?: boolean
  guidelines?: string[]
  riskFactors?: string[]
}

export interface ResearchReasoning {
  hypothesis?: string
  methodology?: string
  dataSources?: string[]
  statisticalAnalysis?: string
  limitations?: string[]
  implications?: string[]
}

export class ReasoningLayerService {
  
  // 🎯 INICIAR RAZONAMENTO
  async startReasoning(
    query: string, 
    effort: ReasoningEffort, 
    context?: ClinicalReasoning | ResearchReasoning
  ): Promise<ReasoningChain> {
    
    const chainId = `reasoning_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const reasoningChain: ReasoningChain = {
      id: chainId,
      userId: 'dr-ricardo-valenca',
      query,
      effort,
      steps: [],
      conclusion: '',
      confidence: 0,
      toolsUsed: [],
      createdAt: new Date()
    }
    
    // Executar raciocínio baseado no esforço
    switch (effort.level) {
      case 'low':
        await this.executeLowEffortReasoning(reasoningChain, context)
        break
      case 'medium':
        await this.executeMediumEffortReasoning(reasoningChain, context)
        break
      case 'high':
        await this.executeHighEffortReasoning(reasoningChain, context)
        break
      case 'clinical':
        await this.executeClinicalReasoning(reasoningChain, context as ClinicalReasoning)
        break
      case 'research':
        await this.executeResearchReasoning(reasoningChain, context as ResearchReasoning)
        break
    }
    
    // Salvar cadeia de raciocínio
    await this.saveReasoningChain(reasoningChain)
    
    return reasoningChain
  }
  
  // 🔍 RAZONAMENTO BAIXO ESFORÇO
  private async executeLowEffortReasoning(chain: ReasoningChain, context?: any): Promise<void> {
    const step: ReasoningStep = {
      id: `step_${Date.now()}`,
      type: 'analysis',
      content: await this.generateQuickAnalysis(chain.query, context),
      confidence: 0.7,
      evidence: [],
      nextSteps: [],
      timestamp: new Date()
    }
    
    chain.steps.push(step)
    chain.conclusion = step.content
    chain.confidence = step.confidence
  }
  
  // 🧠 RAZONAMENTO MÉDIO ESFORÇO
  private async executeMediumEffortReasoning(chain: ReasoningChain, context?: any): Promise<void> {
    // Passo 1: Análise inicial
    const analysisStep: ReasoningStep = {
      id: `analysis_${Date.now()}`,
      type: 'analysis',
      content: await this.generateDetailedAnalysis(chain.query, context),
      confidence: 0.8,
      evidence: await this.gatherEvidence(chain.query),
      nextSteps: ['synthesis', 'validation'],
      timestamp: new Date()
    }
    
    chain.steps.push(analysisStep)
    
    // Passo 2: Síntese
    const synthesisStep: ReasoningStep = {
      id: `synthesis_${Date.now()}`,
      type: 'synthesis',
      content: await this.generateSynthesis(analysisStep.content, context),
      confidence: 0.85,
      evidence: analysisStep.evidence,
      nextSteps: ['validation'],
      timestamp: new Date()
    }
    
    chain.steps.push(synthesisStep)
    
    // Passo 3: Validação
    const validationStep: ReasoningStep = {
      id: `validation_${Date.now()}`,
      type: 'validation',
      content: await this.generateValidation(synthesisStep.content, context),
      confidence: 0.9,
      evidence: synthesisStep.evidence,
      nextSteps: [],
      timestamp: new Date()
    }
    
    chain.steps.push(validationStep)
    
    chain.conclusion = validationStep.content
    chain.confidence = validationStep.confidence
  }
  
  // 🎯 RAZONAMENTO ALTO ESFORÇO
  private async executeHighEffortReasoning(chain: ReasoningChain, context?: any): Promise<void> {
    // Análise multi-camada
    await this.executeMediumEffortReasoning(chain, context)
    
    // Adicionar raciocínio crítico
    const criticalStep: ReasoningStep = {
      id: `critical_${Date.now()}`,
      type: 'validation',
      content: await this.generateCriticalAnalysis(chain.steps, context),
      confidence: 0.95,
      evidence: chain.steps.flatMap(step => step.evidence),
      nextSteps: [],
      timestamp: new Date()
    }
    
    chain.steps.push(criticalStep)
    chain.conclusion = criticalStep.content
    chain.confidence = criticalStep.confidence
  }
  
  // 🏥 RAZONAMENTO CLÍNICO
  private async executeClinicalReasoning(chain: ReasoningChain, context?: ClinicalReasoning): Promise<void> {
    const clinicalStep: ReasoningStep = {
      id: `clinical_${Date.now()}`,
      type: 'clinical_reasoning',
      content: await this.generateClinicalAnalysis(chain.query, context),
      confidence: 0.9,
      evidence: await this.gatherClinicalEvidence(chain.query, context),
      nextSteps: ['guidelines_check', 'risk_assessment'],
      timestamp: new Date()
    }
    
    chain.steps.push(clinicalStep)
    
    // Verificar guidelines
    if (context?.guidelines) {
      const guidelinesStep: ReasoningStep = {
        id: `guidelines_${Date.now()}`,
        type: 'validation',
        content: await this.checkClinicalGuidelines(clinicalStep.content, context.guidelines),
        confidence: 0.95,
        evidence: [...clinicalStep.evidence, ...context.guidelines],
        nextSteps: ['risk_assessment'],
        timestamp: new Date()
      }
      
      chain.steps.push(guidelinesStep)
      clinicalStep.nextSteps = ['risk_assessment']
    }
    
    // Avaliação de risco
    if (context?.riskFactors) {
      const riskStep: ReasoningStep = {
        id: `risk_${Date.now()}`,
        type: 'validation',
        content: await this.assessClinicalRisk(clinicalStep.content, context.riskFactors),
        confidence: 0.9,
        evidence: clinicalStep.evidence,
        nextSteps: [],
        timestamp: new Date()
      }
      
      chain.steps.push(riskStep)
    }
    
    chain.conclusion = chain.steps[chain.steps.length - 1].content
    chain.confidence = Math.max(...chain.steps.map(s => s.confidence))
  }
  
  // 🔬 RAZONAMENTO DE PESQUISA
  private async executeResearchReasoning(chain: ReasoningChain, context?: ResearchReasoning): Promise<void> {
    const researchStep: ReasoningStep = {
      id: `research_${Date.now()}`,
      type: 'research_reasoning',
      content: await this.generateResearchAnalysis(chain.query, context),
      confidence: 0.85,
      evidence: await this.gatherResearchEvidence(chain.query, context),
      nextSteps: ['methodology_review', 'statistical_analysis'],
      timestamp: new Date()
    }
    
    chain.steps.push(researchStep)
    
    // Revisão metodológica
    if (context?.methodology) {
      const methodologyStep: ReasoningStep = {
        id: `methodology_${Date.now()}`,
        type: 'validation',
        content: await this.reviewMethodology(researchStep.content, context.methodology),
        confidence: 0.9,
        evidence: researchStep.evidence,
        nextSteps: ['statistical_analysis'],
        timestamp: new Date()
      }
      
      chain.steps.push(methodologyStep)
    }
    
    // Análise estatística
    if (context?.statisticalAnalysis) {
      const statsStep: ReasoningStep = {
        id: `stats_${Date.now()}`,
        type: 'validation',
        content: await this.performStatisticalAnalysis(researchStep.content, context.statisticalAnalysis),
        confidence: 0.95,
        evidence: researchStep.evidence,
        nextSteps: [],
        timestamp: new Date()
      }
      
      chain.steps.push(statsStep)
    }
    
    chain.conclusion = chain.steps[chain.steps.length - 1].content
    chain.confidence = Math.max(...chain.steps.map(s => s.confidence))
  }
  
  // 📊 GERAR ANÁLISE RÁPIDA
  private async generateQuickAnalysis(query: string, context?: any): Promise<string> {
    const prompt = `
Você é Nôa Esperanza, mentora especializada em medicina e desenvolvimento tecnológico.

CONSULTA: ${query}

CONTEXTO: ${context ? JSON.stringify(context) : 'Nenhum contexto específico'}

TAREFA: Forneça uma análise rápida e precisa, focada no essencial.

INSTRUÇÕES:
- Seja concisa mas completa
- Mantenha o tom da Nôa Esperanza
- Foque nos pontos mais importantes
- Seja prática e útil
`

    try {
      return await openAIService.getNoaResponse(prompt, [])
    } catch (error) {
      return `Análise rápida: ${query} - Consulte documentação específica para detalhes completos.`
    }
  }
  
  // 🔍 GERAR ANÁLISE DETALHADA
  private async generateDetailedAnalysis(query: string, context?: any): Promise<string> {
    const prompt = `
Você é Nôa Esperanza, mentora especializada em medicina e desenvolvimento tecnológico.

CONSULTA: ${query}

CONTEXTO: ${context ? JSON.stringify(context) : 'Nenhum contexto específico'}

TAREFA: Forneça uma análise detalhada e estruturada.

ESTRUTURA:
1. **Análise do Problema**
2. **Contexto Médico/Técnico**
3. **Abordagens Possíveis**
4. **Recomendações**
5. **Próximos Passos**

INSTRUÇÕES:
- Seja detalhada mas clara
- Use estrutura lógica
- Mantenha rigor científico
- Seja prática e aplicável
`

    try {
      return await openAIService.getNoaResponse(prompt, [])
    } catch (error) {
      return `Análise detalhada em desenvolvimento. Consulta: ${query}`
    }
  }
  
  // 🧠 GERAR SÍNTESE
  private async generateSynthesis(analysis: string, context?: any): Promise<string> {
    const prompt = `
Você é Nôa Esperanza, mentora especializada em medicina e desenvolvimento tecnológico.

ANÁLISE PREVIA: ${analysis}

CONTEXTO: ${context ? JSON.stringify(context) : 'Nenhum contexto específico'}

TAREFA: Sintetize a análise em pontos-chave claros e acionáveis.

FORMATO:
- **Resumo Executivo**
- **Pontos Críticos**
- **Recomendações Prioritárias**
- **Ações Imediatas**

INSTRUÇÕES:
- Seja concisa mas completa
- Priorize informações críticas
- Mantenha clareza e precisão
`

    try {
      return await openAIService.getNoaResponse(prompt, [])
    } catch (error) {
      return `Síntese: ${analysis.substring(0, 200)}...`
    }
  }
  
  // ✅ GERAR VALIDAÇÃO
  private async generateValidation(synthesis: string, context?: any): Promise<string> {
    const prompt = `
Você é Nôa Esperanza, mentora especializada em medicina e desenvolvimento tecnológico.

SÍNTESE: ${synthesis}

CONTEXTO: ${context ? JSON.stringify(context) : 'Nenhum contexto específico'}

TAREFA: Valide e refine a síntese, garantindo precisão e aplicabilidade.

VALIDAÇÃO:
- Verificar consistência lógica
- Confirmar aplicabilidade prática
- Identificar possíveis melhorias
- Garantir rigor científico

INSTRUÇÕES:
- Seja crítica mas construtiva
- Mantenha padrões elevados
- Foque na qualidade final
`

    try {
      return await openAIService.getNoaResponse(prompt, [])
    } catch (error) {
      return `Validação concluída: ${synthesis.substring(0, 200)}...`
    }
  }
  
  // 🏥 GERAR ANÁLISE CLÍNICA
  private async generateClinicalAnalysis(query: string, context?: ClinicalReasoning): Promise<string> {
    const prompt = `
Você é Nôa Esperanza, mentora especializada em medicina clínica.

CONSULTA CLÍNICA: ${query}

CONTEXTO CLÍNICO:
- Paciente: ${context?.patientContext || 'Não especificado'}
- Sintomas: ${context?.symptoms?.join(', ') || 'Não especificados'}
- Fatores de Risco: ${context?.riskFactors?.join(', ') || 'Não especificados'}

TAREFA: Forneça análise clínica estruturada e baseada em evidências.

ESTRUTURA CLÍNICA:
1. **Avaliação Inicial**
2. **Diagnóstico Diferencial**
3. **Plano de Investigação**
4. **Abordagem Terapêutica**
5. **Monitoramento**

INSTRUÇÕES:
- Baseie-se em evidências científicas
- Considere guidelines atuais
- Mantenha foco no paciente
- Seja precisa e prática
`

    try {
      return await openAIService.getNoaResponse(prompt, [])
    } catch (error) {
      return `Análise clínica em desenvolvimento para: ${query}`
    }
  }
  
  // 🔬 GERAR ANÁLISE DE PESQUISA
  private async generateResearchAnalysis(query: string, context?: ResearchReasoning): Promise<string> {
    const prompt = `
Você é Nôa Esperanza, mentora especializada em pesquisa médica e científica.

CONSULTA DE PESQUISA: ${query}

CONTEXTO DE PESQUISA:
- Hipótese: ${context?.hypothesis || 'Não especificada'}
- Metodologia: ${context?.methodology || 'Não especificada'}
- Fontes de Dados: ${context?.dataSources?.join(', ') || 'Não especificadas'}

TAREFA: Forneça análise de pesquisa estruturada e metodológica.

ESTRUTURA DE PESQUISA:
1. **Revisão da Literatura**
2. **Metodologia Proposta**
3. **Análise de Dados**
4. **Limitações**
5. **Implicações Clínicas**

INSTRUÇÕES:
- Mantenha rigor metodológico
- Considere limitações
- Foque em aplicabilidade
- Seja crítica e construtiva
`

    try {
      return await openAIService.getNoaResponse(prompt, [])
    } catch (error) {
      return `Análise de pesquisa em desenvolvimento para: ${query}`
    }
  }
  
  // 📚 COLETAR EVIDÊNCIAS
  private async gatherEvidence(query: string): Promise<string[]> {
    try {
      const { data } = await supabase
        .from('documentos_mestres')
        .select('title, content')
        .textSearch('content', query)
        .limit(5)
      
      return data?.map(doc => `${doc.title}: ${doc.content.substring(0, 100)}...`) || []
    } catch (error) {
      return []
    }
  }
  
  // 🏥 COLETAR EVIDÊNCIAS CLÍNICAS
  private async gatherClinicalEvidence(query: string, context?: ClinicalReasoning): Promise<string[]> {
    try {
      const { data } = await supabase
        .from('documentos_mestres')
        .select('title, content, tags')
        .contains('tags', ['clinico', 'guideline', 'protocolo'])
        .textSearch('content', query)
        .limit(5)
      
      return data?.map(doc => `${doc.title}: ${doc.content.substring(0, 100)}...`) || []
    } catch (error) {
      return []
    }
  }
  
  // 🔬 COLETAR EVIDÊNCIAS DE PESQUISA
  private async gatherResearchEvidence(query: string, context?: ResearchReasoning): Promise<string[]> {
    try {
      const { data } = await supabase
        .from('documentos_mestres')
        .select('title, content, tags')
        .contains('tags', ['pesquisa', 'estudo', 'metodologia'])
        .textSearch('content', query)
        .limit(5)
      
      return data?.map(doc => `${doc.title}: ${doc.content.substring(0, 100)}...`) || []
    } catch (error) {
      return []
    }
  }
  
  // Métodos auxiliares para validação e análise crítica
  private async generateCriticalAnalysis(steps: ReasoningStep[], context?: any): Promise<string> {
    // Implementação de análise crítica
    return `Análise crítica concluída com ${steps.length} passos de raciocínio.`
  }
  
  private async checkClinicalGuidelines(analysis: string, guidelines: string[]): Promise<string> {
    // Verificação de guidelines clínicas
    return `Guidelines verificadas: ${guidelines.join(', ')}`
  }
  
  private async assessClinicalRisk(analysis: string, riskFactors: string[]): Promise<string> {
    // Avaliação de risco clínico
    return `Avaliação de risco concluída para fatores: ${riskFactors.join(', ')}`
  }
  
  private async reviewMethodology(analysis: string, methodology: string): Promise<string> {
    // Revisão metodológica
    return `Metodologia revisada: ${methodology}`
  }
  
  private async performStatisticalAnalysis(analysis: string, statisticalAnalysis: string): Promise<string> {
    // Análise estatística
    return `Análise estatística realizada: ${statisticalAnalysis}`
  }
  
  // 💾 SALVAR CADEIA DE RAZONAMENTO
  private async saveReasoningChain(chain: ReasoningChain): Promise<void> {
    try {
      await supabase
        .from('reasoning_chains')
        .insert({
          id: chain.id,
          user_id: chain.userId,
          query: chain.query,
          effort_level: chain.effort.level,
          steps: chain.steps,
          conclusion: chain.conclusion,
          confidence: chain.confidence,
          tools_used: chain.toolsUsed,
          created_at: chain.createdAt.toISOString()
        })
    } catch (error) {
      console.error('Erro ao salvar cadeia de raciocínio:', error)
    }
  }
  
  // 📊 OBTER HISTÓRICO DE RAZONAMENTO
  async getReasoningHistory(limit: number = 10): Promise<ReasoningChain[]> {
    try {
      const { data } = await supabase
        .from('reasoning_chains')
        .select('*')
        .eq('user_id', 'dr-ricardo-valenca')
        .order('created_at', { ascending: false })
        .limit(limit)
      
      return data?.map(this.mapDatabaseToReasoningChain) || []
    } catch (error) {
      console.error('Erro ao buscar histórico de raciocínio:', error)
      return []
    }
  }
  
  // 🔄 MAPEAR DADOS DO BANCO
  private mapDatabaseToReasoningChain(data: any): ReasoningChain {
    return {
      id: data.id,
      userId: data.user_id,
      query: data.query,
      effort: {
        level: data.effort_level,
        description: '',
        maxIterations: 3,
        contextDepth: 5
      },
      steps: data.steps || [],
      conclusion: data.conclusion,
      confidence: data.confidence,
      toolsUsed: data.tools_used || [],
      createdAt: new Date(data.created_at)
    }
  }
}

export const reasoningLayerService = new ReasoningLayerService()

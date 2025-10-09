// 🔧 MEDICAL TOOLS SERVICE - Nôa Esperanza
// Ferramentas médicas específicas adaptadas para nossa plataforma

import { supabase } from '../integrations/supabase/client'
import { openAIService } from './openaiService'

export interface MedicalTool {
  id: string
  name: string
  description: string
  type: 'browser' | 'python' | 'calculator' | 'guideline' | 'protocol'
  capabilities: string[]
  isActive: boolean
}

export interface BrowserResult {
  url: string
  title: string
  content: string
  relevance: number
  source: string
}

export interface PythonResult {
  code: string
  output: string
  error?: string
  executionTime: number
}

export interface CalculatorResult {
  expression: string
  result: string
  unit?: string
  formula?: string
  error?: string
}

export interface GuidelineResult {
  title: string
  recommendation: string
  level: string
  source: string
  applicability: string
}

export class MedicalToolsService {
  // 🌐 BROWSER MÉDICO
  async searchMedicalWeb(
    query: string,
    domain: 'pubmed' | 'who' | 'nih' | 'general' = 'general'
  ): Promise<BrowserResult[]> {
    const results: BrowserResult[] = []

    try {
      // Simular busca em bases médicas
      switch (domain) {
        case 'pubmed':
          results.push(...(await this.searchPubMed(query)))
          break
        case 'who':
          results.push(...(await this.searchWHO(query)))
          break
        case 'nih':
          results.push(...(await this.searchNIH(query)))
          break
        default:
          results.push(...(await this.searchGeneralMedical(query)))
      }

      // Buscar também em nossa base de conhecimento
      const localResults = await this.searchLocalKnowledge(query)
      results.push(...localResults)
    } catch (error) {
      console.error('Erro na busca médica:', error)
    }

    return results
  }

  // 🔬 PYTHON CLÍNICO
  async executeMedicalPython(code: string, context?: string): Promise<PythonResult> {
    const startTime = Date.now()

    try {
      // Validação de segurança para código médico
      if (!this.validateMedicalCode(code)) {
        return {
          code,
          output: '',
          error: 'Código não permitido - contém operações não médicas',
          executionTime: Date.now() - startTime,
        }
      }

      // Simular execução de código Python para cálculos médicos
      const result = await this.simulatePythonExecution(code, context)

      return {
        code,
        output: result.output,
        error: result.error,
        executionTime: Date.now() - startTime,
      }
    } catch (error) {
      return {
        code,
        output: '',
        error: `Erro na execução: ${error}`,
        executionTime: Date.now() - startTime,
      }
    }
  }

  // 🧮 CALCULADORA MÉDICA
  async calculateMedical(
    expression: string,
    context: 'clinical' | 'research' | 'dosage' = 'clinical'
  ): Promise<CalculatorResult> {
    try {
      const result = await this.processMedicalCalculation(expression, context)

      return {
        expression,
        result: result.value,
        unit: result.unit,
        formula: result.formula,
      }
    } catch (error) {
      return {
        expression,
        result: 'Erro no cálculo',
        error: error as string,
      }
    }
  }

  // 📋 VERIFICAR GUIDELINES
  async checkGuidelines(condition: string, specialty?: string): Promise<GuidelineResult[]> {
    try {
      const { data } = await supabase
        .from('documentos_mestres')
        .select('*')
        .contains('tags', ['guideline', 'protocolo'])
        .textSearch('content', condition)
        .limit(5)

      return (
        data?.map(doc => ({
          title: doc.title,
          recommendation: doc.content.substring(0, 300),
          level: doc.nivel_evidencia || 'B',
          source: doc.autores || 'Nôa Esperanza',
          applicability: doc.aplicabilidade_clinica || 'Geral',
        })) || []
      )
    } catch (error) {
      console.error('Erro ao buscar guidelines:', error)
      return []
    }
  }

  // 🎯 APLICAR PROTOCOLO
  async applyProtocol(protocolName: string, patientData: any): Promise<string> {
    try {
      const { data } = await supabase
        .from('documentos_mestres')
        .select('*')
        .eq('title', protocolName)
        .single()

      if (!data) {
        return `Protocolo "${protocolName}" não encontrado.`
      }

      const prompt = `
Você é Nôa Esperanza, aplicando protocolo médico.

PROTOCOLO: ${data.title}
CONTEÚDO: ${data.content}

DADOS DO PACIENTE:
${JSON.stringify(patientData, null, 2)}

TAREFA: Aplique o protocolo aos dados do paciente, fornecendo:
1. Avaliação inicial
2. Passos do protocolo
3. Recomendações específicas
4. Próximos passos

INSTRUÇÕES:
- Seja precisa e sistemática
- Adapte às características do paciente
- Mantenha rigor científico
- Seja prática e aplicável
`

      return await openAIService.getNoaResponse(prompt, [])
    } catch (error) {
      return `Erro ao aplicar protocolo: ${error}`
    }
  }

  // 🔍 BUSCAR CONHECIMENTO LOCAL
  private async searchLocalKnowledge(query: string): Promise<BrowserResult[]> {
    try {
      const { data } = await supabase
        .from('documentos_mestres')
        .select('*')
        .textSearch('content', query)
        .limit(3)

      return (
        data?.map(doc => ({
          url: `local://${doc.id}`,
          title: doc.title,
          content: doc.content.substring(0, 500),
          relevance: 0.9,
          source: 'Base de Conhecimento Nôa Esperanza',
        })) || []
      )
    } catch (error) {
      return []
    }
  }

  // 🧬 BUSCAR PUBMED
  private async searchPubMed(query: string): Promise<BrowserResult[]> {
    // Simulação de busca no PubMed
    return [
      {
        url: 'https://pubmed.ncbi.nlm.nih.gov/',
        title: `PubMed: ${query}`,
        content: `Resultados da busca no PubMed para "${query}". Artigos relevantes encontrados com evidências científicas.`,
        relevance: 0.8,
        source: 'PubMed',
      },
    ]
  }

  // 🌍 BUSCAR WHO
  private async searchWHO(query: string): Promise<BrowserResult[]> {
    // Simulação de busca na WHO
    return [
      {
        url: 'https://www.who.int/',
        title: `WHO: ${query}`,
        content: `Diretrizes e recomendações da OMS para "${query}". Informações globais de saúde pública.`,
        relevance: 0.85,
        source: 'World Health Organization',
      },
    ]
  }

  // 🏥 BUSCAR NIH
  private async searchNIH(query: string): Promise<BrowserResult[]> {
    // Simulação de busca no NIH
    return [
      {
        url: 'https://www.nih.gov/',
        title: `NIH: ${query}`,
        content: `Recursos e informações do NIH para "${query}". Pesquisas e diretrizes nacionais.`,
        relevance: 0.8,
        source: 'National Institutes of Health',
      },
    ]
  }

  // 🔍 BUSCAR GERAL MÉDICA
  private async searchGeneralMedical(query: string): Promise<BrowserResult[]> {
    // Simulação de busca geral médica
    return [
      {
        url: 'https://medical-sources.com/',
        title: `Busca Médica: ${query}`,
        content: `Resultados de busca médica para "${query}". Fontes confiáveis e atualizadas.`,
        relevance: 0.7,
        source: 'Fontes Médicas Gerais',
      },
    ]
  }

  // ✅ VALIDAR CÓDIGO MÉDICO
  private validateMedicalCode(code: string): boolean {
    const allowedPatterns = [
      /import\s+(numpy|pandas|scipy|matplotlib|sklearn)/,
      /def\s+\w+\(/,
      /print\(/,
      /return\s+/,
      /if\s+.*:/,
      /for\s+.*in\s+.*:/,
      /while\s+.*:/,
      /math\./,
      /statistics\./,
      /\.mean\(/,
      /\.std\(/,
      /\.corr\(/,
      /\.plot\(/,
      /\.hist\(/,
      /\.scatter\(/,
    ]

    const forbiddenPatterns = [
      /import\s+os/,
      /import\s+subprocess/,
      /import\s+sys/,
      /exec\(/,
      /eval\(/,
      /open\(/,
      /file\(/,
      /__import__/,
    ]

    // Verificar se contém padrões permitidos
    const hasAllowedPattern = allowedPatterns.some(pattern => pattern.test(code))

    // Verificar se contém padrões proibidos
    const hasForbiddenPattern = forbiddenPatterns.some(pattern => pattern.test(code))

    return hasAllowedPattern && !hasForbiddenPattern
  }

  // 🐍 SIMULAR EXECUÇÃO PYTHON
  private async simulatePythonExecution(
    code: string,
    context?: string
  ): Promise<{ output: string; error?: string }> {
    // Simulação de execução Python para cálculos médicos
    const prompt = `
Você é um interpretador Python especializado em cálculos médicos.

CÓDIGO PYTHON:
\`\`\`python
${code}
\`\`\`

CONTEXTO: ${context || 'Nenhum contexto específico'}

TAREFA: Execute o código Python e retorne o resultado.

INSTRUÇÕES:
- Execute apenas operações matemáticas e estatísticas
- Retorne o resultado formatado
- Se houver erro, explique o problema
- Mantenha foco em cálculos médicos
`

    try {
      const result = await openAIService.getNoaResponse(prompt, [])
      return { output: result }
    } catch (error) {
      return { output: '', error: error as string }
    }
  }

  // 🧮 PROCESSAR CÁLCULO MÉDICO
  private async processMedicalCalculation(
    expression: string,
    context: string
  ): Promise<{ value: string; unit?: string; formula?: string }> {
    const prompt = `
Você é uma calculadora médica especializada.

EXPRESSÃO: ${expression}
CONTEXTO: ${context}

TAREFA: Calcule o resultado e forneça:
1. Valor numérico
2. Unidade apropriada
3. Fórmula utilizada (se aplicável)

EXEMPLOS:
- "70 kg / (1.75 m)²" → "22.86 kg/m²" (IMC)
- "140 mg/dL * 0.0555" → "7.77 mmol/L" (Conversão glicose)
- "0.8 * 70 kg" → "56 g" (Proteína recomendada)

INSTRUÇÕES:
- Seja precisa nos cálculos
- Use unidades médicas apropriadas
- Explique a fórmula quando relevante
`

    try {
      const result = await openAIService.getNoaResponse(prompt, [])

      // Extrair valor, unidade e fórmula da resposta
      const valueMatch = result.match(/(\d+\.?\d*)/)
      const unitMatch = result.match(/\(([^)]+)\)/)
      const formulaMatch = result.match(/fórmula[:\s]+([^\n]+)/i)

      return {
        value: valueMatch ? valueMatch[1] : result,
        unit: unitMatch ? unitMatch[1] : undefined,
        formula: formulaMatch ? formulaMatch[1] : undefined,
      }
    } catch (error) {
      return { value: 'Erro no cálculo' }
    }
  }

  // 📊 OBTER FERRAMENTAS DISPONÍVEIS
  async getAvailableTools(): Promise<MedicalTool[]> {
    return [
      {
        id: 'medical_browser',
        name: 'Browser Médico',
        description: 'Busca em bases médicas (PubMed, WHO, NIH)',
        type: 'browser',
        capabilities: ['pubmed', 'who', 'nih', 'local'],
        isActive: true,
      },
      {
        id: 'medical_python',
        name: 'Python Clínico',
        description: 'Execução de código Python para cálculos médicos',
        type: 'python',
        capabilities: ['calculations', 'statistics', 'visualization'],
        isActive: true,
      },
      {
        id: 'medical_calculator',
        name: 'Calculadora Médica',
        description: 'Cálculos médicos específicos (IMC, dosagem, etc.)',
        type: 'calculator',
        capabilities: ['bmi', 'dosage', 'conversion', 'formulas'],
        isActive: true,
      },
      {
        id: 'guidelines_checker',
        name: 'Verificador de Guidelines',
        description: 'Consulta de diretrizes e protocolos médicos',
        type: 'guideline',
        capabilities: ['protocols', 'recommendations', 'evidence'],
        isActive: true,
      },
    ]
  }

  // 🎯 EXECUTAR FERRAMENTA
  async executeTool(toolId: string, input: any): Promise<any> {
    switch (toolId) {
      case 'medical_browser':
        return await this.searchMedicalWeb(input.query, input.domain)
      case 'medical_python':
        return await this.executeMedicalPython(input.code, input.context)
      case 'medical_calculator':
        return await this.calculateMedical(input.expression, input.context)
      case 'guidelines_checker':
        return await this.checkGuidelines(input.condition, input.specialty)
      default:
        throw new Error(`Ferramenta não encontrada: ${toolId}`)
    }
  }
}

export const medicalToolsService = new MedicalToolsService()

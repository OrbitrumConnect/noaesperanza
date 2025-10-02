// 🧠 SERVIÇO DE HIPÓTESES SINDROMICAS
// Sistema inteligente para análise médica e sugestões diagnósticas
// Baseado na metodologia do Dr. Ricardo Valença

import { supabase } from '../integrations/supabase/client'

export interface Sintoma {
  nome: string
  intensidade: number // 1-10
  duracao: string
  frequencia: string
  localizacao: string
  caracteristicas: string[]
  fatoresMelhora: string[]
  fatoresPiora: string[]
}

export interface HipoteseSindromica {
  nome: string
  probabilidade: number // 0-100%
  sintomasRelacionados: string[]
  examesSugeridos: string[]
  observacoes: string
  categoria: 'neurologia' | 'nefrologia' | 'cannabis' | 'geral'
  urgencia: 'baixa' | 'media' | 'alta' | 'emergencia'
}

export interface AnaliseMedica {
  sintomasPrincipais: Sintoma[]
  hipoteses: HipoteseSindromica[]
  examesRecomendados: string[]
  observacoesGerais: string
  nivelUrgencia: 'baixa' | 'media' | 'alta' | 'emergencia'
  recomendacaoMedica: string
}

export class HipotesesSindromicasService {
  // 🧠 BASE DE CONHECIMENTO MÉDICO
  private baseConhecimento = {
    neurologia: {
      'dor_de_cabeca': {
        sintomas: ['dor de cabeça', 'cefaleia', 'enxaqueca', 'migrânea'],
        hipoteses: [
          {
            nome: 'Cefaleia Tensional',
            probabilidade: 70,
            sintomasRelacionados: ['dor de cabeça', 'tensão muscular', 'estresse'],
            examesSugeridos: ['Exame neurológico', 'Pressão arterial'],
            observacoes: 'Dor bilateral, em faixa, sem náusea',
            urgencia: 'baixa'
          },
          {
            nome: 'Enxaqueca',
            probabilidade: 60,
            sintomasRelacionados: ['dor de cabeça', 'náusea', 'fotofobia', 'aura'],
            examesSugeridos: ['Exame neurológico', 'TC ou RM'],
            observacoes: 'Dor unilateral, pulsátil, com sintomas associados',
            urgencia: 'media'
          },
          {
            nome: 'Cefaleia Secundária',
            probabilidade: 30,
            sintomasRelacionados: ['dor de cabeça', 'febre', 'rigidez nucal'],
            examesSugeridos: ['TC urgente', 'Punção lombar'],
            observacoes: 'Dor súbita, intensa, com sinais de alarme',
            urgencia: 'alta'
          }
        ]
      },
      'convulsao': {
        sintomas: ['convulsão', 'crise convulsiva', 'epilepsia', 'perda de consciência'],
        hipoteses: [
          {
            nome: 'Epilepsia',
            probabilidade: 80,
            sintomasRelacionados: ['convulsão', 'perda de consciência', 'movimentos involuntários'],
            examesSugeridos: ['EEG', 'RM cerebral', 'Exame neurológico'],
            observacoes: 'Crises recorrentes, sem causa identificável',
            urgencia: 'alta'
          },
          {
            nome: 'Convulsão Febril',
            probabilidade: 60,
            sintomasRelacionados: ['convulsão', 'febre', 'idade pediátrica'],
            examesSugeridos: ['Exame neurológico', 'Hemograma'],
            observacoes: 'Convulsão associada à febre em criança',
            urgencia: 'media'
          }
        ]
      }
    },
    nefrologia: {
      'dor_renal': {
        sintomas: ['dor no rim', 'dor lombar', 'cólica renal', 'dor no flanco'],
        hipoteses: [
          {
            nome: 'Cólica Renal',
            probabilidade: 85,
            sintomasRelacionados: ['dor lombar', 'náusea', 'vômito', 'hematúria'],
            examesSugeridos: ['USG renal', 'Urografia', 'Urina tipo I'],
            observacoes: 'Dor em cólica, unilateral, irradiando para virilha',
            urgencia: 'alta'
          },
          {
            nome: 'Infecção Urinária',
            probabilidade: 70,
            sintomasRelacionados: ['dor ao urinar', 'frequência urinária', 'febre'],
            examesSugeridos: ['Urina tipo I', 'Urocultura', 'USG renal'],
            observacoes: 'Disúria, polaciúria, febre',
            urgencia: 'media'
          }
        ]
      },
      'edema': {
        sintomas: ['inchaço', 'edema', 'retenção de líquido', 'pernas inchadas'],
        hipoteses: [
          {
            nome: 'Insuficiência Cardíaca',
            probabilidade: 60,
            sintomasRelacionados: ['edema', 'dispneia', 'fadiga', 'ortopneia'],
            examesSugeridos: ['Ecocardiograma', 'BNP', 'RX tórax'],
            observacoes: 'Edema bilateral, dispneia aos esforços',
            urgencia: 'alta'
          },
          {
            nome: 'Síndrome Nefrótica',
            probabilidade: 50,
            sintomasRelacionados: ['edema', 'proteinúria', 'hipoalbuminemia'],
            examesSugeridos: ['Urina 24h', 'Dosagem de proteínas', 'USG renal'],
            observacoes: 'Edema periorbital, proteinúria maciça',
            urgencia: 'media'
          }
        ]
      }
    },
    cannabis: {
      'ansiedade': {
        sintomas: ['ansiedade', 'nervosismo', 'preocupação excessiva', 'pânico'],
        hipoteses: [
          {
            nome: 'Transtorno de Ansiedade Generalizada',
            probabilidade: 75,
            sintomasRelacionados: ['ansiedade', 'preocupação', 'tensão muscular', 'irritabilidade'],
            examesSugeridos: ['Avaliação psicológica', 'Escalas de ansiedade'],
            observacoes: 'Ansiedade persistente, interferindo na vida diária',
            urgencia: 'media'
          },
          {
            nome: 'Síndrome do Pânico',
            probabilidade: 60,
            sintomasRelacionados: ['crise de pânico', 'taquicardia', 'sudorese', 'medo de morrer'],
            examesSugeridos: ['Avaliação psicológica', 'ECG', 'Exame cardiológico'],
            observacoes: 'Crises súbitas de pânico com sintomas físicos',
            urgencia: 'media'
          }
        ]
      },
      'dor_cronica': {
        sintomas: ['dor crônica', 'dor persistente', 'dor neuropática'],
        hipoteses: [
          {
            nome: 'Dor Neuropática',
            probabilidade: 70,
            sintomasRelacionados: ['dor em queimação', 'formigamento', 'hipersensibilidade'],
            examesSugeridos: ['EMG', 'Exame neurológico', 'Avaliação da dor'],
            observacoes: 'Dor em queimação, formigamento, alteração da sensibilidade',
            urgencia: 'media'
          },
          {
            nome: 'Fibromialgia',
            probabilidade: 60,
            sintomasRelacionados: ['dor generalizada', 'fadiga', 'distúrbios do sono'],
            examesSugeridos: ['Exame reumatológico', 'Avaliação da dor'],
            observacoes: 'Dor em múltiplos pontos, fadiga, distúrbios do sono',
            urgencia: 'baixa'
          }
        ]
      }
    }
  }

  // 🔍 ANALISAR SINTOMAS E GERAR HIPÓTESES
  async analisarSintomas(dadosAvaliacao: any): Promise<AnaliseMedica> {
    try {
      console.log('🧠 Iniciando análise de sintomas...')
      
      // 1. Extrair sintomas dos dados da avaliação
      const sintomas = this.extrairSintomas(dadosAvaliacao)
      console.log('📋 Sintomas extraídos:', sintomas)

      // 2. Correlacionar com base de conhecimento
      const hipoteses = this.correlacionarSintomas(sintomas)
      console.log('🎯 Hipóteses geradas:', hipoteses)

      // 3. Calcular probabilidades
      const hipotesesComProbabilidade = this.calcularProbabilidades(hipoteses, sintomas)

      // 4. Ordenar por probabilidade e urgência
      const hipotesesOrdenadas = this.ordenarHipoteses(hipotesesComProbabilidade)

      // 5. Gerar recomendações
      const examesRecomendados = this.gerarExamesRecomendados(hipotesesOrdenadas)
      const nivelUrgencia = this.determinarUrgencia(hipotesesOrdenadas)
      const recomendacaoMedica = this.gerarRecomendacaoMedica(hipotesesOrdenadas, nivelUrgencia)

      const analise: AnaliseMedica = {
        sintomasPrincipais: sintomas,
        hipoteses: hipotesesOrdenadas,
        examesRecomendados,
        observacoesGerais: this.gerarObservacoesGerais(hipotesesOrdenadas),
        nivelUrgencia,
        recomendacaoMedica
      }

      // 6. Salvar análise no banco
      await this.salvarAnalise(dadosAvaliacao.sessionId, analise)

      console.log('✅ Análise médica concluída:', analise)
      return analise

    } catch (error) {
      console.error('❌ Erro na análise de sintomas:', error)
      throw error
    }
  }

  // 📋 EXTRAIR SINTOMAS DOS DADOS DA AVALIAÇÃO
  private extrairSintomas(dadosAvaliacao: any): Sintoma[] {
    const sintomas: Sintoma[] = []

    // Extrair queixa principal
    if (dadosAvaliacao.queixa_principal) {
      sintomas.push({
        nome: dadosAvaliacao.queixa_principal,
        intensidade: 8, // Padrão alto para queixa principal
        duracao: dadosAvaliacao.tempo_evolucao || 'não informado',
        frequencia: 'constante',
        localizacao: dadosAvaliacao.localizacao || 'não informado',
        caracteristicas: [dadosAvaliacao.caracteristicas || 'não informado'],
        fatoresMelhora: Array.isArray(dadosAvaliacao.fatores_melhora) ? dadosAvaliacao.fatores_melhora : [],
        fatoresPiora: Array.isArray(dadosAvaliacao.fatores_piora) ? dadosAvaliacao.fatores_piora : []
      })
    }

    // Extrair sintomas associados
    if (Array.isArray(dadosAvaliacao.sintomas_associados)) {
      dadosAvaliacao.sintomas_associados.forEach((sintoma: string) => {
        sintomas.push({
          nome: sintoma,
          intensidade: 5, // Padrão médio para sintomas associados
          duracao: 'não informado',
          frequencia: 'intermitente',
          localizacao: 'não informado',
          caracteristicas: [],
          fatoresMelhora: [],
          fatoresPiora: []
        })
      })
    }

    return sintomas
  }

  // 🎯 CORRELACIONAR SINTOMAS COM BASE DE CONHECIMENTO
  private correlacionarSintomas(sintomas: Sintoma[]): HipoteseSindromica[] {
    const hipoteses: HipoteseSindromica[] = []

    sintomas.forEach(sintoma => {
      const sintomaLower = sintoma.nome.toLowerCase().replace(/\s+/g, '_')
      
      // Buscar em todas as categorias
      Object.keys(this.baseConhecimento).forEach(categoria => {
        const categoriaData = this.baseConhecimento[categoria as keyof typeof this.baseConhecimento]
        
        Object.keys(categoriaData).forEach(sintomaKey => {
          const sintomaData = categoriaData[sintomaKey as keyof typeof categoriaData] as any
          
          // Verificar se o sintoma corresponde
          if (sintomaData.sintomas.some((s: string) => s.toLowerCase().includes(sintomaLower) || sintomaLower.includes(s.toLowerCase()))) {
            // Adicionar hipóteses relacionadas
            sintomaData.hipoteses.forEach((hipotese: any) => {
              hipoteses.push({
                ...hipotese,
                categoria: categoria as 'neurologia' | 'nefrologia' | 'cannabis' | 'geral'
              })
            })
          }
        })
      })
    })

    return hipoteses
  }

  // 📊 CALCULAR PROBABILIDADES
  private calcularProbabilidades(hipoteses: HipoteseSindromica[], sintomas: Sintoma[]): HipoteseSindromica[] {
    return hipoteses.map(hipotese => {
      let probabilidadeAjustada = hipotese.probabilidade

      // Ajustar baseado no número de sintomas relacionados
      const sintomasRelacionados = sintomas.filter(s => 
        hipotese.sintomasRelacionados.some(sr => 
          s.nome.toLowerCase().includes(sr.toLowerCase()) || 
          sr.toLowerCase().includes(s.nome.toLowerCase())
        )
      )

      // Aumentar probabilidade se mais sintomas relacionados
      if (sintomasRelacionados.length > 1) {
        probabilidadeAjustada += 10
      }

      // Ajustar baseado na intensidade dos sintomas
      const intensidadeMedia = sintomasRelacionados.reduce((acc, s) => acc + s.intensidade, 0) / sintomasRelacionados.length
      if (intensidadeMedia > 7) {
        probabilidadeAjustada += 5
      }

      return {
        ...hipotese,
        probabilidade: Math.min(100, probabilidadeAjustada)
      }
    })
  }

  // 📈 ORDENAR HIPÓTESES POR PROBABILIDADE E URGÊNCIA
  private ordenarHipoteses(hipoteses: HipoteseSindromica[]): HipoteseSindromica[] {
    return hipoteses
      .sort((a, b) => {
        // Primeiro por urgência (emergencia > alta > media > baixa)
        const urgenciaOrder = { emergencia: 4, alta: 3, media: 2, baixa: 1 }
        const urgenciaDiff = urgenciaOrder[b.urgencia] - urgenciaOrder[a.urgencia]
        
        if (urgenciaDiff !== 0) return urgenciaDiff
        
        // Depois por probabilidade
        return b.probabilidade - a.probabilidade
      })
      .slice(0, 5) // Top 5 hipóteses
  }

  // 🔬 GERAR EXAMES RECOMENDADOS
  private gerarExamesRecomendados(hipoteses: HipoteseSindromica[]): string[] {
    const exames = new Set<string>()
    
    hipoteses.forEach(hipotese => {
      hipotese.examesSugeridos.forEach(exame => exames.add(exame))
    })

    return Array.from(exames)
  }

  // ⚠️ DETERMINAR NÍVEL DE URGÊNCIA
  private determinarUrgencia(hipoteses: HipoteseSindromica[]): 'baixa' | 'media' | 'alta' | 'emergencia' {
    if (hipoteses.some(h => h.urgencia === 'emergencia')) return 'emergencia'
    if (hipoteses.some(h => h.urgencia === 'alta')) return 'alta'
    if (hipoteses.some(h => h.urgencia === 'media')) return 'media'
    return 'baixa'
  }

  // 💡 GERAR RECOMENDAÇÃO MÉDICA
  private gerarRecomendacaoMedica(hipoteses: HipoteseSindromica[], urgencia: string): string {
    const topHipotese = hipoteses[0]
    
    switch (urgencia) {
      case 'emergencia':
        return `🚨 URGENTE: ${topHipotese.nome} - Procure atendimento médico imediatamente. Sintomas indicam possível emergência médica.`
      
      case 'alta':
        return `⚠️ ALTA PRIORIDADE: ${topHipotese.nome} - Agende consulta médica em até 24-48 horas. Sintomas requerem avaliação médica urgente.`
      
      case 'media':
        return `📋 PRIORIDADE MÉDIA: ${topHipotese.nome} - Agende consulta médica em até 1 semana. Recomenda-se avaliação médica especializada.`
      
      default:
        return `✅ PRIORIDADE BAIXA: ${topHipotese.nome} - Pode agendar consulta médica de rotina. Sintomas não indicam urgência.`
    }
  }

  // 📝 GERAR OBSERVAÇÕES GERAIS
  private gerarObservacoesGerais(hipoteses: HipoteseSindromica[]): string {
    const observacoes = []
    
    if (hipoteses.length > 0) {
      observacoes.push(`Hipótese principal: ${hipoteses[0].nome} (${hipoteses[0].probabilidade}% de probabilidade)`)
    }
    
    if (hipoteses.length > 1) {
      observacoes.push(`Hipóteses secundárias: ${hipoteses.slice(1, 3).map(h => h.nome).join(', ')}`)
    }
    
    observacoes.push('Esta análise é baseada nos sintomas relatados e deve ser validada por um médico.')
    
    return observacoes.join('. ')
  }

  // 💾 SALVAR ANÁLISE NO BANCO
  private async salvarAnalise(sessionId: string, analise: AnaliseMedica): Promise<void> {
    try {
      const { error } = await supabase
        .from('analises_medicas')
        .insert({
          session_id: sessionId,
          analise_data: analise,
          created_at: new Date().toISOString()
        })

      if (error) {
        console.warn('⚠️ Erro ao salvar análise:', error)
      } else {
        console.log('✅ Análise salva no banco de dados')
      }
    } catch (error) {
      console.warn('⚠️ Erro ao salvar análise no banco:', error)
    }
  }

  // 🔍 BUSCAR ANÁLISES ANTERIORES
  async buscarAnalisesAnteriores(userId: string): Promise<AnaliseMedica[]> {
    try {
      const { data, error } = await supabase
        .from('analises_medicas')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) {
        console.error('❌ Erro ao buscar análises:', error)
        return []
      }

      return data?.map(item => item.analise_data) || []
    } catch (error) {
      console.error('❌ Erro ao buscar análises:', error)
      return []
    }
  }
}

// Exportar instância singleton
export const hipotesesSindromicasService = new HipotesesSindromicasService()

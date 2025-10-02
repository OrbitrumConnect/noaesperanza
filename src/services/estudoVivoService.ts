// 🚀 ESTUDO VIVO SERVICE - Dr. Ricardo Valença
// Sistema de análise científica e debate de trabalhos

import { supabase } from '../lib/supabase'

export interface DocumentMetadata {
  id: string
  title: string
  content: string
  area: 'nefrologia' | 'neurologia' | 'cannabis' | 'geral' | 'interdisciplinar'
  tipo_documento: 'artigo' | 'guideline' | 'estudo' | 'revisao' | 'caso-clinico' | 'conversa' | 'debate'
  nivel_evidencia: 'A' | 'B' | 'C' | 'D' | 'expert-opinion'
  tags: string[]
  autores: string[]
  data_publicacao?: string
  journal?: string
  doi?: string
  metodologia?: string
  resultados?: string
  conclusoes?: string
  limitacoes?: string
  conflitos_interesse?: string
  financiamento?: string
  keywords: string[]
  abstract?: string
  introducao?: string
  discussao?: string
  referencias: string[]
  citacoes: number
  impacto: 'alto' | 'medio' | 'baixo'
  relevancia_clinica: 'alta' | 'media' | 'baixa'
  qualidade_metodologica: number
  confiabilidade: number
  aplicabilidade_clinica: number
  created_at: string
}

export interface EstudoVivo {
  resumoExecutivo: {
    pontosChave: string[]
    conclusoes: string[]
    implicacoes: string[]
  }
  analiseMetodologica: {
    pontosFortes: string[]
    limitacoes: string[]
    qualidade: number
    confiabilidade: number
  }
  comparacaoLiteratura: {
    estudosSimilares: DocumentMetadata[]
    diferencasMetodologicas: string[]
    convergencias: string[]
    divergencias: string[]
  }
  gapsIdentificados: {
    limitacoesMetodologicas: string[]
    lacunasConhecimento: string[]
    necessidadePesquisa: string[]
  }
  implicacoesClinicas: {
    aplicabilidade: string[]
    limitacoesPraticas: string[]
    recomendacoes: string[]
  }
  propostaPesquisa: {
    questoesPendentes: string[]
    metodologiaSugerida: string[]
    potenciaisResultados: string[]
  }
}

export interface Debate {
  id?: string
  documento_id: string
  titulo: string
  area: string
  participantes: string[]
  pontosDebate: string[]
  argumentos: Record<string, string[]>
  contraArgumentos: Record<string, string[]>
  conclusoes: string[]
  sugestoesMelhoria: string[]
  propostaPesquisa: string
  nivelEvidenciaDebate: string
  relevancia: number
  tags: string[]
  dataDebate: string
}

export interface AnaliseQualidade {
  id?: string
  documento_id: string
  analista: string
  pontosFortes: string[]
  limitacoes: string[]
  qualidadeMetodologica: number
  confiabilidade: number
  aplicabilidadeClinica: number
  viesesIdentificados: string[]
  recomendacoes: string[]
  comparacaoLiteratura: string
  gapsIdentificados: string[]
  nivelEvidenciaFinal: string
  dataAnalise: string
}

export class EstudoVivoService {
  
  // 🔍 BUSCAR DOCUMENTOS CIENTÍFICOS COM FILTROS
  async buscarDocumentosCientificos(
    area?: string,
    tipo?: string,
    nivelEvidencia?: string,
    tags?: string[],
    limite: number = 10
  ): Promise<DocumentMetadata[]> {
    try {
      console.log('🔍 Buscando documentos científicos:', { area, tipo, nivelEvidencia, tags, limite })
      
      const { data, error } = await supabase.rpc('buscar_documentos_cientificos', {
        area_param: area,
        tipo_param: tipo,
        nivel_evidencia_param: nivelEvidencia,
        tags_param: tags,
        limite_param: limite
      })
      
      if (error) {
        console.error('Erro ao buscar documentos científicos:', error)
        return []
      }
      
      console.log('✅ Documentos científicos encontrados:', data?.length || 0)
      return data || []
    } catch (error) {
      console.error('Erro no serviço de busca:', error)
      return []
    }
  }
  
  // 🧠 GERAR ESTUDO VIVO COMPLETO
  async gerarEstudoVivo(pergunta: string, area?: string): Promise<EstudoVivo | null> {
    try {
      console.log('🧠 Gerando estudo vivo para:', pergunta)
      
      // 1. Buscar documentos relevantes
      const documentos = await this.buscarDocumentosCientificos(area, undefined, undefined, undefined, 5)
      
      if (documentos.length === 0) {
        console.log('⚠️ Nenhum documento encontrado para análise')
        return null
      }
      
      // 2. Analisar qualidade metodológica
      const analiseQualidade = await this.analisarQualidadeMetodologica(documentos)
      
      // 3. Comparar documentos
      const comparacao = await this.compararDocumentos(documentos)
      
      // 4. Identificar gaps
      const gaps = await this.identificarGaps(documentos)
      
      // 5. Gerar síntese estruturada
      const sintese = await this.gerarSinteseEstruturada(documentos, comparacao, gaps)
      
      console.log('✅ Estudo vivo gerado com sucesso')
      
      return {
        resumoExecutivo: sintese.resumoExecutivo,
        analiseMetodologica: analiseQualidade,
        comparacaoLiteratura: comparacao,
        gapsIdentificados: gaps,
        implicacoesClinicas: sintese.implicacoesClinicas,
        propostaPesquisa: sintese.propostaPesquisa
      }
    } catch (error) {
      console.error('Erro ao gerar estudo vivo:', error)
      return null
    }
  }
  
  // 📊 ANALISAR QUALIDADE METODOLÓGICA
  private async analisarQualidadeMetodologica(documentos: DocumentMetadata[]): Promise<any> {
    const pontosFortes: string[] = []
    const limitacoes: string[] = []
    let qualidadeMedia = 0
    let confiabilidadeMedia = 0
    
    documentos.forEach(doc => {
      qualidadeMedia += doc.qualidade_metodologica || 0
      confiabilidadeMedia += doc.confiabilidade || 0
      
      // Análise baseada em critérios
      if (doc.nivel_evidencia === 'A' || doc.nivel_evidencia === 'B') {
        pontosFortes.push(`Estudo com nível de evidência ${doc.nivel_evidencia}`)
      }
      
      if (doc.metodologia && doc.metodologia.length > 100) {
        pontosFortes.push('Metodologia bem descrita')
      }
      
      if (doc.limitacoes) {
        limitacoes.push(...doc.limitacoes.split(';'))
      }
    })
    
    qualidadeMedia = qualidadeMedia / documentos.length
    confiabilidadeMedia = confiabilidadeMedia / documentos.length
    
    return {
      pontosFortes: [...new Set(pontosFortes)],
      limitacoes: [...new Set(limitacoes)],
      qualidade: Math.round(qualidadeMedia),
      confiabilidade: Math.round(confiabilidadeMedia)
    }
  }
  
  // 🔄 COMPARAR DOCUMENTOS
  private async compararDocumentos(documentos: DocumentMetadata[]): Promise<any> {
    const diferencas: string[] = []
    const convergencias: string[] = []
    const divergencias: string[] = []
    
    // Comparar metodologias
    const metodologias = documentos.map(d => d.metodologia).filter(Boolean)
    if (metodologias.length > 1) {
      diferencas.push('Metodologias variadas entre os estudos')
    }
    
    // Comparar resultados
    const resultados = documentos.map(d => d.resultados).filter(Boolean)
    if (resultados.length > 1) {
      convergencias.push('Resultados convergentes em múltiplos estudos')
    }
    
    // Comparar conclusões
    const conclusoes = documentos.map(d => d.conclusoes).filter(Boolean)
    if (conclusoes.length > 1) {
      divergencias.push('Conclusões divergentes entre estudos')
    }
    
    return {
      estudosSimilares: documentos,
      diferencasMetodologicas: diferencas,
      convergencias: convergencias,
      divergencias: divergencias
    }
  }
  
  // 🔍 IDENTIFICAR GAPS
  private async identificarGaps(documentos: DocumentMetadata[]): Promise<any> {
    const limitacoesMetodologicas: string[] = []
    const lacunasConhecimento: string[] = []
    const necessidadePesquisa: string[] = []
    
    documentos.forEach(doc => {
      if (doc.limitacoes) {
        limitacoesMetodologicas.push(doc.limitacoes)
      }
      
      if (doc.nivel_evidencia === 'C' || doc.nivel_evidencia === 'D') {
        lacunasConhecimento.push(`Necessidade de estudos com maior nível de evidência (atual: ${doc.nivel_evidencia})`)
      }
      
      if (doc.qualidade_metodologica && doc.qualidade_metodologica < 7) {
        necessidadePesquisa.push('Estudos com metodologia mais rigorosa necessários')
      }
    })
    
    return {
      limitacoesMetodologicas: [...new Set(limitacoesMetodologicas)],
      lacunasConhecimento: [...new Set(lacunasConhecimento)],
      necessidadePesquisa: [...new Set(necessidadePesquisa)]
    }
  }
  
  // 📋 GERAR SÍNTESE ESTRUTURADA
  private async gerarSinteseEstruturada(documentos: DocumentMetadata[], comparacao: any, gaps: any): Promise<any> {
    const pontosChave: string[] = []
    const conclusoes: string[] = []
    const implicacoes: string[] = []
    const recomendacoes: string[] = []
    const questoesPendentes: string[] = []
    const metodologiaSugerida: string[] = []
    
    // Extrair pontos-chave dos documentos
    documentos.forEach(doc => {
      if (doc.abstract) {
        pontosChave.push(`Resumo: ${doc.abstract.substring(0, 200)}...`)
      }
      if (doc.conclusoes) {
        conclusoes.push(doc.conclusoes)
      }
    })
    
    // Gerar implicações clínicas
    if (documentos.some(d => d.relevancia_clinica === 'alta')) {
      implicacoes.push('Alta relevância clínica identificada')
    }
    
    // Gerar recomendações
    recomendacoes.push('Revisão sistemática recomendada')
    recomendacoes.push('Meta-análise dos resultados disponíveis')
    
    // Proposta de pesquisa
    questoesPendentes.push('Questões de segurança a longo prazo')
    questoesPendentes.push('Eficácia comparativa entre diferentes abordagens')
    
    metodologiaSugerida.push('Estudo randomizado controlado')
    metodologiaSugerida.push('Follow-up de longo prazo')
    
    return {
      resumoExecutivo: {
        pontosChave: pontosChave.slice(0, 3),
        conclusoes: conclusoes.slice(0, 3),
        implicacoes: implicacoes
      },
      implicacoesClinicas: {
        aplicabilidade: implicacoes,
        limitacoesPraticas: gaps.limitacoesMetodologicas,
        recomendacoes: recomendacoes
      },
      propostaPesquisa: {
        questoesPendentes: questoesPendentes,
        metodologiaSugerida: metodologiaSugerida,
        potenciaisResultados: ['Redução de efeitos adversos', 'Melhoria da qualidade de vida']
      }
    }
  }
  
  // 💬 INICIAR DEBATE CIENTÍFICO
  async iniciarDebate(documentoId: string): Promise<Debate | null> {
    try {
      console.log('💬 Iniciando debate científico para documento:', documentoId)
      
      // Buscar documento
      const { data: documento } = await supabase
        .from('documentos_mestres')
        .select('*')
        .eq('id', documentoId)
        .single()
      
      if (!documento) {
        console.error('Documento não encontrado')
        return null
      }
      
      // Gerar pontos de debate
      const pontosDebate = await this.gerarPontosDebate(documento)
      const argumentos = await this.gerarArgumentos(documento)
      const contraArgumentos = await this.gerarContraArgumentos(documento)
      const sugestoes = await this.gerarSugestoesMelhoria(documento)
      
      const debate: Debate = {
        documento_id: documentoId,
        titulo: `Debate: ${documento.title}`,
        area: documento.area || 'geral',
        participantes: ['Dr. Ricardo', 'Nôa Esperanza'],
        pontosDebate: pontosDebate,
        argumentos: argumentos,
        contraArgumentos: contraArgumentos,
        conclusoes: [],
        sugestoesMelhoria: sugestoes,
        propostaPesquisa: '',
        nivelEvidenciaDebate: documento.nivel_evidencia || 'expert-opinion',
        relevancia: documento.qualidade_metodologica || 5,
        tags: documento.tags || [],
        dataDebate: new Date().toISOString()
      }
      
      console.log('✅ Debate científico iniciado')
      return debate
    } catch (error) {
      console.error('Erro ao iniciar debate:', error)
      return null
    }
  }
  
  // 🎯 GERAR PONTOS DE DEBATE
  private async gerarPontosDebate(documento: any): Promise<string[]> {
    const pontos: string[] = []
    
    // Baseado no tipo de documento
    if (documento.tipo_documento === 'estudo') {
      pontos.push('Metodologia adequada para a pergunta de pesquisa?')
      pontos.push('Tamanho amostral suficiente?')
      pontos.push('Critérios de inclusão/exclusão apropriados?')
    }
    
    if (documento.tipo_documento === 'revisao') {
      pontos.push('Critérios de seleção dos estudos adequados?')
      pontos.push('Análise de vieses realizada?')
      pontos.push('Síntese dos resultados consistente?')
    }
    
    // Baseado no nível de evidência
    if (documento.nivel_evidencia === 'C' || documento.nivel_evidencia === 'D') {
      pontos.push('Como melhorar o nível de evidência?')
    }
    
    return pontos
  }
  
  // ✅ GERAR ARGUMENTOS
  private async gerarArgumentos(documento: any): Promise<Record<string, string[]>> {
    const argumentos: Record<string, string[]> = {}
    
    argumentos['metodologia'] = []
    argumentos['resultados'] = []
    argumentos['conclusoes'] = []
    
    if (documento.metodologia) {
      argumentos['metodologia'].push('Metodologia bem descrita e estruturada')
    }
    
    if (documento.nivel_evidencia === 'A' || documento.nivel_evidencia === 'B') {
      argumentos['metodologia'].push('Alto nível de evidência científica')
    }
    
    if (documento.resultados) {
      argumentos['resultados'].push('Resultados claramente apresentados')
    }
    
    return argumentos
  }
  
  // ❌ GERAR CONTRA-ARGUMENTOS
  private async gerarContraArgumentos(documento: any): Promise<Record<string, string[]>> {
    const contraArgumentos: Record<string, string[]> = {}
    
    contraArgumentos['metodologia'] = []
    contraArgumentos['resultados'] = []
    contraArgumentos['conclusoes'] = []
    
    if (documento.limitacoes) {
      contraArgumentos['metodologia'].push(`Limitado por: ${documento.limitacoes}`)
    }
    
    if (documento.nivel_evidencia === 'C' || documento.nivel_evidencia === 'D') {
      contraArgumentos['metodologia'].push('Nível de evidência limitado')
    }
    
    if (documento.qualidade_metodologica && documento.qualidade_metodologica < 7) {
      contraArgumentos['resultados'].push('Qualidade metodológica pode comprometer resultados')
    }
    
    return contraArgumentos
  }
  
  // 💡 GERAR SUGESTÕES DE MELHORIA
  private async gerarSugestoesMelhoria(documento: any): Promise<string[]> {
    const sugestoes: string[] = []
    
    if (documento.nivel_evidencia === 'C' || documento.nivel_evidencia === 'D') {
      sugestoes.push('Realizar estudo com maior nível de evidência (A ou B)')
    }
    
    if (documento.qualidade_metodologica && documento.qualidade_metodologica < 8) {
      sugestoes.push('Melhorar rigor metodológico')
    }
    
    if (!documento.metodologia || documento.metodologia.length < 100) {
      sugestoes.push('Descrever metodologia com mais detalhes')
    }
    
    if (!documento.limitacoes) {
      sugestoes.push('Discutir limitações do estudo')
    }
    
    sugestoes.push('Considerar follow-up de longo prazo')
    sugestoes.push('Avaliar custo-efetividade')
    
    return sugestoes
  }
  
  // 💾 SALVAR DEBATE CIENTÍFICO
  async salvarDebate(debate: Debate): Promise<boolean> {
    try {
      console.log('💾 Salvando debate científico:', debate.titulo)
      
      const { error } = await supabase.rpc('salvar_debate_cientifico', {
        documento_id_param: debate.documento_id,
        titulo_param: debate.titulo,
        area_param: debate.area,
        pontos_debatidos_param: JSON.stringify(debate.pontosDebate),
        argumentos_param: JSON.stringify(debate.argumentos),
        conclusoes_param: debate.conclusoes.join('; '),
        sugestoes_param: debate.sugestoesMelhoria
      })
      
      if (error) {
        console.error('Erro ao salvar debate:', error)
        return false
      }
      
      console.log('✅ Debate científico salvo com sucesso')
      return true
    } catch (error) {
      console.error('Erro no serviço de salvamento:', error)
      return false
    }
  }
  
  // 📊 SALVAR ANÁLISE DE QUALIDADE
  async salvarAnaliseQualidade(analise: AnaliseQualidade): Promise<boolean> {
    try {
      console.log('📊 Salvando análise de qualidade:', analise.documento_id)
      
      const { error } = await supabase
        .from('analises_qualidade')
        .insert({
          documento_id: analise.documento_id,
          analista: analise.analista,
          pontos_fortes: analise.pontosFortes,
          limitacoes: analise.limitacoes,
          qualidade_metodologica: analise.qualidadeMetodologica,
          confiabilidade: analise.confiabilidade,
          aplicabilidade_clinica: analise.aplicabilidadeClinica,
          vieses_identificados: analise.viesesIdentificados,
          recomendacoes: analise.recomendacoes,
          comparacao_literatura: analise.comparacaoLiteratura,
          gaps_identificados: analise.gapsIdentificados,
          nivel_evidencia_final: analise.nivelEvidenciaFinal
        })
      
      if (error) {
        console.error('Erro ao salvar análise de qualidade:', error)
        return false
      }
      
      console.log('✅ Análise de qualidade salva com sucesso')
      return true
    } catch (error) {
      console.error('Erro no serviço de análise:', error)
      return false
    }
  }
  
  // 🧠 BUSCAR DEBATES ANTERIORES
  async buscarDebatesAnteriores(area?: string, limite: number = 5): Promise<Debate[]> {
    try {
      console.log('🧠 Buscando debates anteriores:', { area, limite })
      
      let query = supabase
        .from('debates_cientificos')
        .select('*')
        .order('data_debate', { ascending: false })
        .limit(limite)
      
      if (area) {
        query = query.eq('area', area)
      }
      
      const { data, error } = await query
      
      if (error) {
        console.error('Erro ao buscar debates:', error)
        return []
      }
      
      console.log('✅ Debates encontrados:', data?.length || 0)
      return data || []
    } catch (error) {
      console.error('Erro no serviço de busca de debates:', error)
      return []
    }
  }
}

export const estudoVivoService = new EstudoVivoService()

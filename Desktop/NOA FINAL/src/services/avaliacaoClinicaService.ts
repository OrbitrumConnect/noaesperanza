// 🩺 SERVIÇO DE AVALIAÇÃO CLÍNICA INICIAL
// Gerencia o fluxo completo da avaliação IMRE com contexto inteligente

import { supabase } from '../integrations/supabase/client'

export interface AvaliacaoContext {
  sessionId: string
  userId: string
  etapaAtual: number
  variaveisCapturadas: {
    nome?: string
    queixaPrincipal?: string
    queixasLista?: string[]
    localizacao?: string
    tempoEvolucao?: string
    caracteristicas?: string
    sintomasAssociados?: string[]
    fatoresMelhora?: string[]
    fatoresPiora?: string[]
    historiaMedica?: string[]
    familiaMae?: string[]
    familiaPai?: string[]
    habitos?: string[]
    alergias?: string
    medicacaoRegular?: string[]
    medicacaoEsporadica?: string[]
  }
  respostasCompletas: Array<{
    etapa: string
    pergunta: string
    resposta: string
    timestamp: Date
  }>
  iniciadoEm: Date
  atualizadoEm: Date
}

export class AvaliacaoClinicaService {
  private contextos: Map<string, AvaliacaoContext> = new Map()

  // 🎯 INICIAR NOVA AVALIAÇÃO
  async iniciarAvaliacao(userId: string, sessionId?: string): Promise<AvaliacaoContext> {
    const avaliacaoSessionId = sessionId || crypto.randomUUID()
    
    const contexto: AvaliacaoContext = {
      sessionId: avaliacaoSessionId,
      userId,
      etapaAtual: 0,
      variaveisCapturadas: {},
      respostasCompletas: [],
      iniciadoEm: new Date(),
      atualizadoEm: new Date()
    }
    
    this.contextos.set(avaliacaoSessionId, contexto)
    
    // Salvar no Supabase
    await supabase.from('avaliacoes_em_andamento').insert({
      session_id: avaliacaoSessionId,
      user_id: userId,
      current_block: 0,
      status: 'iniciada',
      responses: contexto
    })
    
    console.log('✅ Avaliação iniciada:', avaliacaoSessionId)
    return contexto
  }

  // 📝 PROCESSAR RESPOSTA DO USUÁRIO
  async processarResposta(
    sessionId: string,
    resposta: string,
    blocoAtual: any
  ): Promise<AvaliacaoContext> {
    const contexto = this.contextos.get(sessionId)
    if (!contexto) throw new Error('Contexto não encontrado')

    // Se blocoAtual é o contexto, usar etapaAtual
    const etapaAtual = blocoAtual?.etapaAtual || contexto.etapaAtual

    // Extrair variáveis da resposta
    this.extrairVariaveis(contexto, etapaAtual, resposta)

    // Salvar resposta completa
    contexto.respostasCompletas.push({
      etapa: etapaAtual,
      pergunta: blocoAtual?.texto || `Pergunta ${etapaAtual}`,
      resposta,
      timestamp: new Date()
    })

    // Avançar etapa
    contexto.etapaAtual++
    contexto.atualizadoEm = new Date()

    // Atualizar no Supabase
    await supabase
      .from('avaliacoes_em_andamento')
      .update({
        etapa_atual: contexto.etapaAtual,
        context: contexto,
        updated_at: new Date().toISOString()
      })
      .eq('session_id', sessionId)

    this.contextos.set(sessionId, contexto)
    
    console.log('📝 Resposta processada. Etapa:', contexto.etapaAtual)
    return contexto
  }

  // 🧠 EXTRAIR VARIÁVEIS DA RESPOSTA
  private extrairVariaveis(contexto: AvaliacaoContext, etapa: string, resposta: string) {
    const lower = resposta.toLowerCase()

    switch (etapa) {
      case 'abertura':
        // Extrair nome
        const nomeMatch = resposta.match(/(?:me chamo|sou|nome é|meu nome)\s+([A-Za-zÀ-ú\s]+)/i)
        if (nomeMatch) {
          contexto.variaveisCapturadas.nome = nomeMatch[1].trim()
        }
        break

      case 'motivo_detalhado':
        // Primeira queixa mencionada
        if (!contexto.variaveisCapturadas.queixasLista) {
          contexto.variaveisCapturadas.queixasLista = []
        }
        contexto.variaveisCapturadas.queixasLista.push(resposta)
        break

      case 'queixa_principal':
        // Definir queixa principal
        contexto.variaveisCapturadas.queixaPrincipal = resposta
        break

      case 'localizacao':
        contexto.variaveisCapturadas.localizacao = resposta
        break

      case 'tempo_evolucao':
        contexto.variaveisCapturadas.tempoEvolucao = resposta
        break

      case 'caracteristicas':
        contexto.variaveisCapturadas.caracteristicas = resposta
        break

      case 'sintomas_associados':
        if (!contexto.variaveisCapturadas.sintomasAssociados) {
          contexto.variaveisCapturadas.sintomasAssociados = []
        }
        contexto.variaveisCapturadas.sintomasAssociados.push(resposta)
        break

      case 'fatores_melhora':
        if (!contexto.variaveisCapturadas.fatoresMelhora) {
          contexto.variaveisCapturadas.fatoresMelhora = []
        }
        contexto.variaveisCapturadas.fatoresMelhora.push(resposta)
        break

      case 'fatores_piora':
        if (!contexto.variaveisCapturadas.fatoresPiora) {
          contexto.variaveisCapturadas.fatoresPiora = []
        }
        contexto.variaveisCapturadas.fatoresPiora.push(resposta)
        break
    }
  }

  // 🔄 SUBSTITUIR VARIÁVEIS NA PERGUNTA (VERSÃO ROBUSTA)
  substituirVariaveis(texto: string, contexto: AvaliacaoContext): string {
    let textoFinal = texto

    // 1. SUBSTITUIR [queixa] - Prioridade máxima
    const queixa = contexto.variaveisCapturadas.queixaPrincipal || 
                   contexto.variaveisCapturadas.queixasLista?.[0] || 
                   'isso';
    textoFinal = textoFinal.replace(/\[queixa\]/gi, queixa);

    // 2. SUBSTITUIR [nome]
    if (contexto.variaveisCapturadas.nome) {
      textoFinal = textoFinal.replace(/\[nome\]/gi, contexto.variaveisCapturadas.nome);
    }

    // 3. SUBSTITUIR [sintomas]
    if (contexto.variaveisCapturadas.sintomasAssociados?.length) {
      const sintomas = contexto.variaveisCapturadas.sintomasAssociados.join(', ');
      textoFinal = textoFinal.replace(/\[sintomas\]/gi, sintomas);
    }

    // 4. SUBSTITUIR [localizacao]
    if (contexto.variaveisCapturadas.localizacao) {
      textoFinal = textoFinal.replace(/\[localizacao\]/gi, contexto.variaveisCapturadas.localizacao);
    }

    // 5. FALLBACK: Se ainda tem variável não substituída, usar "isso"
    textoFinal = textoFinal.replace(/\[(\w+)\]/g, (match, varName) => {
      console.warn(`⚠️ Variável não encontrada: ${varName}`);
      return 'isso';
    });

    // 6. LOG para debug (caso haja problemas)
    if (texto !== textoFinal) {
      console.log('🔧 Substituição de variáveis:', {
        original: texto,
        resultado: textoFinal,
        variaveis: contexto.variaveisCapturadas
      });
    }

    return textoFinal;
  }

  // 📊 GERAR RELATÓRIO FINAL
  async gerarRelatorio(sessionId: string): Promise<any> {
    const contexto = this.contextos.get(sessionId)
    if (!contexto) throw new Error('Contexto não encontrado')

    const relatorio = {
      sessionId: contexto.sessionId,
      userId: contexto.userId,
      dataAvaliacao: contexto.iniciadoEm,
      duracaoMinutos: Math.round((contexto.atualizadoEm.getTime() - contexto.iniciadoEm.getTime()) / 60000),
      
      // DADOS DO PACIENTE
      dadosPaciente: {
        nome: contexto.variaveisCapturadas.nome || 'Não informado',
        email: null // Buscar do auth
      },
      
      // QUEIXA PRINCIPAL
      queixaPrincipal: {
        descricao: contexto.variaveisCapturadas.queixaPrincipal,
        todasQueixas: contexto.variaveisCapturadas.queixasLista,
        localizacao: contexto.variaveisCapturadas.localizacao,
        tempoEvolucao: contexto.variaveisCapturadas.tempoEvolucao,
        caracteristicas: contexto.variaveisCapturadas.caracteristicas
      },
      
      // SINTOMAS E FATORES
      sintomas: {
        associados: contexto.variaveisCapturadas.sintomasAssociados,
        fatoresMelhora: contexto.variaveisCapturadas.fatoresMelhora,
        fatoresPiora: contexto.variaveisCapturadas.fatoresPiora
      },
      
      // HISTÓRICO
      historico: {
        medico: contexto.variaveisCapturadas.historiaMedica,
        familiarMaterno: contexto.variaveisCapturadas.familiaMae,
        familiarPaterno: contexto.variaveisCapturadas.familiaPai,
        habitos: contexto.variaveisCapturadas.habitos,
        alergias: contexto.variaveisCapturadas.alergias,
        medicacaoRegular: contexto.variaveisCapturadas.medicacaoRegular,
        medicacaoEsporadica: contexto.variaveisCapturadas.medicacaoEsporadica
      },
      
      // METADADOS
      respostasCompletas: contexto.respostasCompletas,
      totalPerguntas: 28,
      perguntasRespondidas: contexto.respostasCompletas.length,
      completude: Math.round((contexto.respostasCompletas.length / 28) * 100)
    }

    // Salvar relatório no banco
    const { data, error } = await supabase
      .from('relatorios_avaliacao_inicial')
      .insert({
        session_id: sessionId,
        user_id: contexto.userId,
        relatorio_data: relatorio,
        status: 'completo',
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('❌ Erro ao salvar relatório:', error)
      throw error
    }

    console.log('✅ Relatório gerado e salvo:', data)
    
    // Limpar contexto da memória
    this.contextos.delete(sessionId)
    
    return relatorio
  }

  // 📊 SALVAR PARA APRENDIZADO CONTÍNUO
  async salvarParaAprendizado(sessionId: string) {
    const contexto = this.contextos.get(sessionId)
    if (!contexto) return

    // Salvar cada interação como aprendizado
    for (const resposta of contexto.respostasCompletas) {
      await supabase.rpc('save_ai_learning', {
        keyword_param: resposta.etapa,
        context_param: 'avaliacao_clinica_inicial',
        user_message_param: resposta.resposta,
        ai_response_param: resposta.pergunta,
        category_param: 'clinical_evaluation',
        confidence_score_param: 0.95,
        user_id_param: contexto.userId
      })
    }

    console.log('✅ Avaliação salva para aprendizado contínuo')
  }

  // 🔍 BUSCAR CONTEXTO EXISTENTE
  getContexto(sessionId: string): AvaliacaoContext | undefined {
    return this.contextos.get(sessionId)
  }

  // 📝 OBTER PRÓXIMA PERGUNTA
  async getProximaPergunta(etapaAtual: number): Promise<string> {
    try {
      const { data, error } = await supabase
        .rpc('get_imre_block', { block_number: etapaAtual + 1 })
      
      if (error) {
        console.error('❌ Erro ao buscar próxima pergunta:', error)
        return 'Desculpe, houve um erro ao carregar a próxima pergunta.'
      }
      
      if (!data || data.length === 0) {
        return '🎉 Avaliação clínica concluída! Obrigado por participar.'
      }
      
      const bloco = data[0]
      return bloco.block_prompt || 'Pergunta não encontrada.'
    } catch (error) {
      console.error('❌ Erro inesperado ao buscar próxima pergunta:', error)
      return 'Desculpe, houve um erro inesperado.'
    }
  }
}

// Exportar instância singleton
export const avaliacaoClinicaService = new AvaliacaoClinicaService()


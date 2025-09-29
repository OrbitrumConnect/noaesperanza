// clinicalAgent.ts - Sistema completo de avaliação clínica triaxial integrado com Supabase

import { supabase } from '../integrations/supabase/client'

interface Etapa {
  id: string
  texto: string
  repetir?: boolean
  condicional?: 'ateNegar' // repete até o usuário negar
  variavel?: string // nome do campo para armazenar resposta
}

interface Avaliacao {
  titulo: string
  conteudo: string
}

const etapas: Etapa[] = [
  {
    id: 'inicio',
    texto: 'Olá! Eu sou Nôa Esperanza. Por favor, apresente-se também e vamos iniciar a sua avaliação inicial para consultas com Dr. Ricardo Valença.',
    variavel: 'apresentacao',
  },
  {
    id: 'usoCanabis',
    texto: 'Você já utilizou canabis medicinal?',
    variavel: 'usoCanabis',
  },
  {
    id: 'motivo',
    texto: 'O que trouxe você à nossa avaliação hoje?',
    repetir: true,
    condicional: 'ateNegar',
    variavel: 'motivos',
  },
  {
    id: 'principal',
    texto: 'De todas essas questões, qual mais o(a) incomoda?',
    variavel: 'queixaPrincipal',
  },
  {
    id: 'onde',
    texto: 'Vamos explorar suas queixas mais detalhadamente. Onde você sente a queixa principal?',
    variavel: 'onde',
  },
  {
    id: 'quando',
    texto: 'Quando essa queixa começou?',
    variavel: 'quando',
  },
  {
    id: 'como',
    texto: 'Como é a queixa?',
    variavel: 'como',
  },
  {
    id: 'sintomasAssociados',
    texto: 'O que mais você sente quando está com a queixa?',
    variavel: 'sintomasAssociados',
  },
  {
    id: 'melhora',
    texto: 'O que parece melhorar a queixa?',
    variavel: 'melhora',
  },
  {
    id: 'piora',
    texto: 'O que parece piorar a queixa?',
    variavel: 'piora',
  },
  {
    id: 'historicoDoenca',
    texto: 'E agora, sobre sua vida até aqui, quais as questões de saúde que você já viveu? Vamos ordenar do mais antigo para o mais recente, o que veio primeiro?',
    repetir: true,
    condicional: 'ateNegar',
    variavel: 'historicoDoenca',
  },
  {
    id: 'familiaMae',
    texto: 'Começando pela parte da sua mãe, quais as questões de saúde dela e desse lado da família?',
    repetir: true,
    condicional: 'ateNegar',
    variavel: 'familiaMae',
  },
  {
    id: 'familiaPai',
    texto: 'E por parte de seu pai?',
    repetir: true,
    condicional: 'ateNegar',
    variavel: 'familiaPai',
  },
  {
    id: 'habitos',
    texto: 'Além dos hábitos de vida que já verificamos em nossa conversa, que outros hábitos você acha importante mencionar?',
    repetir: true,
    condicional: 'ateNegar',
    variavel: 'habitos',
  },
  {
    id: 'alergias',
    texto: 'Você tem alguma alergia (mudança de tempo, medicação, poeira...)?',
    variavel: 'alergias',
  },
  {
    id: 'medicacaoRegular',
    texto: 'Quais as medicações que você utiliza regularmente?',
    variavel: 'medicacaoRegular',
  },
  {
    id: 'medicacaoEsporadica',
    texto: 'Quais as medicações você utiliza esporadicamente (de vez em quando) e porque utiliza?',
    variavel: 'medicacaoEsporadica',
  },
  {
    id: 'fechamento',
    texto: 'Vamos revisar a sua história rapidamente para garantir que não perdemos nenhum detalhe importante.',
  },
  {
    id: 'validacao',
    texto: 'Você concorda com o meu entendimento? Há mais alguma coisa que gostaria de adicionar sobre a história que construímos?',
    variavel: 'validacaoUsuario',
  },
  {
    id: 'final',
    texto: 'Essa é uma avaliação inicial de acordo com o método desenvolvido pelo Dr. Ricardo Valença com o objetivo de aperfeiçoar o seu atendimento. Ao final, recomendo a marcação de uma consulta com o Dr. Ricardo Valença pelo site.\n\nSeu relatório resumido está pronto para download.',
  },
]

let etapaAtual = 0
let respostas: Record<string, any> = {}
let sessionId: string = ''
let evaluationId: string | null = null
const bancoDeAvaliacoes: Avaliacao[] = []

export const clinicalAgent = {
  // Sistema de avaliação clínica triaxial
  async executarFluxo(mensagem: string): Promise<string | { iniciar: boolean; mensagem: string }> {
    const etapa = etapas[etapaAtual]

    if (!etapa) {
      // Finaliza avaliação no Supabase
      if (evaluationId) {
        try {
          await supabase
            .from('avaliacoes_iniciais')
            .update({
              status: 'completed',
              completed_at: new Date().toISOString()
            })
            .eq('id', evaluationId)
          console.log('✅ Avaliação finalizada no Supabase')
        } catch (error) {
          console.error('Erro ao finalizar avaliação:', error)
        }
      }
      return '✅ Avaliação finalizada. Obrigado!'
    }

    if (etapa.variavel) {
      const valorAnterior = respostas[etapa.variavel]
      if (etapa.repetir && etapa.condicional === 'ateNegar') {
        if (mensagem.toLowerCase().includes('nada') || mensagem.toLowerCase().includes('não')) {
          etapaAtual += 1
        } else {
          respostas[etapa.variavel] = valorAnterior
            ? [...valorAnterior, mensagem]
            : [mensagem]
          
          // Salva resposta no Supabase
          await this.salvarRespostaNoSupabase(etapa.variavel, respostas[etapa.variavel])
          return etapa.texto
        }
      } else {
        respostas[etapa.variavel] = mensagem
        etapaAtual += 1
        
        // Salva resposta no Supabase
        await this.salvarRespostaNoSupabase(etapa.variavel, mensagem)
        
        // Continua para próxima etapa
        const proximaEtapa = etapas[etapaAtual]
        console.log('🩺 Próxima etapa encontrada:', proximaEtapa)
        if (proximaEtapa) {
          console.log('🩺 Retornando próxima pergunta:', proximaEtapa.texto)
          return proximaEtapa.texto
        }
      }
    } else {
      etapaAtual += 1
    }

    // Atualiza etapa atual no Supabase
    if (evaluationId) {
      try {
        await supabase
          .from('avaliacoes_iniciais')
          .update({
            etapa_atual: etapas[etapaAtual]?.id || 'finalizada'
          })
          .eq('id', evaluationId)
      } catch (error) {
        console.error('Erro ao atualizar etapa:', error)
      }
    }

    const proximaEtapa = etapas[etapaAtual]
    if (!proximaEtapa) {
      // Finaliza avaliação no Supabase
      if (evaluationId) {
        try {
          await supabase
            .from('avaliacoes_iniciais')
            .update({
              status: 'completed',
              completed_at: new Date().toISOString()
            })
            .eq('id', evaluationId)
          console.log('✅ Avaliação finalizada no Supabase')
        } catch (error) {
          console.error('Erro ao finalizar avaliação:', error)
        }
      }
      return '✅ Avaliação finalizada. Obrigado!'
    }

    return proximaEtapa.texto
  },

  // Salva resposta no Supabase
  async salvarRespostaNoSupabase(campo: string, valor: any) {
    if (!evaluationId) return

    try {
      // Mapeia campos do clinicalAgent para campos da tabela
      const campoMapeado = this.mapearCampo(campo)
      const updateData: any = {}
      updateData[campoMapeado] = valor

      console.log(`🩺 Salvando: ${campo} → ${campoMapeado} = ${valor}`)

      await supabase
        .from('avaliacoes_iniciais')
        .update(updateData)
        .eq('id', evaluationId)
      
      console.log(`✅ Resposta salva no Supabase: ${campoMapeado} = ${valor}`)
    } catch (error) {
      console.error('Erro ao salvar resposta no Supabase:', error)
    }
  },

  // Mapeia campos do clinicalAgent para campos da tabela
  mapearCampo(campo: string): string {
    const mapeamento: Record<string, string> = {
      'apresentacao': 'apresentacao',
      'usoCanabis': 'abertura_exponencial', // Campo para cannabis
      'motivos': 'lista_indiciaria',
      'queixaPrincipal': 'queixa_principal',
      'onde': 'localizacao_queixa',
      'quando': 'inicio_queixa',
      'como': 'qualidade_queixa',
      'sintomasAssociados': 'sintomas_associados',
      'melhora': 'fatores_melhora',
      'piora': 'fatores_piora',
      'historicoDoenca': 'historia_patologica',
      'familiaMae': 'historia_familiar_mae',
      'familiaPai': 'historia_familiar_pai',
      'habitos': 'habitos_vida',
      'alergias': 'alergias',
      'medicacaoRegular': 'medicacoes_continuas',
      'medicacaoEsporadica': 'medicacoes_eventuais',
      'validacaoUsuario': 'concordancia_final'
    }
    
    return mapeamento[campo] || campo
  },

  // Detecta se deve iniciar avaliação clínica
  async detectarInicioAvaliacao(mensagem: string): Promise<{ iniciar: boolean; mensagem: string } | null> {
    const lower = mensagem.toLowerCase().trim()
    
    // Palavras-chave para iniciar avaliação
    const palavrasChave = [
      'avaliação inicial',
      'avaliação clínica',
      'consulta com dr ricardo',
      'consulta com dr. ricardo',
      'consulta com ricardo valença',
      'quero fazer uma avaliação',
      'preciso de uma consulta',
      'avaliação triaxial',
      'iniciar avaliação'
    ]

    const deveIniciar = palavrasChave.some(palavra => lower.includes(palavra))
    
    if (deveIniciar) {
      // Reset do fluxo
      etapaAtual = 0
      respostas = {}
      sessionId = `avaliacao_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      // Cria nova avaliação no Supabase
      try {
        const { data, error } = await supabase
          .from('avaliacoes_iniciais')
          .insert({
            session_id: sessionId,
            status: 'in_progress',
            etapa_atual: 'abertura'
          })
          .select()
          .single()
        
        if (error) {
          console.error('Erro ao criar avaliação no Supabase:', error)
        } else {
          evaluationId = data.id
          console.log('✅ Avaliação criada no Supabase:', evaluationId)
        }
      } catch (error) {
        console.error('Erro ao conectar com Supabase:', error)
      }
      
      return {
        iniciar: true,
        mensagem: etapas[0].texto
      }
    }

    return null
  },

  // Comandos de gerenciamento de avaliações
  async executarAcao(message: string): Promise<string> {
    const lower = message.toLowerCase().trim()

    // Criar avaliação
    if (lower.includes('criar avaliação')) {
      const match = message.match(/criar avaliação (.+?) com o conteúdo (.+)/i)
      if (!match || match.length < 3) {
        return '⚠️ Para criar uma avaliação, diga: "criar avaliação Nome com o conteúdo Texto..."'
      }

      const titulo = match[1].trim()
      const conteudo = match[2].trim()
      bancoDeAvaliacoes.push({ titulo, conteudo })

      return `✅ Avaliação "${titulo}" criada com sucesso.`
    }

    // Editar avaliação
    if (lower.includes('editar avaliação')) {
      const match = message.match(/editar avaliação (.+?) com o conteúdo (.+)/i)
      if (!match || match.length < 3) {
        return '⚠️ Para editar uma avaliação, diga: "editar avaliação Nome com o conteúdo Texto..."'
      }

      const titulo = match[1].trim()
      const novoConteudo = match[2].trim()
      const avaliacao = bancoDeAvaliacoes.find(a => a.titulo === titulo)

      if (!avaliacao) {
        return `❌ Avaliação "${titulo}" não encontrada.`
      }

      avaliacao.conteudo = novoConteudo
      return `✅ Avaliação "${titulo}" atualizada com sucesso.`
    }

    // Listar avaliações
    if (lower.includes('listar avaliações')) {
      if (bancoDeAvaliacoes.length === 0) {
        return '📭 Nenhuma avaliação disponível ainda.'
      }

      const lista = bancoDeAvaliacoes
        .map((a, i) => `${i + 1}. ${a.titulo}`)
        .join('\n')

      return `📋 Avaliações disponíveis:\n${lista}`
    }

    return '⚠️ Comando de avaliação não reconhecido. Use: criar, editar ou listar avaliações.'
  },

  // Retorna as respostas coletadas
  getRespostas() {
    return respostas
  },

  // Retorna a etapa atual
  getEtapaAtual() {
    return etapaAtual
  },

  // Retorna todas as etapas
  getEtapas() {
    return etapas
  }
}
  
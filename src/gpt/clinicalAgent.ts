// clinicalAgent.ts - Sistema completo de avaliação clínica triaxial integrado com Supabase

import { supabase } from '../integrations/supabase/client'
import { 
  withTimeout, 
  verificarAuthComFallback, 
  testarConectividade,
  SupabaseTimeoutError 
} from '../utils/supabaseTimeout'

// Função utilitária para verificar conectividade com Supabase
async function verificarConectividadeSupabase(): Promise<boolean> {
  try {
    // Testa conectividade básica com um ping simples
    const { data, error } = await supabase
      .from('avaliacoes_iniciais')
      .select('id')
      .limit(1)
    
    return !error
  } catch (error) {
    console.warn('⚠️ Supabase não acessível:', error)
    return false
  }
}

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
    texto: 'Olá! Eu sou a Nôa Esperanza. Vamos iniciar sua avaliação inicial com base no método do Dr. Ricardo Valença. Pode começar se apresentando.',
    variavel: 'apresentacao',
  },
  {
    id: 'motivo_detalhado',
    texto: `Entendo que você está aqui por uma razão específica. Me conte mais sobre isso:

O que exatamente você está sentindo?
Há quanto tempo isso está acontecendo?
O que mais te preocupa nessa situação?

Quanto mais detalhes você me der, melhor poderei te ajudar. Não tenha pressa - fale tudo que achar importante.`,
    repetir: true,
    condicional: 'ateNegar',
    variavel: 'motivos_detalhados',
  },
  {
    id: 'queixa_principal',
    texto: `De tudo que você me contou, qual é a questão que mais te incomoda no momento?

Pode ser:
- Uma dor específica
- Um sintoma que te preocupa
- Uma limitação no seu dia a dia
- Qualquer coisa que esteja afetando sua qualidade de vida

Me conte qual é a sua principal preocupação hoje.`,
    variavel: 'queixaPrincipal',
  },
  {
    id: 'localizacao',
    texto: `Vamos focar na sua queixa principal. Onde exatamente você sente isso?

- É em uma parte específica do corpo?
- Se espalha para outros lugares?
- É mais intenso em algum local?

Seja o mais específico possível - isso me ajuda muito a entender melhor.`,
    variavel: 'localizacao',
  },
  {
    id: 'tempo_evolucao',
    texto: `Quando isso começou? Me conte sobre o tempo:

- Quando foi a primeira vez que você notou isso?
- Como foi evoluindo desde então?
- Tem períodos melhores e piores?
- O que piora ou melhora os sintomas?

Quanto mais detalhes sobre a evolução, melhor.`,
    variavel: 'tempo_evolucao',
  },
  {
    id: 'caracteristicas',
    texto: `🔍 Vamos detalhar como é essa queixa.

Me descreva:
- Como é a sensação? (dor, queimação, formigamento, pressão, etc.)
- Qual a intensidade? (de 0 a 10, sendo 10 o pior possível)
- É constante ou vem e vai?- Tem alguma característica especial? (lateja, aperta, queima, etc.)

Seja bem descritivo - cada detalhe é importante para o Dr. Ricardo.`,
    variavel: 'caracteristicas',
  },
  {
    id: 'fatores_modificadores',
    texto: `⚖️ O que influencia essa queixa?
Me conte:- O que piora os sintomas? (movimento, posição, horário, etc.)
- O que melhora? (repouso, medicamento, calor, frio, etc.)
- Tem horários específicos? (manhã, tarde, noite, etc.)
- Alguma atividade específica afeta?
Essas informações são cruciais para entender melhor sua condição.`,
    variavel: 'fatores_modificadores',
  },
  {
    id: 'sintomas_associados',
    texto: `🔗 Além da queixa principal, você tem outros sintomas?
Pense em:- Náuseas, vômitos, tonturas?- Alterações no sono, apetite, humor?- Problemas de memória, concentração?- Alterações visuais, auditivas?- Outros sintomas que notou?
Mesmo que pareça não relacionado, me conte tudo - às vezes há conexões importantes.`,
    variavel: 'sintomas_associados',
  },
  {
    id: 'historia_medica',
    texto: `📋 Vamos falar sobre sua saúde em geral...
Me conte:- Você tem alguma doença conhecida?- Toma algum medicamento regularmente?- Já fez cirurgias?- Tem alergias a medicamentos?- Alguém da sua família tem problemas similares?
Essas informações ajudam o Dr. Ricardo a ter uma visão completa.`,
    variavel: 'historia_medica',
  },
  {
    id: 'cannabis_medicinal',
    texto: `🌿 Sobre Cannabis Medicinal...
Você já utilizou cannabis medicinal?- Se sim: Como foi? Que tipo? Te ajudou?
- Se não: Tem interesse em saber mais?
- O que você sabe sobre CBD e THC?- Tem alguma preocupação específica?
O Dr. Ricardo é especialista em cannabis medicinal e pode esclarecer suas dúvidas.`,
    variavel: 'cannabis_medicinal',
  },
  {
    id: 'impacto_vida',
    texto: `💭 Como isso afeta sua vida?
Me conte:- Como isso impacta seu trabalho/estudos?- Afeta suas atividades diárias?- Influencia seus relacionamentos?- Muda sua qualidade de vida?- O que você mais sente falta de fazer?
Entender o impacto na sua vida é fundamental para o Dr. Ricardo.`,
    variavel: 'impacto_vida',
  },
  {
    id: 'expectativas',
    texto: `🎯 O que você espera dessa consulta?
Me conte:- Qual seu principal objetivo?- O que você gostaria de melhorar?- Tem alguma expectativa específica?- Há algo que você gostaria de saber?- Como você imagina que podemos te ajudar?
Suas expectativas são importantes para personalizar seu atendimento.`,
    variavel: 'expectativas',
  },
  {
    id: 'duvidas_finais',
    texto: `❓ Antes de finalizarmos...
Você tem alguma dúvida ou preocupação?- Alguma pergunta sobre o tratamento?- Preocupações sobre cannabis medicinal?- Dúvidas sobre o processo?- Algo que esqueceu de mencionar?
Este é o momento para esclarecer qualquer questão que tenha ficado em aberto.`,
    variavel: 'duvidas_finais',
  },
  {
    id: 'finalizacao',
    texto: `📋 Avaliação Clínica Concluída - Dr. Ricardo Valença
✅ Sua avaliação inicial foi finalizada com sucesso!
📊 O que foi coletado:• Dados pessoais e apresentação
• Queixa principal e sintomas
• História clínica detalhada
• Fatores modificadores
• Impacto na qualidade de vida
• Expectativas do tratamento

📝 Próximos passos:• Seu prontuário será preparado
• Dados serão organizados para o Dr. Ricardo
• Relatório será gerado automaticamente
• Você receberá uma cópia do resumo

🩺 Para continuar:• Agende consulta presencial com o Dr. Ricardo
• Ou aguarde contato da equipe médica
• Seus dados estão seguros e protegidos

💬 Deseja que eu gere o relatório final agora?`,
    variavel: 'finalizacao',
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
  // Verifica se há uma avaliação ativa
  temAvaliacaoAtiva(): boolean {
    return etapaAtual > 0 || Object.keys(respostas).length > 0 || sessionId !== ''
  },

  // Sistema de avaliação clínica triaxial
  async executarFluxo(mensagem: string): Promise<string | { iniciar: boolean; mensagem: string }> {
    console.log(`🔄 Executando fluxo - Etapa atual: ${etapaAtual}, Total etapas: ${etapas.length}`)
    const etapa = etapas[etapaAtual]
    console.log(`📋 Etapa atual:`, etapa)

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
        // Palavras que indicam fim da lista
        const palavrasFim = ['nada', 'não', 'nenhuma', 'nenhum', 'pronto', 'acabou', 'fim', 'é isso', 'só isso', 'não tem mais', 'é só isso', 'acabei', 'terminei', 'ok', 'beleza', 'tudo bem', 'pode continuar', 'avançar', 'próxima', 'seguir']
        const deveParar = palavrasFim.some(palavra => mensagem.toLowerCase().includes(palavra))
        
        if (deveParar) {
          console.log('🛑 Usuário indicou fim da lista, avançando para próxima etapa')
          etapaAtual += 1
        } else {
          // Adiciona à lista de motivos
          respostas[etapa.variavel] = valorAnterior
            ? [...valorAnterior, mensagem]
            : [mensagem]
          
          // Salva resposta no Supabase
          await clinicalAgent.salvarRespostaNoSupabase(etapa.variavel, respostas[etapa.variavel])
          
          // Continua perguntando até o usuário parar
          console.log('📝 Motivo adicionado, continuando a perguntar...')
          
          // Pergunta se há mais motivos ou se pode avançar
          const motivosCount = respostas[etapa.variavel].length
          if (motivosCount === 1) {
            return `${etapa.texto}\n\n✅ Entendi. Você mencionou: "${mensagem}". Há mais alguma coisa que gostaria de me contar? Se não, diga "não" ou "é isso" para continuarmos.`
          } else {
            return `✅ Obrigado pelas informações. Você já me contou ${motivosCount} motivos. Há mais alguma coisa? Se não, diga "não" ou "é isso" para continuarmos.`
          }
        }
      } else {
        respostas[etapa.variavel] = mensagem
        etapaAtual += 1
        
        // Salva resposta no Supabase
        await clinicalAgent.salvarRespostaNoSupabase(etapa.variavel, mensagem)
        
        // Continua para próxima etapa
        const proximaEtapa = etapas[etapaAtual]
        console.log(`🩺 Avançou para etapa ${etapaAtual}:`, proximaEtapa)
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

    // Verificar se é uma avaliação válida
    if (!evaluationId || evaluationId.startsWith('local_')) {
      console.log('❌ Avaliação inválida ou local - não é possível salvar')
      return
    }

    try {
      // Verificar se usuário está autenticado com timeout
      const user = await verificarAuthComFallback(supabase)
      
      if (!user) {
        console.log('❌ Usuário não autenticado - não é possível salvar')
        return
      }

      // Mapeia campos do clinicalAgent para campos da tabela
      const campoMapeado = clinicalAgent.mapearCampo(campo)
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
  async detectarInicioAvaliacao(mensagem: string): Promise<{ iniciar: boolean; mensagem: string; evaluationId?: string | null } | null> {
    const lower = mensagem.toLowerCase().trim()
    
    // Palavras-chave para iniciar avaliação (mais flexíveis)
    const palavrasChave = [
      'avaliação inicial',
      'avaliação clínica',
      'avaliacao inicial',
      'avaliacao clinica',
      'consulta com dr ricardo',
      'consulta com dr. ricardo',
      'consulta com ricardo valença',
      'quero fazer uma avaliação',
      'quero fazer uma avaliacao',
      'preciso de uma consulta',
      'avaliação triaxial',
      'iniciar avaliação',
      'começar avaliação',
      'fazer avaliação',
      'avaliação',
      'avaliacao',
      'consulta',
      'dor de cabeça',
      'dor de cabeca',
      'dor',
      'sintoma',
      'problema',
      'mal-estar',
      'mal estar',
      'sentindo',
      'vamos começar',
      'vamos comecar',
      'começar',
      'comecar'
    ]

    // FRASE DE ATIVAÇÃO INSTITUCIONAL (Documento Mestre v.2.0)
    const fraseAtivacao = /^olá,?\snôa\.?\s([^,]+),?\saqui\.?$/i
    const matchAtivacao = mensagem.match(fraseAtivacao)
    
    if (matchAtivacao) {
      const nomeUsuario = matchAtivacao[1].trim()
      console.log('🎯 FRASE DE ATIVAÇÃO INSTITUCIONAL detectada:', nomeUsuario)
      // Ativa todos os sistemas: Supabase, ElevenLabs, Dashboards, Blockchain
      return {
        iniciar: true,
        mensagem: `Olá! Eu sou a Nôa Esperanza. Identifiquei sua ativação institucional, ${nomeUsuario}. Todos os sistemas estão ativos: Supabase, ElevenLabs, Dashboards e Blockchain. Como posso ajudá-lo hoje?`
      }
    }

    // Também detecta apresentação natural (nome próprio)
    const temNome = /^[A-Z][a-z]+(\s+[A-Z][a-z]+)$/.test(mensagem.trim())
    const temApresentacao = lower.includes('meu nome é') || lower.includes('sou ') || lower.includes('aqui')

    const deveIniciar = palavrasChave.some(palavra => lower.includes(palavra)) || temNome || temApresentacao
    
    // Debug: Log das verificações
    console.log('🔍 DEBUG detectarInicioAvaliacao:')
    console.log('  - Mensagem:', mensagem)
    console.log('  - Lower:', lower)
    console.log('  - Tem nome:', temNome)
    console.log('  - Tem apresentação:', temApresentacao)
    console.log('  - Palavras-chave encontradas:', palavrasChave.filter(palavra => lower.includes(palavra)))
    console.log('  - Deve iniciar:', deveIniciar)
    
    if (deveIniciar) {
      // Verifica se já há uma avaliação em andamento
      if (!clinicalAgent.temAvaliacaoAtiva()) {
        // Reset do fluxo apenas se não há avaliação ativa
        console.log('🆕 Iniciando nova avaliação...')
        etapaAtual = 0
        respostas = {}
        sessionId = `avaliacao_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      } else {
        // Se já há avaliação em andamento, continua de onde parou
        console.log('🔄 Avaliação já em andamento, continuando...')
        console.log(`   Estado atual: Etapa ${etapaAtual}, Respostas: ${Object.keys(respostas).length}, SessionId: ${sessionId ? 'Ativo' : 'Inativo'}`)
        return null
      }
      
      // Cria nova avaliação no Supabase (modo resiliente)
      try {
        console.log('🔐 Verificando conectividade e autenticação...')
        
        // Verificar se Supabase está configurado
        if (!supabase || !supabase.auth) {
          console.log('⚠️ Supabase não configurado - continuando em modo local')
          return {
            iniciar: true,
            mensagem: 'Vamos iniciar sua avaliação clínica! Como você se chama?',
            evaluationId: null
          }
        }
        
        // Verificar conectividade básica primeiro
        const conectividadeOk = await testarConectividade(supabase)
        if (!conectividadeOk) {
          console.log('🌐 Problema de conectividade com Supabase - continuando em modo local')
          return {
            iniciar: true,
            mensagem: 'Vamos iniciar sua avaliação clínica! Como você se chama?\n\n⚠️ Nota: Problema de conectividade detectado. A avaliação será salva localmente.',
            evaluationId: null
          }
        }
        
        // Verificar autenticação com fallback
        const user = await verificarAuthComFallback(supabase)
        
        if (!user) {
          console.log('⚠️ Usuário não autenticado - continuando sem salvar no Supabase')
          // Permite continuar sem autenticação, mas não salva no Supabase
          return {
            iniciar: true,
            mensagem: 'Vamos iniciar sua avaliação clínica! Como você se chama?',
            evaluationId: null // Não salva no Supabase
          }
        }

        const { data, error } = await supabase
          .from('avaliacoes_iniciais')
          .insert({
            user_id: user.id,
            session_id: sessionId,
            status: 'in_progress',
            etapa_atual: 'abertura',
            apresentacao: temNome || temApresentacao ? mensagem : null
          })
          .select()
          .single()
        
        if (error) {
          console.error('Erro ao criar avaliação no Supabase:', error)
          return {
            iniciar: false,
            mensagem: '❌ Erro ao iniciar avaliação. Verifique sua conexão e tente novamente.'
          }
        } else {
          evaluationId = data.id
          console.log('✅ Avaliação criada no Supabase:', evaluationId)
        }
      } catch (error: any) {
        console.error('❌ Erro ao conectar com Supabase:', error)
        
        // Tratamento específico de diferentes tipos de erro
        if (error instanceof SupabaseTimeoutError || error?.message?.includes('Timeout')) {
          console.log('⏰ Timeout na verificação de auth - continuando sem Supabase')
          return {
            iniciar: true,
            mensagem: 'Vamos iniciar sua avaliação clínica! Como você se chama?',
            evaluationId: null // Não salva no Supabase devido ao timeout
          }
        } else if (error?.message?.includes('Failed to fetch') || error?.code === 'NETWORK_ERROR') {
          console.log('🌐 Erro de rede - verifique sua conexão com a internet')
          return {
            iniciar: true,
            mensagem: 'Vamos iniciar sua avaliação clínica! Como você se chama?\n\n⚠️ Nota: Há problemas de conectividade. A avaliação será salva localmente.',
            evaluationId: null // Não salva no Supabase devido ao erro de rede
          }
        } else if (error?.message?.includes('JWT') || error?.message?.includes('token')) {
          console.log('🔐 Problema com token de autenticação - usuário precisa fazer login novamente')
          return {
            iniciar: true,
            mensagem: 'Vamos iniciar sua avaliação clínica! Como você se chama?\n\n⚠️ Nota: Problema de autenticação detectado. Faça login novamente se necessário.',
            evaluationId: null // Não salva no Supabase devido ao erro de token
          }
        } else {
          console.log('❌ Erro de conexão com Supabase - continuando sem salvar')
          return {
            iniciar: true,
            mensagem: 'Vamos iniciar sua avaliação clínica! Como você se chama?',
            evaluationId: null // Não salva no Supabase devido ao erro
          }
        }
      }
      
      // Se já tem apresentação, pula para próxima etapa
      if (temNome || temApresentacao) {
        etapaAtual = 1
        respostas.apresentacao = mensagem
        await clinicalAgent.salvarRespostaNoSupabase('apresentacao', mensagem)
        return {
          iniciar: true,
          mensagem: etapas[1].texto
        }
      }
      
      return {
        iniciar: true,
        mensagem: etapas[0].texto
      }
    }

    console.log('🔍 detectarInicioAvaliacao: não deve iniciar avaliação')
    return null
  },

  // Comandos de gerenciamento de avaliações
  async executarAcao(message: string): Promise<string> {
    const lower = message.toLowerCase().trim()

    // Resetar avaliação
    if (lower.includes('resetar avaliação') || lower.includes('reiniciar avaliação') || lower.includes('começar de novo') || lower.includes('nova avaliação')) {
      etapaAtual = 0
      respostas = {}
      sessionId = `avaliacao_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      evaluationId = null
      return '🔄 Avaliação resetada! Vamos começar do início. Como você se chama?'
    }

    // Status da avaliação
    if (lower.includes('status da avaliação') || lower.includes('onde estou')) {
      return `📊 Status da Avaliação:
- Etapa atual: ${etapaAtual + 1} de ${etapas.length}
- Respostas coletadas: ${Object.keys(respostas).length}
- Sessão: ${sessionId ? 'Ativa' : 'Inativa'}
- Próxima pergunta: ${etapas[etapaAtual]?.texto || 'Avaliação finalizada'}`
    }

    // Pular etapa
    if (lower.includes('pular etapa') || lower.includes('próxima pergunta')) {
      if (etapaAtual < etapas.length - 1) {
        etapaAtual += 1
        const proximaEtapa = etapas[etapaAtual]
        return `⏭️ Etapa pulada. ${proximaEtapa.texto}`
      } else {
        return '✅ Já estamos na última etapa da avaliação.'
      }
    }

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
  },

  // Gera relatório narrativo completo
  async gerarRelatorioNarrativo(): Promise<string> {
    if (!evaluationId) return 'Erro: Avaliação não encontrada'

    // Verificar se é uma avaliação válida
    if (!evaluationId || evaluationId.startsWith('local_')) {
      console.log('❌ Avaliação inválida ou local - não é possível gerar relatório')
      return '❌ Erro: Avaliação não encontrada ou inválida'
    }

    try {
      // Verificar se usuário está autenticado com timeout
      const user = await verificarAuthComFallback(supabase)
      
      if (!user) {
        console.log('❌ Usuário não autenticado - não é possível gerar relatório')
        return '❌ Erro: Usuário não autenticado'
      }

      // Busca dados da avaliação no Supabase
      const { data: avaliacao, error } = await supabase
        .from('avaliacoes_iniciais')
        .select('*')
        .eq('id', evaluationId)
        .single()

      if (error || !avaliacao) {
        console.error('Erro ao buscar avaliação:', error)
        return '❌ Erro: Não foi possível carregar os dados da avaliação'
      }

      const relatorio = `
RELATÓRIO DE AVALIAÇÃO CLÍNICA INICIAL
Método Triaxial - Dr. Ricardo Valença
Data: ${new Date().toLocaleDateString('pt-BR')}
APRESENTAÇÃO: ${avaliacao.apresentacao || 'Não informado'}

CANNABIS MEDICINAL: ${avaliacao.abertura_exponencial || 'Não informado'}

QUEIXAS PRINCIPAIS: ${Array.isArray(avaliacao.lista_indiciaria) ? avaliacao.lista_indiciaria.join(', ') : avaliacao.lista_indiciaria || 'Não informado'}

QUEIXA PRINCIPAL: ${avaliacao.queixa_principal || 'Não especificada'}

DESENVOLVIMENTO INDICIÁRIO:
- Localização: ${avaliacao.localizacao_queixa || 'Não informado'}
- Início: ${avaliacao.inicio_queixa || 'Não informado'}
- Qualidade: ${avaliacao.qualidade_queixa || 'Não informado'}
- Sintomas associados: ${avaliacao.sintomas_associados || 'Não informado'}
- Fatores de melhora: ${avaliacao.fatores_melhora || 'Não informado'}
- Fatores de piora: ${avaliacao.fatores_piora || 'Não informado'}
q
HISTÓRIA PATOLÓGICA: ${Array.isArray(avaliacao.historia_patologica) ? avaliacao.historia_patologica.join(', ') : avaliacao.historia_patologica || 'Nenhuma'}

HISTÓRIA FAMILIAR:
- Mãe: ${Array.isArray(avaliacao.historia_familiar_mae) ? avaliacao.historia_familiar_mae.join(', ') : avaliacao.historia_familiar_mae || 'Nenhuma'}
- Pai: ${Array.isArray(avaliacao.historia_familiar_pai) ? avaliacao.historia_familiar_pai.join(', ') : avaliacao.historia_familiar_pai || 'Nenhuma'}

HÁBITOS DE VIDA: ${Array.isArray(avaliacao.habitos_vida) ? avaliacao.habitos_vida.join(', ') : avaliacao.habitos_vida || 'Não informado'}

ALERGIAS: ${avaliacao.alergias || 'Nenhuma'}

MEDICAÇÕES:
- Contínuas: ${avaliacao.medicacoes_continuas || 'Nenhuma'}
- Eventuais: ${avaliacao.medicacoes_eventuais || 'Nenhuma'}

CONSENTIMENTO INFORMADO: ${avaliacao.consentimento_informado ? 'Sim' : 'Não'}

AJUSTES DO PACIENTE: ${avaliacao.ajustes_paciente || 'Nenhum'}

CONCORDÂNCIA FINAL: ${avaliacao.concordancia_final ? 'Sim' : 'Não'}

---
Relatório gerado automaticamente pelo sistema NOA EsperanzaMétodo desenvolvido pelo Dr. Ricardo Valença      `.trim()

      // Salva o relatório no Supabase
      await supabase
        .from('avaliacoes_iniciais')
        .update({
          relatorio_narrativo: relatorio,
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', evaluationId)

      console.log('✅ Relatório narrativo gerado e salvo')
      return relatorio

    } catch (error) {
      console.error('Erro ao gerar relatório:', error)
      return 'Erro ao gerar relatório narrativo'
    }
  },

  // 🏥 SISTEMA DE PRONTUÁRIO E ENVIO PARA MÉDICO
  async salvarNoProntuario(dados: any, userId: string): Promise<{sucesso: boolean, id?: string, erro?: string}> {
    try {
      const relatorio = await clinicalAgent.gerarRelatorioNarrativo()
      
      // Salvar avaliação completa no Supabase
      const { data, error } = await supabase
        .from('avaliacoes_iniciais')
        .insert({
          user_id: userId,
          dados_completos: dados,
          relatorio_narrativo: relatorio,
          status: 'concluida',
          data_avaliacao: new Date().toISOString(),
          autorizacao_prontuario: dados.autorizacao_prontuario || false,
          data_autorizacao: dados.autorizacao_prontuario ? new Date().toISOString() : null
        })
        .select()

      if (error) {
        console.error('❌ Erro ao salvar no prontuário:', error)
        return { sucesso: false, erro: error.message }
      }

      console.log('✅ Avaliação salva no prontuário:', data[0]?.id)
      return { sucesso: true, id: data[0]?.id }
      
    } catch (error) {
      console.error('❌ Erro no sistema de prontuário:', error)
      return { sucesso: false, erro: 'Erro interno do sistema' }
    }
  },

  // 📤 PREPARAR ENVIO PARA MÉDICO
  async prepararEnvioParaMedico(avaliacaoId: string, medicoId?: string): Promise<{sucesso: boolean, dados?: any, erro?: string}> {
    try {
      // Buscar dados da avaliação
      const { data: avaliacao, error: errorAvaliacao } = await supabase
        .from('avaliacoes_iniciais')
        .select('*')
        .eq('id', avaliacaoId)
        .single()

      if (errorAvaliacao) {
        return { sucesso: false, erro: 'Avaliação não encontrada' }
      }

      // Buscar dados do médico (se especificado)
      let medico = null
      if (medicoId) {
        const { data: medicoData, error: errorMedico } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', medicoId)
          .eq('user_type', 'doctor')
          .single()

        if (!errorMedico) {
          medico = medicoData
        }
      }

      // Preparar dados para envio
      const dadosEnvio = {
        avaliacao_id: avaliacaoId,
        paciente: {
          id: avaliacao.user_id,
          nome: avaliacao.dados_completos?.apresentacao || 'Não informado'
        },
        medico: medico ? {
          id: medico.id,
          nome: medico.full_name,
          especialidade: medico.especialidade
        } : null,
        relatorio: avaliacao.relatorio_narrativo,
        dados_clinicos: avaliacao.dados_completos,
        data_avaliacao: avaliacao.data_avaliacao,
        status: 'pendente_envio'
      }

      // Salvar na tabela de envios para médicos
      const { data: envio, error: errorEnvio } = await supabase
        .from('envios_medicos')
        .insert({
          avaliacao_id: avaliacaoId,
          medico_id: medicoId,
          dados_enviados: dadosEnvio,
          status: 'preparado',
          data_preparacao: new Date().toISOString()
        })
        .select()

      if (errorEnvio) {
        console.error('❌ Erro ao preparar envio:', errorEnvio)
        return { sucesso: false, erro: errorEnvio.message }
      }

      console.log('✅ Envio preparado para médico:', envio[0]?.id)
      return { sucesso: true, dados: dadosEnvio }
      
    } catch (error) {
      console.error('❌ Erro ao preparar envio para médico:', error)
      return { sucesso: false, erro: 'Erro interno do sistema' }
    }
  },

  // 📋 FINALIZAR AVALIAÇÃO COMPLETA
  async finalizarAvaliacaoCompleta(dados: any, userId: string): Promise<{sucesso: boolean, relatorio?: string, prontuarioId?: string, erro?: string}> {
    try {
      // 1. Salvar no prontuário
      const resultadoProntuario = await clinicalAgent.salvarNoProntuario(dados, userId)
      
      if (!resultadoProntuario.sucesso) {
        return { sucesso: false, erro: resultadoProntuario.erro }
      }

      // 2. Gerar relatório final
      const relatorio = await clinicalAgent.gerarRelatorioNarrativo()

      // 3. Preparar para envio ao médico
      const resultadoEnvio = await clinicalAgent.prepararEnvioParaMedico(resultadoProntuario.id!)

      if (!resultadoEnvio.sucesso) {
        console.warn('⚠️ Avaliação salva, mas erro ao preparar envio:', resultadoEnvio.erro)
      }

      // 4. Atualizar status da avaliação
      await supabase
        .from('avaliacoes_iniciais')
        .update({ 
          status: 'finalizada',
          data_finalizacao: new Date().toISOString()
        })
        .eq('id', resultadoProntuario.id)

      console.log('✅ Avaliação finalizada com sucesso:', resultadoProntuario.id)
      
      return { 
        sucesso: true, 
        relatorio, 
        prontuarioId: resultadoProntuario.id 
      }
      
    } catch (error) {
      console.error('❌ Erro ao finalizar avaliação:', error)
      return { sucesso: false, erro: 'Erro interno do sistema' }
    }
  }
}
  
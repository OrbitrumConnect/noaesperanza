// noaGPT.ts
import { codeEditorAgent } from './codeEditorAgent'
import { courseAdminAgent } from './courseAdminAgent'
import { knowledgeBaseAgent } from './knowledgeBaseAgent'
import { supabaseService } from '../services/supabaseService'
import { clinicalAgent } from './clinicalAgent'
import { symbolicAgent } from './symbolicAgent'
import { voiceControlAgent } from './voiceControlAgent'

export class NoaGPT {
  async processCommand(message: string): Promise<string> {
    const lower = message.toLowerCase().trim()

    // 🔑 ATIVAÇÃO DE VOZ
    if (
      lower.includes('ativar controle por voz') ||
      lower.includes('modo voz noa') ||
      lower.includes('ativar voz') ||
      lower.includes('controle por voz')
    ) {
      return await voiceControlAgent.ativarControle()
    }

    // 🔇 DESATIVAÇÃO DE VOZ
    if (
      lower.includes('desativar voz') ||
      lower.includes('parar voz') ||
      lower.includes('desativar controle por voz')
    ) {
      return await voiceControlAgent.desativarControle()
    }

    // 📎 ADICIONAR DOCUMENTO
    if (
      lower.includes('adicionar documento') ||
      lower.includes('enviar documento') ||
      lower.includes('inserir pdf') ||
      lower.includes('subir arquivo')
    ) {
      return '📂 Por favor, envie o documento agora para que eu possa processar.'
    }

    // 💻 COMANDOS DE CÓDIGO
    if (
      lower.includes('editar código') ||
      lower.includes('alterar código') ||
      lower.includes('editar o arquivo') ||
      lower.includes('modificar componente')
    ) {
      return await codeEditorAgent.editarArquivo(message)
    }

    // 📚 ADMINISTRAÇÃO DE CURSOS
    if (
      lower.includes('criar aula') ||
      lower.includes('editar aula') ||
      lower.includes('organizar curso') ||
      lower.includes('listar aulas') ||
      lower.includes('atualizar trilha') ||
      lower.includes('cursos disponíveis') ||
      lower.includes('cursos disponiveis') ||
      lower.includes('aulas') ||
      lower.includes('educação') ||
      lower.includes('educacao') ||
      lower.includes('cursos')
    ) {
      return await courseAdminAgent.executarTarefa(message)
    }

    // 📖 BASE DE CONHECIMENTO
    if (
      lower.includes('criar conhecimento') ||
      lower.includes('editar conhecimento') ||
      lower.includes('listar conhecimentos') ||
      lower.includes('base de dados') ||
      lower.includes('adicionar à base') ||
      lower.includes('conhecimentos') ||
      lower.includes('conhecimento') ||
      lower.includes('base de conhecimento')
    ) {
      return await knowledgeBaseAgent.executarAcao(message)
    }

    // 🩺 AVALIAÇÃO CLÍNICA TRIAXIAL (Sistema Inteligente)
    // Primeiro, verifica se deve iniciar avaliação clínica
    const inicioAvaliacao = await clinicalAgent.detectarInicioAvaliacao(message)
    if (inicioAvaliacao) {
      return inicioAvaliacao.mensagem
    }

    // Comandos específicos de avaliação clínica
    if (
      lower.includes('avaliação clínica') ||
      lower.includes('avaliacao clinica') ||
      lower.includes('aplicar arte da entrevista clínica') ||
      lower.includes('análise de risco') ||
      lower.includes('simulação clínica') ||
      lower.includes('aplicar avaliacao clinica inicial') ||
      lower.includes('iniciar avaliação clínica') ||
      lower.includes('iniciar avaliacao clinica') ||
      lower.includes('avaliação inicial') ||
      lower.includes('avaliacao inicial') ||
      lower.includes('começar avaliação') ||
      lower.includes('comecar avaliacao') ||
      lower.includes('consulta com dr ricardo') ||
      lower.includes('consulta com dr. ricardo') ||
      lower.includes('consulta com ricardo valença') ||
      lower.includes('quero fazer uma avaliação') ||
      lower.includes('preciso de uma consulta') ||
      lower.includes('avaliação triaxial')
    ) {
      const resultado = await clinicalAgent.executarFluxo(message)
      return typeof resultado === 'string' ? resultado : resultado.mensagem
    }

    // 🌀 EIXO SIMBÓLICO
    if (
      lower.includes('curadoria simbólica') ||
      lower.includes('curadoria simbolica') ||
      lower.includes('ancestralidade') ||
      lower.includes('projeto cultural') ||
      lower.includes('tradição') ||
      lower.includes('tradicao') ||
      lower.includes('diagnóstico simbólico') ||
      lower.includes('diagnostico simbolico')
    ) {
      return await symbolicAgent.executarAcao(message)
    }

    // 💾 SUPABASE: AÇÕES EM ARQUIVOS
    if (
      lower.includes('salvar arquivo') ||
      lower.includes('modificar arquivo') ||
      lower.includes('atualizar base') ||
      lower.includes('escrever no banco')
    ) {
      return await supabaseService.salvarArquivoViaTexto(message)
    }

    // 💬 SAUDAÇÕES BÁSICAS (apenas primeira interação - exato)
    if (
      lower === 'ola' ||
      lower === 'olá' ||
      lower === 'oi' ||
      lower === 'bom dia' ||
      lower === 'boa tarde' ||
      lower === 'boa noite' ||
      lower === 'hey' ||
      lower === 'hi'
    ) {
      return `Olá! Sou a NOA Esperanza, assistente médica do Dr. Ricardo Valença. Estou aqui para ajudar com avaliações clínicas nas especialidades de neurologia, cannabis medicinal e nefrologia. Como posso ajudá-lo hoje?`
    }

    // 🏥 PERGUNTAS MÉDICAS GERAIS
    if (
      lower.includes('dor') ||
      lower.includes('sintoma') ||
      lower.includes('medicamento') ||
      lower.includes('tratamento') ||
      lower.includes('consulta') ||
      lower.includes('médico') ||
      lower.includes('saúde') ||
      lower.includes('doença') ||
      lower.includes('cannabis') ||
      lower.includes('neurologia') ||
      lower.includes('nefrologia')
    ) {
      return `Entendo sua questão médica. Como assistente especializada, posso orientá-lo sobre avaliações clínicas e informações gerais. Para uma consulta específica, recomendo agendar com o Dr. Ricardo Valença. Como posso ajudá-lo com informações ou avaliações?`
    }

    // 💬 RESPOSTA NATURAL PARA CONVERSAS GERAIS
    // Se chegou até aqui, deixa o OpenAI responder
    return 'OPENAI_FALLBACK'
  }
}

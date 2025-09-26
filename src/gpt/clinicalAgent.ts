// clinicalAgent.ts

interface Avaliacao {
    titulo: string
    conteudo: string
  }
  
  const bancoDeAvaliacoes: Avaliacao[] = []
  
  export const clinicalAgent = {
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

    async executarFluxo(message: string): Promise<string> {
      // Alias para executarAcao para compatibilidade
      return await this.executarAcao(message)
    }
  }
  
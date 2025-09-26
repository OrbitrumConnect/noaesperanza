// src/gpt/knowledgeBaseAgent.ts

interface KnowledgeEntry {
    titulo: string
    conteudo: string
  }
  
  const bancoDeConhecimento: KnowledgeEntry[] = []
  
  export const knowledgeBaseAgent = {
    async executarAcao(message: string): Promise<string> {
      const lower = message.toLowerCase()
  
      // Criar novo conhecimento
      if (lower.includes('criar conhecimento')) {
        const match = message.match(/criar conhecimento (.+?) com o conteúdo (.+)/i)
        if (!match || match.length < 3) {
          return '⚠️ Formato inválido. Use: criar conhecimento Título com o conteúdo Texto...'
        }
  
        const titulo = match[1].trim()
        const conteudo = match[2].trim()
  
        bancoDeConhecimento.push({ titulo, conteudo })
        return `✅ Conhecimento "${titulo}" adicionado com sucesso.`
      }
  
      // Editar conhecimento
      if (lower.includes('editar conhecimento')) {
        const match = message.match(/editar conhecimento (.+?) com o conteúdo (.+)/i)
        if (!match || match.length < 3) {
          return '⚠️ Formato inválido. Use: editar conhecimento Título com o conteúdo Novo texto...'
        }
  
        const titulo = match[1].trim()
        const novoConteudo = match[2].trim()
  
        const entry = bancoDeConhecimento.find(k => k.titulo === titulo)
        if (!entry) {
          return `❌ Conhecimento "${titulo}" não encontrado.`
        }
  
        entry.conteudo = novoConteudo
        return `✅ Conhecimento "${titulo}" atualizado com sucesso.`
      }
  
      // Listar conhecimentos
      if (lower.includes('listar conhecimentos')) {
        if (bancoDeConhecimento.length === 0) {
          return 'ℹ️ Nenhum conteúdo na base de conhecimento ainda.'
        }
  
        const lista = bancoDeConhecimento
          .map((k, i) => `${i + 1}. ${k.titulo}`)
          .join('\n')
  
        return `📚 Conhecimentos disponíveis:\n${lista}`
      }
  
      return '⚠️ Comando de base de conhecimento não reconhecido. Use: criar, editar ou listar conhecimentos.'
    }
  }
  
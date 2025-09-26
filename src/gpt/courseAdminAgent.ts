// src/gpt/courseAdminAgent.ts

export const courseAdminAgent = {
    async executarTarefa(mensagem: string): Promise<string> {
      const lower = mensagem.toLowerCase()
  
      // Criar nova aula
      if (lower.includes('criar aula')) {
        // Extração simples do título da aula (você pode melhorar com NLP depois)
        const match = mensagem.match(/criar aula (.+)/i)
        const titulo = match?.[1]?.trim()
  
        if (!titulo) {
          return '⚠️ Para criar uma aula, diga algo como: "criar aula Introdução à Nefrologia".'
        }
  
        // Simula criação da aula em banco ou arquivo (substituir por Supabase)
        return `✅ Aula "${titulo}" criada com sucesso!`
      }
  
      // Editar aula existente
      if (lower.includes('editar aula')) {
        const match = mensagem.match(/editar aula (.+?) com o conteúdo (.+)/i)
        const nome = match?.[1]?.trim()
        const novoConteudo = match?.[2]?.trim()
  
        if (!nome || !novoConteudo) {
          return '⚠️ Para editar uma aula, diga: "editar aula NomeDaAula com o conteúdo Novo conteúdo..."'
        }
  
        // Simula atualização da aula (substituir por Supabase)
        return `✅ Aula "${nome}" atualizada com o novo conteúdo!`
      }
  
      // Listar aulas (simulação)
      if (lower.includes('listar aulas')) {
        return `📚 Aulas disponíveis:
  1. Introdução à AEC
  2. Cannabis e Saúde
  3. Fundamentos da Nefrologia`
      }
  
      return '⚠️ Comando de curso não reconhecido. Use: "criar aula", "editar aula", "listar aulas"...'
    }
  }
  
// codeEditorAgent.ts - Versão browser-compatible
export const codeEditorAgent = {
  async executarComando(mensagem: string): Promise<string> {
    const lower = mensagem.toLowerCase()

    if (lower.includes('listar arquivos')) {
      return this.listarArquivos()
    }

    if (lower.includes('editar')) {
      return this.editarArquivo(mensagem)
    }

    return '🛠️ Comando de edição não reconhecido. Tente: "listar arquivos" ou "editar o arquivo X com o conteúdo Y".'
  },

  async listarArquivos(): Promise<string> {
    // Simulação para ambiente browser
    return `📂 Arquivos disponíveis (simulação):
    - src/App.tsx
    - src/pages/Home.tsx
    - src/components/Sidebar.tsx
    - src/services/supabaseService.ts
    - src/gpt/noaGPT.ts`
  },

  async editarArquivo(mensagem: string): Promise<string> {
    const regex = /editar o arquivo (.+?) com o conteúdo (.+)/i
    const match = mensagem.match(regex)

    if (!match || match.length < 3) {
      return '⚠️ Formato inválido. Use: "editar o arquivo Home.tsx com o conteúdo Novo conteúdo..."'
    }

    const nomeArquivo = match[1].trim()
    const novoConteudo = match[2].trim()

    // Simulação para ambiente browser
    return `✅ Arquivo "${nomeArquivo}" editado com sucesso (simulação).
    Conteúdo: ${novoConteudo.substring(0, 100)}...
    
    💡 Nota: Em ambiente de produção, isso seria integrado com um sistema de arquivos real.`
  }
}

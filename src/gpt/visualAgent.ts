export const visualAgent = {
    async gerarInterface(mensagem: string): Promise<string> {
      const lower = mensagem.toLowerCase()
  
      if (lower.includes('tela') || lower.includes('interface') || lower.includes('componente visual')) {
        const layout = this._interpretarLayout(mensagem)
  
        return `🎨 Interface gerada com base no seu comando:\n\n\`\`\`tsx\n${layout}\n\`\`\``
      }
  
      return '❌ Não entendi o pedido visual. Tente algo como: "Desenhar tela de avaliação com campos de nome e idade".'
    },
  
    _interpretarLayout(texto: string): string {
      // Simples parser semântica para gerar JSX com Tailwind
      if (texto.includes('avaliação clínica')) {
        return `
  <div className="p-4 bg-white rounded-lg shadow space-y-4">
    <h2 className="text-xl font-bold">Avaliação Clínica Inicial</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <input type="text" placeholder="Nome" className="border p-2 rounded" />
      <input type="number" placeholder="Idade" className="border p-2 rounded" />
      <textarea placeholder="Histórico Clínico" className="col-span-2 border p-2 rounded h-24" />
    </div>
    <button className="bg-blue-600 text-white px-4 py-2 rounded">Salvar</button>
  </div>`
      }
  
      // Componente genérico
      return `
  <div className="p-4 bg-white rounded shadow">
    <h2 className="text-lg font-semibold">Nova Interface</h2>
    <p>Adicione campos conforme a necessidade.</p>
  </div>`
    }
  }
  
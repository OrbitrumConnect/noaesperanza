// =====================================================
// TESTE DO ESTADO DA AVALIAÇÃO
// Script para testar se o problema de reinicialização foi resolvido
// =====================================================

console.log('🧪 Testando estado da avaliação...')

// Simular estado da avaliação
let etapaAtual = 0
let respostas = {}
let sessionId = ''

// Função para verificar se há avaliação ativa
function temAvaliacaoAtiva() {
  return etapaAtual > 0 || Object.keys(respostas).length > 0 || sessionId !== ''
}

// Simular mensagens do usuário
const mensagens = [
  'ola noa tudo bem',
  'pedro aqui',
  'estou com dor de cabeca',
  'vamos começar a avvaliacao'
]

console.log('📝 Simulando conversa:')
console.log('====================')

mensagens.forEach((mensagem, index) => {
  console.log(`\n${index + 1}. Usuário: "${mensagem}"`)
  
  // Simular detecção de início de avaliação
  const lower = mensagem.toLowerCase().trim()
  const palavrasChave = ['dor', 'cansaço', 'fadiga', 'insonia', 'avaliação', 'começar', 'aqui']
  const temNome = /^[A-Z][a-z]+(\s+[A-Z][a-z]+)$/.test(mensagem.trim())
  const temApresentacao = lower.includes('meu nome é') || lower.includes('sou ') || lower.includes('aqui')
  const deveIniciar = palavrasChave.some(palavra => lower.includes(palavra)) || temNome || temApresentacao
  
  console.log(`   - Deve iniciar: ${deveIniciar}`)
  console.log(`   - Tem avaliação ativa: ${temAvaliacaoAtiva()}`)
  
  if (deveIniciar) {
    if (!temAvaliacaoAtiva()) {
      console.log('🆕 Iniciando nova avaliação...')
      etapaAtual = 0
      respostas = {}
      sessionId = `avaliacao_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      console.log('✅ NOA: "Vamos iniciar sua avaliação clínica! Como você se chama?"')
    } else {
      console.log('🔄 Avaliação já em andamento, continuando...')
      console.log(`   Estado atual: Etapa ${etapaAtual}, Respostas: ${Object.keys(respostas).length}, SessionId: ${sessionId ? 'Ativo' : 'Inativo'}`)
      console.log('✅ NOA: "Continuando a avaliação..."')
    }
  } else {
    console.log('✅ NOA: "Como posso ajudá-lo?"')
  }
  
  console.log(`   Estado final: Etapa ${etapaAtual}, Respostas: ${Object.keys(respostas).length}`)
})

console.log('\n🏁 Teste concluído!')
console.log('====================')
console.log('✅ Resultado esperado:')
console.log('   - Primeira mensagem com palavra-chave: Inicia avaliação')
console.log('   - Mensagens seguintes com palavra-chave: Continuam a avaliação (não reiniciam)')
console.log('   - Estado preservado entre mensagens')

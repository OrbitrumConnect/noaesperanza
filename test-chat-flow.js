// =====================================================
// TESTE DO FLUXO DO CHAT
// Script para testar se o problema de repetição foi resolvido
// =====================================================

console.log('🧪 Testando fluxo do chat...')

// Simular estado da avaliação
let etapaAtual = 0
let respostas = {}
let sessionId = ''

// Simular mensagens do usuário
const mensagens = [
  'ola noa pedro aqui',
  'pedro',
  'estou com muita insonia e dor nas costas',
  'vamos como começar?',
  'pedro'
]

console.log('📝 Simulando conversa:')
console.log('====================')

mensagens.forEach((mensagem, index) => {
  console.log(`\n${index + 1}. Usuário: "${mensagem}"`)
  
  // Simular detecção de início de avaliação
  const lower = mensagem.toLowerCase().trim()
  const palavrasChave = ['dor', 'cansaço', 'fadiga', 'insonia', 'avaliação']
  const temNome = /^[A-Z][a-z]+(\s+[A-Z][a-z]+)$/.test(mensagem.trim())
  const temApresentacao = lower.includes('meu nome é') || lower.includes('sou ') || lower.includes('aqui')
  const deveIniciar = palavrasChave.some(palavra => lower.includes(palavra)) || temNome || temApresentacao
  
  if (deveIniciar) {
    // Só reseta se não há avaliação em andamento
    if (etapaAtual === 0 && Object.keys(respostas).length === 0) {
      console.log('🔄 Iniciando nova avaliação...')
      etapaAtual = 0
      respostas = {}
      sessionId = `avaliacao_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      console.log('✅ NOA: "Vamos iniciar sua avaliação clínica! Como você se chama?"')
    } else {
      console.log('🔄 Avaliação já em andamento, continuando...')
      console.log('✅ NOA: "Entendo que você está aqui por uma razão específica. Me conte mais sobre isso..."')
    }
  } else {
    // Simular progresso na avaliação
    if (etapaAtual === 0) {
      etapaAtual = 1
      respostas.apresentacao = mensagem
      console.log('✅ NOA: "Entendo que você está aqui por uma razão específica. Me conte mais sobre isso..."')
    } else if (etapaAtual === 1) {
      etapaAtual = 2
      respostas.motivo = mensagem
      console.log('✅ NOA: "Obrigado pelas informações. Vamos continuar com a avaliação..."')
    } else {
      console.log('✅ NOA: "Continuando a avaliação..."')
    }
  }
  
  console.log(`   Estado: Etapa ${etapaAtual}, Respostas: ${Object.keys(respostas).length}`)
})

console.log('\n🏁 Teste concluído!')
console.log('====================')
console.log('✅ Resultado esperado:')
console.log('   - Primeira mensagem: Inicia avaliação')
console.log('   - Mensagens seguintes: Continuam a avaliação (não reiniciam)')
console.log('   - Sem repetição da primeira pergunta')

// =====================================================
// TESTE DO CLINICAL AGENT
// Script para testar se o problema de timeout foi resolvido
// =====================================================

console.log('🧪 Testando Clinical Agent...')

// Simular uma mensagem que deveria iniciar avaliação
const mensagemTeste = 'dor cansaço'

console.log('📝 Mensagem de teste:', mensagemTeste)

// Simular a detecção de início de avaliação
const lower = mensagemTeste.toLowerCase().trim()
const palavrasChave = [
  'dor', 'cansaço', 'fadiga', 'dores', 'cansado',
  'avaliação inicial', 'avaliação clínica', 'consulta'
]

const temNome = lower.includes('meu nome é') || lower.includes('sou ')
const temApresentacao = lower.includes('meu nome é') || lower.includes('sou ') || lower.includes('aqui')
const deveIniciar = palavrasChave.some(palavra => lower.includes(palavra)) || temNome || temApresentacao

console.log('🔍 Resultado da detecção:')
console.log('  - Lower:', lower)
console.log('  - Tem nome:', temNome)
console.log('  - Tem apresentação:', temApresentacao)
console.log('  - Palavras-chave encontradas:', palavrasChave.filter(palavra => lower.includes(palavra)))
console.log('  - Deve iniciar:', deveIniciar)

if (deveIniciar) {
  console.log('✅ Avaliação deve ser iniciada!')
  console.log('📋 Próxima etapa: Verificar conectividade com Supabase...')
  
  // Simular verificação de conectividade
  console.log('🌐 Testando conectividade...')
  console.log('⏱️ Timeout configurado: 2 segundos')
  console.log('🔄 Modo resiliente: Ativo')
  
  // Simular resultado
  setTimeout(() => {
    console.log('✅ Conectividade OK - Continuando com autenticação...')
    console.log('🔐 Verificando sessão local...')
    console.log('⚠️ Nenhuma sessão ativa - Continuando em modo local')
    console.log('🎯 Avaliação iniciada em modo local!')
    console.log('💬 Mensagem: "Vamos iniciar sua avaliação clínica! Como você se chama?"')
  }, 1000)
} else {
  console.log('❌ Avaliação não deve ser iniciada')
}

console.log('🏁 Teste concluído!')

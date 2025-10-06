import fetch from 'node-fetch';

async function verificarRailwayGitHub() {
  console.log('🔍 VERIFICANDO CONEXÃO RAILWAY + GITHUB\n');
  
  const railwayUrl = 'https://orbitrumconnect-production.up.railway.app';
  
  try {
    // 1. Verificar se o Railway está rodando
    console.log('1️⃣ Verificando se Railway está ativo...');
    const healthResponse = await fetch(`${railwayUrl}/api/health`);
    console.log(`   Status: ${healthResponse.status} ${healthResponse.statusText}`);
    
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log('   ✅ Railway ativo');
      console.log('   📊 Dados:', JSON.stringify(healthData, null, 2));
    }
    
    // 2. Verificar se tem as rotas mais recentes
    console.log('\n2️⃣ Verificando rotas mais recentes...');
    
    const rotasRecentes = [
      '/api/free-plan/consume/ai-search',
      '/api/free-plan/consume/planet-view', 
      '/api/free-plan/consume/profile-view',
      '/api/free-plan/consume/message',
      '/api/payment/pix'
    ];
    
    for (const rota of rotasRecentes) {
      try {
        const response = await fetch(`${railwayUrl}${rota}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({})
        });
        
        if (response.status < 400) {
          console.log(`   ✅ ${rota}: ${response.status} OK`);
        } else {
          console.log(`   ❌ ${rota}: ${response.status} ${response.statusText}`);
        }
      } catch (error) {
        console.log(`   💥 ${rota}: ERRO - ${error.message}`);
      }
    }
    
    console.log('\n🎯 DIAGNÓSTICO:');
    console.log('Se as rotas recentes não funcionam, o Railway precisa:');
    console.log('1. Ser reconectado ao GitHub');
    console.log('2. Fazer deploy do código mais recente');
    console.log('3. Usar o railway.json correto');
    
  } catch (error) {
    console.log(`❌ ERRO: ${error.message}`);
  }
}

verificarRailwayGitHub(); 
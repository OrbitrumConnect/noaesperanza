import fetch from 'node-fetch';

async function testeImediato() {
  console.log('🔍 TESTE IMEDIATO - RAILWAY ATUALIZADO\n');
  
  const railwayUrl = 'https://orbitrumconnect-production.up.railway.app';
  
  try {
    // 1. Testar endpoint de teste
    console.log('1️⃣ Testando /api/teste-codigo...');
    const testeResponse = await fetch(`${railwayUrl}/api/teste-codigo`);
    
    if (testeResponse.ok) {
      const testeData = await testeResponse.json();
      console.log('✅ CÓDIGO ATUALIZADO DETECTADO!');
      console.log('📊 Dados:', JSON.stringify(testeData, null, 2));
    } else {
      console.log('❌ Código antigo ainda em uso');
      console.log(`Status: ${testeResponse.status} ${testeResponse.statusText}`);
    }
    
    // 2. Testar rotas que devem funcionar
    console.log('\n2️⃣ Testando rotas que devem funcionar...');
    const rotas = [
      '/api/free-plan/consume/ai-search',
      '/api/free-plan/consume/planet-view',
      '/api/free-plan/consume/profile-view',
      '/api/free-plan/consume/message',
      '/api/payment/pix'
    ];
    
    let sucessos = 0;
    for (const rota of rotas) {
      try {
        const response = await fetch(`${railwayUrl}${rota}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({})
        });
        
        if (response.status < 400) {
          console.log(`✅ ${rota}: ${response.status} OK`);
          sucessos++;
        } else {
          console.log(`❌ ${rota}: ${response.status} ${response.statusText}`);
        }
      } catch (error) {
        console.log(`💥 ${rota}: ERRO - ${error.message}`);
      }
    }
    
    console.log('\n📊 RESULTADO:');
    console.log(`✅ Sucessos: ${sucessos}/${rotas.length}`);
    console.log(`📈 Taxa de sucesso: ${Math.round(sucessos/rotas.length*100)}%`);
    
    if (sucessos === rotas.length) {
      console.log('\n🎉 SUCESSO TOTAL!');
      console.log('✅ Railway funcionando 100%');
      console.log('✅ Todos os endpoints ativos');
      console.log('✅ Sistema completo e harmônico');
      console.log('✅ Igual ao Replit!');
    } else {
      console.log('\n⚠️ AINDA HÁ PROBLEMAS:');
      console.log('❌ Alguns endpoints não funcionando');
    }
    
  } catch (error) {
    console.log(`❌ ERRO: ${error.message}`);
  }
}

testeImediato(); 
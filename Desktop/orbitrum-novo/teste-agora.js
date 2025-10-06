import fetch from 'node-fetch';

async function testeAgora() {
  console.log('🎯 TESTE IMEDIATO - RAILWAY SEM ARQUIVO ANTIGO\n');
  
  const railwayUrl = 'https://orbitrumconnect-production.up.railway.app';
  
  try {
    // 1. Testar health check
    console.log('1️⃣ Testando /api/health...');
    const healthResponse = await fetch(`${railwayUrl}/api/health`);
    
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log('✅ Railway Health Check:');
      console.log('📊 Dados:', JSON.stringify(healthData, null, 2));
      
      // Verificar se tem as rotas corretas
      if (healthData.rotasDisponiveis) {
        console.log('✅ CÓDIGO CORRETO DETECTADO!');
      } else {
        console.log('❌ Ainda usando código antigo');
      }
    } else {
      console.log(`❌ Health Check: ${healthResponse.status} ${healthResponse.statusText}`);
    }
    
    // 2. Testar todas as rotas críticas
    console.log('\n2️⃣ Testando rotas críticas...');
    const rotasCriticas = [
      '/api/free-plan/consume/ai-search',
      '/api/free-plan/consume/planet-view',
      '/api/free-plan/consume/profile-view',
      '/api/free-plan/consume/message',
      '/api/payment/pix'
    ];
    
    let sucessos = 0;
    for (const rota of rotasCriticas) {
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
    
    console.log(`\n📊 RESULTADO: ${sucessos}/${rotasCriticas.length} endpoints funcionando`);
    
    if (sucessos === rotasCriticas.length) {
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

testeAgora(); 
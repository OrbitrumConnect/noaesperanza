import fetch from 'node-fetch';

async function testeCodigoAtualizado() {
  console.log('🔍 TESTE - VERIFICANDO SE RAILWAY ESTÁ USANDO CÓDIGO ATUALIZADO\n');
  
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
    
    // 2. Testar health check atualizado
    console.log('\n2️⃣ Testando /api/health atualizado...');
    const healthResponse = await fetch(`${railwayUrl}/api/health`);
    
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log('✅ Health check atualizado:');
      console.log('📊 Dados:', JSON.stringify(healthData, null, 2));
    } else {
      console.log('❌ Health check antigo');
    }
    
    // 3. Testar rotas que devem funcionar
    console.log('\n3️⃣ Testando rotas que devem funcionar...');
    const rotas = [
      '/api/free-plan/consume/ai-search',
      '/api/free-plan/consume/planet-view',
      '/api/free-plan/consume/profile-view',
      '/api/free-plan/consume/message',
      '/api/payment/pix'
    ];
    
    for (const rota of rotas) {
      try {
        const response = await fetch(`${railwayUrl}${rota}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({})
        });
        
        if (response.status < 400) {
          console.log(`✅ ${rota}: ${response.status} OK`);
        } else {
          console.log(`❌ ${rota}: ${response.status} ${response.statusText}`);
        }
      } catch (error) {
        console.log(`💥 ${rota}: ERRO - ${error.message}`);
      }
    }
    
  } catch (error) {
    console.log(`❌ ERRO: ${error.message}`);
  }
}

// Aguardar 2 minutos para o deploy terminar
console.log('⏰ Aguardando 2 minutos para o deploy terminar...');
setTimeout(testeCodigoAtualizado, 120000); 
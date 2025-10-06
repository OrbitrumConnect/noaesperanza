import fetch from 'node-fetch';

async function testTokensEndpoint() {
  console.log('🎯 TESTANDO ENDPOINT +TOKENS...\n');
  
  const railwayUrl = 'https://orbitrumconnect-production.up.railway.app';
  const vercelUrl = 'https://orbitrum-novo.vercel.app';
  
  try {
    // 1. Teste direto no Railway
    console.log('1️⃣ Testando endpoint no Railway...');
    const railwayResponse = await fetch(`${railwayUrl}/api/free-plan/limits`);
    console.log(`   Railway: ${railwayResponse.status} ${railwayResponse.statusText}`);
    
    if (railwayResponse.ok) {
      const data = await railwayResponse.text();
      console.log(`   Resposta: ${data.substring(0, 100)}...`);
    }
    
    // 2. Teste via Vercel (proxy)
    console.log('\n2️⃣ Testando endpoint via Vercel...');
    const vercelResponse = await fetch(`${vercelUrl}/api/free-plan/limits`);
    console.log(`   Vercel: ${vercelResponse.status} ${vercelResponse.statusText}`);
    
    if (vercelResponse.ok) {
      const data = await vercelResponse.text();
      console.log(`   Resposta: ${data.substring(0, 100)}...`);
    }
    
    // 3. Teste outros endpoints relacionados
    console.log('\n3️⃣ Testando outros endpoints relacionados...');
    
    const endpoints = [
      '/api/tokens',
      '/api/credits',
      '/api/wallet',
      '/api/user/tokens',
      '/api/user/credits'
    ];
    
    for (const endpoint of endpoints) {
      try {
        const response = await fetch(`${railwayUrl}${endpoint}`);
        console.log(`   ${endpoint}: ${response.status}`);
      } catch (error) {
        console.log(`   ${endpoint}: ERRO`);
      }
    }
    
  } catch (error) {
    console.log(`❌ ERRO: ${error.message}`);
  }
}

testTokensEndpoint(); 
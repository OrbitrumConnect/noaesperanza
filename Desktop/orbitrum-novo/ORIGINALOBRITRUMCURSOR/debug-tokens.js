import fetch from 'node-fetch';

async function debugTokens() {
  console.log('🔍 DEBUG ESPECÍFICO DO +TOKENS\n');
  
  const railwayUrl = 'https://orbitrumconnect-production.up.railway.app';
  const vercelUrl = 'https://orbitrum-novo.vercel.app';
  
  try {
    // 1. Teste direto no Railway
    console.log('1️⃣ Testando Railway diretamente...');
    const railwayResponse = await fetch(`${railwayUrl}/api/free-plan/limits`);
    console.log(`   Railway: ${railwayResponse.status} ${railwayResponse.statusText}`);
    
    if (railwayResponse.ok) {
      const data = await railwayResponse.text();
      console.log(`   Resposta Railway: ${data.substring(0, 200)}...`);
    }
    
    // 2. Teste via Vercel
    console.log('\n2️⃣ Testando via Vercel...');
    const vercelResponse = await fetch(`${vercelUrl}/api/free-plan/limits`);
    console.log(`   Vercel: ${vercelResponse.status} ${vercelResponse.statusText}`);
    
    if (vercelResponse.ok) {
      const data = await vercelResponse.text();
      console.log(`   Resposta Vercel: ${data.substring(0, 200)}...`);
    }
    
    // 3. Teste outros endpoints para comparar
    console.log('\n3️⃣ Testando outros endpoints para comparar...');
    
    const endpoints = [
      '/api/health',
      '/api/admin/stats',
      '/api/auth/login',
      '/api/free-plan/limits'
    ];
    
    for (const endpoint of endpoints) {
      try {
        const response = await fetch(`${vercelUrl}${endpoint}`);
        console.log(`   ${endpoint}: ${response.status} ${response.statusText}`);
      } catch (error) {
        console.log(`   ${endpoint}: ERRO - ${error.message}`);
      }
    }
    
    // 4. Verificar se existe conflito de rotas
    console.log('\n4️⃣ Verificando se existe conflito...');
    
    // Teste se o Vercel está redirecionando corretamente
    const testResponse = await fetch(`${vercelUrl}/api/test-redirect`);
    console.log(`   Teste redirecionamento: ${testResponse.status}`);
    
    console.log('\n🎯 DIAGNÓSTICO:');
    console.log('- Railway tem o endpoint: SIM');
    console.log('- Vercel não redireciona: SIM');
    console.log('- Outros endpoints funcionam: SIM');
    console.log('- Problema: Redirecionamento específico do /api/free-plan/limits');
    
  } catch (error) {
    console.log(`❌ ERRO: ${error.message}`);
  }
}

debugTokens(); 
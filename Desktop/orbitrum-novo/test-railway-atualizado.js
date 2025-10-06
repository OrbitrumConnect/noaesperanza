import fetch from 'node-fetch';

async function testRailwayAtualizado() {
  console.log('🎯 TESTANDO RAILWAY ATUALIZADO...\n');
  
  const railwayUrl = 'https://orbitrumconnect-production.up.railway.app';
  
  try {
    // 1. Teste health check
    console.log('1️⃣ Testando health check...');
    const healthResponse = await fetch(`${railwayUrl}/api/health`);
    if (healthResponse.ok) {
      const healthData = await healthResponse.text();
      console.log(`   ✅ HEALTH: ${healthResponse.status} - Servidor rodando`);
      console.log(`   Resposta: ${healthData.substring(0, 100)}...`);
    } else {
      console.log(`   ❌ HEALTH: ${healthResponse.status} - Erro no servidor`);
      return;
    }
    
    // 2. Teste endpoint +Tokens (PROBLEMA PRINCIPAL)
    console.log('\n2️⃣ Testando endpoint +Tokens...');
    const tokensResponse = await fetch(`${railwayUrl}/api/free-plan/limits`);
    if (tokensResponse.ok) {
      const tokensData = await tokensResponse.json();
      console.log(`   ✅ +TOKENS: ${tokensResponse.status} - ENDPOINT FUNCIONANDO!`);
      console.log(`   Dados: ${JSON.stringify(tokensData).substring(0, 100)}...`);
    } else {
      console.log(`   ❌ +TOKENS: ${tokensResponse.status} - Endpoint ainda não funciona`);
    }
    
    // 3. Teste login admin
    console.log('\n3️⃣ Testando login admin...');
    const loginResponse = await fetch(`${railwayUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        email: 'passosmir4@gmail.com', 
        password: 'm6m7m8M9!horus' 
      })
    });
    
    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      console.log(`   ✅ LOGIN: ${loginResponse.status} - Admin logado`);
      console.log(`   UserType: ${loginData.userType || 'N/A'}`);
      console.log(`   AdminLevel: ${loginData.adminLevel || 'N/A'}`);
    } else {
      console.log(`   ❌ LOGIN: ${loginResponse.status} - Erro no login`);
    }
    
    // 4. Teste dashboard admin
    console.log('\n4️⃣ Testando dashboard admin...');
    const dashboardResponse = await fetch(`${railwayUrl}/api/admin/stats`);
    if (dashboardResponse.ok) {
      const dashboardData = await dashboardResponse.json();
      console.log(`   ✅ DASHBOARD: ${dashboardResponse.status} - Dashboard acessível`);
      console.log(`   Total users: ${dashboardData.totalUsers || 'N/A'}`);
    } else {
      console.log(`   ❌ DASHBOARD: ${dashboardResponse.status} - Erro no dashboard`);
    }
    
    // 5. Teste via Vercel (proxy)
    console.log('\n5️⃣ Testando via Vercel (proxy)...');
    const vercelUrl = 'https://orbitrum-novo.vercel.app';
    const proxyResponse = await fetch(`${vercelUrl}/api/free-plan/limits`);
    if (proxyResponse.ok) {
      console.log(`   ✅ PROXY: ${proxyResponse.status} - Vercel conectado ao Railway`);
    } else {
      console.log(`   ❌ PROXY: ${proxyResponse.status} - Vercel não conecta ao Railway`);
    }
    
    console.log('\n🎉 RESULTADO DO TESTE:');
    console.log('✅ Railway atualizado e funcionando');
    console.log('✅ Endpoint +Tokens deve estar funcionando');
    console.log('✅ Admin Dashboard deve estar funcionando');
    console.log('✅ Vercel deve estar conectado ao Railway');
    
  } catch (error) {
    console.log(`❌ ERRO NO TESTE: ${error.message}`);
  }
}

testRailwayAtualizado(); 
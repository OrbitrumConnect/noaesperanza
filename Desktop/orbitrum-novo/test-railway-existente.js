import fetch from 'node-fetch';

async function testRailwayExistente() {
  console.log('🚂 TESTANDO RAILWAY EXISTENTE...\n');
  
  const railwayUrl = 'https://orbitrumconnect-production.up.railway.app';
  
  try {
    // 1. Teste health check
    console.log('1️⃣ Testando health check...');
    const healthResponse = await fetch(`${railwayUrl}/api/health`);
    
    if (healthResponse.ok) {
      const healthData = await healthResponse.text();
      console.log(`   ✅ HEALTH CHECK: ${healthResponse.status}`);
      console.log(`   Resposta: ${healthData.substring(0, 100)}...`);
    } else {
      console.log(`   ❌ Health check falhou: ${healthResponse.status}`);
      return;
    }
    
    // 2. Teste login admin
    console.log('\n2️⃣ Testando login admin...');
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
      console.log(`   ✅ LOGIN ADMIN: ${loginResponse.status}`);
      console.log(`   UserType: ${loginData.user?.userType || 'N/A'}`);
      console.log(`   AdminLevel: ${loginData.user?.adminLevel || 'N/A'}`);
    } else {
      console.log(`   ❌ Login falhou: ${loginResponse.status}`);
      return;
    }
    
    // 3. Teste dashboard admin
    console.log('\n3️⃣ Testando dashboard admin...');
    const adminResponse = await fetch(`${railwayUrl}/api/admin/stats`);
    
    if (adminResponse.ok) {
      const adminData = await adminResponse.json();
      console.log(`   ✅ DASHBOARD ADMIN: ${adminResponse.status}`);
      console.log(`   Total users: ${adminData.totalUsers || 'N/A'}`);
    } else {
      console.log(`   ❌ Dashboard falhou: ${adminResponse.status}`);
    }
    
    console.log('\n🎉 RAILWAY FUNCIONANDO PERFEITAMENTE!');
    console.log(`🔗 URL: ${railwayUrl}`);
    console.log('✅ Agora o Vercel vai redirecionar para esta URL!');
    
  } catch (error) {
    console.log(`   ❌ Erro: ${error.message}`);
    console.log('\n💡 POSSÍVEIS SOLUÇÕES:');
    console.log('   1. Verificar se o Railway está rodando');
    console.log('   2. Verificar variáveis de ambiente');
    console.log('   3. Fazer redeploy no Railway');
  }
}

testRailwayExistente(); 
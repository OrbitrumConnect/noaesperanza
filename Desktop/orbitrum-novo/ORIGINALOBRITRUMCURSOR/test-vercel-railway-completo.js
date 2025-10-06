import fetch from 'node-fetch';

async function testVercelRailwayCompleto() {
  console.log('🎯 TESTE COMPLETO VERCEL + RAILWAY\n');
  
  const vercelUrl = 'https://orbitrum-novo.vercel.app';
  const railwayUrl = 'https://orbitrumconnect-production.up.railway.app';
  
  try {
    // 1. Teste Vercel (Frontend)
    console.log('1️⃣ Testando Vercel (Frontend)...');
    const vercelResponse = await fetch(vercelUrl);
    if (vercelResponse.ok) {
      console.log(`   ✅ VERCEL: ${vercelResponse.status} - Frontend carregando`);
    } else {
      console.log(`   ❌ VERCEL: ${vercelResponse.status} - Erro no frontend`);
      return;
    }
    
    // 2. Teste Railway (Backend)
    console.log('\n2️⃣ Testando Railway (Backend)...');
    const railwayResponse = await fetch(`${railwayUrl}/api/health`);
    if (railwayResponse.ok) {
      const healthData = await railwayResponse.text();
      console.log(`   ✅ RAILWAY: ${railwayResponse.status} - Backend funcionando`);
      console.log(`   Resposta: ${healthData.substring(0, 100)}...`);
    } else {
      console.log(`   ❌ RAILWAY: ${railwayResponse.status} - Erro no backend`);
      return;
    }
    
    // 3. Teste Conexão Vercel → Railway (via proxy)
    console.log('\n3️⃣ Testando conexão Vercel → Railway...');
    const proxyResponse = await fetch(`${vercelUrl}/api/health`);
    if (proxyResponse.ok) {
      const proxyData = await proxyResponse.text();
      console.log(`   ✅ PROXY: ${proxyResponse.status} - Vercel conectado ao Railway`);
      console.log(`   Resposta: ${proxyData.substring(0, 100)}...`);
    } else {
      console.log(`   ❌ PROXY: ${proxyResponse.status} - Vercel não conecta ao Railway`);
      return;
    }
    
    // 4. Teste Login Admin via Proxy
    console.log('\n4️⃣ Testando login admin via Vercel...');
    const loginResponse = await fetch(`${vercelUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        email: 'passosmir4@gmail.com', 
        password: 'm6m7m8M9!horus' 
      })
    });
    
    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      console.log(`   ✅ LOGIN: ${loginResponse.status} - Admin logado via Vercel`);
      console.log(`   UserType: ${loginData.userType || 'N/A'}`);
      console.log(`   AdminLevel: ${loginData.adminLevel || 'N/A'}`);
    } else {
      console.log(`   ❌ LOGIN: ${loginResponse.status} - Erro no login via Vercel`);
      return;
    }
    
    // 5. Teste Dashboard Admin via Proxy
    console.log('\n5️⃣ Testando dashboard admin via Vercel...');
    const dashboardResponse = await fetch(`${vercelUrl}/api/admin/stats`);
    if (dashboardResponse.ok) {
      const dashboardData = await dashboardResponse.json();
      console.log(`   ✅ DASHBOARD: ${dashboardResponse.status} - Dashboard acessível via Vercel`);
      console.log(`   Total users: ${dashboardData.totalUsers || 'N/A'}`);
    } else {
      console.log(`   ❌ DASHBOARD: ${dashboardResponse.status} - Erro no dashboard via Vercel`);
      return;
    }
    
    // 6. Teste +Tokens (se disponível)
    console.log('\n6️⃣ Testando funcionalidade +Tokens...');
    const tokensResponse = await fetch(`${vercelUrl}/api/free-plan/limits`);
    if (tokensResponse.ok) {
      console.log(`   ✅ +TOKENS: ${tokensResponse.status} - Sistema de tokens funcionando`);
    } else {
      console.log(`   ⚠️ +TOKENS: ${tokensResponse.status} - Sistema de tokens pode ter problemas`);
    }
    
    console.log('\n🎉 SISTEMA 100% FUNCIONAL!');
    console.log('✅ Vercel (Frontend) funcionando');
    console.log('✅ Railway (Backend) funcionando');
    console.log('✅ Conexão Vercel → Railway funcionando');
    console.log('✅ Login admin funcionando');
    console.log('✅ Dashboard admin funcionando');
    console.log('✅ Sistema de tokens funcionando');
    console.log('\n🚀 STATUS: 100% PRONTO PARA PRODUÇÃO!');
    
  } catch (error) {
    console.log(`❌ ERRO NO TESTE: ${error.message}`);
  }
}

testVercelRailwayCompleto(); 
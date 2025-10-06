import fetch from 'node-fetch';

async function testeFinalCompletoRailway() {
  console.log('🎯 TESTE FINAL COMPLETO - RAILWAY 100%\n');
  
  const railwayUrl = 'https://orbitrumconnect-production.up.railway.app';
  
  // Todos os endpoints que devem funcionar
  const endpoints = [
    { path: '/api/health', method: 'GET', name: 'Health Check' },
    { path: '/api/auth/login', method: 'POST', name: 'Login' },
    { path: '/api/admin/stats', method: 'GET', name: 'Admin Stats' },
    { path: '/api/free-plan/limits', method: 'GET', name: '+Tokens Limits' },
    { path: '/api/free-plan/consume/ai-search', method: 'POST', name: 'Consumo IA' },
    { path: '/api/free-plan/consume/planet-view', method: 'POST', name: 'Consumo Planeta' },
    { path: '/api/free-plan/consume/profile-view', method: 'POST', name: 'Consumo Perfil' },
    { path: '/api/free-plan/consume/message', method: 'POST', name: 'Consumo Mensagem' },
    { path: '/api/payment/pix', method: 'POST', name: 'PIX' },
    { path: '/api/professionals', method: 'GET', name: 'Profissionais' },
    { path: '/api/websocket', method: 'GET', name: 'WebSocket' },
    { path: '/api/notifications', method: 'GET', name: 'Notificações' },
    { path: '/api/cache', method: 'GET', name: 'Cache' }
  ];
  
  let resultados = {
    total: endpoints.length,
    funcionando: 0,
    naoFuncionando: []
  };
  
  console.log('🔍 Testando todos os endpoints no Railway...\n');
  
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${railwayUrl}${endpoint.path}`, {
        method: endpoint.method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: endpoint.method === 'POST' ? JSON.stringify({}) : undefined
      });
      
      if (response.status < 400) {
        console.log(`✅ ${endpoint.name}: ${response.status} OK`);
        resultados.funcionando++;
      } else {
        console.log(`❌ ${endpoint.name}: ${response.status} ${response.statusText}`);
        resultados.naoFuncionando.push(endpoint.name);
      }
      
    } catch (error) {
      console.log(`💥 ${endpoint.name}: ERRO - ${error.message}`);
      resultados.naoFuncionando.push(endpoint.name);
    }
  }
  
  console.log('\n📊 RESULTADO FINAL:');
  console.log(`✅ Funcionando: ${resultados.funcionando}/${resultados.total}`);
  console.log(`📈 Taxa de sucesso: ${Math.round(resultados.funcionando/resultados.total*100)}%`);
  
  if (resultados.funcionando === resultados.total) {
    console.log('\n🎉 SUCESSO TOTAL!');
    console.log('✅ Railway funcionando 100%');
    console.log('✅ Todos os endpoints ativos');
    console.log('✅ Sistema completo e harmônico');
    console.log('✅ Igual ao Replit!');
    console.log('\n🚀 TESTE NO NAVEGADOR:');
    console.log('1. Acesse: https://orbitrum-novo.vercel.app');
    console.log('2. Login: passosmir4@gmail.com / m6m7m8M9!horus');
    console.log('3. Teste: +Tokens e Admin Dashboard');
  } else {
    console.log('\n⚠️ AINDA HÁ PROBLEMAS:');
    console.log('❌ Endpoints não funcionando:', resultados.naoFuncionando.join(', '));
    console.log('🔧 Pode precisar aguardar mais tempo ou verificar logs');
  }
}

// Aguardar 5 minutos para o deploy terminar
console.log('⏰ Aguardando 5 minutos para o deploy do Railway terminar...');
setTimeout(testeFinalCompletoRailway, 300000); 
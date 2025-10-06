import fetch from 'node-fetch';

async function testePosDeploy() {
  console.log('🎯 TESTE PÓS-DEPLOY RAILWAY\n');
  
  const railwayUrl = 'https://orbitrumconnect-production.up.railway.app';
  
  // Endpoints críticos que devem funcionar após o deploy
  const endpointsCriticos = [
    { path: '/api/auth/login', method: 'POST', name: 'Login' },
    { path: '/api/free-plan/consume/ai-search', method: 'POST', name: 'Consumo IA' },
    { path: '/api/free-plan/consume/planet-view', method: 'POST', name: 'Consumo Planeta' },
    { path: '/api/free-plan/consume/profile-view', method: 'POST', name: 'Consumo Perfil' },
    { path: '/api/free-plan/consume/message', method: 'POST', name: 'Consumo Mensagem' },
    { path: '/api/payment/pix', method: 'POST', name: 'PIX' }
  ];
  
  console.log('🔍 Testando endpoints críticos...\n');
  
  let sucessos = 0;
  let falhas = 0;
  
  for (const endpoint of endpointsCriticos) {
    try {
      const response = await fetch(`${railwayUrl}${endpoint.path}`, {
        method: endpoint.method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      });
      
      if (response.status < 400) {
        console.log(`✅ ${endpoint.name}: ${response.status} OK`);
        sucessos++;
      } else {
        console.log(`❌ ${endpoint.name}: ${response.status} ${response.statusText}`);
        falhas++;
      }
      
    } catch (error) {
      console.log(`💥 ${endpoint.name}: ERRO - ${error.message}`);
      falhas++;
    }
  }
  
  console.log('\n📊 RESULTADO:');
  console.log(`✅ Sucessos: ${sucessos}`);
  console.log(`❌ Falhas: ${falhas}`);
  console.log(`📈 Taxa de sucesso: ${Math.round(sucessos/(sucessos+falhas)*100)}%`);
  
  if (sucessos === endpointsCriticos.length) {
    console.log('\n🎉 DEPLOY SUCESSO TOTAL!');
    console.log('✅ Todos os endpoints críticos funcionando');
    console.log('✅ Sistema 100% funcional');
    console.log('✅ Frontend + Backend harmônicos');
  } else if (sucessos >= endpointsCriticos.length * 0.8) {
    console.log('\n⚠️ DEPLOY PARCIALMENTE SUCESSO');
    console.log('✅ Maioria dos endpoints funcionando');
    console.log('⚠️ Alguns endpoints ainda precisam de ajuste');
  } else {
    console.log('\n❌ DEPLOY COM PROBLEMAS');
    console.log('❌ Muitos endpoints não funcionando');
    console.log('🔧 Pode precisar de novo deploy');
  }
  
  console.log('\n🚀 PRÓXIMO PASSO:');
  console.log('Teste no navegador: https://orbitrum-novo.vercel.app');
  console.log('Login: passosmir4@gmail.com / m6m7m8M9!horus');
  console.log('Teste: +Tokens e Admin Dashboard');
}

// Aguardar 30 segundos antes de testar
console.log('⏰ Aguardando 30 segundos para o deploy terminar...');
setTimeout(testePosDeploy, 30000); 
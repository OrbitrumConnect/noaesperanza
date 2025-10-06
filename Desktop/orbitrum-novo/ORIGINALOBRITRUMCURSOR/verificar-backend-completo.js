import fetch from 'node-fetch';

async function verificarBackendCompleto() {
  console.log('🔍 VERIFICAÇÃO COMPLETA DO BACKEND RAILWAY\n');
  
  const railwayUrl = 'https://orbitrumconnect-production.up.railway.app';
  
  const endpoints = [
    // Endpoints críticos
    { path: '/api/health', method: 'GET', critical: true },
    { path: '/api/auth/login', method: 'POST', critical: true },
    { path: '/api/admin/stats', method: 'GET', critical: true },
    { path: '/api/free-plan/limits', method: 'GET', critical: true },
    { path: '/api/professionals', method: 'GET', critical: true },
    
    // Endpoints de consumo
    { path: '/api/free-plan/consume/ai-search', method: 'POST', critical: false },
    { path: '/api/free-plan/consume/planet-view', method: 'POST', critical: false },
    { path: '/api/free-plan/consume/profile-view', method: 'POST', critical: false },
    { path: '/api/free-plan/consume/message', method: 'POST', critical: false },
    
    // Endpoints avançados
    { path: '/api/payment/pix', method: 'POST', critical: false },
    { path: '/api/websocket', method: 'GET', critical: false },
    { path: '/api/notifications', method: 'GET', critical: false },
    { path: '/api/cache', method: 'GET', critical: false },
    
    // Endpoints de chat e analytics
    { path: '/api/chat', method: 'GET', critical: false },
    { path: '/api/analytics', method: 'GET', critical: false },
    { path: '/api/service-calendar', method: 'GET', critical: false }
  ];
  
  let resultados = {
    total: endpoints.length,
    funcionando: 0,
    criticos: 0,
    criticosFuncionando: 0,
    naoFuncionando: []
  };
  
  console.log('📋 TESTANDO TODOS OS ENDPOINTS:\n');
  
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${railwayUrl}${endpoint.path}`, {
        method: endpoint.method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: endpoint.method === 'POST' ? JSON.stringify({}) : undefined
      });
      
      const status = response.status;
      const statusText = response.statusText;
      
      if (status < 400) {
        console.log(`✅ ${endpoint.path} (${endpoint.method}): ${status} ${statusText}`);
        resultados.funcionando++;
        
        if (endpoint.critical) {
          resultados.criticosFuncionando++;
        }
      } else {
        console.log(`❌ ${endpoint.path} (${endpoint.method}): ${status} ${statusText}`);
        resultados.naoFuncionando.push({
          path: endpoint.path,
          method: endpoint.method,
          status,
          critical: endpoint.critical
        });
      }
      
      if (endpoint.critical) {
        resultados.criticos++;
      }
      
    } catch (error) {
      console.log(`💥 ${endpoint.path} (${endpoint.method}): ERRO - ${error.message}`);
      resultados.naoFuncionando.push({
        path: endpoint.path,
        method: endpoint.method,
        error: error.message,
        critical: endpoint.critical
      });
    }
  }
  
  console.log('\n📊 RESUMO DOS RESULTADOS:');
  console.log(`Total de endpoints: ${resultados.total}`);
  console.log(`Funcionando: ${resultados.funcionando}/${resultados.total} (${Math.round(resultados.funcionando/resultados.total*100)}%)`);
  console.log(`Críticos funcionando: ${resultados.criticosFuncionando}/${resultados.criticos}`);
  
  if (resultados.naoFuncionando.length > 0) {
    console.log('\n❌ ENDPOINTS NÃO FUNCIONANDO:');
    resultados.naoFuncionando.forEach(endpoint => {
      const critical = endpoint.critical ? '🚨 CRÍTICO' : '⚠️ NÃO CRÍTICO';
      console.log(`   ${critical}: ${endpoint.path} (${endpoint.method})`);
    });
  }
  
  console.log('\n🎯 DIAGNÓSTICO:');
  
  if (resultados.criticosFuncionando === resultados.criticos) {
    console.log('✅ BACKEND CRÍTICO: 100% FUNCIONAL');
  } else {
    console.log('❌ BACKEND CRÍTICO: INCOMPLETO');
  }
  
  if (resultados.funcionando >= resultados.total * 0.8) {
    console.log('✅ BACKEND GERAL: 80%+ FUNCIONAL');
  } else {
    console.log('⚠️ BACKEND GERAL: PRECISA MELHORIAS');
  }
  
  // Verificar se precisa atualizar o Railway
  const endpointsCriticosFaltando = resultados.naoFuncionando.filter(e => e.critical);
  
  if (endpointsCriticosFaltando.length > 0) {
    console.log('\n🚨 AÇÃO NECESSÁRIA:');
    console.log('O Railway precisa ser atualizado com o código mais recente!');
    console.log('Endpoints críticos faltando:', endpointsCriticosFaltando.map(e => e.path));
  } else {
    console.log('\n🎉 BACKEND ESTÁ COMPLETO E COMPATÍVEL!');
  }
}

verificarBackendCompleto(); 
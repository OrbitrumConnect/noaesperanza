import https from 'https';

console.log('🔍 VERIFICANDO SE O CÓDIGO NOVO FOI CARREGADO...\n');

const tests = [
  {
    name: 'Health Check - Versão',
    url: 'https://orbitrumconnect-production.up.railway.app/api/health',
    check: (data) => {
      const json = JSON.parse(data);
      return json.version === '2.0.0' && json.codigoAtualizado === true;
    }
  },
  {
    name: 'Teste Código Atualizado',
    url: 'https://orbitrumconnect-production.up.railway.app/api/teste-codigo',
    check: (data) => {
      const json = JSON.parse(data);
      return json.version === '2.0.0' && json.rotas && json.rotas.length > 0;
    }
  },
  {
    name: 'Free Plan Limits',
    url: 'https://orbitrumconnect-production.up.railway.app/api/free-plan/limits',
    check: (data) => {
      const json = JSON.parse(data);
      return json.success === true && json.isFreePlan === true;
    }
  },
  {
    name: 'Consume AI Search',
    url: 'https://orbitrumconnect-production.up.railway.app/api/free-plan/consume/ai-search',
    method: 'POST',
    data: JSON.stringify({ userId: 1 }),
    check: (data) => {
      const json = JSON.parse(data);
      return json.success === true;
    }
  }
];

async function testEndpoint(test) {
  return new Promise((resolve) => {
    const options = {
      method: test.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Orbitrum-Test/1.0'
      }
    };

    if (test.data) {
      options.headers['Content-Length'] = Buffer.byteLength(test.data);
    }

    const req = https.request(test.url, options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const success = test.check(data);
          
          console.log(`📊 ${test.name}:`);
          console.log(`   Status: ${res.statusCode}`);
          console.log(`   Código Novo: ${success ? '✅' : '❌'}`);
          console.log(`   Response: ${data.substring(0, 150)}${data.length > 150 ? '...' : ''}`);
          console.log('');
          
          resolve({ success, statusCode: res.statusCode, data });
        } catch (error) {
          console.log(`📊 ${test.name}:`);
          console.log(`   Status: ${res.statusCode}`);
          console.log(`   Código Novo: ❌ (Erro: ${error.message})`);
          console.log(`   Response: ${data.substring(0, 150)}${data.length > 150 ? '...' : ''}`);
          console.log('');
          
          resolve({ success: false, statusCode: res.statusCode, data, error: error.message });
        }
      });
    });

    req.on('error', (error) => {
      console.log(`📊 ${test.name}:`);
      console.log(`   Error: ❌ ${error.message}`);
      console.log('');
      
      resolve({ success: false, error: error.message });
    });

    if (test.data) {
      req.write(test.data);
    }
    
    req.end();
  });
}

async function runTests() {
  console.log('🚀 Verificando código atualizado no Railway...\n');
  
  let passed = 0;
  let total = tests.length;
  
  for (const test of tests) {
    const result = await testEndpoint(test);
    if (result.success) passed++;
    
    // Aguarda 2 segundos entre testes
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log('📈 RESULTADO FINAL:');
  console.log(`✅ Código Novo: ${passed}/${total}`);
  console.log(`❌ Código Antigo: ${total - passed}/${total}`);
  
  if (passed === total) {
    console.log('\n🎉 SUCESSO! Código atualizado carregado!');
    console.log('🚀 Sistema 100% operacional com código novo!');
  } else if (passed > 0) {
    console.log('\n⚠️ Código parcialmente atualizado. Aguarde mais alguns minutos.');
  } else {
    console.log('\n❌ Código ainda antigo. Verifique se o deploy terminou.');
  }
}

runTests().catch(console.error); 
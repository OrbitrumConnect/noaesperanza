import https from 'https';

console.log('🎯 TESTE FINAL - RAILWAY COM CÓDIGO NOVO\n');

const tests = [
  {
    name: 'Health Check - Versão 2.0.0',
    url: 'https://orbitrumconnect-production.up.railway.app/api/health',
    expected: {
      version: '2.0.0',
      codigoAtualizado: true,
      message: '🚀 Backend funcionando no Railway!'
    }
  },
  {
    name: 'Teste Código Atualizado',
    url: 'https://orbitrumconnect-production.up.railway.app/api/teste-codigo',
    expected: {
      version: '2.0.0',
      rotas: [
        '/api/free-plan/consume/ai-search',
        '/api/free-plan/consume/planet-view',
        '/api/free-plan/consume/profile-view',
        '/api/free-plan/consume/message',
        '/api/payment/pix'
      ]
    }
  },
  {
    name: 'Free Plan Limits',
    url: 'https://orbitrumconnect-production.up.railway.app/api/free-plan/limits',
    expected: {
      success: true,
      isFreePlan: true,
      limits: {
        monthlyAiSearches: 10,
        planetViewsEvery3Days: 2,
        dailyProfileViews: 1,
        monthlyMessages: 2
      }
    }
  },
  {
    name: 'Consume AI Search',
    url: 'https://orbitrumconnect-production.up.railway.app/api/free-plan/consume/ai-search',
    method: 'POST',
    data: JSON.stringify({ userId: 1 }),
    expected: {
      success: true,
      consumed: true
    }
  },
  {
    name: 'Payment PIX',
    url: 'https://orbitrumconnect-production.up.railway.app/api/payment/pix',
    method: 'POST',
    data: JSON.stringify({ amount: 10, description: 'Teste' }),
    expected: {
      success: true
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
          const json = JSON.parse(data);
          let success = true;
          let details = [];
          
          // Verificar cada campo esperado
          for (const [key, value] of Object.entries(test.expected)) {
            if (Array.isArray(value)) {
              if (!Array.isArray(json[key]) || json[key].length < value.length) {
                success = false;
                details.push(`❌ ${key}: esperado array com ${value.length} itens`);
              } else {
                details.push(`✅ ${key}: array com ${json[key].length} itens`);
              }
            } else if (typeof value === 'object') {
              if (JSON.stringify(json[key]) !== JSON.stringify(value)) {
                success = false;
                details.push(`❌ ${key}: não confere`);
              } else {
                details.push(`✅ ${key}: confere`);
              }
            } else {
              if (json[key] !== value) {
                success = false;
                details.push(`❌ ${key}: esperado "${value}", recebido "${json[key]}"`);
              } else {
                details.push(`✅ ${key}: "${value}"`);
              }
            }
          }
          
          console.log(`📊 ${test.name}:`);
          console.log(`   Status: ${res.statusCode}`);
          console.log(`   Success: ${success ? '✅' : '❌'}`);
          details.forEach(detail => console.log(`   ${detail}`));
          console.log('');
          
          resolve({ success, statusCode: res.statusCode, data: json });
        } catch (error) {
          console.log(`📊 ${test.name}:`);
          console.log(`   Status: ${res.statusCode}`);
          console.log(`   Success: ❌ (JSON parse error)`);
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
  console.log('🚀 Testando Railway com código novo...\n');
  
  let passed = 0;
  let total = tests.length;
  
  for (const test of tests) {
    const result = await testEndpoint(test);
    if (result.success) passed++;
    
    // Aguarda 2 segundos entre testes
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log('📈 RESULTADO FINAL:');
  console.log(`✅ Passou: ${passed}/${total}`);
  console.log(`❌ Falhou: ${total - passed}/${total}`);
  
  if (passed === total) {
    console.log('\n🎉 SUCESSO TOTAL!');
    console.log('🚀 Railway 100% operacional com código novo!');
    console.log('✅ Todos os endpoints funcionando!');
    console.log('🎯 Sistema igual ao Replit!');
  } else if (passed > total * 0.7) {
    console.log('\n⚠️ Quase lá! Alguns endpoints ainda precisam de ajuste.');
  } else {
    console.log('\n❌ Ainda usando código antigo. Aguarde mais alguns minutos.');
  }
}

runTests().catch(console.error); 
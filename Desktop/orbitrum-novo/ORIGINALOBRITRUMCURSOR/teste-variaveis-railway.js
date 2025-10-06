import https from 'https';

console.log('🧪 TESTANDO VARIÁVEIS DO RAILWAY...\n');

const tests = [
  {
    name: 'Health Check',
    url: 'https://orbitrumconnect-production.up.railway.app/api/health',
    expected: 'status: "healthy"'
  },
  {
    name: 'Teste Código Atualizado',
    url: 'https://orbitrumconnect-production.up.railway.app/api/teste-codigo',
    expected: 'success: true'
  },
  {
    name: 'Free Plan Limits',
    url: 'https://orbitrumconnect-production.up.railway.app/api/free-plan/limits',
    expected: 'success: true'
  },
  {
    name: 'Auth Login',
    url: 'https://orbitrumconnect-production.up.railway.app/api/auth/login',
    method: 'POST',
    data: JSON.stringify({
      email: 'passosmir4@gmail.com',
      password: 'm6m7m8M9!horus'
    }),
    expected: 'success: true'
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
          const success = data.includes(test.expected);
          
          console.log(`📊 ${test.name}:`);
          console.log(`   Status: ${res.statusCode}`);
          console.log(`   Success: ${success ? '✅' : '❌'}`);
          console.log(`   Response: ${data.substring(0, 200)}${data.length > 200 ? '...' : ''}`);
          console.log('');
          
          resolve({ success, statusCode: res.statusCode, data });
        } catch (error) {
          console.log(`📊 ${test.name}:`);
          console.log(`   Status: ${res.statusCode}`);
          console.log(`   Success: ❌ (JSON parse error)`);
          console.log(`   Response: ${data.substring(0, 200)}${data.length > 200 ? '...' : ''}`);
          console.log('');
          
          resolve({ success: false, statusCode: res.statusCode, data });
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
  console.log('🚀 Iniciando testes do Railway...\n');
  
  let passed = 0;
  let total = tests.length;
  
  for (const test of tests) {
    const result = await testEndpoint(test);
    if (result.success) passed++;
    
    // Aguarda 1 segundo entre testes
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('📈 RESULTADO FINAL:');
  console.log(`✅ Passou: ${passed}/${total}`);
  console.log(`❌ Falhou: ${total - passed}/${total}`);
  
  if (passed === total) {
    console.log('\n🎉 SUCESSO! Todas as variáveis estão funcionando!');
    console.log('🚀 Sistema 100% operacional no Railway!');
  } else {
    console.log('\n⚠️ Alguns testes falharam. Verifique as variáveis.');
  }
}

runTests().catch(console.error); 
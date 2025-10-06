import fetch from 'node-fetch';

async function testeVercelDireto() {
  console.log('🎯 TESTE DIRETO - VERCEL +TOKENS\n');
  
  const vercelUrl = 'https://orbitrum-novo.vercel.app';
  
  try {
    // Teste direto do endpoint +Tokens
    console.log('🔍 Testando /api/free-plan/limits...');
    const response = await fetch(`${vercelUrl}/api/free-plan/limits`);
    
    console.log(`Status: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Resposta:', JSON.stringify(data, null, 2));
    } else {
      const errorText = await response.text();
      console.log('❌ Erro:', errorText);
    }
    
    // Teste do endpoint de login também
    console.log('\n🔍 Testando /api/auth/login...');
    const loginResponse = await fetch(`${vercelUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'passosmir4@gmail.com',
        password: 'm6m7m8M9!horus'
      })
    });
    
    console.log(`Login Status: ${loginResponse.status} ${loginResponse.statusText}`);
    
    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      console.log('✅ Login Resposta:', JSON.stringify(loginData, null, 2));
    } else {
      const loginErrorText = await loginResponse.text();
      console.log('❌ Login Erro:', loginErrorText);
    }
    
  } catch (error) {
    console.log('💥 ERRO:', error.message);
  }
}

testeVercelDireto(); 
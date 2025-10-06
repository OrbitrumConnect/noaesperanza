import fetch from 'node-fetch';

async function descobrirRailway() {
  console.log('🔍 DESCOBRINDO SEU RAILWAY EXISTENTE...\n');
  
  // URLs comuns do Railway
  const urlsPossiveis = [
    'https://orbitrum-novo-production.up.railway.app',
    'https://orbitrum-backend-production.up.railway.app',
    'https://orbitrum-server-production.up.railway.app',
    'https://chatodemais-production.up.railway.app',
    'https://orbitrum-connect-production.up.railway.app',
    'https://orbitrum-api-production.up.railway.app'
  ];
  
  console.log('🔍 Testando URLs comuns do Railway...\n');
  
  for (const url of urlsPossiveis) {
    try {
      console.log(`Testando: ${url}`);
      const response = await fetch(`${url}/api/health`, { timeout: 5000 });
      
      if (response.ok) {
        const data = await response.text();
        console.log(`   ✅ ENCONTRADO! Status: ${response.status}`);
        console.log(`   Resposta: ${data.substring(0, 100)}...`);
        
        // Teste adicional: login admin
        try {
          const loginResponse = await fetch(`${url}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: 'passosmir4@gmail.com',
              password: 'm6m7m8M9!horus'
            }),
            timeout: 5000
          });
          
          if (loginResponse.ok) {
            const loginData = await loginResponse.json();
            console.log(`   ✅ Login admin funciona!`);
            console.log(`   UserType: ${loginData.user?.userType || 'N/A'}`);
            console.log(`\n🎉 SEU RAILWAY ESTÁ EM: ${url}`);
            console.log(`🔗 Agora configure o Vercel para usar esta URL!`);
            return url;
          }
        } catch (loginError) {
          console.log(`   ⚠️ Login falhou, mas health check OK`);
        }
      } else {
        console.log(`   ❌ Não encontrado (${response.status})`);
      }
    } catch (error) {
      console.log(`   ❌ Erro: ${error.message}`);
    }
    console.log('');
  }
  
  console.log('❌ Nenhuma URL do Railway encontrada!');
  console.log('\n💡 OPÇÕES:');
  console.log('   1. Acesse: railway.app/dashboard');
  console.log('   2. Veja seus projetos ativos');
  console.log('   3. Copie a URL do projeto');
  console.log('   4. Me passe a URL para configurar');
  
  return null;
}

descobrirRailway(); 
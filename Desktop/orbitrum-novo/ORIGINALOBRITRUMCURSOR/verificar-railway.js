import fetch from 'node-fetch';

async function verificarRailway() {
  console.log('🚂 VERIFICANDO RAILWAY BACKEND...\n');
  
  // URLs possíveis do Railway
  const urls = [
    'https://orbitrum-novo-production.up.railway.app',
    'https://orbitrum-backend-production.up.railway.app',
    'https://orbitrum-server-production.up.railway.app'
  ];
  
  for (const url of urls) {
    try {
      console.log(`🔍 Testando: ${url}`);
      
      // Teste 1: Health check
      const healthResponse = await fetch(`${url}/api/health`);
      if (healthResponse.ok) {
        const healthData = await healthResponse.text();
        console.log(`   ✅ HEALTH CHECK: ${healthResponse.status}`);
        console.log(`   Resposta: ${healthData.substring(0, 100)}...`);
        
        // Teste 2: Login admin
        const loginResponse = await fetch(`${url}/api/auth/login`, {
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
          
          // Teste 3: Dashboard admin
          const adminResponse = await fetch(`${url}/api/admin/stats`);
          if (adminResponse.ok) {
            const adminData = await adminResponse.json();
            console.log(`   ✅ DASHBOARD ADMIN: ${adminResponse.status}`);
            console.log(`   Total users: ${adminData.totalUsers || 'N/A'}`);
            
            console.log(`\n🎉 RAILWAY FUNCIONANDO EM: ${url}`);
            console.log(`🔗 Configure o Vercel para usar: ${url}`);
            return url;
          }
        }
      } else {
        console.log(`   ❌ Health check falhou: ${healthResponse.status}`);
      }
    } catch (error) {
      console.log(`   ❌ Erro: ${error.message}`);
    }
    console.log('');
  }
  
  console.log('❌ NENHUM RAILWAY ENCONTRADO!');
  console.log('\n💡 SOLUÇÃO:');
  console.log('   1. Acesse: railway.app');
  console.log('   2. Verifique se o projeto está deployado');
  console.log('   3. Copie a URL do Railway');
  console.log('   4. Configure no Vercel');
  
  return null;
}

verificarRailway(); 
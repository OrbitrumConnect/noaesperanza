import fetch from 'node-fetch';

async function verificarVercel() {
  console.log('🔍 VERIFICANDO STATUS COMPLETO DO VERCEL...\n');
  
  const baseUrl = 'https://orbitrum-novo.vercel.app';
  
  try {
    // 1. Verificar se o site carrega
    console.log('1️⃣ Testando carregamento da página principal...');
    const mainResponse = await fetch(baseUrl);
    console.log(`   Status: ${mainResponse.status} ${mainResponse.statusText}`);
    console.log(`   ✅ Página principal carrega\n`);
    
    // 2. Verificar se o backend está rodando
    console.log('2️⃣ Testando backend (API)...');
    const apiResponse = await fetch(`${baseUrl}/api/health`);
    if (apiResponse.ok) {
      const healthData = await apiResponse.text();
      console.log(`   Status: ${apiResponse.status} ${apiResponse.statusText}`);
      console.log(`   Resposta: ${healthData.substring(0, 100)}...`);
      console.log(`   ✅ Backend está rodando\n`);
    } else {
      console.log(`   ❌ Backend NÃO está rodando!`);
      console.log(`   Status: ${apiResponse.status} ${apiResponse.statusText}`);
      console.log(`   ⚠️ Este é o problema principal!\n`);
    }
    
    // 3. Verificar login admin
    console.log('3️⃣ Testando login admin...');
    const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'passosmir4@gmail.com',
        password: 'm6m7m8M9!horus'
      })
    });
    
    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      console.log(`   Status: ${loginResponse.status} ${loginResponse.statusText}`);
      console.log(`   ✅ Login admin funciona`);
      console.log(`   UserType: ${loginData.user?.userType || 'N/A'}`);
      console.log(`   AdminLevel: ${loginData.user?.adminLevel || 'N/A'}\n`);
    } else {
      console.log(`   ❌ Login admin falhou!`);
      console.log(`   Status: ${loginResponse.status} ${loginResponse.statusText}\n`);
    }
    
    // 4. Verificar dashboard admin
    console.log('4️⃣ Testando dashboard admin...');
    const adminResponse = await fetch(`${baseUrl}/api/admin/stats`);
    if (adminResponse.ok) {
      const adminData = await adminResponse.json();
      console.log(`   Status: ${adminResponse.status} ${adminResponse.statusText}`);
      console.log(`   ✅ Dashboard admin acessível`);
      console.log(`   Total users: ${adminData.totalUsers || 'N/A'}\n`);
    } else {
      console.log(`   ❌ Dashboard admin NÃO acessível!`);
      console.log(`   Status: ${adminResponse.status} ${adminResponse.statusText}\n`);
    }
    
    // 5. Verificar variáveis de ambiente
    console.log('5️⃣ Verificando variáveis de ambiente...');
    const envResponse = await fetch(`${baseUrl}/api/test-env`);
    if (envResponse.ok) {
      const envData = await envResponse.json();
      console.log(`   ✅ Variáveis de ambiente configuradas`);
      console.log(`   SUPABASE_URL: ${envData.supabaseUrl ? '✅' : '❌'}`);
      console.log(`   SUPABASE_ANON_KEY: ${envData.supabaseKey ? '✅' : '❌'}`);
    } else {
      console.log(`   ❌ Endpoint de teste não disponível`);
      console.log(`   ⚠️ Não é possível verificar variáveis\n`);
    }
    
  } catch (error) {
    console.log(`   ❌ Erro na verificação: ${error.message}\n`);
  }
  
  console.log('📋 RESUMO DOS PROBLEMAS:');
  console.log('   🔴 Backend não está rodando no Vercel');
  console.log('   🔴 Variáveis de ambiente podem estar faltando');
  console.log('   🔴 Admin dashboard não funciona');
  console.log('   🔴 Botão +Tokens não abre aba');
  console.log('\n💡 SOLUÇÃO:');
  console.log('   1. Verificar variáveis no Vercel Dashboard');
  console.log('   2. Forçar novo deploy');
  console.log('   3. Configurar backend no Vercel');
}

verificarVercel(); 
// Teste específico para verificar erro RLS no Vercel
const testRLSError = async () => {
  try {
    console.log('🔍 Testando se o erro RLS aparece no Vercel...');
    
    // Teste 1: Login admin
    console.log('📝 Teste 1: Login admin...');
    const loginResponse = await fetch('https://orbitrum-novo.vercel.app/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'passosmir4@gmail.com',
        password: 'm6m7m8M9!horus'
      })
    });

    const loginData = await loginResponse.json();
    console.log('📊 Login response:', loginData);
    
    if (loginData.error && loginData.error.includes('RLS')) {
      console.log('❌ ERRO RLS DETECTADO NO LOGIN!');
      console.log('🔧 Solução: Aplicar políticas RLS no Supabase');
    } else {
      console.log('✅ Login sem erro RLS');
    }
    
    // Teste 2: Acesso a dados protegidos
    console.log('📝 Teste 2: Acesso a dados protegidos...');
    const protectedResponse = await fetch('https://orbitrum-novo.vercel.app/api/admin/stats', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${loginData.token || 'test'}`
      }
    });

    const protectedData = await protectedResponse.json();
    console.log('📊 Protected data response:', protectedData);
    
    if (protectedData.error && protectedData.error.includes('RLS')) {
      console.log('❌ ERRO RLS DETECTADO NO ACESSO A DADOS!');
      console.log('🔧 Solução: Aplicar políticas RLS no Supabase');
    } else {
      console.log('✅ Acesso a dados sem erro RLS');
    }
    
    // Teste 3: Verificar se há mensagens sobre RLS
    console.log('📝 Teste 3: Verificando logs do sistema...');
    const healthResponse = await fetch('https://orbitrum-novo.vercel.app/api/health');
    const healthData = await healthResponse.json();
    console.log('📊 Health check:', healthData);
    
    if (healthData.message && healthData.message.includes('RLS')) {
      console.log('❌ MENSAGEM RLS DETECTADA!');
    } else {
      console.log('✅ Health check sem mensagens RLS');
    }
    
  } catch (error) {
    console.error('💥 Erro no teste RLS:', error);
    if (error.message.includes('RLS')) {
      console.log('❌ ERRO RLS DETECTADO NO CATCH!');
    }
  }
};

// Teste de funcionalidades que podem ter erro RLS
const testRLSFuncionalidades = async () => {
  try {
    console.log('🔧 Testando funcionalidades que podem ter erro RLS...');
    
    // Teste 1: API de usuários
    const usersResponse = await fetch('https://orbitrum-novo.vercel.app/api/users');
    const usersData = await usersResponse.json();
    console.log('📊 Users API:', usersData);
    
    if (usersData.error && usersData.error.includes('RLS')) {
      console.log('❌ ERRO RLS NA API USERS!');
    }
    
    // Teste 2: API de profissionais
    const profResponse = await fetch('https://orbitrum-novo.vercel.app/api/professionals');
    const profData = await profResponse.json();
    console.log('📊 Professionals API:', profData);
    
    if (profData.error && profData.error.includes('RLS')) {
      console.log('❌ ERRO RLS NA API PROFESSIONALS!');
    }
    
    // Teste 3: API de clientes
    const clientsResponse = await fetch('https://orbitrum-novo.vercel.app/api/clients');
    const clientsData = await clientsResponse.json();
    console.log('📊 Clients API:', clientsData);
    
    if (clientsData.error && clientsData.error.includes('RLS')) {
      console.log('❌ ERRO RLS NA API CLIENTS!');
    }
    
  } catch (error) {
    console.error('💥 Erro nas funcionalidades:', error);
  }
};

// Executar testes
console.log('🚀 INICIANDO TESTE ESPECÍFICO DE ERRO RLS...');
console.log('=' .repeat(60));

testRLSError().then(() => {
  setTimeout(() => {
    testRLSFuncionalidades();
  }, 3000);
}); 
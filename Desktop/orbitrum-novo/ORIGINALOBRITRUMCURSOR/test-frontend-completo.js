// Teste completo do frontend - Dashboard Admin
const testFrontendCompleto = async () => {
  try {
    console.log('🌐 Testando frontend completo no Vercel...');
    
    // Teste 1: Página principal
    console.log('📄 Testando página principal...');
    const mainPage = await fetch('https://orbitrum-novo.vercel.app/');
    console.log('✅ Página principal:', mainPage.status === 200 ? 'OK' : 'ERRO');
    
    // Teste 2: Página de login
    console.log('🔐 Testando página de login...');
    const loginPage = await fetch('https://orbitrum-novo.vercel.app/login');
    console.log('✅ Página de login:', loginPage.status === 200 ? 'OK' : 'ERRO');
    
    // Teste 3: Página admin (deve redirecionar se não logado)
    console.log('👑 Testando página admin...');
    const adminPage = await fetch('https://orbitrum-novo.vercel.app/admin');
    console.log('✅ Página admin:', adminPage.status === 200 ? 'OK' : 'ERRO');
    
    // Teste 4: Assets estáticos
    console.log('🎨 Testando assets estáticos...');
    const favicon = await fetch('https://orbitrum-novo.vercel.app/favicon.ico');
    console.log('✅ Favicon:', favicon.status === 200 ? 'OK' : 'ERRO');
    
    console.log('🎉 Teste frontend completo finalizado!');
    
  } catch (error) {
    console.error('💥 Erro no teste frontend:', error);
  }
};

// Teste de funcionalidades específicas
const testFuncionalidadesEspecificas = async () => {
  try {
    console.log('🔧 Testando funcionalidades específicas...');
    
    // Teste 1: API de profissionais
    const professionals = await fetch('https://orbitrum-novo.vercel.app/api/professionals');
    console.log('✅ API Profissionais:', professionals.status === 200 ? 'OK' : 'ERRO');
    
    // Teste 2: API de usuários
    const users = await fetch('https://orbitrum-novo.vercel.app/api/users');
    console.log('✅ API Usuários:', users.status === 200 ? 'OK' : 'ERRO');
    
    // Teste 3: API de estatísticas
    const stats = await fetch('https://orbitrum-novo.vercel.app/api/admin/stats');
    console.log('✅ API Stats:', stats.status === 200 ? 'OK' : 'ERRO');
    
  } catch (error) {
    console.error('💥 Erro nas funcionalidades:', error);
  }
};

// Executar testes
console.log('🚀 INICIANDO TESTE FRONTEND COMPLETO...');
console.log('=' .repeat(50));

testFrontendCompleto().then(() => {
  setTimeout(() => {
    testFuncionalidadesEspecificas();
  }, 2000);
}); 
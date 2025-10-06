// Teste de login admin no Vercel
const testVercelAdminLogin = async () => {
  try {
    console.log('🔍 Testando login admin no VERCEL...');
    
    const response = await fetch('https://orbitrum-novo.vercel.app/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'passosmir4@gmail.com',
        password: 'm6m7m8M9!horus'
      })
    });

    const data = await response.json();
    console.log('📊 Resposta do login Vercel:', data);
    
    if (data.success) {
      console.log('✅ Login admin Vercel bem-sucedido!');
      console.log('👤 Usuário:', data.user);
      console.log('🔑 Token:', data.token);
    } else {
      console.log('❌ Falha no login admin Vercel:', data.message);
    }
  } catch (error) {
    console.error('💥 Erro no teste Vercel:', error);
  }
};

// Teste de verificação admin no Vercel
const testVercelAdminCheck = async () => {
  try {
    console.log('🔍 Testando verificação admin no VERCEL...');
    
    const response = await fetch('https://orbitrum-novo.vercel.app/api/admin/stats', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    const data = await response.json();
    console.log('📊 Resposta da verificação admin Vercel:', data);
    
    if (response.ok) {
      console.log('✅ Verificação admin Vercel bem-sucedida!');
      console.log('📊 Stats:', data);
    } else {
      console.log('❌ Falha na verificação admin Vercel:', data.message);
    }
  } catch (error) {
    console.error('💥 Erro na verificação Vercel:', error);
  }
};

// Executar testes
console.log('🚀 INICIANDO TESTES COMPLETOS DO VERCEL...');
console.log('=' .repeat(50));

testVercelAdminLogin().then(() => {
  setTimeout(() => {
    testVercelAdminCheck();
  }, 2000);
}); 
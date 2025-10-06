// Teste de login admin
const testAdminLogin = async () => {
  try {
    console.log('🔍 Testando login admin...');
    
    const response = await fetch('http://localhost:5000/api/auth/login', {
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
    console.log('📊 Resposta do login:', data);
    
    if (data.success) {
      console.log('✅ Login admin bem-sucedido!');
      console.log('👤 Usuário:', data.user);
      console.log('🔑 Token:', data.token);
    } else {
      console.log('❌ Falha no login admin:', data.message);
    }
  } catch (error) {
    console.error('💥 Erro no teste:', error);
  }
};

// Teste de verificação de admin
const testAdminCheck = async () => {
  try {
    console.log('🔍 Testando verificação de admin...');
    
    const response = await fetch('http://localhost:5000/api/admin/stats');
    const data = await response.json();
    
    console.log('📊 Resposta da verificação admin:', data);
  } catch (error) {
    console.error('💥 Erro na verificação admin:', error);
  }
};

// Executar testes
testAdminLogin();
setTimeout(testAdminCheck, 2000); 
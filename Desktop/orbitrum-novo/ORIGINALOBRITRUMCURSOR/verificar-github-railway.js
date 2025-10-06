import https from 'https';

console.log('🔍 VERIFICANDO CONEXÃO RAILWAY-GITHUB...\n');

// Teste 1: Verificar se o Railway está respondendo
async function testRailwayConnection() {
  return new Promise((resolve) => {
    const req = https.request('https://orbitrumconnect-production.up.railway.app/api/health', (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          console.log('📊 Railway Connection:');
          console.log(`   Status: ${res.statusCode}`);
          console.log(`   Version: ${json.version}`);
          console.log(`   Uptime: ${json.uptime?.toFixed(2)}s`);
          console.log(`   Timestamp: ${json.timestamp}`);
          console.log('');
          
          resolve({ success: true, version: json.version, uptime: json.uptime });
        } catch (error) {
          console.log('📊 Railway Connection:');
          console.log(`   Error: ❌ ${error.message}`);
          console.log('');
          
          resolve({ success: false, error: error.message });
        }
      });
    });

    req.on('error', (error) => {
      console.log('📊 Railway Connection:');
      console.log(`   Error: ❌ ${error.message}`);
      console.log('');
      
      resolve({ success: false, error: error.message });
    });

    req.end();
  });
}

// Teste 2: Verificar se há logs de deploy recente
async function checkDeployLogs() {
  console.log('📋 INSTRUÇÕES PARA VERIFICAR DEPLOY:');
  console.log('');
  console.log('1. Acesse: https://railway.app/dashboard');
  console.log('2. Projeto: orbitrumconnect-production');
  console.log('3. Vá em "Deployments"');
  console.log('4. Verifique se há deploy recente (últimos 10 minutos)');
  console.log('5. Clique no deploy mais recente');
  console.log('6. Verifique os logs de build');
  console.log('');
  console.log('🔍 PROCURE POR ESTES LOGS:');
  console.log('   ✅ "Installing dependencies..."');
  console.log('   ✅ "cd server && npm install"');
  console.log('   ✅ "cd server && tsx index.ts"');
  console.log('   ✅ "🚀 Iniciando servidor..."');
  console.log('   ✅ "✅ Servidor iniciado com sucesso!"');
  console.log('');
  console.log('❌ SE VER ESTES LOGS, ESTÁ USANDO CÓDIGO ANTIGO:');
  console.log('   ❌ "index-simple"');
  console.log('   ❌ "version: 1.0.0"');
  console.log('   ❌ "Orbitrum Connect Backend API"');
  console.log('');
}

// Teste 3: Forçar novo deploy
async function forceNewDeploy() {
  console.log('🚀 FORÇANDO NOVO DEPLOY:');
  console.log('');
  console.log('1. Railway Dashboard → Deployments');
  console.log('2. Clique em "Deploy" ou "Redeploy"');
  console.log('3. Aguarde o build terminar (2-5 minutos)');
  console.log('4. Verifique os logs para confirmar código novo');
  console.log('');
  console.log('⏰ TEMPO ESTIMADO: 5-10 minutos');
  console.log('');
}

async function runDiagnostic() {
  console.log('🔧 DIAGNÓSTICO RAILWAY-GITHUB\n');
  
  // Teste 1
  const connection = await testRailwayConnection();
  
  if (connection.success) {
    console.log(`📊 ANÁLISE:`);
    console.log(`   Version: ${connection.version}`);
    console.log(`   Uptime: ${connection.uptime?.toFixed(2)}s`);
    
    if (connection.version === '1.0.0') {
      console.log(`   Status: ❌ CÓDIGO ANTIGO`);
      console.log(`   Ação: Forçar novo deploy`);
    } else {
      console.log(`   Status: ✅ CÓDIGO NOVO`);
    }
  }
  
  console.log('');
  
  // Teste 2
  await checkDeployLogs();
  
  // Teste 3
  await forceNewDeploy();
  
  console.log('🎯 PRÓXIMOS PASSOS:');
  console.log('1. Verifique os logs de deploy no Railway');
  console.log('2. Force um novo deploy se necessário');
  console.log('3. Aguarde 5-10 minutos');
  console.log('4. Execute: node verificar-codigo-novo.js');
}

runDiagnostic().catch(console.error); 
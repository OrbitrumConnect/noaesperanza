import https from 'https';

console.log('🔍 MONITORANDO DEPLOY DO RAILWAY...\n');

let attempts = 0;
const maxAttempts = 30; // 5 minutos (10s cada)

async function checkDeploy() {
  return new Promise((resolve) => {
    const req = https.request('https://orbitrumconnect-production.up.railway.app/api/health', (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ success: true, version: json.version, uptime: json.uptime, timestamp: json.timestamp });
        } catch (error) {
          resolve({ success: false, error: error.message });
        }
      });
    });

    req.on('error', (error) => {
      resolve({ success: false, error: error.message });
    });

    req.setTimeout(5000, () => {
      resolve({ success: false, error: 'Timeout' });
    });

    req.end();
  });
}

async function monitor() {
  console.log('⏰ Aguardando deploy terminar...\n');
  
  while (attempts < maxAttempts) {
    attempts++;
    
    console.log(`📊 Tentativa ${attempts}/${maxAttempts}...`);
    
    const result = await checkDeploy();
    
    if (result.success) {
      console.log(`   Status: ✅ Online`);
      console.log(`   Version: ${result.version}`);
      console.log(`   Uptime: ${result.uptime?.toFixed(2)}s`);
      console.log(`   Timestamp: ${result.timestamp}`);
      
      if (result.version === '2.0.0') {
        console.log('\n🎉 SUCESSO! CÓDIGO NOVO CARREGADO!');
        console.log('🚀 Sistema 100% operacional!');
        console.log('\n✅ Próximo passo: Testar endpoints');
        return true;
      } else if (result.uptime < 60) {
        console.log('\n🔄 Deploy em andamento... (uptime baixo)');
        console.log('⏰ Aguarde mais alguns minutos...');
      } else {
        console.log('\n⚠️ Deploy terminou, mas ainda código antigo');
        console.log('❌ Versão:', result.version);
      }
    } else {
      console.log(`   Status: ❌ Offline (${result.error})`);
      console.log('   ⏰ Deploy ainda em andamento...');
    }
    
    console.log('');
    
    if (attempts < maxAttempts) {
      console.log('⏰ Aguardando 10 segundos...\n');
      await new Promise(resolve => setTimeout(resolve, 10000));
    }
  }
  
  console.log('⏰ Tempo limite atingido (5 minutos)');
  console.log('🔍 Verifique manualmente no Railway Dashboard');
  return false;
}

async function runMonitor() {
  const success = await monitor();
  
  if (success) {
    console.log('\n🎯 EXECUTE AGORA:');
    console.log('node verificar-codigo-novo.js');
  } else {
    console.log('\n⚠️ Deploy pode estar demorando mais que o esperado');
    console.log('🔍 Verifique os logs no Railway Dashboard');
  }
}

runMonitor().catch(console.error); 
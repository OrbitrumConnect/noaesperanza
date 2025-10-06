import { execSync } from 'child_process';
import fs from 'fs';

console.log('🧪 Testando build...');

try {
  // Testar se o vite build funciona
  console.log('📦 Testando npm run build...');
  execSync('npm run build', { stdio: 'inherit' });
  
  // Verificar se a pasta dist foi criada
  if (fs.existsSync('dist')) {
    console.log('✅ Pasta dist criada com sucesso');
    
    // Verificar se o index.html foi gerado
    if (fs.existsSync('dist/public/index.html')) {
      console.log('✅ index.html gerado com sucesso');
    } else {
      console.log('❌ index.html não encontrado');
    }
  } else {
    console.log('❌ Pasta dist não foi criada');
  }
  
  console.log('✅ Teste de build concluído!');
  
} catch (error) {
  console.error('❌ Erro no teste:', error.message);
  process.exit(1);
} 
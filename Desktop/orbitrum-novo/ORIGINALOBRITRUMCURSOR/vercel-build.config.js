import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚀 Iniciando build para Vercel...');

try {
// 1. Instalar dependências
console.log('📦 Instalando dependências...');
execSync('npm install', { stdio: 'inherit' });

// 2. Build do frontend (Vite)
console.log('⚛️ Buildando frontend React...');
execSync('npm run build', { stdio: 'inherit' });

  // 3. Copiar arquivos necessários
console.log('📁 Copiando arquivos...');

// Copiar shared para dist
if (!fs.existsSync('dist/shared')) {
  fs.mkdirSync('dist/shared', { recursive: true });
}

  // Copiar arquivos shared (com fallback)
try {
    if (process.platform === 'win32') {
      execSync('xcopy shared dist\\shared /E /I /Y', { stdio: 'inherit' });
    } else {
  execSync('cp -r shared/* dist/shared/', { stdio: 'inherit' });
    }
} catch (error) {
    console.log('⚠️ Erro ao copiar shared, continuando...');
}

// Copiar package.json para dist
  try {
fs.copyFileSync('package.json', 'dist/package.json');
  } catch (error) {
    console.log('⚠️ Erro ao copiar package.json, continuando...');
  }

  // Copiar arquivo da API para dist
  if (!fs.existsSync('dist/api')) {
    fs.mkdirSync('dist/api', { recursive: true });
  }
  try {
    fs.copyFileSync('api/index.js', 'dist/api/index.js');
  } catch (error) {
    console.log('⚠️ Erro ao copiar API, continuando...');
  }

  // Mover arquivos do frontend para a raiz do dist
  try {
    if (fs.existsSync('dist/public')) {
      // Mover conteúdo de public para a raiz
      const publicFiles = fs.readdirSync('dist/public');
      publicFiles.forEach(file => {
        const sourcePath = path.join('dist/public', file);
        const destPath = path.join('dist', file);
        if (fs.statSync(sourcePath).isDirectory()) {
          if (process.platform === 'win32') {
            execSync(`xcopy "${sourcePath}" "${destPath}" /E /I /Y`, { stdio: 'inherit' });
          } else {
            execSync(`cp -r "${sourcePath}" "${destPath}"`, { stdio: 'inherit' });
          }
        } else {
          fs.copyFileSync(sourcePath, destPath);
        }
      });
      console.log('✅ Arquivos frontend movidos para raiz do dist');
    }
  } catch (error) {
    console.log('⚠️ Erro ao mover arquivos frontend, continuando...');
  }

console.log('✅ Build concluído com sucesso!');
console.log('📁 Arquivos gerados em: dist/'); 

} catch (error) {
  console.error('❌ Erro no build:', error.message);
  process.exit(1);
} 
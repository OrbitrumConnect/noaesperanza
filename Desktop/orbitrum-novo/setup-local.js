#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Configurando Orbitrum Local...\n');

// Criar estrutura de pastas
const folders = ['public', 'assets'];
folders.forEach(folder => {
  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder, { recursive: true });
    console.log(`✅ Pasta ${folder} criada`);
  }
});

// Copiar arquivos do sistema atual
const filesToCopy = [
  { source: 'VERCEL-INDEX.html', dest: 'public/index.html' },
  { source: 'VERCEL-CSS-COMPLETO.css', dest: 'public/style.css' },
  { source: 'VERCEL-APP-COMPLETO.tsx', dest: 'public/app.js' }
];

filesToCopy.forEach(file => {
  if (fs.existsSync(file.source)) {
    let content = fs.readFileSync(file.source, 'utf8');
    
    // Converter TSX para JS se necessário
    if (file.source.includes('.tsx')) {
      content = convertTsxToJs(content);
    }
    
    fs.writeFileSync(file.dest, content);
    console.log(`✅ ${file.source} → ${file.dest}`);
  } else {
    console.log(`⚠️ ${file.source} não encontrado, criando versão básica...`);
    createBasicFile(file.dest);
  }
});

// Função para converter TSX básico para JS
function convertTsxToJs(content) {
  return content
    .replace(/import.*from.*['"];?\n/g, '') // Remove imports
    .replace(/export.*{.*}/g, '') // Remove exports
    .replace(/interface.*{[^}]*}/gs, '') // Remove interfaces
    .replace(/type.*=.*[;,]/g, '') // Remove types
    .replace(/: (string|number|boolean|any)\[\]/g, '') // Remove array types
    .replace(/: (string|number|boolean|any)/g, '') // Remove simple types
    .replace(/<[A-Z]\w*[^>]*>/g, match => { // Convert JSX to DOM
      return match.replace(/className=/g, 'class=').replace(/onClick=/g, 'onclick=');
    });
}

// Criar arquivos básicos se não existirem
function createBasicFile(dest) {
  const templates = {
    'public/index.html': `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Orbitrum Connect - Local</title>
    <link rel="stylesheet" href="style.css">
    <link rel="manifest" href="manifest.json">
</head>
<body>
    <div id="root">
        <div class="neural-container">
            <h1>🧠 Orbitrum Connect</h1>
            <p>Sistema Neural Ativo</p>
            <div id="neural-brain" class="brain-animation"></div>
        </div>
    </div>
    <script src="app.js"></script>
</body>
</html>`,
    
    'public/style.css': `body { 
  margin: 0; 
  background: linear-gradient(135deg, #0f172a, #1e3a8a, #0f172a);
  color: #00ffff;
  font-family: 'Segoe UI', sans-serif;
  min-height: 100vh;
}

.neural-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  text-align: center;
}

.brain-animation {
  width: 200px;
  height: 200px;
  border: 2px solid #00ffff;
  border-radius: 50%;
  animation: pulse 2s infinite;
  margin: 20px auto;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 0.7; }
  50% { transform: scale(1.1); opacity: 1; }
}`,
    
    'public/app.js': `// Orbitrum Local App
class OrbitrumLocal {
  constructor() {
    this.init();
  }
  
  init() {
    console.log('🧠 Orbitrum Neural System Initialized');
    this.setupBrainAnimation();
    this.registerServiceWorker();
  }
  
  setupBrainAnimation() {
    const brain = document.getElementById('neural-brain');
    if (brain) {
      brain.addEventListener('click', () => {
        alert('🚀 Sistema Neural Ativado!');
      });
    }
  }
  
  registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js')
        .then(() => console.log('✅ Service Worker registrado'))
        .catch(err => console.log('❌ Service Worker falhou:', err));
    }
  }
}

// Inicializar app
document.addEventListener('DOMContentLoaded', () => {
  new OrbitrumLocal();
});`
  };
  
  if (templates[dest]) {
    fs.writeFileSync(dest, templates[dest]);
    console.log(`✅ ${dest} criado com template básico`);
  }
}

// Criar arquivos adicionais necessários
const additionalFiles = {
  'public/manifest.json': {
    "name": "Orbitrum Connect Local",
    "short_name": "Orbitrum",
    "description": "Sistema Neural Local",
    "start_url": "/",
    "display": "standalone",
    "background_color": "#0f172a",
    "theme_color": "#00ffff",
    "icons": [
      {
        "src": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTkyIiBoZWlnaHQ9IjE5MiIgdmlld0JveD0iMCAwIDE5MiAxOTIiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iOTYiIGN5PSI5NiIgcj0iOTYiIGZpbGw9IiMwZjE3MmEiLz48Y2lyY2xlIGN4PSI5NiIgY3k9Ijk2IiByPSI0MCIgZmlsbD0iIzAwZmZmZiIvPjwvc3ZnPg==",
        "sizes": "192x192",
        "type": "image/svg+xml"
      }
    ]
  },
  
  'public/service-worker.js': `const CACHE_NAME = 'orbitrum-local-v1';
const urlsToCache = ['/', '/style.css', '/app.js', '/manifest.json'];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});`,

  'server.js': `const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// APIs básicas
app.get('/api/professionals', (req, res) => {
  res.json([
    { id: 1, name: 'João Silva', profession: 'Eletricista', rating: 4.8, tokens: 1500 },
    { id: 2, name: 'Maria Santos', profession: 'Encanadora', rating: 4.9, tokens: 2000 },
    { id: 3, name: 'Carlos Lima', profession: 'Pintor', rating: 4.7, tokens: 1200 },
    { id: 4, name: 'Ana Costa', profession: 'Diarista', rating: 4.9, tokens: 1800 }
  ]);
});

app.get('/api/wallet/user', (req, res) => {
  res.json({ 
    tokens: 2160, 
    canMakePurchases: true,
    tokensComprados: 2160,
    tokensPlano: 0,
    saldoTotal: 2160
  });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'online', timestamp: new Date().toISOString() });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

function getLocalIP() {
  const os = require('os');
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const interface of interfaces[name]) {
      if (interface.family === 'IPv4' && !interface.internal) {
        return interface.address;
      }
    }
  }
  return 'localhost';
}

app.listen(PORT, '0.0.0.0', () => {
  const localIP = getLocalIP();
  console.log('🚀 Orbitrum Local rodando!');
  console.log('💻 PC: http://localhost:' + PORT);
  console.log('📱 Celular: http://' + localIP + ':' + PORT);
  console.log('🧠 Neural Brain System Ativo');
});`,

  'package.json': {
    "name": "orbitrum-local",
    "version": "1.0.0",
    "description": "Orbitrum Connect - Instalação Local",
    "main": "server.js",
    "scripts": {
      "start": "node server.js",
      "dev": "nodemon server.js",
      "setup": "node setup-local.js"
    },
    "dependencies": {
      "express": "^4.18.0",
      "cors": "^2.8.5"
    },
    "devDependencies": {
      "nodemon": "^3.0.0"
    }
  }
};

// Escrever arquivos adicionais
Object.keys(additionalFiles).forEach(filename => {
  const content = typeof additionalFiles[filename] === 'string' 
    ? additionalFiles[filename] 
    : JSON.stringify(additionalFiles[filename], null, 2);
    
  fs.writeFileSync(filename, content);
  console.log(`✅ ${filename} criado`);
});

console.log('\n🎉 Setup completo!');
console.log('\n📋 Próximos passos:');
console.log('1. npm install');
console.log('2. npm start');
console.log('3. Abrir http://localhost:3000 no PC');
console.log('4. Abrir http://SEU_IP:3000 no celular');
console.log('\n🚀 Orbitrum Local está pronto!');
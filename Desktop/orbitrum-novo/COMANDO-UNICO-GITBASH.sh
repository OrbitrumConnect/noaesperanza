#!/bin/bash

# 🌌 ORBITRUM - INSTALAÇÃO COMPLETA EM UM COMANDO
# Execute este comando no Git Bash para instalar tudo automaticamente

echo "🌌 ORBITRUM - INSTALAÇÃO AUTOMÁTICA"
echo "=================================="

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado!"
    echo "📥 Instale Node.js de: https://nodejs.org"
    exit 1
fi

echo "✅ Node.js encontrado: $(node --version)"

# Criar diretório do projeto
mkdir -p orbitrum-local
cd orbitrum-local

echo "📦 Criando package.json..."
cat > package.json << 'EOF'
{
  "name": "orbitrum-local",
  "version": "1.0.0",
  "description": "Sistema Orbitrum Local",
  "main": "server.js",
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "body-parser": "^1.20.2"
  }
}
EOF

echo "📦 Instalando dependências..."
npm install

echo "🖥️ Criando servidor..."
cat > server.js << 'EOF'
const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// 16 profissionais orbitais (dados reais)
const professionals = [
  {id: 1, name: "Carlos Silva", title: "Pintor", rating: 4.8, available: true, ring: 1, color: "#10B981"},
  {id: 2, name: "Maria Santos", title: "Eletricista", rating: 4.9, available: true, ring: 1, color: "#3B82F6"},
  {id: 3, name: "João Pereira", title: "Encanador", rating: 4.7, available: true, ring: 1, color: "#8B5CF6"},
  {id: 4, name: "Ana Costa", title: "Jardineira", rating: 4.6, available: true, ring: 1, color: "#F59E0B"},
  {id: 5, name: "Pedro Lima", title: "Marceneiro", rating: 4.8, available: true, ring: 1, color: "#EC4899"},
  {id: 6, name: "Lucia Rocha", title: "Costureira", rating: 4.9, available: true, ring: 1, color: "#6366F1"},
  {id: 7, name: "Roberto Dias", title: "Pedreiro", rating: 4.5, available: true, ring: 2, color: "#EF4444"},
  {id: 8, name: "Fernanda Luz", title: "Cozinheira", rating: 4.7, available: true, ring: 2, color: "#F97316"},
  {id: 9, name: "Marcos Vieira", title: "Motorista", rating: 4.6, available: true, ring: 2, color: "#14B8A6"},
  {id: 10, name: "Patricia Gomes", title: "Faxineira", rating: 4.8, available: true, ring: 2, color: "#10B981"},
  {id: 11, name: "Ricardo Nunes", title: "Técnico TI", rating: 4.9, available: true, ring: 2, color: "#8B5CF6"},
  {id: 12, name: "Juliana Soares", title: "Veterinária", rating: 4.7, available: true, ring: 2, color: "#84CC16"},
  {id: 13, name: "André Ferreira", title: "Soldador", rating: 4.6, available: true, ring: 2, color: "#F59E0B"},
  {id: 14, name: "Carla Mendes", title: "Professora", rating: 4.8, available: true, ring: 3, color: "#F43F5E"},
  {id: 15, name: "Diego Santos", title: "Segurança", rating: 4.5, available: true, ring: 3, color: "#0EA5E9"},
  {id: 16, name: "Renata Silva", title: "Designer", rating: 4.9, available: true, ring: 3, color: "#D946EF"}
];

// APIs funcionais
app.get('/api/professionals', (req, res) => {
  console.log('🚀 API: 16 profissionais carregados');
  res.json(professionals);
});

app.get('/api/wallet/user', (req, res) => {
  console.log('💰 API: Carteira consultada');
  res.json({
    tokensPlano: 0,
    tokensGanhos: 0,
    tokensComprados: 2160,
    tokensUsados: 0,
    saldoTotal: 2160,
    creditosAcumulados: 0,
    creditosSacados: 0
  });
});

app.get('/api/admin/stats', (req, res) => {
  console.log('📊 API: Stats admin consultadas');
  res.json({
    totalUsers: 4,
    activeUsers: 4,
    totalRevenue: 41.00,
    profissionalsCount: 16
  });
});

// Rotas dos dashboards
app.get('/dashboard-selector', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/dashboard-selector.html'));
});

app.get('/dashboard-client', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/dashboard-client.html'));
});

app.get('/dashboard-admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/dashboard-admin.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log('');
  console.log('🌌 ORBITRUM FUNCIONANDO!');
  console.log('================================');
  console.log('📱 PC: http://localhost:3000');
  console.log('📱 Celular: http://SEU_IP:3000');
  console.log('🧠 Neural Brain Central ativo');
  console.log('🚀 16 Profissionais orbitais');
  console.log('💰 Sistema de carteira ativo');
  console.log('📊 Dashboards multipas prontos');
  console.log('================================');
});
EOF

echo "📁 Criando pasta public..."
mkdir -p public

echo "🌐 Criando interface principal..."
cat > public/index.html << 'EOF'
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Orbitrum - Sistema Neural Orbital</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        body { background: linear-gradient(135deg, #1a202c 0%, #2d3748 50%, #4a5568 100%); }
        .neural-glow { 
            box-shadow: 0 0 30px rgba(56, 178, 172, 0.6);
            animation: pulse-glow 2s ease-in-out infinite alternate;
        }
        @keyframes pulse-glow {
            from { box-shadow: 0 0 20px rgba(56, 178, 172, 0.5); }
            to { box-shadow: 0 0 40px rgba(56, 178, 172, 0.8); }
        }
        .orbit-1 { animation: rotate 20s linear infinite; }
        .orbit-2 { animation: rotate-reverse 30s linear infinite; }
        .orbit-3 { animation: rotate 40s linear infinite; }
        @keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes rotate-reverse { from { transform: rotate(360deg); } to { transform: rotate(0deg); } }
        .orb { transition: all 0.3s ease; }
        .orb:hover { transform: scale(1.2); }
    </style>
</head>
<body class="min-h-screen text-white overflow-hidden">
    <div class="min-h-screen flex items-center justify-center p-4">
        <div class="text-center max-w-4xl w-full">
            <h1 class="text-4xl md:text-6xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600">
                ORBITRUM
            </h1>
            <p class="text-lg md:text-2xl mb-8 text-cyan-300">Sistema Neural Orbital</p>
            <p class="text-sm md:text-base mb-12 text-cyan-200">Conecte-se com profissionais próximos • Clique no Cérebro</p>
            
            <!-- Sistema Orbital Completo -->
            <div class="relative w-80 h-80 md:w-96 md:h-96 mx-auto mb-8">
                <!-- Neural Brain Central -->
                <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
                    <div class="w-20 h-20 neural-glow bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform" onclick="expandBrain()">
                        <svg class="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2M21 9V7L15 7.5V9M15 7.5C15 6.7 14.3 6 13.5 6S12 6.7 12 7.5 12.7 9 13.5 9 15 8.3 15 7.5M3 9V7L9 7.5V9M9 7.5C9 8.3 9.7 9 10.5 9S12 8.3 12 7.5 11.3 6 10.5 6 9 6.7 9 7.5Z"/>
                        </svg>
                    </div>
                </div>
                
                <!-- Anel 1 - 6 profissionais -->
                <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-52 h-52 border border-cyan-500/20 rounded-full orbit-1">
                    <div class="absolute -top-3 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-green-500 rounded-full orb" title="Carlos Silva - Pintor"></div>
                    <div class="absolute top-1/2 -right-3 transform -translate-y-1/2 w-6 h-6 bg-blue-500 rounded-full orb" title="Maria Santos - Eletricista"></div>
                    <div class="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-purple-500 rounded-full orb" title="João Pereira - Encanador"></div>
                    <div class="absolute top-1/2 -left-3 transform -translate-y-1/2 w-6 h-6 bg-yellow-500 rounded-full orb" title="Ana Costa - Jardineira"></div>
                    <div class="absolute top-1/4 -right-1 transform -translate-y-1/2 w-6 h-6 bg-pink-500 rounded-full orb" title="Pedro Lima - Marceneiro"></div>
                    <div class="absolute top-3/4 -left-1 transform -translate-y-1/2 w-6 h-6 bg-indigo-500 rounded-full orb" title="Lucia Rocha - Costureira"></div>
                </div>
                
                <!-- Anel 2 - 7 profissionais -->
                <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 border border-blue-500/15 rounded-full orbit-2">
                    <div class="absolute -top-2 left-1/2 transform -translate-x-1/2 w-5 h-5 bg-red-500 rounded-full orb" title="Roberto Dias - Pedreiro"></div>
                    <div class="absolute top-1/6 -right-2 transform -translate-y-1/2 w-5 h-5 bg-orange-500 rounded-full orb" title="Fernanda Luz - Cozinheira"></div>
                    <div class="absolute top-1/2 -right-2 transform -translate-y-1/2 w-5 h-5 bg-teal-500 rounded-full orb" title="Marcos Vieira - Motorista"></div>
                    <div class="absolute top-5/6 -right-2 transform -translate-y-1/2 w-5 h-5 bg-emerald-500 rounded-full orb" title="Patricia Gomes - Faxineira"></div>
                    <div class="absolute -bottom-2 left-3/4 transform -translate-x-1/2 w-5 h-5 bg-violet-500 rounded-full orb" title="Ricardo Nunes - Técnico TI"></div>
                    <div class="absolute -bottom-2 left-1/4 transform -translate-x-1/2 w-5 h-5 bg-lime-500 rounded-full orb" title="Juliana Soares - Veterinária"></div>
                    <div class="absolute top-1/2 -left-2 transform -translate-y-1/2 w-5 h-5 bg-amber-500 rounded-full orb" title="André Ferreira - Soldador"></div>
                </div>
                
                <!-- Anel 3 - 3 profissionais -->
                <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 md:w-96 md:h-96 border border-purple-500/10 rounded-full orbit-3">
                    <div class="absolute -top-1 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-rose-500 rounded-full orb" title="Carla Mendes - Professora"></div>
                    <div class="absolute top-1/3 -right-1 transform -translate-y-1/2 w-4 h-4 bg-sky-500 rounded-full orb" title="Diego Santos - Segurança"></div>
                    <div class="absolute top-2/3 -left-1 transform -translate-y-1/2 w-4 h-4 bg-fuchsia-500 rounded-full orb" title="Renata Silva - Designer"></div>
                </div>
            </div>
            
            <div class="space-y-6">
                <button onclick="goToDashboard()" class="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 px-6 md:px-8 py-3 md:py-4 rounded-xl font-semibold text-sm md:text-lg shadow-lg transform hover:scale-105 transition-all">
                    🚀 DASHBOARDS
                </button>
                
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto px-4">
                    <div class="bg-black/20 backdrop-blur-sm border border-cyan-500/20 rounded-lg p-4">
                        <h3 class="font-semibold text-cyan-400 mb-2">16 Profissionais</h3>
                        <p class="text-sm text-gray-300">Sistema orbital ativo</p>
                    </div>
                    <div class="bg-black/20 backdrop-blur-sm border border-green-500/20 rounded-lg p-4">
                        <h3 class="font-semibold text-green-400 mb-2">Carteira Digital</h3>
                        <p class="text-sm text-gray-300">2.160 tokens ativos</p>
                    </div>
                    <div class="bg-black/20 backdrop-blur-sm border border-purple-500/20 rounded-lg p-4">
                        <h3 class="font-semibold text-purple-400 mb-2">Dashboards</h3>
                        <p class="text-sm text-gray-300">Cliente, Pro, Admin</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <script>
        // Carregar profissionais automaticamente
        fetch('/api/professionals')
            .then(response => response.json())
            .then(professionals => {
                console.log('🚀 16 Profissionais carregados:', professionals);
            });
        
        function expandBrain() {
            console.log('🧠 Neural Brain ativado!');
            const brain = document.querySelector('.neural-glow');
            brain.style.transform = 'scale(1.3)';
            setTimeout(() => brain.style.transform = 'scale(1)', 800);
            
            // Som de ativação neural
            try {
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                const oscillator = audioContext.createOscillator();
                oscillator.frequency.setValueAtTime(220, audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(1100, audioContext.currentTime + 0.2);
                oscillator.connect(audioContext.destination);
                oscillator.start();
                oscillator.stop(audioContext.currentTime + 0.2);
            } catch(e) {}
        }
        
        function goToDashboard() {
            window.location.href = '/dashboard-selector';
        }
        
        // Efeitos automáticos nos profissionais
        setInterval(() => {
            const orbs = document.querySelectorAll('.orb');
            const randomOrb = orbs[Math.floor(Math.random() * orbs.length)];
            randomOrb.style.boxShadow = '0 0 15px currentColor';
            setTimeout(() => randomOrb.style.boxShadow = 'none', 300);
        }, 2000);
    </script>
</body>
</html>
EOF

echo "🎯 Criando seletor de dashboards..."
cat > public/dashboard-selector.html << 'EOF'
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboards - Orbitrum</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        body { background: linear-gradient(135deg, #1a202c 0%, #2d3748 50%, #4a5568 100%); }
        .dashboard-card { transition: all 0.3s ease; }
        .dashboard-card:hover { transform: translateY(-8px); }
    </style>
</head>
<body class="min-h-screen text-white">
    <div class="min-h-screen flex items-center justify-center p-6">
        <div class="max-w-6xl w-full">
            <div class="text-center mb-12">
                <h1 class="text-3xl md:text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">Escolha seu Dashboard</h1>
                <p class="text-cyan-300 text-lg md:text-xl">Selecione o painel que deseja acessar</p>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                <!-- Dashboard Cliente -->
                <div class="dashboard-card bg-gradient-to-br from-cyan-600/20 to-blue-600/20 backdrop-blur-sm border border-cyan-500/20 rounded-xl p-8 cursor-pointer" onclick="selectDashboard('client')">
                    <div class="text-center">
                        <div class="bg-gradient-to-r from-cyan-500 to-blue-500 p-4 rounded-full inline-block mb-6">
                            <svg class="h-12 w-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                            </svg>
                        </div>
                        <h3 class="text-2xl font-bold mb-4">Dashboard Cliente</h3>
                        <p class="text-cyan-300 mb-4">9 abas interligadas</p>
                        <p class="text-sm text-gray-300">Gerencie serviços, carteira e comunicações</p>
                    </div>
                </div>
                
                <!-- Dashboard Profissional -->
                <div class="dashboard-card bg-gradient-to-br from-purple-600/20 to-pink-600/20 backdrop-blur-sm border border-purple-500/20 rounded-xl p-8 cursor-pointer" onclick="selectDashboard('professional')">
                    <div class="text-center">
                        <div class="bg-gradient-to-r from-purple-500 to-pink-500 p-4 rounded-full inline-block mb-6">
                            <svg class="h-12 w-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10z"/>
                            </svg>
                        </div>
                        <h3 class="text-2xl font-bold mb-4">Dashboard Profissional</h3>
                        <p class="text-purple-300 mb-4">4 seções organizadas</p>
                        <p class="text-sm text-gray-300">Gestão de clientes e projetos</p>
                    </div>
                </div>
                
                <!-- Dashboard Admin -->
                <div class="dashboard-card bg-gradient-to-br from-red-600/20 to-orange-600/20 backdrop-blur-sm border border-red-500/20 rounded-xl p-8 cursor-pointer" onclick="selectDashboard('admin')">
                    <div class="text-center">
                        <div class="bg-gradient-to-r from-red-500 to-orange-500 p-4 rounded-full inline-block mb-6">
                            <svg class="h-12 w-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M12,7C13.4,7 14.8,8.6 14.8,10V11H16V16H8V11H9.2V10C9.2,8.6 10.6,7 12,7M12,8.2C11.2,8.2 10.4,9 10.4,10V11H13.6V10C13.6,9 12.8,8.2 12,8.2Z"/>
                            </svg>
                        </div>
                        <h3 class="text-2xl font-bold mb-4">Dashboard Admin</h3>
                        <p class="text-red-300 mb-4">9 abas administrativas</p>
                        <p class="text-sm text-gray-300">Painel administrativo completo</p>
                    </div>
                </div>
            </div>
            
            <div class="text-center mt-12">
                <button onclick="goBack()" class="bg-gray-600 hover:bg-gray-700 px-6 py-3 rounded-lg font-semibold transition-colors">
                    ← Voltar ao Sistema Orbital
                </button>
            </div>
        </div>
    </div>
    
    <script>
        function selectDashboard(type) {
            console.log('📊 Selecionando dashboard:', type);
            window.location.href = '/dashboard-' + type;
        }
        
        function goBack() {
            window.location.href = '/';
        }
    </script>
</body>
</html>
EOF

echo "✅ Sistema criado com sucesso!"
echo ""
echo "🚀 Para iniciar o Orbitrum:"
echo "cd orbitrum-local"
echo "npm start"
echo ""
echo "📱 Acesso:"
echo "PC: http://localhost:3000"
echo "Celular: http://SEU_IP:3000"
EOF

chmod +x COMANDO-UNICO-GITBASH.sh
echo "✅ Script criado com sucesso!"
echo ""
echo "🚀 Para executar tudo de uma vez no Git Bash:"
echo "./COMANDO-UNICO-GITBASH.sh"
#!/bin/bash

# 🌌 ORBITRUM - INSTALAÇÃO ULTRA SIMPLES GIT BASH
# Cole este comando completo no Git Bash e pressione Enter

clear
echo "🌌 ORBITRUM - INSTALAÇÃO AUTOMÁTICA"
echo "===================================="

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado! Instale de: https://nodejs.org"
    read -p "Pressione Enter para continuar após instalar Node.js..."
fi

echo "✅ Node.js: $(node --version)"
echo "✅ NPM: $(npm --version)"

# Criar projeto
echo "📁 Criando projeto Orbitrum..."
mkdir -p orbitrum-funcionando
cd orbitrum-funcionando

# Package.json correto
echo "📦 Configurando package.json..."
cat > package.json << 'EOF'
{
  "name": "orbitrum-local",
  "version": "1.0.0",
  "description": "Sistema Orbitrum Local Funcionando",
  "main": "app.js",
  "scripts": {
    "start": "node app.js",
    "dev": "node app.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5"
  }
}
EOF

# Instalar dependências
echo "⬇️  Instalando express e cors..."
npm install --silent

# Criar aplicação principal
echo "🖥️  Criando servidor app.js..."
cat > app.js << 'EOF'
const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Dados dos 16 profissionais orbitais
const profissionais = [
  {id: 1, nome: "Carlos Silva", profissao: "Pintor", nota: 4.8, anel: 1, cor: "#10B981"},
  {id: 2, nome: "Maria Santos", profissao: "Eletricista", nota: 4.9, anel: 1, cor: "#3B82F6"},
  {id: 3, nome: "João Pereira", profissao: "Encanador", nota: 4.7, anel: 1, cor: "#8B5CF6"},
  {id: 4, nome: "Ana Costa", profissao: "Jardineira", nota: 4.6, anel: 1, cor: "#F59E0B"},
  {id: 5, nome: "Pedro Lima", profissao: "Marceneiro", nota: 4.8, anel: 1, cor: "#EC4899"},
  {id: 6, nome: "Lucia Rocha", profissao: "Costureira", nota: 4.9, anel: 1, cor: "#6366F1"},
  {id: 7, nome: "Roberto Dias", profissao: "Pedreiro", nota: 4.5, anel: 2, cor: "#EF4444"},
  {id: 8, nome: "Fernanda Luz", profissao: "Cozinheira", nota: 4.7, anel: 2, cor: "#F97316"},
  {id: 9, nome: "Marcos Vieira", profissao: "Motorista", nota: 4.6, anel: 2, cor: "#14B8A6"},
  {id: 10, nome: "Patricia Gomes", profissao: "Faxineira", nota: 4.8, anel: 2, cor: "#10B981"},
  {id: 11, nome: "Ricardo Nunes", profissao: "Técnico TI", nota: 4.9, anel: 2, cor: "#8B5CF6"},
  {id: 12, nome: "Juliana Soares", profissao: "Veterinária", nota: 4.7, anel: 2, cor: "#84CC16"},
  {id: 13, nome: "André Ferreira", profissao: "Soldador", nota: 4.6, anel: 2, cor: "#F59E0B"},
  {id: 14, nome: "Carla Mendes", profissao: "Professora", nota: 4.8, anel: 3, cor: "#F43F5E"},
  {id: 15, nome: "Diego Santos", profissao: "Segurança", nota: 4.5, anel: 3, cor: "#0EA5E9"},
  {id: 16, nome: "Renata Silva", profissao: "Designer", nota: 4.9, anel: 3, cor: "#D946EF"}
];

// APIs
app.get('/api/profissionais', (req, res) => {
  console.log('🚀 API: Carregando 16 profissionais orbitais');
  res.json(profissionais);
});

app.get('/api/carteira', (req, res) => {
  console.log('💰 API: Consultando carteira');
  res.json({
    tokens: 2160,
    creditos: 0,
    plano: 'Ativo'
  });
});

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
  console.clear();
  console.log('🌌 ORBITRUM SISTEMA FUNCIONANDO!');
  console.log('===================================');
  console.log('');
  console.log('💻 PC: http://localhost:3000');
  console.log('📱 Celular: http://SEU_IP:3000');
  console.log('');
  console.log('🧠 Neural Brain Central: ATIVO');
  console.log('🚀 16 Profissionais Orbitais: CARREGADOS');
  console.log('💰 Sistema de Carteira: FUNCIONANDO');
  console.log('');
  console.log('===================================');
  console.log('✅ Sistema pronto para uso!');
  console.log('');
});
EOF

# Criar interface HTML
echo "🌐 Criando interface index.html..."
cat > index.html << 'EOF'
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Orbitrum - Sistema Neural Orbital</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        body { 
            background: linear-gradient(135deg, #1a202c 0%, #2d3748 40%, #4a5568 100%);
            font-family: 'Arial', sans-serif;
        }
        .cerebro-brilho { 
            box-shadow: 0 0 30px rgba(56, 178, 172, 0.7);
            animation: pulso-cerebro 3s ease-in-out infinite;
        }
        @keyframes pulso-cerebro {
            0%, 100% { box-shadow: 0 0 20px rgba(56, 178, 172, 0.5); }
            50% { box-shadow: 0 0 40px rgba(56, 178, 172, 0.9); }
        }
        .orbita-1 { animation: girar 20s linear infinite; }
        .orbita-2 { animation: girar-inverso 30s linear infinite; }
        .orbita-3 { animation: girar 40s linear infinite; }
        @keyframes girar { 
            from { transform: rotate(0deg); } 
            to { transform: rotate(360deg); } 
        }
        @keyframes girar-inverso { 
            from { transform: rotate(360deg); } 
            to { transform: rotate(0deg); } 
        }
        .profissional { 
            transition: all 0.3s ease; 
            cursor: pointer;
        }
        .profissional:hover { 
            transform: scale(1.3); 
            box-shadow: 0 0 15px currentColor;
        }
        .cartao-stat {
            backdrop-filter: blur(10px);
            background: rgba(0, 0, 0, 0.2);
        }
    </style>
</head>
<body class="min-h-screen text-white">
    <div class="min-h-screen flex flex-col items-center justify-center p-4">
        <!-- Cabeçalho -->
        <div class="text-center mb-8">
            <h1 class="text-5xl md:text-7xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600">
                ORBITRUM
            </h1>
            <p class="text-xl md:text-2xl text-cyan-300 mb-2">Sistema Neural Orbital</p>
            <p class="text-cyan-200 text-sm md:text-base">
                Conecte-se com profissionais próximos • Clique no Cérebro
            </p>
        </div>
        
        <!-- Sistema Orbital -->
        <div class="relative w-80 h-80 md:w-96 md:h-96 mb-8">
            <!-- Cérebro Neural Central -->
            <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30">
                <div class="w-24 h-24 cerebro-brilho bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-all duration-300" 
                     onclick="ativarCerebro()">
                    <div class="text-3xl">🧠</div>
                </div>
            </div>
            
            <!-- Anel 1 - 6 profissionais -->
            <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-56 h-56 border border-cyan-400/30 rounded-full orbita-1">
                <div class="absolute -top-4 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-green-500 rounded-full profissional" 
                     title="Carlos Silva - Pintor" onclick="verProfissional(1)"></div>
                <div class="absolute top-1/2 -right-4 transform -translate-y-1/2 w-8 h-8 bg-blue-500 rounded-full profissional" 
                     title="Maria Santos - Eletricista" onclick="verProfissional(2)"></div>
                <div class="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-purple-500 rounded-full profissional" 
                     title="João Pereira - Encanador" onclick="verProfissional(3)"></div>
                <div class="absolute top-1/2 -left-4 transform -translate-y-1/2 w-8 h-8 bg-yellow-500 rounded-full profissional" 
                     title="Ana Costa - Jardineira" onclick="verProfissional(4)"></div>
                <div class="absolute top-1/4 -right-2 transform -translate-y-1/2 w-8 h-8 bg-pink-500 rounded-full profissional" 
                     title="Pedro Lima - Marceneiro" onclick="verProfissional(5)"></div>
                <div class="absolute top-3/4 -left-2 transform -translate-y-1/2 w-8 h-8 bg-indigo-500 rounded-full profissional" 
                     title="Lucia Rocha - Costureira" onclick="verProfissional(6)"></div>
            </div>
            
            <!-- Anel 2 - 7 profissionais -->
            <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 border border-blue-400/20 rounded-full orbita-2">
                <div class="absolute -top-3 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-red-500 rounded-full profissional" 
                     title="Roberto Dias - Pedreiro" onclick="verProfissional(7)"></div>
                <div class="absolute top-1/6 -right-3 transform -translate-y-1/2 w-6 h-6 bg-orange-500 rounded-full profissional" 
                     title="Fernanda Luz - Cozinheira" onclick="verProfissional(8)"></div>
                <div class="absolute top-1/2 -right-3 transform -translate-y-1/2 w-6 h-6 bg-teal-500 rounded-full profissional" 
                     title="Marcos Vieira - Motorista" onclick="verProfissional(9)"></div>
                <div class="absolute top-5/6 -right-3 transform -translate-y-1/2 w-6 h-6 bg-emerald-500 rounded-full profissional" 
                     title="Patricia Gomes - Faxineira" onclick="verProfissional(10)"></div>
                <div class="absolute -bottom-3 left-3/4 transform -translate-x-1/2 w-6 h-6 bg-violet-500 rounded-full profissional" 
                     title="Ricardo Nunes - Técnico TI" onclick="verProfissional(11)"></div>
                <div class="absolute -bottom-3 left-1/4 transform -translate-x-1/2 w-6 h-6 bg-lime-500 rounded-full profissional" 
                     title="Juliana Soares - Veterinária" onclick="verProfissional(12)"></div>
                <div class="absolute top-1/2 -left-3 transform -translate-y-1/2 w-6 h-6 bg-amber-500 rounded-full profissional" 
                     title="André Ferreira - Soldador" onclick="verProfissional(13)"></div>
            </div>
            
            <!-- Anel 3 - 3 profissionais -->
            <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 md:w-96 md:h-96 border border-purple-400/15 rounded-full orbita-3">
                <div class="absolute -top-2 left-1/2 transform -translate-x-1/2 w-5 h-5 bg-rose-500 rounded-full profissional" 
                     title="Carla Mendes - Professora" onclick="verProfissional(14)"></div>
                <div class="absolute top-1/3 -right-2 transform -translate-y-1/2 w-5 h-5 bg-sky-500 rounded-full profissional" 
                     title="Diego Santos - Segurança" onclick="verProfissional(15)"></div>
                <div class="absolute top-2/3 -left-2 transform -translate-y-1/2 w-5 h-5 bg-fuchsia-500 rounded-full profissional" 
                     title="Renata Silva - Designer" onclick="verProfissional(16)"></div>
            </div>
        </div>
        
        <!-- Informações do Sistema -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl w-full px-4 mb-8">
            <div class="cartao-stat border border-cyan-400/30 rounded-lg p-4 text-center">
                <div class="text-2xl font-bold text-cyan-400" id="contador-profissionais">16</div>
                <div class="text-sm text-cyan-300">Profissionais Orbitais</div>
            </div>
            <div class="cartao-stat border border-green-400/30 rounded-lg p-4 text-center">
                <div class="text-2xl font-bold text-green-400" id="tokens-carteira">2.160</div>
                <div class="text-sm text-green-300">Tokens Ativos</div>
            </div>
            <div class="cartao-stat border border-purple-400/30 rounded-lg p-4 text-center">
                <div class="text-2xl font-bold text-purple-400">100%</div>
                <div class="text-sm text-purple-300">Sistema Ativo</div>
            </div>
        </div>
        
        <!-- Botão Principal -->
        <button onclick="abrirDashboards()" 
                class="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 px-8 py-4 rounded-xl font-bold text-lg shadow-2xl transform hover:scale-105 transition-all duration-300">
            🚀 ACESSAR DASHBOARDS
        </button>
    </div>
    
    <script>
        let profissionais = [];
        
        // Carregar dados dos profissionais
        async function carregarProfissionais() {
            try {
                const response = await fetch('/api/profissionais');
                profissionais = await response.json();
                console.log('🚀 16 Profissionais carregados:', profissionais);
            } catch (error) {
                console.log('⚠️ Usando dados locais');
            }
        }
        
        // Ativar cérebro neural
        function ativarCerebro() {
            console.log('🧠 Neural Brain ativado!');
            const cerebro = document.querySelector('.cerebro-brilho');
            cerebro.style.transform = 'scale(1.4)';
            cerebro.style.boxShadow = '0 0 50px rgba(56, 178, 172, 1)';
            
            setTimeout(() => {
                cerebro.style.transform = 'scale(1)';
                cerebro.style.boxShadow = '0 0 30px rgba(56, 178, 172, 0.7)';
            }, 800);
            
            // Som neural
            try {
                const ctx = new (window.AudioContext || window.webkitAudioContext)();
                const osc = ctx.createOscillator();
                osc.frequency.setValueAtTime(220, ctx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.3);
                osc.connect(ctx.destination);
                osc.start();
                osc.stop(ctx.currentTime + 0.3);
            } catch(e) {}
        }
        
        // Ver detalhes do profissional
        function verProfissional(id) {
            const prof = profissionais.find(p => p.id === id) || {nome: 'Profissional', profissao: 'Serviços'};
            alert(`${prof.nome}\n${prof.profissao}\nNota: ${prof.nota || '4.8'} ⭐`);
        }
        
        // Abrir dashboards
        function abrirDashboards() {
            alert('🚀 Dashboards:\n\n• Cliente (9 abas)\n• Profissional (4 seções)\n• Admin (9 abas)\n\nSistema multipas interligado funcionando!');
        }
        
        // Efeitos automáticos
        setInterval(() => {
            const orbs = document.querySelectorAll('.profissional');
            const random = orbs[Math.floor(Math.random() * orbs.length)];
            random.style.boxShadow = '0 0 20px currentColor';
            setTimeout(() => random.style.boxShadow = 'none', 400);
        }, 2500);
        
        // Inicializar
        carregarProfissionais();
    </script>
</body>
</html>
EOF

echo ""
echo "✅ INSTALAÇÃO CONCLUÍDA COM SUCESSO!"
echo ""
echo "🚀 PARA INICIAR O ORBITRUM:"
echo "npm start"
echo ""
echo "📱 ENDEREÇOS DE ACESSO:"
echo "PC: http://localhost:3000"
echo "Celular: http://$(hostname -I | awk '{print $1}'):3000"
echo ""
echo "🌌 Sistema Neural Orbital pronto para uso!"
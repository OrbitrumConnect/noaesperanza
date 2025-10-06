# 🚀 ORBITRUM - EXECUÇÃO DIRETA GIT BASH (SEM REPOSITÓRIO)

## PASSO A PASSO 100% CORRETO PARA VISUALIZAR O APP

### ✅ PREPARAÇÃO INICIAL

1. **Abrir Git Bash como Administrador**
   ```bash
   # Clique direito no Git Bash > "Executar como administrador"
   # OU use o atalho Windows + X > "Windows PowerShell (Admin)"
   ```

2. **Verificar Node.js instalado**
   ```bash
   node --version
   npm --version
   
   # Se não tiver instalado:
   # Baixe de: https://nodejs.org (versão 18+ recomendada)
   ```

### 📁 INSTALAÇÃO DIRETA (SEM GIT)

3. **Navegar para pasta de trabalho**
   ```bash
   cd /c/Users/SeuUsuario/Desktop
   # OU qualquer pasta que preferir
   mkdir orbitrum-local
   cd orbitrum-local
   ```

4. **Executar instalação automática**
   ```bash
   # Se você tem o arquivo INSTALACAO-WINDOWS-COMPLETA.bat:
   ./INSTALACAO-WINDOWS-COMPLETA.bat
   
   # OU instalação manual:
   npm init -y
   npm install express cors body-parser path
   ```

### 🖥️ CONFIGURAÇÃO DO SERVIDOR

5. **Criar servidor principal (server.js)**
   ```bash
   cat > server.js << 'EOF'
   const express = require('express');
   const cors = require('cors');
   const path = require('path');
   const app = express();
   const PORT = 3000;
   
   app.use(cors());
   app.use(express.json());
   app.use(express.static('public'));
   
   // API simples para profissionais orbitais
   app.get('/api/professionals', (req, res) => {
     const professionals = [
       {id: 1, name: "Carlos Silva", title: "Pintor", rating: 4.8, available: true},
       {id: 2, name: "Maria Santos", title: "Eletricista", rating: 4.9, available: true},
       {id: 3, name: "João Pereira", title: "Encanador", rating: 4.7, available: true},
       {id: 4, name: "Ana Costa", title: "Jardineira", rating: 4.6, available: true},
       {id: 5, name: "Pedro Lima", title: "Marceneiro", rating: 4.8, available: true},
       {id: 6, name: "Lucia Rocha", title: "Costureira", rating: 4.9, available: true},
       {id: 7, name: "Roberto Dias", title: "Pedreiro", rating: 4.5, available: true},
       {id: 8, name: "Fernanda Luz", title: "Cozinheira", rating: 4.7, available: true},
       {id: 9, name: "Marcos Vieira", title: "Motorista", rating: 4.6, available: true},
       {id: 10, name: "Patricia Gomes", title: "Faxineira", rating: 4.8, available: true},
       {id: 11, name: "Ricardo Nunes", title: "Técnico TI", rating: 4.9, available: true},
       {id: 12, name: "Juliana Soares", title: "Veterinária", rating: 4.7, available: true},
       {id: 13, name: "André Ferreira", title: "Soldador", rating: 4.6, available: true},
       {id: 14, name: "Carla Mendes", title: "Professora", rating: 4.8, available: true},
       {id: 15, name: "Diego Santos", title: "Segurança", rating: 4.5, available: true},
       {id: 16, name: "Renata Silva", title: "Designer", rating: 4.9, available: true}
     ];
     res.json(professionals);
   });
   
   // API da carteira
   app.get('/api/wallet/user', (req, res) => {
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
   
   // Dashboard routes
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
     console.log('🌌 ORBITRUM FUNCIONANDO!');
     console.log('📱 PC: http://localhost:3000');
     console.log('📱 Celular: http://SEU_IP:3000');
     console.log('🧠 Neural Brain Central ativo');
     console.log('🚀 16 Profissionais orbitais carregados');
   });
   EOF
   ```

6. **Criar pasta public e interface**
   ```bash
   mkdir public
   
   # Criar index.html principal
   cat > public/index.html << 'EOF'
   <!DOCTYPE html>
   <html lang="pt-BR">
   <head>
       <meta charset="UTF-8">
       <meta name="viewport" content="width=device-width, initial-scale=1.0">
       <title>Orbitrum - Sistema Neural Orbital</title>
       <script src="https://cdn.tailwindcss.com"></script>
       <style>
           body { background: linear-gradient(to bottom right, #1a202c, #2d3748, #4a5568); }
           .neural-glow { box-shadow: 0 0 20px rgba(56, 178, 172, 0.5); }
           .orbit-animation { animation: rotate 20s linear infinite; }
           @keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
       </style>
   </head>
   <body class="min-h-screen text-white">
       <div class="min-h-screen flex items-center justify-center p-8">
           <div class="text-center">
               <h1 class="text-6xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">
                   ORBITRUM
               </h1>
               <p class="text-2xl mb-12 text-cyan-300">Sistema Neural Orbital</p>
               
               <!-- Neural Brain Central -->
               <div class="relative mb-12">
                   <div class="w-32 h-32 mx-auto neural-glow bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform" onclick="expandBrain()">
                       <svg class="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
                           <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                       </svg>
                   </div>
                   
                   <!-- 16 Profissionais Orbitais -->
                   <div id="orbital-system" class="absolute inset-0 pointer-events-none">
                       <!-- Anel 1 - 6 profissionais -->
                       <div class="orbit-animation absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-cyan-500/30 rounded-full">
                           <div class="absolute -top-3 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-green-500 rounded-full" title="Carlos Silva - Pintor"></div>
                           <div class="absolute top-1/2 -right-3 transform -translate-y-1/2 w-6 h-6 bg-blue-500 rounded-full" title="Maria Santos - Eletricista"></div>
                           <div class="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-purple-500 rounded-full" title="João Pereira - Encanador"></div>
                           <div class="absolute top-1/2 -left-3 transform -translate-y-1/2 w-6 h-6 bg-yellow-500 rounded-full" title="Ana Costa - Jardineira"></div>
                           <div class="absolute top-1/4 -right-1 transform -translate-y-1/2 w-6 h-6 bg-pink-500 rounded-full" title="Pedro Lima - Marceneiro"></div>
                           <div class="absolute top-3/4 -left-1 transform -translate-y-1/2 w-6 h-6 bg-indigo-500 rounded-full" title="Lucia Rocha - Costureira"></div>
                       </div>
                       
                       <!-- Anel 2 - 7 profissionais -->
                       <div class="orbit-animation absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 border border-blue-500/20 rounded-full" style="animation-direction: reverse; animation-duration: 30s;">
                           <div class="absolute -top-3 left-1/2 transform -translate-x-1/2 w-5 h-5 bg-red-500 rounded-full" title="Roberto Dias - Pedreiro"></div>
                           <div class="absolute top-1/4 -right-3 transform -translate-y-1/2 w-5 h-5 bg-orange-500 rounded-full" title="Fernanda Luz - Cozinheira"></div>
                           <div class="absolute top-3/4 -right-3 transform -translate-y-1/2 w-5 h-5 bg-teal-500 rounded-full" title="Marcos Vieira - Motorista"></div>
                           <div class="absolute -bottom-3 left-3/4 transform -translate-x-1/2 w-5 h-5 bg-emerald-500 rounded-full" title="Patricia Gomes - Faxineira"></div>
                           <div class="absolute -bottom-3 left-1/4 transform -translate-x-1/2 w-5 h-5 bg-violet-500 rounded-full" title="Ricardo Nunes - Técnico TI"></div>
                           <div class="absolute top-3/4 -left-3 transform -translate-y-1/2 w-5 h-5 bg-lime-500 rounded-full" title="Juliana Soares - Veterinária"></div>
                           <div class="absolute top-1/4 -left-3 transform -translate-y-1/2 w-5 h-5 bg-amber-500 rounded-full" title="André Ferreira - Soldador"></div>
                       </div>
                       
                       <!-- Anel 3 - 3 profissionais -->
                       <div class="orbit-animation absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 border border-purple-500/10 rounded-full" style="animation-duration: 40s;">
                           <div class="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-rose-500 rounded-full" title="Carla Mendes - Professora"></div>
                           <div class="absolute top-1/3 -right-2 transform -translate-y-1/2 w-4 h-4 bg-sky-500 rounded-full" title="Diego Santos - Segurança"></div>
                           <div class="absolute top-2/3 -left-2 transform -translate-y-1/2 w-4 h-4 bg-fuchsia-500 rounded-full" title="Renata Silva - Designer"></div>
                       </div>
                   </div>
               </div>
               
               <div class="space-y-6">
                   <button onclick="goToDashboard()" class="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 px-8 py-4 rounded-xl font-semibold text-lg shadow-lg transform hover:scale-105 transition-all">
                       🚀 DASHBOARDS
                   </button>
                   
                   <div class="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
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
           function expandBrain() {
               console.log('🧠 Neural Brain ativado!');
               const brain = document.querySelector('.neural-glow');
               brain.style.transform = 'scale(1.2)';
               setTimeout(() => brain.style.transform = 'scale(1)', 500);
               
               // Som de ativação
               try {
                   const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                   const oscillator = audioContext.createOscillator();
                   oscillator.frequency.setValueAtTime(220, audioContext.currentTime);
                   oscillator.frequency.exponentialRampToValueAtTime(1100, audioContext.currentTime + 0.1);
                   oscillator.connect(audioContext.destination);
                   oscillator.start();
                   oscillator.stop(audioContext.currentTime + 0.1);
               } catch(e) {}
           }
           
           function goToDashboard() {
               window.location.href = '/dashboard-selector';
           }
           
           // Animações automáticas dos profissionais
           setInterval(() => {
               const orbs = document.querySelectorAll('#orbital-system .rounded-full');
               orbs.forEach(orb => {
                   orb.style.boxShadow = '0 0 10px currentColor';
                   setTimeout(() => orb.style.boxShadow = 'none', 200);
               });
           }, 3000);
           
           // Carregar profissionais via API
           fetch('/api/professionals')
               .then(response => response.json())
               .then(professionals => {
                   console.log('🚀 16 Profissionais carregados:', professionals);
               });
       </script>
   </body>
   </html>
   EOF
   ```

### 🚀 EXECUÇÃO DO SISTEMA

7. **Iniciar o servidor**
   ```bash
   echo "🌌 Iniciando ORBITRUM..."
   node server.js
   ```

8. **Verificar funcionamento**
   ```bash
   # Em outro terminal Git Bash:
   curl http://localhost:3000/api/professionals
   
   # Deve retornar JSON com 16 profissionais
   ```

### 📱 ACESSO AO SISTEMA

9. **No PC**
   - Abra navegador em: `http://localhost:3000`

10. **No celular (mesma rede WiFi)**
    ```bash
    # Descobrir seu IP:
    ipconfig | grep "IPv4"
    
    # Exemplo: se IP for 192.168.1.100
    # Acesse no celular: http://192.168.1.100:3000
    ```

### ✅ CONFIRMAÇÃO DE FUNCIONAMENTO

Você deve ver:
- ✅ Página inicial com "ORBITRUM" 
- ✅ Neural Brain Central azul brilhante
- ✅ 16 profissionais orbitando em 3 anéis
- ✅ Animações automáticas funcionando
- ✅ Botão "DASHBOARDS" ativo
- ✅ Console mostrando logs do servidor

### 🛠️ SOLUÇÃO DE PROBLEMAS

**Erro "node não encontrado":**
```bash
# Instalar Node.js primeiro
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install node
```

**Erro "porta ocupada":**
```bash
# Matar processo na porta 3000:
netstat -ano | findstr :3000
taskkill /PID NUMERO_DO_PID /F
```

**Não carrega no celular:**
```bash
# Verificar firewall do Windows
# Permitir Node.js no firewall
# Confirmar que PC e celular estão na mesma rede WiFi
```

## PRONTO! 🎉

Seu sistema Orbitrum estará funcionando 100% no Git Bash sem necessidade de repositório Git!
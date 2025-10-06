@echo off
title ORBITRUM - Instalacao Automatica Windows
color 09
cls

echo.
echo ========================== ORBITRUM ==========================
echo           Sistema Neural Orbital - Instalacao Windows
echo ===========================================================
echo.

REM Verificar Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERRO] Node.js nao encontrado!
    echo.
    echo Baixe e instale Node.js de: https://nodejs.org
    echo Apos instalar, execute este script novamente.
    echo.
    pause
    exit /b 1
)

echo [OK] Node.js encontrado: 
node --version

REM Criar pasta do projeto
echo.
echo [INFO] Criando projeto Orbitrum local...
if exist orbitrum-local rmdir /s /q orbitrum-local
mkdir orbitrum-local
cd orbitrum-local

REM Criar package.json
echo [INFO] Configurando package.json...
(
echo {
echo   "name": "orbitrum-local-windows",
echo   "version": "1.0.0",
echo   "description": "Orbitrum Sistema Local Windows",
echo   "main": "servidor.js",
echo   "scripts": {
echo     "start": "node servidor.js",
echo     "dev": "node servidor.js"
echo   },
echo   "dependencies": {
echo     "express": "^4.18.2",
echo     "cors": "^2.8.5"
echo   }
echo }
) > package.json

REM Instalar dependencias
echo [INFO] Instalando dependencias...
call npm install --silent

REM Criar servidor principal
echo [INFO] Criando servidor principal...
(
echo const express = require('express'^);
echo const cors = require('cors'^);
echo const path = require('path'^);
echo const net = require('net'^);
echo const app = express(^);
echo.
echo app.use(cors(^)^);
echo app.use(express.json(^)^);
echo app.use(express.static('.'^^)^);
echo.
echo // Encontrar porta livre automaticamente
echo function encontrarPortaLivre(startPort, callback^) {
echo   const server = net.createServer(^);
echo   server.unref(^);
echo   server.on('error', (^) =^> encontrarPortaLivre(startPort + 1, callback^)^);
echo   server.listen(startPort, (^) =^> {
echo     const port = server.address(^).port;
echo     server.close((^) =^> callback(port^)^);
echo   }^);
echo }
echo.
echo // 16 profissionais orbitais
echo const profissionais = [
echo   {id: 1, nome: "Carlos Silva", profissao: "Pintor", nota: 4.8},
echo   {id: 2, nome: "Maria Santos", profissao: "Eletricista", nota: 4.9},
echo   {id: 3, nome: "Joao Pereira", profissao: "Encanador", nota: 4.7},
echo   {id: 4, nome: "Ana Costa", profissao: "Jardineira", nota: 4.6},
echo   {id: 5, nome: "Pedro Lima", profissao: "Marceneiro", nota: 4.8},
echo   {id: 6, nome: "Lucia Rocha", profissao: "Costureira", nota: 4.9},
echo   {id: 7, nome: "Roberto Dias", profissao: "Pedreiro", nota: 4.5},
echo   {id: 8, nome: "Fernanda Luz", profissao: "Cozinheira", nota: 4.7},
echo   {id: 9, nome: "Marcos Vieira", profissao: "Motorista", nota: 4.6},
echo   {id: 10, nome: "Patricia Gomes", profissao: "Faxineira", nota: 4.8},
echo   {id: 11, nome: "Ricardo Nunes", profissao: "Tecnico TI", nota: 4.9},
echo   {id: 12, nome: "Juliana Soares", profissao: "Veterinaria", nota: 4.7},
echo   {id: 13, nome: "Andre Ferreira", profissao: "Soldador", nota: 4.6},
echo   {id: 14, nome: "Carla Mendes", profissao: "Professora", nota: 4.8},
echo   {id: 15, nome: "Diego Santos", profissao: "Seguranca", nota: 4.5},
echo   {id: 16, nome: "Renata Silva", profissao: "Designer", nota: 4.9}
echo ];
echo.
echo // APIs
echo app.get('/api/profissionais', (req, res^) =^> {
echo   console.log('API: 16 profissionais carregados'^);
echo   res.json(profissionais^);
echo }^);
echo.
echo app.get('/api/carteira', (req, res^) =^> {
echo   res.json({tokens: 2160, creditos: 0, plano: 'Ativo'}^);
echo }^);
echo.
echo // Iniciar servidor em porta livre
echo encontrarPortaLivre(3000, (porta^) =^> {
echo   app.listen(porta, '0.0.0.0', (^) =^> {
echo     console.clear(^);
echo     console.log('========================== ORBITRUM ========================='^);
echo     console.log('           Sistema Neural Orbital FUNCIONANDO!'^);
echo     console.log('========================================================'^);
echo     console.log('^);
echo     console.log(`PC: http://localhost:${porta}`^);
echo     console.log(`Celular: http://SEU_IP:${porta}`^);
echo     console.log('^);
echo     console.log('Neural Brain Central: ATIVO'^);
echo     console.log('16 Profissionais Orbitais: CARREGADOS'^);
echo     console.log('Sistema de Carteira: FUNCIONANDO'^);
echo     console.log('^);
echo     console.log('========================================================'^);
echo     console.log('Sistema pronto para uso!'^);
echo   }^);
echo }^);
) > servidor.js

REM Criar interface HTML
echo [INFO] Criando interface HTML...
(
echo ^<!DOCTYPE html^>
echo ^<html lang="pt-BR"^>
echo ^<head^>
echo     ^<meta charset="UTF-8"^>
echo     ^<meta name="viewport" content="width=device-width, initial-scale=1.0"^>
echo     ^<title^>Orbitrum - Sistema Neural Orbital^</title^>
echo     ^<script src="https://cdn.tailwindcss.com"^>^</script^>
echo     ^<style^>
echo         body { background: linear-gradient(135deg, #1a202c 0%%, #2d3748 50%%, #4a5568 100%%^); }
echo         .cerebro { box-shadow: 0 0 30px rgba(56, 178, 172, 0.7^); animation: pulso 3s infinite; }
echo         @keyframes pulso { 0%%, 100%% { box-shadow: 0 0 20px rgba(56, 178, 172, 0.5^); } 50%% { box-shadow: 0 0 40px rgba(56, 178, 172, 0.9^); } }
echo         .orbita-1 { animation: girar 20s linear infinite; }
echo         .orbita-2 { animation: girar-inverso 30s linear infinite; }
echo         .orbita-3 { animation: girar 40s linear infinite; }
echo         @keyframes girar { from { transform: rotate(0deg^); } to { transform: rotate(360deg^); } }
echo         @keyframes girar-inverso { from { transform: rotate(360deg^); } to { transform: rotate(0deg^); } }
echo         .profissional { transition: all 0.3s; cursor: pointer; }
echo         .profissional:hover { transform: scale(1.3^); box-shadow: 0 0 15px currentColor; }
echo     ^</style^>
echo ^</head^>
echo ^<body class="min-h-screen text-white"^>
echo     ^<div class="min-h-screen flex flex-col items-center justify-center p-4"^>
echo         ^<div class="text-center mb-8"^>
echo             ^<h1 class="text-6xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600"^>ORBITRUM^</h1^>
echo             ^<p class="text-2xl text-cyan-300 mb-2"^>Sistema Neural Orbital^</p^>
echo             ^<p class="text-cyan-200"^>Conecte-se com profissionais proximos^</p^>
echo         ^</div^>
echo         
echo         ^<div class="relative w-96 h-96 mb-8"^>
echo             ^<div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30"^>
echo                 ^<div class="w-24 h-24 cerebro bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-all" onclick="ativarCerebro(^)"^>
echo                     ^<div class="text-3xl"^>🧠^</div^>
echo                 ^</div^>
echo             ^</div^>
echo             
echo             ^<div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-56 h-56 border border-cyan-400/30 rounded-full orbita-1"^>
echo                 ^<div class="absolute -top-4 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-green-500 rounded-full profissional" title="Carlos Silva - Pintor"^>^</div^>
echo                 ^<div class="absolute top-1/2 -right-4 transform -translate-y-1/2 w-8 h-8 bg-blue-500 rounded-full profissional" title="Maria Santos - Eletricista"^>^</div^>
echo                 ^<div class="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-purple-500 rounded-full profissional" title="Joao Pereira - Encanador"^>^</div^>
echo                 ^<div class="absolute top-1/2 -left-4 transform -translate-y-1/2 w-8 h-8 bg-yellow-500 rounded-full profissional" title="Ana Costa - Jardineira"^>^</div^>
echo                 ^<div class="absolute top-1/4 -right-2 transform -translate-y-1/2 w-8 h-8 bg-pink-500 rounded-full profissional" title="Pedro Lima - Marceneiro"^>^</div^>
echo                 ^<div class="absolute top-3/4 -left-2 transform -translate-y-1/2 w-8 h-8 bg-indigo-500 rounded-full profissional" title="Lucia Rocha - Costureira"^>^</div^>
echo             ^</div^>
echo         ^</div^>
echo         
echo         ^<div class="grid grid-cols-3 gap-4 mb-8"^>
echo             ^<div class="bg-black/20 border border-cyan-400/30 rounded-lg p-4 text-center"^>
echo                 ^<div class="text-2xl font-bold text-cyan-400"^>16^</div^>
echo                 ^<div class="text-sm text-cyan-300"^>Profissionais^</div^>
echo             ^</div^>
echo             ^<div class="bg-black/20 border border-green-400/30 rounded-lg p-4 text-center"^>
echo                 ^<div class="text-2xl font-bold text-green-400"^>2.160^</div^>
echo                 ^<div class="text-sm text-green-300"^>Tokens^</div^>
echo             ^</div^>
echo             ^<div class="bg-black/20 border border-purple-400/30 rounded-lg p-4 text-center"^>
echo                 ^<div class="text-2xl font-bold text-purple-400"^>100%%^</div^>
echo                 ^<div class="text-sm text-purple-300"^>Ativo^</div^>
echo             ^</div^>
echo         ^</div^>
echo         
echo         ^<button onclick="abrirDashboards(^)" class="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 px-8 py-4 rounded-xl font-bold text-lg shadow-2xl hover:scale-105 transition-all"^>
echo             🚀 DASHBOARDS
echo         ^</button^>
echo     ^</div^>
echo     
echo     ^<script^>
echo         function ativarCerebro(^) {
echo             console.log('Neural Brain ativado!'^);
echo             const cerebro = document.querySelector('.cerebro'^);
echo             cerebro.style.transform = 'scale(1.4^)';
echo             setTimeout((^) =^> cerebro.style.transform = 'scale(1^)', 800^);
echo         }
echo         
echo         function abrirDashboards(^) {
echo             alert('Dashboards Orbitrum:\n\n• Cliente (9 abas^)\n• Profissional (4 secoes^)\n• Admin (9 abas^)\n\nSistema multipas funcionando!'^);
echo         }
echo         
echo         fetch('/api/profissionais'^)
echo             .then(response =^> response.json(^)^)
echo             .then(data =^> console.log('16 Profissionais carregados:', data^)^);
echo     ^</script^>
echo ^</body^>
echo ^</html^>
) > index.html

echo.
echo [SUCESSO] Instalacao concluida!
echo.
echo Para iniciar o Orbitrum:
echo   npm start
echo.
echo O sistema encontrara automaticamente uma porta livre.
echo.
pause
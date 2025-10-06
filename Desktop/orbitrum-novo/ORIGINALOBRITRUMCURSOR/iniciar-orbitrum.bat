@echo off
chcp 65001 >nul
cls
color 0A

echo ╔══════════════════════════════════════════╗
echo ║          🚀 ORBITRUM CONNECT             ║  
echo ║         Iniciando Sistema Local          ║
echo ╚══════════════════════════════════════════╝
echo.

echo [PASSO 1] Verificando Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js não encontrado!
    echo 📥 Baixe em: https://nodejs.org
    echo.
    pause
    exit /b 1
)
echo ✅ Node.js detectado

echo.
echo [PASSO 2] Instalando dependências...
echo ⏳ Isso pode levar alguns minutos...
call npm install >nul 2>&1
echo ✅ Dependências instaladas

echo.
echo [PASSO 3] Configurando ambiente...
if not exist .env (
    echo DATABASE_URL="file:./local.db" > .env
    echo NODE_ENV=development >> .env
    echo PORT=3000 >> .env
)
echo ✅ Ambiente configurado

echo.
echo [PASSO 4] Iniciando servidores...
echo.
echo ╔══════════════════════════════════════════╗
echo ║             🎯 SISTEMA ATIVO             ║
echo ╠══════════════════════════════════════════╣
echo ║  💻 PC: http://localhost:3000            ║
echo ║  📱 Mobile: http://[SEU-IP]:3000         ║
echo ║                                          ║
echo ║  🧠 Neural Brain: Sistema Orbital Ativo ║
echo ║  📊 Dashboards: Cliente/Pro/Admin       ║
echo ║  💰 Sistema Tokens: Modo Demo            ║
echo ╚══════════════════════════════════════════╝
echo.
echo Pressione Ctrl+C para parar o servidor
echo.

start http://localhost:3000
call npm run dev

echo.
echo Sistema encerrado. Pressione qualquer tecla...
pause >nul
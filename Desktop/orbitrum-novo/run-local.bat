@echo off
title Orbitrum Connect - Setup Local
color 0A

echo.
echo  ========================================
echo  🚀 ORBITRUM CONNECT - INSTALACAO LOCAL  
echo  ========================================
echo.

echo 📋 Verificando Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js não encontrado!
    echo 📥 Baixe em: https://nodejs.org
    pause
    exit /b 1
)
echo ✅ Node.js encontrado

echo.
echo 📋 Criando estrutura do projeto...
if not exist "orbitrum-local" mkdir orbitrum-local
cd orbitrum-local

echo.
echo 📋 Executando setup automático...
node ../setup-local.js

echo.
echo 📋 Instalando dependências...
call npm install

echo.
echo 📋 Descobrindo IP local...
for /f "tokens=2 delims=:" %%i in ('ipconfig ^| findstr /c:"IPv4"') do (
    for /f "tokens=1" %%j in ("%%i") do set LOCAL_IP=%%j
)

echo.
echo  ========================================
echo  ✅ ORBITRUM LOCAL CONFIGURADO!
echo  ========================================
echo.
echo  💻 PC: http://localhost:3000
echo  📱 Celular: http://%LOCAL_IP%:3000
echo.
echo  📋 Para iniciar:
echo  1. npm start
echo  2. Abrir links acima
echo.
echo  🧠 Neural Brain System Preservado!
echo  ========================================
echo.

echo 🚀 Iniciando servidor automaticamente...
echo.
start "Orbitrum Local" cmd /k "npm start"

echo ✅ Servidor iniciado! Verifique a nova janela.
pause
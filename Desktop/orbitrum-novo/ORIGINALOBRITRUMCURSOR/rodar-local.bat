@echo off
echo ========================================
echo    ORBITRUM CONNECT - INSTALACAO LOCAL
echo ========================================
echo.

echo [1/4] Verificando Node.js...
node --version || (
    echo ERRO: Node.js nao encontrado!
    echo Baixe em: https://nodejs.org
    pause
    exit /b 1
)

echo [2/4] Instalando dependencias principais...
call npm install

echo [3/4] Instalando dependencias do cliente...
cd client
call npm install
cd ..

echo [4/4] Instalando dependencias do servidor...
cd server  
call npm install
cd ..

echo.
echo ========================================
echo    INSTALACAO CONCLUIDA COM SUCESSO!
echo ========================================
echo.
echo Iniciando servidor...
echo.
echo Acesse: http://localhost:3000
echo Mobile: http://[SEU-IP]:3000
echo.

call npm run dev

pause
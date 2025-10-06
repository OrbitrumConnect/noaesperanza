@echo off
echo ========================================
echo    ORBITRUM CONNECT - INICIADOR RAPIDO
echo ========================================
echo.
echo Data: %date% %time%
echo.

cd /d "C:\Users\phpg6\Desktop\orbitrum-novo"

echo [1/3] Verificando dependencias...
if not exist "node_modules" (
    echo Instalando dependencias...
    npm install
) else (
    echo Dependencias ja instaladas.
)

echo.
echo [2/3] Configurando ambiente...
set NODE_ENV=development

echo.
echo [3/3] Iniciando servidor...
echo.
echo ========================================
echo    ORBITRUM CONNECT v2.0.0
echo ========================================
echo.
echo URL: http://localhost:5000
echo Admin: passosmir4@gmail.com
echo Senha: m6m7m8M9!horus
echo.
echo Pressione Ctrl+C para parar o servidor
echo ========================================
echo.

npx tsx server/index.ts

pause
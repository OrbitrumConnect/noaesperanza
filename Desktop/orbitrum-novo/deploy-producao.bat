@echo off
echo ========================================
echo    ORBITRUM CONNECT - DEPLOY PRODUCAO
echo ========================================
echo.
echo Data: %date% %time%
echo.

cd /d "C:\Users\phpg6\Desktop\orbitrum-novo"

echo [1/4] Verificando dependencias...
if not exist "node_modules" (
    echo Instalando dependencias...
    npm install
) else (
    echo Dependencias ja instaladas.
)

echo.
echo [2/4] Build do projeto...
echo Executando build...
npm run build

echo.
echo [3/4] Deploy no Vercel...
echo.
echo ========================================
echo    DEPLOY NO VERCEL (FRONTEND)
echo ========================================
echo.
echo URL: https://seu-dominio.vercel.app
echo.
echo Configurar no Vercel Dashboard:
echo - NODE_ENV=production
echo - VITE_API_URL=https://captivating-nature-orbitrum20.up.railway.app
echo - SESSION_SECRET=orbitrum-production-secret-key-2025
echo.
echo Pressione qualquer tecla para continuar...
pause >nul

vercel --prod

echo.
echo [4/4] Deploy no Railway...
echo.
echo ========================================
echo    DEPLOY NO RAILWAY (BACKEND)
echo ========================================
echo.
echo URL: https://captivating-nature-orbitrum20.up.railway.app
echo.
echo Configurar no Railway Dashboard:
echo - NODE_ENV=production
echo - PORT=5000
echo - SESSION_SECRET=orbitrum-production-secret-key-2025
echo.
echo Pressione qualquer tecla para continuar...
pause >nul

echo.
echo ========================================
echo    DEPLOY CONCLUIDO!
echo ========================================
echo.
echo Frontend: https://seu-dominio.vercel.app
echo Backend: https://captivating-nature-orbitrum20.up.railway.app
echo Admin: passosmir4@gmail.com / m6m7m8M9!horus
echo.
echo Pressione qualquer tecla para sair...
pause >nul 
@echo off
chcp 65001 >nul
echo 🚀 ORBITRUM CONNECT - DEPLOY VERCEL
echo ==================================

REM Verificar se está no diretório correto
if not exist "package.json" (
    echo ❌ Execute este script na raiz do projeto Orbitrum
    pause
    exit /b 1
)

echo 📋 Verificando pré-requisitos...

REM Verificar Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js não encontrado. Instale o Node.js primeiro.
    pause
    exit /b 1
)

REM Verificar NPM
npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ NPM não encontrado. Instale o NPM primeiro.
    pause
    exit /b 1
)

REM Verificar Git
git --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Git não encontrado. Instale o Git primeiro.
    pause
    exit /b 1
)

echo ✅ Pré-requisitos OK

echo 🔐 Verificando configurações...
if not exist ".env" (
    echo ⚠️  Arquivo .env não encontrado
    echo ⚠️  Configure as variáveis de ambiente no Vercel Dashboard
    echo 📝 Use o arquivo vercel-env-example.txt como referência
)

echo 📦 Instalando dependências...
npm install
if errorlevel 1 (
    echo ❌ Erro ao instalar dependências
    pause
    exit /b 1
)

echo ✅ Dependências instaladas

echo 🔧 Testando build local...
npm run build:vercel
if errorlevel 1 (
    echo ❌ Erro no build local
    echo 💡 Verifique os logs acima e corrija os erros
    pause
    exit /b 1
)

echo ✅ Build local OK

echo 📝 Verificando status do Git...
git status --porcelain
if errorlevel 0 (
    echo ⚠️  Há mudanças não commitadas
    set /p commit="Deseja fazer commit das mudanças? (s/n): "
    if /i "%commit%"=="s" (
        git add .
        git commit -m "Deploy Vercel - %date% %time%"
        echo ✅ Mudanças commitadas
    )
)

echo 📤 Fazendo push para GitHub...
git push origin main
if errorlevel 1 (
    echo ❌ Erro ao fazer push
    pause
    exit /b 1
)

echo ✅ Push realizado com sucesso

echo.
echo 🎯 PRÓXIMOS PASSOS:
echo 1. Acesse: https://vercel.com/dashboard
echo 2. Clique em 'New Project'
echo 3. Importe seu repositório do GitHub
echo 4. Configure as variáveis de ambiente:
echo    - VITE_SUPABASE_URL
echo    - VITE_SUPABASE_ANON_KEY
echo    - DATABASE_URL
echo    - SESSION_SECRET
echo 5. Build Command: npm run build:vercel
echo 6. Output Directory: dist
echo 7. Clique em 'Deploy'
echo.
echo 🎉 Deploy preparado com sucesso!
echo 📖 Consulte DEPLOY-VERCEL-COMPLETO.md para instruções detalhadas
echo.
pause 
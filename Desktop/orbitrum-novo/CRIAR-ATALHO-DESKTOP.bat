@echo off
title Criando Atalho Desktop - Orbitrum
color 0A

echo.
echo ========== CRIAR ATALHO ORBITRUM NO DESKTOP ==========
echo.

REM Detectar pasta do usuário
set DESKTOP=%USERPROFILE%\Desktop
echo Desktop detectado: %DESKTOP%

REM Detectar pasta atual do projeto
set PROJETO_PATH=%CD%\orbitrum-local
echo Projeto: %PROJETO_PATH%

REM Criar atalho .bat no desktop
echo @echo off > "%DESKTOP%\Iniciar Orbitrum.bat"
echo title ORBITRUM - Sistema Neural Orbital >> "%DESKTOP%\Iniciar Orbitrum.bat"
echo color 09 >> "%DESKTOP%\Iniciar Orbitrum.bat"
echo cd /d "%PROJETO_PATH%" >> "%DESKTOP%\Iniciar Orbitrum.bat"
echo echo Iniciando Orbitrum... >> "%DESKTOP%\Iniciar Orbitrum.bat"
echo npm start >> "%DESKTOP%\Iniciar Orbitrum.bat"
echo pause >> "%DESKTOP%\Iniciar Orbitrum.bat"

echo.
echo ✅ ATALHO CRIADO COM SUCESSO!
echo.
echo 📋 Arquivo criado: "%DESKTOP%\Iniciar Orbitrum.bat"
echo.
echo 🚀 COMO USAR:
echo 1. Duplo clique no atalho "Iniciar Orbitrum" no Desktop
echo 2. Sistema inicia automaticamente
echo 3. Abre no navegador: http://localhost:PORTA
echo.
echo 💡 O atalho funciona mesmo após reiniciar o PC!
echo.
pause
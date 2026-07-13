@echo off
setlocal

REM PL Tecnologia - Start Vite (dev)
REM Usage: double-click this file

cd /d "%~dp0"

where npm >nul 2>nul
if errorlevel 1 (
  echo.
  echo [ERRO] NPM nao encontrado. Instale o Node.js (LTS) e tente novamente.
  echo.
  pause
  exit /b 1
)

if not exist "node_modules\" (
  echo.
  echo Instalando dependencias...
  call npm install
  if errorlevel 1 (
    echo.
    echo [ERRO] Falha ao instalar dependencias.
    pause
    exit /b 1
  )
)

echo.
echo Iniciando servidor Vite...
echo (Feche esta janela para parar)
echo.
call npm run dev

endlocal

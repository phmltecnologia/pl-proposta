@echo off
setlocal

REM PL Tecnologia - Build + Preview (servir a versao final)
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
echo Gerando build...
call npm run build
if errorlevel 1 (
  echo.
  echo [ERRO] Falha no build.
  pause
  exit /b 1
)

echo.
echo Iniciando preview...
echo (Feche esta janela para parar)
echo.
call npm run preview

endlocal

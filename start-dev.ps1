$ErrorActionPreference = "Stop"

Set-Location -Path $PSScriptRoot

if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
  Write-Host ""
  Write-Host "[ERRO] NPM nao encontrado. Instale o Node.js (LTS) e tente novamente."
  Write-Host ""
  Read-Host "Pressione ENTER para sair"
  exit 1
}

if (-not (Test-Path -Path "node_modules" -PathType Container)) {
  Write-Host ""
  Write-Host "Instalando dependencias..."
  npm install
}

Write-Host ""
Write-Host "Iniciando servidor Vite..."
Write-Host "(Feche esta janela para parar)"
Write-Host ""
npm run dev


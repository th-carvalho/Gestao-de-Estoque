@echo off
cd /d "%~dp0"

if not exist "dist" (
  echo Configurando pela primeira vez, aguarde...
  "C:\Program Files\nodejs\node.exe" "C:\Program Files\nodejs\node_modules\npm\bin\npm-cli.js" run build
)

start "Servidor" "C:\Program Files\nodejs\node.exe" server/index.js
timeout /t 4 /nobreak >nul
start "" "http://localhost:3001"

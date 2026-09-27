@echo off
cd /d "%~dp0"

if not exist "dist" (
  echo Configurando pela primeira vez, aguarde...
  "C:\Program Files\nodejs\node.exe" "C:\Program Files\nodejs\node_modules\npm\bin\npm-cli.js" run build
)

start "" "http://localhost:3001"
timeout /t 2 /nobreak >nul
"C:\Program Files\nodejs\node.exe" server/index.js

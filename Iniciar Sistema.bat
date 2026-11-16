@echo off
cd /d "%~dp0"

echo Preparando o sistema, aguarde...
"C:\Program Files\nodejs\node.exe" "C:\Program Files\nodejs\node_modules\npm\bin\npm-cli.js" run build

netstat -ano | findstr ":3001" | findstr "LISTENING" >nul
if %errorlevel%==0 (
  echo Sistema ja esta em execucao.
) else (
  start "Servidor" "C:\Program Files\nodejs\node.exe" server/index.js
  timeout /t 4 /nobreak >nul
)

start "" "http://localhost:3001"

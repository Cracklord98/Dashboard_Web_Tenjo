@echo off
echo 🚀 Iniciando Dashboard Tenjo...
echo.

echo 📡 Iniciando backend...
start "Backend Tenjo" /D backend npm run dev

timeout /t 5 /nobreak >nul

echo 🎨 Iniciando frontend...
start "Frontend Tenjo" /D frontend npm run dev

echo.
echo ✨ Servicios iniciados en ventanas separadas.
echo    Backend:  http://localhost:3000
echo    Frontend: http://localhost:5173
echo.
pause
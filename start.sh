#!/bin/bash

# Script para iniciar frontend y backend en paralelo

echo "🚀 Iniciando Dashboard Tenjo..."
echo ""

# Función para manejar Ctrl+C
trap "echo ''; echo '👋 Cerrando servicios...'; kill 0" SIGINT

# Iniciar backend en background
echo "📡 Iniciando backend en http://localhost:3000"
(cd backend && npm run dev) &
BACKEND_PID=$!

# Esperar un poco para que el backend inicie
sleep 2

# Iniciar frontend en background
echo "🎨 Iniciando frontend en http://localhost:5173"
(cd frontend && npm run dev) &
FRONTEND_PID=$!

echo ""
echo "✨ Servicios iniciados:"
echo "  Backend:  http://localhost:3000"
echo "  Frontend: http://localhost:5173"
echo ""
echo "Presiona Ctrl+C para detener ambos servicios"
echo ""

# Esperar a que ambos procesos terminen
wait $BACKEND_PID
wait $FRONTEND_PID

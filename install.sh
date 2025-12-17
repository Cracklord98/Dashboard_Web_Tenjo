#!/bin/bash

# Script de instalación de dependencias para todo el monorepo

echo "🚀 Instalando dependencias del proyecto..."
echo ""

# Frontend
echo "📦 Instalando frontend..."
cd frontend && npm install --legacy-peer-deps
if [ $? -ne 0 ]; then
    echo "❌ Error instalando frontend"
    exit 1
fi
echo "✅ Frontend instalado"
echo ""

# Backend
echo "📦 Instalando backend..."
cd ../backend && npm install
if [ $? -ne 0 ]; then
    echo "❌ Error instalando backend"
    exit 1
fi
echo "✅ Backend instalado"
echo ""

# Shared
echo "📦 Instalando paquete shared..."
cd ../packages/shared && npm install
if [ $? -ne 0 ]; then
    echo "❌ Error instalando shared"
    exit 1
fi
echo "✅ Shared instalado"
echo ""

# Compilar shared
echo "🔨 Compilando paquete shared..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Error compilando shared"
    exit 1
fi
echo "✅ Shared compilado"
echo ""

cd ../..

echo "✨ ¡Instalación completada!"
echo ""
echo "📝 Próximos pasos:"
echo "  1. Configurar variables de entorno:"
echo "     - backend/.env"
echo "     - frontend/.env"
echo ""
echo "  2. Iniciar el backend:"
echo "     cd backend && npm run dev"
echo ""
echo "  3. Iniciar el frontend (en otra terminal):"
echo "     cd frontend && npm run dev"
echo ""

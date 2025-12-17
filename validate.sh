#!/bin/bash

# Script de validación del proyecto

echo "🔍 Validando estructura del proyecto..."
echo ""

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Contadores
ERRORS=0
WARNINGS=0

# Función para verificar existencia de archivo/directorio
check_exists() {
    if [ -e "$1" ]; then
        echo -e "${GREEN}✓${NC} $1"
    else
        echo -e "${RED}✗${NC} $1 (no encontrado)"
        ((ERRORS++))
    fi
}

# Función para verificar archivo con contenido
check_file_not_empty() {
    if [ -s "$1" ]; then
        echo -e "${GREEN}✓${NC} $1 (tiene contenido)"
    else
        echo -e "${YELLOW}⚠${NC} $1 (vacío o no existe)"
        ((WARNINGS++))
    fi
}

echo "📂 Verificando estructura de carpetas..."
check_exists "frontend"
check_exists "backend"
check_exists "packages/shared"
check_exists "frontend/src"
check_exists "backend/src"
echo ""

echo "📄 Verificando archivos de configuración..."
check_exists "backend/package.json"
check_exists "backend/tsconfig.json"
check_exists "backend/.env.example"
check_exists "backend/.gitignore"
check_exists "frontend/package.json"
check_exists "frontend/tsconfig.json"
check_exists "frontend/.env.example"
check_exists "frontend/.gitignore"
check_exists "packages/shared/package.json"
check_exists "packages/shared/tsconfig.json"
echo ""

echo "🗂️ Verificando estructura del backend..."
check_exists "backend/src/main.ts"
check_exists "backend/src/routes"
check_exists "backend/src/services"
check_exists "backend/src/adapters"
check_exists "backend/src/dto"
check_exists "backend/src/config"
check_exists "backend/src/mappers"
check_exists "backend/src/config/env.ts"
check_exists "backend/src/config/errorHandler.ts"
check_exists "backend/src/config/logger.ts"
check_exists "backend/src/config/validation.ts"
echo ""

echo "🎨 Verificando estructura del frontend..."
check_exists "frontend/src/App.tsx"
check_exists "frontend/src/main.tsx"
check_exists "frontend/src/components"
check_exists "frontend/src/pages"
check_exists "frontend/src/lib"
check_exists "frontend/src/hooks"
check_exists "frontend/src/lib/api.ts"
check_exists "frontend/src/lib/format.ts"
check_exists "frontend/src/lib/constants.ts"
check_exists "frontend/src/hooks/useApi.ts"
check_exists "frontend/src/hooks/useDebounce.ts"
check_exists "frontend/src/components/common/Loading.tsx"
check_exists "frontend/src/components/common/ErrorMessage.tsx"
check_exists "frontend/src/components/dashboard/KpiCard.tsx"
check_exists "frontend/src/components/dashboard/DataTable.tsx"
echo ""

echo "📦 Verificando paquete shared..."
check_exists "packages/shared/src/index.ts"
check_exists "packages/shared/src/types.ts"
check_exists "packages/shared/src/utils.ts"
echo ""

echo "📚 Verificando documentación..."
check_file_not_empty "README.md"
check_file_not_empty "QUICKSTART.md"
check_file_not_empty "ARCHITECTURE.md"
check_file_not_empty "COMMANDS.md"
check_file_not_empty "CHANGELOG.md"
check_file_not_empty "backend/README.md"
check_file_not_empty "frontend/README.md"
check_file_not_empty "packages/shared/README.md"
echo ""

echo "🧹 Verificando limpieza (no deben existir)..."
if [ ! -d "src" ] && [ ! -d "public" ]; then
    echo -e "${GREEN}✓${NC} Carpetas raíz duplicadas eliminadas"
else
    echo -e "${RED}✗${NC} Aún existen carpetas duplicadas en raíz"
    ((ERRORS++))
fi
echo ""

# Verificar node_modules no están en la raíz
if [ ! -d "node_modules" ]; then
    echo -e "${GREEN}✓${NC} node_modules limpio de la raíz"
else
    echo -e "${YELLOW}⚠${NC} node_modules existe en raíz (puede ser normal)"
fi
echo ""

# Resumen
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Resumen de validación:"
echo ""
if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✓ Todo perfecto! Sin errores ni advertencias${NC}"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠ $WARNINGS advertencia(s)${NC}"
    exit 0
else
    echo -e "${RED}✗ $ERRORS error(es), $WARNINGS advertencia(s)${NC}"
    exit 1
fi

# 📋 Comandos Útiles

## 🏃 Desarrollo Diario

### Iniciar proyecto completo
```bash
# Opción 1: Script automático (Linux/Mac)
bash start.sh

# Opción 2: Manual (Windows o preferencia)
# Terminal 1
cd backend && npm run dev

# Terminal 2
cd frontend && npm run dev
```

### Verificar estado
```bash
# Health check del backend
curl http://localhost:3000/health

# Probar endpoint de indicadores
curl http://localhost:3000/api/indicadores

# Probar endpoint de seguimiento
curl http://localhost:3000/api/seguimiento
```

## 🔧 Mantenimiento

### Actualizar dependencias
```bash
# Frontend
cd frontend && npm update

# Backend
cd backend && npm update

# Shared
cd packages/shared && npm update
```

### Limpiar y reinstalar
```bash
# Limpiar todo
rm -rf node_modules package-lock.json
rm -rf frontend/node_modules frontend/package-lock.json
rm -rf backend/node_modules backend/package-lock.json
rm -rf packages/shared/node_modules packages/shared/package-lock.json

# Reinstalar
bash install.sh
```

### Revisar código
```bash
# Frontend
cd frontend && npm run lint

# Backend
cd backend && npm run lint
```

## 🏗️ Build para Producción

### Frontend
```bash
cd frontend
npm run build
# Output en: frontend/dist/

# Probar build localmente
npm run preview
```

### Backend
```bash
cd backend
npm run build
# Output en: backend/dist/

# Ejecutar versión compilada
npm start
```

### Shared
```bash
cd packages/shared
npm run build
# Output en: packages/shared/dist/
```

## 🐛 Debug

### Ver logs del backend
```bash
cd backend
npm run dev
# Los logs aparecerán en consola
```

### Inspeccionar requests
```bash
# Con curl
curl -v http://localhost:3000/api/indicadores

# Headers incluidos
curl -i http://localhost:3000/api/indicadores

# Pretty print JSON
curl http://localhost:3000/api/indicadores | jq
```

### Ver variables de entorno
```bash
# Backend
cd backend && cat .env

# Frontend
cd frontend && cat .env
```

## 📊 Datos de Prueba

### Agregar más datos mock
Editar `backend/src/services/*Service.ts` y agregar items al array:

```typescript
// Ejemplo en indicadoresService.ts
return {
  indicadores: [
    {
      id: '4',
      nombre: 'Nuevo KPI',
      valor: 1000,
      unidad: 'unidades',
      tipo: 'operacional',
      tendencia: 'up',
      cambio: 5.0
    }
  ]
};
```

## 🗄️ Base de Datos (cuando la conectes)

### PostgreSQL
```bash
# Conectar
psql -U user -d dbname

# Ver tablas
\dt

# Ejecutar query
SELECT * FROM indicadores;
```

### MySQL
```bash
# Conectar
mysql -u user -p dbname

# Ver tablas
SHOW TABLES;

# Ejecutar query
SELECT * FROM indicadores;
```

## 🔐 Variables de Entorno

### Backend (.env)
```bash
# Editar
nano backend/.env

# O con VS Code
code backend/.env
```

Variables importantes:
- `PORT`: Puerto del servidor (default: 3000)
- `NODE_ENV`: development | production
- `CORS_ORIGIN`: URL del frontend
- `DATABASE_URL`: String de conexión a BD

### Frontend (.env)
```bash
# Editar
nano frontend/.env

# O con VS Code
code frontend/.env
```

Variables importantes:
- `VITE_API_URL`: URL del backend (default: http://localhost:3000)

**⚠️ IMPORTANTE:** Las variables del frontend deben empezar con `VITE_`

## 📦 Gestión de Paquetes

### Agregar dependencia

**Frontend:**
```bash
cd frontend
npm install nombre-paquete
```

**Backend:**
```bash
cd backend
npm install nombre-paquete
```

**Dev dependency:**
```bash
npm install -D nombre-paquete
```

### Remover dependencia
```bash
npm uninstall nombre-paquete
```

## 🚀 Deploy

### Preparar para deploy
```bash
# 1. Build frontend
cd frontend && npm run build

# 2. Build backend
cd ../backend && npm run build

# 3. Build shared
cd ../packages/shared && npm run build
```

### Variables de entorno en producción

**Backend:**
```env
NODE_ENV=production
PORT=3000
CORS_ORIGIN=https://tu-dominio.com
DATABASE_URL=tu-string-de-conexion
```

**Frontend:**
```env
VITE_API_URL=https://api.tu-dominio.com
```

## 🔍 Troubleshooting Rápido

```bash
# Puerto ocupado
lsof -ti:3000 | xargs kill -9  # Mac/Linux
netstat -ano | findstr :3000   # Windows

# Permisos de scripts
chmod +x install.sh start.sh

# Node version
node --version  # Recomendado: >= 18

# npm version
npm --version

# TypeScript version
npx tsc --version
```

## 📝 Git

### Crear rama de feature
```bash
git checkout -b feature/nueva-funcionalidad
```

### Commit cambios
```bash
git add .
git commit -m "feat: descripción del cambio"
```

### Push
```bash
git push origin feature/nueva-funcionalidad
```

## 💡 Atajos de Desarrollo

### Alias útiles (agregar a ~/.bashrc o ~/.zshrc)
```bash
alias dev-backend="cd backend && npm run dev"
alias dev-frontend="cd frontend && npm run dev"
alias dev-all="bash start.sh"
alias build-all="cd frontend && npm run build && cd ../backend && npm run build"
```

## 📚 Aprender Más

- **Express:** https://expressjs.com/
- **React:** https://react.dev/
- **Vite:** https://vitejs.dev/
- **Tailwind CSS:** https://tailwindcss.com/
- **TypeScript:** https://www.typescriptlang.org/

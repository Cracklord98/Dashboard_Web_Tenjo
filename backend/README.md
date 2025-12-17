# Backend README

## Arquitectura

El backend está organizado en capas:

### 📂 Estructura de Carpetas

```
backend/src/
├── main.ts              # Entry point, configuración Express
├── routes/              # Definición de endpoints
├── services/            # Lógica de negocio
├── adapters/            # Conectores externos (Sheets, DB, APIs)
├── dto/                 # Definición de contratos de datos
├── config/              # Configuración (env, CORS, errores)
└── mappers/             # Transformación: datos raw → DTO
```

## 🔄 Flujo de Datos

```
Request → Route → Service → Adapter → External Data Source
                    ↓
                  Mapper
                    ↓
                   DTO → Response
```

## 🎯 Convenciones

### DTOs (Data Transfer Objects)
Los DTOs definen el contrato entre frontend y backend. Deben estar sincronizados con `packages/shared/src/types.ts`.

### Services
Contienen la lógica de negocio. No deben tener lógica de HTTP directamente.

### Adapters
Encapsulan la comunicación con fuentes externas (Google Sheets, SQL, APIs). Facilitan el testing con mocks.

### Mappers
Transforman datos crudos (arrays de Sheets, rows de DB) a DTOs consistentes.

## 🔌 Agregar Nueva Fuente de Datos

1. Crear adapter en `adapters/`
2. Crear mapper en `mappers/`
3. Usar en service
4. Exponer en route

## 🧪 Testing

```bash
# TODO: Agregar tests
npm test
```

## 🌐 Deployment

### Variables de Entorno (Producción)
Asegúrate de configurar:
- `NODE_ENV=production`
- `PORT` (default: 3000)
- `CORS_ORIGIN` (URL del frontend)
- Credenciales de BD/APIs

### Ejemplo con Docker

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

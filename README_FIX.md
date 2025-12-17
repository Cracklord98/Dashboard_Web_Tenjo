# Correcciones Realizadas

Se han realizado las siguientes correcciones para solucionar los problemas de comunicación entre el Frontend y el Backend:

## 1. Configuración del Proxy en Frontend (`frontend/vite.config.ts`)

Se ha configurado un proxy en Vite para redirigir las peticiones que comienzan con `/api` hacia el backend (`http://localhost:3000`). Esto soluciona los problemas de CORS (Cross-Origin Resource Sharing) durante el desarrollo.

```typescript
server: {
  port: 5173,
  strictPort: true,
  proxy: {
    '/api': {
      target: 'http://localhost:3000',
      changeOrigin: true,
      secure: false,
    },
  },
},
```

## 2. Configuración de Variables de Entorno (`frontend/.env`)

Se ha eliminado la URL hardcodeada `http://localhost:3000` de la variable `VITE_API_URL`. Al dejarla vacía, el frontend utilizará rutas relativas (ej: `/api/indicadores`), permitiendo que el proxy de Vite intercepte y redirija las peticiones correctamente.

```dotenv
# API URL del backend
# Dejar vacío para usar el proxy de Vite (evita problemas de CORS)
VITE_API_URL=
```

## 3. Logging en Backend (`backend/src/main.ts`)

Se ha añadido un middleware de logging simple en el backend para visualizar en la consola las peticiones entrantes. Esto facilita la depuración para confirmar que el backend está recibiendo las llamadas del frontend.

```typescript
// Logging de requests para debugging
app.use((req, _res, next) => {
  logger.info(`📨 ${req.method} ${req.url}`);
  next();
});
```

## 4. Solución a "Cannot GET /" y "Refused to connect"

### Backend: "Cannot GET /"

Este mensaje indicaba que el backend estaba funcionando pero no tenía una ruta definida para la página principal (`/`).
**Solución:** Se ha agregado una ruta raíz que devuelve un mensaje de bienvenida y el estado del servidor.

### Frontend: "Refused to connect"

Este error ocurre cuando el servidor de frontend no se ha iniciado correctamente o se ha cerrado inesperadamente.

**Solución para Windows:**
Se ha creado un archivo `start.bat` que es más robusto para usuarios de Windows. Este script abre dos ventanas de terminal separadas (una para el backend y otra para el frontend), lo que permite ver los errores si alguno falla y mantiene los procesos vivos.

### Pasos para reiniciar correctamente

1. **Detener todo:** Cierra todas las terminales de Node.js que tengas abiertas.
2. **Usar el nuevo script:** Haz doble clic en `start.bat` (o ejecútalo desde la terminal).
3. **Verificar:**
   * Se abrirán dos ventanas nuevas.
   * Espera a que ambas digan que están listas.
   * Abre `http://localhost:5173`.

## Cómo ejecutar el proyecto

Para verificar que todo funciona correctamente:

1. **Instalar dependencias (si no lo has hecho):**
   Ejecuta `./install.sh` en la raíz (o `npm install` en `backend` y `frontend` por separado).

2. **Iniciar el proyecto:**
   Ejecuta `./start.sh` en la raíz.

   O manualmente en dos terminales:
   * Terminal 1 (Backend): `cd backend && npm run dev`
   * Terminal 2 (Frontend): `cd frontend && npm run dev`

3. **Verificar:**
   Abre `http://localhost:5173` en tu navegador. Deberías ver el dashboard cargando datos (mock) sin errores de conexión en la consola.

# Configuración de Google Sheets API

Este backend está configurado para obtener datos reales desde Google Sheets, incluyendo las URLs de hipervínculos en las columnas de soportes.

## 🔧 Configuración Paso a Paso

### Opción 1: Usar Google Sheets API v4 (RECOMENDADO)

Esta opción permite extraer las URLs de los hipervínculos en las columnas "SOPORTES DE CUMPLIMIENTO 2024" y "SOPORTES DE CUMPLIMIENTO 2025".

#### 1. Crear Proyecto en Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Dale un nombre como "Dashboard Tenjo"

#### 2. Habilitar Google Sheets API

1. En el menú lateral, ve a **APIs y servicios > Biblioteca**
2. Busca "Google Sheets API"
3. Haz clic en **Habilitar**

#### 3. Crear API Key

1. Ve a **APIs y servicios > Credenciales**
2. Haz clic en **Crear credenciales > Clave de API**
3. Copia la API Key generada

#### 4. Configurar Restricciones de la API Key (Opcional pero recomendado)

1. Haz clic en la API Key creada para editarla
2. En **Restricciones de aplicación**, selecciona "Direcciones IP"
3. Agrega la IP de tu servidor (o 0.0.0.0/0 para desarrollo)
4. En **Restricciones de API**, selecciona "Restringir clave"
5. Marca solo **Google Sheets API**
6. Guarda los cambios

#### 5. Hacer la Hoja de Cálculo Pública

**Importante**: La hoja de cálculo debe ser pública para que la API Key pueda acceder.

1. Abre tu hoja de Google Sheets: https://docs.google.com/spreadsheets/d/131I6QiWvzj929LBQo_OgRs1qKC1g9RHuOMOPvcSnCyM/edit
2. Haz clic en **Compartir** (botón azul superior derecha)
3. En **Configuración general**, cambia a **Cualquier persona con el enlace**
4. Asegúrate que el rol sea **Lector** (solo lectura)
5. Copia el enlace

#### 6. Configurar Variables de Entorno

Crea un archivo `.env` en la carpeta `backend/` basado en `.env.example`:

```bash
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173

# Google Sheets API Configuration
GOOGLE_SHEETS_API_KEY=TU_API_KEY_AQUI
GOOGLE_SPREADSHEET_ID=131I6QiWvzj929LBQo_OgRs1qKC1g9RHuOMOPvcSnCyM
GOOGLE_SHEET_NAME=FICHA PRODUCTO 2024-2025
```

Reemplaza `TU_API_KEY_AQUI` con la API Key que copiaste en el paso 3.

### Opción 2: Usar CSV (Fallback - Sin URLs)

Si no quieres configurar la API, puedes usar el modo CSV (pero no obtendrás las URLs de los soportes):

```bash
# Comentar o eliminar GOOGLE_SHEETS_API_KEY
# GOOGLE_SHEETS_API_KEY=

# Configurar URLs CSV
GOOGLE_SHEET_FINANCIERO_URL=https://docs.google.com/spreadsheets/d/131I6QiWvzj929LBQo_OgRs1qKC1g9RHuOMOPvcSnCyM/export?format=csv&gid=815695373
GOOGLE_SHEET_METAS_PRODUCTO_URL=https://docs.google.com/spreadsheets/d/131I6QiWvzj929LBQo_OgRs1qKC1g9RHuOMOPvcSnCyM/export?format=csv&gid=815695373
```

## 📊 Estructura de la Hoja de Cálculo

El backend espera que la hoja tenga las siguientes columnas principales:

- **EJE DEL PROGRAMA**: Nivel jerárquico 1
- **PROGRAMA**: Nivel jerárquico 2
- **SUBPROGRAMA**: Nivel jerárquico 3
- **META RESULTADO**: Nivel jerárquico 4
- **POR PROYECTO**: Nivel jerárquico 5
- **META PRODUCTO**: Descripción de la meta
- **SOPORTES DE CUMPLIMIENTO 2024**: Columna con hipervínculos a documentos
- **SOPORTES DE CUMPLIMIENTO 2025**: Columna con hipervínculos a documentos
- **APROPIACION DEFINITIVA 2024**: Presupuesto 2024
- **APROPIACION DEFINITIVA 2025**: Presupuesto 2025
- **EJECUCION 2024**: Ejecución presupuestal 2024
- **EJECUCION 2025**: Ejecución presupuestal 2025
- **RESPONSABLE** o **COORDINADOR**: Persona responsable

## 🚀 Iniciar el Backend

```bash
cd backend
npm install
npm run dev
```

El servidor estará corriendo en http://localhost:3000

## 📡 Endpoints Disponibles

### Metas de Producto

- `GET /api/metas-producto` - Obtiene todas las metas
- `GET /api/metas-producto/:id` - Obtiene detalle de una meta específica
- `GET /api/metas-producto/eje/:eje` - Filtra metas por eje de programa
- `GET /api/metas-producto/programa/:programa` - Filtra metas por programa
- `POST /api/metas-producto/cache/clear` - Limpia la caché de datos

### Financiero

- `GET /api/financiero` - Obtiene datos de ejecución presupuestal
- `GET /api/financiero/:programa` - Filtra por programa específico

### Otros Endpoints

- `GET /health` - Verifica el estado del servidor

## 🔍 Ejemplo de Respuesta con URLs

Con la API configurada, las respuestas incluirán las URLs de los soportes:

```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "meta": "Implementar sistema de gestión documental",
      "ejePrograma": "Gestión Pública Efectiva",
      "programa": "Modernización Administrativa",
      "soportes2024": "https://drive.google.com/file/d/XXXXX/view",
      "soportes2025": "https://drive.google.com/file/d/YYYYY/view",
      ...
    }
  ]
}
```

## ⚡ Caché

El backend implementa un sistema de caché de 5 minutos para mejorar el rendimiento. Para forzar la actualización de datos:

```bash
curl -X POST http://localhost:3000/api/metas-producto/cache/clear
```

## 🐛 Troubleshooting

### Error: "API key not valid"

- Verifica que la API Key esté correctamente copiada en `.env`
- Asegúrate que Google Sheets API esté habilitada en tu proyecto
- Verifica que las restricciones de la API Key permitan el acceso

### Error: "Permission denied"

- Verifica que la hoja de cálculo esté configurada como pública
- O compártela con el Service Account si estás usando autenticación OAuth

### No se obtienen las URLs de los soportes

- Verifica que `GOOGLE_SHEETS_API_KEY` esté configurada
- El modo CSV no puede extraer URLs de hipervínculos
- Usa la API v4 para obtener las URLs

### Datos desactualizados

- Limpia la caché usando el endpoint `/cache/clear`
- El caché se renueva automáticamente cada 5 minutos

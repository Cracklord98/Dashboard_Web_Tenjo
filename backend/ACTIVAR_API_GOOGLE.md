# 🔑 Activar Google Sheets API (URGENTE)

## ⚠️ Problema Detectado

El CSV público no es accesible directamente. Necesitas activar la Google Sheets API para obtener los datos.

## 📋 Pasos Rápidos (5 minutos)

### 1️⃣ Ir a Google Cloud Console
```
https://console.cloud.google.com/
```

### 2️⃣ Crear o Seleccionar Proyecto
- Click en el dropdown de proyecto (arriba a la izquierda)
- "Nuevo Proyecto" → Nombre: "Dashboard Tenjo"
- Click "Crear"

### 3️⃣ Habilitar Google Sheets API
```
https://console.cloud.google.com/apis/library/sheets.googleapis.com
```
- Click "HABILITAR"

### 4️⃣ Crear API Key
```
https://console.cloud.google.com/apis/credentials
```
- Click "+ CREAR CREDENCIALES"
- Seleccionar "Clave de API"
- Copiar la API Key generada

### 5️⃣ Configurar .env

Editar `backend/.env`:

```env
# ===== GOOGLE SHEETS API (ACTIVO) =====
GOOGLE_SHEETS_API_KEY=TU_API_KEY_AQUI
GOOGLE_SPREADSHEET_ID=131I6QiWvzj929LBQo_OgRs1qKC1g9RHuOMOPvcSnCyM
GOOGLE_SHEET_NAME=FICHA PRODUCTO 2024-2025
```

### 6️⃣ Hacer Público el Sheet (Importante)

1. Abrir tu Google Sheet
2. Click "Compartir" (arriba derecha)
3. Click "Cambiar" en "Acceso general"
4. Seleccionar "Cualquier persona con el enlace"
5. Rol: "Lector"
6. Click "Listo"

### 7️⃣ Reiniciar Backend

```bash
cd backend
npm run dev
```

✅ Deberías ver: `✅ Google Sheets API v4 inicializada`

## 🎯 Resultado

Una vez configurado:
- ✅ Backend obtendrá datos reales del Google Sheets
- ✅ URLs de "SOPORTES DE CUMPLIMIENTO 2024/2025" estarán disponibles
- ✅ Jerarquía de 5 niveles funcionará correctamente
- ✅ Todos los endpoints tendrán datos reales

## 🔍 Verificar que Funciona

```bash
curl http://localhost:3000/api/metas-producto
```

Deberías ver datos reales en lugar de array vacío `[]`.

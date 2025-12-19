# Guía de Despliegue - Tenjo Dashboard

Este proyecto está estructurado como un monorepo. A continuación, las instrucciones para desplegar el Backend en **Render** y el Frontend en **Vercel**.

## 1. Backend (Render)

1. Crea un nuevo **Web Service** en Render.
2. Conecta tu repositorio de GitHub.
3. Configura los siguientes campos:
   - **Name**: `tenjo-backend`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
4. En la sección **Environment Variables**, añade:
   - `NODE_ENV`: `production`
   - `CORS_ORIGIN`: URL de tu frontend en Vercel (ej: `https://tenjo-dashboard.vercel.app`)
   - `GOOGLE_SHEET_CSV_URL`: URL del CSV de metas.
   - `GOOGLE_SHEET_FINANCIERO_URL`: URL del CSV financiero.
   - `GOOGLE_SHEET_SECRETARIAS_URL`: URL del CSV de secretarías.

## 2. Frontend (Vercel)

1. Crea un nuevo proyecto en Vercel.
2. Conecta tu repositorio de GitHub.
3. Configura los siguientes campos:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
4. En **Build & Development Settings**:
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. En **Environment Variables**, añade:
   - `VITE_API_URL`: URL de tu backend en Render (ej: `https://tenjo-backend.onrender.com`)

## Notas Importantes

- **CORS**: Asegúrate de que la variable `CORS_ORIGIN` en Render coincida exactamente con la URL que te asigne Vercel.
- **URLs de Google Sheets**: Verifica que las hojas de cálculo sigan publicadas como CSV en la web.

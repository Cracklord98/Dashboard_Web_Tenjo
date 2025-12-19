# 📊 Tenjo Dashboard - Plan de Desarrollo Municipal

> **Plataforma de Inteligencia de Datos para el Seguimiento del Plan Indicativo de Tenjo, Cundinamarca.**

[![Vercel Deployment](https://img.shields.io/badge/Frontend-Vercel-black?style=for-the-badge&logo=vercel)](https://dashboard-web-tenjo-frontend.vercel.app/)
[![Render Deployment](https://img.shields.io/badge/Backend-Render-46E3B7?style=for-the-badge&logo=render)](https://dashboard-web-tenjo.onrender.com/health)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Tailwind](https://img.shields.io/badge/Tailwind-v4-06B6D4?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)

---

## 📖 Descripción General

El **Tenjo Dashboard** es una herramienta de visualización de datos diseñada para transformar la información compleja del Plan de Desarrollo Municipal en tableros interactivos y fáciles de entender. Facilita la toma de decisiones basada en datos y promueve la transparencia en la ejecución de metas físicas y presupuestales.

### 🎯 Objetivos del Proyecto
- **Centralizar** la información de múltiples secretarías en un solo lugar.
- **Visualizar** el progreso real vs. las metas programadas.
- **Simplificar** la actualización de datos mediante la integración directa con Google Sheets.
- **Optimizar** el tiempo de reporte para los funcionarios municipales.

---

## ✨ Características Destacadas

### 🏠 Resumen Ejecutivo (Home)
Visualización de alto nivel de los 6 pilares estratégicos del PDM:
- **Ejes Estratégicos**: Distribución y enfoque del plan.
- **Programas y Proyectos**: Conteo y estado de las iniciativas.
- **Metas de Resultado**: KPIs críticos de impacto municipal.

### 🏢 Dashboard por Secretarías
Vista especializada para cada dependencia:
- Gráficos de cumplimiento por secretaría.
- Desglose de metas de producto asignadas.
- Identificación de cuellos de botella en la ejecución.

### 📈 Seguimiento Detallado
- **Ejecución Física**: Porcentaje de avance en las actividades programadas.
- **Ejecución Presupuestal**: Monitoreo del gasto vs. presupuesto asignado.
- **Fichas de Producto**: Detalle técnico de cada indicador.

---

## 🛠️ Arquitectura y Tecnologías

### **Frontend (El Cerebro Visual)**
- **React 19**: Última versión para un rendimiento óptimo.
- **Vite**: Herramienta de construcción ultra rápida.
- **Recharts**: Gráficos dinámicos y responsivos.
- **Tailwind CSS v4**: Estilizado moderno y eficiente.
- **Context API**: Gestión de estado global (Temas, Sidebar).

### **Backend (El Motor de Datos)**
- **Node.js & Express**: API REST robusta y escalable.
- **TypeScript**: Tipado estricto para minimizar errores en producción.
- **PapaParse**: Motor de procesamiento de datos CSV de alto rendimiento.
- **Seguridad**: Implementación de Helmet, CORS dinámico y Rate Limiting.

### **Fuente de Datos**
- **Google Sheets**: Utilizado como un CMS ágil, permitiendo que personal no técnico actualice los datos sin tocar el código.

---

## 📂 Estructura del Repositorio

```text
Dashboard_Web_Tenjo/
├── 🌐 frontend/          # Aplicación de cliente (React)
│   ├── src/components/   # Componentes reutilizables (Charts, UI)
│   ├── src/pages/        # Vistas principales del Dashboard
│   └── src/lib/          # Clientes de API y constantes
├── ⚙️ backend/           # Servidor de API (Express)
│   ├── src/routes/       # Definición de Endpoints REST
│   ├── src/services/     # Lógica de procesamiento de datos
│   └── src/mappers/      # Transformación de datos de Sheets a JSON
├── 📦 packages/shared/   # Tipos de TypeScript compartidos
└── 🚀 deployment/        # Archivos de configuración (Vercel/Render)
```

---

## 🚀 Guía de Inicio Rápido

### 1. Clonar y Preparar
```bash
git clone https://github.com/Cracklord98/Dashboard_Web_Tenjo.git
cd Dashboard_Web_Tenjo
```

### 2. Levantar el Backend
```bash
cd backend
npm install
# Configura tu .env con la URL de Google Sheets
npm run dev
```

### 3. Levantar el Frontend
```bash
cd ../frontend
npm install
# Asegúrate de que VITE_API_URL apunte a http://localhost:3000
npm run dev
```

---

## 🌐 Despliegue en Producción

### **Backend (Render)**
1. Conecta el repo a Render como **Web Service**.
2. **Build Command**: `npm install && npm run build`
3. **Start Command**: `npm start`
4. **Variables**: `CORS_ORIGIN`, `GOOGLE_SHEET_CSV_URL`.

### **Frontend (Vercel)**
1. Conecta el repo a Vercel.
2. **Root Directory**: `frontend`.
3. **Variable**: `VITE_API_URL` (URL de Render).

---

## 🤝 Contribución

1. Haz un **Fork** del proyecto.
2. Crea una nueva rama (`git checkout -b feature/NuevaMejora`).
3. Realiza tus cambios y haz **Commit** (`git commit -m 'Añadir nueva funcionalidad'`).
4. Haz **Push** a la rama (`git push origin feature/NuevaMejora`).
5. Abre un **Pull Request**.

---

## 📄 Licencia

Este proyecto es propiedad de la **Alcaldía Municipal de Tenjo** y se distribuye bajo la licencia MIT.

---

## 📞 Soporte y Contacto

Para dudas técnicas o reportes de errores, por favor abre un **Issue** en este repositorio o contacta al equipo de planeación municipal.

---
*Desarrollado con ❤️ para el municipio de Tenjo.*

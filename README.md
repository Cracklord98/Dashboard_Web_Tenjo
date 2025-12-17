# Dashboard Tenjo

Este proyecto es un panel de administración y visualización de datos para la gestión de proyectos en Tenjo.

## Estructura del Proyecto

El proyecto está dividido en dos partes principales: Frontend y Backend.

### Estructura reorganizada

Estructura actual del repositorio:

```text
Dashboar_Web_Tenjo/
├─ backend/
│  ├─ src/
│  │  ├─ adapters/
│  │  ├─ config/
│  │  ├─ dto/
│  │  ├─ mappers/
│  │  ├─ routes/
│  │  ├─ services/
│  │  └─ main.ts
│  ├─ package.json
│  └─ tsconfig.json
├─ frontend/
│  ├─ public/
│  ├─ src/
│  │  ├─ components/
│  │  ├─ context/
│  │  ├─ hooks/
│  │  ├─ icons/
│  │  ├─ layout/
│  │  ├─ lib/
│  │  ├─ pages/
│  │  ├─ App.tsx
│  │  └─ main.tsx
│  ├─ package.json
│  └─ vite.config.ts
├─ packages/
│  └─ shared/
│     ├─ src/
│     │  ├─ index.ts
│     │  ├─ types.ts
│     │  └─ utils.ts
│     └─ package.json
├─ README.md
├─ ARCHITECTURE.md
├─ CHANGELOG.md
└─ COMMANDS.md
```

### 🏗️ Arquitectura

#### Frontend (Cliente)
- **Tecnologías**: React, Vite, TypeScript, Tailwind CSS.
- **Visualización de Datos**: Se implementarán gráficas avanzadas utilizando **Recharts** o **Chart.js**.
- **Secciones Planificadas**:
  - **Avance**: Visualización del progreso de los proyectos.
  - **Metas**: Seguimiento de objetivos y KPIs.
  - **Finanzas**: Reportes y gráficas financieras.
  - **Responsables**: Gestión y visualización de asignaciones de equipo.

#### Backend (Servidor)
- **Tecnologías**: Node.js, Express, TypeScript.
- **Fuente de Datos**: **Google Sheets** (Modo público).
  - El backend actuará como una capa de servicio que consume datos directamente de hojas de cálculo de Google Sheets publicadas como CSV.
  - Se eliminará la dependencia de bases de datos locales complejas en favor de la agilidad de Google Sheets para este caso de uso.

## 🚀 Próximos Pasos

1.  **Configuración del Backend**:
    - Implementar `GoogleSheetsService` para consumir datos CSV.
    - Configurar endpoints para cada sección (Avance, Metas, etc.).
2.  **Desarrollo del Frontend**:
    - Crear las páginas correspondientes a la nueva estructura.
    - Integrar librerías de gráficos para visualizar la data del backend.

## Ejecución

Para iniciar el proyecto (ambos servicios):

```bash
./start.sh
```

# Frontend README

## Estructura

```
frontend/src/
├── App.tsx              # Router + Layout base
├── main.tsx             # Entry point
├── pages/               # Páginas del dashboard
├── components/          # Componentes reutilizables
├── context/             # Context providers (tema, sidebar)
├── hooks/               # Custom hooks
└── lib/                 # Utilidades del frontend
```

## 🎨 Tailwind CSS v4

Este proyecto usa Tailwind CSS v4. Los colores de marca "Tenjo" se pueden configurar en `index.css`:

```css
@theme {
  --color-tenjo-primary: #your-color;
  --color-tenjo-secondary: #your-color;
}
```

## 🔌 Conectar con Backend

La URL del backend se configura en `.env`:

```env
VITE_API_URL=http://localhost:3000
```

### Ejemplo de llamada a la API

```typescript
// lib/api.ts
const API_URL = import.meta.env.VITE_API_URL;

export async function obtenerIndicadores() {
  const response = await fetch(`${API_URL}/api/indicadores`);
  if (!response.ok) throw new Error('Error al obtener indicadores');
  return response.json();
}
```

## 📦 Componentes Sugeridos

### KpiCard
Tarjeta para mostrar un indicador individual (valor, tendencia, cambio).

### TrendChart
Gráfico de tendencia usando ApexCharts o Recharts.

### DataTable
Tabla con datos de seguimiento.

## 🚀 Scripts

```bash
npm run dev      # Desarrollo (HMR)
npm run build    # Build para producción
npm run preview  # Preview del build
npm run lint     # ESLint
```

## 🎯 Próximos Pasos

1. Crear páginas: Dashboard, Indicadores, Seguimiento
2. Conectar componentes con API real
3. Implementar manejo de estados (Context o Zustand)
4. Agregar loading states y error handling

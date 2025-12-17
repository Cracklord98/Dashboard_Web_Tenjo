# Shared Package

Tipos y utilidades compartidas entre frontend y backend.

## 📦 Contenido

### `types.ts`
DTOs (Data Transfer Objects) que definen los contratos entre frontend y backend:
- `IndicadorDTO`
- `SerieDTO`
- `SeguimientoDTO`
- `ApiResponse`
- `PaginacionDTO`

### `utils.ts`
Funciones utilitarias usadas en ambos lados:
- `formatearFecha()`
- `formatearMoneda()`
- `formatearNumero()`
- `calcularCambio()`

## 🔧 Uso

### En el Backend
```typescript
import { IndicadorDTO, ApiResponse } from '../../../packages/shared/src/index.js';

const response: ApiResponse<IndicadorDTO[]> = {
  status: 'success',
  data: indicadores
};
```

### En el Frontend
```typescript
import { IndicadorDTO, formatearMoneda } from '../../../packages/shared/src/index';

function KpiCard({ indicador }: { indicador: IndicadorDTO }) {
  return <div>{formatearMoneda(indicador.valor)}</div>;
}
```

## 🏗️ Build

```bash
npm run build   # Compila TypeScript → JavaScript
npm run watch   # Compila en modo watch
```

## ✅ Ventajas

- **Type Safety**: Frontend y backend comparten los mismos tipos
- **DRY**: Evita duplicar interfaces y utilidades
- **Consistencia**: Garantiza que ambos lados hablan el mismo "idioma"

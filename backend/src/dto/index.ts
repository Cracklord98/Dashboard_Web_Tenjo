/**
 * DTO para Indicador (KPI)
 */
export interface IndicadorDTO {
  id: string;
  nombre: string;
  valor: number;
  unidad: string;
  tipo: string;
  tendencia: 'up' | 'down' | 'neutral';
  cambio: number;
  fecha?: string;
}

/**
 * DTO para Serie de datos (gráficos)
 */
export interface SerieDTO {
  fecha: string;
  valor: number;
  categoria?: string;
}

/**
 * DTO para Seguimiento de proyecto
 */
export interface SeguimientoDTO {
  id: string;
  nombre: string;
  estado: 'pendiente' | 'en_progreso' | 'completado' | 'cancelado';
  progreso: number;
  fechaInicio: string;
  fechaFin: string;
  responsable?: string;
  descripcion?: string;
}

/**
 * Tipos compartidos entre Frontend y Backend
 * Estos DTOs garantizan que ambos lados del stack hablan el mismo "idioma"
 */

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

/**
 * Response estándar de la API
 */
export interface ApiResponse<T = any> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
  errors?: string[];
}

/**
 * Opciones de paginación
 */
export interface PaginacionDTO {
  pagina: number;
  limite: number;
  total: number;
}

/**
 * Response paginada
 */
export interface ResponsePaginada<T> extends ApiResponse<T> {
  paginacion?: PaginacionDTO;
}

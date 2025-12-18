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

/**
 * DTOs para Ejecución Presupuestal
 * Jerarquía: Eje > Programa > Subprograma > MetaResultado > Proyecto
 */

/**
 * Eje del Programa (Columna A)
 */
export interface EjeDTO {
  nombre: string;
  codigo?: string;
  programas?: ProgramaDTO[];
}

/**
 * Programa (Columna G)
 */
export interface ProgramaDTO {
  nombre: string;
  codigo?: string;
  eje?: string;
  subprogramas?: SubprogramaDTO[];
}

/**
 * Subprograma (Columna K)
 */
export interface SubprogramaDTO {
  nombre: string;
  codigo?: string;
  programa?: string;
  metasResultado?: MetaResultadoDTO[];
}

/**
 * Meta Resultado (Columna N)
 */
export interface MetaResultadoDTO {
  nombre: string;
  codigo?: string;
  subprograma?: string;
  proyectos?: ProyectoDTO[];
}

/**
 * Datos Financieros por año
 */
export interface DatosFinancierosAnuales {
  apropiacionInicial?: number;
  apropiacionDefinitiva?: number;
  compromisos?: number;
  pagos?: number;
  porcentajeEjecucion?: number;
}

/**
 * Proyecto (Columna S)
 */
export interface ProyectoDTO {
  nombre: string;
  codigo?: string;
  
  // Jerarquía completa para referencia
  eje?: string;
  programa?: string;
  subprograma?: string;
  metaResultado?: string;
  
  // Datos 2024 (Columnas DE-DK)
  apropiacionDefinitiva2024?: number;
  apropiacion2024?: number; // Alias para compatibilidad
  compromisos2024?: number;
  
  // Datos 2025 (Columnas DL-DP)
  apropiacionInicial2025?: number;
  apropiacionDefinitiva2025?: number;
  compromisos2025?: number;
  pagos2025?: number;
  porcentajeEjecucion2025?: number;
  
  // Totales
  totalAsignado?: number;
  totalCompromisos?: number;
  porcentajeEjecucionFinanciera?: number;
  
  estado?: 'activo' | 'en_progreso' | 'completado' | 'pausado';
}

/**
 * Datos completos de Ejecución Presupuestal
 */
export interface EjecucionPresupuestalDTO {
  ejes: EjeDTO[];
  resumen: {
    totalPresupuesto: number;
    totalEjecutado: number;
    porcentajeEjecucion: number;
    cantidadProyectos: number;
    cantidadProgramas: number;
  };
  fecha: string;
}

/**
 * Fila raw del Google Sheet de Financiero
 */
export interface FilaFinancieroRaw {
  [key: string]: string | number;
}

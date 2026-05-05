/**
 * Tipos de datos para Metas de Producto del PDM
 */

export interface MetaProducto {
  [key: string]: string | number | undefined; // Permitir acceso dinámico para campos de años/trimestres
  id: number;
  meta: string;
  ejePrograma: string;
  programa: string;
  subprograma: string;
  metaResultado: string;
  proyecto: string;
  estadoEvaluacion: string;
  estado: string;
  responsable: string;
  avance2024: number;
  avance2025: number;
  avance2026?: number;
  // Estados programado/no programado
  estadoProgramado2024?: string;
  estadoProgramado2025?: string;
  estadoProgramado2026?: string;
  // Porcentajes de avance
  porcentajeAvance2024?: number | string;
  porcentajeAvance2025?: number | string;
  porcentajeAvance2026?: number | string;
  porcentajeAvanceCuatrienio?: number | string;
  soportes2024?: string;
  soportes2025?: string;
  soportes2026?: string;
  
  // Campos financieros 2024
  apropiacion2024?: number | string;
  compromisos2024?: number | string;
  pagos2024?: number | string;
  totalAsignado?: number | string;
  totalCompromisos?: number | string;
  ejecucionFinanciera2024?: number | string;
  
  // Campos financieros 2025
  apropiacionInicial2025?: number | string;
  apropiacionDefinitiva2025?: number | string;
  compromisos2025?: number | string;
  pagos2025?: number | string;
  ejecucion2025?: number | string;
  
  // Campos financieros 2026
  apropiacionInicial2026?: number | string;
  apropiacionDefinitiva2026?: number | string;
  compromisos2026?: number | string;
  pagos2026?: number | string;
  ejecucion2026?: number | string;
  
  // Campos de planificación y ejecución física
  totalPlaneado2024?: number | string;
  totalEjecutado2024?: number | string;
  totalPlaneado2025?: number | string;
  totalEjecutado2025?: number | string;
  totalPlaneado2026?: number | string;
  totalEjecutado2026?: number | string;
  
  // Trimestres 2024
  t1Planeado2024?: number | string;
  t1Ejecutado2024?: number | string;
  t2Planeado2024?: number | string;
  t2Ejecutado2024?: number | string;
  t3Planeado2024?: number | string;
  t3Ejecutado2024?: number | string;
  t4Planeado2024?: number | string;
  t4Ejecutado2024?: number | string;
  
  // Trimestres 2025
  t1Planeado2025?: number | string;
  t1Ejecutado2025?: number | string;
  t2Planeado2025?: number | string;
  t2Ejecutado2025?: number | string;
  t3Planeado2025?: number | string;
  t3Ejecutado2025?: number | string;
  t4Planeado2025?: number | string;
  t4Ejecutado2025?: number | string;
  
  // Trimestres 2026
  t1Planeado2026?: number | string;
  t1Ejecutado2026?: number | string;
  t2Planeado2026?: number | string;
  t2Ejecutado2026?: number | string;
  t3Planeado2026?: number | string;
  t3Ejecutado2026?: number | string;
  t4Planeado2026?: number | string;
  t4Ejecutado2026?: number | string;
  
  // Indicadores
  lineaBase?: string;
  indicador?: string;
  unidadMedida?: string;
  
  // Campos adicionales
  codigoMeta?: string;
  bpin?: string;
  urlSoporte?: string;
  observaciones?: string;
}

export interface MetasProductoResponse {
  status: 'success' | 'error';
  data: MetaProducto[];
  timestamp?: string;
  count?: number;
}

export interface FiltrosMetaProducto {
  busqueda?: string;
  programas?: string[];
  evaluaciones?: string[];
  estados?: string[];
  responsables?: string[];
  año?: number;
  trimestre?: number;
}

/**
 * Cliente HTTP para consumir la API del backend
 */

import { APP_CONFIG } from './constants';

const API_URL = APP_CONFIG.apiUrl;

interface ApiResponse<T = unknown> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
}

class ApiError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    const data: ApiResponse<T> = await response.json();

    if (!response.ok || data.status === 'error') {
      throw new ApiError(
        response.status,
        data.message || 'Error en la petición'
      );
    }

    return data.data as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, 'Error de conexión con el servidor');
  }
}

// ===== INDICADORES =====

export interface Indicador {
  id: string;
  nombre: string;
  valor: number;
  unidad: string;
  tipo: string;
  tendencia: 'up' | 'down' | 'neutral';
  cambio: number;
  fecha?: string;
}

export async function obtenerIndicadores(): Promise<{ indicadores: Indicador[] }> {
  return request('/api/indicadores');
}

export async function obtenerIndicadoresPorTipo(tipo: string): Promise<{ indicadores: Indicador[] }> {
  return request(`/api/indicadores/${tipo}`);
}

// ===== SEGUIMIENTO =====

export interface Seguimiento {
  id: string;
  nombre: string;
  estado: 'pendiente' | 'en_progreso' | 'completado' | 'cancelado';
  progreso: number;
  fechaInicio: string;
  fechaFin: string;
  responsable?: string;
  descripcion?: string;
}

export async function obtenerSeguimiento(): Promise<{ items: Seguimiento[] }> {
  return request('/api/seguimiento');
}

export async function obtenerSeguimientoPorId(id: string): Promise<Seguimiento> {
  return request(`/api/seguimiento/${id}`);
}

// ===== METAS DE PRODUCTO =====

import type { 
  MetaProducto, 
  FiltrosMetaProducto
} from '../types/metaProducto';

export async function obtenerMetasProducto(filtros?: FiltrosMetaProducto): Promise<MetaProducto[]> {
  const params = new URLSearchParams();
  
  if (filtros) {
    if (filtros.busqueda) params.append('busqueda', filtros.busqueda);
    if (filtros.programas?.length) params.append('programas', filtros.programas.join(','));
    if (filtros.evaluaciones?.length) params.append('evaluaciones', filtros.evaluaciones.join(','));
    if (filtros.estados?.length) params.append('estados', filtros.estados.join(','));
    if (filtros.responsables?.length) params.append('responsables', filtros.responsables.join(','));
    if (filtros.año) params.append('año', filtros.año.toString());
    if (filtros.trimestre) params.append('trimestre', filtros.trimestre.toString());
  }

  const queryString = params.toString();
  const endpoint = queryString ? `/api/metas-producto?${queryString}` : '/api/metas-producto';
  
  return request(endpoint);
}

export async function obtenerMetaPorId(id: string): Promise<MetaProducto> {
  return request(`/api/metas-producto/${id}`);
}

// ===== DATOS FINANCIEROS =====

export interface DatosFinancieros {
  programa: string;
  presupuestado: number;
  ejecutado: number;
  porcentaje: number;
}

export interface DatosFinancierosResponse {
  status: 'success' | 'error';
  data: DatosFinancieros[];
  timestamp?: string;
  count?: number;
}

export async function obtenerDatosFinancieros(): Promise<DatosFinancierosResponse> {
  return request('/api/financiero');
}

export async function obtenerDatosFinancierosPorPrograma(programa: string): Promise<{ data: DatosFinancieros }> {
  return request(`/api/financiero/${programa}`);
}

// ===== HEALTH CHECK =====

export async function checkHealth(): Promise<{ status: string; timestamp: string }> {
  return request('/health');
}

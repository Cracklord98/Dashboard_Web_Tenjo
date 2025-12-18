/**
 * Constantes de la aplicación
 */

export const APP_CONFIG = {
  name: 'Tenjo Dashboard',
  version: '1.0.0',
  // Si VITE_API_URL está vacío, usa '' para aprovechar el proxy de Vite
  // Si está definido, usa ese valor (útil para producción)
  apiUrl: import.meta.env.VITE_API_URL?.trim() || '',
} as const;

export const ROUTES = {
  dashboard: '/',
  seguimiento: '/seguimiento',
  indicadores: '/indicadores',
} as const;

export const API_ENDPOINTS = {
  health: '/health',
  indicadores: '/api/indicadores',
  seguimiento: '/api/seguimiento',
} as const;

export const ESTADO_COLORS = {
  pendiente: 'text-yellow-600 bg-yellow-100',
  en_progreso: 'text-blue-600 bg-blue-100',
  completado: 'text-green-600 bg-green-100',
  cancelado: 'text-red-600 bg-red-100',
} as const;

export const TENDENCIA_CONFIG = {
  up: { icon: '↑', color: 'text-green-600' },
  down: { icon: '↓', color: 'text-red-600' },
  neutral: { icon: '→', color: 'text-gray-600' },
} as const;

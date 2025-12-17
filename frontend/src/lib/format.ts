/**
 * Utilidades para formatear datos en el frontend
 */

/**
 * Formatea una fecha
 */
export function formatearFecha(fecha: string | Date): string {
  const date = typeof fecha === 'string' ? new Date(fecha) : fecha;
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Formatea un número como moneda
 */
export function formatearMoneda(valor: number, moneda = 'USD'): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: moneda
  }).format(valor);
}

/**
 * Formatea un número con separadores de miles
 */
export function formatearNumero(valor: number, decimales = 0): string {
  return new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales
  }).format(valor);
}

/**
 * Formatea porcentaje
 */
export function formatearPorcentaje(valor: number): string {
  return `${valor > 0 ? '+' : ''}${valor.toFixed(1)}%`;
}

import { ESTADO_COLORS, TENDENCIA_CONFIG } from './constants';

/**
 * Clasifica el estado con colores de Tailwind
 */
export function getEstadoColor(estado: string): string {
  return ESTADO_COLORS[estado as keyof typeof ESTADO_COLORS] || 'text-gray-600 bg-gray-100';
}

/**
 * Obtiene el ícono de tendencia
 */
export function getTendenciaIcon(tendencia: 'up' | 'down' | 'neutral'): string {
  return TENDENCIA_CONFIG[tendencia].icon;
}

/**
 * Obtiene color de la tendencia
 */
export function getTendenciaColor(tendencia: 'up' | 'down' | 'neutral'): string {
  return TENDENCIA_CONFIG[tendencia].color;
}

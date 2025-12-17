/**
 * Utilidades compartidas entre frontend y backend
 */

/**
 * Formatea una fecha a formato local
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
 * Calcula el porcentaje de cambio entre dos valores
 */
export function calcularCambio(valorActual: number, valorAnterior: number): number {
  if (valorAnterior === 0) return 0;
  return ((valorActual - valorAnterior) / valorAnterior) * 100;
}

/**
 * Utilidades para formateo de datos financieros y numéricos
 */

export const formatCurrency = (value: number | string): string => {
  const numValue = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.-]/g, '')) : value;
  
  if (isNaN(numValue) || numValue === null || numValue === undefined) return '$0';
  
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numValue);
};

export const formatNumber = (value: number | string, decimals: number = 0): string => {
  const numValue = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.-]/g, '')) : value;
  
  if (isNaN(numValue) || numValue === null || numValue === undefined) return '0';
  
  return new Intl.NumberFormat('es-CO', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(numValue);
};

export const formatPercent = (value: number, decimals: number = 1): string => {
  if (isNaN(value) || !isFinite(value) || value === null || value === undefined) return '0%';
  return `${value.toFixed(decimals)}%`;
};

export const formatCompactNumber = (value: number): string => {
  if (value === null || value === undefined || isNaN(value)) return '$0';
  
  // Mostrar el número completo formateado como moneda
  return formatCurrency(value);
};

export const parseNumber = (value: unknown): number => {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number') return isNaN(value) ? 0 : value;
  
  let cleaned = value.toString().trim();
  
  // Remover símbolos de moneda y espacios
  cleaned = cleaned.replace(/[$\s%]/g, '');
  
  if (cleaned === '-' || cleaned === '') return 0;

  // Heurística para detectar formato de miles y decimales
  const lastDot = cleaned.lastIndexOf('.');
  const lastComma = cleaned.lastIndexOf(',');
  
  if (lastDot > -1 && lastComma > -1) {
    if (lastDot < lastComma) {
      // Formato europeo/colombiano: 1.000,00 -> Remover puntos, reemplazar coma por punto
      cleaned = cleaned.replace(/\./g, '').replace(',', '.');
    } else {
      // Formato americano: 1,000.00 -> Remover comas
      cleaned = cleaned.replace(/,/g, '');
    }
  } else if (lastDot > -1) {
    // Solo puntos.
    const parts = cleaned.split('.');
    if (parts.length > 2) {
       // Más de un punto (ej: 1.000.000) -> Son separadores de miles
       cleaned = cleaned.replace(/\./g, '');
    } else {
       // Un solo punto. Puede ser decimal (1.00) o miles (1.000)
       // En Colombia se usa punto para miles, pero el dataset mezcla formatos.
       // Heurística:
       // 1. Si empieza por 0 (ej: 0.60), es decimal.
       // 2. Si tiene exactamente 3 decimales (ej: 1.234), asumimos miles.
       // 3. En otros casos (ej: 1.00, 1.5, 23.50), asumimos decimal.
       const decimals = parts[1].length;
       if (!cleaned.startsWith('0.') && decimals === 3) {
           cleaned = cleaned.replace(/\./g, '');
       }
       // Si no entra en el if, dejamos el punto (se interpreta como decimal)
    }
  } else if (lastComma > -1) {
    // Solo comas. Asumimos decimal si es única, miles si son varias
    if ((cleaned.match(/,/g) || []).length > 1) {
        cleaned = cleaned.replace(/,/g, '');
    } else {
        cleaned = cleaned.replace(',', '.');
    }
  }
  
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
};

export const calculatePercentage = (part: number, total: number): number => {
  if (total === 0 || !total) return 0;
  const result = (part / total) * 100;
  return Math.min(Math.max(result, 0), 100);
};

export const getColorForPercentage = (percentage: number): { text: string; bg: string; gradient: string; hex: string } => {
  if (percentage >= 90) {
    return {
      text: 'text-green-600 dark:text-green-400',
      bg: 'bg-green-100 dark:bg-green-900',
      gradient: 'from-green-500 to-green-600 dark:from-green-600 dark:to-green-700',
      hex: '#10b981'
    };
  }
  if (percentage >= 70) {
    return {
      text: 'text-yellow-600 dark:text-yellow-400',
      bg: 'bg-yellow-100 dark:bg-yellow-900',
      gradient: 'from-yellow-500 to-yellow-600 dark:from-yellow-600 dark:to-yellow-700',
      hex: '#f59e0b'
    };
  }
  if (percentage >= 50) {
    return {
      text: 'text-orange-600 dark:text-orange-400',
      bg: 'bg-orange-100 dark:bg-orange-900',
      gradient: 'from-orange-500 to-orange-600 dark:from-orange-600 dark:to-orange-700',
      hex: '#f97316'
    };
  }
  return {
    text: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-100 dark:bg-red-900',
    gradient: 'from-red-500 to-red-600 dark:from-red-600 dark:to-red-700',
    hex: '#ef4444'
  };
};

export const getBgColorForPercentage = (percentage: number): string => {
  if (percentage >= 90) return 'bg-green-100 dark:bg-green-900';
  if (percentage >= 70) return 'bg-yellow-100 dark:bg-yellow-900';
  if (percentage >= 50) return 'bg-orange-100 dark:bg-orange-900';
  return 'bg-red-100 dark:bg-red-900';
};

export const formatDate = (date: string | Date): string => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

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
  
  if (value >= 1000000000) {
    return `$${(value / 1000000000).toFixed(1)}B`;
  }
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(1)}K`;
  }
  return formatCurrency(value);
};

export const parseNumber = (value: unknown): number => {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number') return isNaN(value) ? 0 : value;
  
  const cleaned = value.toString()
    .replace(/\s/g, '')
    .replace(/\$/g, '')
    .replace(/,/g, '');
  
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

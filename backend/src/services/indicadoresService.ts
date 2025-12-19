import { GoogleSheetsAdapter } from '../adapters/googleSheetsAdapter.js';
import { config } from '../config/env.js';
import { logger } from '../config/logger.js';

interface Indicador {
  id: string;
  nombre: string;
  valor: number;
  unidad: string;
  tipo: string;
  tendencia: 'up' | 'down' | 'stable';
  cambio: number;
  descripcion?: string;
}

/**
 * Servicio para manejar la lógica de negocio de indicadores (KPIs)
 * Obtiene datos reales desde Google Sheets
 */
export class IndicadoresService {
  private adapter: GoogleSheetsAdapter;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private CACHE_TTL = 5 * 60 * 1000; // 5 minutos

  constructor() {
    const apiKey = config.googleSheets.apiKey;
    this.adapter = new GoogleSheetsAdapter(apiKey || undefined);
    logger.info('✅ IndicadoresService inicializado');
  }

  /**
   * Parsea un número desde string, manejando formatos de moneda
   */
  private parseNumber(value: any): number {
    if (!value) return 0;
    if (typeof value === 'number') return value;
    
    const cleaned = value.toString()
      .replace(/[$,%\s]/g, '')
      .replace(/[^\d.-]/g, '');
    
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  }

  /**
   * Calcula la tendencia entre dos valores
   */
  private calcularTendencia(actual: number, anterior: number): 'up' | 'down' | 'stable' {
    const diferencia = actual - anterior;
    if (Math.abs(diferencia) < 0.01) return 'stable';
    return diferencia > 0 ? 'up' : 'down';
  }

  /**
   * Calcula el porcentaje de cambio
   */
  private calcularCambio(actual: number, anterior: number): number {
    if (anterior === 0) return actual > 0 ? 100 : 0;
    return ((actual - anterior) / anterior) * 100;
  }

  /**
   * Obtiene todos los indicadores desde Google Sheets
   */
  async obtenerIndicadores() {
    try {
      const cacheKey = 'all_indicadores';
      const cached = this.cache.get(cacheKey);
      
      if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
        logger.info('📦 Retornando indicadores desde caché');
        return cached.data;
      }

      logger.info('📊 Obteniendo indicadores desde Google Sheets...');
      
      const url = config.googleSheets.csvUrl;
      const rows = await this.adapter.getData(url);
      
      logger.info(`✅ Recibidas ${rows.length} filas`);

      // Calcular indicadores agregados desde los datos
      const indicadores: Indicador[] = [];

      // 1. Presupuesto Total 2024
      const presupuestoTotal2024 = rows.reduce((sum, row) => 
        sum + this.parseNumber(row['APROPIACION 2024']), 0
      );

      // 2. Presupuesto Total 2025
      const presupuestoTotal2025 = rows.reduce((sum, row) => 
        sum + this.parseNumber(row['APROPIACION DEFINITIVA 2025']), 0
      );

      // 3. Ejecución Total 2024
      const ejecucionTotal2024 = rows.reduce((sum, row) => 
        sum + this.parseNumber(row['COMPROMISOS 2024']), 0
      );

      // 4. Ejecución Total 2025
      const ejecucionTotal2025 = rows.reduce((sum, row) => 
        sum + this.parseNumber(row['COMPROMISOS 2025']), 0
      );

      // Crear indicadores
      indicadores.push({
        id: 'presupuesto-2024',
        nombre: 'Presupuesto Total 2024',
        valor: presupuestoTotal2024,
        unidad: 'COP',
        tipo: 'financiero',
        tendencia: this.calcularTendencia(presupuestoTotal2025, presupuestoTotal2024),
        cambio: this.calcularCambio(presupuestoTotal2025, presupuestoTotal2024),
        descripcion: 'Apropiación definitiva total para el año 2024'
      });

      indicadores.push({
        id: 'presupuesto-2025',
        nombre: 'Presupuesto Total 2025',
        valor: presupuestoTotal2025,
        unidad: 'COP',
        tipo: 'financiero',
        tendencia: this.calcularTendencia(presupuestoTotal2025, presupuestoTotal2024),
        cambio: this.calcularCambio(presupuestoTotal2025, presupuestoTotal2024),
        descripcion: 'Apropiación definitiva total para el año 2025'
      });

      const porcentajeEjecucion2024 = presupuestoTotal2024 > 0 
        ? (ejecucionTotal2024 / presupuestoTotal2024) * 100 
        : 0;

      const porcentajeEjecucion2025 = presupuestoTotal2025 > 0 
        ? (ejecucionTotal2025 / presupuestoTotal2025) * 100 
        : 0;

      indicadores.push({
        id: 'ejecucion-2024',
        nombre: 'Ejecución Presupuestal 2024',
        valor: porcentajeEjecucion2024,
        unidad: '%',
        tipo: 'ejecucion',
        tendencia: this.calcularTendencia(porcentajeEjecucion2024, 75), // Meta del 75%
        cambio: porcentajeEjecucion2024 - 75,
        descripcion: 'Porcentaje de ejecución del presupuesto 2024'
      });

      indicadores.push({
        id: 'ejecucion-2025',
        nombre: 'Ejecución Presupuestal 2025',
        valor: porcentajeEjecucion2025,
        unidad: '%',
        tipo: 'ejecucion',
        tendencia: this.calcularTendencia(porcentajeEjecucion2025, porcentajeEjecucion2024),
        cambio: this.calcularCambio(porcentajeEjecucion2025, porcentajeEjecucion2024),
        descripcion: 'Porcentaje de ejecución del presupuesto 2025'
      });

      // Número de metas
      const totalMetas = rows.filter(row => row['META DE PRODUCTO'] && row['META DE PRODUCTO'].trim() !== '').length;
      
      indicadores.push({
        id: 'total-metas',
        nombre: 'Total de Metas',
        valor: totalMetas,
        unidad: 'cantidad',
        tipo: 'gestion',
        tendencia: 'stable',
        cambio: 0,
        descripcion: 'Número total de metas de producto registradas'
      });

      const resultado = {
        indicadores,
        total: indicadores.length,
        timestamp: new Date().toISOString()
      };

      this.cache.set(cacheKey, { data: resultado, timestamp: Date.now() });
      
      logger.info(`✅ ${indicadores.length} indicadores calculados correctamente`);
      return resultado;
    } catch (error) {
      logger.error('❌ Error obteniendo indicadores:', error);
      throw new Error('Error al obtener indicadores');
    }
  }

  /**
   * Obtiene indicadores filtrados por tipo
   */
  async obtenerIndicadoresPorTipo(tipo: string) {
    const data = await this.obtenerIndicadores();
    return {
      indicadores: data.indicadores.filter((ind: Indicador) => ind.tipo === tipo),
      tipo,
      total: data.indicadores.filter((ind: Indicador) => ind.tipo === tipo).length
    };
  }

  /**
   * Limpia la caché
   */
  clearCache(): void {
    this.cache.clear();
    logger.info('🧹 Caché de indicadores limpiada');
  }
}

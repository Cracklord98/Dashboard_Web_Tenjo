import { GoogleSheetsAdapter } from '../adapters/googleSheetsAdapter.js';
import { config } from '../config/env.js';
import { logger } from '../config/logger.js';

interface SeguimientoData {
  id: string;
  meta: string;
  responsable: string;
  estado: 'completado' | 'en_progreso' | 'pendiente';
  avance: number;
  fechaInicio: string;
  fechaFin: string;
}

/**
 * Servicio para manejar la lógica de negocio de seguimiento
 * Conecta con Google Sheets usando CSV
 */
export class SeguimientoService {
  private adapter: GoogleSheetsAdapter;

  constructor() {
    this.adapter = new GoogleSheetsAdapter(); // Modo CSV por defecto
    logger.info('✅ SeguimientoService inicializado en modo CSV');
  }

  /**
   * Obtiene todos los datos de seguimiento
   */
  async obtenerSeguimiento() {
    try {
      const rows = await this.adapter.getData(config.googleSheets.csvUrl);
      
      const items: SeguimientoData[] = rows
        .filter(row => row['META DE PRODUCTO'] && row['META DE PRODUCTO'].trim() !== '')
        .map((row, index) => {
          const presupuestado = this.parseNumber(row['TOTAL PLANEADO 2024']);
          const ejecutado = this.parseNumber(row['TOTAL EJECUTADO 2024']);
          const avance = presupuestado > 0 ? Math.round((ejecutado / presupuestado) * 100) : 0;
          
          return {
            id: row['COD META PRODUCTO'] || `meta-${index + 1}`,
            meta: row['META DE PRODUCTO'] || '',
            responsable: row['RESPONSABLE'] || 'No asignado',
            estado: this.determinarEstado(avance),
            avance,
            fechaInicio: '2024-01-01',
            fechaFin: '2024-12-31'
          };
        });

      logger.info(`📊 ${items.length} items de seguimiento cargados`);
      
      return {
        items,
        total: items.length
      };
    } catch (error) {
      logger.error('❌ Error obteniendo seguimiento:', error);
      throw new Error('Error al obtener datos de seguimiento');
    }
  }

  /**
   * Obtiene un seguimiento específico por ID
   */
  async obtenerSeguimientoPorId(id: string) {
    const data = await this.obtenerSeguimiento();
    return data.items.find(item => item.id === id);
  }

  private parseNumber(value: any): number {
    if (!value) return 0;
    if (typeof value === 'number') return value;
    
    const cleaned = value.toString()
      .replace(/[$,%\s]/g, '')
      .replace(/[^\d.-]/g, '');
    
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  }

  private determinarEstado(avance: number): 'completado' | 'en_progreso' | 'pendiente' {
    if (avance >= 100) return 'completado';
    if (avance > 0) return 'en_progreso';
    return 'pendiente';
  }
}


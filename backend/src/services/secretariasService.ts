import { GoogleSheetsAdapter } from '../adapters/googleSheetsAdapter.js';
import { config } from '../config/env.js';
import { logger } from '../config/logger.js';

export interface Secretaria {
  responsable: string;
  totalMetas: number;
  metasProgramadas2025: number;
  apropiacionInicial2025: number;
  apropiacionDefinitiva2025: number;
  compromisos2025: number;
  pagos2025: number;
  metasProgramadas2026?: number;
  apropiacionInicial2026?: number;
  apropiacionDefinitiva2026?: number;
  compromisos2026?: number;
  pagos2026?: number;
  porcentajeEjecucion: number;
  porcentajeEjecucion2026?: number;
}

export class SecretariasService {
  private adapter: GoogleSheetsAdapter;
  private cache: Map<string, { data: Secretaria[]; timestamp: number }> = new Map();
  private CACHE_TTL = 5 * 60 * 1000; // 5 minutos

  constructor() {
    this.adapter = new GoogleSheetsAdapter();
  }

  async getSecretarias(): Promise<Secretaria[]> {
    try {
      const cacheKey = 'secretarias_data';
      const cached = this.cache.get(cacheKey);
      
      if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
        return cached.data;
      }

      const url = config.googleSheets.secretariasUrl;
      logger.info(`🔄 Obteniendo datos de secretarías desde: ${url}`);
      const rows = await this.adapter.getData(url);
      logger.info(`✅ Datos obtenidos: ${rows.length} filas`);

      const secretarias: Secretaria[] = rows
        .filter(row => row['RESPONSABLE'] && row['RESPONSABLE'].trim() !== '')
        .map(row => {
          try {
            const apropiacionDefinitiva = this.parseNumber(row['APROPIACION DEFINITIVA 2025']);
            const compromisos = this.parseNumber(row['COMPROMISOS 2025']);
            
            // Intentar obtener el porcentaje desde la hoja
            let porcentajeEjecucion = this.parseNumber(row['% EJECUCIÓN PPTO OCT 27-2025']);
            
            // Si el porcentaje es 0 o no existe, calcularlo manualmente
            if (porcentajeEjecucion === 0 && apropiacionDefinitiva > 0) {
              porcentajeEjecucion = (compromisos / apropiacionDefinitiva) * 100;
            }
            
            // Datos 2026
            const apropiacionDefinitiva2026 = this.parseNumber(row['APROPIACION DEFINITIVA 2026']);
            const compromisos2026 = this.parseNumber(row['COMPROMISOS 2026']);
            let porcentajeEjecucion2026 = this.parseNumber(row['% EJECUCIÓN PPTO 2026']) || this.parseNumber(row['% EJECUCION 2026']);
            if (porcentajeEjecucion2026 === 0 && apropiacionDefinitiva2026 > 0) {
              porcentajeEjecucion2026 = (compromisos2026 / apropiacionDefinitiva2026) * 100;
            }
            
            return {
              responsable: row['RESPONSABLE'] || '',
              totalMetas: this.parseNumber(row['TOTAL METAS']),
              metasProgramadas2025: this.parseNumber(row['METAS PROGRAMADAS 2025']),
              apropiacionInicial2025: this.parseNumber(row['APROPIACION INICIAL 2025']),
              apropiacionDefinitiva2025: apropiacionDefinitiva,
              compromisos2025: compromisos,
              pagos2025: this.parseNumber(row['PAGOS 2025']),
              porcentajeEjecucion: porcentajeEjecucion,
              metasProgramadas2026: this.parseNumber(row['METAS PROGRAMADAS 2026']),
              apropiacionInicial2026: this.parseNumber(row['APROPIACION INICIAL 2026']),
              apropiacionDefinitiva2026: apropiacionDefinitiva2026,
              compromisos2026: compromisos2026,
              pagos2026: this.parseNumber(row['PAGOS 2026']),
              porcentajeEjecucion2026: porcentajeEjecucion2026,
            } as Secretaria;
          } catch (e) {
            logger.error('Error mapeando fila de secretaría:', e);
            return null;
          }
        })
        .filter((s): s is Secretaria => s !== null);

      this.cache.set(cacheKey, { data: secretarias, timestamp: Date.now() });
      return secretarias;
    } catch (error) {
      logger.error('Error en SecretariasService:', error);
      throw new Error('Error al obtener datos de secretarías');
    }
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
}

import { GoogleSheetsAdapter } from '../adapters/googleSheetsAdapter.js';
import { config } from '../config/env.js';
import { logger } from '../config/logger.js';

interface MetaProducto {
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
  // Estados programado/no programado
  estadoProgramado2024?: string;
  estadoProgramado2025?: string;
  // Porcentajes de avance
  porcentajeAvance2024?: number;
  porcentajeAvance2025?: number;
  porcentajeAvanceCuatrienio?: number;
  // URLs de soportes
  soportes2024?: string;
  soportes2025?: string;
  
  // Campos financieros 2024
  apropiacion2024?: number;
  compromisos2024?: number;
  pagos2024?: number;
  totalAsignado?: number;
  totalCompromisos?: number;
  ejecucionFinanciera2024?: number;
  
  // Campos financieros 2025
  apropiacionInicial2025?: number;
  apropiacionDefinitiva2025?: number;
  compromisos2025?: number;
  pagos2025?: number;
  ejecucion2025?: number;
  
  // Campos de planificación y ejecución física
  totalPlaneado2024?: number;
  totalEjecutado2024?: number;
  totalPlaneado2025?: number;
  totalEjecutado2025?: number;
  
  // Trimestres 2024
  t1Planeado2024?: number;
  t1Ejecutado2024?: number;
  t2Planeado2024?: number;
  t2Ejecutado2024?: number;
  t3Planeado2024?: number;
  t3Ejecutado2024?: number;
  t4Planeado2024?: number;
  t4Ejecutado2024?: number;
  
  // Trimestres 2025
  t1Planeado2025?: number;
  t1Ejecutado2025?: number;
  t2Planeado2025?: number;
  t2Ejecutado2025?: number;
  t3Planeado2025?: number;
  t3Ejecutado2025?: number;
  t4Planeado2025?: number;
  t4Ejecutado2025?: number;
  
  // Campos adicionales
  lineaBase?: string;
  indicador?: string;
  unidadMedida?: string;
  codigoMeta?: string;
  bpin?: string;
  observaciones?: string;
}

interface MetaDetalle extends MetaProducto {
  descripcion: string;
  objetivo: string;
  indicador: string;
  lineaBase: string;
  meta2024: string;
  meta2025: string;
  presupuesto2024: number;
  presupuesto2025: number;
  ejecutado2024: number;
  ejecutado2025: number;
  trimestres: {
    t1: { planificado: number; ejecutado: number };
    t2: { planificado: number; ejecutado: number };
    t3: { planificado: number; ejecutado: number };
    t4: { planificado: number; ejecutado: number };
  };
}

export class MetasProductoService {
  private adapter: GoogleSheetsAdapter;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private CACHE_TTL = 5 * 60 * 1000; // 5 minutos

  constructor() {
    // Inicializar adaptador (usará CSV si no hay API Key)
    const apiKey = config.googleSheets.apiKey;
    this.adapter = new GoogleSheetsAdapter(apiKey || undefined);
    
    if (apiKey) {
      logger.info('🔑 Modo API v4 activado - Se obtendrán URLs de soportes');
    } else {
      logger.info('📄 Modo CSV activado - Datos sin URLs de hipervínculos');
    }
  }

  /**
   * Mapea una fila de Google Sheets a un objeto MetaProducto
   */
  private mapToMetaProducto(row: Record<string, any>, index: number): MetaProducto {
    return {
      id: index + 1,
      meta: row['META DE PRODUCTO'] || '',
      ejePrograma: row['EJE'] || '',
      programa: row['PROGRAMA PDT'] || row['PROGRAMA MGA'] || '',
      subprograma: row['SUBPROGRAMA'] || '',
      metaResultado: row['META DE RESULTADO'] || '',
      proyecto: row['NOMBRE DEL PROYECTO'] || '',
      estadoEvaluacion: row['ESTADO PROGRAMADO-NO PROGRAMADO 2024'] || 'Pendiente',
      estado: this.calcularEstado(row),
      responsable: row['RESPONSABLE'] || 'No asignado',
      avance2024: this.calcularAvance(row, '2024'),
      avance2025: this.calcularAvance(row, '2025'),
      // Estados programado/no programado
      estadoProgramado2024: row['ESTADO PROGRAMADO-NO PROGRAMADO 2024'] || '',
      estadoProgramado2025: row['ESTADO PROGRAMADO-NO PROGRAMADO 2025'] || '',
      // Porcentajes de avance
      porcentajeAvance2024: this.parseNumber(row['% TOTAL AVANCE 2024']),
      porcentajeAvance2025: this.parseNumber(row['% TOTAL AVANCE 2025']),
      porcentajeAvanceCuatrienio: this.parseNumber(row['PORCENTAJE TOTAL PDM AVANCE CUATRIENIO']),
      // Extraer URLs de hipervínculos (solo disponible con API)
      soportes2024: row[' SOPORTES DE CUMPLIMIENTO 2024_URL'] || '',
      soportes2025: row[' SOPORTES DE CUMPLIMIENTO 2025_URL'] || '',
      
      // Campos financieros 2024
      apropiacion2024: this.parseNumber(row['APROPIACION 2024']),
      compromisos2024: this.parseNumber(row['COMPROMISOS 2024']),
      pagos2024: this.parseNumber(row['VALOR EJECUTADO']),
      totalAsignado: this.parseNumber(row['TOTAL ASIGNADO 2024']),
      totalCompromisos: this.parseNumber(row['TOTAL COMPROMISOS 2024']),
      ejecucionFinanciera2024: this.parseNumber(row['% EJECUCIÓN FINANCIERA 2024']),
      
      // Campos financieros 2025
      apropiacionInicial2025: this.parseNumber(row['APROPIACION INICIAL 2025']),
      apropiacionDefinitiva2025: this.parseNumber(row['APROPIACION DEFINITIVA 2025']),
      compromisos2025: this.parseNumber(row['COMPROMISOS 2025']),
      pagos2025: this.parseNumber(row['PAGOS 2025']),
      ejecucion2025: this.parseNumber(row['% EJECUCION 2025']),
      
      // Campos de planificación y ejecución física
      totalPlaneado2024: this.parseNumber(row['TOTAL PLANEADO 2024']),
      totalEjecutado2024: this.parseNumber(row['TOTAL EJECUTADO 2024']),
      totalPlaneado2025: this.parseNumber(row['TOTAL PLANEADO 2025']),
      totalEjecutado2025: this.parseNumber(row['TOTAL EJECUTADO 2025']),
      
      // Trimestres 2024
      t1Planeado2024: this.parseNumber(row['T1. PLANEADO 2024']),
      t1Ejecutado2024: this.parseNumber(row['T1. EJECUTADO 2024']),
      t2Planeado2024: this.parseNumber(row['T2. PLANEADO 2024']),
      t2Ejecutado2024: this.parseNumber(row['T2. EJECUTADO 2024']),
      t3Planeado2024: this.parseNumber(row['T3. PLANEADO 2024']),
      t3Ejecutado2024: this.parseNumber(row['T3. EJECUTADO 2024']),
      t4Planeado2024: this.parseNumber(row['T4. PLANEADO 2024']),
      t4Ejecutado2024: this.parseNumber(row['T.4 EJECUTADO 2024']),
      
      // Trimestres 2025
      t1Planeado2025: this.parseNumber(row['T1. PLANEADO 2025']),
      t1Ejecutado2025: this.parseNumber(row['T1. EJECUTADO 2025']),
      t2Planeado2025: this.parseNumber(row['T2. PLANEADO 2025']),
      t2Ejecutado2025: this.parseNumber(row['T2. EJECUTADO 2025']),
      t3Planeado2025: this.parseNumber(row['T3. PLANEADO 2025']),
      t3Ejecutado2025: this.parseNumber(row['T3. EJECUTADO 2025']),
      t4Planeado2025: this.parseNumber(row['T4. PLANEADO 2025']),
      t4Ejecutado2025: this.parseNumber(row['T.4 EJECUTADO 2025']),
      
      // Campos adicionales de detalle
      lineaBase: row['L.B'] || '',
      indicador: row['INDICADOR'] || '',
      unidadMedida: row['UNIDAD DE MEDIDA'] || '',
      codigoMeta: row['COD META PRODUCTO'] || row['Cod Meta de producto'] || '',
      bpin: row['BPIN'] || row['Bpin'] || row['bpin'] || row[' BPIN'] || row['BPIN '] || '',
      observaciones: row['OBSERVACIONES'] || '',
    };
  }

  /**
   * Calcula el avance basado en datos de ejecución
   */
  private calcularAvance(row: Record<string, any>, año: string): number {
    const ejecutadoKey = `TOTAL EJECUTADO ${año}`;
    const planificadoKey = `TOTAL PLANEADO ${año}`;
    
    const ejecutado = this.parseNumber(row[ejecutadoKey]);
    const planificado = this.parseNumber(row[planificadoKey]);
    
    if (planificado === 0) return 0;
    return Math.round((ejecutado / planificado) * 100);
  }

  /**
   * Determina el estado basado en el avance
   */
  private calcularEstado(row: Record<string, any>): string {
    const avance2024 = this.calcularAvance(row, '2024');
    const avance2025 = this.calcularAvance(row, '2025');
    const avancePromedio = (avance2024 + avance2025) / 2;
    
    if (avancePromedio >= 100) return 'Cumplido';
    if (avancePromedio >= 70) return 'En proceso';
    if (avancePromedio > 0) return 'Iniciado';
    return 'Pendiente';
  }

  /**
   * Parsea un número desde string, manejando formatos de moneda
   */
  private parseNumber(value: any): number {
    if (!value) return 0;
    if (typeof value === 'number') return value;
    
    let cleaned = value.toString().trim();
    
    // Remover símbolos de moneda, porcentajes y espacios
    cleaned = cleaned.replace(/[$\s%]/g, '');
    
    if (cleaned === '-' || cleaned === '') return 0;

    // Heurística para detectar formato de miles y decimales
    const lastDot = cleaned.lastIndexOf('.');
    const lastComma = cleaned.lastIndexOf(',');
    
    if (lastDot > -1 && lastComma > -1) {
      if (lastDot < lastComma) {
        // Formato europeo: 1.000,00 -> Remover puntos, reemplazar coma por punto
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
  }

  /**
   * Obtiene todas las metas de producto desde Google Sheets
   */
  async getAllMetas(): Promise<MetaProducto[]> {
    try {
      const cacheKey = 'all_metas';
      const cached = this.cache.get(cacheKey);
      
      if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
        logger.info('📦 Retornando metas desde caché');
        return cached.data;
      }
    

      logger.info('📊 Obteniendo metas de producto desde Google Sheets...');
      
      // Usar CSV público (modo actual)
      const url = config.googleSheets.csvUrl;
      
      logger.info(`🔗 URL completa: ${url}`);
      
      const rows = await this.adapter.getData(url);
      
      logger.info(`✅ Recibidas ${rows.length} filas del CSV`);
      
      if (rows.length > 0) {
        logger.info(`📋 Columnas disponibles: ${Object.keys(rows[0]).slice(0, 10).join(', ')}...`);
        logger.info(`📋 Total columnas: ${Object.keys(rows[0]).length}`);
        
        // Verificar columnas críticas
        const columnasCriticas = ['BPIN', 'COD META PRODUCTO', 'Cod Meta de producto'];
        columnasCriticas.forEach(col => {
          if (Object.keys(rows[0]).includes(col)) {
            logger.info(`✅ Columna "${col}" encontrada`);
          } else {
            logger.warn(`⚠️ Columna "${col}" NO encontrada`);
          }
        });
        
        // Mostrar valor de BPIN en primera fila como ejemplo
        if (rows[0]['BPIN'] !== undefined) {
          logger.info(`📍 Ejemplo BPIN primera fila: "${rows[0]['BPIN']}"`);
        }
      }
      
      const metas = rows
        .filter(row => row['META DE PRODUCTO'] && row['META DE PRODUCTO'].trim() !== '')
        .map((row, index) => this.mapToMetaProducto(row, index));
      
      this.cache.set(cacheKey, { data: metas, timestamp: Date.now() });
      
      logger.info(`✅ ${metas.length} metas obtenidas correctamente`);
      return metas;
    } catch (error) {
      logger.error('❌ Error obteniendo metas de producto:', error);
      throw new Error('Error al obtener metas de producto');
    }
  }

  /**
   * Obtiene una meta específica por ID
   */
  async getMetaById(id: number): Promise<MetaDetalle | null> {
    try {
      const metas = await this.getAllMetas();
      const meta = metas.find(m => m.id === id);
      
      if (!meta) {
        return null;
      }

      const url = config.googleSheets.csvUrl;
      const rows = await this.adapter.getData(url);
      const row = rows[id - 1];
      
      if (!row) {
        return null;
      }

      const metaDetalle: MetaDetalle = {
        ...meta,
        descripcion: row['META DE PRODUCTO'] || '',
        objetivo: row['META DE RESULTADO'] || '',
        indicador: row['INDICADOR'] || '',
        lineaBase: row['L.B'] || '',
        meta2024: row['VALOR ESPERADO 2024'] || '',
        meta2025: row['VALOR ESPERADO 2025'] || '',
        presupuesto2024: meta.apropiacion2024 ?? this.parseNumber(row['APROPIACION 2024']),
        presupuesto2025: meta.apropiacionDefinitiva2025 ?? this.parseNumber(row['APROPIACION DEFINITIVA 2025']),
        ejecutado2024: meta.totalEjecutado2024 ?? this.parseNumber(row['TOTAL EJECUTADO 2024']),
        ejecutado2025: meta.totalEjecutado2025 ?? this.parseNumber(row['TOTAL EJECUTADO 2025']),
        trimestres: {
          t1: {
            planificado: this.parseNumber(row['T1 PLANIFICADO'] || row['Q1 PLAN']),
            ejecutado: this.parseNumber(row['T1 EJECUTADO'] || row['Q1 REAL']),
          },
          t2: {
            planificado: this.parseNumber(row['T2 PLANIFICADO'] || row['Q2 PLAN']),
            ejecutado: this.parseNumber(row['T2 EJECUTADO'] || row['Q2 REAL']),
          },
          t3: {
            planificado: this.parseNumber(row['T3 PLANIFICADO'] || row['Q3 PLAN']),
            ejecutado: this.parseNumber(row['T3 EJECUTADO'] || row['Q3 REAL']),
          },
          t4: {
            planificado: this.parseNumber(row['T4 PLANIFICADO'] || row['Q4 PLAN']),
            ejecutado: this.parseNumber(row['T4 EJECUTADO'] || row['Q4 REAL']),
          },
        },
      };

      return metaDetalle;
    } catch (error) {
      logger.error(`❌ Error obteniendo meta ${id}:`, error);
      throw new Error(`Error al obtener detalle de meta ${id}`);
    }
  }

  /**
   * Filtra metas por eje de programa
   */
  async getMetasByEje(eje: string): Promise<MetaProducto[]> {
    const metas = await this.getAllMetas();
    return metas.filter(m => 
      m.ejePrograma.toLowerCase().includes(eje.toLowerCase())
    );
  }

  /**
   * Filtra metas por programa
   */
  async getMetasByPrograma(programa: string): Promise<MetaProducto[]> {
    const metas = await this.getAllMetas();
    return metas.filter(m => 
      m.programa.toLowerCase().includes(programa.toLowerCase())
    );
  }

  /**
   * Limpia la caché
   */
  clearCache(): void {
    this.cache.clear();
    logger.info('🧹 Caché limpiada');
  }
}

import { IndicadorDTO, SeguimientoDTO } from '../dto/index';

/**
 * Mapper para convertir datos raw a DTOs de Indicadores
 */
export class IndicadorMapper {
  
  /**
   * Convierte array de Google Sheets a IndicadorDTO
   */
  static fromSheetRow(row: any[]): IndicadorDTO {
    return {
      id: row[0]?.toString() || '',
      nombre: row[1]?.toString() || '',
      valor: parseFloat(row[2]) || 0,
      unidad: row[3]?.toString() || '',
      tipo: row[4]?.toString() || '',
      tendencia: this.parseTendencia(row[5]),
      cambio: parseFloat(row[6]) || 0,
      fecha: row[7]?.toString()
    };
  }

  /**
   * Convierte resultado de BD a IndicadorDTO
   */
  static fromDatabase(dbRow: any): IndicadorDTO {
    return {
      id: dbRow.id,
      nombre: dbRow.nombre,
      valor: dbRow.valor,
      unidad: dbRow.unidad,
      tipo: dbRow.tipo,
      tendencia: dbRow.tendencia,
      cambio: dbRow.cambio,
      fecha: dbRow.fecha
    };
  }

  private static parseTendencia(value: any): 'up' | 'down' | 'neutral' {
    const str = value?.toString().toLowerCase();
    if (str === 'up' || str === 'arriba') return 'up';
    if (str === 'down' || str === 'abajo') return 'down';
    return 'neutral';
  }
}

/**
 * Mapper para Seguimiento
 */
export class SeguimientoMapper {
  
  static fromSheetRow(row: any[]): SeguimientoDTO {
    return {
      id: row[0]?.toString() || '',
      nombre: row[1]?.toString() || '',
      estado: this.parseEstado(row[2]),
      progreso: parseFloat(row[3]) || 0,
      fechaInicio: row[4]?.toString() || '',
      fechaFin: row[5]?.toString() || '',
      responsable: row[6]?.toString(),
      descripcion: row[7]?.toString()
    };
  }

  static fromDatabase(dbRow: any): SeguimientoDTO {
    return {
      id: dbRow.id,
      nombre: dbRow.nombre,
      estado: dbRow.estado,
      progreso: dbRow.progreso,
      fechaInicio: dbRow.fecha_inicio,
      fechaFin: dbRow.fecha_fin,
      responsable: dbRow.responsable,
      descripcion: dbRow.descripcion
    };
  }

  private static parseEstado(value: any): SeguimientoDTO['estado'] {
    const str = value?.toString().toLowerCase();
    if (str === 'en_progreso' || str === 'en progreso') return 'en_progreso';
    if (str === 'completado') return 'completado';
    if (str === 'cancelado') return 'cancelado';
    return 'pendiente';
  }
}

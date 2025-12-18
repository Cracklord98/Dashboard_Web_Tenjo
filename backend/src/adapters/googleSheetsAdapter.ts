import Papa from 'papaparse';

/**
 * Adapter para conectar con Google Sheets públicas
 * Lee datos desde hojas de Google Sheets públicas en formato CSV usando PapaParse
 */

interface ParsedData {
  headers: string[];
  rows: Record<string, any>[];
  rawData: string[][];
}

export class GoogleSheetsAdapter {
  /**
   * Obtiene datos desde una URL de Google Sheets en formato CSV
   */
  async fetchSheetData(url: string): Promise<ParsedData> {
    try {
      console.log('🔄 Obteniendo datos de Google Sheets...');
      console.log('📍 URL:', url);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Error fetching Google Sheet: ${response.statusText}`);
      }

      const csvText = await response.text();
      console.log('📊 CSV recibido, primeros 500 caracteres:', csvText.substring(0, 500));
      
      return this.parseCSV(csvText);
    } catch (error) {
      console.error('❌ Error en GoogleSheetsAdapter:', error);
      throw new Error(`No se pudo obtener datos de Google Sheets: ${error}`);
    }
  }

  /**
   * Parsea texto CSV usando PapaParse
   */
  private parseCSV(csvText: string): ParsedData {
    const parseResult = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false, // Mantenemos todo como string para procesarlo después
      transformHeader: (header: string) => header.trim(),
    });

    if (parseResult.errors.length > 0) {
      console.warn('⚠️ Advertencias al parsear CSV:', parseResult.errors.slice(0, 5));
    }

    const rows = parseResult.data as Record<string, any>[];
    const headers = parseResult.meta.fields || [];

    console.log('✅ Datos parseados correctamente');
    console.log(`📈 Total de filas: ${rows.length}`);
    console.log(`📋 Total de columnas: ${headers.length}`);
    console.log('🔤 Primeras 10 columnas:', headers.slice(0, 10));
    console.log('\n🔍 Primeras 3 filas de ejemplo:');
    rows.slice(0, 3).forEach((row, idx) => {
      console.log(`\n  Fila ${idx}:`, {
        'EJE': row['EJE DEL PROGRAMA'],
        'PROGRAMA': row['PROGRAMA'],
        'SUBPROGRAMA': row['SUBPROGRAMA'],
        'META': row['META RESULTADO'],
        'PROYECTO': row['POR PROYECTO'],
        'APROB_DEF_2025': row['APROPIACION DEFINITIVA 2025']
      });
    });

    // Convertir también a formato raw para compatibilidad
    const rawData: string[][] = [headers];
    rows.forEach(row => {
      const rowArray = headers.map(header => row[header]?.toString() || '');
      rawData.push(rowArray);
    });

    return { headers, rows, rawData };
  }

  /**
   * Obtiene datos y los devuelve como array de objetos
   */
  async getData(url: string): Promise<Record<string, any>[]> {
    const parsed = await this.fetchSheetData(url);
    return parsed.rows;
  }

  /**
   * Obtiene datos crudos como array bidimensional
   */
  async getRawData(url: string): Promise<string[][]> {
    const parsed = await this.fetchSheetData(url);
    return parsed.rawData;
  }

  /**
   * Convierte un valor a número, manejando formatos de moneda y porcentajes
   */
  parseNumber(value: any): number {
    if (value === null || value === undefined || value === '') {
      return 0;
    }

    if (typeof value === 'number') {
      return value;
    }

    // Remover símbolos de moneda, comas, porcentajes y espacios
    const cleaned = value
      .toString()
      .replace(/[$,%\s]/g, '')
      .replace(/[^\d.-]/g, '');

    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  }
}

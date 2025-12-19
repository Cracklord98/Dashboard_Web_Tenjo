import Papa from 'papaparse';
import { google } from 'googleapis';

/**
 * Adapter para conectar con Google Sheets
 * Usa Google Sheets API v4 para obtener datos completos incluyendo URLs de hipervínculos
 */

interface ParsedData {
  headers: string[];
  rows: Record<string, any>[];
  rawData: string[][];
}

interface SheetConfig {
  spreadsheetId: string;
  sheetName: string;
  range?: string;
}

export class GoogleSheetsAdapter {
  private sheets;
  private useAPI: boolean;

  constructor(apiKey?: string) {
    this.useAPI = !!apiKey;
    
    // Solo inicializar API si hay API Key configurada
    if (this.useAPI && apiKey) {
      this.sheets = google.sheets({
        version: 'v4',
        auth: apiKey
      });
      console.log('✅ Google Sheets API v4 inicializada (con URLs de hipervínculos)');
    } else {
      console.log('📄 Modo CSV activado (sin URLs de hipervínculos - usar API Key para activar)');
    }
  }

  /**
   * Extrae ID de spreadsheet y nombre de hoja desde una URL de Google Sheets
   */
  private parseSheetUrl(url: string): SheetConfig {
    // Formato: https://docs.google.com/spreadsheets/d/{ID}/edit#gid={SHEET_ID}
    const idMatch = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
    const gidMatch = url.match(/[#&]gid=([0-9]+)/);
    
    if (!idMatch) {
      throw new Error('No se pudo extraer el ID del spreadsheet de la URL');
    }

    return {
      spreadsheetId: idMatch[1],
      sheetName: gidMatch ? `Sheet${gidMatch[1]}` : 'Sheet1' // Fallback al nombre por defecto
    };
  }

  /**
   * Obtiene datos usando Google Sheets API v4 (incluye URLs de hipervínculos)
   */
  async fetchSheetDataWithAPI(spreadsheetId: string, range: string): Promise<ParsedData> {
    try {
      console.log('🔄 Obteniendo datos de Google Sheets API v4...');
      console.log('📍 Spreadsheet ID:', spreadsheetId);
      console.log('📍 Range:', range);

      // Obtener valores
      const response = await this.sheets!.spreadsheets.values.get({
        spreadsheetId,
        range,
      });

      const values = response.data.values || [];
      if (values.length === 0) {
        throw new Error('No se encontraron datos en la hoja');
      }

      // Obtener metadatos de celdas (para URLs)
      const metadataResponse = await this.sheets!.spreadsheets.get({
        spreadsheetId,
        ranges: [range],
        includeGridData: true,
      });

      const gridData = metadataResponse.data.sheets?.[0]?.data?.[0];
      const headers = values[0].map((h: string) => h?.trim() || '');
      const rows: Record<string, any>[] = [];

      // Procesar cada fila
      for (let i = 1; i < values.length; i++) {
        const row: Record<string, any> = {};
        const rowData = values[i];
        const rowMetadata = gridData?.rowData?.[i];

        headers.forEach((header: string, colIndex: number) => {
          const cellValue = rowData[colIndex] || '';
          const cellMetadata = rowMetadata?.values?.[colIndex];
          
          // Extraer URL de hipervínculo si existe
          const hyperlink = cellMetadata?.hyperlink;
          
          row[header] = cellValue;
          
          // Si hay hipervínculo, agregarlo como campo adicional
          if (hyperlink) {
            row[`${header}_URL`] = hyperlink;
          }
        });

        rows.push(row);
      }

      console.log('✅ Datos obtenidos con Google Sheets API');
      console.log(`📈 Total de filas: ${rows.length}`);
      console.log(`📋 Total de columnas: ${headers.length}`);

      return {
        headers,
        rows,
        rawData: values as string[][]
      };
    } catch (error: any) {
      console.error('❌ Error en Google Sheets API:', error);
      throw new Error(`Error al obtener datos: ${error.message}`);
    }
  }

  /**
   * Obtiene datos desde una URL de Google Sheets en formato CSV (fallback)
   */
  async fetchSheetData(url: string): Promise<ParsedData> {
    try {
      console.log('🔄 Obteniendo datos de Google Sheets CSV...');
      console.log('📍 URL:', url);
      
      const response = await fetch(url, {
        redirect: 'follow',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      console.log('📡 Response status:', response.status);
      console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        throw new Error(`Error fetching Google Sheet: ${response.status} ${response.statusText}`);
      }

      const csvText = await response.text();
      console.log('📊 CSV recibido, tamaño:', csvText.length, 'caracteres');
      console.log('📊 Primeros 200 caracteres:', csvText.substring(0, 200));
      
      if (csvText.includes('<HTML>') || csvText.includes('<!DOCTYPE')) {
        throw new Error('Recibido HTML en lugar de CSV - verificar URL de publicación');
      }
      
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
   * Usa API si está configurada, sino usa CSV
   */
  async getData(urlOrId: string, sheetName?: string): Promise<Record<string, any>[]> {
    if (this.useAPI && this.sheets) {
      // Modo API: Obtiene URLs de hipervínculos
      const config = this.parseSheetUrl(urlOrId);
      const range = sheetName || config.sheetName;
      const parsed = await this.fetchSheetDataWithAPI(config.spreadsheetId, range);
      return parsed.rows;
    } else {
      // Modo CSV: Más rápido pero sin URLs
      const parsed = await this.fetchSheetData(urlOrId);
      return parsed.rows;
    }
  }

  /**
   * Obtiene datos crudos como array bidimensional
   */
  async getRawData(urlOrId: string, sheetName?: string): Promise<string[][]> {
    if (this.useAPI && this.sheets) {
      const config = this.parseSheetUrl(urlOrId);
      const range = sheetName || config.sheetName;
      const parsed = await this.fetchSheetDataWithAPI(config.spreadsheetId, range);
      return parsed.rawData;
    } else {
      const parsed = await this.fetchSheetData(urlOrId);
      return parsed.rawData;
    }
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

import { Router, Request, Response } from 'express';
import { logger } from '../config/logger.js';
import { GoogleSheetsAdapter } from '../adapters/googleSheetsAdapter.js';
import { config } from '../config/env.js';

const router = Router();
const adapter = new GoogleSheetsAdapter(); // Sin API Key = modo CSV

interface FinancieroData {
  programa: string;
  presupuestado: number;
  ejecutado: number;
  porcentaje: number;
}

// Endpoint para obtener datos financieros/ejecución presupuestal
router.get('/', async (_req: Request, res: Response) => {
  try {
    logger.info('📊 Obteniendo datos de ejecución presupuestal...');

    const url = config.googleSheets.financieroUrl || config.googleSheets.csvUrl;
    const rows = await adapter.getData(url);
    
    // Mapear datos reales de Google Sheets
    const datosPresupuesto: FinancieroData[] = rows
      .filter(row => row['PROGRAMA PDT'] && row['PROGRAMA PDT'].trim() !== '')
      .map(row => ({
        programa: row['PROGRAMA PDT'] || '',
        presupuestado: parseNumber(row['APROPIACION 2024']),
        ejecutado: parseNumber(row['COMPROMISOS 2024']),
        porcentaje: calcularPorcentaje(
          parseNumber(row['COMPROMISOS 2024']),
          parseNumber(row['APROPIACION 2024'])
        )
      }));

    res.json({
      status: 'success',
      data: datosPresupuesto,
      timestamp: new Date().toISOString(),
      count: datosPresupuesto.length
    });
  } catch (error) {
    logger.error('Error obteniendo datos financieros:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error al obtener datos financieros'
    });
  }
});

// Endpoint para obtener datos por programa específico
router.get('/:programa', async (req: Request, res: Response) => {
  try {
    const { programa } = req.params;
    logger.info(`📊 Obteniendo datos financieros del programa: ${programa}`);

    const url = config.googleSheets.financieroUrl || config.googleSheets.csvUrl;
    const rows = await adapter.getData(url);
    
    const row = rows.find(r => 
      r['PROGRAMA PDT']?.toLowerCase().includes(programa.toLowerCase())
    );
    
    if (!row) {
      return res.status(404).json({
        status: 'error',
        message: 'Programa no encontrado'
      });
    }

    res.json({
      status: 'success',
      data: {
        programa: row['PROGRAMA PDT'],
        presupuestado: parseNumber(row['APROPIACION 2024']),
        ejecutado: parseNumber(row['COMPROMISOS 2024']),
        porcentaje: calcularPorcentaje(
          parseNumber(row['COMPROMISOS 2024']),
          parseNumber(row['APROPIACION 2024'])
        )
      }
    });
  } catch (error) {
    logger.error('Error obteniendo datos del programa:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error al obtener datos del programa'
    });
  }
});

// Funciones auxiliares
function parseNumber(value: any): number {
  if (!value) return 0;
  if (typeof value === 'number') return value;
  
  const cleaned = value.toString()
    .replace(/[$,%\s]/g, '')
    .replace(/[^\d.-]/g, '');
  
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

function calcularPorcentaje(ejecutado: number, presupuestado: number): number {
  if (presupuestado === 0) return 0;
  return Math.round((ejecutado / presupuestado) * 100);
}

export default router;

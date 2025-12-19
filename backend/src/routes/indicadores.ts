import { Router, Request, Response } from 'express';
import { IndicadoresService } from '../services/indicadoresService.js';

const router = Router();
const indicadoresService = new IndicadoresService();

/**
 * GET /api/indicadores
 * Obtiene todos los indicadores
 */
router.get('/', async (_req: Request, res: Response) => {
  try {
    const data = await indicadoresService.obtenerIndicadores();
    res.json({
      status: 'success',
      data
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Error al obtener indicadores'
    });
  }
});

/**
 * GET /api/indicadores/:tipo
 * Obtiene indicadores por tipo
 */
router.get('/:tipo', async (req: Request, res: Response) => {
  try {
    const { tipo } = req.params;
    const data = await indicadoresService.obtenerIndicadoresPorTipo(tipo);
    
    res.json({
      status: 'success',
      data
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Error al obtener indicadores'
    });
  }
});

export default router;

import { Router, Request, Response } from 'express';
import { SeguimientoService } from '../services/seguimientoService.js';

const router = Router();
const seguimientoService = new SeguimientoService();

/**
 * GET /api/seguimiento
 * Obtiene datos de seguimiento
 */
router.get('/', async (_req: Request, res: Response) => {
  try {
    const data = await seguimientoService.obtenerSeguimiento();
    res.json({
      status: 'success',
      data
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Error al obtener seguimiento'
    });
  }
});

/**
 * GET /api/seguimiento/:id
 * Obtiene un seguimiento específico por ID
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = await seguimientoService.obtenerSeguimientoPorId(id);
    
    if (!data) {
      return res.status(404).json({
        status: 'error',
        message: 'Seguimiento no encontrado'
      });
    }
    
    res.json({
      status: 'success',
      data
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Error al obtener seguimiento'
    });
  }
});

export default router;

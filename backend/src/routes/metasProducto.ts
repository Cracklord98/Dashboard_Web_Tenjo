import { Router, Request, Response } from 'express';
import { logger } from '../config/logger.js';
import { MetasProductoService } from '../services/metasProductoService.js';

const router = Router();
const metasService = new MetasProductoService();

// Obtener todas las metas
router.get('/', async (_req: Request, res: Response) => {
  try {
    logger.info('📊 Obteniendo metas de producto...');

    const metas = await metasService.getAllMetas();

    res.json({
      status: 'success',
      data: metas,
      timestamp: new Date().toISOString(),
      count: metas.length
    });
  } catch (error) {
    logger.error('Error obteniendo metas de producto:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error al obtener metas de producto'
    });
  }
});

// Obtener meta por ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    logger.info(`📊 Obteniendo detalle de meta: ${id}`);

    const meta = await metasService.getMetaById(Number(id));
    
    if (!meta) {
      return res.status(404).json({
        status: 'error',
        message: 'Meta no encontrada'
      });
    }

    res.json({
      status: 'success',
      data: meta,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error obteniendo detalle de meta:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error al obtener detalle de meta'
    });
  }
});

// Obtener metas por eje de programa
router.get('/eje/:eje', async (req: Request, res: Response) => {
  try {
    const { eje } = req.params;
    logger.info(`📊 Obteniendo metas del eje: ${eje}`);

    const metas = await metasService.getMetasByEje(eje);

    res.json({
      status: 'success',
      data: metas,
      timestamp: new Date().toISOString(),
      count: metas.length
    });
  } catch (error) {
    logger.error('Error obteniendo metas por eje:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error al obtener metas por eje'
    });
  }
});

// Obtener metas por programa
router.get('/programa/:programa', async (req: Request, res: Response) => {
  try {
    const { programa } = req.params;
    logger.info(`📊 Obteniendo metas del programa: ${programa}`);

    const metas = await metasService.getMetasByPrograma(programa);

    res.json({
      status: 'success',
      data: metas,
      timestamp: new Date().toISOString(),
      count: metas.length
    });
  } catch (error) {
    logger.error('Error obteniendo metas por programa:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error al obtener metas por programa'
    });
  }
});

// Limpiar caché
router.post('/cache/clear', async (_req: Request, res: Response) => {
  try {
    metasService.clearCache();
    res.json({
      status: 'success',
      message: 'Caché limpiada correctamente'
    });
  } catch (error) {
    logger.error('Error limpiando caché:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error al limpiar caché'
    });
  }
});

export default router;

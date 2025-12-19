import { Router, Request, Response } from 'express';
import { SecretariasService } from '../services/secretariasService.js';
import { logger } from '../config/logger.js';

const router = Router();
const secretariasService = new SecretariasService();

router.get('/', async (_req: Request, res: Response) => {
  try {
    const data = await secretariasService.getSecretarias();
    res.json({
      status: 'success',
      data
    });
  } catch (error) {
    logger.error('Error en ruta secretarias:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error al obtener datos de secretarías'
    });
  }
});

export default router;

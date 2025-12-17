import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from './config/env';
import { errorHandler } from './config/errorHandler';
import seguimientoRoutes from './routes/seguimiento';
import indicadoresRoutes from './routes/indicadores';

const app = express();

// Middlewares de seguridad
app.use(helmet());
app.use(cors({
  origin: config.corsOrigin,
  credentials: true
}));

// Logging de requests para debugging
app.use((req, _res, next) => {
  logger.info(`📨 ${req.method} ${req.url}`);
  next();
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // límite de requests por ventana
});
app.use(limiter);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (_req: express.Request, res: express.Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Root route
app.get('/', (_req: express.Request, res: express.Response) => {
  res.json({ 
    message: 'Backend API is running 🚀',
    endpoints: {
      health: '/health',
      indicadores: '/api/indicadores',
      seguimiento: '/api/seguimiento'
    }
  });
});

// Rutas de la API
app.use('/api/seguimiento', seguimientoRoutes);
app.use('/api/indicadores', indicadoresRoutes);

// Manejo de errores
app.use(errorHandler);

// Logger
import { logger } from './config/logger';

// Iniciar servidor
const PORT = config.port;
app.listen(PORT, () => {
  logger.info(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  logger.info(`📊 Ambiente: ${config.nodeEnv}`);
});

export default app;

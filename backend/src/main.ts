import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from './config/env.js';
import { logger } from './config/logger.js';
import { errorHandler } from './config/errorHandler.js';
import seguimientoRoutes from './routes/seguimiento.js';
import indicadoresRoutes from './routes/indicadores.js';
import financieroRoutes from './routes/financiero.js';
import metasProductoRoutes from './routes/metasProducto.js';
import secretariasRoutes from './routes/secretarias.js';

const app = express();

// Middlewares de seguridad
app.use(helmet());

// Configuración de CORS robusta
const allowedOrigins = [
  'http://localhost:5173',
  'https://dashboard-web-tenjo-frontend.vercel.app'
];

app.use(cors({
  origin: (origin, callback) => {
    // Permitir peticiones sin origen (como Postman o herramientas de servidor)
    if (!origin) return callback(null, true);
    
    // Limpiar el origen de barras finales para la comparación
    const cleanOrigin = origin.replace(/\/$/, '');
    
    if (allowedOrigins.includes(cleanOrigin) || cleanOrigin === config.corsOrigin || config.nodeEnv === 'development') {
      callback(null, true);
    } else {
      logger.warn(`🚫 Origen bloqueado por CORS: ${origin}`);
      callback(new Error('No permitido por CORS'));
    }
  },
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
      seguimiento: '/api/seguimiento',
      financiero: '/api/financiero',
      metasProducto: '/api/metas-producto'
    }
  });
});

// Rutas de la API
app.use('/api/seguimiento', seguimientoRoutes);
app.use('/api/indicadores', indicadoresRoutes);
app.use('/api/financiero', financieroRoutes);
app.use('/api/metas-producto', metasProductoRoutes);
app.use('/api/secretarias', secretariasRoutes);

// Manejo de errores
app.use(errorHandler);

// Iniciar servidor
const PORT = config.port;
app.listen(PORT, () => {
  logger.info(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  logger.info(`📊 Ambiente: ${config.nodeEnv}`);
});

export default app;

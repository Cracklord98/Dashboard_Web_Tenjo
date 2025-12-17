import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  
  // Agregar aquí otras variables de entorno según necesites
  // googleSheets: {
  //   id: process.env.GOOGLE_SHEETS_ID,
  //   apiKey: process.env.GOOGLE_API_KEY,
  // },
  
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
};

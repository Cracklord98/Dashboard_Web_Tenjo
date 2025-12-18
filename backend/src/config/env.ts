import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  
  // Google Sheets URLs
  googleSheets: {
    financieroUrl: process.env.GOOGLE_SHEET_FINANCIERO_URL || '',
    metasProductoUrl: process.env.GOOGLE_SHEET_METAS_PRODUCTO_URL || '',
  },
  
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
};

import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: (process.env.CORS_ORIGIN || 'http://localhost:5173').replace(/\/$/, ''),
  
  // Google Sheets Configuration
  googleSheets: {
    // API v4 (STANDBY - Para obtener URLs de hipervínculos en el futuro)
    apiKey: process.env.GOOGLE_SHEETS_API_KEY || '',
    spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID || '131I6QiWvzj929LBQo_OgRs1qKC1g9RHuOMOPvcSnCyM',
    sheetName: process.env.GOOGLE_SHEET_NAME || 'FICHA PRODUCTO 2024-2025',
    
    // CSV (ACTIVO - Modo actual)
    csvUrl: process.env.GOOGLE_SHEET_CSV_URL || 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTMfCRuywb0fDRC6h5z8iEoAIJJfRGzFa92MXMzrJDYrrBHV6f6ehTrIqFKrqnNiWJE78ywRwKZ_z0D/pub?output=csv',
    financieroUrl: process.env.GOOGLE_SHEET_FINANCIERO_URL || 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTMfCRuywb0fDRC6h5z8iEoAIJJfRGzFa92MXMzrJDYrrBHV6f6ehTrIqFKrqnNiWJE78ywRwKZ_z0D/pub?gid=815695373&single=true&output=csv',
    secretariasUrl: process.env.GOOGLE_SHEET_SECRETARIAS_URL || 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTMfCRuywb0fDRC6h5z8iEoAIJJfRGzFa92MXMzrJDYrrBHV6f6ehTrIqFKrqnNiWJE78ywRwKZ_z0D/pub?gid=2137949871&single=true&output=csv',
  },
  
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
};

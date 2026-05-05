const fs = require('fs');
const https = require('https');
const csv = require('csv-parser');

const url = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTMfCRuywb0fDRC6h5z8iEoAIJJfRGzFa92MXMzrJDYrrBHV6f6ehTrIqFKrqnNiWJE78ywRwKZ_z0D/pub?output=csv';

https.get(url, (res) => {
  if (res.statusCode === 307 || res.statusCode === 302) {
    https.get(res.headers.location, (res2) => {
      res2.pipe(csv())
        .on('data', (data) => {
          if (data['RESPONSABLE'] && data['RESPONSABLE'].toLowerCase().includes('mujer')) {
             console.log('--- Mujer Meta ---');
             console.log('META:', data['META DE PRODUCTO']?.substring(0, 30));
             console.log('TOTAL PLANEADO 2026:', data['TOTAL PLANEADO 2026']);
             console.log('TOTAL EJECUTADO 2026:', data['TOTAL EJECUTADO 2026']);
             console.log('% TOTAL AVANCE 2026:', data['% TOTAL AVANCE 2026']);
             console.log('% AVANCE 2026:', data['% AVANCE 2026']);
             console.log('Raw keys matching 2026:', Object.keys(data).filter(k => k.includes('2026')).map(k => `${k}=${data[k]}`));
          }
        })
        .on('end', () => console.log('Done'));
    });
  } else {
    res.pipe(csv())
        .on('data', (data) => {
          if (data['RESPONSABLE'] && data['RESPONSABLE'].toLowerCase().includes('mujer')) {
             console.log('--- Mujer Meta ---');
             console.log('META:', data['META DE PRODUCTO']?.substring(0, 30));
             console.log('TOTAL PLANEADO 2026:', data['TOTAL PLANEADO 2026']);
             console.log('TOTAL EJECUTADO 2026:', data['TOTAL EJECUTADO 2026']);
             console.log('% TOTAL AVANCE 2026:', data['% TOTAL AVANCE 2026']);
             console.log('% AVANCE 2026:', data['% AVANCE 2026']);
             console.log('Raw keys matching 2026:', Object.keys(data).filter(k => k.includes('2026')).map(k => `${k}=${data[k]}`));
          }
        });
  }
});

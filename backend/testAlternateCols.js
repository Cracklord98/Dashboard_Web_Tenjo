import Papa from 'papaparse';

const url = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTMfCRuywb0fDRC6h5z8iEoAIJJfRGzFa92MXMzrJDYrrBHV6f6ehTrIqFKrqnNiWJE78ywRwKZ_z0D/pub?output=csv';

async function run() {
  const res = await fetch(url);
  const csvText = await res.text();
  const parseResult = Papa.parse(csvText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim(),
  });

  const rows = parseResult.data;
  
  const searchTerms = [
    'Estructurar y poner en marcha',
    'Actualizar e implementar la Po',
    'Realizar un programa de taller',
    'Ejecutar un sistema de educaci'
  ];
  
  searchTerms.forEach(term => {
    const r = rows.find(row => row['META DE PRODUCTO'] && row['META DE PRODUCTO'].includes(term));
    if (r) {
      console.log(`\n--- Meta: ${term} ---`);
      console.log('VALOR ESPERADO 2026:', r['VALOR ESPERADO 2026']);
      console.log('VALOR EJECUTADO 2026:', r['VALOR EJECUTADO 2026']);
      console.log('% AVANCE 2026:', r['% AVANCE 2026']);
      console.log('TOTAL PLANEADO 2026:', r['TOTAL PLANEADO 2026']);
      console.log('TOTAL EJECUTADO 2026:', r['TOTAL EJECUTADO 2026']);
    }
  });
}
run();

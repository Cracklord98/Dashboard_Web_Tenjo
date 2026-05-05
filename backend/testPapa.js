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
  
  const desarrRows = rows.filter(r => r['RESPONSABLE'] && r['RESPONSABLE'].toLowerCase().includes('desarrollo'));
  
  console.log(`Found ${desarrRows.length} rows for desarrollo`);
  
  desarrRows.slice(0, 5).forEach((data, index) => {
    console.log(`\n--- Meta ${index + 1} ---`);
    console.log('META:', data['META DE PRODUCTO']?.substring(0, 30));
    console.log('TOTAL PLANEADO 2026:', data['TOTAL PLANEADO 2026']);
    console.log('TOTAL EJECUTADO 2026:', data['TOTAL EJECUTADO 2026']);
    console.log('% TOTAL AVANCE 2026:', data['% TOTAL AVANCE 2026']);
    console.log('% AVANCE 2026:', data['% AVANCE 2026']);
    console.log('ESTADO PROGRAMADO 2026:', data['ESTADO PROGRAMADO-NO PROGRAMADO 2026']);
  });
}
run();

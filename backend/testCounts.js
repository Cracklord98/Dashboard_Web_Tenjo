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
  
  let emptyPlaneado = 0;
  let emptyEjecutado = 0;
  let emptyAvance = 0;
  let emptyTotalAvance = 0;
  
  rows.forEach(r => {
    if (!r['TOTAL PLANEADO 2026'] || r['TOTAL PLANEADO 2026'] === '0.00' || r['TOTAL PLANEADO 2026'] === '0') emptyPlaneado++;
    if (!r['TOTAL EJECUTADO 2026'] || r['TOTAL EJECUTADO 2026'] === '0.00' || r['TOTAL EJECUTADO 2026'] === '0') emptyEjecutado++;
    if (!r['% AVANCE 2026'] || r['% AVANCE 2026'] === '0.00' || r['% AVANCE 2026'] === '0' || r['% AVANCE 2026'] === '0%') emptyAvance++;
    if (!r['% TOTAL AVANCE 2026'] || r['% TOTAL AVANCE 2026'] === '0.00' || r['% TOTAL AVANCE 2026'] === '0' || r['% TOTAL AVANCE 2026'] === '0%') emptyTotalAvance++;
  });
  
  console.log(`Total rows: ${rows.length}`);
  console.log(`Empty/Zero TOTAL PLANEADO 2026: ${emptyPlaneado}`);
  console.log(`Empty/Zero TOTAL EJECUTADO 2026: ${emptyEjecutado}`);
  console.log(`Empty/Zero % AVANCE 2026: ${emptyAvance}`);
  console.log(`Empty/Zero % TOTAL AVANCE 2026: ${emptyTotalAvance}`);
}
run();
